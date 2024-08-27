$(document).ready(function () {
    $('#abreMenu').click(function () {
        $(this).toggleClass('open');
        $(".menu").toggleClass('expanded');
        $(".subMenu").toggleClass('hide');
        $("#logoMenu").toggleClass('img2');
        $("#abreMenu").toggleClass('padrao');
        $("#abreMenu").toggleClass('open2');
        $(".infoUs").toggleClass('hide');
        $(".perfil").toggleClass('open');
        if (document.getElementById("logoMenu").classList.contains("img2")) {
            document.getElementById("logoMenu").src = "img/LogoSofttek.png";
        }
        else
            document.getElementById("logoMenu").src = "img/LogoSofttek2.png";
    });

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

    for (let index = 0; index < mensagens.length; index++) {
        const msg = mensagens[index];
        if (msg.textContent == "...") {
            const novoTexto = "IA indisponível no momento, tente novamente mais tarde!";
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
    }

    document.querySelectorAll(".from-system")[document.querySelectorAll(".from-system").length - 1]
        .scrollIntoView({ behavior: 'smooth', block: 'center' });
}