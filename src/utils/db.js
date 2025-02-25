import { getGalleryPath, getImagePath, getImageWithTransforms } from './galleryPath';

export const getGalleriesFromD1 = async (c) => {
  return await c.env.DB.prepare("SELECT * FROM Galleries ORDER BY PartyDate DESC").all();
};

export const getGalleriesFromD1wGalleryIsPublic = async (c) => {
  try {
    // Attempt to fetch data from the Galleries table
    const galleries = await c.env.DB.prepare('SELECT * FROM Galleries WHERE GalleryIsPublic = "TRUE" AND (DATETIME(PublicationDate) <= DATETIME("now", "localtime")  OR PublicationDate = "") ORDER BY PartyDate DESC').all();
    return galleries;
  } catch (error) {
    console.error("Error fetching galleries:", error.message);

    // Define SQL to create the Galleries table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Galleries (
        GalleryName TEXT,
        GalleryTableName TEXT PRIMARY KEY,
        TextField TEXT,
        CoverImage TEXT,
        PartyDate DATE,
        PublicationDate DATETIME,
        GalleryIsPublic BOOLEAN,
        ImagesOrder TEXT,
        Reviewers TEXT,
        Password TEXT,
        Tags TEXT,
        Location TEXT
      );
    `;

    try {
      // Attempt to create the Galleries table
      await c.env.DB.prepare(createTableSQL).run();
      // Create an index on the gallery table, for better storage and lookup optimization
      await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_galleries_public ON Galleries(GalleryIsPublic)`).run();

      return "The Galleries table in database did not exist and has been created. Please reload the page and clean the cache.";
    } catch (createError) {
      console.error("Error creating the Galleries table:", createError.message);
      return "An error occurred while creating the Galleries table.";
    }
  }
};

export const upcomingPublicationDate = async (c) => {
  return await c.env.DB.prepare('SELECT PublicationDate FROM Galleries WHERE GalleryIsPublic = "TRUE" AND (DATETIME(PublicationDate) > DATETIME("now", "localtime")) ORDER BY PublicationDate ASC LIMIT 1').all();
}

export const updateGalleryOnD1 = async (c, formObject) => {
  return await c.env.DB.prepare(
    "UPDATE Galleries SET GalleryName = ?1, TextField = ?3, PartyDate = ?4, PublicationDate = ?5, GalleryIsPublic = ?6, ImagesOrder = ?7, Reviewers = ?8, Password = ?9, Tags = ?10, Location = ?11 WHERE GalleryTableName = ?2;"
  )
    .bind(
      formObject.GalleryName,
      formObject.GalleryTableName,
      formObject.TextField,
      formObject.PartyDate,
      formObject.PublicationDate,
      formObject.GalleryIsPublic,
      formObject.ImagesOrder,
      formObject.Reviewers,
      formObject.Password,
      formObject.Tags,
      formObject.Location
    )
    .all();
};

