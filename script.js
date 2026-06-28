"use strict";

/* ==========================================================
   ZOVRAKE — script.js
   Lógica de autenticación con Supabase (Google OAuth)
   ========================================================== */

/* --------------------------------------------------------
   1. CONFIGURACIÓN DE SUPABASE
   --------------------------------------------------------
   NOTA DE SEGURIDAD: esta clave es la "publishable key"
   (anon key) de Supabase. Está diseñada para ser pública en
   el frontend — NO es un secreto. La seguridad real de los
   datos depende de tener Row Level Security (RLS) activado
   en cada tabla de tu base de datos en Supabase.
   -------------------------------------------------------- */

const SUPABASE_CONFIG = Object.freeze({
    url: "https://jbvuufbaipjxgcpfvunz.supabase.co",
    key: "sb_publishable_YTA9ngImZJ--TLdNhTod4w_yJxP_geE",
    redirectTo: "https://zovrake-web.vercel.app"
});

const supabaseClient = supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);


/* --------------------------------------------------------
   2. ELEMENTOS DEL DOM
   -------------------------------------------------------- */

const dom = {
    continueButton: document.getElementById("continue-zovrake"),
    heroSection: document.querySelector(".hero"),
    authScreen: document.querySelector(".auth-screen"),
    googleButton: document.getElementById("google-login"),
    onboardingScreen: document.querySelector(".onboarding-screen"),
    sessionEmail: document.getElementById("session-email"),


    termsCheckbox: document.getElementById("terms-checkbox"),
    createAccountButton: document.getElementById("create-account"),

    changeEmailButton: document.getElementById("change-email"),

   changeAccountScreen: document.querySelector(".screen-change-account"),
    changeAccountEmail: document.getElementById("change-account-email"),

    cancelChangeButton: document.getElementById("cancel-change"),
    confirmChangeButton: document.getElementById("confirm-change"),

    profileSetupScreen: document.querySelector(".profile-setup-screen"),
    profileNameInput: document.getElementById("profile-name"),
    profileContinueButton: document.getElementById("profile-continue"),

    emailInput: document.getElementById("email-zovrake"),
    emailContinueButton: document.getElementById("email-continue"),
    emailError: document.getElementById("email-error"),

    passwordScreen: document.querySelector(".password-setup-screen"),
    passwordAccountEmail: document.getElementById("password-account-email"),
    passwordCreateInput: document.getElementById("password-create"),
    passwordConfirmInput: document.getElementById("password-confirm"),

    togglePasswordCreate:
document.getElementById("toggle-password-create"),

togglePasswordConfirm:
document.getElementById("toggle-password-confirm"),

    passwordStrengthFill: document.getElementById("password-strength-fill"),
    passwordStrengthLabel: document.getElementById("password-strength-label"),
    passwordMatchMessage: document.getElementById("password-match-message"),
    passwordSetupError: document.getElementById("password-setup-error"),
    passwordContinueButton: document.getElementById("password-continue"),
    reqLength: document.getElementById("req-length"),
    reqUpper: document.getElementById("req-upper"),
    reqLower: document.getElementById("req-lower"),
    reqNumber: document.getElementById("req-number"),
    reqSpecial: document.getElementById("req-special"),

    dashboardScreen: document.querySelector(".dashboard-screen"),
    dashboardSidebar: document.getElementById("dashboard-sidebar"),
    dashboardMenuToggle: document.getElementById("dashboard-menu-toggle"),
    dashboardUserName: document.getElementById("dashboard-user-name"),
    dashboardWelcome: document.getElementById("dashboard-welcome"),
    welcomeUserName: document.getElementById("welcome-user-name"),
    profileViewName: document.getElementById("profile-view-name"),
    profileViewEmail: document.getElementById("profile-view-email"),
    moduloTitulo: document.getElementById("modulo-titulo"),
    logoutDialog: document.getElementById("logout-dialog"),
    logoutCancel: document.getElementById("logout-cancel"),
    logoutConfirm: document.getElementById("logout-confirm")
};

/**
 * Verifica que todos los elementos requeridos existan en el DOM.
 * Evita que un selector roto (id/clase mal escrita, HTML aún no
 * cargado) tumbe el resto del script con un TypeError.
 */
function verificarElementosDOM(elementos) {
    const faltantes = Object.entries(elementos)
        .filter(([, el]) => !el)
        .map(([nombre]) => nombre);

    if (faltantes.length > 0) {
        console.error(
            `[Zovrake] Elementos no encontrados en el DOM: ${faltantes.join(", ")}`
        );
        return false;
    }

    return true;
}

const domListo = verificarElementosDOM(dom);

/* ==========================================================
   OCULTAR TODAS LAS PANTALLAS
========================================================== */

function ocultarTodasLasPantallas() {

    dom.heroSection.style.display = "none";

    dom.authScreen.classList.remove("active");

    dom.onboardingScreen.classList.remove("active");

    dom.changeAccountScreen.classList.remove("active");

    dom.profileSetupScreen.classList.remove("active");

    dom.passwordScreen.classList.remove("active");

    dom.dashboardScreen.classList.remove("active");

}


/* --------------------------------------------------------
   3. CONTROL DE PANTALLAS (hero / auth-screen)
   -------------------------------------------------------- */

function mostrarPantallaAuth() {

    ocultarTodasLasPantallas();

    dom.authScreen.classList.add("active");

}

function ocultarPantallaAuth() {
    dom.authScreen.classList.remove("active");
    dom.heroSection.style.display = "none";
    // NOTA: aún no existe una sección de "dashboard" en el HTML.
    // Cuando exista, aquí se debe mostrar esa sección, por ejemplo:
    // dom.dashboardSection.classList.add("active");
}
//funciones de Fase 2.

function mostrarOnboarding(email) {

    ocultarTodasLasPantallas();

    dom.onboardingScreen.classList.add("active");

    dom.sessionEmail.textContent = email;

    dom.changeAccountEmail.textContent = email;

}

function mostrarPantallaCambioCuenta() {

    ocultarTodasLasPantallas();

    dom.changeAccountScreen.classList.add("active");

}

function ocultarPantallaCambioCuenta() {

    ocultarTodasLasPantallas();

    dom.onboardingScreen.classList.add("active");

}

function actualizarBotonCrearCuenta() {
    dom.createAccountButton.disabled =
        !dom.termsCheckbox.checked;
}

/* --------------------------------------------------------
   PANTALLA 5 - CONFIGURACIÓN INICIAL DEL PERFIL (NOMBRE)
   -------------------------------------------------------- */

// Límites de longitud del nombre (en caracteres ya recortados).
const NOMBRE_PERFIL_MIN = 2;
const NOMBRE_PERFIL_MAX = 40;

// Devuelve el nombre sin espacios al inicio ni al final.
function obtenerNombrePerfil() {
    return dom.profileNameInput.value.trim();
}

// Un nombre es válido si, una vez recortado, no está vacío
// y respeta la longitud mínima y máxima permitidas.
function nombrePerfilEsValido(nombre) {
    return nombre.length >= NOMBRE_PERFIL_MIN &&
        nombre.length <= NOMBRE_PERFIL_MAX;
}

// Habilita "Continuar" solo cuando hay un nombre válido.
function actualizarBotonContinuarPerfil() {
    dom.profileContinueButton.disabled =
        !nombrePerfilEsValido(obtenerNombrePerfil());
}

function mostrarConfiguracionPerfil() {

    ocultarTodasLasPantallas();

    dom.profileSetupScreen.classList.add("active");

    actualizarBotonContinuarPerfil();
}

/* --------------------------------------------------------
   PANTALLA 2 - VALIDACIÓN DE CORREO
   -------------------------------------------------------- */

// Patrón sencillo y robusto: texto, @, texto, punto, texto,
// sin espacios. Suficiente para validación de formato en front.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el correo sin espacios al inicio ni al final.
function obtenerCorreo() {
    return dom.emailInput.value.trim();
}

// Válido si no está vacío y cumple el formato de correo.
function correoEsValido(correo) {
    return correo.length > 0 && EMAIL_REGEX.test(correo);
}

