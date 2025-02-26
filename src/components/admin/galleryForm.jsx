import { raw } from "hono/html";

function toDateInputValue(dateObject) {
  const local = new Date(dateObject);
  local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
}

export const SelectionOptions = (options, selected) => {
  let htmlReturn = "";
  for (const key in options) {
    const value = options[key];
    const isSelected = key == selected ? "selected" : "";
    htmlReturn += `<option value="${key}" ${isSelected}>${value}</option>`;
  }
  return htmlReturn;
};

export const GalleryForm = (props) => {
  const c = props.c;
  const isEditing = props.gallery !== undefined;

  // For sorting the galleries
  const sortVal = props.gallery?.ImagesOrder || "original";
  const sortSelection = {
    original: c.t("images_order_original"),
    name_asc: c.t("images_order_name_asc"),
    name_desc: c.t("images_order_name_desc"),
    created_asc: c.t("images_order_created_asc"),
    created_desc: c.t("images_order_created_desc"),
    modified_asc: c.t("images_order_modified_asc"),
    modified_desc: c.t("images_order_modified_desc"),
  };
  const sortHTML = SelectionOptions(sortSelection, sortVal);
  // Visibility options
  const visVal = props.gallery?.GalleryIsPublic || "FALSE";
  const visibilitySelection = {
    TRUE: c.t("gallery_visibility_public"),
    FALSE: c.t("gallery_visibility_private"),
  };
  const visHTML = SelectionOptions(visibilitySelection, visVal);

  const getValueForProperty = (propName) => {
    if (isEditing) return props.gallery[propName];
    else return "";
  };
  const getAlbumDate = () => {
    if (isEditing) return props.gallery.PartyDate;
    else return toDateInputValue(new Date());
  };
  return (
    <form hx-post="" hx-indicator=".btn-submit" hx-target="#update_result">
      <fieldset>
        <label htmlFor="galleryName">
          <i className="bi bi-folder"></i>
          {c.t("gallery_name_label")}
          <input
            required
            type="text"
            name="GalleryName"
            id="galleryName"
            value={getValueForProperty("GalleryName")}
            placeholder={c.t("gallery_name_placeholder")}
          />
        </label>

        {isEditing ? (
          <div>
            <i className="bi bi-database"></i>
            {c.t("gallery_table_name_label")}: {props.gallery.GalleryTableName}
          </div>
        ) : (
          <label htmlFor="galleryTableName">
            <i className="bi bi-database"></i>
            {c.t("gallery_table_name_label")}
            <input
              required
              type="text"
              name="GalleryTableName"
              id="galleryTableName"
              placeholder={c.t("gallery_table_name_placeholder")}
            />
          </label>
        )}
        <br />
        <label htmlFor="textField">
          <i className="bi bi-text-paragraph"></i>
          {c.t("description_label")}
          <textarea
            name="TextField"
            id="textField"
            rows="3"
            placeholder={c.t("description_placeholder")}
          >
            {getValueForProperty("TextField")}
          </textarea>
        </label>
      </fieldset>
      <fieldset class="grid">
        <label htmlFor="location">
          <i className="bi bi-geo-alt"></i>
          {c.t("location_label")}
          <input
            type="text"
            name="Location"
            id="location"
            value={getValueForProperty("Location")}
            placeholder={c.t("location_placeholder")}
          />
        </label>

        <label htmlFor="tags">
          <i className="bi bi-tags"></i>
          {c.t("tags_label")}
          <input
            type="text"
            name="Tags"
            id="tags"
            value={getValueForProperty("Tags")}
            placeholder={c.t("tags_placeholder")}
          />
        </label>
      </fieldset>
      <fieldset class="grid">
        <label htmlFor="partyDate">
          <i className="bi bi-calendar-event"></i>
          {c.t("party_date_label")}
          <input
            required
            type="date"
            name="PartyDate"
            id="partyDate"
            value={getAlbumDate()}
          />
        </label>

        <label htmlFor="publicationDateLocal">
          <i className="bi bi-calendar2-check"></i>
          {c.t("publication_date_label")}
          <input
            type="datetime-local"
            name="PublicationDateLocal"
            id="publicationDateLocal"
            value=""
          />
          <input
            type="hidden"
            name="PublicationDate"
            id="publicationDate"
            value={getValueForProperty("PublicationDate")}
          />
        </label>
      </fieldset>
      <fieldset class="grid">
        <label htmlFor="galleryIsPublic">
          <i className="bi bi-eye"></i>
          {c.t("gallery_visibility_label")}
          <select name="GalleryIsPublic" id="galleryIsPublic">
            {raw(visHTML)}
          </select>
        </label>

        <label htmlFor="password">
          <i className="bi bi-key"></i>
          {c.t("password_label")}
          <input
            type="password"
            name="Password"
            id="password"
            value={getValueForProperty("Password")}
            placeholder={c.t("password_placeholder")}
          />
        </label>
      </fieldset>
      <fieldset class="grid">
        <label htmlFor="reviewers">
          <i className="bi bi-people"></i>
          {c.t("reviewers_label")}
          <input
            type="text"
            name="Reviewers"
            id="reviewers"
            value={getValueForProperty("Reviewers")}
            placeholder={c.t("reviewers_placeholder")}
          />
        </label>

        <label htmlFor="imagesOrder">
          <i className="bi bi-sort-alpha-down"></i>
          {c.t("images_order_label")}
          <select name="ImagesOrder" id="imagesOrder">
            {raw(sortHTML)}
          </select>
        </label>
      </fieldset>
      <button type="submit" className="btn btn-submit">
        <i className="bi bi-save"></i>
        {c.t("save_gallery_button")}
      </button>

      <div id="update_result"></div>
      <script type="module" src="/static/js/localDate.js"></script>
      {isEditing ? (
        <script type="module" src="/static/js/singlegallery.js"></script>
      ) : (
        <script type="module" src="/static/js/newgallery.js"></script>
      )}
    </form>
  );
};
