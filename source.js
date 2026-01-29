// Variables globales
let libros = [];
let usuarios = [];
let prestamos = [];

// Cargar datos desde archivos JSON
async function cargarDatos() {
    try {
        // Cargar libros
        const responseLibros = await fetch('libros.json');
        libros = await responseLibros.json();
        
        // Cargar usuarios
        const responseUsuarios = await fetch('usuarios.json');
        usuarios = await responseUsuarios.json();
        
        // Cargar préstamos
        const responsePrestamos = await fetch('prestamos.json');
        prestamos = await responsePrestamos.json();
        
        console.log('Datos cargados correctamente');
        console.log(`Libros: ${libros.length} | Usuarios: ${usuarios.length} | Préstamos: ${prestamos.length}`);
        
        // Actualizar la interfaz
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Error al cargar los datos. Por favor, verifica que los archivos JSON estén en el mismo directorio.');
    }
}

function actualizarEstadisticas() {
    document.getElementById('totalLibros').textContent = libros.length;
    document.getElementById('totalUsuarios').textContent = usuarios.length;
    document.getElementById('totalPrestamos').textContent = prestamos.length;
}

function mostrarFecha() {
    const fecha = new Date();
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
}

function inicializarNavegacion() {
    const menuLinks = document.querySelectorAll('.menu-link');
    const secciones = document.querySelectorAll('.section');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            secciones.forEach(s => s.classList.remove('active'));
            
            const seccionId = this.getAttribute('data-section');
            document.getElementById(seccionId).classList.add('active');
            
            // Cargar datos cuando se cambia de sección
            if (seccionId === 'catalogo') {
                cargarCatalogo();
            } else if (seccionId === 'prestamos') {
                cargarPrestamos();
            } else if (seccionId === 'usuarios') {
                cargarUsuarios();
            }
        });
    });
}

function buscarLibro() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const tipoRadio = document.querySelector('input[name="tipo"]:checked');
    
    const termino = searchInput.value.trim().toLowerCase();
    const tipoBusqueda = tipoRadio.value;
    
    if (termino === '') {
        searchResults.innerHTML = '<strong>Error:</strong> Por favor ingrese un término de búsqueda.';
        searchResults.className = 'search-results show error';
        return;
    }
    
    let resultados = [];
    
    if (tipoBusqueda === 'titulo') {
        resultados = libros.filter(libro => 
            libro.titulo.toLowerCase().includes(termino)
        );
    } else {
        resultados = libros.filter(libro => 
            libro.autor.toLowerCase().includes(termino)
        );
    }
    
    if (resultados.length > 0) {
        let html = `<strong>✓ Se encontraron ${resultados.length} resultado(s):</strong><br><br>`;
        html += '<table class="data-table" style="margin-top: 10px;">';
        html += '<tr><th>PORTADA</th><th>ID</th><th>TÍTULO</th><th>AUTOR</th><th>ESTADO</th></tr>';
        
        resultados.forEach(libro => {
            const badgeClass = libro.estado === 'Disponible' ? 'disponible' : 'prestado';
            html += `<tr>
                <td><img src="${libro.imagen}" alt="${libro.titulo}" class="book-cover-small"></td>
                <td>${libro.id}</td>
                <td>${libro.titulo}</td>
                <td>${libro.autor}</td>
                <td><span class="badge ${badgeClass}">${libro.estado}</span></td>
            </tr>`;
        });
        
        html += '</table>';
        searchResults.innerHTML = html;
        searchResults.className = 'search-results show success';
    } else {
        searchResults.innerHTML = `<strong>No se encontraron resultados</strong><br>
            No hay libros que coincidan con "${termino}" en ${tipoBusqueda === 'titulo' ? 'título' : 'autor'}.`;
        searchResults.className = 'search-results show error';
    }
}

function limpiarBusqueda() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchResults').className = 'search-results';
    document.getElementById('titulo').checked = true;
}

