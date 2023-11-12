document.addEventListener("DOMContentLoaded", function () {
    const tareaForm = document.getElementById("tareaForm");
    const listaTareas = document.getElementById("listaTareas");
    const totalTareas = document.getElementById("totalTareas");
    const mensajeH2 = document.getElementById("mensaje");
    const paisSelect = document.getElementById("pais");
    const calendario = document.getElementById("calendario");

    let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

    function actualizarCalendario() {
        calendario.innerHTML = "";
        const countryCode = paisSelect.value;

        obtenerDiasFestivos(countryCode).then(function (holidays) {
            const events = holidays.map(function (holiday) {
                return {
                    startDate: `${holiday.date}T00:00:00`,
                    endDate: `${holiday.date}T23:59:59`,
                    summary: `[Feriado] ${holiday.name}`,
                };
            });

            tareas.forEach(function (tarea) {
                const fechaTarea = new Date(`${tarea.fecha}T${tarea.hora}:00`);
                events.push({
                    startDate: fechaTarea.toISOString(),
                    endDate: fechaTarea.toISOString(),
                    summary: `[Tarea] ${tarea.titulo}`,
                });
            });

            const calendar = new SimpleCalendar({
                container: "#calendario",
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                displayYear: true,
                disableYearDropdown: true,
                disableTimezone: true,
                eventsData: events,
                onClickDate: function (date) {
                    const tareasFecha = tareas.filter(function (tarea) {
                        const fechaTarea = new Date(`${tarea.fecha}T${tarea.hora}:00`);
                        return fechaTarea.toISOString().split('T')[0] === date;
                    });

                    mostrarTareasFecha(tareasFecha);
                }
            });
        });
    }

    function obtenerDiasFestivos(countryCode) {
        const year = new Date().getFullYear();
        return fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)
            .then(response => response.json());
    }

    function actualizarListaTareas() {
        listaTareas.innerHTML = "";

        tareas.forEach(function (tarea) {
            const tareaItem = document.createElement("li");
            tareaItem.innerHTML = `<strong>${tarea.titulo}</strong><br>${tarea.descripcion}<br>Fecha: ${tarea.fecha}<br>Hora: ${tarea.hora}`;

            const botonCompletar = document.createElement("button");
            botonCompletar.textContent = "Completar";
            botonCompletar.addEventListener("click", function () {
                completarTarea(tarea);
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

    function mostrarError(mensaje) {
        mensajeH2.textContent = mensaje;
        setTimeout(() => {
            mensajeH2.textContent = "";
        }, 5000);
    }

    function mostrarTareasFecha(tareasFecha) {
        listaTareas.innerHTML = "";

        tareasFecha.forEach(function (tarea) {
            const tareaItem = document.createElement("li");
            tareaItem.innerHTML = `<strong>${tarea.titulo}</strong><br>${tarea.descripcion}<br>Fecha: ${tarea.fecha}<br>Hora: ${tarea.hora}`;

            const botonCompletar = document.createElement("button");
            botonCompletar.textContent = "Completar";
            botonCompletar.addEventListener("click", function () {
                completarTarea(tarea);
            });

            tareaItem.appendChild(botonCompletar);
            listaTareas.appendChild(tareaItem);
        });
    }

    function completarTarea(tarea) {
        const index = tareas.findIndex(function (t) {
            return t.fecha === tarea.fecha && t.hora === tarea.hora && t.titulo === tarea.titulo && t.descripcion === tarea.descripcion;
        });
        tareas.splice(index, 1);
        localStorage.setItem("tareas", JSON.stringify(tareas));
        actualizarCalendario();
        actualizarListaTareas();
    }

    tareaForm.addEventListener("submit", function (event) {
        event.preventDefault();

        try {
            const fecha = document.getElementById("fecha").value;
            const hora = document.getElementById("hora").value;
            const titulo = document.getElementById("titulo").value;
            const descripcion = document.getElementById("descripcion").value;

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
            tareaForm.reset();

            actualizarCalendario();
            actualizarListaTareas();
        } catch (error) {
            mostrarError(error.message);
        }
    });

   
    actualizarCalendario();
    actualizarListaTareas();
});
