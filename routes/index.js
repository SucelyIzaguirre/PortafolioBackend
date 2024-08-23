// routes/contents.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const testimonioController = require('../controllers/testimonialController');
const portfolioController = require('../controllers/portafolioController');
const authController = require('../controllers/authController');
const middlewareController = require('../middleware/auth');
const upload = require('../middleware/upload');

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

router.get('/getAllTestimonial', testimonioController.getAllTestimonial);
router.post('/createTestimonio', middlewareController.authMiddleware, testimonioController.createTestimonio);
router.put('/updateTestimonio/:id', middlewareController.authMiddleware, testimonioController.updateTestimonio);
router.delete('/deleteTestimonio/:id', middlewareController.authMiddleware, testimonioController.deleteTestimonio);

// Ruta para actualizar un portafolio
router.put('/updatePortafolios/:id', upload.single('file', 10),portfolioController.updatePortafolio);
// Ruta para eliminar un portafolio
router.delete('/deletePortfolios/:id', portfolioController.deletePortfolio);// Ruta para crear un nuevo portafolio
router.post('/createPortfolio', upload.single('file'), middlewareController.authMiddleware, portfolioController.createPortafolio);
// Ruta para obtener los portafolios del usuario
router.get('/portfolios/user', middlewareController.authMiddleware, portfolioController.getUserPortfolios);

module.exports = router;
