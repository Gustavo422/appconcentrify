const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireGuest, requireAuth } = require('../middleware/authMiddleware');
const AuthController = require('../src/controllers/AuthController');
const { AUTH } = require('../src/constants');

const router = express.Router();

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: AUTH.LOGIN_WINDOW_MS,
  max: AUTH.LOGIN_ATTEMPTS_LIMIT,
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /auth/login
 * Página de login
 */
router.get('/login', requireGuest, AuthController.showLogin);

/**
 * POST /auth/login
 * Processar login
 */
router.post('/login', requireGuest, loginLimiter, AuthController.login);

/**
 * GET /auth/register
 * Página de registro (apenas para admins)
 */
router.get('/register', requireAuth, AuthController.showRegister);

/**
 * POST /auth/register
 * Processar registro (apenas para admins)
 */
router.post('/register', requireAuth, AuthController.register);

/**
 * POST /auth/logout
 * Logout do usuário
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * GET /auth/logout (para compatibilidade)
 */
router.get('/logout', requireAuth, AuthController.logout);

module.exports = router;
