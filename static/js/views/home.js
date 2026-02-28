// ============================================================
// HOME
// ============================================================
function renderHome() {
  app.innerHTML = `
  <div class="hero">
    <h1>Tu comunidad<br>de <em>lectores</em></h1>
    <p>Descubre libros, comparte reseñas y conecta con otros amantes de la lectura.</p>
    <div class="hero-btns">
      <button class="btn btn-primary" onclick="navigate('libros')">📚 Explorar Libros</button>
      ${currentUser ? `<button class="btn btn-outline" onclick="navigate('libro-form')">＋ Subir Libro</button>` : `<button class="btn btn-outline" onclick="navigate('registro')">Únete gratis</button>`}
    </div>
  </div>
  <div class="container section">
    <div class="section-title">Libros Recientes</div>
    <div id="homeLibros" class="grid grid-3">
      <div class="skel" style="height:280px"></div>
      <div class="skel" style="height:280px"></div>
      <div class="skel" style="height:280px"></div>
    </div>
    <div style="margin-top:2.5rem" class="section-title">Próximas Reuniones</div>
    <div id="homeReuniones" class="grid grid-2">
      <div class="skel" style="height:120px"></div>
      <div class="skel" style="height:120px"></div>
    </div>
  </div>`;
  loadHomeData();
}

async function loadHomeData() {
  const [libros, reuniones] = await Promise.all([
    api("/api/libros/"),
    api("/api/reuniones/"),
  ]);
  const hl = $("homeLibros");
  if (libros.length) {
    hl.innerHTML = libros
      .slice(0, 6)
      .map((l) => bookCard(l))
      .join("");
  } else {
    hl.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>Aún no hay libros. ¡Sé el primero en subir uno!</p></div>`;
  }
  const hr = $("homeReuniones");
  if (reuniones.length) {
    hr.innerHTML = reuniones
      .slice(0, 4)
      .map((r) => reunionCard(r))
      .join("");
  } else {
    hr.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>No hay reuniones próximas.</p></div>`;
  }
}

function bookCard(l) {
  const portada = l.Portada
    ? `<img class="card-img" src="${l.Portada}" alt="${l.NombreLibro}">`
    : `<div class="card-cover-placeholder">📖</div>`;
  return `<div class="card" style="cursor:pointer" onclick="navigate('libro-detalle',{id:'${l.id}'})">
    ${portada}
    <div class="card-body">
      <div class="card-title">${l.NombreLibro}</div>
      <div class="card-sub">${l.creador ? l.creador.NombreUsuario : ""}</div>
      <div style="margin-top:.5rem">${renderStars(l.Calificacion)}</div>
    </div>
  </div>`;
}

function reunionCard(r) {
  const fecha = r.ReunionRecurrente
    ? `Todos los ${r.DiaSemana} a las ${r.Hora}`
    : `${r.FechaReunion || ""} ${r.Hora || ""}`;
  return `<div class="card" style="padding:1.25rem;cursor:pointer" onclick="navigate('reunion-detalle',{id:'${r.id}'})">
    <div style="display:flex;align-items:start;justify-content:space-between;gap:1rem">
      <div>
        <div class="card-title">${r.NombreReunion}</div>
        <div class="card-sub" style="margin-top:.25rem">📍 ${r.Lugar?.Direccion || "Sin ubicación"}</div>
        <div class="card-sub">🕐 ${fecha}</div>
      </div>
      <span class="reunion-status status-${r.status}">${r.status}</span>
    </div>
  </div>`;
}
