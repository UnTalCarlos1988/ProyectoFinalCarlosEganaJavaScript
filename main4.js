
document.addEventListener("DOMContentLoaded", async function () {
    const tareaForm = document.getElementById("tareaForm");
    const listaTareas = document.getElementById("listaTareas");
    const totalTareas = document.getElementById("totalTareas");
    const mensajeH2 = document.getElementById("mensaje");
    const paisSelect = document.getElementById("pais");

    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];

    actualizarListaTareas();

    tareaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const titulo = document.getElementById("titulo").value;
            const descripcion = document.getElementById("descripcion").value;
            const hora = document.getElementById("hora").value;
            const countryCode = paisSelect.value;

            if (!titulo || !descripcion || !hora) {
                throw new Error("Todos los campos deben estar llenos");
            }

            const holidays = await obtenerDiasFestivos(countryCode);
            
            const tarea = {
                titulo: titulo,
                descripcion: descripcion,
                hora: hora,
                fechaCreacion: obtenerFechaHoraActual(),
                diasFestivos: holidays,
            };

            tareas.push(tarea);
            localStorage.setItem("tareas", JSON.stringify(tareas));
            tareaForm.reset();
            actualizarListaTareas();
            mostrarCalendario();
        } catch (error) {
            mostrarError(error.message);
        }
    });

    async function obtenerDiasFestivos(countryCode) {
        const year = new Date().getFullYear();
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        const holidays = await response.json();
        return holidays.map(holiday => holiday.date);
    }

    function mostrarError(mensaje) {
        mensajeH2.textContent = mensaje;
        setTimeout(() => {
            mensajeH2.textContent = "";
        }, 5000);
    }

    function obtenerFechaHoraActual() {
        const ahora = new Date();
        const fechaHora = ahora.toLocaleString();
        return fechaHora;
    }

    function actualizarListaTareas() {
        listaTareas.innerHTML = "";

        tareas.forEach(function (tarea, indice) {
            const tareaItem = document.createElement("li");
            tareaItem.innerHTML = `<strong>${tarea.titulo}</strong><br>${tarea.descripcion}<br>Hora: ${tarea.hora}<br>Fecha de Creación: ${tarea.fechaCreacion}`;

            const botonCompletar = document.createElement("button");
            botonCompletar.textContent = "Completar";
            botonCompletar.addEventListener("click", function () {
                try {
                    tareas.splice(indice, 1);
                    localStorage.setItem("tareas", JSON.stringify(tareas));
                    actualizarListaTareas();
                    mostrarCalendario();
                    mensajeH2.textContent = "Tarea completada";
                } catch (error) {
                    mostrarError(error.message);
                }
            });

            tareaItem.appendChild(botonCompletar);
            listaTareas.appendChild(tareaItem);
        });

        totalTareas.textContent = tareas.length;

        if (tareas.length === 0) {
            mensajeH2.textContent = "No hay tareas pendientes";
        } else {
            mensajeH2.textContent = "";
        }
    }

    async function mostrarCalendario() {
        const countryCode = paisSelect.value;
        const fecha = new Date();
        const diasFestivos = await obtenerDiasFestivos(countryCode);

        const calendarioDiv = document.getElementById("calendario");
        calendarioDiv.innerHTML = "";

        for (let i = 1; i <= 31; i++) {
            const dia = new Date(fecha.getFullYear(), fecha.getMonth(), i);
            const esFestivo = diasFestivos.includes(dia.toISOString().split('T')[0]);

            const span = document.createElement("span");
            span.textContent = i;
            if (esFestivo) {
                span.classList.add("festivo");
            }

            calendarioDiv.appendChild(span);
        }
    }
});