function mostrarErrorCorreo() {
    dom.emailError.textContent = "Introduce un correo electrónico válido.";
    dom.emailError.classList.add("visible");
}

function ocultarErrorCorreo() {
    dom.emailError.textContent = "";
    dom.emailError.classList.remove("visible");
}

// Pantalla 2 -> Pantalla 6: solo si el correo tiene formato válido.
function continuarConCorreo() {
    const correo = obtenerCorreo();

    if (!correoEsValido(correo)) {
        mostrarErrorCorreo();
        return;
    }

    ocultarErrorCorreo();
    mostrarPantallaPassword(correo);
}

/* --------------------------------------------------------
   PANTALLA 6 - CREAR CONTRASEÑA (Supabase Auth: email/password)
   -------------------------------------------------------- */

// Correo recibido desde la Pantalla 2; única fuente para el signUp.
let correoEnRegistro = "";

// Evita signUp duplicados mientras una petición está en curso.
let registroEnProgreso = false;

function mostrarPantallaPassword(correo) {

    correoEnRegistro = correo;

    ocultarTodasLasPantallas();

    dom.passwordScreen.classList.add("active");

    dom.passwordAccountEmail.textContent = correo;

    reiniciarFormularioPassword();
}

// Deja el formulario en su estado inicial al entrar a la pantalla.
function reiniciarFormularioPassword() {
    dom.passwordCreateInput.value = "";
    dom.passwordConfirmInput.value = "";

    ocultarErrorRegistro();

    dom.passwordMatchMessage.textContent = "";
    dom.passwordMatchMessage.className = "password-match-message";

    manejarEntradaPassword();
}

// Evalúa cada requisito de seguridad de forma independiente.
function evaluarRequisitosPassword(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
}

function todosRequisitosCumplidos(requisitos) {
    return Object.values(requisitos).every(Boolean);
}

// Refleja en la lista qué requisitos se cumplen en tiempo real.
function actualizarRequisitosUI(requisitos) {
    dom.reqLength.classList.toggle("valid", requisitos.length);
    dom.reqUpper.classList.toggle("valid", requisitos.upper);
    dom.reqLower.classList.toggle("valid", requisitos.lower);
    dom.reqNumber.classList.toggle("valid", requisitos.number);
    dom.reqSpecial.classList.toggle("valid", requisitos.special);
}

// Traduce el número de requisitos cumplidos a un nivel visual.
function calcularNivelFortaleza(password, requisitos) {
    if (password.length === 0) {
        return { clase: "", texto: "" };
    }

    const cumplidos = Object.values(requisitos).filter(Boolean).length;

    if (cumplidos <= 2) {
        return { clase: "weak", texto: "Seguridad: Débil" };
    }

    if (cumplidos === 3) {
        return { clase: "medium", texto: "Seguridad: Media" };
    }

    if (cumplidos === 4) {
        return { clase: "strong", texto: "Seguridad: Fuerte" };
    }

    return { clase: "very-strong", texto: "Seguridad: Muy fuerte" };
}

function actualizarFortalezaUI(password, requisitos) {
    const nivel = calcularNivelFortaleza(password, requisitos);

    dom.passwordStrengthFill.className =
        `password-strength-fill ${nivel.clase}`.trim();

    dom.passwordStrengthLabel.textContent = nivel.texto;
}

// Verdadero solo si la confirmación coincide y no está vacía.
function passwordsCoinciden() {
    return dom.passwordConfirmInput.value.length > 0 &&
        dom.passwordCreateInput.value === dom.passwordConfirmInput.value;
}

// Muestra el estado de coincidencia debajo del campo de confirmación.
function actualizarMensajeConfirmacion() {
    const confirmacion = dom.passwordConfirmInput.value;

    if (confirmacion.length === 0) {
        dom.passwordMatchMessage.className = "password-match-message";
        dom.passwordMatchMessage.textContent = "";
        return;
    }

    if (passwordsCoinciden()) {
        dom.passwordMatchMessage.className =
            "password-match-message visible ok";
        dom.passwordMatchMessage.textContent = "Las contraseñas coinciden.";
    } else {
        dom.passwordMatchMessage.className =
            "password-match-message visible error";
        dom.passwordMatchMessage.textContent = "Las contraseñas no coinciden.";
    }
}

// Habilita CONTINUAR solo con correo válido, requisitos cumplidos
// y confirmación correcta.
function actualizarBotonPassword(requisitos) {
    const habilitar =
        correoEsValido(correoEnRegistro) &&
        todosRequisitosCumplidos(requisitos) &&
        passwordsCoinciden();

    dom.passwordContinueButton.disabled = !habilitar;
}

function mostrarErrorRegistro(mensaje) {
    dom.passwordSetupError.textContent = mensaje;
    dom.passwordSetupError.classList.add("visible");
}

function ocultarErrorRegistro() {
    dom.passwordSetupError.textContent = "";
    dom.passwordSetupError.classList.remove("visible");
}

// Punto único que recalcula toda la UI ante cualquier cambio.
function manejarEntradaPassword() {
    const password = dom.passwordCreateInput.value;
    const requisitos = evaluarRequisitosPassword(password);

    actualizarRequisitosUI(requisitos);
    actualizarFortalezaUI(password, requisitos);
    actualizarMensajeConfirmacion();
    actualizarBotonPassword(requisitos);

    // Cualquier edición limpia un error previo de Supabase.
    ocultarErrorRegistro();
}

