// Array de imágenes y sus descripciones
const images = [
    { src: "./../images/gym1.jpg", alt: "Zona de Pesas", caption: "Área de entrenamiento con máquinas de pesas" },
    { src: "./../images/gym2.jpg", alt: "Entrenamiento Cardiovascular", caption: "Cintas de correr y equipos de cardio" },
    { src: "./../images/gym3.jpg", alt: "Zona de Peso Libre", caption: "Espacio para levantamiento de pesas libre" },
    { src: "./../images/gym4.jpg", alt: "Área de Entrenamiento Funcional", caption: "Espacio para entrenamiento de alta intensidad" }
];

// Obtener el contenedor de la galería y el modal
const gallery = document.getElementById("gymGallery");
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const caption = document.getElementById("caption");
const closeModal = document.getElementById("closeModal");

// Crear los elementos de la galería dinámicamente
images.forEach(image => {
    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.innerHTML = `
        <img src="${image.src}" alt="${image.alt}">
    `;
    div.addEventListener("click", () => openModal(image));
    gallery.appendChild(div);
});

// Función para abrir el modal
function openModal(image) {
    modal.style.display = "flex";
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    caption.textContent = image.caption;
}

// Cerrar el modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Cerrar el modal al hacer clic fuera de la imagen
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});


// Coordenadas de la tienda (Madrid)
const TIENDA_LAT = 40.4168;
const TIENDA_LNG = -3.7038;
let map;
let routingControl;

// Inicializar el mapa cuando se carga la página
window.onload = function() {
    // Crear el mapa centrado en la ubicación de la tienda
    map = L.map('map').setView([TIENDA_LAT, TIENDA_LNG], 13);

    // Añadir la capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Añadir marcador de la tienda
    const tiendaMarker = L.marker([TIENDA_LAT, TIENDA_LNG])
        .addTo(map)
        .bindPopup('Mi Tienda de Tecnología<br>Calle Principal 123, Madrid')
        .openPopup();
};

// Función para calcular la ruta
async function calcularRuta() {
    const customerAddress = document.getElementById('customer-address').value;
    
    try {
        // Primero, convertir la dirección del cliente en coordenadas usando Nominatim
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customerAddress)}`);
        const data = await response.json();

        if (data.length > 0) {
            const clienteLat = parseFloat(data[0].lat);
            const clienteLng = parseFloat(data[0].lon);

            // Si ya existe una ruta, la eliminamos
            if (routingControl) {
                map.removeControl(routingControl);
            }

            // Crear nueva ruta usando OSRM
            const url = `https://router.project-osrm.org/route/v1/driving/${TIENDA_LNG},${TIENDA_LAT};${clienteLng},${clienteLat}?overview=full&geometries=geojson`;
            const routeResponse = await fetch(url);
            const routeData = await routeResponse.json();

            if (routeData.code === 'Ok') {
                // Dibujar la ruta en el mapa
                const routeCoordinates = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const routeLine = L.polyline(routeCoordinates, {color: 'blue'}).addTo(map);

                // Ajustar el mapa para mostrar toda la ruta
                map.fitBounds(routeLine.getBounds());

                // Mostrar información de la ruta
                const duration = Math.round(routeData.routes[0].duration / 60);
                const distance = (routeData.routes[0].distance / 1000).toFixed(1);
                
                const routeInfo = document.getElementById('route-info');
                routeInfo.style.display = 'block';
                routeInfo.innerHTML = `
                    <p><strong>Distancia:</strong> ${distance} km</p>
                    <p><strong>Tiempo estimado:</strong> ${duration} minutos</p>
                `;
            }
        } else {
            alert('No se pudo encontrar la dirección proporcionada.');
        }
    } catch (error) {
        console.error('Error al calcular la ruta:', error);
        alert('Error al calcular la ruta. Por favor, intente nuevamente.');
    }
}