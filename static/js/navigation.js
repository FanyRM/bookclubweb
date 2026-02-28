// ============================================================
// NAVIGATION
// ============================================================
function navigate(view, params = {}) {
  currentView = { view, params };
  render();
}

function render() {
  const { view, params } = currentView;
  const views = {
    home: renderHome,
    login: renderLogin,
    registro: renderRegistro,
    libros: renderLibros,
    "libro-detalle": renderLibroDetalle,
    "libro-form": renderLibroForm,
    criticas: renderCriticas,
    "critica-detalle": renderCriticaDetalle,
    "critica-form": renderCriticaForm,
    reuniones: renderReuniones,
    "reunion-detalle": renderReunionDetalle,
    "reunion-form": renderReunionForm,
    perfil: renderPerfil,
    "mi-perfil": () =>
      currentUser
        ? renderPerfil({ id: currentUser._id || currentUser.id })
        : renderLogin(),
    "editar-perfil": renderEditarPerfil,
  };
  (views[view] || renderHome)(params);
  window.scrollTo(0, 0);
}
