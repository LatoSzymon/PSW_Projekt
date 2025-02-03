"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
          try {
              const response = await fetch("/auth/logout", {
                  method: "POST",
                  credentials: "include",
              });
              if (response.ok) {
                  window.location.href = "/login";
              } else {
                  console.error("Błąd podczas wylogowania:", response.statusText);
                  alert("Nie udało się wylogować. Spróbuj ponownie.");
              }
          } catch (error) {
              console.error("Błąd sieci podczas wylogowania:", error);
              alert("Nie udało się wylogować. Spróbuj ponownie.");
          }
      });
  }
});

