'use strict';

const pobierzNotatki = async () => {
    const response = await fetch('/notes');
    const notatki = await response.json();
    const listaNotatek = document.getElementById('lista-notatek');
    listaNotatek.innerHTML = '';
  
    notatki.forEach(el => {
      const li = document.createElement('li');
      li.textContent = `${el.content} (Autor: ${el.author}, Data: ${new Date(el.created_at).toLocaleString()})`;
  
      if (el.is_admin) {
        const usunBaton = document.createElement('button');
        usunBaton.textContent = 'Usuń';
        usunBaton.onclick = () => usunNotatke(el.id);
        li.appendChild(usunBaton);
      }
  
      listaNotatek.appendChild(li);
    });
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
    contentElement.value = ''; // Czyszczenie pola tekstowego
    pobierzNotatki();
  } catch (error) {
    console.error('Błąd podczas dodawania notatki:', error);
  }
};

const usunNotatke = async (id) => {
  try {
    await fetch(`/notes/${id}`, { method: 'DELETE' });
    pobierzNotatki();
  } catch (error) {
    console.error('Błąd podczas usuwania notatki:', error);
  }
};

const szukajNotki = async () => {
  try {
    const query = document.getElementById('search').value;
    const response = await fetch(`/notes/search?query=${query}`);
    const notatki = await response.json();
    if (query === '') {
        pobierzNotatki();
    }
    if (notatki.length === 0) {
        alert('Nie znaleziono notatek!');
        return;
      }
    const listaNotatek = document.getElementById('lista-notatek');
    listaNotatek.innerHTML = '';
    notatki.forEach(el => {
        const li = document.createElement('li');
        li.textContent = `${el.content} (Autor: ${el.author}, Data: ${new Date(el.created_at).toLocaleString()})`;
    
        if (el.is_admin) {
          const usunBaton = document.createElement('button');
          usunBaton.textContent = 'Usuń';
          usunBaton.onclick = () => usunNotatke(el.id);
          li.appendChild(usunBaton);
        }
    
        listaNotatek.appendChild(li);
    });


    console.log(notatki); // Możesz wyświetlić wyniki w konsoli lub na stronie
  } catch (error) {
    console.error('Błąd podczas wyszukiwania notatek:', error);
  }
};

// Automatyczne załadowanie notatek po załadowaniu strony
document.addEventListener('DOMContentLoaded', pobierzNotatki);
