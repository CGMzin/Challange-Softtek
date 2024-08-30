$(document).ready(function () {
    var collapses = document.querySelectorAll(".collapse");
    var perguntas = document.querySelectorAll(".faq");

    var collapsesProntos = [];

    for (let i = 0; i < collapses.length; i++) {
        var collapseNovo = new bootstrap.Collapse(collapses[i], {
            toggle: false
        });   
        collapsesProntos.push(collapseNovo);
    }

    for (let i = 0; i < perguntas.length; i++) {
        perguntas[i].addEventListener('click', (ev) => {
            for (let j = 0; j < collapsesProntos.length; j++) {
                if(i == j)
                    collapsesProntos[j].toggle();
                else
                    collapsesProntos[j].hide();
            }
        });
    }
});

