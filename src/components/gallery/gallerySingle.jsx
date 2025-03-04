import { Layout } from "./layout";
import { getImageWithTransforms } from "../../utils/galleryPath";
import {
  getGalleriesFromD1,
  getIndywidualGalleryFromD1wApproved,
} from "../../utils/db";
import { html } from "hono/html";

export const Gallery = ({ gallery, images, c }) => (
  <Layout title={gallery.GalleryName} c={c} prefetch="single">
    <section>
      <div className="gallery-controls">
        <a href="./" className="secondary">
          ← {c.t("back_link")}
        </a>
        {gallery.Password && <a href={gallery.GalleryTableName + "/logout"} className="secondary">{c.t("forget_gallery_password")}</a>}
      </div>
      <div className="gallery-info">
        <h1 className="gallery-title">{gallery.GalleryName}</h1>
        {gallery.PartyDate && <small>{gallery.PartyDate}</small>}
        {gallery.Tags && (
            <small className="gallery-tags">
              {c.t("tags_label")}: {gallery.Tags}
            </small>
          )}
        {gallery.TextField && <p className="gallery-description">{gallery.TextField}</p>}
      </div>
      <div id="mansory-wraper">
        {images.length === 0 ? (
          <div>
            <p className="text-muted">{c.t("no_images_message")}</p>
          </div>
        ) : (
          <div id="masonry-container">
            {images.map((image) => (
              <div class="masonry-item">
                <div class="masonry-item-content">
                  <div class="placeholder"></div>
                  <a
                    href={getImageWithTransforms(c, image.path, "full")}
                    data-pswp-width={image.width}
                    data-pswp-height={image.height}
                    target="_blank"
                  >
                    <img
                      src={getImageWithTransforms(
                        c,
                        image.path,
                        "gallery-thumb"
                      )}
                      alt={image.name}
                      loading="lazy"
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

    {html`
      <script
        type="module"
        src="https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js"
      ></script>
      <script type="module" src="/static/js/initPhotoSwipe.js"></script>
      <script type="module" src="/static/js/masonry.js"></script>
    `}
  </Layout>
);

export async function handleGalleryRoute(c) {
  const galleryTableName = c.req.param("galleryTableName");
  const { results: galleries } = await getGalleriesFromD1(c);
  const gallery = galleries.find(
    (g) => g.GalleryTableName === galleryTableName
  );

  if (!gallery) return c.notFound();

  const { results: images } = await getIndywidualGalleryFromD1wApproved(
    c,
    galleryTableName
  );
  // Append gallery password and name to context
  c.set('KV-Gallery-Password', gallery.Password);
  c.set('KV-Gallery-Name', gallery.GalleryName);

  return c.html(<Gallery gallery={gallery} images={images || []} c={c} />);
}
