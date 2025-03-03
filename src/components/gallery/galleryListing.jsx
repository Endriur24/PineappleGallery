import { Layout } from "./layout";
import {
  getGalleriesFromD1wGalleryIsPublic,
  upcomingPublicationDate,
} from "../../utils/db";
import { getImageWithTransforms } from "../../utils/galleryPath";

export const main = async (c) => {
  const [galleriesResponse, upcomingPublicationResponse] = await Promise.all([
    getGalleriesFromD1wGalleryIsPublic(c),
    upcomingPublicationDate(c),
  ]);

  const upcomingPublication = upcomingPublicationResponse?.results[0]?.PublicationDate ?? undefined;

  // in case of error or while initial run
  if (typeof galleriesResponse === "string") {
    console.log(galleriesResponse);
    return c.text(galleriesResponse, 202);
  }

  const { results: galleries } = galleriesResponse;
  const hasGalleries = galleries.length != 0;

  // Append context with date for the upcoming publication date
  c.set('KV-Cache-Expires', upcomingPublication)

  return c.html(
    <Layout
      title={c.env.PAGE_TITLE}
      c={c}
      prefetch={hasGalleries ? "listing" : "none"}
    >
      <section>
        <div>
          {galleries.length == 0 ? (
            <div className="no-images-container text-center py-5">
              <p className="text-muted">
                {c.t("no_galleries_message")}
                <a href="./admin">{c.t("admin_link")}</a>
                {c.t("create_gallery_message")}
              </p>
            </div>
          ) : (
            <div className="galleries-grid">
              {galleries.map((gallery) => (
                <a
                  href={"./" + gallery.GalleryTableName}
                  className="gallery-card"
                  key={gallery.GalleryTableName}
                >
                  {gallery.CoverImage !== "" ? (
                    <img
                      src={getImageWithTransforms(
                        c,
                        gallery.CoverImage,
                        "cover"
                      )}
                      alt={gallery.GalleryName}
                      width="433px"
                      height="200px"
                      className="gallery-card-image"
                    />
                  ) : (
                    <img
                      src="https://placehold.co/433x200.jpg"
                      alt="No image"
                      className="gallery-card-image"
                    />
                  )}
                  <div className="gallery-content">
                    <h2 className="gallery-name">{gallery.GalleryName}</h2>
                    {gallery.PartyDate && (
                      <div className="gallery-date">
                        {new Date(gallery.PartyDate).toLocaleDateString(
                          c.t("date_locale")
                        )}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};
