/* Inducción al Voluntariado · Fundación Felipe Motta
   Navegación por pasos + envío del formulario de confirmación.
   Sin dependencias. */

(function () {
  "use strict";

  /* Pega aquí la URL de la implementación del Apps Script.
     Si se deja vacío, el formulario funciona en modo demostración
     (no registra nada, solo muestra la pantalla de confirmación). */
  const ENDPOINT = "";

  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var total = steps.length;
  var progress = document.getElementById("progress");
  var progressFill = document.getElementById("progressFill");
  var actual = 1;

  /* ---------------- navegación por pasos ---------------- */

  function pintar(n) {
    for (var i = 0; i < steps.length; i++) {
      steps[i].hidden = (i + 1) !== n;
    }
    if (progressFill) {
      progressFill.style.width = ((n / total) * 100).toFixed(4) + "%";
    }
    if (progress) {
      progress.setAttribute("aria-valuenow", String(n));
    }
    actual = n;
  }

  function ir(n, empujarHistorial) {
    if (n < 1 || n > total) { return; }
    pintar(n);
    window.scrollTo(0, 0);
    if (empujarHistorial) {
      try {
        window.history.pushState({ paso: n }, "", "#paso-" + n);
      } catch (e) { /* file:// no permite pushState */ }
    }
  }

  document.addEventListener("click", function (ev) {
    var next = ev.target.closest ? ev.target.closest("[data-next]") : null;
    if (next) { ir(actual + 1, true); return; }
    var back = ev.target.closest ? ev.target.closest("[data-back]") : null;
    if (back) { ir(actual - 1, true); }
  });

  window.addEventListener("popstate", function (ev) {
    var n = (ev.state && ev.state.paso) ? ev.state.paso : 1;
    pintar(n);
    window.scrollTo(0, 0);
  });

  /* Siempre se arranca en el paso 1: al último paso solo se llega avanzando. */
  pintar(1);
  try {
    window.history.replaceState({ paso: 1 }, "", "#paso-1");
  } catch (e) { /* file:// no permite replaceState */ }

  /* ---------------- formulario ---------------- */

  var form = document.getElementById("formConfirmacion");
  if (!form) { return; }

  var fNombre = document.getElementById("fNombre");
  var fCorreo = document.getElementById("fCorreo");
  var fDepto = document.getElementById("fDepto");
  var chk = [
    document.getElementById("chk1"),
    document.getElementById("chk2"),
    document.getElementById("chk3")
  ];
  var error = document.getElementById("formError");
  var boton = document.getElementById("btnEnviar");
  var ok = document.getElementById("confirmacionOk");
  var okTitulo = document.getElementById("confirmacionTitulo");
  var okFecha = document.getElementById("confirmacionFecha");

  var MSG_INCOMPLETO = "Por favor completa tu nombre, correo y marca las tres casillas antes de confirmar.";
  var MSG_CORREO = "Revisa tu correo electrónico: parece que tiene un error.";
  var MSG_ENVIO = "No pudimos registrar tu confirmación. Revisa tu conexión e inténtalo de nuevo.";

  function mostrarError(texto) {
    error.textContent = texto;
    error.hidden = false;
  }

  function limpiarError() {
    error.hidden = true;
    error.textContent = "";
  }

  function correoValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);
  }

  function fechaLarga(d) {
    try {
      return d.toLocaleDateString("es-PA", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function enviar(payload) {
    if (!ENDPOINT) {
      // Modo demostración: sin backend configurado.
      console.log("ENDPOINT vacío. Payload que se enviaría:", payload);
      return new Promise(function (resolve) { setTimeout(resolve, 600); });
    }
    // text/plain + no-cors evita el preflight CORS que Apps Script no puede responder.
    // La respuesta es opaca: si la promesa resuelve, damos el envío por bueno.
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    var nombre = (fNombre.value || "").trim();
    var correo = (fCorreo.value || "").trim();
    var departamento = (fDepto.value || "").trim();
    var marcadas = chk[0].checked && chk[1].checked && chk[2].checked;

    if (!nombre || !correo || !marcadas) {
      mostrarError(MSG_INCOMPLETO);
      return;
    }
    if (!correoValido(correo)) {
      mostrarError(MSG_CORREO);
      fCorreo.focus();
      return;
    }
    limpiarError();

    var ahora = new Date();
    var payload = {
      nombre: nombre,
      correo: correo,
      departamento: departamento,
      fecha: ahora.toISOString(),
      confirmaciones: [chk[0].checked, chk[1].checked, chk[2].checked]
    };

    boton.disabled = true;
    boton.textContent = "Enviando…";

    enviar(payload).then(function () {
      form.hidden = true;
      okTitulo.textContent = "Listo, " + nombre.split(/\s+/)[0] + ".";
      okFecha.textContent = "Tu inducción quedó registrada el " + fechaLarga(ahora) + ".";
      ok.hidden = false;
      if (progressFill) { progressFill.style.width = "100%"; }
      window.scrollTo(0, 0);
      try { ok.focus(); } catch (e) { /* sin foco no pasa nada */ }
    })["catch"](function () {
      boton.disabled = false;
      boton.textContent = "Confirmar inducción";
      mostrarError(MSG_ENVIO);
    });
  });
})();
