//Variables y Selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

//Eventos

eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

//Clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
        
    }
    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
          this.gastos = this.gastos.filter(gasto => gasto.id !== id ); 
          this.calcularRestante();
        }

}


class UI {
    insertarPresupuesto( cantidad ) { //"Cantidad" es el objeto de presupuesto
        //Extrayendo el valor
        const { presupuesto, restante } = cantidad;
       
        //Agregar al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        //Crear el div
        const divMensaje = document.createElement('DIV');
        divMensaje.classList.add('text-center', 'alert');
    
        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        }else {
            divMensaje.classList.add('alert-success');

        }
        //Mensaje de error
        divMensaje.textContent = mensaje;

        //Insertar en el HTML
        document.querySelector('.primario').insertBefore( divMensaje, formulario );

        //Quitar del HTML
        setTimeout(() => {
            divMensaje.remove ();
        }, 3000);

    }

    mostrarGastos(gastos) {
        
        this.limpiarHTML(); //Elimina el HTML previo

        //Iterar sobre los gastos
        gastos.forEach( gasto => {
            
            const {  cantidad, nombre, id } = gasto;

            //Crear un LI
            const nuevoGasto = document.createElement('LI');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            //nuevoGasto.setAttribute('data-id', id); Forma anterior para establecer un atributo en HTML
            nuevoGasto.dataset.id = id;

            //Agregar el gasto al HTML
            nuevoGasto.innerHTML = `
                ${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>
    `;
            //Boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            //Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
        })

       
    }
    
    limpiarHTML() {
        while( gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        //Agregar al HTML
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante } = presupuestoObj;
            
        const restanteDiv = document.querySelector('.restante');
        //Comprobar 25%
        if( ( presupuesto / 4 )  >= restante ) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-danger');

        }else if( (presupuesto / 2) >= restante){
            restanteDiv.classList.remove('alert-danger');
            restanteDiv.classList.add('alert-warning');
        }else { //Reembolso
            restanteDiv.classList.remove('alert-warning');
            restanteDiv.classList.add('alert-success');
        }


        //Si el total es 0 o menor
        if(restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
        
            formulario.querySelector('button[type="submit"]').disabled = true;
            return;
        }
        formulario.querySelector('button[type="submit"]').disabled = false;

    }
}

//Instanciar
const ui = new UI();

let presupuesto;

//Funciones 
function preguntarPresupuesto() {
    const presupuestoUsuario = Number(prompt('¿Cuál es tu presupuesto?'));

    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0  ) {
        window.location.reload();
    }else {
        console.log(presupuestoUsuario)
    }

    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);   
}

//Añade gastos
function agregarGasto(e) {
    e.preventDefault();

    //Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    }else if( cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
    
        return;
    }

    //Generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() } //nombre: nombre, cantidad: cantidad

    //Añade un nuevo gasto al objeto creado "gasto" 
    presupuesto.nuevoGasto(gasto);

    //Gasto agregado correctamente
    ui.imprimirAlerta('Gasto agregado Correctamente');

    //Imprimir los gastos
    const { gastos, restante } = presupuesto;
    
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    //Reinicia el formulario
    formulario.reset();
}

function eliminarGasto(id) {
    //Elimina los gastos del objeto
    presupuesto.eliminarGasto(id);

    //Elimina los gastos del HTML
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}