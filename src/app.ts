import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import globalExceptionHandler from './middlewares/globalExceptionHandler';
import { healthCheck, metricsMiddleware, metricsRoute } from './middlewares/metrics'
import router from './routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);


app.use('/api/v1', router);
app.get('/health', healthCheck);
app.get('/metrics', metricsRoute);

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
