const UserController = {};

// controllers/authController.js
const User = require('../models/User');
const bcrypt  = require('bcryptjs')
const jwt = require ('jsonwebtoken')
const crypto = require ('crypto')
const nodemailer = require ('nodemailer')
const LoginAttempt = require ('../models/loginAttempt.js')
const { validationResult } = require('express-validator');

// Para iniciar sesión
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION  = 2 * 60 * 1000; // 2 minutos
//const JWT_SECRET = 'your_jwt_secret'; // Asegúrate de definir esto en un entorno seguro}

UserController.getAllUsers = async (req, res) => {
    try {
      // Buscar todos los usuarios en la base de datos
      const users = await User.find().select('-password'); // Excluir la contraseña de la respuesta
  
      // Devolver los usuarios en la respuesta
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  };

// Registro de usuario
UserController.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        user = new User({
            name,
            username,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'Registro exitoso', // Mensaje de éxito
                    token // Token JWT
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
};

UserController.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let loginAttempt = await LoginAttempt.findOne({ email });
        const user = await User.findOne({ email });

        if (!loginAttempt) {
            // Si no existe un intento anterior, creamos uno nuevo
            loginAttempt = new LoginAttempt({
                email,
                attempts: 1,
                success: false,
                blocked: false,
            });
        } else {
            // Si existe un intento anterior, actualizamos los datos
            loginAttempt.attempts += 1;
            loginAttempt.success = false;
        }

        //const user = await User.findOne({ email });

        if (!user) {
            await loginAttempt.save();
            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        const now = Date.now();

        // Verificar si el usuario está bloqueado
        if (user.lockUntil && user.lockUntil > now) {
            loginAttempt.userId = user._id;
            loginAttempt.success = false;
            loginAttempt.blocked = true;
            await loginAttempt.save();
            return res.status(403).json({ message: 'Cuenta bloqueada. Inténtelo más tarde.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Activar bloqueo si se supera el número máximo de intentos
            if (user.loginAttempts >= MAX_ATTEMPTS) {
                user.lockUntil = now + BLOCK_DURATION;
                user.loginAttempts = 0; // Reiniciar intentos después de bloqueo
                loginAttempt.blocked = false;
            }

            await user.save();
            await loginAttempt.save();

            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        // Restablecer los intentos de inicio de sesión después de un inicio de sesión exitoso
        user.loginAttempts = 0;
        user.lockUntil = null;
        
        const payload = {
            user: {
                id: user._id,
            },
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        user.verificationToken = token;
        await user.save();
        
        loginAttempt.userId = user._id;
        loginAttempt.success = true;
        loginAttempt.attempts = 0;
        loginAttempt.blocked = false;
        await loginAttempt.save();

          // Responder con un mensaje de éxito y el token
          res.status(200).json({
            message: 'Bienvenido, Inicio de sesión exitoso', // Mensaje de éxito
            token // Token JWT
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error Interno del Servidor.' });
    }
};


// Controlador para enviar el código de verificación
UserController.sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }

        // Generar código de verificación de 4 dígitos
        const verificationCode = Math.floor(1000 + Math.random() * 9000);
        const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Código válido por 10 minutos

        user.verificationCode = verificationCode;
        user.verificationCodeExpires = verificationCodeExpires;
        await user.save();

        // Configurar el transportador de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // O cualquier otro servicio de correo que uses
            auth: {
                user: 'andsucelyizaguirre@gmail.com',
                pass: 'davb cksy jkol oanw'
            }
        });

        // Enviar el correo electrónico con el código de verificación
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Código de verificación para restablecer tu contraseña',
            text: `Tu código de verificación es ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Código de verificación enviado al correo electrónico.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Controlador para verificar el código de verificación
UserController.verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (user.verificationCode === verificationCode && user.verificationCodeExpires > Date.now()) {
            return res.status(200).json({ message: 'Código verificado correctamente.' });
        } else {
            return res.status(400).json({ message: 'Código de verificación incorrecto o expirado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Controlador para resetear la contraseña
UserController.resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

     // Verificar que la nueva contraseña y la confirmación coinciden
     if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;

        await user.save();

         // Restablecer el bloqueo en LoginAttempt
         const loginAttempt = await LoginAttempt.findOne({ email });
         if (loginAttempt) {
             loginAttempt.blocked = false;
             loginAttempt.save();
         }
 
         // Eliminar la fecha de bloqueo en el usuario
         user.lockUntil = null;
         await user.save();

        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error Interno del Servidor.' });
    }
};

module.exports = UserController;