// Convierte errores de Supabase en mensajes claros para la interfaz.
function traducirErrorRegistro(error) {
    const mensaje = (error && error.message ? error.message : "").toLowerCase();

    if (
        mensaje.includes("already registered") ||
        mensaje.includes("already been registered") ||
        mensaje.includes("user already exists")
    ) {
        return "Este correo electrónico ya está registrado.";
    }

    if (mensaje.includes("email") && mensaje.includes("invalid")) {
        return "El correo electrónico no es válido.";
    }

    if (mensaje.includes("password")) {
        return "La contraseña no cumple los requisitos de seguridad.";
    }

    if (
        mensaje.includes("network") ||
        mensaje.includes("failed to fetch") ||
        mensaje.includes("fetch")
    ) {
        return "Error de conexión. Comprueba tu red e inténtalo de nuevo.";
    }

    return "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

// Crea el usuario en Supabase Auth y, si todo va bien, muestra la
// Pantalla 3 manteniendo el flujo existente (3 -> 5).
async function crearUsuarioConCorreo() {
    if (registroEnProgreso) return;

    const password = dom.passwordCreateInput.value;
    const requisitos = evaluarRequisitosPassword(password);

    const datosValidos =
        correoEsValido(correoEnRegistro) &&
        todosRequisitosCumplidos(requisitos) &&
        passwordsCoinciden();

    if (!datosValidos) return;

    registroEnProgreso = true;
    dom.passwordContinueButton.disabled = true;
    ocultarErrorRegistro();

    try {
        const { error } = await supabaseClient.auth.signUp({
            email: correoEnRegistro,
            password: password,
            options: {
                emailRedirectTo: SUPABASE_CONFIG.redirectTo
            }
        });

        if (error) {
            throw error;
        }

        // El usuario quedó creado en Supabase Auth.
        // onAuthStateChange mostrará el onboarding si se abre sesión;
        // lo mostramos también aquí para el caso de confirmación por correo.
        mostrarOnboarding(correoEnRegistro);

    } catch (error) {
        console.error("[Zovrake] Error al crear usuario:", error);
        mostrarErrorRegistro(traducirErrorRegistro(error));

    } finally {
        registroEnProgreso = false;
        actualizarBotonPassword(evaluarRequisitosPassword(dom.passwordCreateInput.value));
    }
}

// Preparado para el futuro flujo "¿Olvidaste tu contraseña?" mediante
// la recuperación oficial de Supabase. Aún sin interfaz asociada.
function enviarRecuperacionPassword(correo) {
    return supabaseClient.auth.resetPasswordForEmail(correo, {
        redirectTo: SUPABASE_CONFIG.redirectTo
    });
}
/* --------------------------------------------------------
   MOSTRAR / OCULTAR CONTRASEÑA
-------------------------------------------------------- */

function alternarVisibilidadPassword(input) {

    input.type =
        input.type === "password"
            ? "text"
            : "password";

}

/* --------------------------------------------------------
   PANTALLA 7 - DASHBOARD PRINCIPAL
   --------------------------------------------------------
   Persistencia local (no toca Supabase ni la sesión):
   - el nombre elegido en la Pantalla 5 se guarda para reutilizarlo
     en accesos posteriores y abrir el Dashboard directamente;
   - un indicador recuerda si la bienvenida ya se mostró.
   Cerrar sesión nunca borra estos datos.
   -------------------------------------------------------- */

const STORAGE_NOMBRE = "zovrake_nombre";
const STORAGE_BIENVENIDA = "zovrake_bienvenida_mostrada";

function guardarNombreUsuario(nombre) {
    try {
        localStorage.setItem(STORAGE_NOMBRE, nombre);
    } catch (error) {
        console.warn("[Zovrake] No se pudo guardar el nombre localmente.", error);
    }
}

function obtenerNombreGuardado() {
    try {
        return localStorage.getItem(STORAGE_NOMBRE) || "";
    } catch (error) {
        return "";
    }
}

function bienvenidaYaMostrada() {
    try {
        return localStorage.getItem(STORAGE_BIENVENIDA) === "true";
    } catch (error) {
        return false;
    }
}

function marcarBienvenidaMostrada() {
    try {
        localStorage.setItem(STORAGE_BIENVENIDA, "true");
    } catch (error) {
        // El Dashboard sigue funcionando aunque no se pueda persistir.
    }
}

// Cambia la vista activa del área principal. Para los módulos aún
// no implementados se reutiliza una única vista genérica.
function mostrarVistaDashboard(vista, etiqueta) {

    document.querySelectorAll(".dashboard-view").forEach((seccion) => {
        seccion.classList.remove("active");
    });

    if (vista === "perfil") {
        document.getElementById("view-perfil").classList.add("active");
    } else if (vista === "configuracion") {
        document.getElementById("view-configuracion").classList.add("active");
    } else if (vista === "requerimientos") {
        document.getElementById("view-requerimientos").classList.add("active");
    } else if (vista === "modulo") {
        dom.moduloTitulo.textContent = etiqueta || "Módulo";
        document.getElementById("view-modulo").classList.add("active");
    } else {
        document.getElementById("view-inicio").classList.add("active");
    }
}

// Resalta el ítem del menú seleccionado (los módulos y el perfil;
// "Cerrar sesión" no se marca porque solo abre la confirmación).
function marcarItemActivo(itemActivo) {

    document.querySelectorAll(".dashboard-nav-item").forEach((item) => {
        item.classList.remove("active");
    });

    if (itemActivo) {
        itemActivo.classList.add("active");
    }
}

function mostrarDashboard(nombre, correo) {

    ocultarTodasLasPantallas();

    dom.dashboardScreen.classList.add("active");

    dom.dashboardUserName.textContent = nombre;
    dom.profileViewName.textContent = nombre;
    dom.profileViewEmail.textContent = correo;
    dom.welcomeUserName.textContent = nombre;

    // La bienvenida solo aparece en el primer ingreso.
    if (bienvenidaYaMostrada()) {
        dom.dashboardWelcome.classList.remove("visible");
    } else {
        dom.dashboardWelcome.classList.add("visible");
        marcarBienvenidaMostrada();
    }

    mostrarVistaDashboard("inicio");

    // Restaura/establece la ruta correcta (recarga, atrás/adelante o
    // primer ingreso) usando el Router, sin romper el flujo existente.
    Router.sincronizar();
}

function abrirDialogoCerrarSesion() {
    dom.logoutDialog.classList.add("visible");
}

function cerrarDialogoCerrarSesion() {
    dom.logoutDialog.classList.remove("visible");
}

// Cierra la sesión en Supabase y vuelve a la pantalla inicial.
// No elimina el nombre ni ningún dato local del usuario.
async function confirmarCerrarSesion() {

    cerrarDialogoCerrarSesion();

    try {
        await supabaseClient.auth.signOut();
    } catch (error) {
        console.error("[Zovrake] Error al cerrar sesión:", error);
    }

    ocultarTodasLasPantallas();
    dom.heroSection.style.display = "block";
}

// Maneja los clics del menú lateral mediante delegación de eventos.
function manejarNavegacionDashboard(evento) {

    const item = evento.target.closest(".dashboard-nav-item");

    if (!item) return;

    const vista = item.dataset.view;

    if (vista === "logout") {
        abrirDialogoCerrarSesion();
        return;
    }

    // La navegación (URL + animación + vista + estado activo) se
    // centraliza en el Router para mantener una única fuente de verdad.
    const ruta = item.dataset.route;

    if (ruta) {
        Router.navegar(ruta);
    } else {
        // Respaldo: comportamiento original si el ítem no tiene ruta.
        marcarItemActivo(item);
        mostrarVistaDashboard(vista, item.dataset.label);
    }

    // En móvil, cerrar el menú tras seleccionar una opción.
    dom.dashboardSidebar.classList.remove("open");
}

/* --------------------------------------------------------
   MÓDULO REQUERIMIENTOS - NAVEGACIÓN INTERNA
   --------------------------------------------------------
   Solo gestiona el estado activo de la navegación horizontal.
   El contenedor #req-workspace queda preparado para cargar
   cada submódulo (Panel de Control, Bandeja de Trabajo, etc.)
   en fases posteriores, usando tab.dataset.reqTab como clave.
   -------------------------------------------------------- */

// Marca como activa la pestaña interna indicada por su clave
// (tab.dataset.reqTab). Única fuente de verdad del estado visual de
// la navegación horizontal; la reutilizan tanto el clic del usuario
// como la navegación programática (KPIs, acciones rápidas, etc.).
function setReqTabActivo(claveTab) {
    document.querySelectorAll(".req-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.reqTab === claveTab);
    });
}

// Gestiona el clic en la navegación interna del módulo: marca la
// pestaña y delega el render del submódulo correspondiente en el
// Workspace. No altera el Router ni el menú lateral.
function manejarTabsRequerimientos(evento) {

    const tab = evento.target.closest(".req-tab");

    if (!tab) return;

    setReqTabActivo(tab.dataset.reqTab);

    ReqWorkspace.render(tab.dataset.reqTab);
}

/* ==========================================================
   MÓDULO REQUERIMIENTOS — SUBMÓDULO "PANEL DE CONTROL"
   ----------------------------------------------------------
   Centro de Operaciones del Residente. Se monta dentro del
   contenedor existente #req-workspace, reutilizando el Router,
   la navegación interna (req-tabs) y las variables CSS del
   Dashboard. No crea páginas, layouts ni routers nuevos.

   Arquitectura de componentes (una responsabilidad cada uno):

     PanelControl
       ├── KPIGrid            -> tarjetas de indicadores
       ├── QuickActions       -> accesos rápidos
       ├── AlertCenter        -> alertas prioritarias
       ├── SummaryTable       -> bandeja resumen
       ├── ActivityTimeline   -> actividad reciente
       ├── StatusBoard        -> resumen por estados
       ├── DeadlinePanel      -> próximos vencimientos
       └── NotificationPanel  -> notificaciones recientes

   Arquitectura de datos:
     El Panel NO almacena ni crea información. Solo CONSULTA el
     Expediente Digital a través de la capa de lectura
     `ExpedienteDigital`. Hoy esa capa entrega un conjunto de
     muestra; el día de mañana basta con sustituir su origen por
     Supabase sin tocar los componentes.
   ========================================================== */

/* --------------------------------------------------------
   CAPA DE CONSULTA: EXPEDIENTE DIGITAL (solo lectura)
   -------------------------------------------------------- */

