var collapses = document.querySelectorAll(".collapse");
var perguntas = document.querySelectorAll(".faq");
var collapsesProntos = [];
var atual = 0;

$(document).ready(function () {
    for (let i = 0; i < collapses.length; i++) {
        var collapseNovo = new bootstrap.Collapse(collapses[i], {
            toggle: false
        });
        collapsesProntos.push(collapseNovo);
    }

    for (let i = 0; i < perguntas.length; i++) {
        perguntas[i].addEventListener('click', (ev) => {
            collapsesProntos[i].show();
            atual = i;
            fechaCollapses();
        });
    }
});

//Criei função pois o delay da animação não permite fazer a validação em um só looping
function fechaCollapses() {
    var collapsando = false;
    for (let j = 0; j < collapsesProntos.length; j++) {
        if (j != atual){
            if (collapses[j].classList.contains("show"))
                collapsesProntos[j].hide();
            if (collapses[j].classList.contains("collapsing")) 
                collapsando = true;
        }
    }
    if(collapsando)
        setTimeout(fechaCollapses, 500);
}