function cargarCatalogo() {
    const tabla = document.getElementById('tablaCatalogo');
    const filtroEstado = document.getElementById('filtroEstado').value;
    const ordenarPor = document.getElementById('ordenarPor').value;
    
    let librosFiltrados = [...libros];
    if (filtroEstado !== 'todos') {
        const estadoBuscado = filtroEstado === 'disponible' ? 'Disponible' : 'Prestado';
        librosFiltrados = librosFiltrados.filter(libro => libro.estado === estadoBuscado);
    }
    
    librosFiltrados.sort((a, b) => {
        if (ordenarPor === 'id') {
            return a.id.localeCompare(b.id);
        } else if (ordenarPor === 'titulo') {
            return a.titulo.localeCompare(b.titulo);
        } else {
            return a.autor.localeCompare(b.autor);
        }
    });
    
    while (tabla.rows.length > 1) {
        tabla.deleteRow(1);
    }
    
    librosFiltrados.forEach(libro => {
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td><img src="${libro.imagen}" alt="${libro.titulo}" class="book-cover-small"></td>
            <td>${libro.id}</td>
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.categoria}</td>
            <td><span class="badge ${libro.estado === 'Disponible' ? 'disponible' : 'prestado'}">${libro.estado}</span></td>
        `;
        
        fila.style.cursor = 'pointer';
        fila.addEventListener('click', function() {
            mostrarDetalleLibro(libro);
        });
    });
}

function mostrarDetalleLibro(libro) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="modal-body">
                <img src="${libro.imagen}" alt="${libro.titulo}" class="book-cover-large">
                <div class="book-details">
                    <h2>${libro.titulo}</h2>
                    <p><strong>ID:</strong> ${libro.id}</p>
                    <p><strong>Autor:</strong> ${libro.autor}</p>
                    <p><strong>Categoría:</strong> ${libro.categoria}</p>
                    <p><strong>Estado:</strong> <span class="badge ${libro.estado === 'Disponible' ? 'disponible' : 'prestado'}">${libro.estado}</span></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function cargarPrestamos() {
    const tabla = document.getElementById('tablaPrestamos');
    
    while (tabla.rows.length > 1) {
        tabla.deleteRow(1);
    }
    
    prestamos.forEach(prestamo => {
        const libro = libros.find(l => l.id === prestamo.libroId);
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${prestamo.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${libro ? libro.imagen : ''}" alt="${prestamo.libroTitulo}" class="book-cover-tiny">
                    <span>${prestamo.libroTitulo}</span>
                </div>
            </td>
            <td>${prestamo.usuarioNombre}</td>
            <td>${prestamo.fechaPrestamo}</td>
            <td>${prestamo.fechaDevolucion}</td>
            <td><button class="btn-danger" onclick="devolverLibro('${prestamo.id}')">DEVOLVER</button></td>
        `;
    });
}

