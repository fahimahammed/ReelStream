import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import env from '../config/env';

const createToken = (
  payload: Record<string, unknown>,
): string => {
  return jwt.sign(
    payload,
    env.jwt.secret as Secret,
    {
      algorithm: 'HS256',
      expiresIn: env.jwt.expires_in,
    } as SignOptions);
};

const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwt.secret as Secret) as JwtPayload;
};


export const jwtHelpers = {
  createToken,
  verifyToken
};