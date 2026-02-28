// ============================================================
// PERFIL
// ============================================================
async function renderPerfil({ id }) {
  app.innerHTML = `<div class="skel" style="height:200px"></div>`;
  const u = await api(`/api/usuarios/${id}`);
  const isMe =
    currentUser && (currentUser.id === id || currentUser._id === id);
  const fotoHtml = u.fotoDePerfil
    ? `<img src="${u.fotoDePerfil}" style="width:100%;height:100%;object-fit:cover">`
    : avatarInitials(u);
  app.innerHTML = `
  <div class="profile-banner">
    <div class="profile-avatar">${fotoHtml}</div>
  </div>
  <div class="profile-info container">
    <div style="display:flex;align-items:start;justify-content:space-between;flex-wrap:wrap;gap:1rem">
      <div>
        <div class="profile-name">${u.Nombre || ""} ${u.ApellidoP || ""} ${u.ApellidoM || ""}</div>
        <div class="profile-username">@${u.NombreUsuario}</div>
        ${u.Descripcion ? `<p style="margin-top:.75rem;max-width:560px;color:var(--muted)">${u.Descripcion}</p>` : ""}
        ${u.Etiquetas && u.Etiquetas.length ? `<div class="profile-tags">${u.Etiquetas.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
      </div>
      ${isMe ? `<button class="btn btn-ghost" onclick="navigate('editar-perfil')">✏️ Editar perfil</button>` : ""}
    </div>
  </div>
  <div class="container section">
    <div class="tabs">
      <div class="tab active" id="ptab-libros" onclick="switchPTab('libros')">📚 Libros (${u.libros?.length || 0})</div>
      <div class="tab" id="ptab-criticas" onclick="switchPTab('criticas')">✍️ Reseñas (${u.criticas?.length || 0})</div>
    </div>
    <div id="ppanel-libros">
      ${u.libros && u.libros.length ? `<div class="grid grid-3">${u.libros.map((l) => bookCard(l)).join("")}</div>` : `<div class="empty-state"><div class="icon">📭</div><p>Sin libros</p></div>`}
    </div>
    <div id="ppanel-criticas" style="display:none">
      ${u.criticas && u.criticas.length ? u.criticas.map((c) => criticaCard({ ...c, usuario: u })).join("") : `<div class="empty-state"><div class="icon">✍️</div><p>Sin reseñas</p></div>`}
    </div>
    ${
      u.youtubeChannelId
        ? `
      <div class="section-title" style="margin-top:2rem">📺 Videos de YouTube</div>
      <div id="youtubeVideos" style="margin-bottom:2rem">
        <div class="grid grid-3">
          <div class="skel" style="height:200px"></div>
          <div class="skel" style="height:200px"></div>
          <div class="skel" style="height:200px"></div>
        </div>
      </div>
    `
        : ""
    }
  </div>`;
  if (u.youtubeChannelId) loadYoutubeVideos(u.youtubeChannelId);
}

function switchPTab(t) {
  ["libros", "criticas"].forEach((x) => {
    $(`ptab-${x}`).classList.toggle("active", x === t);
    $(`ppanel-${x}`).style.display = x === t ? "block" : "none";
  });
}

async function renderEditarPerfil() {
  if (!currentUser) {
    navigate("login");
    return;
  }
  const u = await api(`/api/usuarios/${currentUser.id || currentUser._id}`);
  app.innerHTML = `
  <div class="container" style="max-width:560px;padding:2rem 1.5rem">
    <div class="back-btn" onclick="navigate('mi-perfil')">← Mi perfil</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem">Editar Perfil</h2>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="epNombre" value="${u.Nombre || ""}"></div>
      <div class="form-group"><label class="form-label">Apellido Paterno</label><input class="form-control" id="epApP" value="${u.ApellidoP || ""}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Apellido Materno</label><input class="form-control" id="epApM" value="${u.ApellidoM || ""}"></div>
      <div class="form-group"><label class="form-label">Edad</label><input class="form-control" id="epEdad" value="${u.Edad || ""}"></div>
    </div>
    <div class="form-group"><label class="form-label">Correo</label><input class="form-control" id="epEmail" value="${u.correoElectronico || ""}"></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-control" id="epDesc">${u.Descripcion || ""}</textarea></div>
    <div class="form-group"><label class="form-label">Etiquetas (separadas por coma)</label><input class="form-control" id="epEtiq" value="${(u.Etiquetas || []).join(", ")}"></div>
    <div class="form-group"><label class="form-label">Nueva contraseña (dejar vacío para no cambiar)</label><input class="form-control" type="password" id="epPass"></div>
    <div class="form-group"><label class="form-label">Foto de perfil</label>
      <label class="file-input-label"><input type="file" id="epFoto" accept="image/*">📷 Cambiar foto<img class="img-preview" id="epFotoPreview" ${u.fotoDePerfil ? `src="${u.fotoDePerfil}" style="display:block"` : ""}></label>
    </div>
    <div class="form-group">
      <label class="form-label">Canal de YouTube (opcional)</label>
        <input class="form-control" id="epYoutube" placeholder="@tu_canal o URL completa" value="${u.youtubeChannelId || ""}">
        <div style="font-size:.75rem;color:var(--muted);margin-top:.25rem">Ingresa tu @handle, ID del canal o URL</div>
      </div>
    <button class="btn btn-primary" onclick="doEditarPerfil('${u.id}')">💾 Guardar cambios</button>
  </div>`;
  setupFileInput("epFoto", "epFotoPreview");
}

async function doEditarPerfil(id) {
  const fotoEl = $("epFotoPreview");
  const foto = fotoEl && fotoEl.style.display != "none" ? fotoEl.src : "";

  let youtubeInput = $("epYoutube").value.trim();
  if (youtubeInput) {
    if (youtubeInput.includes("youtube.com/")) {
      const match = youtubeInput.match(
        /youtube\.com\/@([^\/\?]+)|youtube\.com\/channel\/([^\/\?]+)|youtube\.com\/c\/([^\/\?]+)/
      );
      if (match) {
        youtubeInput = match[1] || match[2] || match[3];
      }
    }
    youtubeInput = youtubeInput.replace("@", "");
  }

  const body = {
    Nombre: $("epNombre").value.trim(),
    ApellidoP: $("epApP").value.trim(),
    ApellidoM: $("epApM").value.trim(),
    Edad: $("epEdad").value,
    correoElectronico: $("epEmail").value.trim(),
    Descripcion: $("epDesc").value.trim(),
    Etiquetas: $("epEtiq")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    fotoDePerfil: foto,
    youtubeChannelId: youtubeInput,
  };
  const pass = $("epPass").value;
  if (pass) body.Password = pass;
  await api(`/api/usuarios/${id}`, "PUT", body);
  const me = await api("/api/auth/me");
  if (me.success) currentUser = me.user;
  updateNavUser();
  toast("Perfil actualizado");
  navigate("mi-perfil");
}

async function loadYoutubeVideos(channelId) {
  try {
    const r = await api(`/api/youtube/channel/${channelId}/videos`);
    const container = $("youtubeVideos");
    if (!container) return;

    if (r.success && r.videos.length) {
      container.innerHTML = `<div class="grid grid-3">${r.videos.map((v) => youtubeVideoCard(v)).join("")}</div>`;
    } else {
      container.innerHTML = `<div class="empty-state"><div class="icon">📹</div><p>No se encontraron videos</p></div>`;
    }
  } catch (e) {
    const container = $("youtubeVideos");
    if (container)
      container.innerHTML = `<div class="alert alert-error">Error al cargar videos de YouTube</div>`;
  }
}

function youtubeVideoCard(v) {
  return `<div class="card" style="cursor:pointer" onclick="window.open('https://www.youtube.com/watch?v=${v.id}','_blank')">
    <img class="card-img" src="${v.thumbnail}" alt="${v.title}" style="aspect-ratio:16/9">
    <div class="card-body">
      <div class="card-title" style="font-size:.95rem;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${v.title}</div>
      <div class="card-sub" style="margin-top:.5rem">${new Date(v.publishedAt).toLocaleDateString("es-MX")}</div>
    </div>
  </div>`;
}
