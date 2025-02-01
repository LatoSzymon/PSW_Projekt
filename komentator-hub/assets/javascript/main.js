"use strict";

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("sessionId");
  window.location.href = "/login";
});
