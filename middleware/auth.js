const middlewareController = {};

const jwt = require ('jsonwebtoken');
const User = require('../models/User.js');

middlewareController.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id);

        if (!user || user.verificationToken !== token) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Token inválido.' });
    }
  };

module.exports = middlewareController;

