let preciosAnteriores = [];
let preciosExtrasAnteriores = {}; // Para guardar precios anteriores de cervezas y chupitos
let primeraVez = true;

function guardarEstado() {
    const cajas = document.querySelectorAll('.box');
    let estado = [];

    cajas.forEach(caja => {
        const precios = caja.querySelectorAll('.precios h2');
        const bebidas = caja.querySelectorAll('.bebidas h2');

        precios.forEach((precio, index) => {
            estado.push({
                bebida: bebidas[index].textContent,
                precio: precio.textContent,
                color: precio.style.color
            });
        });
    });

    // Guardar estado de cervezas y chupitos
    estado.push({
        bebida: 'CERVEZAS',
        precio: document.getElementById('cervezas-precio').textContent,
        color: document.getElementById('cervezas-precio').style.color
    });

    estado.push({
        bebida: 'CHUPITOS',
        precio: document.getElementById('chupitos-precio').textContent,
        color: document.getElementById('chupitos-precio').style.color
    });

    localStorage.setItem('estadoPrecios', JSON.stringify(estado));
}

function restaurarEstado() {
    const estado = JSON.parse(localStorage.getItem('estadoPrecios'));

    if (estado && estado.length > 0) {
        const cajas = document.querySelectorAll('.box');
        let estadoIndex = 0;

        cajas.forEach(caja => {
            const precios = caja.querySelectorAll('.precios h2');
            const bebidas = caja.querySelectorAll('.bebidas h2');

            precios.forEach((precio, index) => {
                if (estado[estadoIndex]) {
                    bebidas[index].textContent = estado[estadoIndex].bebida;
                    precio.textContent = estado[estadoIndex].precio;
                    precio.style.color = estado[estadoIndex].color;
                    bebidas[index].style.color = estado[estadoIndex].color;

                    preciosAnteriores[index] = parseFloat(estado[estadoIndex].precio.replace('$', '').replace("'", "."));
                    estadoIndex++;
                }
            });
        });

        // Restaurar precios de cervezas y chupitos
        estado.forEach(item => {
            if (item.bebida === 'CERVEZAS') {
                document.getElementById('cervezas-precio').textContent = item.precio;
                document.getElementById('cervezas-precio').style.color = item.color;
                preciosExtrasAnteriores['CERVEZAS'] = parseFloat(item.precio.replace('$', '').replace("'", "."));
            } else if (item.bebida === 'CHUPITOS') {
                document.getElementById('chupitos-precio').textContent = item.precio;
                document.getElementById('chupitos-precio').style.color = item.color;
                preciosExtrasAnteriores['CHUPITOS'] = parseFloat(item.precio.replace('$', '').replace("'", "."));
            }
        });

        primeraVez = false; // Desactivar la primera vez después de restaurar
    }
}

function iniciarContador() {
    let time = 600;
    const countdownElement = document.getElementById('timer');

    const interval = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;

        countdownElement.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (time > 0) {
            time--;
        } else {
            clearInterval(interval);
            countdownElement.innerHTML = "00:00";
            actualizarPrecios(); // Actualiza todos los precios al terminar el contador
        }
    }, 1000);
}

function actualizarPrecios() {
    const preciosPosibles = ["3'5$", "4$", "4'5$", "5$", "5'5$", "6$"];
    const cajas = document.querySelectorAll('.box');
    
    // Definir bebidas con menor probabilidad de tocar 3,5$
    const bebidasConMenorProbabilidad = ["RED LABEL", "ABSOLUT", "BARCERLÓ", "BEEFEATER"];
    
    cajas.forEach(caja => {
        const precios = caja.querySelectorAll('.precios h2');
        const bebidas = caja.querySelectorAll('.bebidas h2');

        let indices = [...Array(precios.length).keys()];
        indices = indices.sort(() => 0.5 - Math.random()).slice(0, 3);

        precios.forEach((precio, index) => {
            const precioActual = parseFloat(precio.textContent.replace('$', '').replace("'", "."));
            let nuevoPrecio = precioActual;

            if (indices.includes(index)) {
                const bebidaNombre = bebidas[index].textContent.trim().toUpperCase();
                
                // Si la bebida es una de las bebidas con menos probabilidad
                if (bebidasConMenorProbabilidad.includes(bebidaNombre)) {
                    // Elegir un precio aleatorio excluyendo 3,5$ o reducir la probabilidad
                    const preciosFiltrados = ["3'5$", "4$", "4$", "4'5$", "4'5$", "5$", "5$", "5'5$", "5'5$", "6$"];
                    nuevoPrecio = parseFloat(preciosFiltrados[Math.floor(Math.random() * preciosFiltrados.length)].replace("'", "."));
                } else {
                    // Asignar precio aleatorio normal para las demás bebidas
                    nuevoPrecio = parseFloat(preciosPosibles[Math.floor(Math.random() * preciosPosibles.length)].replace("'", "."));
                }

                // Reglas adicionales si la bebida es BELVEDERE y el precio es menor de 5$
                if ((bebidaNombre === "BELVEDERE") && nuevoPrecio < 5) {
                    const preciosBELVEDERE = ["5$", "5'5$", "6$"];
                    nuevoPrecio = parseFloat(preciosBELVEDERE[Math.floor(Math.random() * preciosBELVEDERE.length)].replace("'", "."));;
                }

                precio.textContent = `${nuevoPrecio}$`;
            }

            // Cambiar color del precio basado en si ha subido, bajado o se ha mantenido
            if (!primeraVez) {
                if (nuevoPrecio < precioActual) {
                    precio.style.color = 'rgb(0, 176, 41)';
                    bebidas[index].style.color = 'rgb(0, 176, 41)';
                } else if (nuevoPrecio > precioActual) {
                    precio.style.color = 'red';
                    bebidas[index].style.color = 'red';
                } else {
                    precio.style.color = 'gray';
                    bebidas[index].style.color = 'gray';
                }
            }

            preciosAnteriores[index] = nuevoPrecio;
        });

        ordenarPrecios(caja);
    });

    actualizarPreciosExtras(); // Actualiza los precios de cerveza y chupitos

    guardarEstado(); // Guardar el estado después de actualizar

    const countdownElement = document.getElementById('timer');
    countdownElement.innerHTML = "10:00";
    iniciarContador();

    primeraVez = false;
}


