// ============================================================
// UTILS
// ============================================================
const app = document.getElementById("app");
const $ = (id) => document.getElementById(id);

function toast(msg, ok = true) {
  const t = $("toast");
  t.textContent = msg;
  t.style.background = ok ? "#1a1208" : "#a63d2f";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

async function api(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  return res.json();
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function avatarInitials(u) {
  if (!u) return "?";
  return (
    (u.Nombre || "")[0] ||
    (u.NombreUsuario || "")[0] ||
    "?"
  ).toUpperCase();
}

function renderAvatar(u, size = 38) {
  if (u && u.fotoDePerfil)
    return `<img src="${u.fotoDePerfil}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover">`;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${size * 0.35}px;color:var(--ink);flex-shrink:0">${avatarInitials(u)}</div>`;
}

function renderStars(val = 0, editable = false, cb = null) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    const on = i <= val ? "on" : "";
    if (editable)
      html += `<span class="star ${on}" data-v="${i}" onclick="if(window._starCb)window._starCb(${i})">${i <= val ? "★" : "☆"}</span>`;
    else
      html += `<span class="star ${on}">${i <= val ? "★" : "☆"}</span>`;
  }
  html += "</div>";
  if (cb) window._starCb = cb;
  return html;
}

function setupFileInput(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input) return;
  input.onchange = async () => {
    if (input.files[0]) {
      const b64 = await toBase64(input.files[0]);
      if (preview) {
        preview.src = b64;
        preview.style.display = "block";
      }
    }
  };
}
