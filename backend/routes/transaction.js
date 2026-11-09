import express from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Accounts.js';
import Categories from '../models/Categories.js';
import { protect } from '../middleware/auth.js';
import { badRequest, toCents } from '../utils/validation.js';

const router = express.Router();

function validDate(value) {
    if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
    if (typeof value !== 'string') return null;
    const day = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
    const parsedDay = new Date(`${day}T00:00:00.000Z`);
    if (!Number.isFinite(parsedDay.getTime()) || parsedDay.toISOString().slice(0, 10) !== day) return null;
    if (value.length > 10 && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
}

function validAmount(value) {
    const cents = toCents(value);
    return cents !== null && cents > 0;
}

function recurringValue(value) {
    return value === true || value === 'yes';
}

function dateKey(date) {
    return new Date(date).toISOString().slice(0, 10);
}

function manilaToday() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const part = name => parts.find(item => item.type === name).value;
    return new Date(Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day'))));
}

function monthlyDate(year, monthIndex, day) {
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, monthIndex, Math.min(day, lastDay)));
}

function accountQuery(req, accountId, allowedArchivedAccounts = []) {
    const query = { _id: accountId, user: req.user._id };
    if (!allowedArchivedAccounts.some(id => String(id) === String(accountId))) query.archivedAt = null;
    return query;
}

async function ownedEntry(req, res, {
    account, category, type, keepDeletedCategory = false, allowedArchivedAccounts = []
}) {
    const userAccount = account && await Account.findOne(accountQuery(req, account, allowedArchivedAccounts));
    if (!userAccount) {
        badRequest(res, 'Choose an account belonging to you.');
        return null;
    }
    const categoryQuery = { _id: category, user: req.user._id };
    if (!keepDeletedCategory) categoryQuery.deletedAt = null;
    const userCategory = category && await Categories.findOne(categoryQuery);
    if (!userCategory) {
        badRequest(res, 'Choose a category belonging to you.');
        return null;
    }
    if (String(userCategory.categType).toLowerCase() !== type) {
        badRequest(res, 'Choose a category matching the transaction type.');
        return null;
    }
    return { userAccount, userCategory };
}

async function sendSavedEntry(req, res, status, transaction) {
    if (req.body?.saveSubcategory === true && transaction.category && transaction.description) {
        try {
            await Categories.updateOne(
                { _id: transaction.category, user: req.user._id, deletedAt: null },
                { $addToSet: { subcategories: transaction.description } }
            );
        } catch {
            return res.status(status).json({
                ...transaction.toObject(),
                warning: 'Transaction saved. The custom subcategory could not be added.'
            });
        }
    }
    return res.status(status).json(transaction);
}

