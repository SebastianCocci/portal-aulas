let datos = [];
let modo = "clases";

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
            '<option value="">Todas las fechas</option>';

        fechas.forEach(fecha => {

            filtroFecha.innerHTML += `
                <option value="${fecha}">
                    ${fecha}
                </option>
            `;

        });

    } else {

        filtroFecha.style.display = "none";
        filtroFecha.value = "";

    }

    mostrar(datos.slice(0, 15));

}

function aplicarFiltros() {

    const texto =
        normalizar(buscador.value);

    const fecha =
        filtroFecha.value;

    let filtrados = [...datos];

    if (
        modo === "examenes" &&
        fecha !== ""
    ) {

        filtrados = filtrados.filter(
            item => item.DIA === fecha
        );

    }

    if (texto.length >= 3) {

        filtrados = filtrados.filter(
            item =>
                normalizar(item.MATERIA)
                    .includes(texto)
        );

    }

    if (
        texto === "" &&
        fecha === ""
    ) {

        mostrar(filtrados.slice(0, 15));

    } else {

        mostrar(filtrados);

    }

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

buscador.addEventListener(
    "input",
    aplicarFiltros
);

filtroFecha.addEventListener(
    "change",
    aplicarFiltros
);

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
                        ${
                            esVirtual
                                ? "VIRTUAL"
                                : (item.AULA || "-")
                        }
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