function registrarPrestamo() {
    const libroId = document.getElementById('prestamoLibroId').value.trim().toUpperCase();
    const usuarioId = document.getElementById('prestamoUsuarioId').value.trim().toUpperCase();
    const fechaDevolucion = document.getElementById('prestamoFechaDevolucion').value;
    const mensaje = document.getElementById('prestamoMensaje');
    
    if (!libroId || !usuarioId || !fechaDevolucion) {
        mensaje.innerHTML = '<strong>Error:</strong> Todos los campos son obligatorios.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const libro = libros.find(l => l.id === libroId);
    if (!libro) {
        mensaje.innerHTML = '<strong>Error:</strong> El ID del libro no existe.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    if (libro.estado === 'Prestado') {
        mensaje.innerHTML = '<strong>Error:</strong> El libro ya está prestado.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const usuario = usuarios.find(u => u.id === usuarioId);
    if (!usuario) {
        mensaje.innerHTML = '<strong>Error:</strong> El ID del usuario no existe.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const hoy = new Date();
    const fechaDev = new Date(fechaDevolucion);
    if (fechaDev <= hoy) {
        mensaje.innerHTML = '<strong>Error:</strong> La fecha de devolución debe ser futura.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const nuevoPrestamo = {
        id: `PRES-${String(prestamos.length + 1).padStart(3, '0')}`,
        libroId: libro.id,
        libroTitulo: libro.titulo,
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        fechaPrestamo: hoy.toISOString().split('T')[0],
        fechaDevolucion: fechaDevolucion
    };
    
    prestamos.push(nuevoPrestamo);
    libro.estado = 'Prestado';
    usuario.prestamosActivos++;
    
    document.getElementById('prestamoLibroId').value = '';
    document.getElementById('prestamoUsuarioId').value = '';
    document.getElementById('prestamoFechaDevolucion').value = '';
    
    mensaje.innerHTML = `<strong>✓ Éxito:</strong> Préstamo ${nuevoPrestamo.id} registrado correctamente.`;
    mensaje.className = 'mensaje-resultado show success';
    
    cargarPrestamos();
    actualizarEstadisticas();
    
    setTimeout(() => {
        mensaje.className = 'mensaje-resultado';
    }, 3000);
}

function devolverLibro(prestamoId) {
    if (!confirm('¿Está seguro de registrar la devolución de este libro?')) {
        return;
    }
    
    const indice = prestamos.findIndex(p => p.id === prestamoId);
    if (indice === -1) return;
    
    const prestamo = prestamos[indice];
    
    const libro = libros.find(l => l.id === prestamo.libroId);
    if (libro) {
        libro.estado = 'Disponible';
    }
    
    const usuario = usuarios.find(u => u.id === prestamo.usuarioId);
    if (usuario && usuario.prestamosActivos > 0) {
        usuario.prestamosActivos--;
    }
    
    prestamos.splice(indice, 1);
    
    cargarPrestamos();
    actualizarEstadisticas();
    
    alert('Libro devuelto correctamente.');
}

function cargarUsuarios() {
    const tabla = document.getElementById('tablaUsuarios');
    
    while (tabla.rows.length > 1) {
        tabla.deleteRow(1);
    }
    
    usuarios.forEach(usuario => {
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.cedula}</td>
            <td>${usuario.email}</td>
            <td>${usuario.telefono}</td>
            <td>${usuario.prestamosActivos}</td>
        `;
        
        fila.style.cursor = 'pointer';
        fila.addEventListener('click', function() {
            alert(`Información del usuario:\n\nID: ${usuario.id}\nNombre: ${usuario.nombre}\nCédula: ${usuario.cedula}\nEmail: ${usuario.email}\nTeléfono: ${usuario.telefono}\nPréstamos activos: ${usuario.prestamosActivos}`);
        });
    });
}

function registrarUsuario() {
    const nombre = document.getElementById('usuarioNombre').value.trim();
    const cedula = document.getElementById('usuarioCedula').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const telefono = document.getElementById('usuarioTelefono').value.trim();
    const mensaje = document.getElementById('usuarioMensaje');
    
    if (!nombre || !cedula || !email || !telefono) {
        mensaje.innerHTML = '<strong>Error:</strong> Todos los campos son obligatorios.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    if (usuarios.find(u => u.cedula === cedula)) {
        mensaje.innerHTML = '<strong>Error:</strong> Ya existe un usuario con esa cédula.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensaje.innerHTML = '<strong>Error:</strong> El email no es válido.';
        mensaje.className = 'mensaje-resultado show error';
        return;
    }
    
    const nuevoUsuario = {
        id: `USR-${String(usuarios.length + 1).padStart(3, '0')}`,
        nombre: nombre,
        cedula: cedula,
        email: email,
        telefono: telefono,
        prestamosActivos: 0
    };
    
    usuarios.push(nuevoUsuario);
    
    document.getElementById('usuarioNombre').value = '';
    document.getElementById('usuarioCedula').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioTelefono').value = '';
    
    mensaje.innerHTML = `<strong>✓ Éxito:</strong> Usuario ${nuevoUsuario.id} registrado correctamente.`;
    mensaje.className = 'mensaje-resultado show success';
    
    cargarUsuarios();
    actualizarEstadisticas();
    
    setTimeout(() => {
        mensaje.className = 'mensaje-resultado';
    }, 3000);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    // Cargar datos desde JSON
    await cargarDatos();
    
    mostrarFecha();
    inicializarNavegacion();
    
    document.getElementById('searchBtn').addEventListener('click', buscarLibro);
    document.getElementById('clearBtn').addEventListener('click', limpiarBusqueda);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') buscarLibro();
    });
    
    document.getElementById('filtroEstado').addEventListener('change', cargarCatalogo);
    document.getElementById('ordenarPor').addEventListener('change', cargarCatalogo);
    
    document.getElementById('btnRegistrarPrestamo').addEventListener('click', registrarPrestamo);
    
    document.getElementById('btnRegistrarUsuario').addEventListener('click', registrarUsuario);
    
    console.log('Sistema de Biblioteca Medardo Angel Silva - Iniciado');
});

setInterval(mostrarFecha, 60000);
