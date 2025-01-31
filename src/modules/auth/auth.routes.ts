import express from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';
import { auth } from '../../middlewares/auth';

const router = express.Router();

router.get(
    "/me",
    auth,
    AuthController.myProfile
)

router.post(
    '/register',
    validateRequest(AuthValidation.userRegValidationSchema),
    AuthController.registerUser
);

router.post(
    '/login',
    validateRequest(AuthValidation.userLoginValidationSchema),
    AuthController.loginUser
)

router.post(
    '/refresh-token',
    validateRequest(AuthValidation.tokenValidationSchema),
    AuthController.refreshToken
)


export const authRoutes = router;