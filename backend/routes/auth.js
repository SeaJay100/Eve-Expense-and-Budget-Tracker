import { randomUUID } from 'node:crypto';
import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { password } = req.body || {};
        const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

        if (!name || !email || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'Please fill all the fields.' });
        }
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }
        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ message: 'Use at least 8 characters and at most 72 bytes for your password.' });
        }
        if (name.length > 80) {
            return res.status(400).json({ message: 'Please enter a valid name.' });
        }
        
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        const user = await User.create({ username: randomUUID(), name, email, password });
        const token = generateToken(user._id);
        res.status(201).json({
            id: user._id,
            username: user.username,
            name: user.name || user.username,
            email: user.email,
            token,
        });
    } catch (err) {
        // The database also checks duplicates if two people register at the same time.
        if (err.code === 11000) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const password = req.body?.password;
        const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

        if (!email || typeof password !== 'string' || !password) {
            return res.status(400).json({ message: 'Please fill all the fields.' });
        }
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
        res.status(200).json({
            id: user._id,
            username: user.username,
            name: user.name || user.username,
            email: user.email,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Current user
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);

});

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export default router;
