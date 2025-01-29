import { z } from 'zod';

const userRegValidationSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(3, 'Name should be at least 3 characters long')
            .max(50, 'Name should be at most 50 characters long'),
        email: z
            .string()
            .email('Please provide a valid email address'),
        password: z
            .string()
            .min(6, 'Password should be at least 6 characters long')
            .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    })
});

export const AuthValidation = {
    userRegValidationSchema
};