function actualizarPreciosExtras() {
    const preciosChupitos = ["1'5$", "2$", "2'5$"];
    const preciosCervezas = ["2'5$", "3$", "3'5$", "4$"];

    // Actualizar el precio de los chupitos
    const chupitosPrecioElement = document.getElementById('chupitos-precio');
    const nuevoPrecioChupitos = parseFloat(preciosChupitos[Math.floor(Math.random() * preciosChupitos.length)].replace("'", "."));
    const precioChupitosActual = preciosExtrasAnteriores['CHUPITOS'] || nuevoPrecioChupitos;
    chupitosPrecioElement.textContent = `${nuevoPrecioChupitos}$`;

    // Actualizar el color del precio de los chupitos
    if (!primeraVez) {
        if (nuevoPrecioChupitos < precioChupitosActual) {
            chupitosPrecioElement.style.color = 'rgb(0, 176, 41)';
        } else if (nuevoPrecioChupitos > precioChupitosActual) {
            chupitosPrecioElement.style.color = 'red';
        } else {
            chupitosPrecioElement.style.color = 'gray';
        }
    }
    preciosExtrasAnteriores['CHUPITOS'] = nuevoPrecioChupitos;

    // Actualizar el precio de las cervezas
    const cervezasPrecioElement = document.getElementById('cervezas-precio');
    const nuevoPrecioCervezas = parseFloat(preciosCervezas[Math.floor(Math.random() * preciosCervezas.length)].replace("'", "."));
    const precioCervezasActual = preciosExtrasAnteriores['CERVEZAS'] || nuevoPrecioCervezas;
    cervezasPrecioElement.textContent = `${nuevoPrecioCervezas}$`;

    // Actualizar el color del precio de las cervezas
    if (!primeraVez) {
        if (nuevoPrecioCervezas < precioCervezasActual) {
            cervezasPrecioElement.style.color = 'green';
        } else if (nuevoPrecioCervezas > precioCervezasActual) {
            cervezasPrecioElement.style.color = 'red';
        } else {
            cervezasPrecioElement.style.color = 'gray';
        }
    }
    preciosExtrasAnteriores['CERVEZAS'] = nuevoPrecioCervezas;
}

// Función para ordenar los precios de mayor a menor
function ordenarPrecios(caja) {
    const precios = Array.from(caja.querySelectorAll('.precios h2'));
    const bebidas = Array.from(caja.querySelectorAll('.bebidas h2'));

    const elementos = precios.map((precio, index) => {
        return {
            precio: parseFloat(precio.textContent.replace('$', '').replace("'", ".")),
            precioElemento: precio,
            bebidaElemento: bebidas[index]
        };
    });

    elementos.sort((a, b) => b.precio - a.precio);

    elementos.forEach((elemento, index) => {
        caja.querySelector('.precios').appendChild(elemento.precioElemento);
        caja.querySelector('.bebidas').appendChild(elemento.bebidaElemento);
    });
}

// Redireccionar a otra página si es la hora específica
function redireccionarSiEsHora() {
    const now = new Date();
    const horas = now.getHours();
    const minutos = now.getMinutes();

    if ((horas === 1 && minutos === 15) || (horas === 2 && minutos === 45)) {
        guardarEstado(); // Guardar el estado antes de redirigir
        window.location.href = "chupitos.html"; // Cambia "nuevo_archivo.html" al archivo HTML de destino
    }
}

setInterval(redireccionarSiEsHora, 60000); // Comprueba la hora cada 60 segundos

window.onload = () => {
    restaurarEstado(); // Restaurar el estado al cargar la página
    actualizarPrecios(); // Actualizar y ordenar precios al cargar la página
    iniciarContador(); // Iniciar el contador
};
