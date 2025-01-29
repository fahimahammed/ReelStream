import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';  // Example: 1 hour expiration

export function generateToken(payload: object): string {
    try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        return token;
    } catch (error) {
        throw new Error('Error generating JWT token');
    }
}

export function verifyToken(token: string): object | string {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