const ExpedienteDigital = (function () {

    // Catálogo de estados y su etiqueta visible.
    const ESTADOS = {
        borrador:  "Borrador",
        enviado:   "Enviado",
        observado: "Observado",
        aprobado:  "Aprobado",
        rechazado: "Rechazado",
        cerrado:   "Cerrado"
    };

    // Peso de prioridad para ordenar lo más importante primero.
    const PESO_PRIORIDAD = { Urgente: 4, Alta: 3, Media: 2, Baja: 1 };

    // Fuente de muestra del Expediente Digital. Las fechas se
    // expresan como desfases en días respecto de "hoy" para que los
    // vencimientos y la actividad sean coherentes en cualquier fecha.
    const FUENTE = [
        { codigo: "REQ-0001", obra: "Torre Norte",      prioridad: "Urgente", estado: "borrador",  responsable: "C. Rivas",  creado: -1,  limite: 2  },
        { codigo: "REQ-0002", obra: "Planta Sur",       prioridad: "Alta",    estado: "enviado",   responsable: "M. Díaz",   creado: -2,  limite: 5  },
        { codigo: "REQ-0003", obra: "Puente Río",       prioridad: "Media",   estado: "observado", responsable: "L. Pérez",  creado: -3,  limite: 1  },
        { codigo: "REQ-0004", obra: "Edificio Central", prioridad: "Urgente", estado: "enviado",   responsable: "C. Rivas",  creado: -2,  limite: 3  },
        { codigo: "REQ-0005", obra: "Vía Expressa",     prioridad: "Baja",    estado: "aprobado",  responsable: "A. Soto",   creado: -8,  limite: 12 },
        { codigo: "REQ-0006", obra: "Torre Norte",      prioridad: "Alta",    estado: "cerrado",   responsable: "M. Díaz",   creado: -14, limite: -3 },
        { codigo: "REQ-0007", obra: "Planta Sur",       prioridad: "Urgente", estado: "observado", responsable: "L. Pérez",  creado: -4,  limite: 1  },
        { codigo: "REQ-0008", obra: "Almacén 4",        prioridad: "Media",   estado: "borrador",  responsable: "A. Soto",   creado: 0,   limite: 9  },
        { codigo: "REQ-0009", obra: "Edificio Central", prioridad: "Alta",    estado: "rechazado", responsable: "C. Rivas",  creado: -6,  limite: 7  },
        { codigo: "REQ-0010", obra: "Puente Río",       prioridad: "Urgente", estado: "enviado",   responsable: "M. Díaz",   creado: -5,  limite: -1 },
        { codigo: "REQ-0011", obra: "Vía Expressa",     prioridad: "Media",   estado: "aprobado",  responsable: "L. Pérez",  creado: -9,  limite: 15 },
        { codigo: "REQ-0012", obra: "Torre Norte",      prioridad: "Baja",    estado: "cerrado",   responsable: "A. Soto",   creado: -20, limite: -8 }
    ];

    // Actividad reciente (línea de tiempo). `hace` en horas.
    const ACTIVIDAD = [
        { tipo: "creado",     texto: "Requerimiento creado",            codigo: "REQ-0008", hace: 1  },
        { tipo: "enviado",    texto: "Requerimiento enviado",           codigo: "REQ-0010", hace: 4  },
        { tipo: "documento",  texto: "Documento actualizado",           codigo: "REQ-0003", hace: 9  },
        { tipo: "logistica",  texto: "Logística recibió el expediente", codigo: "REQ-0002", hace: 22 },
        { tipo: "observado",  texto: "Requerimiento observado",         codigo: "REQ-0007", hace: 30 }
    ];

    // Notificaciones recientes. `hace` en horas.
    const NOTIFICACIONES = [
        { texto: "Material urgente pendiente de gestión", codigo: "REQ-0001", hace: 2  },
        { texto: "Se solicitó una corrección",            codigo: "REQ-0009", hace: 6  },
        { texto: "Documento observado por Logística",     codigo: "REQ-0003", hace: 12 },
        { texto: "Expediente próximo a vencer",           codigo: "REQ-0010", hace: 20 }
    ];

    // --- Utilidades de fecha (sin librerías externas) ---

    function hoyCero() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function fechaDesdeOffset(dias) {
        const d = hoyCero();
        d.setDate(d.getDate() + dias);
        return d;
    }

    function diasRestantes(offset) {
        return offset;
    }

    // --- Consultas (solo lectura) ---

    // Devuelve una copia de los expedientes con su fecha calculada.
    function listar() {
        return FUENTE.map((e) => ({
            ...e,
            fechaLimite: fechaDesdeOffset(e.limite),
            fechaCreado: fechaDesdeOffset(e.creado),
            diasParaVencer: diasRestantes(e.limite)
        }));
    }

    function buscarPorCodigo(codigo) {
        return listar().find((e) => e.codigo === codigo) || null;
    }

    // KPIs: total + conteo por estado + urgentes (por prioridad).
    function obtenerKPIs() {
        const items = listar();
        const porEstado = (estado) =>
            items.filter((e) => e.estado === estado).length;

        return {
            total:     items.length,
            borrador:  porEstado("borrador"),
            enviado:   porEstado("enviado"),
            observado: porEstado("observado"),
            aprobado:  porEstado("aprobado"),
            rechazado: porEstado("rechazado"),
            cerrado:   porEstado("cerrado"),
            urgente:   items.filter((e) => e.prioridad === "Urgente").length
        };
    }

    // Conteo por estado para el tablero de estados.
    function obtenerResumenEstados() {
        const items = listar();
        return ["borrador", "enviado", "observado", "aprobado", "cerrado"].map(
            (clave) => ({
                clave,
                etiqueta: ESTADOS[clave],
                total: items.filter((e) => e.estado === clave).length
            })
        );
    }

    // Bandeja resumen: lo más importante primero (prioridad y luego
    // proximidad de vencimiento). Se limita para sentirse ligera.
    function obtenerResumenBandeja(limite = 6) {
        return listar()
            .filter((e) => e.estado !== "cerrado")
            .sort((a, b) => {
                const p = PESO_PRIORIDAD[b.prioridad] - PESO_PRIORIDAD[a.prioridad];
                return p !== 0 ? p : a.diasParaVencer - b.diasParaVencer;
            })
            .slice(0, limite);
    }

    // Próximos vencimientos: expedientes vivos ordenados por fecha.
    function obtenerProximosVencimientos(limite = 5) {
        return listar()
            .filter((e) => e.estado !== "cerrado" && e.estado !== "aprobado")
            .sort((a, b) => a.diasParaVencer - b.diasParaVencer)
            .slice(0, limite);
    }

    // Alertas activas derivadas del estado real del expediente.
    function obtenerAlertas() {
        const items = listar();
        const alertas = [];

        items.forEach((e) => {
            if (e.estado !== "cerrado" && e.diasParaVencer < 0) {
                alertas.push({ tipo: "vencido", titulo: "Requerimiento vencido", expediente: e });
            }
            if (e.prioridad === "Urgente" && e.estado === "borrador") {
                alertas.push({ tipo: "urgente", titulo: "Material urgente sin enviar", expediente: e });
            }
            if (e.estado === "observado") {
                alertas.push({ tipo: "observado", titulo: "Documento observado", expediente: e });
            }
            if (e.estado === "rechazado") {
                alertas.push({ tipo: "correccion", titulo: "Corrección solicitada", expediente: e });
            }
        });

        return alertas;
    }

    function obtenerActividad() {
        return ACTIVIDAD.slice();
    }

    function obtenerNotificaciones() {
        return NOTIFICACIONES.slice();
    }

    return {
        ESTADOS,
        listar,
        buscarPorCodigo,
        obtenerKPIs,
        obtenerResumenEstados,
        obtenerResumenBandeja,
        obtenerProximosVencimientos,
        obtenerAlertas,
        obtenerActividad,
        obtenerNotificaciones
    };
})();

/* --------------------------------------------------------
   UTILIDADES DE PRESENTACIÓN (compartidas por los componentes)
   -------------------------------------------------------- */

