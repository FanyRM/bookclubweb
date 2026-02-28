// ============================================================
// LIBROS
// ============================================================
function renderLibros() {
  app.innerHTML = `
  <div class="page-header"><div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
      <div><h2>Biblioteca</h2><p>Todos los libros de la comunidad</p></div>
      ${currentUser ? `<button class="btn btn-primary" onclick="navigate('libro-form')">＋ Subir libro</button>` : ""}
    </div>
  </div></div>
  <div class="container section">
    <input class="form-control" id="searchLibro" placeholder="🔍 Buscar libro..." style="max-width:360px;margin-bottom:1.5rem" oninput="filterLibros()">
    <div id="librosGrid" class="grid grid-3"><div class="skel" style="height:280px"></div><div class="skel" style="height:280px"></div><div class="skel" style="height:280px"></div></div>
  </div>`;
  loadLibros();
}

async function loadLibros() {
  _libros = await api("/api/libros/");
  filterLibros();
}

function filterLibros() {
  const q = ($("searchLibro")?.value || "").toLowerCase();
  const filtered = _libros.filter((l) =>
    l.NombreLibro.toLowerCase().includes(q)
  );
  const g = $("librosGrid");
  if (!g) return;
  g.innerHTML = filtered.length
    ? filtered.map((l) => bookCard(l)).join("")
    : `<div class="empty-state"><div class="icon">📭</div><p>Sin resultados</p></div>`;
}

