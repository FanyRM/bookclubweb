// ============================================================
// REUNIONES
// ============================================================
function renderReuniones() {
  app.innerHTML = `
  <div class="page-header"><div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem">
      <div><h2>Reuniones</h2><p>Encuentros de nuestra comunidad</p></div>
      ${currentUser ? `<button class="btn btn-primary" onclick="navigate('reunion-form')">＋ Crear reunión</button>` : ""}
    </div>
  </div></div>
  <div class="container section">
    <div id="reunionesGrid" class="grid grid-2"><div class="skel" style="height:140px"></div><div class="skel" style="height:140px"></div></div>
  </div>`;
  api("/api/reuniones/").then((reuniones) => {
    const g = $("reunionesGrid");
    if (reuniones.length)
      g.innerHTML = reuniones.map((r) => reunionCard(r)).join("");
    else
      g.innerHTML = `<div class="empty-state"><div class="icon">📅</div><p>Sin reuniones</p></div>`;
  });
}

async function renderReunionDetalle({ id }) {
  app.innerHTML = `<div class="container section"><div class="skel" style="height:400px"></div></div>`;
  const r = await api(`/api/reuniones/${id}`);
  const isOwner =
    currentUser &&
    (currentUser.id === r.IdUsuarioCreador ||
      currentUser._id === r.IdUsuarioCreador);
  const fecha = r.ReunionRecurrente
    ? `Todos los <strong>${r.DiaSemana}</strong> a las <strong>${r.Hora}</strong>`
    : `<strong>${r.FechaReunion || ""}</strong> a las <strong>${r.Hora || ""}</strong>`;
  const lat = r.Lugar?.Latitud || 0,
    lng = r.Lugar?.Longitud || 0;
  app.innerHTML = `
  <div class="container section">
    <div class="back-btn" onclick="navigate('reuniones')">← Reuniones</div>
    <div style="display:flex;align-items:start;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem">
      <div>
        <h1 style="font-family:'Playfair Display',serif;font-size:2rem">${r.NombreReunion}</h1>
        <div style="margin-top:.5rem;display:flex;gap:.75rem;flex-wrap:wrap;align-items:center">
          <span class="reunion-status status-${r.status}">${r.status}</span>
          ${r.ReunionRecurrente ? `<span class="badge">Recurrente</span>` : ""}
        </div>
      </div>
      ${
        isOwner
          ? `<div style="display:flex;gap:.5rem">
        <button class="btn btn-ghost btn-sm" onclick="navigate('reunion-form',{edit:true,reunion:${JSON.stringify({ id: r.id, NombreReunion: r.NombreReunion, ReunionRecurrente: r.ReunionRecurrente, Lugar: r.Lugar, DescripcionReunion: r.DescripcionReunion, status: r.status, DiaSemana: r.DiaSemana, Hora: r.Hora, FechaReunion: r.FechaReunion }).replace(/"/g, "&quot;")}})">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteReunion('${id}')">🗑 Eliminar</button>
      </div>`
          : ""
      }
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
      <div style="background:var(--cream);padding:1.25rem;border-radius:10px">
        <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:.75rem">Detalles</div>
        <p>🕐 ${fecha}</p>
        <p style="margin-top:.5rem">📍 ${r.Lugar?.Direccion || "Sin dirección especificada"}</p>
        ${r.creador ? `<p style="margin-top:.5rem">👤 Organiza: <a class="link" onclick="navigate('perfil',{id:'${r.creador.id}'})">${r.creador.NombreUsuario}</a></p>` : ""}
        ${r.DescripcionReunion ? `<p style="margin-top:.75rem;color:var(--muted)">${r.DescripcionReunion}</p>` : ""}
      </div>
      <div>
        <div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:.75rem">Ubicación</div>
        <div id="map">${lat && lng ? `<iframe width="100%" height="100%" frameborder="0" src="https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}" style="border-radius:10px"></iframe>` : "📍 Coordenadas no especificadas"}</div>
      </div>
    </div>
    <hr class="divider">
    <div class="section-title">💬 Foro de la Reunión</div>
    <div id="foroMsgs" style="min-height:100px"></div>
    ${
      currentUser
        ? `
      <div style="display:flex;gap:.75rem;margin-top:1rem;align-items:flex-end">
        <textarea class="form-control" id="foroInput" placeholder="Escribe un mensaje..." style="resize:none;flex:1;min-height:70px"></textarea>
        <button class="btn btn-primary" onclick="sendForo('reunion','${id}')">Enviar</button>
      </div>
    `
        : `<p style="color:var(--muted);font-size:.875rem;margin-top:1rem"><a class="link" onclick="navigate('login')">Ingresa</a> para participar.</p>`
    }
  </div>`;
  if (window.innerWidth < 640)
    document.querySelector('[style*="grid-template-columns:1fr 1fr"]').style.gridTemplateColumns = "1fr";
  loadForo("reunion", id);
}