const PanelUtils = {

    // Escapa texto para insertarlo de forma segura en innerHTML.
    escapar(texto) {
        return String(texto).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[c]);
    },

    // Formatea una fecha como dd/mm/aaaa.
    fecha(fecha) {
        const dd = String(fecha.getDate()).padStart(2, "0");
        const mm = String(fecha.getMonth() + 1).padStart(2, "0");
        return `${dd}/${mm}/${fecha.getFullYear()}`;
    },

    // Convierte "horas transcurridas" en texto relativo legible.
    hace(horas) {
        if (horas < 1) return "hace instantes";
        if (horas < 24) return `hace ${horas} h`;
        const dias = Math.round(horas / 24);
        return dias === 1 ? "hace 1 día" : `hace ${dias} días`;
    },

    // Texto humano para la cuenta regresiva de un vencimiento.
    vencimiento(dias) {
        if (dias < 0) return `Vencido (${Math.abs(dias)} d)`;
        if (dias === 0) return "Vence hoy";
        if (dias === 1) return "Vence mañana";
        return `En ${dias} días`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: KPIGrid — tarjetas de indicadores interactivas
   -------------------------------------------------------- */

const KPIGrid = {

    // Definición de cada tarjeta: etiqueta, clave de dato y filtro
    // que aplicará al abrir la Bandeja de Trabajo.
    TARJETAS: [
        { clave: "total",     etiqueta: "Total",      mod: "total",     campo: "",          valor: "todos"   },
        { clave: "borrador",  etiqueta: "Borradores", mod: "borrador",  campo: "estado",    valor: "borrador" },
        { clave: "enviado",   etiqueta: "Enviados",   mod: "enviado",   campo: "estado",    valor: "enviado" },
        { clave: "observado", etiqueta: "Observados", mod: "observado", campo: "estado",    valor: "observado" },
        { clave: "aprobado",  etiqueta: "Aprobados",  mod: "aprobado",  campo: "estado",    valor: "aprobado" },
        { clave: "rechazado", etiqueta: "Rechazados", mod: "rechazado", campo: "estado",    valor: "rechazado" },
        { clave: "urgente",   etiqueta: "Urgentes",   mod: "urgente",   campo: "prioridad", valor: "Urgente" },
        { clave: "cerrado",   etiqueta: "Cerrados",   mod: "cerrado",   campo: "estado",    valor: "cerrado" }
    ],

    render() {
        const datos = ExpedienteDigital.obtenerKPIs();

        const tarjetas = this.TARJETAS.map((t) => `
            <button class="pc-kpi is-${t.mod}" type="button"
                data-accion="kpi"
                data-campo="${t.campo}"
                data-valor="${PanelUtils.escapar(t.valor)}"
                title="Ver en Bandeja de Trabajo">
                <span class="pc-kpi-value">${datos[t.clave]}</span>
                <span class="pc-kpi-label">${t.etiqueta}</span>
            </button>
        `).join("");

        return `<div class="pc-kpi-grid">${tarjetas}</div>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: QuickActions — accesos rápidos (Router interno)
   -------------------------------------------------------- */

const QuickActions = {

    ACCIONES: [
        { destino: "nuevo-requerimiento", etiqueta: "Nuevo Requerimiento", icono: "M12 5v14M5 12h14" },
        { destino: "bandeja-trabajo",     etiqueta: "Bandeja de Trabajo",  icono: "M4 6h16M4 12h16M4 18h10" },
        { destino: "documentos",          etiqueta: "Documentos",          icono: "M7 4h7l4 4v12H7zM14 4v4h4" },
        { destino: "seguimiento",         etiqueta: "Seguimiento",         icono: "M4 18 9 12l4 4 7-8" }
    ],

    render() {
        const botones = this.ACCIONES.map((a) => `
            <button class="pc-action" type="button"
                data-accion="quick" data-destino="${a.destino}">
                <span class="pc-action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${a.icono}"/></svg>
                </span>
                ${a.etiqueta}
            </button>
        `).join("");

        return `
            <section class="pc-section">
                <p class="pc-label">Acciones rápidas</p>
                <div class="pc-actions">${botones}</div>
            </section>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: AlertCenter — alertas prioritarias activas
   -------------------------------------------------------- */

const AlertCenter = {

    render() {
        const alertas = ExpedienteDigital.obtenerAlertas();

        if (alertas.length === 0) {
            return `
                <section class="pc-section">
                    <p class="pc-label">Alertas prioritarias</p>
                    <div class="pc-empty">No hay alertas activas.</div>
                </section>`;
        }

        const filas = alertas.map((a) => `
            <button class="pc-alert is-${a.tipo}" type="button"
                data-accion="expediente" data-codigo="${a.expediente.codigo}"
                title="Abrir expediente ${a.expediente.codigo}">
                <span class="pc-alert-dot"></span>
                <span class="pc-alert-body">
                    <span class="pc-alert-title">${a.titulo}</span>
                    <span class="pc-alert-meta">${a.expediente.codigo} · ${PanelUtils.escapar(a.expediente.obra)}</span>
                </span>
                <span class="pc-alert-arrow">›</span>
            </button>
        `).join("");

        return `
            <section class="pc-section">
                <p class="pc-label">Alertas prioritarias <span class="pc-count">${alertas.length}</span></p>
                <div class="pc-alerts">${filas}</div>
            </section>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: SummaryTable — bandeja resumen (ligera)
   -------------------------------------------------------- */

const SummaryTable = {

    render() {
        const items = ExpedienteDigital.obtenerResumenBandeja();

        const filas = items.map((e) => `
            <tr data-accion="expediente" data-codigo="${e.codigo}" title="Abrir expediente ${e.codigo}">
                <td class="pc-cell-code">${e.codigo}</td>
                <td>${PanelUtils.escapar(e.obra)}</td>
                <td><span class="pc-tag pc-tag-prio is-${e.prioridad.toLowerCase()}">${e.prioridad}</span></td>
                <td><span class="pc-tag pc-tag-state is-${e.estado}">${ExpedienteDigital.ESTADOS[e.estado]}</span></td>
                <td>${PanelUtils.escapar(e.responsable)}</td>
                <td class="pc-cell-date">${PanelUtils.fecha(e.fechaCreado)}</td>
            </tr>
        `).join("");

        return `
            <section class="pc-section">
                <p class="pc-label">Bandeja — resumen</p>
                <div class="pc-table-wrap zv-no-scrollbar">
                    <table class="pc-table">
                        <thead>
                            <tr>
                                <th>Código</th><th>Obra</th><th>Prioridad</th>
                                <th>Estado</th><th>Responsable</th><th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            </section>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: ActivityTimeline — actividad reciente
   -------------------------------------------------------- */

const ActivityTimeline = {

    render() {
        const eventos = ExpedienteDigital.obtenerActividad();

        const items = eventos.map((ev) => `
            <li class="pc-tl-item is-${ev.tipo}"
                data-accion="expediente" data-codigo="${ev.codigo}"
                title="Abrir expediente ${ev.codigo}">
                <span class="pc-tl-dot"></span>
                <span class="pc-tl-body">
                    <span class="pc-tl-text">${ev.texto}</span>
                    <span class="pc-tl-meta">${ev.codigo} · ${PanelUtils.hace(ev.hace)}</span>
                </span>
            </li>
        `).join("");

        return `
            <article class="pc-card">
                <p class="pc-card-title">Actividad reciente</p>
                <ul class="pc-timeline">${items}</ul>
            </article>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: StatusBoard — resumen por estados (filtros)
   -------------------------------------------------------- */

const StatusBoard = {

    render() {
        const estados = ExpedienteDigital.obtenerResumenEstados();

        const filas = estados.map((s) => `
            <button class="pc-status-row is-${s.clave}" type="button"
                data-accion="estado" data-valor="${s.clave}"
                title="Filtrar ${s.etiqueta} en la Bandeja">
                <span class="pc-status-dot"></span>
                <span class="pc-status-label">${s.etiqueta}</span>
                <span class="pc-status-count">${s.total}</span>
            </button>
        `).join("");

        return `
            <article class="pc-card">
                <p class="pc-card-title">Resumen por estados</p>
                <div class="pc-status">${filas}</div>
            </article>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: DeadlinePanel — próximos vencimientos
   -------------------------------------------------------- */

const DeadlinePanel = {

    render() {
        const items = ExpedienteDigital.obtenerProximosVencimientos();

        const filas = items.map((e) => {
            const critico = e.diasParaVencer <= 3;
            return `
                <button class="pc-deadline ${critico ? "is-soon" : ""}" type="button"
                    data-accion="expediente" data-codigo="${e.codigo}"
                    title="Abrir expediente ${e.codigo}">
                    <span class="pc-deadline-main">
                        <span class="pc-deadline-code">${e.codigo}</span>
                        <span class="pc-deadline-obra">${PanelUtils.escapar(e.obra)}</span>
                    </span>
                    <span class="pc-deadline-side">
                        <span class="pc-tag pc-tag-prio is-${e.prioridad.toLowerCase()}">${e.prioridad}</span>
                        <span class="pc-deadline-when">${PanelUtils.vencimiento(e.diasParaVencer)}</span>
                    </span>
                </button>`;
        }).join("");

        return `
            <article class="pc-card">
                <p class="pc-card-title">Próximos vencimientos</p>
                <div class="pc-deadlines">${filas}</div>
            </article>`;
    }
};

/* --------------------------------------------------------
   COMPONENTE: NotificationPanel — notificaciones recientes
   -------------------------------------------------------- */

const NotificationPanel = {

    render() {
        const notifs = ExpedienteDigital.obtenerNotificaciones();

        const filas = notifs.map((n) => `
            <button class="pc-notif" type="button"
                data-accion="expediente" data-codigo="${n.codigo}"
                title="Abrir expediente ${n.codigo}">
                <span class="pc-notif-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4.5 1.8 5.5 1.8 5.5H4.7s1.8-1 1.8-5.5Z"/><path d="M10.2 18.5a2 2 0 0 0 3.6 0"/></svg>
                </span>
                <span class="pc-notif-body">
                    <span class="pc-notif-text">${PanelUtils.escapar(n.texto)}</span>
                    <span class="pc-notif-meta">${n.codigo} · ${PanelUtils.hace(n.hace)}</span>
                </span>
            </button>
        `).join("");

        return `
            <article class="pc-card">
                <p class="pc-card-title">Notificaciones recientes</p>
                <div class="pc-notifs">${filas}</div>
            </article>`;
    }
};

/* --------------------------------------------------------
   PANEL DE CONTROL — composición de los componentes
   --------------------------------------------------------
   Respeta el orden exacto solicitado:
     KPIs → Acciones Rápidas → Alertas → Bandeja Resumen →
     (Actividad | Estados) → (Vencimientos | Notificaciones)
   -------------------------------------------------------- */

const PanelControl = {

    render() {
        return `
            <div class="pc">

                <section class="pc-section">
                    ${KPIGrid.render()}
                </section>

                ${QuickActions.render()}

                ${AlertCenter.render()}

                ${SummaryTable.render()}

                <div class="pc-grid-2">
                    ${ActivityTimeline.render()}
                    ${StatusBoard.render()}
                </div>

                <div class="pc-grid-2">
                    ${DeadlinePanel.render()}
                    ${NotificationPanel.render()}
                </div>

            </div>`;
    }
};

/* --------------------------------------------------------
   REQ WORKSPACE — dispatcher del contenedor #req-workspace
   --------------------------------------------------------
   Decide qué submódulo se pinta según la clave de la pestaña.
   Solo "panel-control" está desarrollado; el resto muestran un
   marcador neutro (estado base del workspace) hasta su fase.
   Centraliza también la navegación interna programática para
   reutilizar la misma navegación que el usuario (sin recargas).
   -------------------------------------------------------- */

const ReqWorkspace = (function () {

    function contenedor() {
        return document.getElementById("req-workspace");
    }

    // Etiqueta visible de una pestaña (se lee del propio HTML para
    // no duplicar textos).
    function etiquetaTab(claveTab) {
        const tab = document.querySelector(`.req-tab[data-req-tab="${claveTab}"]`);
        return tab ? tab.textContent.trim() : claveTab;
    }

    // Marcador para submódulos aún no desarrollados. No "construye"
    // otro submódulo: solo informa y ofrece volver al Panel.
    function placeholder(claveTab, params) {
        const titulo = etiquetaTab(claveTab);

        let contexto = "";
        if (params && params.valor && params.valor !== "todos") {
            contexto = `<p class="pc-ph-context">Filtro recibido: <strong>${PanelUtils.escapar(params.valor)}</strong></p>`;
        } else if (params && params.codigo) {
            contexto = `<p class="pc-ph-context">Expediente: <strong>${PanelUtils.escapar(params.codigo)}</strong></p>`;
        }

        return `
            <div class="pc-placeholder">
                <div class="pc-ph-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/></svg>
                </div>
                <h3 class="pc-ph-title">${titulo}</h3>
                <p class="pc-ph-text">Este submódulo se habilitará en una próxima fase.</p>
                ${contexto}
                <button class="pc-action" type="button" data-accion="volver-panel">Volver al Panel de Control</button>
            </div>`;
    }

    // Pinta el submódulo correspondiente dentro del workspace.
    function render(claveTab, params) {
        const ws = contenedor();
        if (!ws) return;

        ws.innerHTML = (claveTab === "panel-control")
            ? PanelControl.render()
            : placeholder(claveTab, params);

        ws.scrollTop = 0;
    }

    // Navegación interna programática: activa la pestaña y pinta su
    // submódulo. Reutiliza el mismo mecanismo que el clic del usuario.
    function irATab(claveTab, params) {
        setReqTabActivo(claveTab);
        render(claveTab, params);
    }

    // Abrir un expediente -> Seguimiento (centro del expediente).
    function abrirExpediente(codigo) {
        irATab("seguimiento", { codigo });
    }

    // Delegación de eventos: un único listener para todo el panel.
    function manejarClic(evento) {
        const elemento = evento.target.closest("[data-accion]");
        if (!elemento) return;

        const accion = elemento.dataset.accion;

        if (accion === "kpi" || accion === "estado") {
            // KPIs y estados abren la Bandeja de Trabajo filtrada.
            const valor = elemento.dataset.valor || "todos";
            const campo = elemento.dataset.campo || "estado";
            irATab("bandeja-trabajo", { campo, valor });

        } else if (accion === "quick") {
            irATab(elemento.dataset.destino);

        } else if (accion === "expediente") {
            abrirExpediente(elemento.dataset.codigo);

        } else if (accion === "volver-panel") {
            irATab("panel-control");
        }
    }

    // Arranque del submódulo: enlaza la delegación una sola vez y
    // pinta la pestaña activa por defecto (Panel de Control).
    function iniciar() {
        const ws = contenedor();
        if (!ws || ws.dataset.iniciado) return;

        ws.addEventListener("click", manejarClic);
        ws.dataset.iniciado = "true";

        const activa = document.querySelector(".req-tab.active");
        render(activa ? activa.dataset.reqTab : "panel-control");
    }

    return { render, irATab, abrirExpediente, iniciar };
})();

/* ==========================================================
   NAVEGACIÓN PROFESIONAL ZOVRAKE
   ----------------------------------------------------------
   Arquitectura modular (cada pieza, una sola responsabilidad):

   • Animaciones            -> transición de entrada/salida de módulos.
   • Router                 -> URL (hash), historial, atrás/adelante,
                               restauración al recargar y sincronización
                               del menú lateral.
   • Gestor de Navegación   -> manejarNavegacionDashboard (existente).
   • Gestor de Módulos      -> mostrarVistaDashboard (existente).

   Se REUTILIZA toda la lógica existente; aquí solo se coordina.
   Solo afecta la navegación de escritorio; en móvil el menú actual
   sigue funcionando exactamente igual.
   ========================================================== */

/* --------------------------------------------------------
   GESTOR DE ANIMACIONES
   -------------------------------------------------------- */

const Animaciones = {

    DURACION: 220, // ms — debe coincidir con la transición CSS.

    _temporizador: null,

    // Desvanece el contenedor, intercambia el módulo y lo muestra
    // de nuevo con una transición suave (sin parpadeos).
    transicionarContenido(contenedor, intercambiar) {

        if (!contenedor) {
            intercambiar();
            return;
        }

        clearTimeout(this._temporizador);

        contenedor.classList.add("zv-leaving");

        this._temporizador = setTimeout(() => {
            intercambiar();
            contenedor.classList.remove("zv-leaving");
        }, this.DURACION);
    }
};

/* --------------------------------------------------------
   ROUTER INTERNO (HTML/CSS/JS puro, sin frameworks)
   --------------------------------------------------------
   Usa el hash de la URL (#/ruta). Así funciona en cualquier
   hosting estático y conserva atrás/adelante y la recarga,
   sin necesidad de configuración del servidor.
   -------------------------------------------------------- */

const Router = (function () {

    // Tabla de rutas: ruta -> vista del sistema de vistas existente.
    const RUTAS = {
        "/inicio":          { vista: "inicio" },
        "/dashboard":       { vista: "modulo", etiqueta: "Dashboard" },
        "/requerimientos":  { vista: "requerimientos" },
        "/logistica":       { vista: "modulo", etiqueta: "Logística" },
        "/almacen":         { vista: "modulo", etiqueta: "Almacén / Kardex" },
        "/tesoreria":       { vista: "modulo", etiqueta: "Tesorería" },
        "/contabilidad":    { vista: "modulo", etiqueta: "Contabilidad" },
        "/rrhh":            { vista: "modulo", etiqueta: "Recursos Humanos" },
        "/maquinaria":      { vista: "modulo", etiqueta: "Maquinaria" },
        "/gerencia":        { vista: "modulo", etiqueta: "Gerencia Administrativa" },
        "/ayuda":           { vista: "modulo", etiqueta: "Centro de Ayuda" },
        "/notificaciones":  { vista: "modulo", etiqueta: "Notificaciones" },
        "/perfil":          { vista: "perfil" },
        "/configuracion":   { vista: "configuracion" }
    };

    const RUTA_DEFECTO = "/inicio";

    function dashboardActivo() {
        return dom.dashboardScreen.classList.contains("active");
    }

    // Normaliza el hash actual a una ruta válida conocida.
    function rutaActual() {
        let ruta = location.hash.replace(/^#/, "");
        if (ruta && ruta[0] !== "/") ruta = "/" + ruta;
        return RUTAS[ruta] ? ruta : RUTA_DEFECTO;
    }

    // Aplica la ruta: (anima), cambia la vista y sincroniza el menú.
    function aplicar(animar) {

        const ruta = rutaActual();
        const config = RUTAS[ruta];

        const navItem = document.querySelector(
            `.dashboard-nav-item[data-route="${ruta}"]`
        );

        const contenedor = document.querySelector(".dashboard-content");

        // Decide el LAYOUT según la ruta:
        //  - "/inicio"  -> LAYOUT 1 (Home): menú lateral completo original.
        //  - cualquier otra ruta -> LAYOUT 2 (Profesional): rail + tooltips.
        const esInicio = (ruta === RUTA_DEFECTO);

        // Reutiliza la lógica existente: estado activo + cambio de vista.
        // El cambio de layout ocurre dentro del intercambio (durante el fade).
        const intercambiar = () => {
            dom.dashboardScreen.classList.toggle("layout-pro", !esInicio);
            Tooltips.ocultar();
            if (navItem) marcarItemActivo(navItem);
            mostrarVistaDashboard(config.vista, config.etiqueta);
        };

        if (animar) {
            Animaciones.transicionarContenido(contenedor, intercambiar);
        } else {
            intercambiar();
        }
    }

    // Navega a una ruta (desde el menú). Cambiar el hash dispara
    // 'hashchange', que centraliza el render (única fuente de verdad).
    function navegar(ruta) {
        if (!RUTAS[ruta]) return;

        const destino = "#" + ruta;

        if (location.hash === destino) {
            aplicar(true); // misma ruta: re-aplica sin duplicar historial.
        } else {
            location.hash = destino; // dispara hashchange -> aplicar().
        }
    }

    // Restaura/establece la vista correcta al abrir el Dashboard.
    function sincronizar() {
        if (!location.hash.replace(/^#/, "")) {
            // replaceState evita añadir una entrada extra al historial;
            // si el entorno lo restringe (p. ej. file://), se usa el hash.
            try {
                history.replaceState(null, "", "#" + RUTA_DEFECTO);
            } catch (error) {
                location.hash = RUTA_DEFECTO;
            }
        }
        aplicar(false); // entrada instantánea (ya hubo animación de pantalla).
    }

    // Arranque: escucha atrás/adelante y cambios de hash.
    function iniciar() {
        window.addEventListener("hashchange", () => {
            if (dashboardActivo()) aplicar(true);
        });
    }

    return { navegar, sincronizar, iniciar };
})();

/* --------------------------------------------------------
   PREPARACIÓN DEL MENÚ LATERAL (rutas + colapso)
   --------------------------------------------------------
   Se realiza por código para no duplicar marcado en el HTML:
   - asigna data-route a cada ítem según su data-label;
   - envuelve el texto en .dashboard-nav-text (animación de colapso);
   - divide la marca en versión compacta ("Z") y completa.
   -------------------------------------------------------- */

const RUTA_POR_ETIQUETA = {
    "Inicio": "/inicio",
    "Dashboard": "/dashboard",
    "Requerimientos": "/requerimientos",
    "Logística": "/logistica",
    "Almacén / Kardex": "/almacen",
    "Tesorería": "/tesoreria",
    "Contabilidad": "/contabilidad",
    "Recursos Humanos": "/rrhh",
    "Maquinaria": "/maquinaria",
    "Gerencia Administrativa": "/gerencia",
    "Centro de Ayuda": "/ayuda",
    "Notificaciones": "/notificaciones",
    "Perfil": "/perfil",
    "Configuración": "/configuracion"
};

function envolverEtiquetaItem(item) {

    // El perfil ya usa <span id="dashboard-user-name"> como etiqueta.
    const spanUsuario = item.querySelector("#dashboard-user-name");
    if (spanUsuario) {
        spanUsuario.classList.add("dashboard-nav-text");
        return;
    }

    // Envuelve el primer nodo de texto con contenido real.
    for (const nodo of Array.from(item.childNodes)) {
        if (nodo.nodeType === Node.TEXT_NODE && nodo.textContent.trim()) {
            const span = document.createElement("span");
            span.className = "dashboard-nav-text";
            span.textContent = nodo.textContent.trim();
            item.replaceChild(span, nodo);
            return;
        }
    }
}

function prepararItemsNavegacion() {

    document.querySelectorAll(".dashboard-nav-item").forEach((item) => {

        const ruta = RUTA_POR_ETIQUETA[item.dataset.label];

        if (ruta) {
            item.dataset.route = ruta;
        }

        envolverEtiquetaItem(item);
    });
}

function prepararMarca() {

    const marca = document.querySelector(".dashboard-brand");
    if (!marca || marca.dataset.preparada) return;

    const texto = marca.textContent.trim() || "ZOVRAKE";

    const mini = document.createElement("span");
    mini.className = "dashboard-brand-mini";
    mini.textContent = texto.charAt(0);

    const completo = document.createElement("span");
    completo.className = "dashboard-brand-full";
    completo.textContent = texto;

    marca.textContent = "";
    marca.appendChild(mini);
    marca.appendChild(completo);

    marca.dataset.preparada = "true";
}

/* --------------------------------------------------------
   TOOLTIPS FLOTANTES (solo LAYOUT PROFESIONAL, escritorio)
   --------------------------------------------------------
   Un único nodo anclado a <body> (no lo recorta el overflow
   del rail). Aparece junto al icono al pasar el mouse; nunca
   expande el menú. Inactivo en Home y en móvil (sin hover).
   -------------------------------------------------------- */

const Tooltips = (function () {

    let nodo = null;
    const consultaEscritorio = window.matchMedia("(min-width: 769px)");

    function activo() {
        return (
            dom.dashboardScreen.classList.contains("layout-pro") &&
            consultaEscritorio.matches
        );
    }

    function asegurarNodo() {
        if (nodo) return nodo;
        nodo = document.createElement("div");
        nodo.className = "zv-tooltip";
        nodo.setAttribute("role", "tooltip");
        document.body.appendChild(nodo);
        return nodo;
    }

    function textoDeItem(item) {
        const etiqueta = item.querySelector(".dashboard-nav-text");
        const texto = etiqueta ? etiqueta.textContent.trim() : "";
        return texto || item.dataset.label || "";
    }

    function mostrar(item) {
        if (!activo()) return;

        const texto = textoDeItem(item);
        if (!texto) return;

        const t = asegurarNodo();
        t.textContent = texto;

        const r = item.getBoundingClientRect();
        t.style.left = (r.right + 14) + "px";
        t.style.top = (r.top + r.height / 2) + "px";
        t.classList.add("visible");
    }

    function ocultar() {
        if (nodo) nodo.classList.remove("visible");
    }

    function iniciar() {
        const sidebar = dom.dashboardSidebar;
        if (!sidebar) return;

        sidebar.addEventListener("mouseover", (e) => {
            const item = e.target.closest(".dashboard-nav-item");
            if (item) mostrar(item);
        });

        sidebar.addEventListener("mouseout", (e) => {
            const item = e.target.closest(".dashboard-nav-item");
            if (item) ocultar();
        });

        // Evita tooltips colgados al navegar o desplazar el rail.
        sidebar.addEventListener("click", ocultar);
        sidebar.addEventListener("scroll", ocultar, { passive: true });
    }

    return { iniciar, ocultar };
})();

// Inicializa la navegación profesional una sola vez.
function inicializarNavegacionZovrake() {
    prepararMarca();
    prepararItemsNavegacion();
    Tooltips.iniciar();
    Router.iniciar();
}





/* --------------------------------------------------------
   4. BOTÓN "CONTINUAR" (hero -> auth-screen)
   -------------------------------------------------------- */

if (domListo) {
    dom.continueButton.addEventListener("click", mostrarPantallaAuth);
}


/* --------------------------------------------------------
   5. LOGIN CON GOOGLE
   -------------------------------------------------------- */

// Evita que clics repetidos disparen múltiples popups de OAuth
// mientras la primera solicitud aún está en curso.
let loginEnProgreso = false;

async function iniciarSesionConGoogle() {
    if (loginEnProgreso) return;

    loginEnProgreso = true;
    dom.googleButton.disabled = true;

    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: SUPABASE_CONFIG.redirectTo
            }
        });

        if (error) {
            throw error;
        }

        // Si no hubo error, el navegador redirige a Google de inmediato;
        // el código posterior a esta línea normalmente no se ejecuta.

    } catch (error) {
        console.error("[Zovrake] Error al iniciar sesión con Google:", error);
        alert("No se pudo iniciar sesión con Google. Inténtalo de nuevo.");

    } finally {
        loginEnProgreso = false;
        dom.googleButton.disabled = false;
    }
}

if (domListo) {
    dom.googleButton.addEventListener("click", iniciarSesionConGoogle);
}

//Fase 2.

if (domListo) {
    actualizarBotonCrearCuenta();

    dom.termsCheckbox.addEventListener(
        "change",
        actualizarBotonCrearCuenta
    );

    dom.changeEmailButton.addEventListener(
        "click",
        mostrarPantallaCambioCuenta
    );

    dom.cancelChangeButton.addEventListener(
        "click",
        ocultarPantallaCambioCuenta
    );

    // Pantalla 3 -> Pantalla 5: solo tras pulsar "Crear cuenta".
    // La Pantalla 4 sigue siendo independiente ("Usar otro correo").
    dom.createAccountButton.addEventListener(
        "click",
        mostrarConfiguracionPerfil
    );

    dom.profileNameInput.addEventListener(
        "input",
        actualizarBotonContinuarPerfil
    );

    // Normaliza el nombre (sin espacios sobrantes) al continuar.
    dom.profileContinueButton.addEventListener("click", () => {
        const nombre = obtenerNombrePerfil();

        if (!nombrePerfilEsValido(nombre)) return;

        dom.profileNameInput.value = nombre;

        console.log("[Zovrake] Nombre de perfil confirmado:", nombre);

        // Pantalla 5 -> Pantalla 7: guarda el nombre y abre el Dashboard.
        guardarNombreUsuario(nombre);

        const correo = dom.sessionEmail.textContent.trim();

        mostrarDashboard(nombre, correo);
    });

    // Pantalla 2: flujo por correo.
    dom.emailContinueButton.addEventListener(
        "click",
        continuarConCorreo
    );

    // El mensaje de error desaparece en cuanto el correo es válido.
    dom.emailInput.addEventListener("input", () => {
        if (correoEsValido(obtenerCorreo())) {
            ocultarErrorCorreo();
        }
    });

    // Pantalla 6: validación en tiempo real.
    dom.passwordCreateInput.addEventListener(
        "input",
        manejarEntradaPassword
    );

    dom.passwordConfirmInput.addEventListener(
        "input",
        manejarEntradaPassword
    );

    dom.passwordContinueButton.addEventListener(
        "click",
        crearUsuarioConCorreo
    );
    dom.togglePasswordCreate.addEventListener(
        "click",
        () => alternarVisibilidadPassword(
            dom.passwordCreateInput
        )
    );
    
    dom.togglePasswordConfirm.addEventListener(
        "click",
        () => alternarVisibilidadPassword(
            dom.passwordConfirmInput
        )
    );

    // Pantalla 7: navegación del menú lateral (delegación).
    dom.dashboardSidebar.addEventListener(
        "click",
        manejarNavegacionDashboard
    );

    // Menú lateral en móvil.
    dom.dashboardMenuToggle.addEventListener("click", () => {
        dom.dashboardSidebar.classList.toggle("open");
    });

    // Confirmación de cierre de sesión.
    dom.logoutCancel.addEventListener(
        "click",
        cerrarDialogoCerrarSesion
    );

    dom.logoutConfirm.addEventListener(
        "click",
        confirmarCerrarSesion
    );

    // Módulo Requerimientos: navegación interna (delegación).
    // Consulta directa para no afectar la verificación global del DOM.
    const requerimientosTabs = document.getElementById("req-tabs");

    if (requerimientosTabs) {
        requerimientosTabs.addEventListener(
            "click",
            manejarTabsRequerimientos
        );
    }

    // Submódulo Panel de Control: monta el contenido dentro del
    // contenedor #req-workspace ya existente (no crea páginas nuevas).
    ReqWorkspace.iniciar();

    // Navegación profesional: rutas, colapso del menú e historial.
    inicializarNavegacionZovrake();

}

async function cambiarCuenta() {

    ocultarPantallaCambioCuenta();

    try {

        await supabaseClient.auth.signOut();

        await iniciarSesionConGoogle();

    } catch (error) {

        console.error(
            "[Zovrake] Error al cambiar cuenta:",
            error
        );

    }
}

if (domListo) {

    dom.confirmChangeButton.addEventListener(
        "click",
        cambiarCuenta
    );

}
/* --------------------------------------------------------
   6. ESTADO DE AUTENTICACIÓN
   --------------------------------------------------------
   Única fuente de verdad para el estado de sesión: el evento
   onAuthStateChange. La documentación oficial de Supabase
   recomienda este patrón en lugar de llamar a getSession()
   repetidamente, ya que el cliente mantiene la sesión
   sincronizada automáticamente y emite este evento tanto en
   la carga inicial como tras el redirect de OAuth.
   -------------------------------------------------------- */

supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`[Zovrake] Auth event: ${event}`);

    if (!domListo) return;

if (session) {

    console.log(
        "[Zovrake] Usuario autenticado:",
        session.user.email
    );

    // Si ya existe un nombre guardado, el usuario completó antes la
    // configuración inicial: se abre el Dashboard directamente.
    // Si no, se mantiene el flujo de onboarding existente.
    const nombreGuardado = obtenerNombreGuardado();

    if (nombreGuardado) {
        mostrarDashboard(nombreGuardado, session.user.email);
    } else {
        mostrarOnboarding(session.user.email);
    }

} else {

    console.log(
        "[Zovrake] Sin sesión activa."
    );
}

});