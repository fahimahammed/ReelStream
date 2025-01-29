import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
    '/register',
    validateRequest(AuthValidation.userRegValidationSchema),
    AuthController.registerUser
);

router.post(
    '/login',
    AuthController.loginUser
)


export const authRoutes = router;