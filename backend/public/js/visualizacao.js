const inputs = document.querySelectorAll("input, textarea");
const intervalIds = [];

inputs.forEach((input) => {
    const counter = document.getElementById(`${input.id}-counter`);
    counter.textContent = `${input.value.length}/${input.maxLength}`;

    input.addEventListener("input", () => {
        counter.textContent = `${input.value.length}/${input.maxLength}`;
    });
});

const button = document.querySelector("button");
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
        
        document.getElementById("numChamado").textContent = data.idConversa.toString().padStart(5, '0');
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

        document.getElementById("dataFechamento").textContent = formattedDate;
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

    }).catch(err => {
        console.error(err);
    });

    
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
    }
});