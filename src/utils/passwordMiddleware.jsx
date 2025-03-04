import { PasswordPrompt } from "../components/gallery/passwordPrompt";
import { getCookie, setCookie } from "hono/cookie";
import { getGalleryPassword } from "./db";

export const passwordProtection = () => {
  return async (c, next) => {
    const galleryTableName = c.req.param("galleryTableName");
    if (!galleryTableName) {
      return await next();
    }

    if (c.req.method === "GET") {
      await next();
      const galleryPassword = c.get("KV-Gallery-Password");
      const storedPassword = getCookie(c, `gallery_pwd_${galleryTableName}`);

      // Return original response if no password set or cookie contains correct password
      if (!galleryPassword || storedPassword === galleryPassword) {
        return c.res;
      }

      // Show password prompt overwriting response
      const galleryName = c.get("KV-Gallery-Name");
      c.res = new Response(
        <PasswordPrompt galleryName={galleryName} error={null} c={c} />,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
      return c.res;
    } else {
      try {
        const { results: galleries } = await getGalleryPassword(
          c,
          galleryTableName
        );
        const gallery = galleries?.[0];
        if (!gallery || !gallery.Password) {
          return await next();
        }

        const formData = await c.req.parseBody();
        const submittedPassword = formData.password;

        if (submittedPassword === gallery.Password) {
          // Set password cookie
          setCookie(c, `gallery_pwd_${galleryTableName}`, submittedPassword, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
          });

          // Redirect to the same URL with GET method
          const currentUrl = new URL(c.req.url);
          return c.redirect(currentUrl.pathname);
        } else {
          // If password is incorrect, show the password prompt again with an error message
          return c.html(
            <PasswordPrompt
              galleryName={gallery.GalleryName}
              error={c.t("gallery_incorrect_password")}
              c={c}
            />,
            {
              status: 200,
              headers: {
                "Content-Type": "text/html",
                "Cache-Control":
                  "no-store, no-cache, must-revalidate, max-age=0",
                Pragma: "no-cache",
                Expires: "0",
              },
            }
          );
        }
      } catch (error) {
        console.error("Error in password protection middleware:", error);
        return c.text("An error occurred", 500);
      }
    }
  };
};
