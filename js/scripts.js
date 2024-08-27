$(document).ready(function(){
	$('#abreMenu').click(function(){
		$(this).toggleClass('open');
		$(".menu").toggleClass('expanded');
		$(".subMenu").toggleClass('hide');
		$("#logoMenu").toggleClass('img2');
        $("#abreMenu").toggleClass('open2');
        if(document.getElementById("logoMenu").classList.contains("img2")){
            document.getElementById("logoMenu").src = "img/LogoSofttek.png";
        }
        else
            document.getElementById("logoMenu").src = "img/LogoSofttek2.png";
	});
});