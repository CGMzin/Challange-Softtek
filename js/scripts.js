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

        try{
            $(".chat-input").toggleClass('open');            
            $("body").toggleClass('fecha');            
        }
        catch{}

        if (document.getElementById("logoMenu").classList.contains("img2")) {
            document.getElementById("logoMenu").src = "img/LogoSofttek.png";
        }
        else
            document.getElementById("logoMenu").src = "img/LogoSofttek2.png";
    });   
});