router.post('/transaction', protect, async (req, res) => {
    try {
        const { amount, date, account, category, description, type = 'expense' } = req.body || {};
        const parsedDate = validDate(date);
        const cleanDescription = String(description || '').trim();
        if (!validAmount(amount)) return badRequest(res, 'Enter an amount greater than zero with up to two decimal places.');
        if (!parsedDate || !account || !category) {
            return badRequest(res, 'Enter a date, account, and category.');
        }
        if (!['expense', 'income'].includes(type)) return badRequest(res, 'Choose expense or income.');
        if (req.body?.recurring !== undefined && ![true, false, 'yes', 'no'].includes(req.body.recurring)) {
            return badRequest(res, 'Choose whether this transaction repeats.');
        }

        const entry = await ownedEntry(req, res, { account, category, type });
        if (!entry) return;

        const transaction = await Transaction.create({
            user: req.user._id,
            amount: toCents(amount) / 100,
            date: parsedDate,
            account,
            category,
            description: cleanDescription,
            type,
            recurring: recurringValue(req.body?.recurring)
        });
        return sendSavedEntry(req, res, 201, transaction);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.post('/transfer', protect, async (req, res) => {
    try {
        const { account, otherAccount, amount, fee = 0, date, description = '' } = req.body || {};
        const parsedDate = validDate(date);
        const transferFeeCents = toCents(fee);
        const cleanDescription = String(description).trim();
        if (!validAmount(amount) || transferFeeCents === null || transferFeeCents < 0) {
            return badRequest(res, 'Enter a valid transfer amount and fee.');
        }
        if (!parsedDate || !account || !otherAccount || String(account) === String(otherAccount)) {
            return badRequest(res, 'Choose two different accounts and a valid date.');
        }

        const [from, to] = await Promise.all([
            Account.findOne(accountQuery(req, account)),
            Account.findOne(accountQuery(req, otherAccount))
        ]);
        if (!from || !to) return badRequest(res, 'Choose two accounts belonging to you.');

        const transaction = await Transaction.create({
            user: req.user._id,
            type: 'transfer',
            amount: toCents(amount) / 100,
            fee: transferFeeCents / 100,
            date: parsedDate,
            account,
            otherAccount,
            description: cleanDescription
        });
        return res.status(201).json(transaction);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.post('/transaction/recurring/sync', protect, async (req, res) => {
    try {
        const today = manilaToday();
        const todayMonth = today.getUTCFullYear() * 12 + today.getUTCMonth();
        const sources = await Transaction.find({
            user: req.user._id,
            recurring: true,
            recurringSource: { $exists: false },
            deletedAt: null,
            type: { $in: ['expense', 'income'] }
        }).select('_id');
        let created = 0;

        for (const item of sources) {
            const session = await Transaction.startSession();
            let sourceCreated = 0;
            try {
                await session.withTransaction(async () => {
                    sourceCreated = 0;
                    const source = await Transaction.findOneAndUpdate({
                        _id: item._id,
                        user: req.user._id,
                        recurring: true,
                        recurringSource: { $exists: false },
                        deletedAt: null,
                        type: { $in: ['expense', 'income'] }
                    }, { $inc: { recurringSyncVersion: 1 } }, { new: true, session });
                    if (!source) return;

                    const accountIsActive = await Account.exists({
                        _id: source.account,
                        user: req.user._id,
                        archivedAt: null
                    }).session(session);
                    if (!accountIsActive) return;

                    const sourceDate = new Date(source.date);
                    const startMonth = sourceDate.getUTCFullYear() * 12 + sourceDate.getUTCMonth();
                    const sourceDay = sourceDate.getUTCDate();
                    const activeSince = source.recurringFrom || sourceDate;
                    const skipped = new Set((source.skippedDates || []).map(dateKey));
                    const existingRows = await Transaction.find({
                        user: req.user._id,
                        recurringSource: source._id
                    }).select('occurrenceMonth').session(session).lean();
                    const existing = new Set(existingRows.map(item => dateKey(item.occurrenceMonth)));
                    const operations = [];

                    for (let month = startMonth + 1; month <= todayMonth; month += 1) {
                        const year = Math.floor(month / 12);
                        const monthIndex = month % 12;
                        const occurrenceDate = monthlyDate(year, monthIndex, sourceDay);
                        const occurrenceMonth = new Date(Date.UTC(year, monthIndex, 1));
                        const monthKey = dateKey(occurrenceMonth);
                        if (occurrenceDate <= activeSince || occurrenceDate > today || skipped.has(monthKey) || existing.has(monthKey)) continue;
                        operations.push({
                            updateOne: {
                                filter: { user: req.user._id, recurringSource: source._id, occurrenceMonth },
                                update: { $setOnInsert: {
                                    user: req.user._id,
                                    type: source.type,
                                    amount: source.amount,
                                    description: source.description,
                                    date: occurrenceDate,
                                    account: source.account,
                                    category: source.category,
                                    recurringSource: source._id,
                                    occurrenceDate,
                                    occurrenceMonth,
                                    recurring: false
                                } },
                                upsert: true
                            }
                        });
                        existing.add(monthKey);
                    }

                    if (!operations.length) return;
                    const result = await Transaction.bulkWrite(operations, { ordered: false, session });
                    sourceCreated = result.upsertedCount || 0;
                });
                created += sourceCreated;
            } finally {
                await session.endSession();
            }
        }

        return res.status(200).json({ created });
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.get('/transaction', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id, deletedAt: null }).sort({ date: -1, _id: -1 });
        return res.status(200).json(transactions);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

router.get('/transaction/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
        return res.status(200).json(transaction);
    } catch (err) {
        if (err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.put('/transaction/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
        if (transaction.type === 'adjustment') {
            return badRequest(res, 'Balance adjustments are managed from the account page.');
        }

        if (transaction.type === 'transfer') {
            const account = req.body?.account ?? transaction.account;
            const otherAccount = req.body?.otherAccount ?? transaction.otherAccount;
            const amount = req.body?.amount ?? transaction.amount;
            const fee = req.body?.fee ?? transaction.fee ?? 0;
            const feeCents = toCents(fee);
            const parsedDate = validDate(req.body?.date ?? transaction.date);
            const description = String(req.body?.description ?? transaction.description ?? '').trim();
            if (!validAmount(amount) || feeCents === null || feeCents < 0) {
                return badRequest(res, 'Enter a valid transfer amount and fee.');
            }
            if (!parsedDate || !account || !otherAccount || String(account) === String(otherAccount)) {
                return badRequest(res, 'Choose two different accounts and a valid date.');
            }
            const allowedArchivedAccounts = [transaction.account, transaction.otherAccount];
            const [from, to] = await Promise.all([
                Account.findOne(accountQuery(req, account, allowedArchivedAccounts)),
                Account.findOne(accountQuery(req, otherAccount, allowedArchivedAccounts))
            ]);
            if (!from || !to) return badRequest(res, 'Choose two accounts belonging to you.');
            transaction.type = 'transfer';
            transaction.account = account;
            transaction.otherAccount = otherAccount;
            transaction.amount = toCents(amount) / 100;
            transaction.fee = feeCents / 100;
            transaction.date = parsedDate;
            transaction.description = description;
            transaction.category = undefined;
            transaction.recurring = false;
        } else {
            const type = req.body?.type ?? transaction.type;
            if (!['expense', 'income'].includes(type)) return badRequest(res, 'Choose expense or income.');
            const account = req.body?.account ?? transaction.account;
            const category = req.body?.category ?? transaction.category;
            const keepDeletedCategory = String(category) === String(transaction.category);
            const entry = await ownedEntry(req, res, {
                account, category, type, keepDeletedCategory,
                allowedArchivedAccounts: [transaction.account]
            });
            if (!entry) return;

            if (req.body?.amount !== undefined) {
                if (!validAmount(req.body.amount)) return badRequest(res, 'Enter an amount greater than zero with up to two decimal places.');
                transaction.amount = toCents(req.body.amount) / 100;
            }
            if (req.body?.date !== undefined) {
                const parsedDate = validDate(req.body.date);
                if (!parsedDate) return badRequest(res, 'Enter a valid date.');
                if (dateKey(parsedDate) !== dateKey(transaction.date) && await Transaction.exists({
                    user: req.user._id, recurringSource: transaction._id
                })) return badRequest(res, 'The original date cannot change after monthly repeats have been saved.');
                transaction.date = parsedDate;
            }
            if (req.body?.description !== undefined) {
                transaction.description = String(req.body.description ?? '').trim();
            }
            transaction.account = account;
            transaction.category = category;
            transaction.type = type;
            if (req.body?.recurring !== undefined) {
                if (![true, false, 'yes', 'no'].includes(req.body.recurring)) return badRequest(res, 'Choose whether this transaction repeats.');
                const repeating = recurringValue(req.body.recurring);
                if (repeating && transaction.recurringSource) return badRequest(res, 'Edit the original transaction to change its repeats.');
                if (repeating && !transaction.recurring) transaction.recurringFrom = manilaToday();
                transaction.recurring = repeating;
            }
        }

        await transaction.save();
        return sendSavedEntry(req, res, 200, transaction);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.delete('/transaction/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

        if (transaction.recurringSource) {
            // Keep the unique series/month key so a concurrent sync cannot recreate this occurrence.
            transaction.deletedAt = new Date();
            await transaction.save();
        } else if (transaction.recurring) {
            transaction.recurring = false;
            transaction.deletedAt = new Date();
            await transaction.save();
        } else {
            await transaction.deleteOne();
        }
        return res.status(200).json({ message: 'Transaction deleted successfully.' });
    } catch (err) {
        if (err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

router.delete('/transaction/:id/recurring', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id,
            deletedAt: null,
            $or: [
                { recurring: true, recurringSource: { $exists: false } },
                { recurringSource: { $exists: true } }
            ]
        });
        if (!transaction) return res.status(404).json({ message: 'Monthly recurring transaction not found.' });

        const sourceId = transaction.recurringSource || transaction._id;
        const source = await Transaction.findOneAndUpdate({
            _id: sourceId,
            user: req.user._id,
            recurringSource: { $exists: false },
            deletedAt: null
        }, { $set: { recurring: false, deletedAt: new Date() } }, { new: true });
        if (!source) return res.status(200).json({ message: 'Monthly recurring transaction already stopped.' });

        return res.status(200).json({ message: 'Monthly recurring transaction deleted. Past repeats remain saved.' });
    } catch (err) {
        if (err.name === 'CastError') return badRequest(res, err.message);
        return res.status(500).json({ message: err.message });
    }
});

export default router;