async function deleteReunion(id) {
  if (!confirm("¿Eliminar esta reunión?")) return;
  await api(`/api/reuniones/${id}`, "DELETE");
  toast("Reunión eliminada");
  navigate("reuniones");
}

function renderReunionForm({ edit = false, reunion = {} } = {}) {
  if (!currentUser) {
    navigate("login");
    return;
  }
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const lat = reunion.Lugar?.Latitud || 19.4326;
  const lng = reunion.Lugar?.Longitud || -99.1332;
  
  app.innerHTML = `
  <div class="container" style="max-width:700px;padding:2rem 1.5rem">
    <div class="back-btn" onclick="navigate('reuniones')">← Reuniones</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:1.5rem">${edit ? "Editar Reunión" : "Nueva Reunión"}</h2>
    <div class="form-group"><label class="form-label">Nombre de la reunión *</label><input class="form-control" id="rnNombre" value="${reunion.NombreReunion || ""}"></div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-control" id="rnDesc">${reunion.DescripcionReunion || ""}</textarea></div>
    <div class="form-group"><label class="form-label">Estado</label>
      <select class="form-control" id="rnStatus">
        ${["activa", "cancelada", "finalizada"].map((s) => `<option value="${s}" ${reunion.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">📍 Ubicación (haz clic en el mapa)</label>
      <div style="position:relative">
        <div id="mapPicker" style="height:300px;border-radius:10px;border:1px solid var(--border);margin-bottom:.75rem"></div>
        <button class="btn btn-primary btn-sm map-locate-btn" onclick="locateMe()" title="Ir a mi ubicación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
      <input class="form-control" id="rnDir" placeholder="Dirección" value="${reunion.Lugar?.Direccion || ""}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem">
        <input class="form-control" id="rnLat" placeholder="Latitud" readonly value="${lat}">
        <input class="form-control" id="rnLng" placeholder="Longitud" readonly value="${lng}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" style="display:flex;align-items:center;gap:.5rem">
        <input type="checkbox" id="rnRecurrente" ${reunion.ReunionRecurrente ? "checked" : ""} onchange="toggleRecurrente()"> Reunión Recurrente
      </label>
    </div>
    <div id="recurrenteFields" style="display:${reunion.ReunionRecurrente ? "block" : "none"}">
      <div class="form-group"><label class="form-label">Día de la semana</label>
        <select class="form-control" id="rnDia">${dias.map((d) => `<option value="${d}" ${reunion.DiaSemana === d ? "selected" : ""}>${d}</option>`).join("")}</select>
      </div>
    </div>
    <div id="fechaField" style="display:${reunion.ReunionRecurrente ? "none" : "block"}">
      <div class="form-group"><label class="form-label">Fecha</label><input class="form-control" id="rnFecha" type="date" value="${reunion.FechaReunion || ""}"></div>
    </div>
    <div class="form-group"><label class="form-label">Hora</label><input class="form-control" id="rnHora" type="time" value="${reunion.Hora || ""}"></div>
    <button class="btn btn-primary" onclick="${edit ? `doEditReunion('${reunion.id}')` : "doCreateReunion()"}">💾 Guardar</button>
  </div>`;
  
  // Inicializar mapa
  setTimeout(() => initMapPicker(lat, lng), 100);
}

let _mapPicker = null;
let _mapMarker = null;

function initMapPicker(lat, lng) {
  if (_mapPicker) _mapPicker.remove();
  
  _mapPicker = L.map('mapPicker').setView([lat, lng], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(_mapPicker);
  
  _mapMarker = L.marker([lat, lng], { draggable: true }).addTo(_mapPicker);
  
  // Actualizar coordenadas al arrastrar marcador
  _mapMarker.on('dragend', function(e) {
    const pos = e.target.getLatLng();
    $("rnLat").value = pos.lat.toFixed(6);
    $("rnLng").value = pos.lng.toFixed(6);
  });
  
  // Actualizar marcador al hacer clic en el mapa
  _mapPicker.on('click', function(e) {
    _mapMarker.setLatLng(e.latlng);
    $("rnLat").value = e.latlng.lat.toFixed(6);
    $("rnLng").value = e.latlng.lng.toFixed(6);
  });
}

function locateMe() {
  if (!navigator.geolocation) {
    toast('Geolocalización no disponible', false);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      _mapPicker.setView([lat, lng], 15);
      _mapMarker.setLatLng([lat, lng]);
      $("rnLat").value = lat.toFixed(6);
      $("rnLng").value = lng.toFixed(6);
      toast('📍 Ubicación encontrada');
    },
    () => toast('No se pudo obtener ubicación', false)
  );
}

function toggleRecurrente() {
  const rec = $("rnRecurrente").checked;
  $("recurrenteFields").style.display = rec ? "block" : "none";
  $("fechaField").style.display = rec ? "none" : "block";
}

async function doCreateReunion() {
  const recurrente = $("rnRecurrente").checked;
  const body = {
    NombreReunion: $("rnNombre").value.trim(),
    DescripcionReunion: $("rnDesc").value.trim(),
    status: $("rnStatus").value,
    Lugar: {
      Latitud: parseFloat($("rnLat").value) || 0,
      Longitud: parseFloat($("rnLng").value) || 0,
      Direccion: $("rnDir").value.trim(),
    },
    ReunionRecurrente: recurrente,
    IdUsuarioCreador: currentUser.id || currentUser._id,
    Hora: $("rnHora").value,
  };
  if (recurrente) body.DiaSemana = $("rnDia").value;
  else body.FechaReunion = $("rnFecha").value;
  if (!body.NombreReunion) {
    toast("Nombre requerido", false);
    return;
  }
  const r = await api("/api/reuniones/", "POST", body);
  if (r.success) {
    toast("Reunión creada");
    navigate("reunion-detalle", { id: r.reunion.id });
  } else toast("Error", false);
}

async function doEditReunion(id) {
  const recurrente = $("rnRecurrente").checked;
  const body = {
    NombreReunion: $("rnNombre").value.trim(),
    DescripcionReunion: $("rnDesc").value.trim(),
    status: $("rnStatus").value,
    Lugar: {
      Latitud: parseFloat($("rnLat").value) || 0,
      Longitud: parseFloat($("rnLng").value) || 0,
      Direccion: $("rnDir").value.trim(),
    },
    ReunionRecurrente: recurrente,
    Hora: $("rnHora").value,
  };
  if (recurrente) body.DiaSemana = $("rnDia").value;
  else body.FechaReunion = $("rnFecha").value;
  await api(`/api/reuniones/${id}`, "PUT", body);
  toast("Reunión actualizada");
  navigate("reunion-detalle", { id });
}
