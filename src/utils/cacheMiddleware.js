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
      const cachedContent = await c.env.CACHE_KV.getWithMetadata(cacheKey);
      if (cachedContent) {
        c.set('KV-Gallery-Password', cachedContent.metadata.password);
        c.set('KV-Gallery-Name', cachedContent.metadata.galleryName);
        return createResponse(cachedContent.value, true, lang, cacheKey);
      }

      // If no cache, generate response
      await next();
      const originalResponse = c.res.clone();

      // Pass through non-200 responses without caching
      if (originalResponse.status !== 200) {
        return originalResponse;
      }

      // Read expire date from context (upcoming publication)
      const cacheExpire = c.get("KV-Cache-Expires");
      //read gallery password from context
      const galleryPassword = c.get("KV-Gallery-Password");
      const galleryName = c.get("KV-Gallery-Name");

      const options = {
        ...(cacheExpire && { expiration: new Date(cacheExpire).getTime() / 1000 }),
        ...(galleryPassword && galleryName && { metadata: { password: galleryPassword, galleryName: galleryName} }),
      };

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
