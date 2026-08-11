let datos = [];
let datosFecha = [];
let datosCarreraDia = [];
let modo = "clases";
let timeoutBusqueda;

const buscador = document.getElementById("busqueda");
const resultados = document.getElementById("resultados");

const filtroCarrera =
    document.getElementById("filtroCarrera");

const filtroDia =
    document.getElementById("filtroDia");

const filtroFecha =
    document.getElementById("filtroFecha");

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

    if (modo === "clases") {

        inicializarClases();

    } else {

        inicializarExamenes();

    }

}

function inicializarClases() {

    filtroCarrera.style.display = "block";
    filtroDia.style.display = "block";

    filtroFecha.style.display = "none";

    const carreras = [
        ...new Set(
            datos
                .map(item => item.CARRERA)
                .filter(Boolean)
        )
    ];

    carreras.sort();

    filtroCarrera.innerHTML =
        '<option value="">Seleccione una carrera</option>';

    carreras.forEach(carrera => {

        filtroCarrera.innerHTML += `
            <option value="${carrera}">
                ${carrera}
            </option>
        `;

    });

    filtroDia.innerHTML =
        '<option value="">Seleccione un día</option>';

    resultados.innerHTML = `
        <div class="sin-resultados">
            Seleccione una carrera y un día para visualizar las clases.
        </div>
    `;

}

function inicializarExamenes() {

    filtroCarrera.style.display = "none";
    filtroDia.style.display = "none";

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

    resultados.innerHTML = `
        <div class="sin-resultados">
            Seleccione una fecha para visualizar los exámenes.
        </div>
    `;

}

function aplicarFiltros() {

    if (modo === "clases") {

        if (
            filtroCarrera.value === "" ||
            filtroDia.value === ""
        ) {

            resultados.innerHTML = `
                <div class="sin-resultados">
                    Seleccione una carrera y un día para visualizar las clases.
                </div>
            `;

            return;

        }

        let filtrados =
            [...datosCarreraDia];

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

    } else {

        if (filtroFecha.value === "") {

            resultados.innerHTML = `
                <div class="sin-resultados">
                    Seleccione una fecha para visualizar los exámenes.
                </div>
            `;

            return;

        }

        let filtrados =
            [...datosFecha];

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
        filtroCarrera.value = "";
        filtroDia.value = "";

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
 
