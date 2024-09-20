$(document).ready(function () {
    $("#btnEnviar").click(function () {
        enviaTexto();
    });

    document.getElementById('inputTxt').addEventListener("keydown", (ev) => {
        if (ev.keyCode == 13) {
            enviaTexto();
        }
    });
});

function enviaTexto() {
    var msg = document.getElementById("inputTxt").value;
    if (msg == "")
        return

    document.getElementById("inputTxt").value = "";
    var msgNode = '<div class="chat-message from-user">' +
        "<p>" + msg + "</p>" +
        '</div>' +
        '<div class="chat-message from-system">' +
        "<p>...</p>" +
        '</div>';


    document.getElementById("inputTxt").disabled = true;
    document.querySelector(".chat-content").innerHTML += msgNode;
    document.querySelectorAll(".chat-message")[document.querySelectorAll(".chat-message").length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(mudaTexto, 2000);
}

function mudaTexto() {
    const mensagens = document.querySelectorAll(".from-system p");
    const lastMessageFromUser = document.querySelectorAll(".from-user p")[document.querySelectorAll(".from-user p").length - 1];
    console.log('lastMessageFromUser', lastMessageFromUser.textContent);

    for (let index = 0; index < mensagens.length; index++) {
        const msg = mensagens[index];
        if (msg.textContent == "...") {
            let novoTexto = "";
            const response = fetch('/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: lastMessageFromUser.textContent })
            });
            const data = response.then(res => res.json()).then(data => {
                console.log(data)
                novoTexto = data.text; // Assuming the response contains a 'text' field
                let i = 0;

                msg.textContent = ""; // Limpa o conteúdo para começar a digitação

                function digitarLetraPorLetra() {
                    if (i < novoTexto.length) {
                        msg.textContent += novoTexto.charAt(i);
                        i++;
                        setTimeout(digitarLetraPorLetra, 20); // Tempo entre cada letra
                    } else {
                        document.getElementById("inputTxt").disabled = false;
                        document.getElementById("inputTxt").focus();
                    }
                }

                digitarLetraPorLetra(); // Começa a digitar o texto letra por letra
                return;
            }
            ).catch(err => {
                console.error(err);
                msg.textContent = "Desculpe, não consegui entender o que você disse.";
                document.getElementById("inputTxt").disabled = false;
                document.getElementById("inputTxt").focus();
            });
        }
    }

    document.querySelectorAll(".from-system")[document.querySelectorAll(".from-system").length - 1]
        .scrollIntoView({ behavior: 'smooth', block: 'center' });
}

$(document).ready(function () {
    const response = fetch('/messages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = response.then(res => res.json()).then(data => {
        const chatContent = document.querySelector(".chat-content");
        if(data.length == 0) {
            const msgNode = '<div class="chat-message from-system">' +
                "<p>Olá, sou o assistente virtual da SoftTek, como posso te ajudar?</p>" +
                '</div>';
            chatContent.innerHTML += msgNode;
        }
        data.forEach(msg => {
            const msgNode = '<div class="chat-message from-' + msg.senderType + '">' +
                "<p>" + msg.content + "</p>" +
                '</div>';
            chatContent.innerHTML += msgNode;
        });
        chatContent.scrollTo(0, chatContent.scrollHeight);
    }).catch(err => {
        console.error(err);
    });
});