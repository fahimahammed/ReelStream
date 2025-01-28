/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express';

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
