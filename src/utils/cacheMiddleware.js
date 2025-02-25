export const cache = () => {
  const createResponse = (content, isCached, lang, cacheKey) =>
    new Response(content, {
      headers: {
        'Content-Type': 'text/html',
        'X-KV-Cache-Status': isCached ? 'HIT' : 'MISS',
        'X-Selected-Language': lang,
        'X-KV-Cache-Key': cacheKey,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  return async (c, next) => {
    if (c.env.USE_CACHE === "false") {
      await next();
      return c.res;
    }

    try {
      const lang = await c.t();

      // Generate cache key
      const cacheKey = `page:${new URL(c.req.url).pathname}@${lang}`;

      // Try to get cached content from KV
      const cachedContent = await c.env.CACHE_KV.get(cacheKey);
      if (cachedContent) {
        return createResponse(cachedContent, true, lang, cacheKey);
      }

      // If no cache, generate response
      await next();
      const originalResponse = c.res.clone();

      // Pass through non-200 responses without caching
      if (originalResponse.status !== 200) {
        return originalResponse;
      }

      // Read expire date from response header (upcoming publication)
      const cacheExpire = originalResponse.headers.get("X-KV-Cache-Expires");
      let options;
      if (cacheExpire) {
        options = {
          expiration: new Date(cacheExpire) / 1000,
        };
      }

      // Cache the successful response
      const content = await originalResponse.text();
      c.executionCtx.waitUntil(c.env.CACHE_KV.put(cacheKey, content, options));

      // Replace original response with one containing cache headers
      c.res = createResponse(content, false, lang, cacheKey);
    } catch (error) {
      console.error('Cache error:', error);
      await next();
      return c.res;
    }
  };
};
