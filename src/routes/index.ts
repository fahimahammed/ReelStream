import express from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { videoRoutes } from '../modules/video/video.routes';
import { analyticsRoutes } from '../modules/analytics/analytics.routes';

const router = express.Router();

const moduleRoutes = [

    {
        path: '/auth',
        routes: authRoutes
    },
    {
        path: '/video',
        routes: videoRoutes
    },
    {
        path: '/analytics',
        routes: analyticsRoutes
    }
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.routes);
});

export default router;