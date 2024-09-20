$(document).ready(function () {
    const loadingIcon = document.getElementById("loading-icon");
    const chatContent = document.querySelector(".chat-history");

    fetch('/geraHistorico', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {        
        const keys = Object.keys(data).reverse();
        keys.forEach((key, index) => {
            const msgNode = `
            <div class="old-chat" uuid="${key}">
                <p>Atendimento n° ${String(keys.length - index).padStart(3, '0')}</p>
                <p>${data[key]}</p>
            </div>
            `;
            chatContent.innerHTML += msgNode;
        });
        chatContent.scrollTo(0, chatContent.scrollHeight);

        document.querySelectorAll(".old-chat").forEach(chat => {
            chat.addEventListener("click", (e) => {
            const uuid = chat.getAttribute("uuid");
            fetch(`/clickHist?content=${encodeURIComponent(uuid)}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json'
                }
            }).then(() =>
                window.location.href = "/");
            });
        });

        // Hide loading icon and show chat history
        loadingIcon.className = '';
        loadingIcon.style.display = 'none';
        chatContent.style.display = 'block';
    })
    .catch(err => {
        console.error(err);
    });
});
