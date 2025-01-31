$(document).ready(function () {
    $('#abreMenu').click(function () {
        $(this).toggleClass('open');
        $(".menu").toggleClass('expanded');
        $(".subMenu").toggleClass('hide');
        $(".subMenu").toggleClass('fade-in-element');
        $("#logoMenu").toggleClass('img2');
        $("#abreMenu").toggleClass('padrao');
        $("#abreMenu").toggleClass('open2');
        $(".infoUs").toggleClass('hide');
        $(".infoUs").toggleClass('fade-in-element');
        $(".perfil").toggleClass('open');

        try {
            $(".chat-container").toggleClass('open');
            $("body").toggleClass('fecha');
        } catch {}

        if (document.getElementById("logoMenu").classList.contains("img2")) {
            document.getElementById("logoMenu").src = "img/LogoSofttek.png";
        } else {
            document.getElementById("logoMenu").src = "img/LogoSofttek2.png";
        }

        // Ensure chat input is visible when menu is closed
        if (!$(".menu").hasClass('expanded')) {
            $(".chat-input").css({
                'position': 'absolute',
                'bottom': '0',
                'padding': '10px',
                'display': 'flex',
                'background-color': '#f4f4f4',
                'border-top': '1px solid #ddd',
                'width': '100%',
                'z-index': '10'
            });
        }
    });

    const response = fetch('/verificaChamado', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = response.then(res => res.json()).then(data => {
        if(data.length > 0){
            document.getElementById("imgChamado").src = "img/editar.png";
            document.getElementById("spanChamado").innerHTML = "Editar Chamado";
        }
    }).catch(err => {
        console.error(err);
    });
});

