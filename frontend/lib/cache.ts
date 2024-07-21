import 'server-only';

import { createHash } from 'node:crypto';
import { CachedResult } from './types';
import { CACHE_KEY, redisDB } from './db';
import { logError } from './log';

function generateHash(key: string): string {
    return createHash('sha256').update(key, 'utf8').digest('hex');
}

export async function setCache(key: string, value: CachedResult) {
    console.log('setCache:', key);
    const hashKey = CACHE_KEY + generateHash(key);
    try {
        await redisDB.set(hashKey, JSON.stringify(value), { ex: 3600 * 7 });
    } catch (error) {
        logError(error, 'cache');
    }
}

export async function getCache(key: string): Promise<CachedResult | null> {
    console.log('getCache:', key);
    const hashKey = CACHE_KEY + generateHash(key);
    try {
        const cache = (await redisDB.get(hashKey)) as CachedResult;
        return cache;
    } catch (error) {
        logError(error, 'cache');
        return null;
    }
}
