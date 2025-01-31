import Redis from 'ioredis';
import env from '../config/env';

const redis = new Redis(env.redis_url);

export default redis;
