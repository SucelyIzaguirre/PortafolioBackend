// routes/contents.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const testimonioController = require('../controllers/testimonialController');
const portfolioController = require('../controllers/portafolioController');
const authController = require('../controllers/authController');
//const upload = require('../utils/s3');
const middlewareController = require('../middleware/auth');

router.get('/getAllUsers', authController.getAllUsers);
router.post('/register', authController.registerUser);
router.post('/login', authController.login);

// Ruta para enviar el código de verificación al correo
router.post('/forgot-password', authController.sendVerificationCode);
// Ruta para verificar el código de verificación
router.post('/verify-code', authController.verifyCode);
// Ruta para resetear la contraseña (separada)
router.post('/reset-password', authController.resetPassword);

router.post('/createContent', middlewareController.authMiddleware, contentController.createContent);
router.get('/allContents', middlewareController.authMiddleware, contentController.getUserContents);
router.put('/updateContent/:id', middlewareController.authMiddleware, contentController.updateContent);
router.delete('/deleteContent/:id', middlewareController.authMiddleware, contentController.deleteContent);

router.post('/createTestimonio', middlewareController.authMiddleware, testimonioController.createTestimonio);
router.put('/updateTestimonio/:id', middlewareController.authMiddleware, testimonioController.updateTestimonio);
router.delete('/deleteTestimonio/:id', middlewareController.authMiddleware, testimonioController.deleteTestimonio);

// Subir imágenes a AWS S3
//router.post('/upload', middlewareController, upload.array('images', 10), portfolioController.uploadImages);
router.post('/createPortafolio', middlewareController.authMiddleware, portfolioController.createPortafolio);
router.put('/updatePortafolio/:id', middlewareController.authMiddleware, portfolioController.updatePortafolio);

module.exports = router;
