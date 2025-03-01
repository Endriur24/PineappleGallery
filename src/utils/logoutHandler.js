import { deleteCookie } from "hono/cookie";
import { getGalleryPath } from "./galleryPath";

export const handleLogout = (c) => {
  const galleryTableName = c.req.param("galleryTableName");
  deleteCookie(c, `gallery_pwd_${galleryTableName}`, {
    httpOnly: true,
    secure: true,
    path: "/"
  });
  return c.redirect(`${getGalleryPath(c)}${galleryTableName}`);
};
