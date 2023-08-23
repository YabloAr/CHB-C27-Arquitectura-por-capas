// simulamos la conexion de un cliente.
const socket = io();

let user = ''; //nombre del usuario
let chatBox = document.getElementById('chatBox'); //chatBox es el id de un elemento html <input> de la vista en handlebars

//Pedimos nombre de usuario a las nuevas conexiones.
Swal.fire({
    title: 'Your email.',
    input: 'email',
    inputLabel: 'Your email address',
    inputPlaceholder: 'Enter your email address',
    inputValidator: (value) => {
        return !value.includes('@') && "An email is required to continue."; // mejorar validacion
    },
    allowOutsideClick: false
}).then((result) => { user = result.value });

//chatBox input
chatBox.addEventListener('keyup', evt => {
    if (evt.key === 'Enter') {
        if (chatBox.value.trim().length > 0) {
            //.emit "message" desde el cliente al servidor
            socket.emit("message", { user: user, message: chatBox.value });
            chatBox.value = ""; //reset del input.
        }
    }
});

//Socket, funcion para mostrar el chat a todos.
//el socket del cliente, espera 'messageLogs' desde el servidor.
socket.on('messageLogs', messageCollection => {
    let log = document.getElementById('messageLogs'); //capturamos el elemento de html <p>
    let messages = "";
    messageCollection.forEach(message => {
        messages = messages + `${message.user} dice: ${message.message} </br>`;
    });
    log.innerHTML = messages;
});

