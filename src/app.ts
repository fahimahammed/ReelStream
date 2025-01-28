import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';

const app: Application = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Import and use your routes here
// import routes from './routes';
// app.use('/api/v1', routes);

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is working...!',
    });
});

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
