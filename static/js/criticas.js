// ============================================================
// CRITICAS
// ============================================================
function renderCriticas() {
  app.innerHTML = `
  <div class="page-header"><div class="container">
    <h2>Reseñas & Críticas</h2><p>Lo que la comunidad piensa de los libros</p>
  </div></div>
  <div class="container section">
    <div id="criticasGrid" class="grid grid-2"><div class="skel" style="height:160px"></div><div class="skel" style="height:160px"></div></div>
  </div>`;
  api("/api/criticas/").then((criticas) => {
    const g = $("criticasGrid");
    if (criticas.length)
      g.innerHTML = criticas.map((c) => criticaCard(c)).join("");
    else
      g.innerHTML = `<div class="empty-state"><div class="icon">✍️</div><p>Aún no hay reseñas</p></div>`;
  });
}

async function renderCriticaDetalle({ id }) {
  app.innerHTML = `<div class="container section"><div class="skel" style="height:400px"></div></div>`;
  const c = await api(`/api/criticas/${id}`);
  const isOwner =
    currentUser &&
    (currentUser.id === c.idUsuario || currentUser._id === c.idUsuario);
  app.innerHTML = `
  <div class="container section" style="max-width:760px">
    <div class="back-btn" onclick="navigate('libros')">← Volver</div>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem">
      ${renderAvatar(c.usuario, 48)}
      <div>
        <div style="font-weight:600"><a class="link" onclick="navigate('perfil',{id:'${c.usuario?.id || c.idUsuario}'})">${c.usuario?.NombreUsuario || "Usuario"}</a></div>
        <div style="font-size:.8rem;color:var(--muted)">${c.fechaCreacion ? new Date(c.fechaCreacion.$date || c.fechaCreacion).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }) : ""}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:.75rem;align-items:center">
        ${renderStars(c.Calificacion)}
        ${
          isOwner
            ? `<button class="btn btn-ghost btn-sm" onclick="navigate('critica-form',{edit:true,critica:${JSON.stringify({ id: c.id, Titulo: c.Titulo, Calificacion: c.Calificacion, idLibro: c.idLibro }).replace(/"/g, "&quot;")}})">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCritica('${id}')">🗑</button>`
            : ""
        }
      </div>
    </div>
    ${
      c.libro
        ? `<div style="display:flex;align-items:center;gap:.75rem;padding:.75rem;background:var(--cream);border-radius:var(--r);margin-bottom:1.5rem;cursor:pointer" onclick="navigate('libro-detalle',{id:'${c.libro.id}'})">
      ${c.libro.Portada ? `<img src="${c.libro.Portada}" style="width:40px;height:56px;object-fit:cover;border-radius:4px">` : ``}
      <div><div style="font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Sobre el libro</div><div style="font-weight:600">${c.libro.NombreLibro}</div></div>
    </div>`
        : ""
    }
    <h1 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:1.5rem;line-height:1.25">${c.Titulo || ""}</h1>
    <div class="critica-content">${c.Contenido || ""}</div>
  </div>`;
}

async function deleteCritica(id) {
  if (!confirm("¿Eliminar esta reseña?")) return;
  await api(`/api/criticas/${id}`, "DELETE");
  toast("Reseña eliminada");
  navigate("criticas");
}

function renderCriticaForm({
  edit = false,
  critica = {},
  idLibro = "",
  nombreLibro = "",
} = {}) {
  if (!currentUser) {
    navigate("login");
    return;
  }
  app.innerHTML = `
  <div class="container" style="max-width:760px;padding:2rem 1.5rem">
    <div class="back-btn" onclick="history.back()">← Volver</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem">${edit ? "Editar Reseña" : "Nueva Reseña"}</h2>
    ${idLibro || critica.idLibro ? `<div style="background:var(--cream);padding:.75rem 1rem;border-radius:var(--r);margin-bottom:1.5rem;font-size:.875rem">📖 <strong>${nombreLibro || "Libro seleccionado"}</strong></div>` : ""}
    <div class="form-group"><label class="form-label">Título</label><input class="form-control" id="cTitulo" value="${critica.Titulo || ""}"></div>
    <div class="form-group"><label class="form-label">Calificación</label>
      <div id="cCalStars">${renderStars(
        critica.Calificacion || 0,
        true,
        (v) => {
          window._cCal = v;
          document.querySelectorAll("#cCalStars .star").forEach((s, i) => {
            s.className = "star " + (i < v ? "on" : "");
            s.textContent = i < v ? "★" : "☆";
          });
        }
      )}</div>
    </div>
    <div class="form-group"><label class="form-label">Reseña / Crítica</label>
      <div id="quillEditor" style="border:1.5px solid var(--border);border-radius:var(--r)"></div>
    </div>
    <button class="btn btn-primary" style="margin-top:1rem" onclick="${edit ? `doEditCritica('${critica.id}')` : "doCreateCritica()"}">💾 Publicar</button>
  </div>`;
  window._cCal = critica.Calificacion || 0;
  quillEditor = new Quill("#quillEditor", {
    theme: "snow",
    placeholder: "Escribe tu reseña aquí...",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        ["blockquote"],
        ["link"],
        ["clean"],
      ],
    },
  });
  if (edit && critica.Contenido_raw)
    quillEditor.root.innerHTML = critica.Contenido_raw;
}

async function doCreateCritica() {
  const idLibro = currentView.params.idLibro;
  const body = {
    idLibro,
    idUsuario: currentUser.id || currentUser._id,
    Titulo: $("cTitulo").value.trim(),
    Calificacion: window._cCal || 0,
    Contenido: quillEditor.root.innerHTML,
  };
  if (!body.Titulo) {
    toast("Título requerido", false);
    return;
  }
  const r = await api("/api/criticas/", "POST", body);
  if (r.success) {
    toast("Reseña publicada");
    navigate("critica-detalle", { id: r.critica.id });
  } else toast("Error", false);
}

async function doEditCritica(id) {
  const body = {
    Titulo: $("cTitulo").value.trim(),
    Calificacion: window._cCal || 0,
    Contenido: quillEditor.root.innerHTML,
  };
  await api(`/api/criticas/${id}`, "PUT", body);
  toast("Reseña actualizada");
  navigate("critica-detalle", { id });
}
