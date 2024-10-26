const inputs = document.querySelectorAll("input, textarea");
const intervalIds = [];

inputs.forEach((input) => {
    const counter = document.getElementById(`${input.id}-counter`);
    counter.textContent = `${input.value.length}/${input.maxLength}`;

    input.addEventListener("input", () => {
        counter.textContent = `${input.value.length}/${input.maxLength}`;
    });
});

const button = document.querySelector("#btnImprimir");
button.addEventListener("click", () => {
    button.classList.add("hide");
    spans = document.querySelectorAll(".char-counter");
    for (let span of spans) {
        span.classList.add("hide");
    }
    const spanInfos = document.querySelectorAll(".spanInfo");
    const selects = document.querySelectorAll("select");

    spanInfos.forEach((span) => {
        span.classList.remove("hide");
    });

    selects.forEach((select) => {
        select.classList.add("hide");
    });

    document.querySelectorAll("button").forEach((button) => {
        button.classList.add("hide");
    });

    document.querySelector("#btnVolta").classList.add("hide");

    window.print();

    spanInfos.forEach((span) => {
        span.classList.add("hide");
    });

    selects.forEach((select) => {
        select.classList.remove("hide");
    });

    button.classList.remove("hide");
    for (let span of spans) {
        span.classList.remove("hide");
    }

    document.querySelectorAll("button").forEach((button) => {
        button.classList.remove("hide");
    });

    document.querySelector("#btnVolta").classList.remove("hide");
});

const btn2 = document.querySelector("#btnSalvar");
btn2.addEventListener("click", () => {
    const dataFechamento = document.getElementById("dataFechamento").textContent;
    const dataAbertura = document.getElementById("dataAbertura").textContent;
    const titulo = document.getElementById("titulo").value;
    const prioridade = document.getElementById("selPrio").selectedIndex;
    const status = document.getElementById("selStatus").selectedIndex;
    const descricao = document.getElementById("descricao").value;
    const solucao = document.getElementById("solucao").value;

    const data = {
        dataFechamento,
        dataAbertura,
        titulo,
        descricao,
        solucao,
        prioridade,
        status
    };

    fetch('/salvaChamado', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.status == 200) {
            alert("Chamado atualizado com sucesso!");
            window.location.href = "/";
        } else {
            alert("Erro ao atualizar chamado!");
        }
    }).catch(err => {
        console.error(err);
    });
});

var selectElement = document.querySelectorAll("select");

selectElement.forEach((select) => {
    select.addEventListener("change", function () {
        document.getElementById(`${this.id}Span`).textContent = this.options[this.selectedIndex].text;
        this.blur();
    });
});

$(document).ready(function () {    
    var loadingElements = document.querySelectorAll(".carregando");

    loadingElements.forEach((element) => {
        let dots = 0;
        const intervalId = setInterval(() => {
            dots = (dots + 1) % 4;
            if (element.tagName === "SPAN") {
                element.textContent = "carregando" + ".".repeat(dots);
            } else {
                element.value = "carregando" + ".".repeat(dots);
            }
        }, 500);
    
        intervalIds.push(intervalId); // Salva o ID do intervalo
    });

    function stopLoading() {
        intervalIds.forEach((id) => clearInterval(id)); // Para cada intervalo, ele é limpo
    };

    const response = fetch('/dados', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = response.then(res => res.json()).then(data => {
        if(data.length == 0) {
            window.location.href = "/";
        }
        
        document.getElementById("numChamado").textContent = data.id.toString().padStart(5, '0');
        const dataAbertura = new Date(parseInt(data.dataInicio));
        const formattedDataAbertura = dataAbertura.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        document.getElementById("dataAbertura").textContent = formattedDataAbertura;
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        stopLoading();

        document.getElementById("dataFechamento").textContent = data.dataFechamento ? data.dataFechamento : formattedDate;
        document.getElementById("titulo").value = data.titulo;
        document.getElementById("descricao").value = data.descricao;
        document.getElementById("solucao").value = data.solucao;
        document.getElementById("selStatus").selectedIndex = data.status;
        document.getElementById("selPrio").selectedIndex = data.prioridade;
        document.getElementById("selStatusSpan").textContent = document.getElementById("selStatus").options[data.status].text;
        document.getElementById("selPrioSpan").textContent = document.getElementById("selPrio").options[data.prioridade].text;

        inputs.forEach((input) => {
            const counter = document.getElementById(`${input.id}-counter`);
            counter.textContent = `${input.value.length}/${input.maxLength}`;

        });

        document.querySelectorAll("button").forEach((button) => {
            button.disabled = false;
        });

        document.querySelector("#btnVolta").classList.remove("off");
        document.querySelector("#btnVolta").href = "/";

    }).catch(err => {
        console.error(err);
    });

});