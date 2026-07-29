let datos = [];
let datosFecha = [];
let modo = "clases";
let timeoutBusqueda;

const buscador = document.getElementById("busqueda");
const resultados = document.getElementById("resultados");
const filtroFecha = document.getElementById("filtroFecha");

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

async function cargarDatos() {

    const archivo =
        modo === "clases"
            ? "clases.json"
            : "examenes.json";

    const response = await fetch(archivo);

    datos = await response.json();

    datos.sort((a, b) =>
        String(a.MATERIA || "")
            .localeCompare(String(b.MATERIA || ""))
    );

    if (modo === "examenes") {

        filtroFecha.style.display = "block";

        const fechas = [
            ...new Set(
                datos
                    .map(item => item.DIA)
                    .filter(Boolean)
            )
        ];

        fechas.sort((a, b) => {

            const pa = a.split("/");
            const pb = b.split("/");

            return new Date(
                pa[2],
                pa[1] - 1,
                pa[0]
            ) - new Date(
                pb[2],
                pb[1] - 1,
                pb[0]
            );

        });

        filtroFecha.innerHTML =
            '<option value="">Seleccione una fecha de examen</option>';

        fechas.forEach(fecha => {

            filtroFecha.innerHTML += `
                <option value="${fecha}">
                    ${fecha}
                </option>
            `;

        });

        datosFecha = [];

        resultados.innerHTML = `
            <div class="sin-resultados">
                Seleccione una fecha para visualizar los exámenes.
            </div>
        `;

    } else {

        filtroFecha.style.display = "none";
        filtroFecha.value = "";
        datosFecha = [];

        mostrar(datos.slice(0, 15));

    }

}

function aplicarFiltros() {

    if (
        modo === "examenes" &&
        filtroFecha.value === ""
    ) {

        resultados.innerHTML = `
            <div class="sin-resultados">
                Seleccione una fecha para visualizar los exámenes.
            </div>
        `;

        return;
    }

    let filtrados =
        modo === "examenes"
            ? [...datosFecha]
            : [...datos];

    const texto =
        normalizar(buscador.value);

    if (texto.length >= 3) {

        filtrados = filtrados.filter(
            item =>
                normalizar(item.MATERIA)
                    .includes(texto)
        );

    }

    mostrar(filtrados);

}

document
    .getElementById("btnClases")
    .addEventListener("click", () => {

        modo = "clases";

        document
            .getElementById("btnClases")
            .classList.add("activo");

        document
            .getElementById("btnExamenes")
            .classList.remove("activo");

        buscador.value = "";
        filtroFecha.value = "";

        cargarDatos();

    });

document
    .getElementById("btnExamenes")
    .addEventListener("click", () => {

        modo = "examenes";

        document
            .getElementById("btnExamenes")
            .classList.add("activo");

        document
            .getElementById("btnClases")
            .classList.remove("activo");

        buscador.value = "";
        filtroFecha.value = "";

        cargarDatos();

    });

buscador.addEventListener("input", () => {

    clearTimeout(timeoutBusqueda);

    timeoutBusqueda = setTimeout(() => {

        aplicarFiltros();

    }, 500);

});

filtroFecha.addEventListener("change", () => {

    if (filtroFecha.value === "") {

        datosFecha = [];

        resultados.innerHTML = `
            <div class="sin-resultados">
                Seleccione una fecha para visualizar los exámenes.
            </div>
        `;

        return;
    }

    datosFecha = datos.filter(
        item =>
            item.DIA === filtroFecha.value
    );

    aplicarFiltros();

});

function mostrar(lista) {

    if (lista.length === 0) {

        resultados.innerHTML = `
            <div class="sin-resultados">
                No se encontraron materias
            </div>
        `;

        return;
    }

    resultados.innerHTML = "";

    lista.forEach(item => {

        if (modo === "clases") {

            resultados.innerHTML += `
                <div class="card">

                    <div class="materia">
                        ${item.MATERIA || "-"}
                    </div>

                    <div class="aula-label">
                        Aula
                    </div>

                    <div class="aula">
                        ${item.AULA || "-"}
                    </div>

                    <div class="info">
                        <strong>Día:</strong> ${item.DIA || "-"}
                    </div>

                    <div class="info">
                        <strong>Horario:</strong> ${item.HORARIO || "-"}
                    </div>

                    <div class="info">
                        <strong>Docente:</strong> ${item.PROFESOR || "-"}
                    </div>

                    <div class="info">
                        <strong>Comisión:</strong> ${item.COMISION || "-"}
                    </div>

                    <div class="info">
                        <strong>Carrera:</strong> ${item.CARRERA || "-"}
                    </div>

                </div>
            `;

        } else {

            const esVirtual =
                String(item["virtual / presencial"] || "")
                    .toUpperCase()
                    .includes("VIRTUAL");

            resultados.innerHTML += `
                <div class="card">

                    <div class="materia">
                        ${item.MATERIA || "-"}
                    </div>

                    <div class="aula-label">
                        ${esVirtual ? "Modalidad" : "Aula"}
                    </div>

                    <div class="aula">
                        ${esVirtual
                            ? "VIRTUAL"
                            : (item.AULA || "-")}
                    </div>

                    <div class="info">
                        <strong>Fecha:</strong> ${item.DIA || "-"}
                    </div>

                    <div class="info">
                        <strong>Hora:</strong> ${item.HORA || "-"}
                    </div>

                    <div class="info">
                        <strong>Presidente:</strong> ${item["PRESIDENTE MESA"] || "-"}
                    </div>

                    <div class="info">
                        <strong>Vocal 1:</strong> ${item["VOCAL 1"] || "-"}
                    </div>

                    ${
                        item["VOCAL 2"]
                            ? `
                            <div class="info">
                                <strong>Vocal 2:</strong> ${item["VOCAL 2"]}
                            </div>
                            `
                            : ""
                    }

                    <div class="info">
                        <strong>Campus:</strong> ${item.CAMPUS || "-"}
                    </div>

                    ${
                        item.observaciones
                            ? `
                            <div class="info">
                                <strong>Observaciones:</strong> ${item.observaciones}
                            </div>
                            `
                            : ""
                    }

                </div>
            `;

        }

    });

}

cargarDatos();
