let datos = [];
let datosFecha = [];
let datosCarreraDia = [];
let modo = "clases";
let timeoutBusqueda = null;

const buscador = document.getElementById("busqueda");
const resultados = document.getElementById("resultados");
const filtroCarrera = document.getElementById("filtroCarrera");
const filtroDia = document.getElementById("filtroDia");
const filtroFecha = document.getElementById("filtroFecha");
const contenedorCursado = document.getElementById("contenedorFiltrosCursado");
const contenedorExamenes = document.getElementById("contenedorFiltrosExamenes");
const btnClases = document.getElementById("btnClases");
const btnExamenes = document.getElementById("btnExamenes");

// Cache de normalización de textos para mejorar el rendimiento de la búsqueda
const mapaNormalizado = new WeakMap();

function normalizar(texto) {
    const stringTexto = String(texto || "");
    if (!stringTexto) return "";
    return stringTexto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function obtenerTextoNormalizado(item) {
    if (!mapaNormalizado.has(item)) {
        const textoCompuesto = `${item.MATERIA || ""} ${item.PROFESOR || item["PRESIDENTE MESA"] || ""} ${item.COMISION || ""}`;
        mapaNormalizado.set(item, normalizar(textoCompuesto));
    }
    return mapaNormalizado.get(item);
}

async function cargarDatos() {
    resultados.innerHTML = `
        <div class="sin-resultados">
            Cargando información...
        </div>
    `;

    const archivo = modo === "clases" ? "clases.json" : "examenes.json";

    try {
        const response = await fetch(archivo);
        if (!response.ok) throw new Error("Error al obtener datos");
        
        datos = await response.json();

        datos.sort((a, b) =>
            String(a.MATERIA || "").localeCompare(String(b.MATERIA || ""), "es", { sensitivity: "base" })
        );

        if (modo === "clases") {
            inicializarClases();
        } else {
            inicializarExamenes();
        }
    } catch (error) {
        resultados.innerHTML = `
            <div class="sin-resultados">
                No se pudieron cargar los datos. Verifique la conexión o los archivos JSON.
            </div>
        `;
    }
}

function inicializarClases() {
    if (contenedorCursado) contenedorCursado.style.display = "block";
    if (contenedorExamenes) contenedorExamenes.style.display = "none";

    filtroCarrera.style.display = "block";
    filtroDia.style.display = "block";
    filtroFecha.style.display = "none";

    // Extraer carreras únicas
    const carreras = [
        ...new Set(
            datos
                .map(item => item.CARRERA)
                .filter(Boolean)
        )
    ];

    carreras.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

    let htmlCarreras = '<option value="">1. Seleccione una carrera</option>';
    carreras.forEach(carrera => {
        htmlCarreras += `<option value="${carrera}">${carrera}</option>`;
    });

    filtroCarrera.innerHTML = htmlCarreras;
    filtroCarrera.value = "";

    filtroDia.innerHTML = '<option value="">2. Seleccione un día</option>';
    filtroDia.value = "";
    filtroDia.disabled = true;

    buscador.value = "";
    buscador.disabled = true;

    datosCarreraDia = [];

    resultados.innerHTML = `
        <div class="sin-resultados">
            Seleccione una carrera y un día para visualizar las clases.
        </div>
    `;
}

function actualizarDias() {
    const carreraSeleccionada = filtroCarrera.value;

    filtroDia.innerHTML = '<option value="">2. Seleccione un día</option>';
    filtroDia.value = "";
    buscador.value = "";
    buscador.disabled = true;
    datosCarreraDia = [];

    if (!carreraSeleccionada) {
        filtroDia.disabled = true;
        resultados.innerHTML = `
            <div class="sin-resultados">
                Seleccione una carrera y un día para visualizar las clases.
            </div>
        `;
        return;
    }

    const ordenDias = ["Lunes", "Martes", "Miércoles", "Miercoles", "Jueves", "Viernes", "Sábado", "Sabado"];

    const diasDisponibles = [
        ...new Set(
            datos
                .filter(item => item.CARRERA === carreraSeleccionada)
                .map(item => item.DIA)
                .filter(Boolean)
        )
    ];

    diasDisponibles.sort((a, b) => {
        const idxA = ordenDias.findIndex(d => normalizar(d) === normalizar(a));
        const idxB = ordenDias.findIndex(d => normalizar(d) === normalizar(b));
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.localeCompare(b, "es", { sensitivity: "base" });
    });

    let htmlDias = '<option value="">2. Seleccione un día</option>';
    diasDisponibles.forEach(dia => {
        htmlDias += `<option value="${dia}">${dia}</option>`;
    });

    filtroDia.innerHTML = htmlDias;
    filtroDia.disabled = false;

    resultados.innerHTML = `
        <div class="sin-resultados">
            Seleccione un día para continuar.
        </div>
    `;
}

function inicializarExamenes() {
    if (contenedorCursado) contenedorCursado.style.display = "none";
    if (contenedorExamenes) contenedorExamenes.style.display = "block";

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
        if (pa.length === 3 && pb.length === 3) {
            return new Date(pa[2], pa[1] - 1, pa[0]) - new Date(pb[2], pb[1] - 1, pb[0]);
        }
        return a.localeCompare(b);
    });

    let htmlFechas = '<option value="">Seleccione una fecha de examen</option>';
    fechas.forEach(fecha => {
        htmlFechas += `<option value="${fecha}">${fecha}</option>`;
    });

    filtroFecha.innerHTML = htmlFechas;
    filtroFecha.value = "";

    buscador.value = "";
    buscador.disabled = true;

    datosFecha = [];

    resultados.innerHTML = `
        <div class="sin-resultados">
            Seleccione una fecha para visualizar los exámenes.
        </div>
    `;
}

