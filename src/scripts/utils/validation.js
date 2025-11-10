export function validateForm(data) {
  let isValid = true;
  document.getElementById("name-error").textContent = "";
  document.getElementById("desc-error").textContent = "";
  document.getElementById("photo-error").textContent = "";
  if (!data.name) {
    document.getElementById("name-error").textContent = "Name is required.";
    isValid = false;
  }
  if (!data.description) {
    document.getElementById("desc-error").textContent =
      "Description is required.";
    isValid = false;
  }
  if (!data.photo) {
    document.getElementById("photo-error").textContent = "Photo is required.";
    isValid = false;
  }
  return isValid;
}
