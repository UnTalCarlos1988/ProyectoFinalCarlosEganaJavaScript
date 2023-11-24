document.addEventListener("DOMContentLoaded", async function () {
    const tareaForm = document.getElementById("tareaForm");
    const listaTareas = document.getElementById("listaTareas");
    const totalTareas = document.getElementById("totalTareas");
    const mensajeH2 = document.getElementById("mensaje");
    const paisSelect = document.getElementById("pais");
    
    const festivosLista = document.getElementById("festivosLista");

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
        festivosLista.innerHTML = "";

        const countryCode = paisSelect.value;
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        try {
            const holidays = await obtenerDiasFestivos(year, month, countryCode);

            if (holidays.length > 0) {
                festivosLista.innerHTML = "<ul>";
                holidays.forEach(holiday => {
                    festivosLista.innerHTML += `<li>${holiday.date}: ${holiday.name}</li>`;
                });
                festivosLista.innerHTML += "</ul>";
            } else {
                festivosLista.innerHTML = "<p>No hay días festivos para el mes en curso.</p>";
            }
        } catch (error) {
            mostrarError("Error al obtener días festivos: " + error.message);
        }
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

            actualizarDiasFestivos();
            actualizarListaTareas();
        } catch (error) {
            mostrarError(error.message);
        }
    });

    
    await actualizarDiasFestivos();
    actualizarListaTareas();
});
