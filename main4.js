$(document).ready(async function () {
    const tareaForm = $("#tareaForm");
    const listaTareas = $("#listaTareas");
    const totalTareas = $("#totalTareas");
    const mensajeH2 = $("#mensaje");
    const paisSelect = $("#pais");
    const festivosLista = $("#festivosLista");

    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];

    async function obtenerDiasFestivos(year, month, countryCode) {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        const holidays = await response.json();

        const festivosMes = holidays.filter(holiday => {
            const date = new Date(holiday.date);
            return date.getMonth() === month - 1;
        });

        return festivosMes;
    }

    async function actualizarDiasFestivos() {
        festivosLista.empty();

        const countryCode = paisSelect.val();
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        try {
            const holidays = await obtenerDiasFestivos(year, month, countryCode);

            if (holidays.length > 0) {
                const festivosHtml = holidays.map(holiday => `<li>${holiday.date}: ${holiday.name}</li>`).join('');
                festivosLista.html(`<ul>${festivosHtml}</ul>`);
            } else {
                festivosLista.html("<p>No hay días festivos para el mes en curso.</p>");
            }
        } catch (error) {
            mostrarError("Error al obtener días festivos: " + error.message);
        }
    }
    await actualizarDiasFestivos();

    function actualizarListaTareas() {
        listaTareas.empty();

        tareas.forEach(function (tarea) {
            const tareaItem = $(document.createElement("li"));
            tareaItem.html(`<strong>${tarea.titulo}</strong><br>${tarea.descripcion}<br>Fecha: ${tarea.fecha}<br>Hora: ${tarea.hora}`);

            const botonCompletar = $(document.createElement("button"));
            botonCompletar.text("Completar");
            botonCompletar.on("click", function () {
                completarTarea(tarea);
            });

            tareaItem.append(botonCompletar);
            listaTareas.append(tareaItem);
        });

        totalTareas.text(tareas.length);

        if (tareas.length === 0) {
            mensajeH2.text("No hay tareas pendientes");
        } else {
            mensajeH2.text("");
        }
    }

    function mostrarError(mensaje) {
        mensajeH2.text(mensaje);
        setTimeout(() => {
            mensajeH2.text("");
        }, 5000);
    }

    function completarTarea(tarea) {
        const index = tareas.findIndex(function (t) {
            return (
                t.fecha === tarea.fecha &&
                t.hora === tarea.hora &&
                t.titulo === tarea.titulo &&
                t.descripcion === tarea.descripcion
            );
        });
        tareas.splice(index, 1);
        localStorage.setItem("tareas", JSON.stringify(tareas));
        actualizarDiasFestivos();
        actualizarListaTareas();
    }

    tareaForm.on("submit", function (event) {
        event.preventDefault();

        try {
            const fecha = $("#fecha").val();
            const hora = $("#hora").val();
            const titulo = $("#titulo").val();
            const descripcion = $("#descripcion").val();

            if (!fecha || !hora || !titulo || !descripcion) {
                throw new Error("Todos los campos deben estar llenos");
            }

            const tarea = {
                fecha: fecha,
                hora: hora,
                titulo: titulo,
                descripcion: descripcion,
            };

            tareas.push(tarea);
            localStorage.setItem("tareas", JSON.stringify(tareas));
            tareaForm[0].reset();

            actualizarDiasFestivos();
            actualizarListaTareas();
        } catch (error) {
            mostrarError(error.message);
        }
    });

    
    await actualizarDiasFestivos();
    actualizarListaTareas();
});