export const createGallery = async (c, formObject) => {
  return await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO Galleries (GalleryName, GalleryTableName, TextField, CoverImage, PartyDate, PublicationDate, GalleryIsPublic, ImagesOrder, Reviewers, Password, Tags, Location) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)"
    ).bind(
      formObject.GalleryName,
      formObject.GalleryTableName,
      formObject.TextField,
      "",
      formObject.PartyDate,
      formObject.PublicationDate,
      formObject.GalleryIsPublic,
      formObject.ImagesOrder,
      formObject.Reviewers,
      formObject.Password,
      formObject.Tags,
      formObject.Location
    ),
    c.env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS ${formObject.GalleryTableName} (approved BOOLEAN, width INTEGER, height INTEGER, name TEXT, hash TEXT, path TEXT PRIMARY KEY, dateCreated INTEGER, dateModified INTEGER)`
    ),
  ]);
};

export const addImageToIndywidualGallery = async (
  c,
  GalleryTableName,
  name,
  width,
  height,
  hash,
  path,
  dateCreated,
  dateModified
) => {
  return c.env.DB.prepare(
    `INSERT INTO ${GalleryTableName} (approved, name, width, height, hash, path, dateCreated, dateModified) VALUES (TRUE, ?1, ?2, ?3, ?4, ?5, ?6, ?7)`
  )
    .bind(name, width, height, hash, path, dateCreated, dateModified)
    .all();
};

export const getIndywidualGalleryFromD1 = async (c, gallery) => {
  // Get gallery settings first to check sort order
  const gallerySettings = await c.env.DB.prepare(
    "SELECT ImagesOrder FROM Galleries WHERE GalleryTableName = ?"
  ).bind(gallery).first();

  let orderByClause = '';
  if (gallerySettings?.ImagesOrder) {
    switch (gallerySettings.ImagesOrder) {
      case 'name_asc':
        orderByClause = 'ORDER BY name ASC';
        break;
      case 'name_desc':
        orderByClause = 'ORDER BY name DESC';
        break;
      case 'created_asc':
        orderByClause = 'ORDER BY dateCreated ASC';
        break;
      case 'created_desc':
        orderByClause = 'ORDER BY dateCreated DESC';
        break;
      case 'modified_asc':
        orderByClause = 'ORDER BY dateModified ASC';
        break;
      case 'modified_desc':
        orderByClause = 'ORDER BY dateModified DESC';
        break;
      default: // 'original' or any other value
        orderByClause = ''; // No explicit ordering, uses original DB order
    }
  }

  return await c.env.DB.prepare(`SELECT * FROM ${gallery} ${orderByClause}`).all();
};

export const getIndywidualGalleryFromD1wApproved = async (c, gallery) => {
  // Get gallery settings first to check sort order
  const gallerySettings = await c.env.DB.prepare(
    "SELECT ImagesOrder FROM Galleries WHERE GalleryTableName = ?"
  ).bind(gallery).first();

  let orderByClause = '';
  if (gallerySettings?.ImagesOrder) {
    switch (gallerySettings.ImagesOrder) {
      case 'name_asc':
        orderByClause = 'ORDER BY name ASC';
        break;
      case 'name_desc':
        orderByClause = 'ORDER BY name DESC';
        break;
      case 'created_asc':
        orderByClause = 'ORDER BY dateCreated ASC';
        break;
      case 'created_desc':
        orderByClause = 'ORDER BY dateCreated DESC';
        break;
      case 'modified_asc':
        orderByClause = 'ORDER BY dateModified ASC';
        break;
      case 'modified_desc':
        orderByClause = 'ORDER BY dateModified DESC';
        break;
      default: // 'original' or any other value
        orderByClause = ''; // No explicit ordering, uses original DB order
    }
  }

  return await c.env.DB.prepare(`SELECT * FROM ${gallery} WHERE approved = TRUE ${orderByClause}`).all();
};

export const deleteGalleryInBothPlaces = async (c, GalleryTableName) => {
  return await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM Galleries WHERE GalleryTableName = ?1").bind(
      GalleryTableName
    ),
    c.env.DB.prepare(`DROP TABLE IF EXISTS ${GalleryTableName}`),
  ]);
};

export const checkIfExistGalleryOnD1 = async (c, GalleryTableName) => {
  return c.env.DB.prepare(
    "SELECT GalleryTableName FROM Galleries WHERE GalleryTableName = ?1"
  )
    .bind(GalleryTableName)
    .all();
};

export const toggleImageApproval = async (c, GalleryTableName, imagePath) => {
  try {
    const response = await c.env.DB.prepare(
      `SELECT approved FROM ${GalleryTableName} WHERE path = ?1`
    )
      .bind(imagePath)
      .all();
    const previousApproval = response.results[0].approved;

    const newApprovedState = !previousApproval;

    await c.env.DB.prepare(
      `UPDATE ${GalleryTableName} SET approved = ?1 WHERE path = ?2`
    )
      .bind(newApprovedState, imagePath)
      .all();

    return newApprovedState;
  } catch (error) {
    console.error("Error toggling image approval:", error.message);
    return false;
  }
};

export const setAsThumbnail = async (c, GalleryTableName, imagePath) => {
  try {
    const {success} = await c.env.DB.prepare(
      `UPDATE Galleries SET CoverImage=?1 WHERE GalleryTableName=?2`
    ).bind(getImagePath(c, imagePath), GalleryTableName).all();
    
    return success;
  } catch (error) {
    console.error("Error setting thumbnail:", error.message);
    return false;
  }
};

export const deleteImageFromGallery = async (
  c,
  GalleryTableName,
  imagePath
) => {
  try {
    const imgRemoval = c.env.DB.prepare(`DELETE FROM ${GalleryTableName} WHERE path = ?1`);
    const thumbUpdate = c.env.DB.prepare(`UPDATE Galleries SET CoverImage="" WHERE CoverImage=?1 AND GalleryTableName=?2`);

    await c.env.DB.batch([
      imgRemoval.bind(imagePath),
      thumbUpdate.bind(getImagePath(c, imagePath), GalleryTableName)
    ]);

    return true;
  } catch (error) {
    console.error("Error deleting image:", error.message);
    return false;
  }
};

export const getThumbnailForGallery = async(c, GalleryTableName) => {
  try {
    const {results} = await c.env.DB.prepare(
      `SELECT CoverImage FROM Galleries WHERE GalleryTableName=?1`
    ).bind(GalleryTableName).run();
    
    if (results == null || results.length == 0)
      return null;

    return getImageWithTransforms(c, results[0].CoverImage, "gallery-thumb");
  } catch (error) {
    console.error("Error getting thumbnail:", error.message);
    return null;
  }
};
