'use strict';

const rejestracjaBaton = document.getElementById("registerBtn");
const nickPutin = document.getElementById("nick");
const hasloPutin = document.getElementById("haslo");
const rolaPutin = document.getElementById("rola");

rejestracjaBaton.addEventListener("click", async () => {
    const nick = nickPutin.value;
    const haslo = hasloPutin.value;
    const rola = rolaPutin.value;
  
    if (!nick || !haslo || !rola) {
      alert("Brak wymaganych danych");
      return;
    }
  
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nick, haslo, rola }),
      });
  
      if (!response.ok) {
        const messageErr = await response.json();
        alert("Podczas rejestracji wystąpił błąd. Być może taki użytkownik już istnieje", messageErr.message);
        return;
      }
  
      alert("Rejestracja zakończona sukcesem!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Błąd podczas rejestracji:", error);
    }
  });