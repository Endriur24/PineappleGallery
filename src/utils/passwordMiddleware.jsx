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
      const storedPassword = getCookie(c, `gallery_pwd_${galleryTableName}`);

      const { results: galleries } = await getGalleryPassword(c, galleryTableName);
      const gallery = galleries?.[0];

      // If no gallery found or no password required - return the original response
      if (!gallery || !gallery.Password) {
        return await next();
      }

      // If cookie already contains the correct password, return the original response
      if (storedPassword === gallery.Password) {
        return await next();
      }

      // Show password prompt
      return c.html(
        <PasswordPrompt 
          gallery={gallery} 
          error={null} 
          c={c} 
        />,
        401
      );
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
              gallery={gallery}
              error={c.t("gallery_incorrect_password")}
              c={c}
            />,
            401
          );
        }
      } catch (error) {
        console.error("Error in password protection middleware:", error);
        return c.text("An error occurred", 500);
      }
    }
  };
};
