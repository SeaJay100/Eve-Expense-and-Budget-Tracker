import express from 'express';
import Account from '../models/Accounts.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { badRequest, toCents } from '../utils/validation.js';

const router = express.Router();

function balanceChangeCents(transaction, accountId) {
    const amount = toCents(transaction.amount);
    if (amount === null) return null;
    if (transaction.type === 'adjustment') {
        return transaction.adjustmentDirection === 'increase' ? amount : -amount;
    }
    if (transaction.type === 'transfer') {
        if (String(transaction.account) === String(accountId)) {
            const fee = toCents(transaction.fee || 0);
            const total = amount + fee;
            return fee === null || !Number.isSafeInteger(total) ? null : -total;
        }
        if (String(transaction.otherAccount) === String(accountId)) return amount;
        return 0;
    }
    return transaction.type === 'income' ? amount : -amount;
}

function manilaToday() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const part = name => parts.find(item => item.type === name).value;
    return new Date(Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day'))));
}

router.post('/account', protect, async (req, res) => {
    try {
        const { accName, accType, accClass, accIcon } = req.body || {};
        const rawAmount = req.body?.accAmount ?? req.body?.startingBalance ?? 0;
        const accAmountCents = toCents(rawAmount);
        const accNote = String(req.body?.accNote || '').trim();

        if (!String(accName || '').trim() || !String(accType || '').trim()) {
            return badRequest(res, 'Please enter an account name and type.');
        }
        if (accAmountCents === null) return badRequest(res, 'Enter a valid starting balance with up to two decimal places.');
        if (accClass !== undefined && !['asset', 'liability'].includes(accClass)) {
            return badRequest(res, 'Choose asset or liability for this account.');
        }
        if (accNote.length > 120) return badRequest(res, 'Account note must be 120 characters or fewer.');

        const account = await Account.create({
            user: req.user._id,
            accName: String(accName).trim(),
            accAmount: accAmountCents / 100,
            accType: String(accType).trim(),
            accClass,
            accIcon: String(accIcon || '').trim() || undefined,
            accNote: accNote || undefined
        });
        return res.status(201).json(account);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return badRequest(res, err.message);
        }
        return res.status(500).json({ message: err.message });
    }
});

router.get('/account', protect, async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user._id });
        return res.status(200).json(accounts);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.put('/account/:id', protect, async (req, res) => {
    let session;
    try {
        session = await Account.startSession();
        let account;
        let responseError;
        await session.withTransaction(async () => {
            responseError = null;
            account = await Account.findOne({ _id: req.params.id, user: req.user._id }).session(session);
            if (!account) {
                responseError = { status: 404, message: 'Account not found.' };
                return;
            }

            const { accName, accType, accClass, accIcon, currentBalance } = req.body || {};
            if (accName !== undefined) {
                if (!String(accName).trim()) {
                    responseError = { status: 400, message: 'Account name is required.' };
                    return;
                }
                account.accName = String(accName).trim();
            }
            if (accType !== undefined) {
                if (!String(accType).trim()) {
                    responseError = { status: 400, message: 'Account type is required.' };
                    return;
                }
                account.accType = String(accType).trim();
            }
            if (accClass !== undefined) {
                if (!['asset', 'liability'].includes(accClass)) {
                    responseError = { status: 400, message: 'Choose asset or liability for this account.' };
                    return;
                }
                account.accClass = accClass;
            }
            if (accIcon !== undefined) account.accIcon = String(accIcon).trim();
            if (req.body?.accNote !== undefined) {
                const note = String(req.body.accNote).trim();
                if (note.length > 120) {
                    responseError = { status: 400, message: 'Account note must be 120 characters or fewer.' };
                    return;
                }
                account.accNote = note;
            }

            let adjustment;
            if (currentBalance !== undefined) {
                const desiredCents = toCents(currentBalance);
                if (desiredCents === null) {
                    responseError = { status: 400, message: 'Enter a valid balance with up to two decimal places.' };
                    return;
                }

                const ledger = await Transaction.find({
                    user: req.user._id,
                    deletedAt: null,
                    $or: [{ account: account._id }, { otherAccount: account._id }]
                }).select('type amount fee account otherAccount adjustmentDirection').session(session);
                const changes = ledger.map(item => balanceChangeCents(item, account._id));
                if (changes.some(change => change === null)) {
                    responseError = { status: 400, message: 'This account has a transaction amount that needs to be corrected first.' };
                    return;
                }
                const activity = changes.reduce((sum, change) => sum + change, 0);
                const startingCents = toCents(account.accAmount);
                if (startingCents === null || !Number.isSafeInteger(activity)) {
                    responseError = { status: 400, message: 'The balance is too large to store safely.' };
                    return;
                }
                const currentCents = startingCents + activity;
                const difference = desiredCents - currentCents;
                if (!Number.isSafeInteger(currentCents) || !Number.isSafeInteger(difference)) {
                    responseError = { status: 400, message: 'The balance is too large to store safely.' };
                    return;
                }
                if (difference !== 0) {
                    adjustment = {
                        user: req.user._id,
                        type: 'adjustment',
                        adjustmentDirection: difference > 0 ? 'increase' : 'decrease',
                        amount: Math.abs(difference) / 100,
                        description: 'Balance adjustment',
                        date: manilaToday(),
                        account: account._id
                    };
                }
                account.balanceRevision = (account.balanceRevision || 0) + 1;
            }

            await account.save({ session });
            if (adjustment) await Transaction.create([adjustment], { session });
        });

        if (responseError) return res.status(responseError.status).json({ message: responseError.message });
        return res.status(200).json(account);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return badRequest(res, err.message);
        }
        return res.status(500).json({ message: err.message });
    } finally {
        if (session) await session.endSession();
    }
});

export default router;
