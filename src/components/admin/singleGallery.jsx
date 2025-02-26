import { Layout } from "./adminLayout";
import { getGalleriesFromD1, getIndywidualGalleryFromD1 } from "../../utils/db";
import { GalleryForm } from "./galleryForm";
import { getImagePath } from "../../utils/galleryPath";
import { raw } from "hono/html";

const Singlegallery = (props) => {
  const c = props.c; // Ensure the context is passed correctly
  const title = `${c.t("editing_gallery")}<b>${props.gallery.GalleryName}</b>`;

  return (
    <Layout
      title={c.t("editing") + props.gallery.GalleryName}
      c={c}
      breadcrumb={props.gallery.GalleryName}
    >
      <article>
        <header>{raw(title)}</header>
        <GalleryForm c={c} gallery={props.gallery} />
        <fieldset class="grid">
          <button
            hx-confirm={`${c.t("confirm_gallery_delete")} ${
              props.gallery.GalleryName
            }?`}
            className="btn secondary"
            hx-target="#update_result"
            hx-delete={props.gallery.GalleryTableName + "/delete"}
          >
            <i className="bi bi-trash"></i>
            {c.t("delete_gallery_button")}
          </button>
          <button
            className="btn secondary"
            hx-post={props.gallery.GalleryTableName + "/purge"}
            hx-swap="outerHTML"
            hx-target="this"
          >
            <i className="bi bi-arrow-clockwise"></i>
            {c.t("purge-cache")}
          </button>
        </fieldset>
      </article>

      <article className="transparent-bg">
        <header className="w-button">
          <h3>{c.t("images_in_gallery_title")}</h3>
          <a hx-on:click="htmx.toggleClass(htmx.find('#uploader-wraper'), 'closed')" id="toggle-uploader-button">
            <i className="bi bi-plus-circle"></i>
            {c.t("add_images_title")}
          </a>
        </header>
        <div id="uploader-wraper" className="closed">
          <article>
            <header>
              <h3>{c.t("add_images_title")}</h3>
            </header>
            <form>
              <fieldset class="grid">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  id="fileInput"
                  name="file"
                />
                <button id="submit">
                  <i className="bi bi-upload"></i>
                  {c.t("upload_images_button")}
                </button>
              </fieldset>
            </form>

            <progress
              id="progress-bar"
              role="progressbar"
              value="0"
              min="0"
              max="100"
            />
            <br />
            <ul id="upload-error" ></ul>
            <div>
              <span>{c.t("progress_label")} </span>
              <span id="current-counter">0</span> /{" "}
              <span id="max-counter">0</span>
            </div>
          </article>
        </div>
        <center>
          <b>{props.images.length == 0 ? c.t("no_images_message") : ""}</b>
        </center>

        <div className="admin-grid">
          {props.images.map((image, index) => (
            <div
              key={index}
              className="admin-card"
              hx-target="this"
              hx-swap="outerHTML"
            >
              <div className="image-wrapper">
                <img
                  src={`../img/${image.path}`}
                  className="edit-card-img-top"
                  loading="lazy"
                  alt={image.name}
                />
                <div
                  className="admin-card-thumb"
                  data-tooltip={
                    props.gallery.CoverImage === getImagePath(c, image.path)
                      ? c.t("current_thumb")
                      : c.t("set_as_thumb")
                  }
                  data-placement="left"
                  hx-post={`../admin/api/setAsThumb?imagePath=${encodeURIComponent(
                    image.path
                  )}&galleryTableName=${props.gallery.GalleryTableName}`}
                  hx-target="this"
                >
                  {props.gallery.CoverImage === getImagePath(c, image.path) ? (
                    <i className="bi bi-star-fill"></i>
                  ) : (
                    <i className="bi bi-star"></i>
                  )}
                </div>
              </div>
              <div className="admin-card-body">
                <small>{image.name}</small>
                <div className="admin-card-buttons">
                  <button
                    className="btn secondary"
                    hx-confirm={`${c.t("deletion_of_image_confirm")} ${
                      image.name
                    }?`}
                    hx-delete={`../admin/api/deleteImage?imagePath=${encodeURIComponent(
                      image.path
                    )}&galleryTableName=${props.gallery.GalleryTableName}`}
                  >
                    <i className="bi bi-trash"></i>
                    {c.t("delete_image_button")}
                  </button>
                  <button
                    className="btn secondary"
                    hx-post={`../admin/api/toggleApproval?imagePath=${encodeURIComponent(
                      image.path
                    )}&galleryTableName=${props.gallery.GalleryTableName}`}
                    hx-target="this"
                  >
                    {image.approved ? (
                      <>
                        <i className="bi bi-check-circle"></i>
                        {c.t("approved_label")}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle"></i>
                        {c.t("unapproved_label")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </Layout>
  );
};

export const handleSingleGallery = async (c) => {
  const galleryTableName = c.req.param("galleryTableName");
  const { results } = await getGalleriesFromD1(c);
  const gallery = results.find(
    (elem) => elem.GalleryTableName === galleryTableName
  ) || { id: 0, name: "string" };

  const indResponse = await getIndywidualGalleryFromD1(c, galleryTableName);
  return c.html(
    <Singlegallery gallery={gallery} images={indResponse.results} c={c} />
  );
};
