import { Layout } from "./layout";

export const PasswordPrompt = ({ galleryName, error, c }) => (
  <Layout title={galleryName} c={c}>
    <section>
      <a href="./" class="secondary">
        ← {c.t("back_link")}
      </a>
      <article className="password">
        <div className="password-box-header">
          <h1>{galleryName}</h1>
          <p>{c.t("gallery_password_required")}</p>
          {error && <strong className="error">{error}</strong>}
        </div>
        <form className="password" method="POST">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder={c.t("enter_password")}
              required
            />
          <button type="submit">
            {c.t("open_gallery")}
          </button>
        </form>
      </article>
    </section>
  </Layout>
);
