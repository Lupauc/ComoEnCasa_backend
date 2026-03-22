import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateJWT, generateRandomToken } from '../utils/generateToken';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { createError } from '../middlewares/errorHandler';
import { env } from '../config/env';
import { DEFAULT_AVATAR_URL } from '../config/defaults';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        const usuarioYaCreado = await User.findOne({ email });
        if (usuarioYaCreado) return next(createError('An account with this email already exists.', 409));

        const tokenVerificacion = generateRandomToken();
        const finTokenVerificacion = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const usuarioNuevo = await User.create({
            name, email, password,
            avatar: DEFAULT_AVATAR_URL,
            emailVerificationToken: crypto.createHash('sha256').update(tokenVerificacion).digest('hex'),
            emailVerificationExpires: finTokenVerificacion,
        });

        await sendVerificationEmail(email, name, tokenVerificacion);

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please check your email to verify your account.',
            data: { id: usuarioNuevo._id, name: usuarioNuevo.name, email: usuarioNuevo.email },
        });
    } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const usuario = await User.findOne({ email }).select('+password');
        if (!usuario) return next(createError('Invalid email or password.', 401));
        if (!usuario.password) return next(createError('This account uses Google login. Please sign in with Google.', 401));

        const passwordOk = await usuario.comparePassword(password);
        if (!passwordOk) return next(createError('Invalid email or password.', 401));
        if (!usuario.isEmailVerified) return next(createError('Please verify your email before logging in.', 403));

        const jwtLogin = generateJWT(usuario);
        res.json({ success: true, message: 'Login successful.', data: { token: jwtLogin, user: usuario } });
    } catch (error) { next(error); }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // El token del correo se compara hasheado para no guardar el valor real en base de datos.
        const tokenHasheado = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const usuario = await User.findOne({
            emailVerificationToken: tokenHasheado,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!usuario) return next(createError('Invalid or expired verification token.', 400));

        usuario.isEmailVerified = true;
        usuario.emailVerificationToken = undefined;
        usuario.emailVerificationExpires = undefined;
        await usuario.save();

        const jwtLogin = generateJWT(usuario);
        res.json({ success: true, message: 'Email verified successfully.', data: { token: jwtLogin, user: usuario } });
    } catch (error) { next(error); }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        const usuario = await User.findOne({ email });
        if (!usuario) { res.json({ success: true, message: 'If that email exists, a verification link has been sent.' }); return; }
        if (usuario.isEmailVerified) return next(createError('Email is already verified.', 400));

        const tokenVerificacion = generateRandomToken();
        usuario.emailVerificationToken = crypto.createHash('sha256').update(tokenVerificacion).digest('hex');
        usuario.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await usuario.save();
        await sendVerificationEmail(email, usuario.name, tokenVerificacion);

        res.json({ success: true, message: 'If that email exists, a verification link has been sent.' });
    } catch (error) { next(error); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        const respuestaGenerica = { success: true, message: 'If that email exists, a password reset link has been sent.' };
        const usuario = await User.findOne({ email });
        if (!usuario || !usuario.password) { res.json(respuestaGenerica); return; }

        const tokenReset = generateRandomToken();
        usuario.passwordResetToken = crypto.createHash('sha256').update(tokenReset).digest('hex');
        usuario.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await usuario.save();
        await sendPasswordResetEmail(email, usuario.name, tokenReset);

        res.json(respuestaGenerica);
    } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { password } = req.body;
        const tokenHasheado = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const usuario = await User.findOne({ passwordResetToken: tokenHasheado, passwordResetExpires: { $gt: Date.now() } });
        if (!usuario) return next(createError('Invalid or expired reset token.', 400));

        usuario.password = password;
        usuario.passwordResetToken = undefined;
        usuario.passwordResetExpires = undefined;
        await usuario.save();

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) { next(error); }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: { user: req.user } });
};

export const logout = (_req: Request, res: Response): void => {
    res.json({ success: true, message: 'Logged out successfully.' });
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
    const usuarioGoogle = req.user!;
    const jwtLogin = generateJWT(usuarioGoogle);
    res.redirect(`${env.FRONTEND_URL}/login?token=${jwtLogin}`);
};
