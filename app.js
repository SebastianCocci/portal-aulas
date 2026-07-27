let datos = [];

fetch("clases.json")
    .then(r => r.json())
    .then(data => {
        datos = data;
        mostrar(data);
    });

const buscador = document.getElementById("busqueda");

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase();

    const filtrados = datos.filter(item =>
        Object.values(item)
            .join(" ")
            .toLowerCase()
            .includes(texto)
    );

    mostrar(filtrados);

});

function mostrar(lista){

    const div = document.getElementById("resultados");

    div.innerHTML = "";

    lista.forEach(item => {

        div.innerHTML += `
            <div class="card">

                <div class="materia">
                    ${item.MATERIA}
                </div>

                <div class="aula">
                    📍 Aula ${item.AULA}
                </div>

                <p>
                    🏫 ${item.CARRERA}
                </p>

                <p>
                    🕒 ${item.DIA} - ${item.HORARIO}
                </p>

                <p>
                    👨‍🏫 ${item.PROFESOR}
                </p>

                <p>
                    👥 ${item.COMISION}
                </p>

            </div>
        `;
    });

}
