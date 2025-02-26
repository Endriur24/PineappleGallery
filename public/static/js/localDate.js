const utcTimeInput = document.getElementById("publicationDate");
const localTimeInput = document.getElementById("publicationDateLocal");

function convertUTCToLocal() {
  if (utcTimeInput.value) {
    const date = new Date(utcTimeInput.value);

    // Use ISO format and slice to get YYYY-MM-DDTHH:MM
    const localISOString = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    localTimeInput.value = localISOString;
  }
}

function updateUTCField() {
  if (localTimeInput.value) {
    const localDate = new Date(localTimeInput.value);
    utcTimeInput.value = localDate.toISOString();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  convertUTCToLocal();
  localTimeInput.addEventListener("change", updateUTCField);
});
