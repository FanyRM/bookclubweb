// ============================================================
// FORO
// ============================================================
async function loadForo(tipo, refId) {
  const msgs = await api(
    `/api/foros/mensajes?tipo=${tipo}&refId=${refId}`
  );
  const container = $("foroMsgs");
  if (!container) return;
  if (!msgs.length) {
    container.innerHTML = `<div class="empty-state" style="padding:1.5rem"><div class="icon">💬</div><p>Sé el primero en comentar</p></div>`;
    return;
  }
  container.innerHTML = msgs
    .map(
      (m) => `
    <div class="foro-msg">
      <div class="foro-avatar">${m.usuario && m.usuario.fotoDePerfil ? `<img src="${m.usuario.fotoDePerfil}">` : avatarInitials(m.usuario)}</div>
      <div class="foro-bubble">
        <div class="foro-meta"><strong onclick="navigate('perfil',{id:'${m.idUsuario}'})">${m.usuario?.NombreUsuario || "Usuario"}</strong> · ${m.fechaCreacion ? new Date(m.fechaCreacion.$date || m.fechaCreacion).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
        <div class="foro-text">${m.Contenido}</div>
      </div>
    </div>`
    )
    .join("");
}

async function sendForo(tipo, refId) {
  const input = $("foroInput");
  const texto = input.value.trim();
  if (!texto) return;
  const r = await api("/api/foros/mensajes", "POST", {
    tipo,
    refId,
    idUsuario: currentUser.id || currentUser._id,
    Contenido: texto,
  });
  if (r.success) {
    input.value = "";
    loadForo(tipo, refId);
  }
}