function aplicarFiltros() {
    if (modo === "clases") {
        const carrera = filtroCarrera.value;
        const dia = filtroDia.value;

        if (!carrera || !dia) {
            resultados.innerHTML = `
                <div class="sin-resultados">
                    Seleccione una carrera y un día para visualizar las clases.
                </div>
            `;
            buscador.disabled = true;
            return;
        }

        buscador.disabled = false;

        datosCarreraDia = datos.filter(
            item => item.CARRERA === carrera && item.DIA === dia
        );

        let filtrados = datosCarreraDia;
        const texto = normalizar(buscador.value);

        if (texto.length >= 2) {
            filtrados = filtrados.filter(item =>
                obtenerTextoNormalizado(item).includes(texto)
            );
        }

        mostrar(filtrados);

    } else {
        const fecha = filtroFecha.value;

        if (!fecha) {
            resultados.innerHTML = `
                <div class="sin-resultados">
                    Seleccione una fecha para visualizar los exámenes.
                </div>
            `;
            buscador.disabled = true;
            return;
        }

        buscador.disabled = false;

        datosFecha = datos.filter(item => item.DIA === fecha);

        let filtrados = datosFecha;
        const texto = normalizar(buscador.value);

        if (texto.length >= 2) {
            filtrados = filtrados.filter(item =>
                obtenerTextoNormalizado(item).includes(texto)
            );
        }

        mostrar(filtrados);
    }
}

function mostrar(lista) {
    if (!lista || lista.length === 0) {
        resultados.innerHTML = `
            <div class="sin-resultados">
                No se encontraron materias con los datos o búsqueda seleccionada.
            </div>
        `;
        return;
    }

    let html = "";

    if (modo === "clases") {
        html = lista.map(item => `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${item.MATERIA || "Sin Nombre de Materia"}</h3>
                    <span class="card-badge">Aula: ${item.AULA || "A definir"}</span>
                </div>
                <div class="card-body">
                    <p><strong>Horario:</strong> ${item.HORARIO || "-"}</p>
                    <p><strong>Comisión:</strong> ${item.COMISION || "-"}</p>
                    <p><strong>Profesor:</strong> ${item.PROFESOR || "No asignado"}</p>
                    <p><strong>Modalidad:</strong> ${item.MODALIDAD || "Presencial"}</p>
                </div>
            </div>
        `).join("");
    } else {
        html = lista.map(item => {
            const tribunal = [item["PRESIDENTE MESA"], item["VOCAL 1"], item["VOCAL 2"]]
                .filter(Boolean)
                .join(" / ");

            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">${item.MATERIA || "Sin Nombre de Materia"}</h3>
                        <span class="card-badge">Aula: ${item.AULA || "A definir"}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>Hora:</strong> ${item.HORA || "-"} hs</p>
                        <p><strong>Campus / Sede:</strong> ${item.CAMPUS || "-"}</p>
                        <p><strong>Carrera / Año:</strong> ${item.CARRERA || "-"} (${item["AÑO"] || "-"})</p>
                        <p><strong>Tribunal:</strong> ${tribunal || "No especificado"}</p>
                        <p><strong>Modalidad:</strong> ${item["virtual / presencial"] || "PRESENCIAL"}</p>
                        ${item.observaciones ? `<p class="observaciones"><strong>Obs:</strong> ${item.observaciones}</p>` : ""}
                    </div>
                </div>
            `;
        }).join("");
    }

    resultados.innerHTML = html;
}

// Event Listeners
filtroCarrera.addEventListener("change", () => {
    actualizarDias();
});

filtroDia.addEventListener("change", () => {
    buscador.value = "";
    aplicarFiltros();
});

filtroFecha.addEventListener("change", () => {
    buscador.value = "";
    aplicarFiltros();
});

buscador.addEventListener("input", () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
        aplicarFiltros();
    }, 250);
});

btnClases.addEventListener("click", () => {
    if (modo === "clases") return;
    modo = "clases";

    btnClases.classList.add("activo");
    btnExamenes.classList.remove("activo");

    cargarDatos();
});

btnExamenes.addEventListener("click", () => {
    if (modo === "examenes") return;
    modo = "examenes";

    btnExamenes.classList.add("activo");
    btnClases.classList.remove("activo");

    cargarDatos();
});

// Carga inicial al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
});