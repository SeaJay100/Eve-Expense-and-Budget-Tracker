export function toCents(value) {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    const amount = Number(value);
    const scaled = amount * 100;
    const cents = Math.round(scaled);
    if (!Number.isFinite(amount) || !Number.isSafeInteger(cents) || Math.abs(scaled - cents) > 1e-7) return null;
    return cents;
}

export function badRequest(res, message) {
    return res.status(400).json({ message });
}
