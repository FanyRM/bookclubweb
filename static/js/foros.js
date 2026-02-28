// ============================================================
// FORO
// ============================================================
let _foroMsgs = [];
let _foroTipo = null;
let _foroRefId = null;

async function loadForo(tipo, refId) {
  _foroTipo = tipo;
  _foroRefId = refId;
  _foroMsgs = await api(
    `/api/foros/mensajes?tipo=${tipo}&refId=${refId}`
  );
  renderForo();
}

function renderForo() {
  const container = $("foroMsgs");
  if (!container) return;
  if (!_foroMsgs.length) {
    container.innerHTML = `<div class="empty-state" style="padding:1.5rem"><div class="icon">💬</div><p>Sé el primero en comentar</p></div>`;
    return;
  }
  
  // Organizar mensajes en hilos
  const threads = _foroMsgs.filter(m => !m.idMensajePadre);
  const replies = _foroMsgs.filter(m => m.idMensajePadre);
  
  container.innerHTML = threads.map(m => {
    const childReplies = replies.filter(r => r.idMensajePadre === m.id);
    return renderMensaje(m, childReplies);
  }).join("");
}

function renderMensaje(m, replies = []) {
  const canDelete = currentUser && (currentUser.id === m.idUsuario || currentUser._id === m.idUsuario);
  return `
    <div class="foro-msg" data-msg-id="${m.id}">
      <div class="foro-avatar">${m.usuario && m.usuario.fotoDePerfil ? `<img src="${m.usuario.fotoDePerfil}">` : avatarInitials(m.usuario)}</div>
      <div class="foro-bubble">
        <div class="foro-meta">
          <strong onclick="navigate('perfil',{id:'${m.idUsuario}'})">${m.usuario?.NombreUsuario || "Usuario"}</strong> · 
          ${m.fechaCreacion ? new Date(m.fechaCreacion.$date || m.fechaCreacion).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : ""}
          ${canDelete ? `<span class="foro-delete" onclick="deleteForo('${m.id}')" title="Eliminar">🗑</span>` : ""}
        </div>
        <div class="foro-text">${m.Contenido}</div>
        ${currentUser ? `<div class="foro-reply-btn" onclick="toggleReplyBox('${m.id}')">↩️ Responder</div>` : ""}
        <div class="foro-reply-box" id="reply-${m.id}" style="display:none">
          <textarea class="form-control" id="reply-input-${m.id}" placeholder="Escribe tu respuesta..." style="resize:none;margin-top:.5rem"></textarea>
          <div style="display:flex;gap:.5rem;margin-top:.5rem">
            <button class="btn btn-primary btn-sm" onclick="sendReply('${m.id}')">Enviar</button>
            <button class="btn btn-ghost btn-sm" onclick="toggleReplyBox('${m.id}')">Cancelar</button>
          </div>
        </div>
        ${replies.length ? `<div class="foro-replies">${replies.map(r => renderReply(r)).join("")}</div>` : ""}
      </div>
    </div>`;
}

function renderReply(r) {
  const canDelete = currentUser && (currentUser.id === r.idUsuario || currentUser._id === r.idUsuario);
  return `
    <div class="foro-reply" data-msg-id="${r.id}">
      <div class="foro-avatar">${r.usuario && r.usuario.fotoDePerfil ? `<img src="${r.usuario.fotoDePerfil}">` : avatarInitials(r.usuario)}</div>
      <div class="foro-bubble">
        <div class="foro-meta">
          <strong onclick="navigate('perfil',{id:'${r.idUsuario}'})">${r.usuario?.NombreUsuario || "Usuario"}</strong> · 
          ${r.fechaCreacion ? new Date(r.fechaCreacion.$date || r.fechaCreacion).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : ""}
          ${canDelete ? `<span class="foro-delete" onclick="deleteForo('${r.id}')" title="Eliminar">🗑</span>` : ""}
        </div>
        <div class="foro-text">${r.Contenido}</div>
      </div>
    </div>`;
}

function toggleReplyBox(msgId) {
  const box = $(`reply-${msgId}`);
  if (!box) return;
  const isHidden = box.style.display === "none";
  box.style.display = isHidden ? "block" : "none";
  if (isHidden) $(`reply-input-${msgId}`).focus();
}

async function sendReply(parentId) {
  const input = $(`reply-input-${parentId}`);
  const texto = input.value.trim();
  if (!texto) return;
  const r = await api("/api/foros/mensajes", "POST", {
    tipo: _foroTipo,
    refId: _foroRefId,
    idUsuario: currentUser.id || currentUser._id,
    Contenido: texto,
    idMensajePadre: parentId
  });
  if (r.success) {
    input.value = "";
    toggleReplyBox(parentId);
    loadForo(_foroTipo, _foroRefId);
  }
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

async function deleteForo(msgId) {
  if (!confirm("¿Eliminar este mensaje?")) return;
  await api(`/api/foros/mensajes/${msgId}`, "DELETE");
  loadForo(_foroTipo, _foroRefId);
}
