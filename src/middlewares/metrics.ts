import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';
import prisma from '../utils/prismaClient';

const register = new promClient.Registry();

const requestCounter = new promClient.Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'status_code'],
});

const responseTimeHistogram = new promClient.Histogram({
    name: 'api_response_duration_seconds',
    help: 'API response duration in seconds',
    buckets: [0.1, 0.2, 0.5, 1, 2, 5],
});

register.registerMetric(requestCounter);
register.registerMetric(responseTimeHistogram);

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const end = responseTimeHistogram.startTimer();

    res.on('finish', () => {
        requestCounter.inc({ method: req.method, status_code: res.statusCode });
        end();
    });

    next();
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        // Execute SELECT 1 query to check database connection
        await prisma.$queryRaw`SELECT 1`;

        // If the query runs successfully, respond with API health status
        res.status(200).json({
            success: true,
            message: 'API is healthy!',
            dbStatus: 'Database is connected successfully.',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        // If there is an error connecting to the database
        console.error("Database connection error:", error);
        res.status(500).json({
            success: false,
            message: 'API is unhealthy!',
            error: 'Database connection failed.',
            timestamp: new Date().toISOString(),
        });
    }
};

export const metricsRoute = async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
};
