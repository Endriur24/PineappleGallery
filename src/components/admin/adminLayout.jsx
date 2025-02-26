import { html, raw } from "hono/html";
import { getGalleryPath } from "../../utils/galleryPath";
import { ThemeSwitcher } from "../utils/themeSwitcher";
import { HeadScripts } from "../utils/headScripts";
import { getPicoCSS } from "../../utils/getPicoCSS";

export const Layout = (props) => {
  const c = props.c;
  const renderBreadcrumb = (latest) => {
    if (latest != null && latest !== "admin_panel_breadcrumb") {
      return `<li>
                <a href="./">${c.t("admin_panel_breadcrumb")}</a>
              </li>
              <li>
                ${latest}
              </li>`;
    } else if (latest == null) {
      return null;
    }
  };

  const makeURL = (path, prefix = "") => {
    const { protocol, host } = new URL(c.req.url);
    return `${protocol}//${prefix}${host}${path}`;
  };

  const breadcrumb = renderBreadcrumb(props.breadcrumb);
  return html`<!doctype html>
    <html data-theme="auto" lang="${c.t()}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${props.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
        <link rel="stylesheet" href="${getPicoCSS(c)}" />
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="stylesheet" href="/static/admin.css" />
        <script src="https://unpkg.com/htmx.org@1.9.12"></script>
        ${(<HeadScripts />)}
      </head>
      <body>
      <div class="container">
      	<nav role="menu">
          <label data-role="burger"><input type="checkbox" /></label>
          <ul role="menubar">
            <li>
              <h3 class="mb-2">${c.t("admin_panel_title")}</h3>
            </li>
            <li>
              ${(<ThemeSwitcher c={c} />)}
            </li>
          </ul>
          <ul role="menuitem">
            <li>
              <a href=${makeURL(getGalleryPath(c))}>
                ${c.t("public_view")}
              </a>
            </li>
            <li>
              <a href=${makeURL(`${getGalleryPath(c)}admin/purge`)}>
                ${c.t("purge-cache")}
              </a>
            </li>
            <li>
              <a href=${makeURL(`${getGalleryPath(c)}admin`, "logout@")}>
                 ${c.t("logout")}
              </a>
            </li>
          </ul>
        </nav>
        ${breadcrumb != null ? (
            <section class="breadcrumbs">
              <nav aria-label="breadcrumb">
                <ul>
                  <small>{raw(breadcrumb)}</small>
                </ul>
              </nav>
            </section>
          ) : (
            ""
          )
        }
      </div>
      <main class="container">
        ${props.children}
      </main>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      <script src="/static/js/SwitchColorMode.js"></script>
      </body>
    </html>`;
};