async function renderLibroDetalle({ id }) {
  app.innerHTML = `<div class="container section"><div class="skel" style="height:400px"></div></div>`;
  const l = await api(`/api/libros/${id}`);
  const isOwner =
    currentUser &&
    (currentUser.id === l.idUsuarioCreador ||
      currentUser._id === l.idUsuarioCreador);
  const portada = l.Portada
    ? `<img src="${l.Portada}" class="libro-portada">`
    : `<div class="libro-portada-placeholder">📖</div>`;
  
  window._libroEditData = l;
  
  app.innerHTML = `
  <div class="container section">
    <div class="back-btn" onclick="navigate('libros')">← Volver a Biblioteca</div>
    <div class="libro-detalle-grid">
      <div class="libro-portada-col">
        ${portada}
        ${l.DondeLeer && l.DondeLeer.length ? `<div style="margin-top:1rem"><div class="form-label">Dónde leer</div><div style="display:flex;flex-direction:column;gap:.5rem">${l.DondeLeer.map((u) => `<a href="${u}" target="_blank" class="btn btn-ghost btn-sm" style="font-size:.75rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🔗 ${new URL(u).hostname}</a>`).join("")}</div></div>` : ""}
      </div>
      <div class="libro-info-col">
        <h1 class="libro-titulo">${l.NombreLibro}</h1>
        ${
          l.creador
            ? `<div style="margin:.75rem 0;display:flex;align-items:center;gap:.5rem">
          ${renderAvatar(l.creador, 32)}
          <span style="font-size:.875rem;color:var(--muted)">Subido por <a class="link" onclick="navigate('perfil',{id:'${l.creador.id}'})">${l.creador.NombreUsuario}</a></span>
        </div>`
            : ""
        }
        <div style="margin:.5rem 0">${renderStars(l.Calificacion)}</div>
        <p class="libro-descripcion">${l.Descripcion || "Sin descripción"}</p>
        <div style="margin-top:1.5rem;display:flex;gap:.75rem;flex-wrap:wrap">
          ${currentUser ? `<button class="btn btn-primary" onclick="navigate('critica-form',{idLibro:'${id}',nombreLibro:'${l.NombreLibro}'})">✍️ Escribir reseña</button>` : ""}
          ${
            isOwner
              ? `<button class="btn btn-ghost btn-sm" onclick="navigate('libro-form',{edit:true,libroId:'${l.id}'})">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteLibro('${id}')">🗑 Eliminar</button>`
              : ""
          }
        </div>
      </div>
    </div>
    <hr class="divider">
    <div class="tabs" style="margin-bottom:1.5rem">
      <div class="tab active" id="tab-resenas" onclick="switchTab('resenas')">📝 Reseñas (${l.criticas?.length || 0})</div>
      <div class="tab" id="tab-foro" onclick="switchTab('foro')">💬 Foro</div>
    </div>
    <div id="panel-resenas">
      ${l.criticas && l.criticas.length ? l.criticas.map((c) => criticaCard(c)).join("") : `<div class="empty-state"><div class="icon">✍️</div><p>Sé el primero en escribir una reseña</p></div>`}
    </div>
    <div id="panel-foro" style="display:none">
      <div id="foroMsgs" style="min-height:200px"></div>
      ${
        currentUser
          ? `
        <div style="display:flex;gap:.75rem;margin-top:1rem;align-items:flex-end">
          <textarea class="form-control" id="foroInput" placeholder="Escribe un mensaje..." style="resize:none;flex:1"></textarea>
          <button class="btn btn-primary" onclick="sendForo('libro','${id}')">Enviar</button>
        </div>
      `
          : `<p style="color:var(--muted);font-size:.875rem;margin-top:1rem"><a class="link" onclick="navigate('login')">Ingresa</a> para participar en el foro.</p>`
      }
    </div>
  </div>`;
  if (window.innerWidth < 600) {
    document.querySelector('[style*="grid-template-columns:260px"]').style.gridTemplateColumns = "1fr";
  }
}

function switchTab(t) {
  ["resenas", "foro"].forEach((x) => {
    $(`tab-${x}`).classList.toggle("active", x === t);
    $(`panel-${x}`).style.display = x === t ? "block" : "none";
  });
  if (t === "foro" && !$("foroMsgs").children.length)
    loadForo("libro", currentView.params.id);
}

function criticaCard(c) {
  const user = c.usuario;
  return `<div class="card" style="margin-bottom:1rem;cursor:pointer" onclick="navigate('critica-detalle',{id:'${c.id}'})">
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
        ${renderAvatar(user, 36)}
        <div>
          <div style="font-weight:600;font-size:.9rem">${user ? user.NombreUsuario : "Usuario"}</div>
          <div style="font-size:.75rem;color:var(--muted)">${c.fechaCreacion ? new Date(c.fechaCreacion.$date || c.fechaCreacion).toLocaleDateString("es-MX") : ""}</div>
        </div>
        <div style="margin-left:auto">${renderStars(c.Calificacion)}</div>
      </div>
      <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700">${c.Titulo || ""}</div>
      <div style="margin-top:.5rem;font-size:.875rem;color:var(--muted);overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">${(c.Contenido || "").replace(/<[^>]*>/g, "")}</div>
    </div>
  </div>`;
}

async function deleteLibro(id) {
  if (!confirm("¿Eliminar este libro?")) return;
  await api(`/api/libros/${id}`, "DELETE");
  toast("Libro eliminado");
  navigate("libros");
}

function renderLibroForm({ edit = false, libroId = null } = {}) {
  if (!currentUser) {
    navigate("login");
    return;
  }
  const libro = edit && libroId ? window._libroEditData || {} : {};
  const t = edit ? "Editar Libro" : "Subir Libro";
  app.innerHTML = `
  <div class="container" style="max-width:600px;padding:2rem 1.5rem">
    <div class="back-btn" onclick="history.back()">← Volver</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem">${t}</h2>
    <div class="form-group"><label class="form-label">Nombre del Libro *</label><input class="form-control" id="lNombre" value="${libro.NombreLibro || ""}"></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-control" id="lDesc">${libro.Descripcion || ""}</textarea></div>
    <div class="form-group"><label class="form-label">Calificación inicial</label>
      <div id="libCalStars">${renderStars(
        libro.Calificacion || 0,
        true,
        (v) => {
          window._libCal = v;
          document.querySelectorAll("#libCalStars .star").forEach((s, i) => {
            s.className = "star " + (i < v ? "on" : "");
            s.textContent = i < v ? "★" : "☆";
          });
        }
      )}</div>
    </div>
    <div class="form-group"><label class="form-label">Portada</label>
      <label class="file-input-label"><input type="file" id="lPortada" accept="image/*">🖼 Seleccionar portada<img class="img-preview" id="lPortadaPreview" ${libro.Portada ? `src="${libro.Portada}" style="display:block"` : ""}></label>
    </div>
    <div class="form-group"><label class="form-label">¿Dónde leer? (URLs, una por línea)</label>
      <textarea class="form-control" id="lDonde" placeholder="https://gutenberg.org/...">${(libro.DondeLeer || []).join("\n")}</textarea>
    </div>
    <button class="btn btn-primary" onclick="${edit ? `doEditLibro('${libro.id}')` : "doCreateLibro()"}">💾 Guardar</button>
  </div>`;
  setupFileInput("lPortada", "lPortadaPreview");
  window._libCal = libro.Calificacion || 0;
}

async function doCreateLibro() {
  const portada =
    $("lPortadaPreview").style.display != "none"
      ? $("lPortadaPreview").src
      : "";
  const body = {
    NombreLibro: $("lNombre").value.trim(),
    Descripcion: $("lDesc").value.trim(),
    Calificacion: window._libCal || 0,
    Portada: portada,
    DondeLeer: $("lDonde")
      .value.split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    idUsuarioCreador: currentUser.id || currentUser._id,
  };
  if (!body.NombreLibro) {
    toast("Nombre requerido", false);
    return;
  }
  const r = await api("/api/libros/", "POST", body);
  if (r.success) {
    toast("Libro creado");
    navigate("libro-detalle", { id: r.libro.id });
  } else toast("Error al crear", false);
}

async function doEditLibro(id) {
  const portada =
    $("lPortadaPreview").style.display != "none"
      ? $("lPortadaPreview").src
      : $("lPortadaPreview").src || "";
  const body = {
    NombreLibro: $("lNombre").value.trim(),
    Descripcion: $("lDesc").value.trim(),
    Calificacion: window._libCal || 0,
    Portada: portada,
    DondeLeer: $("lDonde")
      .value.split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  await api(`/api/libros/${id}`, "PUT", body);
  toast("Libro actualizado");
  navigate("libro-detalle", { id });
}
