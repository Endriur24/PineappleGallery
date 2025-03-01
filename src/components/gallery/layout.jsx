import { html } from 'hono/html';
import { SocialMetaTags } from '../utils/metaTags';
import { ThemeSwitcher } from '../utils/themeSwitcher';
import { PreloadAssets } from '../utils/preloader';
import { HeadScripts } from '../utils/headScripts';
import { getPicoCSS } from '../../utils/getPicoCSS';

export const Layout = (props) => {
  const c = props.c;
  const prefetchType = props.prefetch;
  const desc = props.desc || c.env.DESCRIPTION;
  return (
    html`
    <!DOCTYPE html>
    <html data-theme="auto" lang=${c.t()}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>${props.title}</title>
        ${<SocialMetaTags title={props.title} desc={desc} url={c.req.url} />}
        ${<PreloadAssets type={prefetchType} c={c} />}
        <link rel="stylesheet" href="/static/gallery.css" />
        <link rel="stylesheet" href="/static/style.css" />
        <link rel="stylesheet" href="${getPicoCSS(c)}" />
        <link rel="stylesheet" href="/static/photoswipe.css" />
        ${<HeadScripts />}
      </head>
      <body class="container">
        <header>
        <nav>
          <ul>
            <li><h2><a href="." class="contrast">${c.env.PAGE_TITLE}</a></h2></li>
          </ul>
          <ul>
          <li>
            ${<ThemeSwitcher c={c} />}
          </li>
          </ul>
        </nav>
        </header>
        <main>
          ${props.children}
        </main>
        <footer>
        <hr />
        <center>
          <small>
            &copy; ${new Date().getFullYear()} ${c.env.COPYRIGHT} -  
            <a href="admin">Admin Panel</a>
          </small>
        </center>
        </footer>
        <script type="module" src="/static/js/SwitchColorMode.js"></script>
      </body>
    </html>`
  );
};
