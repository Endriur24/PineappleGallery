import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-pages';
import { main } from "./components/gallery/galleryListing";
import { admin } from "./components/admin/admin";
import { handleGalleryRoute } from "./components/gallery/gallery";
import { handleGetImage } from "./utils/getImg";
import { translationMiddleware } from "./utils/localeMiddleware";
import { cache } from './utils/cacheMiddleware';

const app = new Hono({ strict: false });

// Serve static files from dist directory -> put files into public/static
app.use('/static/*', serveStatic({ root: './dist' }));

// Apply the translation middleware to all routes
app.use('*', translationMiddleware);

app.get("/img/*", handleGetImage);

app.route('/admin', admin);

app.use('/*', cache({
  maxAge: 180,
  includeLang: true,
  ignoreQueryParams: false
}));

app.get('/test', (c) => {                            //temporary endpoint
  return c.text(c.t())
})

app.get("/", main);

app.get("/:galleryTableName", handleGalleryRoute);

export default app;
