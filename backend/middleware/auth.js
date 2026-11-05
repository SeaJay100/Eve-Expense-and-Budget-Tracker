import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// Run this before a route that needs a logged-in user.
export const protect = async (req, res, next) => {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token.' })
    }

    try {
        // The frontend sends: Authorization: Bearer <token>
        const token = authorization.split(' ')[1]

        // The login token contains the user's database ID.
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found.' })
        }

        // The next route can now use req.user._id to save or find this user's data.
        req.user = user
        return next()
    } catch (err) {
        console.error('Token verification failed:', err.message)
        return res.status(401).json({ message: 'Not authorized, token failed.' })
    }
}
