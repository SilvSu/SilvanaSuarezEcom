const productos = [
  { id: 1, nombre: "Retrato Digital", precio: 40.00, imagen: "https://cdna.artstation.com/p/assets/images/images/011/315/678/large/diana-delfino-retrato-bn.jpg?1528944696" },
  { id: 2, nombre: "Personaje Completo", precio: 60.00, imagen: "https://preview.redd.it/drawing-style-help-all-from-pinterest-pen-paper-vs-digital-v0-i3r7042ruacc1.jpg?width=1080&crop=smart&auto=webp&s=18039d38ae079f209c11618e029cf5ff4f00e6e7" },
  { id: 3, nombre: "Chibi", precio: 30.00, imagen: "https://www.dictionary.com/e/wp-content/uploads/2018/03/chibi-300x300.jpg" },
  { id: 4, nombre: "Ilustración de Fondo", precio: 80.00, imagen: "https://wallpapers.com/images/high/one-piece-live-ship-clouds-s0ml7mrr8nnmj7zb.webp" },
  { id: 5, nombre: "Estilo Anime", precio: 50.00, imagen: "https://www.anmosugoi.com/wp-content/uploads/2023/04/Oshi-no-Ko-Ai-Hoshino-min-2.jpg.avif" },
  { id: 6, nombre: "Caricatura Personalizada", precio: 25.00, imagen: "https://vocesmexico.com/wp-content/uploads/2023/12/caricaturas.jpg" }
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function mostrarProductos() {
  productos.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de comprar.");
    return;
  }

  alert("¡Gracias por tu compra! 🎨 Tu pedido está en camino.");
  vaciarCarrito();
}

function guardarCarrito() {
  localStorage.setItem(
    "carrito",
    JSON.stringify(Array.from(carrito.entries()))
  );
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

// PayPal Smart Button
if (window.paypal) {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        const total = Array.from(carrito.values()).reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total.toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(
            `¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 🎨`
          );
          vaciarCarrito();
        });
      },
      onError: function (err) {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema con el pago. Intenta de nuevo.");
      }
    })
    .render("#paypal-button-container");
}

// Inicializar
mostrarProductos();
cargarCarrito();
