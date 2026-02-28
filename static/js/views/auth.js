// ============================================================
// AUTH
// ============================================================
async function checkAuth() {
  const r = await api("/api/auth/me");
  if (r.success) {
    currentUser = r.user;
    updateNavUser();
  }
}

function updateNavUser() {
  if (currentUser) {
    $("navUser").style.display = "flex";
    $("navAuth").style.display = "none";
    const av = $("navAvatar");
    if (currentUser.fotoDePerfil)
      av.innerHTML = `<img src="${currentUser.fotoDePerfil}">`;
    else av.textContent = avatarInitials(currentUser);
  } else {
    $("navUser").style.display = "none";
    $("navAuth").style.display = "flex";
  }
}

async function logout() {
  await api("/api/auth/logout", "POST");
  currentUser = null;
  updateNavUser();
  navigate("home");
  toast("Sesión cerrada");
}

function renderLogin() {
  app.innerHTML = `
  <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:2rem">
    <div style="width:100%;max-width:420px">
      <h2 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:1.5rem;text-align:center">Bienvenido de <em>vuelta</em></h2>
      <div id="loginAlert"></div>
      <div class="form-group">
        <label class="form-label">Nombre de usuario</label>
        <input class="form-control" id="loginUser" placeholder="tu_usuario">
      </div>
      <div class="form-group">
        <label class="form-label">Contraseña</label>
        <input class="form-control" type="password" id="loginPass" placeholder="••••••••" onkeyup="if(event.key==='Enter')doLogin()">
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="doLogin()">Ingresar</button>
      <p style="text-align:center;margin-top:1rem;color:var(--muted);font-size:.875rem">¿No tienes cuenta? <a class="link" onclick="navigate('registro')">Regístrate</a></p>
    </div>
  </div>`;
}

async function doLogin() {
  const NombreUsuario = $("loginUser").value.trim();
  const Password = $("loginPass").value;
  if (!NombreUsuario || !Password) return;
  const r = await api("/api/auth/login", "POST", {
    NombreUsuario,
    Password,
  });
  if (r.success) {
    currentUser = r.user;
    updateNavUser();
    navigate("home");
    toast("¡Bienvenido, " + currentUser.NombreUsuario + "!");
  } else {
    $("loginAlert").innerHTML =
      `<div class="alert alert-error">${r.error || "Error al ingresar"}</div>`;
  }
}

function renderRegistro() {
  app.innerHTML = `
  <div style="padding:2rem 0">
    <div class="container" style="max-width:560px">
      <h2 style="font-family:'Playfair Display',serif;font-size:2rem;margin-bottom:1.5rem">Crear <em>cuenta</em></h2>
      <div id="regAlert"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nombre</label><input class="form-control" id="rNombre" placeholder="Ana"></div>
        <div class="form-group"><label class="form-label">Apellido Paterno</label><input class="form-control" id="rApP" placeholder="García"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Apellido Materno</label><input class="form-control" id="rApM" placeholder="López"></div>
        <div class="form-group"><label class="form-label">Edad</label><input class="form-control" id="rEdad" placeholder="25" type="number"></div>
      </div>
      <div class="form-group"><label class="form-label">Correo Electrónico</label><input class="form-control" id="rEmail" type="email" placeholder="ana@ejemplo.com"></div>
      <div class="form-group"><label class="form-label">Nombre de usuario</label><input class="form-control" id="rUser" placeholder="ana_libros"></div>
      <div class="form-group"><label class="form-label">Contraseña</label><input class="form-control" id="rPass" type="password" placeholder="••••••••"></div>
      <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-control" id="rDesc" placeholder="Me apasionan los clásicos..."></textarea></div>
      <div class="form-group"><label class="form-label">Foto de perfil</label>
        <label class="file-input-label"><input type="file" id="regFoto" accept="image/*">📷 Seleccionar imagen<img class="img-preview" id="regFotoPreview"></label>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="doRegistro()">Crear cuenta</button>
      <p style="text-align:center;margin-top:1rem;color:var(--muted);font-size:.875rem">¿Ya tienes cuenta? <a class="link" onclick="navigate('login')">Ingresa</a></p>
    </div>
  </div>`;
  setupFileInput("regFoto", "regFotoPreview");
}

async function doRegistro() {
  const foto =
    $("regFotoPreview").src && $("regFotoPreview").style.display != "none"
      ? $("regFotoPreview").src
      : "";
  const body = {
    Nombre: $("rNombre").value.trim(),
    ApellidoP: $("rApP").value.trim(),
    ApellidoM: $("rApM").value.trim(),
    Edad: $("rEdad").value,
    correoElectronico: $("rEmail").value.trim(),
    NombreUsuario: $("rUser").value.trim(),
    Password: $("rPass").value,
    Descripcion: $("rDesc").value.trim(),
    fotoDePerfil: foto,
    Etiquetas: [],
  };
  if (
    !body.Nombre ||
    !body.NombreUsuario ||
    !body.Password ||
    !body.correoElectronico
  ) {
    $("regAlert").innerHTML =
      `<div class="alert alert-error">Completa los campos obligatorios</div>`;
    return;
  }
  const r = await api("/api/usuarios/", "POST", body);
  if (r.success) {
    toast("¡Cuenta creada! Ya puedes ingresar.");
    navigate("login");
  } else {
    $("regAlert").innerHTML =
      `<div class="alert alert-error">${r.error || "Error al registrarse"}</div>`;
  }
}
