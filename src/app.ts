import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { videoRoutes } from './modules/video/video.routes';
import { authRoutes } from './modules/auth/auth.routes';
import globalExceptionHandler from './middlewares/globalExceptionHandler';
import { analyticsRoutes } from './modules/analytics/analytics.routes';
import logger from './utils/logger';

const app: Application = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware to track API requests
app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, body, query } = req;

    logger.info(`Incoming request: ${method} ${url}`, {
        method,
        url,
        body,
        query,
    });

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Response sent: ${method} ${url}`, {
            method,
            url,
            status: res.statusCode,
            duration,
        });
    });

    next();
});


app.use('/api/v1/video/upload', videoRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is working...!',
    });
});

app.use(globalExceptionHandler);

// Handle 404 - Route Not Found
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Not Found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: 'API Not Found',
            },
        ],
    });
});

export default app;
