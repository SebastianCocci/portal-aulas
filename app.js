let datos = [];

fetch("clases.json")
    .then(response => response.json())
    .then(data => {
        datos = data;
        mostrar([]);
    });

const buscador = document.getElementById("busqueda");

buscador.addEventListener("input", () => {

    const texto = buscador.value.trim().toLowerCase();

    if(texto.length < 3){
        mostrar([]);
        return;
    }

    const filtrados = datos.filter(item =>
        item.MATERIA &&
        item.MATERIA.toLowerCase().includes(texto)
    );

    mostrar(filtrados);

});

function mostrar(lista){

    const contenedor = document.getElementById("resultados");

    if(lista.length === 0){

        contenedor.innerHTML = `
            <div class="sin-resultados">
                Escribí al menos 3 letras de una materia
            </div>
        `;

        return;
    }

    contenedor.innerHTML = "";

    lista.forEach(item => {

        contenedor.innerHTML += `
            <div class="card">

                <div class="materia">
                    ${item.MATERIA}
                </div>

                <div class="aula-label">
                    AULA
                </div>

                <div class="aula">
                    ${item.AULA}
                </div>

                <div class="info">
                    📅 ${item.DIA}
                </div>

                <div class="info">
                    🕒 ${item.HORARIO}
                </div>

                <div class="info">
                    👨‍🏫 ${item.PROFESOR}
                </div>

                <div class="info">
                    👥 ${item.COMISION}
                </div>

                <div class="info">
                    🏫 ${item.CARRERA}
                </div>

            </div>
        `;
    });

}
