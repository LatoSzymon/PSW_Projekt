'use strict';

const loginBaton = document.getElementById('logoguzik');
const nickPutin = document.getElementById('nick');
const hasloPutin = document.getElementById('haslo');

loginBaton.addEventListener('click', async () => {
    const nick = nickPutin.value;
    const haslo = hasloPutin.value;
    if (!nick || !haslo) {
        alert('Brak wymaganych danych');
        return;
    }

    try {
        const response = await fetch("/auth/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nick, haslo })
        });

        if (!response.ok) {
            const messageErr = await response.json();
            alert("Nie można zalogować. Spróbuj ponownie.");
            console.log(messageErr.message);
            return;
        }

        const data = await response.json();
        console.log("Otrzymany sessionId:", data.sessionId);
        document.cookie = `sessionId=${data.sessionId}; path=/`;
        window.location.href = '/main';

    } catch (error) {
        console.error('Błąd logowania:', error);
    }

});