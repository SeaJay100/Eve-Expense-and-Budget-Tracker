import express from 'express'
import Account from '../models/Accounts.js'
import Transaction from '../models/Transaction.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

function toCents(value) {
    if (typeof value !== 'number' && typeof value !== 'string') return null
    if (typeof value === 'string' && !value.trim()) return null
    const amount = Number(value)
    const scaled = amount * 100
    const cents = Math.round(scaled)
    if (!Number.isFinite(amount) || !Number.isSafeInteger(cents) || Math.abs(scaled - cents) > 1e-7) return null
    return cents
}

function balanceChangeCents(transaction, accountId) {
    const amount = toCents(transaction.amount)
    if (amount === null) return null
    if (transaction.type === 'transfer') {
        if (String(transaction.account) === String(accountId)) {
            const fee = toCents(transaction.fee || 0)
            const total = amount + fee
            return fee === null || !Number.isSafeInteger(total) ? null : -total
        }
        if (String(transaction.otherAccount) === String(accountId)) return amount
        return 0
    }
    return transaction.type === 'income' ? amount : -amount
}

function badRequest(res, message) {
    return res.status(400).json({ message })
}

router.post('/account', protect, async (req, res) => {
    try {
        const { accName, accType, accClass, accIcon } = req.body || {}
        const rawAmount = req.body?.accAmount ?? req.body?.startingBalance ?? 0
        const accAmountCents = toCents(rawAmount)
        const accNote = String(req.body?.accNote || '').trim()

        if (!String(accName || '').trim() || !String(accType || '').trim()) {
            return badRequest(res, 'Please enter an account name and type.')
        }
        if (accAmountCents === null) return badRequest(res, 'Enter a valid starting balance with up to two decimal places.')
        if (accClass !== undefined && !['asset', 'liability'].includes(accClass)) {
            return badRequest(res, 'Choose asset or liability for this account.')
        }
        if (accNote.length > 120) return badRequest(res, 'Account note must be 120 characters or fewer.')

        const account = await Account.create({
            user: req.user._id,
            accName: String(accName).trim(),
            accAmount: accAmountCents / 100,
            accType: String(accType).trim(),
            accClass,
            accIcon: String(accIcon || '').trim() || undefined,
            accNote: accNote || undefined
        })
        return res.status(201).json(account)
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return badRequest(res, err.message)
        }
        return res.status(500).json({ message: err.message })
    }
})

router.get('/account', protect, async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user._id })
        return res.status(200).json(accounts)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.put('/account/:id', protect, async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id, user: req.user._id })
        if (!account) return res.status(404).json({ message: 'Account not found.' })

        const { accName, accType, accClass, accIcon, currentBalance } = req.body || {}
        if (accName !== undefined) {
            if (!String(accName).trim()) return badRequest(res, 'Account name is required.')
            account.accName = String(accName).trim()
        }
        if (accType !== undefined) {
            if (!String(accType).trim()) return badRequest(res, 'Account type is required.')
            account.accType = String(accType).trim()
        }
        if (accClass !== undefined) {
            if (!['asset', 'liability'].includes(accClass)) return badRequest(res, 'Choose asset or liability for this account.')
            account.accClass = accClass
        }
        if (accIcon !== undefined) account.accIcon = String(accIcon).trim()
        if (req.body?.accNote !== undefined) {
            const note = String(req.body.accNote).trim()
            if (note.length > 120) return badRequest(res, 'Account note must be 120 characters or fewer.')
            account.accNote = note
        }
        if (currentBalance !== undefined) {
            const desiredCents = toCents(currentBalance)
            if (desiredCents === null) return badRequest(res, 'Enter a valid balance with up to two decimal places.')

            const ledger = await Transaction.find({
                user: req.user._id,
                deletedAt: null,
                $or: [{ account: account._id }, { otherAccount: account._id }]
            }).select('type amount fee account otherAccount')
            const changes = ledger.map(item => balanceChangeCents(item, account._id))
            if (changes.some(change => change === null)) return badRequest(res, 'This account has a transaction amount that needs to be corrected first.')
            const activity = changes.reduce((sum, change) => sum + change, 0)
            if (!Number.isSafeInteger(activity) || !Number.isSafeInteger(desiredCents - activity)) {
                return badRequest(res, 'The balance is too large to store safely.')
            }
            account.accAmount = (desiredCents - activity) / 100
        }

        await account.save()
        return res.status(200).json(account)
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return badRequest(res, err.message)
        }
        return res.status(500).json({ message: err.message })
    }
})

export default router
