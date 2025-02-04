'use strict';

const pobierzNotatki = async () => {
  try {
    const response = await fetch('/notes');
    const notatki = await response.json();
    const listaNotatek = document.getElementById('lista-notatek');
    listaNotatek.innerHTML = '';

    const sessionRes = await fetch('/auth/session');
    const sessionData = await sessionRes.json();
    const sessionId = sessionData.sessionId;

    const userRes = await fetch(`/auth/user?sessionId=${sessionId}`);
    const userData = await userRes.json();
    const zalogowanyNick = userData.nick;
    const zalogowanyRola = userData.rola;

    notatki.forEach(el => {
      const li = document.createElement('li');
      li.textContent = `${el.content} (Autor: ${el.author}, Data: ${new Date(el.created_at).toLocaleString()})`;

      if (zalogowanyRola === 'admin' || el.author === zalogowanyNick) {
        const edytujBaton = document.createElement('button');
        edytujBaton.textContent = 'Edytuj';
        edytujBaton.onclick = () => edytujNotke(el.id, el.content);
        li.appendChild(edytujBaton);

        const usunBaton = document.createElement('button');
        usunBaton.textContent = 'Usuń';
        usunBaton.onclick = () => usunNotatke(el.id);
        li.appendChild(usunBaton);
      }

      listaNotatek.appendChild(li);
    });
  } catch (error) {
    console.error('Błąd podczas pobierania notatek:', error);
  }
};


const dodajNotke = async () => {
  try {
    const contentElement = document.getElementById('tresc-nowej-notki');
    if (!contentElement) throw new Error('Element textarea nie istnieje.');
    const content = contentElement.value;

    if (!content.trim()) {
      alert('Treść notatki nie może być pusta!');
      return;
    }

    await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    contentElement.value = '';
    pobierzNotatki();
  } catch (error) {
    console.error('Błąd podczas dodawania notatki:', error);
  }
};

const usunNotatke = async (id) => {
  try {
    const response = await fetch(`/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Błąd: ${errorData.message}`);
      return;
    }

    alert("Notatka została usunięta!");
    pobierzNotatki();
  } catch (error) {
    console.error("Błąd podczas usuwania notatki:", error);
  }
};


const szukajNotki = async () => {
  try {
    const query = document.getElementById('search').value.trim();
    
    let response;
    if (query === '') {
      response = await fetch('/notes');
    } else {
      response = await fetch(`/notes/search?query=${query}`);
    }

    const notatki = await response.json();
    const listaNotatek = document.getElementById('lista-notatek');
    listaNotatek.innerHTML = '';

    if (notatki.length === 0) {
      alert('Nie znaleziono notatek!');
      return;
    }

    notatki.forEach(el => {
      const li = document.createElement('li');
      li.textContent = `${el.content} (Autor: ${el.author}, Data: ${new Date(el.created_at).toLocaleString()})`;

      const edytujBaton = document.createElement('button');
      edytujBaton.textContent = 'Edytuj';
      edytujBaton.onclick = () => edytujNotke(el.id, el.content);
      li.appendChild(edytujBaton);

      const usunBaton = document.createElement('button');
      usunBaton.textContent = 'Usuń';
      usunBaton.onclick = () => usunNotatke(el.id);
      li.appendChild(usunBaton);

      listaNotatek.appendChild(li);
    });

  } catch (error) {
    console.error('Błąd podczas wyszukiwania notatek:', error);
  }
};


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

const edytujNotke = async (id, aktualnaTresc) => {
  const nowaTresc = prompt("Edytuj notatkę:", aktualnaTresc);
  if (!nowaTresc || nowaTresc.trim() === "") {
    alert("Treść nie może być pusta!");
    return;
  }

  try {
    const response = await fetch(`/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: nowaTresc }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Błąd: ${errorData.message}`);
      return;
    }

    alert("Notatka została zaktualizowana!");
    pobierzNotatki();
  } catch (error) {
    console.error("Błąd podczas edytowania notatki:", error);
  }
};



document.addEventListener('DOMContentLoaded', pobierzNotatki);
