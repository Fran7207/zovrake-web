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

    // Normaliza un expediente creado desde "Nuevo Requerimiento" a la
    // misma forma que entrega esta capa (para que el Panel lo lea igual).
    function normalizarCreado(e) {
        const hoy = hoyCero();

        const limite = e.fechaMaxima ? new Date(e.fechaMaxima) : hoy;
        limite.setHours(0, 0, 0, 0);

        const creado = e.fecha ? new Date(e.fecha) : new Date(e.creadoEn || Date.now());

        return {
            codigo: e.codigo,
            obra: e.obra,
            prioridad: e.prioridad || "Media",
            estado: e.estado,
            responsable: e.requeridoPor || "—",
            fechaLimite: limite,
            fechaCreado: creado,
            diasParaVencer: Math.round((limite - hoy) / 86400000)
        };
    }

    // Lee los expedientes creados desde el repositorio (si existe).
    function expedientesCreados() {
        try {
            return RequerimientosDB.listarExpedientes().map(normalizarCreado);
        } catch (error) {
            return [];
        }
    }

    // Devuelve los expedientes (creados + muestra) con fecha calculada.
    function listar() {
        const muestra = FUENTE.map((e) => ({
            ...e,
            fechaLimite: fechaDesdeOffset(e.limite),
            fechaCreado: fechaDesdeOffset(e.creado),
            diasParaVencer: diasRestantes(e.limite)
        }));

        return expedientesCreados().concat(muestra);
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

    // Convierte una marca de tiempo (ms) en "horas transcurridas".
    function horasDesde(en) {
        return Math.max(0, Math.round((Date.now() - en) / 3600000));
    }

    function obtenerActividad() {
        let creada = [];
        try {
            creada = RequerimientosDB.listarActividad().map((a) => ({
                tipo: a.tipo, texto: a.texto, codigo: a.codigo, hace: horasDesde(a.en)
            }));
        } catch (error) {
            creada = [];
        }
        return creada.concat(ACTIVIDAD).slice(0, 8);
    }

    function obtenerNotificaciones() {
        let creadas = [];
        try {
            creadas = RequerimientosDB.listarNotificaciones().map((n) => ({
                texto: n.texto, codigo: n.codigo, hace: horasDesde(n.en)
            }));
        } catch (error) {
            creadas = [];
        }
        return creadas.concat(NOTIFICACIONES).slice(0, 8);
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

/* ==========================================================
   MÓDULO REQUERIMIENTOS — SUBMÓDULO "NUEVO REQUERIMIENTO"
   ----------------------------------------------------------
   Corazón del ERP: aquí nace TODA la información. El residente
   escribe una sola vez; el sistema alimenta automáticamente el
   resto del ecosistema (Panel, Bandeja, Documentos, etc.).

   Se monta dentro de #req-workspace reutilizando la identidad
   visual del Dashboard. Capas independientes:

     RequerimientosDB   -> persistencia + aprendizaje inteligente
     Ortografia         -> sugerencias no destructivas
     DocumentGenerator  -> PDF / Word / Excel del Expediente
     NuevoRequerimiento -> formulario (4 tarjetas) y comportamiento

   PERSISTENCIA: hoy se usa localStorage como repositorio local.
   La API de RequerimientosDB está aislada para sustituirse por
   Supabase/PostgreSQL sin tocar la interfaz (mismo contrato).
   ========================================================== */

/* --------------------------------------------------------
   RequerimientosDB — repositorio + memoria de aprendizaje
   -------------------------------------------------------- */

const RequerimientosDB = (function () {

    const K = {
        expedientes:    "zovrake_req_expedientes",
        memoria:        "zovrake_req_memoria",
        actividad:      "zovrake_req_actividad",
        notificaciones: "zovrake_req_notificaciones",
        documentos:     "zovrake_req_documentos",
        obras:          "zovrake_obras"
    };

    // Catálogo inicial de obras (proviene de "Configuración General";
    // ese módulo lo administrará más adelante). Aporta valores por
    // defecto para el autocompletado antes de que exista historial.
    const OBRAS_SEED = [
        { nombre: "Torre Norte",      lugarEntrega: "Almacén Central — Torre Norte",   requeridoPor: "C. Rivas", cargoRequerido: "Residente de Obra", recibidoPor: "J. Quispe", cargoRecibido: "Almacenero" },
        { nombre: "Planta Sur",       lugarEntrega: "Almacén de Obra — Planta Sur",    requeridoPor: "M. Díaz",  cargoRequerido: "Residente de Obra", recibidoPor: "R. Loayza", cargoRecibido: "Logística" },
        { nombre: "Puente Río",       lugarEntrega: "Frente de trabajo — Puente Río",  requeridoPor: "L. Pérez", cargoRequerido: "Ing. de Campo",    recibidoPor: "S. Núñez",  cargoRecibido: "Almacenero" },
        { nombre: "Edificio Central", lugarEntrega: "Patio de maniobras — E. Central", requeridoPor: "C. Rivas", cargoRequerido: "Residente de Obra", recibidoPor: "J. Quispe", cargoRecibido: "Almacenero" },
        { nombre: "Vía Expressa",     lugarEntrega: "Campamento — Vía Expressa",       requeridoPor: "A. Soto",  cargoRequerido: "Ing. Residente",   recibidoPor: "R. Loayza", cargoRecibido: "Logística" },
        { nombre: "Almacén 4",        lugarEntrega: "Almacén 4",                       requeridoPor: "A. Soto",  cargoRequerido: "Supervisor",       recibidoPor: "S. Núñez",  cargoRecibido: "Almacenero" }
    ];

    // --- Acceso seguro a localStorage (degrada sin romper) ---

    function leer(clave, porDefecto) {
        try {
            const valor = localStorage.getItem(clave);
            return valor ? JSON.parse(valor) : porDefecto;
        } catch (error) {
            return porDefecto;
        }
    }

    function escribir(clave, valor) {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
        } catch (error) {
            console.warn("[Zovrake] No se pudo persistir en localStorage:", error);
        }
    }

    function uid() {
        return "rq-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    }

    // --- Obras (configuración) ---

    function obtenerObras() {
        const obras = leer(K.obras, null);
        if (!obras) {
            escribir(K.obras, OBRAS_SEED);
            return OBRAS_SEED.slice();
        }
        return obras;
    }

    function configObra(nombre) {
        return obtenerObras().find((o) => o.nombre === nombre) || null;
    }

    // --- Memoria de aprendizaje ---
    //
    // Estructura:
    //   { obras: { [obra]: { requeridoPor:{val:count}, cargoRequerido,
    //     recibidoPor, cargoRecibido, lugarEntrega, partidas,
    //     materiales:{ [descLower]: {descripcion, um, count} } } },
    //     partidasGlobal:{val:count}, materialesGlobal:{...} }

    function memoria() {
        return leer(K.memoria, { obras: {}, partidasGlobal: {}, materialesGlobal: {} });
    }

    function asegurarObraMem(mem, obra) {
        if (!mem.obras[obra]) {
            mem.obras[obra] = {
                requeridoPor: {}, cargoRequerido: {}, recibidoPor: {},
                cargoRecibido: {}, lugarEntrega: {}, partidas: {}, materiales: {}
            };
        }
        return mem.obras[obra];
    }

    function sumar(mapa, valor) {
        const v = (valor || "").trim();
        if (!v) return;
        mapa[v] = (mapa[v] || 0) + 1;
    }

    // Aprende a partir de un Expediente CONFIRMADO (nunca de borradores).
    function aprenderDeExpediente(exp) {
        const mem = memoria();
        const obraMem = asegurarObraMem(mem, exp.obra);

        sumar(obraMem.requeridoPor, exp.requeridoPor);
        sumar(obraMem.cargoRequerido, exp.cargoRequerido);
        sumar(obraMem.recibidoPor, exp.recibidoPor);
        sumar(obraMem.cargoRecibido, exp.cargoRecibido);
        sumar(obraMem.lugarEntrega, exp.lugarEntrega);
        sumar(obraMem.partidas, exp.partida);
        sumar(mem.partidasGlobal, exp.partida);

        (exp.materiales || []).forEach((m) => {
            const desc = (m.descripcion || "").trim();
            if (!desc) return;
            const clave = desc.toLowerCase();

            const previo = obraMem.materiales[clave] || { descripcion: desc, um: "", count: 0 };
            previo.descripcion = desc;
            if (m.um) previo.um = m.um;
            previo.count += 1;
            obraMem.materiales[clave] = previo;

            const prevG = mem.materialesGlobal[clave] || { descripcion: desc, um: "", count: 0 };
            prevG.descripcion = desc;
            if (m.um) prevG.um = m.um;
            prevG.count += 1;
            mem.materialesGlobal[clave] = prevG;
        });

        escribir(K.memoria, mem);
    }

    // Ordena un mapa {valor:count} de mayor a menor frecuencia.
    function ranking(mapa) {
        return Object.keys(mapa || {}).sort((a, b) => mapa[b] - mapa[a]);
    }

    function filtrar(lista, texto, limite = 6) {
        const t = (texto || "").trim().toLowerCase();
        const base = t
            ? lista.filter((v) => v.toLowerCase().includes(t))
            : lista;
        return base.slice(0, limite);
    }

    // Valores por defecto + aprendidos para autocompletar una obra.
    function datosObra(nombre) {
        const cfg = configObra(nombre) || {};
        const mem = memoria().obras[nombre] || {};

        const top = (mapa, fallback) => {
            const r = ranking(mapa);
            return r.length ? r[0] : (fallback || "");
        };

        return {
            lugarEntrega:   top(mem.lugarEntrega, cfg.lugarEntrega),
            requeridoPor:   top(mem.requeridoPor, cfg.requeridoPor),
            cargoRequerido: top(mem.cargoRequerido, cfg.cargoRequerido),
            recibidoPor:    top(mem.recibidoPor, cfg.recibidoPor),
            cargoRecibido:  top(mem.cargoRecibido, cfg.cargoRecibido)
        };
    }

    // Sugerencias por campo (combina aprendido + valor de configuración).
    function sugerirCampo(obra, campo, texto) {
        const mem = memoria().obras[obra] || {};
        const cfg = configObra(obra) || {};

        const lista = ranking(mem[campo] || {});
        if (cfg[campo] && !lista.includes(cfg[campo])) lista.push(cfg[campo]);

        return filtrar(lista, texto);
    }

    function sugerirPartidas(obra, texto) {
        const mem = memoria();
        const porObra = ranking((mem.obras[obra] || {}).partidas || {});
        const globales = ranking(mem.partidasGlobal).filter((p) => !porObra.includes(p));
        return filtrar(porObra.concat(globales), texto);
    }

    // Materiales: devuelve [{descripcion, um}] ordenados por frecuencia.
    function sugerirMateriales(obra, texto) {
        const mem = memoria();
        const local = mem.obras[obra] ? mem.obras[obra].materiales : {};
        const fusion = {};

        [mem.materialesGlobal, local].forEach((fuente) => {
            Object.keys(fuente || {}).forEach((clave) => {
                const m = fuente[clave];
                const previo = fusion[clave] || { descripcion: m.descripcion, um: m.um, count: 0 };
                previo.count += m.count;
                if (m.um) previo.um = m.um;
                fusion[clave] = previo;
            });
        });

        const t = (texto || "").trim().toLowerCase();
        return Object.values(fusion)
            .filter((m) => !t || m.descripcion.toLowerCase().includes(t))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7);
    }

    // U.M. aprendida para un material concreto (si existe).
    function umDeMaterial(obra, descripcion) {
        const clave = (descripcion || "").trim().toLowerCase();
        if (!clave) return "";
        const mem = memoria();
        const local = (mem.obras[obra] || {}).materiales || {};
        return (local[clave] && local[clave].um) ||
               (mem.materialesGlobal[clave] && mem.materialesGlobal[clave].um) || "";
    }

    // --- Expedientes ---

    function listarExpedientes() {
        return leer(K.expedientes, []);
    }

    function guardarColeccion(lista) {
        escribir(K.expedientes, lista);
    }

    // Próximo código secuencial para un prefijo dado (REQ / BORR),
    // considerando la numeración ya existente.
    function siguienteCodigo(prefijo, base) {
        const usados = listarExpedientes()
            .map((e) => e.codigo)
            .filter((c) => c && c.indexOf(prefijo + "-") === 0)
            .map((c) => parseInt(c.split("-")[1], 10))
            .filter((n) => !isNaN(n));

        const max = usados.length ? Math.max(...usados) : (base || 0);
        return `${prefijo}-${String(max + 1).padStart(4, "0")}`;
    }

    // Deriva la prioridad a partir de la urgencia del vencimiento.
    function prioridadPorVencimiento(fechaMaximaISO) {
        if (!fechaMaximaISO) return "Media";
        const limite = new Date(fechaMaximaISO);
        limite.setHours(0, 0, 0, 0);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const dias = Math.round((limite - hoy) / 86400000);

        if (dias <= 2) return "Urgente";
        if (dias <= 5) return "Alta";
        if (dias <= 10) return "Media";
        return "Baja";
    }

    function upsert(exp) {
        const lista = listarExpedientes();
        const idx = lista.findIndex((e) => e.id === exp.id);
        if (idx >= 0) lista[idx] = exp; else lista.unshift(exp);
        guardarColeccion(lista);
        return exp;
    }

    // Guarda un BORRADOR (estado borrador). NO genera documentos ni
    // alimenta el aprendizaje. Editable luego desde la Bandeja.
    function guardarBorrador(datos) {
        const exp = {
            ...datos,
            id: datos.id || uid(),
            codigo: datos.codigo || siguienteCodigo("BORR", 0),
            estado: "borrador",
            prioridad: prioridadPorVencimiento(datos.fechaMaxima),
            creadoEn: datos.creadoEn || Date.now(),
            actualizadoEn: Date.now()
        };

        upsert(exp);
        registrarActividad({ tipo: "creado", texto: "Borrador guardado", codigo: exp.codigo });
        return exp;
    }

    // Genera el EXPEDIENTE DIGITAL (confirmado). Estado "enviado":
    // emitido al flujo interno del módulo (aún NO entregado a
    // Logística, que es un traspaso posterior entre módulos). Alimenta
    // el aprendizaje y actualiza actividad / notificaciones / documentos.
    function generarExpediente(datos) {
        const codigo = (datos.codigo && datos.codigo.indexOf("REQ-") === 0)
            ? datos.codigo
            : siguienteCodigo("REQ", 12);

        const exp = {
            ...datos,
            id: datos.id || uid(),
            codigo,
            estado: "enviado",
            prioridad: prioridadPorVencimiento(datos.fechaMaxima),
            creadoEn: datos.creadoEn || Date.now(),
            actualizadoEn: Date.now(),
            documentos: ["pdf", "word", "excel"]
        };

        upsert(exp);
        aprenderDeExpediente(exp);

        registrarActividad({ tipo: "enviado", texto: "Expediente Digital generado", codigo: exp.codigo });
        registrarNotificacion({ texto: `Nuevo expediente ${exp.codigo} · ${exp.obra}`, codigo: exp.codigo });
        registrarDocumentos(exp);

        return exp;
    }

    // --- Actividad / Notificaciones / Documentos (alimentan el Panel) ---

    function recortar(lista, max) {
        return lista.slice(0, max);
    }

    function registrarActividad(evento) {
        const lista = leer(K.actividad, []);
        lista.unshift({ ...evento, en: Date.now() });
        escribir(K.actividad, recortar(lista, 30));
    }

    function listarActividad() {
        return leer(K.actividad, []);
    }

    function registrarNotificacion(notif) {
        const lista = leer(K.notificaciones, []);
        lista.unshift({ ...notif, en: Date.now() });
        escribir(K.notificaciones, recortar(lista, 30));
    }

    function listarNotificaciones() {
        return leer(K.notificaciones, []);
    }

    function registrarDocumentos(exp) {
        const lista = leer(K.documentos, []);
        ["pdf", "word", "excel"].forEach((tipo) => {
            lista.unshift({
                codigo: exp.codigo,
                obra: exp.obra,
                tipo,
                nombre: `${exp.codigo}.${tipo === "word" ? "doc" : (tipo === "excel" ? "xls" : "pdf")}`,
                generadoEn: Date.now()
            });
        });
        escribir(K.documentos, recortar(lista, 120));
    }

    function listarDocumentos() {
        return leer(K.documentos, []);
    }

    /* --------------------------------------------------------
       API adicional para el submódulo DOCUMENTOS
       --------------------------------------------------------
       Métodos AÑADIDOS (no alteran los existentes). Permiten al
       editor profesional leer/actualizar expedientes, asignar el
       número de Expediente (EXP), registrar historial y versiones,
       y enviar a Logística. Listos para mapear a Supabase.
       -------------------------------------------------------- */

    // Busca un expediente por id o por código (REQ/EXP/BORR).
    function buscarExpediente(idOcodigo) {
        return listarExpedientes().find(
            (e) => e.id === idOcodigo || e.codigo === idOcodigo || e.expCodigo === idOcodigo
        ) || null;
    }

    // Persiste cualquier cambio sobre un expediente (upsert).
    function actualizarExpediente(exp) {
        exp.actualizadoEn = Date.now();
        return upsert(exp);
    }

    // Próximo número de Expediente Digital (EXP-#####), global.
    function siguienteExpCodigo() {
        const usados = listarExpedientes()
            .map((e) => e.expCodigo)
            .filter((c) => c && c.indexOf("EXP-") === 0)
            .map((c) => parseInt(c.split("-")[1], 10))
            .filter((n) => !isNaN(n));
        const max = usados.length ? Math.max(...usados) : 0;
        return `EXP-${String(max + 1).padStart(5, "0")}`;
    }

    // Añade una entrada al historial del expediente (usuario, fecha…).
    function registrarHistorial(exp, accion, version) {
        const ahora = new Date();
        if (!Array.isArray(exp.historial)) exp.historial = [];
        exp.historial.unshift({
            usuario: (typeof obtenerNombreGuardado === "function" && obtenerNombreGuardado()) || "Usuario",
            fecha: ahora.toLocaleDateString(),
            hora: ahora.toLocaleTimeString(),
            version: version || exp.version || 1,
            accion,
            en: ahora.getTime()
        });
    }

    // Siembra expedientes de ejemplo COMPLETOS (solo a petición del
    // usuario desde Documentos). Útil para demostrar el editor cuando
    // aún no se ha generado ningún Expediente Digital real.
    function sembrarEjemplos() {
        const ejemplos = [
            {
                obra: "Torre Norte", partida: "Estructuras — Acero",
                requeridoPor: "C. Rivas", cargoRequerido: "Residente de Obra",
                recibidoPor: "J. Quispe", cargoRecibido: "Almacenero",
                lugarEntrega: "Almacén Central — Torre Norte",
                fecha: new Date().toISOString().slice(0, 10),
                fechaMaxima: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
                observacionesGenerales: "Material para vaciado de columnas del nivel 3.",
                materiales: [
                    { descripcion: "Cemento Portland Tipo I", um: "bls", cantidad: "120", observaciones: "" },
                    { descripcion: "Fierro corrugado 1/2\"", um: "var", cantidad: "80", observaciones: "Grado 60" },
                    { descripcion: "Arena gruesa", um: "m3", cantidad: "15", observaciones: "" }
                ],
                adjuntos: []
            },
            {
                obra: "Puente Río", partida: "Obras provisionales",
                requeridoPor: "L. Pérez", cargoRequerido: "Ing. de Campo",
                recibidoPor: "S. Núñez", cargoRecibido: "Almacenero",
                lugarEntrega: "Frente de trabajo — Puente Río",
                fecha: new Date().toISOString().slice(0, 10),
                fechaMaxima: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
                observacionesGenerales: "Requerimiento urgente para encofrado.",
                materiales: [
                    { descripcion: "Madera tornillo 2\"x3\"", um: "und", cantidad: "200", observaciones: "" },
                    { descripcion: "Clavos 3\"", um: "kg", cantidad: "25", observaciones: "" }
                ],
                adjuntos: []
            },
            {
                obra: "Vía Expressa", partida: "Pavimentos",
                requeridoPor: "A. Soto", cargoRequerido: "Ing. Residente",
                recibidoPor: "R. Loayza", cargoRecibido: "Logística",
                lugarEntrega: "Campamento — Vía Expressa",
                fecha: new Date().toISOString().slice(0, 10),
                fechaMaxima: new Date(Date.now() + 12 * 86400000).toISOString().slice(0, 10),
                observacionesGenerales: "",
                materiales: [
                    { descripcion: "Asfalto en caliente", um: "ton", cantidad: "40", observaciones: "" },
                    { descripcion: "Emulsión asfáltica", um: "gal", cantidad: "300", observaciones: "" }
                ],
                adjuntos: []
            }
        ];

        ejemplos.forEach((e) => generarExpediente(e));
    }

    return {
        obtenerObras, configObra, datosObra,
        sugerirCampo, sugerirPartidas, sugerirMateriales, umDeMaterial,
        listarExpedientes, guardarBorrador, generarExpediente,
        listarActividad, listarNotificaciones, listarDocumentos,
        // API adicional (Documentos):
        buscarExpediente, actualizarExpediente, siguienteExpCodigo,
        registrarHistorial, registrarDocumentos, sembrarEjemplos
    };
})();

/* --------------------------------------------------------
   Ortografia — sugerencias no destructivas (no auto-corrige)
   --------------------------------------------------------
   Diccionario ligero de errores frecuentes (genéricos + dominio
   construcción). Detecta y SUGIERE; nunca modifica el texto solo.
   -------------------------------------------------------- */

const Ortografia = (function () {

    const CORRECCIONES = {
        "cemnto": "cemento", "cemeto": "cemento",
        "conreto": "concreto", "conccreto": "concreto",
        "acerro": "acero", "aceo": "acero", "fiero": "fierro",
        "tuberia": "tubería", "tubria": "tubería",
        "valbula": "válvula", "valvula": "válvula",
        "albanil": "albañil", "ladrillu": "ladrillo", "ladrilo": "ladrillo",
        "agreado": "agregado", "agregdo": "agregado",
        "encofrao": "encofrado", "encofrdo": "encofrado",
        "varrilla": "varilla", "varila": "varilla", "clabos": "clavos",
        "alambr": "alambre", "pintua": "pintura",
        "instalacion": "instalación", "electrico": "eléctrico",
        "electrica": "eléctrica", "hidraulico": "hidráulico",
        "metalico": "metálico", "maquina": "máquina",
        "unidaded": "unidades", "cantidd": "cantidad",
        "observacion": "observación", "requerimineto": "requerimiento",
        "requeriminto": "requerimiento", "materil": "material",
        "matrial": "material", "obsevaciones": "observaciones"
    };

    // Devuelve [{palabra, sugerencia}] con los errores encontrados.
    function revisar(texto) {
        if (!texto) return [];

        const vistos = new Set();
        const hallazgos = [];

        (texto.match(/[A-Za-zÁÉÍÓÚáéíóúÑñ]+/g) || []).forEach((palabra) => {
            const clave = palabra.toLowerCase();
            const sugerencia = CORRECCIONES[clave];
            if (sugerencia && sugerencia.toLowerCase() !== clave && !vistos.has(clave)) {
                vistos.add(clave);
                hallazgos.push({ palabra, sugerencia });
            }
        });

        return hallazgos;
    }

    return { revisar };
})();

/* --------------------------------------------------------
   DocumentGenerator — Expediente en PDF / Word / Excel
   --------------------------------------------------------
   Word (.doc) y Excel (.xls) se generan de forma nativa con
   Blobs (sin dependencias). El PDF usa jsPDF cargado bajo demanda
   desde CDN; si no está disponible, recurre a impresión del
   navegador. No modifica el index.html.
   -------------------------------------------------------- */

const DocumentGenerator = (function () {

    let promesaJsPDF = null;

    function cargarJsPDF() {
        if (window.jspdf && window.jspdf.jsPDF) {
            return Promise.resolve(window.jspdf.jsPDF);
        }
        if (promesaJsPDF) return promesaJsPDF;

        promesaJsPDF = new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            s.onload = () => resolve(window.jspdf && window.jspdf.jsPDF);
            s.onerror = () => reject(new Error("No se pudo cargar jsPDF"));
            document.head.appendChild(s);
        });
        return promesaJsPDF;
    }

    function descargar(blob, nombre) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function esc(t) {
        return PanelUtils.escapar(t == null ? "" : t);
    }

    function fila(exp) {
        return [
            ["Código", exp.codigo],
            ["Obra", exp.obra],
            ["Partida", exp.partida],
            ["Requerido por", `${exp.requeridoPor} (${exp.cargoRequerido || "—"})`],
            ["Recibido por", `${exp.recibidoPor} (${exp.cargoRecibido || "—"})`],
            ["Lugar de entrega", exp.lugarEntrega],
            ["Fecha", exp.fecha],
            ["Fecha máxima de ingreso", exp.fechaMaxima]
        ];
    }

    // Tabla HTML de materiales reutilizada por Word y Excel.
    function tablaMaterialesHTML() {
        return (exp) => `
            <table border="1" cellspacing="0" cellpadding="6">
                <thead>
                    <tr>
                        <th>Ítem</th><th>Descripción de Material</th><th>U.M.</th>
                        <th>Cantidad</th><th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${exp.materiales.map((m, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td>${esc(m.descripcion)}</td>
                            <td>${esc(m.um)}</td>
                            <td>${esc(m.cantidad)}</td>
                            <td>${esc(m.observaciones)}</td>
                        </tr>`).join("")}
                </tbody>
            </table>`;
    }

    function cabeceraHTML(exp) {
        return fila(exp).map(([k, v]) =>
            `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`
        ).join("");
    }

    function descargarWord(exp) {
        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head><meta charset="utf-8"><title>${esc(exp.codigo)}</title></head>
            <body style="font-family:Arial,sans-serif;color:#222">
                <h1 style="color:#B68A2E">ZOVRAKE — Expediente Digital</h1>
                <h2>${esc(exp.codigo)}</h2>
                <table border="0" cellpadding="4">${cabeceraHTML(exp)}</table>
                <h3>Detalle del Requerimiento</h3>
                ${tablaMaterialesHTML()(exp)}
                <h3>Observaciones Generales</h3>
                <p>${esc(exp.observacionesGenerales) || "—"}</p>
            </body></html>`;

        descargar(new Blob([html], { type: "application/msword" }), `${exp.codigo}.doc`);
    }

    function descargarExcel(exp) {
        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="utf-8"></head>
            <body>
                <table border="1">
                    <tr><th colspan="5" style="background:#B68A2E;color:#fff">ZOVRAKE — Expediente ${esc(exp.codigo)}</th></tr>
                    <tr><td>Obra</td><td colspan="4">${esc(exp.obra)}</td></tr>
                    <tr><td>Partida</td><td colspan="4">${esc(exp.partida)}</td></tr>
                    <tr><td>Requerido por</td><td colspan="4">${esc(exp.requeridoPor)}</td></tr>
                    <tr><td>Fecha máxima</td><td colspan="4">${esc(exp.fechaMaxima)}</td></tr>
                    <tr></tr>
                    <tr>
                        <th>Ítem</th><th>Descripción de Material</th><th>U.M.</th>
                        <th>Cantidad</th><th>Observaciones</th>
                    </tr>
                    ${exp.materiales.map((m, i) => `
                        <tr>
                            <td>${i + 1}</td><td>${esc(m.descripcion)}</td><td>${esc(m.um)}</td>
                            <td>${esc(m.cantidad)}</td><td>${esc(m.observaciones)}</td>
                        </tr>`).join("")}
                </table>
            </body></html>`;

        descargar(new Blob([html], { type: "application/vnd.ms-excel" }), `${exp.codigo}.xls`);
    }

    function imprimirComoPDF(exp) {
        const ventana = window.open("", "_blank");
        if (!ventana) return;
        ventana.document.write(`
            <html><head><meta charset="utf-8"><title>${esc(exp.codigo)}</title></head>
            <body style="font-family:Arial,sans-serif;padding:24px">
                <h1 style="color:#B68A2E">ZOVRAKE — Expediente Digital</h1>
                <h2>${esc(exp.codigo)}</h2>
                <table cellpadding="4">${cabeceraHTML(exp)}</table>
                <h3>Detalle del Requerimiento</h3>
                ${tablaMaterialesHTML()(exp)}
                <h3>Observaciones Generales</h3>
                <p>${esc(exp.observacionesGenerales) || "—"}</p>
                <script>window.onload=function(){window.print();}<\/script>
            </body></html>`);
        ventana.document.close();
    }

    function descargarPDF(exp) {
        return cargarJsPDF().then((JsPDF) => {
            if (!JsPDF) { imprimirComoPDF(exp); return; }

            const doc = new JsPDF({ unit: "pt", format: "a4" });
            const margen = 40;
            let y = 50;

            doc.setFontSize(18);
            doc.setTextColor(182, 138, 46);
            doc.text("ZOVRAKE — Expediente Digital", margen, y);

            y += 24;
            doc.setFontSize(13);
            doc.setTextColor(40, 40, 40);
            doc.text(exp.codigo, margen, y);

            y += 22;
            doc.setFontSize(10);
            fila(exp).forEach(([k, v]) => {
                doc.setTextColor(120, 120, 120);
                doc.text(`${k}:`, margen, y);
                doc.setTextColor(40, 40, 40);
                doc.text(String(v == null ? "" : v), margen + 130, y);
                y += 16;
            });

            y += 10;
            doc.setFontSize(12);
            doc.setTextColor(182, 138, 46);
            doc.text("Detalle del Requerimiento", margen, y);
            y += 16;

            doc.setFontSize(9);
            doc.setTextColor(40, 40, 40);
            doc.text("Ítem", margen, y);
            doc.text("Descripción", margen + 40, y);
            doc.text("U.M.", margen + 300, y);
            doc.text("Cant.", margen + 360, y);
            y += 4;
            doc.line(margen, y, 555, y);
            y += 14;

            exp.materiales.forEach((m, i) => {
                if (y > 780) { doc.addPage(); y = 50; }
                doc.text(String(i + 1), margen, y);
                doc.text(String(m.descripcion || "").slice(0, 60), margen + 40, y);
                doc.text(String(m.um || ""), margen + 300, y);
                doc.text(String(m.cantidad || ""), margen + 360, y);
                y += 15;
            });

            if (exp.observacionesGenerales) {
                y += 16;
                doc.setTextColor(182, 138, 46);
                doc.setFontSize(12);
                doc.text("Observaciones Generales", margen, y);
                y += 16;
                doc.setTextColor(40, 40, 40);
                doc.setFontSize(10);
                doc.text(doc.splitTextToSize(exp.observacionesGenerales, 515), margen, y);
            }

            doc.save(`${exp.codigo}.pdf`);
        }).catch(() => imprimirComoPDF(exp));
    }

    return { descargarPDF, descargarWord, descargarExcel };
})();

/* --------------------------------------------------------
   NuevoRequerimiento — formulario (4 tarjetas) + comportamiento
   -------------------------------------------------------- */

const NuevoRequerimiento = (function () {

    // Estado de trabajo del formulario en curso (vive solo en sesión).
    let materiales = [];
    let adjuntos = [];

    function nuevaFila() {
        return { descripcion: "", um: "", cantidad: "", observaciones: "" };
    }

    function fechaHoyISO() {
        const d = new Date();
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 10);
    }

    /* ---------- RENDER (HTML del submódulo) ---------- */

    function campo(id, etiqueta, { req = false, tipo = "text", autocomplete = false, valor = "" } = {}) {
        return `
            <div class="nr-field" data-field="${id}">
                <label class="nr-label" for="nr-${id}">${etiqueta}${req ? ' <span class="nr-req">*</span>' : ""}</label>
                <input class="nr-input" id="nr-${id}" type="${tipo}" value="${PanelUtils.escapar(valor)}"
                    autocomplete="off" ${autocomplete ? 'data-ac="1"' : ""}>
                ${autocomplete ? '<ul class="nr-suggest" hidden></ul>' : ""}
                <span class="nr-error" hidden></span>
            </div>`;
    }

    function render() {
        const obras = RequerimientosDB.obtenerObras();
        const opciones = obras
            .map((o) => `<option value="${PanelUtils.escapar(o.nombre)}">${PanelUtils.escapar(o.nombre)}</option>`)
            .join("");

        return `
        <form class="nr" id="nr-form" novalidate>

            <div class="nr-head">
                <div>
                    <h2 class="nr-title">Nuevo Requerimiento</h2>
                    <p class="nr-sub">Escribe la información una sola vez. El sistema alimentará el resto del ERP automáticamente.</p>
                </div>
            </div>

            <div class="nr-alert" id="nr-alert" hidden></div>

            <!-- TARJETA 1 — INFORMACIÓN GENERAL -->
            <section class="nr-card">
                <header class="nr-card-head">
                    <span class="nr-step">1</span>
                    <h3 class="nr-card-title">Información General</h3>
                </header>

                <div class="nr-grid">
                    <div class="nr-field" data-field="obra">
                        <label class="nr-label" for="nr-obra">Obra <span class="nr-req">*</span></label>
                        <select class="nr-input" id="nr-obra">
                            <option value="">Selecciona una obra…</option>
                            ${opciones}
                        </select>
                        <span class="nr-error" hidden></span>
                    </div>

                    ${campo("partida", "Partida", { req: true, autocomplete: true })}
                    ${campo("requeridoPor", "Requerido por", { req: true, autocomplete: true })}
                    ${campo("cargoRequerido", "Cargo", { autocomplete: true })}
                    ${campo("recibidoPor", "Recibido por", { req: true, autocomplete: true })}
                    ${campo("cargoRecibido", "Cargo", { autocomplete: true })}
                    ${campo("fecha", "Fecha", { req: true, tipo: "date", valor: fechaHoyISO() })}
                    ${campo("lugarEntrega", "Lugar de entrega", { req: true, autocomplete: true })}
                    ${campo("fechaMaxima", "Fecha máxima de ingreso a obra", { req: true, tipo: "date" })}
                </div>
            </section>

            <!-- TARJETA 2 — DETALLE DEL REQUERIMIENTO -->
            <section class="nr-card">
                <header class="nr-card-head">
                    <span class="nr-step">2</span>
                    <h3 class="nr-card-title">Detalle del Requerimiento</h3>
                    <button type="button" class="nr-btn nr-btn-soft" data-nr="add-row">+ Agregar fila</button>
                </header>

                <div class="nr-table-wrap zv-no-scrollbar">
                    <table class="nr-table">
                        <thead>
                            <tr>
                                <th class="nr-th-item">Ítem</th>
                                <th>Descripción de Material</th>
                                <th class="nr-th-um">U.M.</th>
                                <th class="nr-th-cant">Cantidad</th>
                                <th>Observaciones</th>
                                <th class="nr-th-acc"></th>
                            </tr>
                        </thead>
                        <tbody id="nr-tbody"></tbody>
                    </table>
                </div>
            </section>

            <!-- TARJETA 3 — OBSERVACIONES GENERALES -->
            <section class="nr-card">
                <header class="nr-card-head">
                    <span class="nr-step">3</span>
                    <h3 class="nr-card-title">Observaciones Generales</h3>
                </header>

                <textarea class="nr-input nr-textarea" id="nr-observaciones" rows="4"
                    spellcheck="true"
                    placeholder="Indicaciones, condiciones de entrega, detalles relevantes…"></textarea>
                <div class="nr-spell" id="nr-spell-obs" hidden></div>
            </section>

            <!-- TARJETA 4 — DOCUMENTOS ADJUNTOS -->
            <section class="nr-card">
                <header class="nr-card-head">
                    <span class="nr-step">4</span>
                    <h3 class="nr-card-title">Documentos Adjuntos</h3>
                </header>

                <div class="nr-drop" id="nr-drop" tabindex="0">
                    <input type="file" id="nr-files" multiple hidden
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.txt">
                    <div class="nr-drop-inner">
                        <span class="nr-drop-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16"/></svg>
                        </span>
                        <span>Arrastra fotos, planos, PDF o especificaciones, o <strong>haz clic para subir</strong></span>
                    </div>
                </div>
                <ul class="nr-files" id="nr-file-list"></ul>
            </section>

            <!-- ACCIONES -->
            <div class="nr-actions">
                <button type="button" class="nr-btn nr-btn-ghost" data-nr="cancelar">Cancelar</button>
                <button type="button" class="nr-btn nr-btn-soft" data-nr="borrador">Guardar Borrador</button>
                <button type="button" class="nr-btn nr-btn-primary" data-nr="generar">Generar Expediente Digital</button>
            </div>

        </form>`;
    }

    /* ---------- TABLA DE MATERIALES ---------- */

    function filaHTML(m, idx) {
        return `
            <tr class="nr-row" data-idx="${idx}">
                <td class="nr-col-item">${idx + 1}</td>
                <td>
                    <div class="nr-cell-ac">
                        <input class="nr-input" data-col="descripcion" data-ac-mat="1"
                            autocomplete="off" value="${PanelUtils.escapar(m.descripcion)}"
                            placeholder="Escribe el material…">
                        <ul class="nr-suggest" hidden></ul>
                    </div>
                </td>
                <td><input class="nr-input nr-um" data-col="um" value="${PanelUtils.escapar(m.um)}" placeholder="und"></td>
                <td><input class="nr-input nr-cant" data-col="cantidad" type="number" min="0" step="any" value="${PanelUtils.escapar(m.cantidad)}"></td>
                <td><input class="nr-input" data-col="observaciones" value="${PanelUtils.escapar(m.observaciones)}" placeholder="Opcional"></td>
                <td class="nr-row-actions">
                    <button type="button" data-row="up" title="Subir">▲</button>
                    <button type="button" data-row="down" title="Bajar">▼</button>
                    <button type="button" data-row="dup" title="Duplicar fila">⧉</button>
                    <button type="button" data-row="del" title="Eliminar fila">✕</button>
                </td>
            </tr>`;
    }

    function pintarTabla(root) {
        const tbody = root.querySelector("#nr-tbody");
        if (!tbody) return;
        tbody.innerHTML = materiales.map((m, i) => filaHTML(m, i)).join("");
    }

    /* ---------- ADJUNTOS ---------- */

    function formatoTamano(bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    }

    function pintarAdjuntos(root) {
        const lista = root.querySelector("#nr-file-list");
        if (!lista) return;

        lista.innerHTML = adjuntos.map((a, i) => `
            <li class="nr-file">
                <span class="nr-file-name">${PanelUtils.escapar(a.nombre)}</span>
                <span class="nr-file-size">${formatoTamano(a.tamano)}</span>
                <button type="button" class="nr-file-del" data-file="${i}" title="Quitar">✕</button>
            </li>`).join("");
    }

    function agregarArchivos(root, fileList) {
        Array.from(fileList).forEach((f) => {
            adjuntos.push({ nombre: f.name, tipo: f.type, tamano: f.size, ref: f });
        });
        pintarAdjuntos(root);
    }

    /* ---------- AUTOCOMPLETADO GENÉRICO ---------- */

    // Conecta un input con una lista flotante de sugerencias.
    // proveedor(texto) -> [string] | [{label, value, meta}]
    // alElegir(item) -> callback opcional tras seleccionar.
    function autocompletar(input, proveedor, alElegir) {
        const lista = input.parentElement.querySelector(".nr-suggest");
        if (!lista) return;

        function cerrar() { lista.hidden = true; lista.innerHTML = ""; }

        function abrir() {
            const items = proveedor(input.value) || [];
            if (items.length === 0) { cerrar(); return; }

            lista.innerHTML = items.map((it) => {
                const label = typeof it === "string" ? it : it.label;
                const meta = (typeof it === "object" && it.meta) ? `<span class="nr-suggest-meta">${PanelUtils.escapar(it.meta)}</span>` : "";
                return `<li class="nr-suggest-item" data-val="${PanelUtils.escapar(typeof it === "string" ? it : it.value)}">${PanelUtils.escapar(label)}${meta}</li>`;
            }).join("");
            lista.hidden = false;
        }

        input.addEventListener("input", abrir);
        input.addEventListener("focus", abrir);
        input.addEventListener("blur", () => setTimeout(cerrar, 150));

        lista.addEventListener("mousedown", (e) => {
            const opcion = e.target.closest(".nr-suggest-item");
            if (!opcion) return;
            e.preventDefault();
            input.value = opcion.dataset.val;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            if (alElegir) alElegir(opcion.dataset.val);
            cerrar();
        });
    }

    /* ---------- ORTOGRAFÍA (sugerencias) ---------- */

    function revisarOrtografia(texto, contenedor) {
        const hallazgos = Ortografia.revisar(texto);
        if (hallazgos.length === 0) { contenedor.hidden = true; contenedor.innerHTML = ""; return; }

        contenedor.hidden = false;
        contenedor.innerHTML =
            `<span class="nr-spell-label">Sugerencias:</span> ` +
            hallazgos.map((h) =>
                `<button type="button" class="nr-spell-chip" data-mal="${PanelUtils.escapar(h.palabra)}" data-bien="${PanelUtils.escapar(h.sugerencia)}">${PanelUtils.escapar(h.palabra)} → <strong>${PanelUtils.escapar(h.sugerencia)}</strong></button>`
            ).join("");
    }

    /* ---------- RECOLECCIÓN Y VALIDACIÓN ---------- */

    function valor(root, id) {
        const el = root.querySelector(`#nr-${id}`);
        return el ? el.value.trim() : "";
    }

    function recolectar(root) {
        return {
            obra:               valor(root, "obra"),
            partida:            valor(root, "partida"),
            requeridoPor:       valor(root, "requeridoPor"),
            cargoRequerido:     valor(root, "cargoRequerido"),
            recibidoPor:        valor(root, "recibidoPor"),
            cargoRecibido:      valor(root, "cargoRecibido"),
            fecha:              valor(root, "fecha"),
            lugarEntrega:       valor(root, "lugarEntrega"),
            fechaMaxima:        valor(root, "fechaMaxima"),
            observacionesGenerales: (root.querySelector("#nr-observaciones") || {}).value || "",
            materiales: materiales
                .map((m) => ({ ...m, cantidad: m.cantidad }))
                .filter((m) => m.descripcion.trim() !== ""),
            adjuntos: adjuntos.map((a) => ({ nombre: a.nombre, tipo: a.tipo, tamano: a.tamano }))
        };
    }

    function limpiarErrores(root) {
        root.querySelectorAll(".nr-field").forEach((f) => f.classList.remove("nr-invalid"));
        root.querySelectorAll(".nr-error").forEach((e) => { e.hidden = true; e.textContent = ""; });
    }

    function marcarError(root, id, mensaje) {
        const field = root.querySelector(`.nr-field[data-field="${id}"]`);
        if (!field) return;
        field.classList.add("nr-invalid");
        const span = field.querySelector(".nr-error");
        if (span) { span.hidden = false; span.textContent = mensaje; }
    }

    function mostrarAlerta(root, tipo, html) {
        const alerta = root.querySelector("#nr-alert");
        if (!alerta) return;
        alerta.className = `nr-alert is-${tipo}`;
        alerta.innerHTML = html;
        alerta.hidden = false;
        alerta.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Validación completa para "Generar". Devuelve true/false.
    function validarCompleto(root, datos) {
        limpiarErrores(root);
        const errores = [];

        const obligatorios = [
            ["obra", "Selecciona una obra."],
            ["partida", "Indica la partida."],
            ["requeridoPor", "Indica quién lo requiere."],
            ["recibidoPor", "Indica quién recibe."],
            ["lugarEntrega", "Indica el lugar de entrega."],
            ["fecha", "Indica la fecha."],
            ["fechaMaxima", "Indica la fecha máxima de ingreso."]
        ];

        obligatorios.forEach(([id, msg]) => {
            if (!datos[id]) { marcarError(root, id, msg); errores.push(msg); }
        });

        // Materiales: al menos uno, con descripción y cantidad > 0.
        if (datos.materiales.length === 0) {
            errores.push("Agrega al menos un material con su cantidad.");
        } else {
            const sinCantidad = datos.materiales.some(
                (m) => !(parseFloat(m.cantidad) > 0)
            );
            if (sinCantidad) errores.push("Cada material debe tener una cantidad mayor a 0.");
        }

        if (errores.length > 0) {
            mostrarAlerta(root, "error",
                `<strong>Revisa el formulario:</strong><ul>${errores.map((e) => `<li>${PanelUtils.escapar(e)}</li>`).join("")}</ul>`);
            return false;
        }
        return true;
    }

    /* ---------- ACCIONES ---------- */

    function guardarBorrador(root) {
        const datos = recolectar(root);

        if (!datos.obra) {
            limpiarErrores(root);
            marcarError(root, "obra", "Selecciona una obra para guardar el borrador.");
            mostrarAlerta(root, "error", "Para guardar un borrador necesitas al menos seleccionar la obra.");
            return;
        }

        const exp = RequerimientosDB.guardarBorrador(datos);
        mostrarAlerta(root, "ok",
            `Borrador <strong>${PanelUtils.escapar(exp.codigo)}</strong> guardado. Podrás retomarlo desde la Bandeja de Trabajo. ` +
            `<button type="button" class="nr-link" data-accion="quick" data-destino="bandeja-trabajo">Ir a la Bandeja</button>`);
    }

    function generarExpediente(root) {
        const datos = recolectar(root);
        if (!validarCompleto(root, datos)) return;

        const exp = RequerimientosDB.generarExpediente(datos);
        pantallaExito(root, exp);
    }

    // Reemplaza el formulario por una confirmación con descargas.
    function pantallaExito(root, exp) {
        const ws = root.closest("#req-workspace") || root.parentElement;
        ws.innerHTML = `
            <div class="nr-success">
                <div class="nr-success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>
                </div>
                <h2 class="nr-success-title">Expediente Digital generado</h2>
                <p class="nr-success-text">
                    Se creó el expediente <strong>${PanelUtils.escapar(exp.codigo)}</strong> para la obra
                    <strong>${PanelUtils.escapar(exp.obra)}</strong>. Quedó registrado en Documentos y se actualizaron
                    el Panel de Control, la Bandeja, el Seguimiento, el Historial y las Notificaciones.
                </p>

                <p class="nr-success-sub">Documentos generados</p>
                <div class="nr-doc-buttons">
                    <button type="button" class="nr-btn nr-btn-soft" data-doc="pdf" data-codigo="${exp.codigo}">Descargar PDF</button>
                    <button type="button" class="nr-btn nr-btn-soft" data-doc="word" data-codigo="${exp.codigo}">Descargar Word</button>
                    <button type="button" class="nr-btn nr-btn-soft" data-doc="excel" data-codigo="${exp.codigo}">Descargar Excel</button>
                </div>

                <div class="nr-success-actions">
                    <button type="button" class="nr-btn nr-btn-primary" data-nr="nuevo-otro">Crear otro requerimiento</button>
                    <button type="button" class="nr-btn nr-btn-ghost" data-accion="volver-panel">Ir al Panel de Control</button>
                </div>
            </div>`;

        // Listeners de la pantalla de éxito (descargas + crear otro).
        ws.querySelectorAll("[data-doc]").forEach((btn) => {
            btn.addEventListener("click", () => {
                if (btn.dataset.doc === "pdf") DocumentGenerator.descargarPDF(exp);
                else if (btn.dataset.doc === "word") DocumentGenerator.descargarWord(exp);
                else DocumentGenerator.descargarExcel(exp);
            });
        });

        const otro = ws.querySelector('[data-nr="nuevo-otro"]');
        if (otro) otro.addEventListener("click", () => ReqWorkspace.render("nuevo-requerimiento"));
    }

    function cancelar(root) {
        const hayDatos = recolectar(root).obra || materiales.some((m) => m.descripcion) || adjuntos.length;
        if (hayDatos && !confirm("¿Descartar los cambios no guardados?")) return;
        ReqWorkspace.irATab("panel-control");
    }

    /* ---------- MONTAJE / WIRING ---------- */

    function montar(ws) {
        const root = ws.querySelector("#nr-form");
        if (!root) return;

        // Estado inicial: una fila vacía, sin adjuntos.
        materiales = [nuevaFila()];
        adjuntos = [];
        pintarTabla(root);

        // Obra -> autocompleta el resto de la Tarjeta 1.
        const selObra = root.querySelector("#nr-obra");
        selObra.addEventListener("change", () => {
            const d = RequerimientosDB.datosObra(selObra.value);
            const set = (id, v) => { const el = root.querySelector(`#nr-${id}`); if (el && !el.value) el.value = v || ""; };
            set("lugarEntrega", d.lugarEntrega);
            set("requeridoPor", d.requeridoPor);
            set("cargoRequerido", d.cargoRequerido);
            set("recibidoPor", d.recibidoPor);
            set("cargoRecibido", d.cargoRecibido);
        });

        // Autocompletado de los campos de la Tarjeta 1.
        const campoAC = [
            ["partida", (t) => RequerimientosDB.sugerirPartidas(selObra.value, t)],
            ["requeridoPor", (t) => RequerimientosDB.sugerirCampo(selObra.value, "requeridoPor", t)],
            ["cargoRequerido", (t) => RequerimientosDB.sugerirCampo(selObra.value, "cargoRequerido", t)],
            ["recibidoPor", (t) => RequerimientosDB.sugerirCampo(selObra.value, "recibidoPor", t)],
            ["cargoRecibido", (t) => RequerimientosDB.sugerirCampo(selObra.value, "cargoRecibido", t)],
            ["lugarEntrega", (t) => RequerimientosDB.sugerirCampo(selObra.value, "lugarEntrega", t)]
        ];
        campoAC.forEach(([id, proveedor]) => {
            const input = root.querySelector(`#nr-${id}`);
            if (input) autocompletar(input, proveedor);
        });

        // Tabla: cambios de valor (delegación input).
        const tbody = root.querySelector("#nr-tbody");

        tbody.addEventListener("input", (e) => {
            const input = e.target;
            const fila = input.closest(".nr-row");
            if (!fila) return;
            const idx = parseInt(fila.dataset.idx, 10);
            const col = input.dataset.col;
            if (col && materiales[idx]) materiales[idx][col] = input.value;
        });

        // Tabla: acciones de fila (delegación click).
        tbody.addEventListener("click", (e) => {
            const boton = e.target.closest("[data-row]");
            if (!boton) return;
            const fila = boton.closest(".nr-row");
            const idx = parseInt(fila.dataset.idx, 10);
            const accion = boton.dataset.row;

            if (accion === "del") {
                materiales.splice(idx, 1);
                if (materiales.length === 0) materiales.push(nuevaFila());
            } else if (accion === "dup") {
                materiales.splice(idx + 1, 0, { ...materiales[idx] });
            } else if (accion === "up" && idx > 0) {
                [materiales[idx - 1], materiales[idx]] = [materiales[idx], materiales[idx - 1]];
            } else if (accion === "down" && idx < materiales.length - 1) {
                [materiales[idx + 1], materiales[idx]] = [materiales[idx], materiales[idx + 1]];
            }
            pintarTabla(root);
        });

        // Tabla: autocompletado inteligente de materiales (delegación focusin).
        tbody.addEventListener("focusin", (e) => {
            const input = e.target;
            if (input.dataset.acMat !== "1") return;
            if (input.dataset.acReady === "1") return;
            input.dataset.acReady = "1";

            const fila = input.closest(".nr-row");
            const idx = parseInt(fila.dataset.idx, 10);

            autocompletar(
                input,
                (t) => RequerimientosDB.sugerirMateriales(selObra.value, t)
                    .map((m) => ({ label: m.descripcion, value: m.descripcion, meta: m.um || "" })),
                (descripcion) => {
                    // Al elegir, autocompleta la U.M. si está vacía.
                    const um = RequerimientosDB.umDeMaterial(selObra.value, descripcion);
                    const umInput = fila.querySelector('[data-col="um"]');
                    if (um && umInput && !umInput.value) {
                        umInput.value = um;
                        materiales[idx].um = um;
                    }
                    materiales[idx].descripcion = descripcion;
                }
            );
            // Dispara para mostrar sugerencias en el primer foco.
            input.dispatchEvent(new Event("focus"));
        });

        // Agregar fila.
        root.querySelector('[data-nr="add-row"]').addEventListener("click", () => {
            materiales.push(nuevaFila());
            pintarTabla(root);
        });

        // Observaciones generales: ortografía (no destructiva).
        const obs = root.querySelector("#nr-observaciones");
        const spellObs = root.querySelector("#nr-spell-obs");
        obs.addEventListener("input", () => revisarOrtografia(obs.value, spellObs));
        spellObs.addEventListener("click", (e) => {
            const chip = e.target.closest(".nr-spell-chip");
            if (!chip) return;
            const re = new RegExp(`\\b${chip.dataset.mal}\\b`, "g");
            obs.value = obs.value.replace(re, chip.dataset.bien);
            revisarOrtografia(obs.value, spellObs);
        });

        // Adjuntos: clic, teclado, drag & drop, eliminar.
        const drop = root.querySelector("#nr-drop");
        const fileInput = root.querySelector("#nr-files");

        drop.addEventListener("click", () => fileInput.click());
        drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
        fileInput.addEventListener("change", () => agregarArchivos(root, fileInput.files));

        ["dragover", "dragenter"].forEach((ev) =>
            drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("is-over"); }));
        ["dragleave", "drop"].forEach((ev) =>
            drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("is-over"); }));
        drop.addEventListener("drop", (e) => { if (e.dataTransfer) agregarArchivos(root, e.dataTransfer.files); });

        root.querySelector("#nr-file-list").addEventListener("click", (e) => {
            const del = e.target.closest(".nr-file-del");
            if (!del) return;
            adjuntos.splice(parseInt(del.dataset.file, 10), 1);
            pintarAdjuntos(root);
        });

        // Botones principales.
        root.querySelector('[data-nr="borrador"]').addEventListener("click", () => guardarBorrador(root));
        root.querySelector('[data-nr="generar"]').addEventListener("click", () => generarExpediente(root));
        root.querySelector('[data-nr="cancelar"]').addEventListener("click", () => cancelar(root));
    }

    return { render, montar };
})();

/* ==========================================================
   CONFIGURACIÓN GENERAL — identidad institucional (origen)
   ----------------------------------------------------------
   Fuente de la identidad de la empresa (logo, razón social, RUC,
   colores institucionales, tipografía). El submódulo Documentos
   la CONSULTA; no la edita. El futuro módulo "Configuración
   General" administrará estos valores; hoy se entregan por defecto
   y quedan persistidos para mantener coherencia visual.
   ========================================================== */

const ConfiguracionGeneral = (function () {

    const CLAVE = "zovrake_config_general";

    const POR_DEFECTO = {
        empresa: "ZOVRAKE CONSTRUCCIONES S.A.C.",
        ruc: "20512345678",
        direccion: "Av. Principal 123 — Lima, Perú",
        logoUrl: "",                 // vacío -> se muestra el monograma "Z"
        colorPrimario: "#B68A2E",    // acento institucional (coincide con --dash-accent)
        colorTexto: "#26241E",
        fuente: "Arial"
    };

    // Códigos de obra institucionales (origen: Configuración General).
    const CODIGOS = {
        "Torre Norte": "OBR-TN",
        "Planta Sur": "OBR-PS",
        "Puente Río": "OBR-PR",
        "Edificio Central": "OBR-EC",
        "Vía Expressa": "OBR-VE",
        "Almacén 4": "OBR-A4"
    };

    function obtener() {
        let guardada = null;
        try { guardada = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { guardada = null; }
        return { ...POR_DEFECTO, ...(guardada || {}) };
    }

    // Deriva un código de obra estable cuando no está catalogado.
    function codigoObra(nombre) {
        if (!nombre) return "OBR-—";
        if (CODIGOS[nombre]) return CODIGOS[nombre];
        const iniciales = nombre
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .split(/\s+/).map((p) => p[0]).join("").toUpperCase().slice(0, 4);
        return "OBR-" + (iniciales || "GEN");
    }

    return { obtener, codigoObra };
})();

/* ==========================================================
   MÓDULO REQUERIMIENTOS — SUBMÓDULO "DOCUMENTOS"
   ----------------------------------------------------------
   Editor Profesional del Expediente Digital. NO registra datos
   nuevos: toda la información proviene del Expediente Digital
   (generado en Nuevo Requerimiento) y de Configuración General.

   El documento es una HOJA HTML editable con apariencia tipo
   Microsoft Excel (no es PDF ni imagen). Reutiliza:
     • RequerimientosDB    -> lectura/actualización del expediente
     • ConfiguracionGeneral-> identidad institucional
     • DocumentGenerator   -> exportación PDF / Word / Excel
     • Ortografia          -> sugerencias del Panel de Calidad

   Estructura: Panel superior (meta + filtros) · Panel izquierdo
   (expedientes agrupados por obra) · Barra de herramientas ·
   Hoja editable · Panel de Calidad · Historial.
   ========================================================== */

const Documentos = (function () {

    /* ====== Estado de sesión (no se persiste como historial) ====== */
    let seleccionId = null;       // expediente activo en el administrador
    let abiertoId = null;         // expediente abierto en el Editor Profesional
    let docActual = null;         // modelo editable del documento en curso
    let expActual = null;         // expediente abierto en el editor
    let undoStack = [];
    let redoStack = [];
    let snapshotPendiente = null; // snapshot capturado al entrar a un campo
    let autosaveTimer = null;
    let calidadTimer = null;
    let estadoGuardado = "guardado"; // "guardado" | "guardando" | "pendiente"
    let menuDescarga = false;       // menú de descarga del editor
    let menuDescargaDet = false;    // menú de descarga del panel de acciones
    let calidadColapsada = false;
    let resize = null;              // estado del redimensionado de columna

    /* ====== Estados del ciclo de vida (solo activos + enviado) ====== */
    const ESTADOS = {
        "en-edicion":        { label: "En edición",          clase: "edicion" },
        "listo":             { label: "Listo para envío",    clase: "listo" },
        "observado":         { label: "Con observaciones",   clase: "observado" },
        "enviado-logistica": { label: "Enviado a Logística", clase: "enviado" }
    };

    function estadoDoc(exp) {
        if (exp.docEstado && ESTADOS[exp.docEstado]) return exp.docEstado;
        return "listo";
    }

    /* ====== Utilidades ====== */
    const esc = (t) => PanelUtils.escapar(t == null ? "" : t);
    const clon = (o) => JSON.parse(JSON.stringify(o));

    // Extrae texto plano de un fragmento HTML (campos enriquecidos).
    function txt(html) {
        const d = document.createElement("div");
        d.innerHTML = html == null ? "" : String(html);
        return (d.textContent || "").replace(/\u00a0/g, " ").trim();
    }

    function fechaHora(ms) {
        if (!ms) return "—";
        const d = new Date(ms);
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    function usuarioActual() {
        return (typeof obtenerNombreGuardado === "function" && obtenerNombreGuardado()) || "Usuario";
    }

    function rootAdmin() { return document.querySelector("#dx-root"); }
    function rootEditor() { return document.querySelector("#dx-editor"); }
    function sheetEl() { return document.querySelector("#dx-sheet"); }

    /* ====== Acceso a expedientes ACTIVOS ====== */
    // Activos = con Expediente Digital y aún NO enviados a Logística.
    // Los enviados pertenecen al módulo Archivo (este submódulo no los muestra).
    function activosBase() {
        return RequerimientosDB.listarExpedientes()
            .filter((e) => e.estado !== "borrador" && !e.enviadoLogistica);
    }

    function listarActivos() {
        const lista = activosBase();
        let cambios = false;
        lista.forEach((e) => {
            if (!e.expCodigo) {
                e.expCodigo = RequerimientosDB.siguienteExpCodigo();
                RequerimientosDB.actualizarExpediente(e);
                cambios = true;
            }
        });
        return cambios ? activosBase() : lista;
    }

    /* ====== Modelo de documento (construcción automática) ====== */

    function columnasPorDefecto() {
        return [
            { id: "um",            titulo: "Unidad",                 ancho: 84,  align: "center" },
            { id: "cantidad",      titulo: "Cantidad",               ancho: 96,  align: "center" },
            { id: "descripcion",   titulo: "Descripción del material", ancho: 0, align: "left" },
            { id: "observaciones", titulo: "Observaciones",          ancho: 0,   align: "left" }
        ];
    }

    // Construye el modelo editable desde el Expediente Digital + Config.
    // Los campos de texto se guardan como HTML (negrita/cursiva/subrayado).
    function construirDoc(exp) {
        const cfg = ConfiguracionGeneral.obtener();
        return {
            __v: 2,
            logoUrl: cfg.logoUrl || "",
            logoPos: "left",
            logoSize: 60,
            empresa: esc(cfg.empresa),
            ruc: esc(cfg.ruc),
            direccion: esc(cfg.direccion),
            nombreDoc: esc("REQUERIMIENTO DE MATERIALES, INSUMOS Y SERVICIOS"),
            subtitulo: esc(exp.partida || ""),
            dg: {
                obra: esc(exp.obra || ""),
                partida: esc(exp.partida || ""),
                requeridoPor: esc(exp.requeridoPor || ""),
                cargoRequerido: esc(exp.cargoRequerido || ""),
                recibidoPor: esc(exp.recibidoPor || ""),
                cargoRecibido: esc(exp.cargoRecibido || ""),
                fecha: esc(exp.fecha || ""),
                fechaMaxima: esc(exp.fechaMaxima || "")
            },
            colorPrimario: cfg.colorPrimario,
            colorTexto: cfg.colorTexto,
            colorBorde: "#c9c6bd",
            bordeAncho: 1,
            fuente: cfg.fuente,
            fontSize: 13,
            interlineado: 1.5,
            alinearTitulo: "center",
            margen: 36,
            columnas: columnasPorDefecto(),
            filas: (exp.materiales || []).map((m) => ({
                um: esc(m.um || ""),
                cantidad: esc(m.cantidad || ""),
                descripcion: esc(m.descripcion || ""),
                observaciones: esc(m.observaciones || "")
            })),
            observaciones: esc(exp.observacionesGenerales || ""),
            lugarEntrega: esc(exp.lugarEntrega || ""),
            firmas: [
                { rol: esc("Usuario"),  nombre: esc(usuarioActual()) },
                { rol: esc("Gerencia"), nombre: "" },
                { rol: esc("Jefe de Logística"), nombre: "" }
            ]
        };
    }

    // Devuelve el documento del expediente (migra esquemas antiguos).
    function obtenerDoc(exp) {
        if (exp && exp.documento && exp.documento.__v === 2) {
            const d = clon(exp.documento);
            if (!Array.isArray(d.columnas) || !d.columnas.length) d.columnas = columnasPorDefecto();
            if (!Array.isArray(d.filas)) d.filas = [];
            if (!Array.isArray(d.firmas)) d.firmas = construirDoc(exp).firmas;
            if (!d.dg) d.dg = construirDoc(exp).dg;
            return d;
        }
        return construirDoc(exp);
    }

    /* ============================================================
       ADMINISTRADOR DE EXPEDIENTES ACTIVOS
       ------------------------------------------------------------
       Lista limpia agrupada por obra + panel de acciones. NO abre
       el editor al seleccionar: primero muestra Vista previa y
       acciones. Solo "Editar" abre el Editor Profesional.
       ============================================================ */

    function render(params) {
        // Si quedó un editor abierto de una sesión anterior, lo retira.
        descartarEditor();

        const lista = listarActivos();

        if (params && params.codigo) {
            const enc = lista.find((e) => e.codigo === params.codigo || e.expCodigo === params.codigo);
            if (enc) seleccionId = enc.id;
        }
        if (!seleccionId || !lista.find((e) => e.id === seleccionId)) {
            seleccionId = lista[0] ? lista[0].id : null;
        }

        if (lista.length === 0) {
            return `<div class="dx" id="dx-root">${estadoVacio()}<div class="dx-toast" id="dx-toast" hidden></div></div>`;
        }

        return `
            <div class="dx" id="dx-root">
                <div class="dx-head">
                    <div class="dx-head-info">
                        <h3 class="dx-head-title">Expedientes activos</h3>
                        <p class="dx-head-sub">Administra los documentos en curso. Al enviarlos a Logística se archivan automáticamente.</p>
                    </div>
                    <div class="dx-head-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
                        <input type="search" id="dx-search" placeholder="Buscar por obra, requerimiento o expediente…">
                    </div>
                </div>
                <div class="dx-body">
                    <aside class="dx-list zv-no-scrollbar" id="dx-list">${pintarLista(lista)}</aside>
                    <section class="dx-detail zv-no-scrollbar" id="dx-detail">${pintarDetalle()}</section>
                </div>
                <div class="dx-toast" id="dx-toast" hidden></div>
            </div>`;
    }

    function estadoVacio() {
        return `
            <div class="dx-empty">
                <div class="dx-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 13h6M9.5 16.5h6"/></svg>
                </div>
                <h3 class="dx-empty-title">No hay expedientes activos</h3>
                <p class="dx-empty-text">
                    Genera un Expediente Digital desde <strong>Nuevo Requerimiento</strong> y aparecerá aquí
                    como documento activo, listo para editar y enviar a Logística.
                </p>
                <div class="dx-empty-actions">
                    <button class="nr-btn nr-btn-primary" type="button" data-accion="quick" data-destino="nuevo-requerimiento">Crear requerimiento</button>
                    <button class="nr-btn nr-btn-soft" type="button" data-dx-act="sembrar">Cargar ejemplos</button>
                </div>
            </div>`;
    }

    function valorBusqueda() {
        const el = document.querySelector("#dx-search");
        return el ? el.value.trim().toLowerCase() : "";
    }

    function pintarLista(lista) {
        const q = valorBusqueda();
        const filtrada = !q ? lista : lista.filter((e) =>
            `${e.expCodigo} ${e.codigo} ${e.obra}`.toLowerCase().includes(q));

        if (!filtrada.length) {
            return `<p class="dx-list-empty">Sin expedientes que coincidan con la búsqueda.</p>`;
        }

        // Agrupado por obra: cada expediente pertenece a una sola obra.
        const grupos = {};
        filtrada.forEach((e) => { (grupos[e.obra] = grupos[e.obra] || []).push(e); });

        return Object.keys(grupos).map((obra) => `
            <div class="dx-group">
                <div class="dx-group-head">
                    <span class="dx-group-name">${esc(obra)}</span>
                    <span class="dx-group-meta">${esc(ConfiguracionGeneral.codigoObra(obra))} · ${grupos[obra].length}</span>
                </div>
                ${grupos[obra].map((e) => {
                    const est = ESTADOS[estadoDoc(e)] || ESTADOS["listo"];
                    return `
                        <button type="button" class="dx-item ${e.id === seleccionId ? "is-active" : ""}" data-dx-sel="${e.id}">
                            <span class="dx-item-dot is-${est.clase}" title="${est.label}"></span>
                            <span class="dx-item-info">
                                <span class="dx-item-exp">${esc(e.expCodigo)}</span>
                                <span class="dx-item-req">${esc(e.codigo)}</span>
                            </span>
                            <span class="dx-item-state is-${est.clase}">${est.label}</span>
                        </button>`;
                }).join("")}
            </div>`).join("");
    }

    // Panel de acciones (NO abre el editor): vista previa + acciones.
    function pintarDetalle() {
        const exp = seleccionId ? RequerimientosDB.buscarExpediente(seleccionId) : null;
        if (!exp) {
            return `<div class="dx-detail-empty">Selecciona un expediente para ver sus acciones.</div>`;
        }
        const est = ESTADOS[estadoDoc(exp)] || ESTADOS["listo"];
        const doc = obtenerDoc(exp);

        return `
            <div class="dx-detail-head">
                <div>
                    <span class="dx-detail-state is-${est.clase}">${est.label}</span>
                    <h3 class="dx-detail-title">${esc(exp.expCodigo)}</h3>
                    <p class="dx-detail-codigo">${esc(exp.codigo)} · ${esc(exp.obra)}</p>
                </div>
            </div>

            <div class="dx-detail-meta">
                <div><span>Partida</span><strong>${esc(exp.partida) || "—"}</strong></div>
                <div><span>Fecha</span><strong>${esc(exp.fecha) || "—"}</strong></div>
                <div><span>Ingreso máx. a obra</span><strong>${esc(exp.fechaMaxima) || "—"}</strong></div>
                <div><span>Materiales</span><strong>${(doc.filas || []).length}</strong></div>
                <div><span>Creación</span><strong>${fechaHora(exp.creadoEn)}</strong></div>
                <div><span>Última edición</span><strong>${fechaHora(exp.actualizadoEn)}</strong></div>
            </div>

            <div class="dx-preview-wrap">
                <span class="dx-preview-label">Vista previa</span>
                <div class="dx-preview-frame">
                    <div class="dx-preview-scale">${pintarHoja(doc, exp, false)}</div>
                </div>
            </div>

            <div class="dx-actions">
                <button type="button" class="dx-act-btn" data-dx-act="preview">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Vista previa</span>
                </button>
                <button type="button" class="dx-act-btn is-primary" data-dx-act="editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                    <span>Editar documento</span>
                </button>
                <div class="dx-menu-wrap">
                    <button type="button" class="dx-act-btn" data-dx-act="descargar-menu">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10M8 11l4 4 4-4M5 20h14"/></svg>
                        <span>Descargar</span>
                    </button>
                    <div class="dx-menu ${menuDescargaDet ? "is-open" : ""}" id="dx-menu-det">
                        <button type="button" data-dx-dl="pdf">PDF (.pdf)</button>
                        <button type="button" data-dx-dl="word">Word (.doc)</button>
                        <button type="button" data-dx-dl="excel">Excel (.xls)</button>
                    </div>
                </div>
                <button type="button" class="dx-act-btn" data-dx-act="imprimir">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V3h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6H7z"/></svg>
                    <span>Imprimir</span>
                </button>
                <button type="button" class="dx-act-btn is-send" data-dx-act="enviar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 20 4l-6 16-3-7-7-1z"/></svg>
                    <span>Enviar a Logística</span>
                </button>
            </div>`;
    }

    function repintarLista() {
        const cont = document.querySelector("#dx-list");
        if (cont) cont.innerHTML = pintarLista(listarActivos());
    }

    function repintarDetalle() {
        const cont = document.querySelector("#dx-detail");
        if (cont) cont.innerHTML = pintarDetalle();
    }

    function seleccionarAdmin(id) {
        seleccionId = id;
        menuDescargaDet = false;
        repintarLista();
        repintarDetalle();
    }

    /* ============================================================
       LA HOJA (documento corporativo construido automáticamente)
       ------------------------------------------------------------
       Misma función para editor (editable), vista previa, panel de
       acciones e impresión. Campos enriquecidos = HTML; tabla con
       columnas dinámicas; la fecha máxima vive en Datos Generales.
       ============================================================ */

    function dgItem(label, key, doc, ce, wide) {
        return `
            <div class="dx-dg-item ${wide ? "dx-dg-wide" : ""}">
                <span>${esc(label)}</span>
                <strong ${ce} data-dg="${key}">${doc.dg[key] || ""}</strong>
            </div>`;
    }

    function pintarTabla(doc, editable) {
        const ce = editable ? 'contenteditable="true"' : "";
        const cols = doc.columnas;

        const colItem = `<col style="width:48px">`;
        const colData = cols.map((c) => `<col style="${c.ancho ? `width:${c.ancho}px` : ""}">`).join("");
        const colAcc  = editable ? `<col style="width:40px">` : "";

        const thCols = cols.map((c, ci) => `
            <th class="dx-th" style="text-align:${c.align}">
                <span class="dx-th-label" ${ce} data-coltitle="${ci}">${esc(c.titulo)}</span>
                ${editable ? `
                    <span class="dx-col-tools">
                        <button type="button" class="dx-col-btn" data-col-move="${ci}" data-dir="-1" title="Mover a la izquierda">‹</button>
                        <button type="button" class="dx-col-btn" data-col-move="${ci}" data-dir="1" title="Mover a la derecha">›</button>
                        <button type="button" class="dx-col-btn is-del" data-col-del="${ci}" title="Eliminar columna">✕</button>
                    </span>
                    <span class="dx-col-resize" data-col-resize="${ci}"></span>` : ""}
            </th>`).join("");

        const filaCols = (f, ri) => cols.map((c) =>
            `<td class="dx-td" style="text-align:${c.align}" ${ce} data-cell data-row="${ri}" data-col="${c.id}">${f[c.id] || ""}</td>`
        ).join("");

        const cuerpo = doc.filas.length
            ? doc.filas.map((f, ri) => `
                <tr>
                    <td class="dx-td dx-td-item">${ri + 1}</td>
                    ${filaCols(f, ri)}
                    ${editable ? `<td class="dx-td dx-td-acc"><button type="button" class="dx-row-del" data-row-del="${ri}" title="Eliminar fila">✕</button></td>` : ""}
                </tr>`).join("")
            : `<tr><td class="dx-td dx-td-item">—</td>${cols.map(() => '<td class="dx-td"></td>').join("")}${editable ? '<td class="dx-td-acc"></td>' : ""}</tr>`;

        return `
            <div class="dx-table-wrap zv-no-scrollbar">
                <table class="dx-table">
                    <colgroup>${colItem}${colData}${colAcc}</colgroup>
                    <thead>
                        <tr>
                            <th class="dx-th dx-th-item">Ítem</th>
                            ${thCols}
                            ${editable ? '<th class="dx-th dx-th-acc"><button type="button" class="dx-col-add" data-col-add title="Agregar columna">+</button></th>' : ""}
                        </tr>
                    </thead>
                    <tbody>${cuerpo}</tbody>
                </table>
            </div>
            ${editable ? '<button type="button" class="dx-add-row" data-row-add>+ Agregar fila</button>' : ""}`;
    }

    function pintarHoja(doc, exp, editable) {
        const ce = editable ? 'contenteditable="true"' : "";
        const estilo = [
            `--dx-primary:${doc.colorPrimario}`,
            `--dx-text:${doc.colorTexto}`,
            `--dx-border:${doc.colorBorde}`,
            `--dx-bw:${doc.bordeAncho}px`,
            `font-family:'${doc.fuente}',Arial,sans-serif`,
            `font-size:${doc.fontSize}px`,
            `line-height:${doc.interlineado}`,
            `padding:${doc.margen}px`
        ].join(";");

        const logo = doc.logoUrl
            ? `<img src="${esc(doc.logoUrl)}" alt="Logo" class="dx-sheet-logo-img" style="height:${doc.logoSize}px">`
            : `<span class="dx-sheet-logo-mono" style="width:${doc.logoSize}px;height:${doc.logoSize}px">Z</span>`;

        return `
            <div class="dx-sheet ${editable ? "is-editable" : "is-readonly"}" ${editable ? 'id="dx-sheet"' : ""} style="${estilo}">

                <header class="dx-sheet-head dx-logo-${doc.logoPos}">
                    <div class="dx-sheet-logo">${logo}</div>
                    <div class="dx-sheet-empresa">
                        <strong ${ce} data-edit="empresa">${doc.empresa}</strong>
                        <span>RUC: <span ${ce} data-edit="ruc">${doc.ruc}</span></span>
                        <span ${ce} data-edit="direccion">${doc.direccion}</span>
                    </div>
                    <div class="dx-sheet-codes">
                        <span>N.º Requerimiento</span><strong>${esc(exp.codigo)}</strong>
                        <span>Código / Expediente</span><strong>${esc(exp.expCodigo)}</strong>
                    </div>
                </header>

                <div class="dx-sheet-title" style="text-align:${doc.alinearTitulo}">
                    <h1 ${ce} data-edit="nombreDoc">${doc.nombreDoc}</h1>
                    <p ${ce} data-edit="subtitulo">${doc.subtitulo}</p>
                </div>

                <div class="dx-sheet-dg">
                    ${dgItem("Obra", "obra", doc, ce, true)}
                    ${dgItem("Partida", "partida", doc, ce)}
                    ${dgItem("Requerido por", "requeridoPor", doc, ce)}
                    ${dgItem("Cargo", "cargoRequerido", doc, ce)}
                    ${dgItem("Recibido por", "recibidoPor", doc, ce)}
                    ${dgItem("Cargo", "cargoRecibido", doc, ce)}
                    ${dgItem("Fecha", "fecha", doc, ce)}
                    ${dgItem("Fecha máxima de ingreso a obra", "fechaMaxima", doc, ce, true)}
                </div>

                ${pintarTabla(doc, editable)}

                <div class="dx-sheet-obs">
                    <span class="dx-sheet-obs-label">Observaciones</span>
                    <div class="dx-sheet-obs-text" ${ce} data-edit="observaciones">${doc.observaciones}</div>
                </div>

                <div class="dx-sheet-foot">
                    <div class="dx-sheet-lugar">
                        <span>Lugar de entrega</span>
                        <strong ${ce} data-edit="lugarEntrega">${doc.lugarEntrega}</strong>
                    </div>
                    <div class="dx-sheet-firmas">
                        ${doc.firmas.map((s, i) => `
                            <div class="dx-firma">
                                <div class="dx-firma-line"></div>
                                <strong ${ce} data-firma="${i}">${s.nombre}</strong>
                                <span ${ce} data-firma-rol="${i}">${s.rol}</span>
                            </div>`).join("")}
                    </div>
                </div>
            </div>`;
    }

    /* ============================================================
       EDITOR PROFESIONAL (overlay a pantalla completa)
       ============================================================ */

    const REC_KEY = "zovrake_dx_rec_";
    const MSG_KEY = "zovrake_dx_envio_msg_";
    let beforeUnloadAttached = false;
    let toastTimer = null;

    const ICN = {
        volver:    '<path d="M15 6l-6 6 6 6"/>',
        undo:      '<path d="M9 7 4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-1"/>',
        redo:      '<path d="m15 7 5 5-5 5"/><path d="M20 12H9a5 5 0 0 0 0 10h1"/>',
        guardar:   '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7"/><path d="M8 14h8v6H8z"/>',
        descargar: '<path d="M12 4v10M8 11l4 4 4-4M5 20h14"/>',
        imprimir:  '<path d="M7 8V3h10v5"/><path d="M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v6H7z"/>',
        enviar:    '<path d="M4 12 20 4l-6 16-3-7-7-1z"/>'
    };

    function edBtn(act, label, icon, opts) {
        opts = opts || {};
        const cls = ["dx-tb-btn"];
        if (opts.primary) cls.push("is-primary");
        if (opts.send) cls.push("is-send");
        if (opts.ghost) cls.push("is-ghost");
        return `
            <button type="button" class="${cls.join(" ")}" data-ed="${act}" title="${esc(label)}" ${opts.disabled ? "disabled" : ""}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
                <span class="dx-tb-label">${esc(label)}</span>
            </button>`;
    }

    function pintarTopBar(exp, est) {
        return `
            <header class="dx-editor-top">
                <div class="dx-tb-group">
                    ${edBtn("volver", "Volver", ICN.volver, { ghost: true })}
                </div>
                <div class="dx-tb-group">
                    ${edBtn("undo", "Deshacer", ICN.undo)}
                    ${edBtn("redo", "Rehacer", ICN.redo)}
                </div>
                <div class="dx-tb-group">
                    ${edBtn("guardar", "Guardar", ICN.guardar)}
                </div>
                <div class="dx-tb-status">
                    <span class="dx-tb-state is-${est.clase}">${est.label}</span>
                    <span class="dx-tb-autosave is-saved" id="dx-autosave">Guardado</span>
                </div>
                <div class="dx-tb-group dx-tb-right">
                    <div class="dx-menu-wrap">
                        ${edBtn("descargar", "Descargar", ICN.descargar)}
                        <div class="dx-menu ${menuDescarga ? "is-open" : ""}" id="dx-menu-ed">
                            <button type="button" data-ed-dl="pdf">PDF (.pdf)</button>
                            <button type="button" data-ed-dl="word">Word (.doc)</button>
                            <button type="button" data-ed-dl="excel">Excel (.xls)</button>
                        </div>
                    </div>
                    ${edBtn("imprimir", "Imprimir", ICN.imprimir)}
                    ${edBtn("enviar", "Enviar a Logística", ICN.enviar, { send: true })}
                </div>
            </header>`;
    }

    function pintarFormatBar(doc) {
        const fuentes = ["Arial", "Georgia", "Times New Roman", "Calibri", "Verdana", "Tahoma", "Trebuchet MS"];
        const tamanos = [10, 11, 12, 13, 14, 16, 18, 20, 24];
        const opF = (v) => `<option value="${v}" ${v === doc.fuente ? "selected" : ""}>${v}</option>`;
        const opS = (v) => `<option value="${v}" ${v === doc.fontSize ? "selected" : ""}>${v}px</option>`;
        const seg = (key, val, glyph, title) =>
            `<button type="button" class="dx-fmt-seg-btn ${doc[key] === val ? "is-on" : ""}" data-fmt-seg="${key}" data-val="${val}" title="${title}">${glyph}</button>`;

        return `
            <div class="dx-format zv-no-scrollbar" id="dx-format">
                <div class="dx-fmt-group">
                    <select class="dx-fmt-input" data-fmt-sel="fuente" title="Tipografía">${fuentes.map(opF).join("")}</select>
                    <select class="dx-fmt-input dx-fmt-size" data-fmt-sel="fontSize" title="Tamaño de texto">${tamanos.map(opS).join("")}</select>
                </div>
                <div class="dx-fmt-group">
                    <button type="button" class="dx-fmt-btn" data-cmd="bold" title="Negrita"><b>B</b></button>
                    <button type="button" class="dx-fmt-btn" data-cmd="italic" title="Cursiva"><i>I</i></button>
                    <button type="button" class="dx-fmt-btn" data-cmd="underline" title="Subrayado"><u>U</u></button>
                </div>
                <div class="dx-fmt-group">
                    <label class="dx-fmt-color" title="Color principal"><span>Color</span><input type="color" data-fmt-live="colorPrimario" value="${doc.colorPrimario}"></label>
                    <label class="dx-fmt-color" title="Color de texto"><span>Texto</span><input type="color" data-fmt-live="colorTexto" value="${doc.colorTexto}"></label>
                </div>
                <div class="dx-fmt-group">
                    ${seg("alinearTitulo", "left", "⯇", "Alinear izquierda")}
                    ${seg("alinearTitulo", "center", "≡", "Centrar")}
                    ${seg("alinearTitulo", "right", "⯈", "Alinear derecha")}
                </div>
                <div class="dx-fmt-group">
                    <label class="dx-fmt-range" title="Espaciado"><span>Espaciado</span><input type="range" min="1" max="2.4" step="0.1" data-fmt-live="interlineado" value="${doc.interlineado}"></label>
                    <label class="dx-fmt-range" title="Márgenes"><span>Márgenes</span><input type="range" min="16" max="64" step="2" data-fmt-live="margen" value="${doc.margen}"></label>
                </div>
                <div class="dx-fmt-group">
                    <label class="dx-fmt-range" title="Grosor de borde"><span>Borde</span><input type="range" min="0" max="3" step="0.5" data-fmt-live="bordeAncho" value="${doc.bordeAncho}"></label>
                    <label class="dx-fmt-color" title="Color de borde"><span>Borde</span><input type="color" data-fmt-live="colorBorde" value="${doc.colorBorde}"></label>
                </div>
                <div class="dx-fmt-group">
                    ${seg("logoPos", "left", "⯇", "Logo a la izquierda")}
                    ${seg("logoPos", "center", "≡", "Logo centrado")}
                    ${seg("logoPos", "right", "⯈", "Logo a la derecha")}
                    <label class="dx-fmt-range" title="Tamaño del logo"><span>Logo</span><input type="range" min="40" max="120" step="4" data-fmt-live="logoSize" value="${doc.logoSize}"></label>
                    <button type="button" class="dx-fmt-btn" data-ed="logo" title="Cambiar logo">⮉</button>
                </div>
                <div class="dx-fmt-group">
                    <button type="button" class="dx-fmt-btn dx-fmt-wide" data-row-add title="Agregar fila">+ Fila</button>
                    <button type="button" class="dx-fmt-btn dx-fmt-wide" data-col-add title="Agregar columna">+ Columna</button>
                </div>
            </div>`;
    }

    function pintarFormatBarRefresh() {
        const fb = document.getElementById("dx-format");
        if (fb) fb.outerHTML = pintarFormatBar(docActual);
    }

    /* ---------- Validación + Panel de Calidad (automático) ---------- */

    function validarDoc(doc, exp) {
        const errores = [];
        const pendientes = [];
        const orto = [];

        if (!txt(doc.nombreDoc)) errores.push({ m: "Falta el nombre del documento.", t: '[data-edit="nombreDoc"]' });
        if (!txt(doc.dg.obra)) errores.push({ m: "Falta la obra en los datos generales.", t: '[data-dg="obra"]' });
        if (!txt(doc.lugarEntrega)) pendientes.push({ m: "Indica el lugar de entrega.", t: '[data-edit="lugarEntrega"]' });
        if (!txt(doc.dg.requeridoPor)) pendientes.push({ m: "Falta «Requerido por».", t: '[data-dg="requeridoPor"]' });

        const f1 = new Date(txt(doc.dg.fecha));
        const f2 = new Date(txt(doc.dg.fechaMaxima));
        if (!txt(doc.dg.fecha) || isNaN(f1.getTime())) errores.push({ m: "La fecha del documento no es válida.", t: '[data-dg="fecha"]' });
        if (!txt(doc.dg.fechaMaxima) || isNaN(f2.getTime())) errores.push({ m: "La fecha máxima de ingreso no es válida.", t: '[data-dg="fechaMaxima"]' });
        if (!isNaN(f1.getTime()) && !isNaN(f2.getTime()) && f2 < f1) {
            errores.push({ m: "La fecha máxima no puede ser anterior a la fecha del documento.", t: '[data-dg="fechaMaxima"]' });
        }

        if (!doc.filas.length) {
            errores.push({ m: "La tabla no tiene materiales.", t: ".dx-table" });
        } else {
            doc.filas.forEach((f, i) => {
                if (!txt(f.descripcion)) errores.push({ m: `Ítem ${i + 1}: falta la descripción del material.`, t: `[data-cell][data-row="${i}"][data-col="descripcion"]` });
                const cant = parseFloat(txt(f.cantidad).replace(",", "."));
                if (!(cant > 0)) errores.push({ m: `Ítem ${i + 1}: la cantidad debe ser mayor a 0.`, t: `[data-cell][data-row="${i}"][data-col="cantidad"]` });
                if (!txt(f.um)) pendientes.push({ m: `Ítem ${i + 1}: falta la unidad de medida.`, t: `[data-cell][data-row="${i}"][data-col="um"]` });
            });
        }

        const campos = [{ h: doc.observaciones, t: '[data-edit="observaciones"]', n: "Observaciones" }];
        doc.filas.forEach((f, i) => {
            campos.push({ h: f.descripcion, t: `[data-cell][data-row="${i}"][data-col="descripcion"]`, n: `Ítem ${i + 1} · Descripción` });
            campos.push({ h: f.observaciones, t: `[data-cell][data-row="${i}"][data-col="observaciones"]`, n: `Ítem ${i + 1} · Observaciones` });
        });
        const vistos = new Set();
        campos.forEach((c) => {
            Ortografia.revisar(txt(c.h)).forEach((h) => {
                const k = c.t + "|" + h.palabra.toLowerCase();
                if (!vistos.has(k)) {
                    vistos.add(k);
                    orto.push({ m: `${c.n}: «${h.palabra}» → «${h.sugerencia}».`, t: c.t });
                }
            });
        });

        const totalChecks = 6 + doc.filas.length * 2;
        const fallos = errores.length + pendientes.length;
        let nivel = Math.round(100 - (fallos * 100 / Math.max(totalChecks, 1)) - orto.length * 3);
        nivel = Math.max(0, Math.min(100, nivel));
        if (!errores.length && !pendientes.length && !orto.length) nivel = 100;

        return { errores, pendientes, orto, nivel, ok: errores.length === 0 };
    }

    function contenidoCalidad(r) {
        const total = r.errores.length + r.pendientes.length + r.orto.length;
        const estadoTxt = r.errores.length ? "Documento con errores"
            : (r.pendientes.length ? "Casi listo · revisa pendientes"
            : (r.orto.length ? "Listo · revisa ortografía" : "Documento listo para enviar"));
        const estadoCls = r.errores.length ? "is-bad" : (r.pendientes.length || r.orto.length ? "is-warn" : "is-ok");

        const grupo = (titulo, items, cls) => items.length ? `
            <div class="dx-q-block">
                <p class="dx-q-block-title ${cls}">${titulo} (${items.length})</p>
                <ul class="dx-q-list">${items.map((i) =>
                    `<li class="${cls}"><button type="button" data-goto="${i.t.replace(/"/g, "&quot;")}">${esc(i.m)}</button></li>`).join("")}</ul>
            </div>` : "";

        return `
            <div class="dx-q-head">
                <div class="dx-q-title-row">
                    <h4>Panel de Calidad</h4>
                    <button type="button" class="dx-q-toggle" data-quality-toggle title="Mostrar / ocultar">⌄</button>
                </div>
                <div class="dx-q-gauge">
                    <div class="dx-q-ring ${estadoCls}" style="--p:${r.nivel}"><span>${r.nivel}%</span></div>
                    <div class="dx-q-gauge-info">
                        <span class="dx-q-state ${estadoCls}">${estadoTxt}</span>
                        <span class="dx-q-sub">${r.errores.length} errores · ${r.pendientes.length} pendientes · ${r.orto.length} ortografía</span>
                    </div>
                </div>
            </div>
            <div class="dx-q-body zv-no-scrollbar">
                ${total === 0 ? `<p class="dx-q-clean">El documento superó todas las validaciones. Listo para enviar a Logística.</p>` : ""}
                ${grupo("Errores que impiden el envío", r.errores, "is-bad")}
                ${grupo("Campos pendientes", r.pendientes, "is-warn")}
                ${grupo("Ortografía sugerida", r.orto, "is-warn")}
            </div>`;
    }

    function pintarCalidad() {
        return `<aside class="dx-quality ${calidadColapsada ? "is-collapsed" : ""}" id="dx-quality">${contenidoCalidad(validarDoc(docActual, expActual))}</aside>`;
    }

    function refrescarCalidad() {
        const q = document.getElementById("dx-quality");
        if (!q) return;
        sincronizarModelo();
        q.innerHTML = contenidoCalidad(validarDoc(docActual, expActual));
    }

    function programarCalidad() {
        clearTimeout(calidadTimer);
        calidadTimer = setTimeout(refrescarCalidad, 500);
    }

    function irAlCampo(sel) {
        const s = sheetEl();
        if (!s) return;
        let el = null;
        try { el = s.querySelector(sel); } catch (e) { el = null; }
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("dx-highlight");
        setTimeout(() => el.classList.remove("dx-highlight"), 1600);
        if (el.isContentEditable) el.focus();
    }

    function resaltarPrimerError(r) {
        const q = document.getElementById("dx-quality");
        if (q) { calidadColapsada = false; q.classList.remove("is-collapsed"); }
        const first = r.errores[0] || r.pendientes[0];
        if (first) irAlCampo(first.t);
    }

    /* ---------- Sincronización modelo <-> hoja ---------- */

    function sincronizarModelo() {
        const s = sheetEl();
        if (!s) return;
        s.querySelectorAll("[data-edit]").forEach((el) => { docActual[el.dataset.edit] = el.innerHTML; });
        s.querySelectorAll("[data-dg]").forEach((el) => { docActual.dg[el.dataset.dg] = el.innerHTML; });
        s.querySelectorAll("[data-firma]").forEach((el) => {
            const i = parseInt(el.dataset.firma, 10);
            if (docActual.firmas[i]) docActual.firmas[i].nombre = el.innerHTML;
        });
        s.querySelectorAll("[data-firma-rol]").forEach((el) => {
            const i = parseInt(el.dataset.firmaRol, 10);
            if (docActual.firmas[i]) docActual.firmas[i].rol = el.innerHTML;
        });
        s.querySelectorAll("[data-coltitle]").forEach((el) => {
            const i = parseInt(el.dataset.coltitle, 10);
            if (docActual.columnas[i]) docActual.columnas[i].titulo = el.innerText;
        });
        s.querySelectorAll("[data-cell]").forEach((el) => {
            const r = parseInt(el.dataset.row, 10);
            if (docActual.filas[r]) docActual.filas[r][el.dataset.col] = el.innerHTML;
        });
    }

    function renderSheet() {
        sincronizarModelo();
        const sc = document.getElementById("dx-editor-scroll");
        if (sc) sc.innerHTML = pintarHoja(docActual, expActual, true);
    }

    function aplicarEstiloHoja() {
        const s = sheetEl();
        if (!s) return;
        s.style.setProperty("--dx-primary", docActual.colorPrimario);
        s.style.setProperty("--dx-text", docActual.colorTexto);
        s.style.setProperty("--dx-border", docActual.colorBorde);
        s.style.setProperty("--dx-bw", docActual.bordeAncho + "px");
        s.style.fontFamily = `'${docActual.fuente}',Arial,sans-serif`;
        s.style.fontSize = docActual.fontSize + "px";
        s.style.lineHeight = docActual.interlineado;
        s.style.padding = docActual.margen + "px";
    }

    /* ---------- Undo / Redo ---------- */

    function actualizarUndoUI() {
        const ov = rootEditor();
        if (!ov) return;
        const u = ov.querySelector('[data-ed="undo"]');
        const r = ov.querySelector('[data-ed="redo"]');
        if (u) u.disabled = undoStack.length === 0;
        if (r) r.disabled = redoStack.length === 0;
    }

    function capturar() {
        sincronizarModelo();
        undoStack.push(clon(docActual));
        if (undoStack.length > 80) undoStack.shift();
        redoStack = [];
        actualizarUndoUI();
    }

    function deshacer() {
        if (!undoStack.length) return;
        sincronizarModelo();
        redoStack.push(clon(docActual));
        docActual = undoStack.pop();
        renderSheet();
        actualizarUndoUI();
        refrescarCalidad();
        programarAutosave();
    }

    function rehacer() {
        if (!redoStack.length) return;
        sincronizarModelo();
        undoStack.push(clon(docActual));
        docActual = redoStack.pop();
        renderSheet();
        actualizarUndoUI();
        refrescarCalidad();
        programarAutosave();
    }

    /* ---------- AutoSave + recuperación ---------- */

    function setAutosaveUI(texto, cls) {
        const el = document.getElementById("dx-autosave");
        if (el) { el.textContent = texto; el.className = "dx-tb-autosave " + (cls || ""); }
    }

    function programarAutosave() {
        estadoGuardado = "pendiente";
        setAutosaveUI("Editando…", "is-pending");
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(() => autosave(false), 1400);
    }

    function autosave() {
        if (!abiertoId) return;
        sincronizarModelo();
        const exp = RequerimientosDB.buscarExpediente(abiertoId);
        if (!exp) return;
        exp.documento = clon(docActual);
        exp.documentoTs = Date.now();
        if (estadoDoc(exp) !== "enviado-logistica" && !exp.enviadoLogistica) exp.docEstado = "en-edicion";
        RequerimientosDB.actualizarExpediente(exp);
        try { localStorage.setItem(REC_KEY + exp.id, JSON.stringify({ ts: Date.now(), doc: docActual })); } catch (e) { /* almacenamiento lleno */ }
        estadoGuardado = "guardado";
        setAutosaveUI("Guardado automático ✓", "is-saved");
    }

    function flushAutosave() {
        if (!abiertoId) return;
        if (estadoGuardado !== "guardado") {
            autosave();
        } else {
            try { localStorage.setItem(REC_KEY + abiertoId, JSON.stringify({ ts: Date.now(), doc: docActual })); } catch (e) { /* noop */ }
        }
    }

    function onVisibility() {
        if (document.hidden) flushAutosave();
    }

    // Carga el documento del expediente y, si existe un respaldo de
    // recuperación más reciente (cierre accidental), lo restaura.
    function recuperarOCargar(exp) {
        const base = obtenerDoc(exp);
        try {
            const raw = localStorage.getItem(REC_KEY + exp.id);
            if (raw) {
                const rec = JSON.parse(raw);
                if (rec && rec.doc && rec.doc.__v === 2 && rec.ts && rec.ts > (exp.documentoTs || 0)) {
                    rec.doc.__recuperado = true;
                    return rec.doc;
                }
            }
        } catch (e) { /* sin respaldo */ }
        return base;
    }

    /* ---------- Guardar manual (nueva versión) ---------- */

    function guardarManual() {
        sincronizarModelo();
        const exp = RequerimientosDB.buscarExpediente(abiertoId);
        if (!exp) return;
        exp.documento = clon(docActual);
        exp.documentoTs = Date.now();
        if (!Array.isArray(exp.versiones)) exp.versiones = [];
        exp.versiones.push({ version: exp.versiones.length + 1, doc: clon(docActual), guardadoEn: Date.now() });
        exp.version = exp.versiones.length;
        if (estadoDoc(exp) !== "enviado-logistica") exp.docEstado = "en-edicion";
        RequerimientosDB.registrarHistorial(exp, "Guardó una nueva versión del documento", exp.versiones.length);
        RequerimientosDB.actualizarExpediente(exp);
        try { localStorage.setItem(REC_KEY + exp.id, JSON.stringify({ ts: Date.now(), doc: docActual })); } catch (e) { /* noop */ }
        estadoGuardado = "guardado";
        setAutosaveUI("Versión guardada ✓", "is-saved");
        toast(`Versión ${exp.versiones.length} guardada.`);
    }

    /* ---------- Tabla dinámica ---------- */

    function filaVacia() {
        const f = {};
        docActual.columnas.forEach((c) => { f[c.id] = ""; });
        return f;
    }

    function agregarColumna() {
        const id = "col_" + Math.random().toString(36).slice(2, 7);
        docActual.columnas.push({ id, titulo: "Columna", ancho: 120, align: "left" });
        docActual.filas.forEach((f) => { f[id] = ""; });
        renderSheet();
        refrescarCalidad();
        programarAutosave();
    }

    function eliminarColumna(i) {
        if (docActual.columnas.length <= 1) { toast("Debe quedar al menos una columna.", "error"); return; }
        const id = docActual.columnas[i].id;
        docActual.columnas.splice(i, 1);
        docActual.filas.forEach((f) => { delete f[id]; });
        renderSheet();
        refrescarCalidad();
        programarAutosave();
    }

    function moverColumna(i, dir) {
        const j = i + dir;
        if (j < 0 || j >= docActual.columnas.length) return;
        const a = docActual.columnas;
        const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        renderSheet();
        programarAutosave();
    }

    function iniciarResize(handle, point) {
        sincronizarModelo();
        const ci = parseInt(handle.dataset.colResize, 10);
        const table = sheetEl() && sheetEl().querySelector(".dx-table");
        if (!table) return;
        const col = table.querySelectorAll("colgroup col")[ci + 1];
        const startW = col ? col.getBoundingClientRect().width : (docActual.columnas[ci].ancho || 100);
        resize = { ci, startX: point.clientX, startW, col };
        undoStack.push(clon(docActual));
        if (undoStack.length > 80) undoStack.shift();
        redoStack = [];
        actualizarUndoUI();
        document.addEventListener("mousemove", moverResize);
        document.addEventListener("mouseup", finResize);
        document.addEventListener("touchmove", moverResizeTouch, { passive: false });
        document.addEventListener("touchend", finResize);
    }

    function moverResize(e) {
        if (!resize) return;
        const w = Math.max(40, resize.startW + (e.clientX - resize.startX));
        if (resize.col) resize.col.style.width = w + "px";
        docActual.columnas[resize.ci].ancho = Math.round(w);
    }

    function moverResizeTouch(e) {
        if (!resize || !e.touches[0]) return;
        e.preventDefault();
        moverResize(e.touches[0]);
    }

    function finResize() {
        if (!resize) return;
        resize = null;
        document.removeEventListener("mousemove", moverResize);
        document.removeEventListener("mouseup", finResize);
        document.removeEventListener("touchmove", moverResizeTouch);
        document.removeEventListener("touchend", finResize);
        programarAutosave();
    }

    /* ---------- Formato en línea (negrita/cursiva/subrayado) ---------- */

    function ejecutarCmd(cmd) {
        sincronizarModelo();
        const before = clon(docActual);
        try { document.execCommand(cmd, false, null); } catch (e) { /* navegador sin soporte */ }
        undoStack.push(before);
        if (undoStack.length > 80) undoStack.shift();
        redoStack = [];
        actualizarUndoUI();
        sincronizarModelo();
        programarAutosave();
    }

    function aplicarFmtLive(el) {
        const k = el.dataset.fmtLive;
        const v = (el.type === "range") ? parseFloat(el.value) : el.value;
        docActual[k] = v;
        if (k === "logoSize") {
            const s = sheetEl();
            const img = s && s.querySelector(".dx-sheet-logo-img, .dx-sheet-logo-mono");
            if (img) {
                if (img.classList.contains("dx-sheet-logo-mono")) { img.style.width = v + "px"; img.style.height = v + "px"; }
                else { img.style.height = v + "px"; }
            }
        } else {
            aplicarEstiloHoja();
        }
        programarAutosave();
    }

    /* ---------- Descargar / Imprimir / Vista previa ---------- */

    function expCompatible(doc, exp) {
        return {
            codigo: exp.codigo,
            obra: txt(doc.dg.obra) || exp.obra,
            partida: txt(doc.dg.partida) || exp.partida,
            requeridoPor: txt(doc.dg.requeridoPor),
            cargoRequerido: txt(doc.dg.cargoRequerido),
            recibidoPor: txt(doc.dg.recibidoPor),
            cargoRecibido: txt(doc.dg.cargoRecibido),
            lugarEntrega: txt(doc.lugarEntrega) || exp.lugarEntrega,
            fecha: txt(doc.dg.fecha) || exp.fecha,
            fechaMaxima: txt(doc.dg.fechaMaxima) || exp.fechaMaxima,
            observacionesGenerales: txt(doc.observaciones),
            materiales: (doc.filas || []).map((f) => ({
                descripcion: txt(f.descripcion),
                um: txt(f.um),
                cantidad: txt(f.cantidad),
                observaciones: txt(f.observaciones)
            }))
        };
    }

    function descargarDoc(doc, exp, tipo) {
        const c = expCompatible(doc, exp);
        if (tipo === "pdf") DocumentGenerator.descargarPDF(c);
        else if (tipo === "word") DocumentGenerator.descargarWord(c);
        else DocumentGenerator.descargarExcel(c);
        toast(`Generando ${tipo.toUpperCase()}…`);
    }

    function imprimirDoc(doc, exp) {
        const html = pintarHoja(doc, exp, false);
        const w = window.open("", "_blank");
        if (!w) { toast("Habilita las ventanas emergentes para imprimir.", "error"); return; }
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(exp.expCodigo)}</title>
            <style>
                *{box-sizing:border-box}
                body{margin:0;padding:18px;background:#fff;color:${doc.colorTexto};font-family:'${doc.fuente}',Arial,sans-serif}
                .dx-sheet{--dx-primary:${doc.colorPrimario};--dx-text:${doc.colorTexto};--dx-border:${doc.colorBorde};--dx-bw:${doc.bordeAncho}px;max-width:900px;margin:0 auto;font-size:${doc.fontSize}px;line-height:${doc.interlineado}}
                .dx-sheet-head{display:flex;gap:16px;align-items:center;border-bottom:3px solid var(--dx-primary);padding-bottom:12px}
                .dx-logo-center{justify-content:center}.dx-logo-right .dx-sheet-logo{order:3}
                .dx-sheet-logo-mono{display:inline-flex;align-items:center;justify-content:center;background:var(--dx-primary);color:#fff;font-weight:700;border-radius:8px}
                .dx-sheet-empresa{flex:1}.dx-sheet-empresa strong{display:block;color:var(--dx-primary);font-size:1.3em}.dx-sheet-empresa span{display:block;font-size:.8em;color:#555}
                .dx-sheet-codes{display:grid;grid-template-columns:auto auto;gap:2px 8px;font-size:.72em;text-align:right}
                .dx-sheet-codes span{color:#888}
                .dx-sheet-title{margin:14px 0}.dx-sheet-title h1{color:var(--dx-primary);font-size:1.5em;margin:0}.dx-sheet-title p{margin:2px 0 0;color:#555}
                .dx-sheet-dg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 12px;background:#f7f7f4;border:1px solid #e6e3da;border-radius:6px;padding:12px;margin:12px 0}
                .dx-dg-wide{grid-column:span 2}
                .dx-sheet-dg span{display:block;color:#888;font-size:.7em;text-transform:uppercase}
                .dx-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:.9em}
                .dx-table th,.dx-table td{border:var(--dx-bw) solid var(--dx-border);padding:6px 8px;text-align:left}
                .dx-table thead th{background:var(--dx-primary);color:#fff}
                .dx-sheet-obs{margin:14px 0}.dx-sheet-obs-label{font-size:.7em;text-transform:uppercase;color:#888}
                .dx-sheet-obs-text{border:1px solid #e6e3da;border-radius:6px;padding:8px;min-height:40px}
                .dx-sheet-foot{margin-top:24px}.dx-sheet-lugar span{font-size:.7em;text-transform:uppercase;color:#888;display:block}
                .dx-sheet-firmas{display:flex;gap:36px;margin-top:42px}
                .dx-firma{flex:1;text-align:center}.dx-firma-line{border-top:1px solid #333;margin-bottom:6px}
                .dx-firma strong{display:block;font-size:.9em}.dx-firma span{font-size:.78em;color:#777}
                .dx-col-tools,.dx-col-resize,.dx-th-acc,.dx-td-acc,.dx-add-row{display:none!important}
            </style></head><body>${html}<script>window.onload=function(){window.print();}<\/script></body></html>`);
        w.document.close();
    }

    function vistaPrevia(id) {
        const exp = RequerimientosDB.buscarExpediente(id);
        if (!exp) return;
        let doc;
        if (abiertoId === exp.id && docActual) { sincronizarModelo(); doc = docActual; }
        else doc = obtenerDoc(exp);

        const ov = document.createElement("div");
        ov.className = "dx-preview-overlay";
        ov.id = "dx-preview-overlay";
        ov.innerHTML = `
            <div class="dx-preview-top">
                <span class="dx-preview-top-title">Vista previa · ${esc(exp.expCodigo)} · ${esc(exp.obra)}</span>
                <div class="dx-preview-top-actions">
                    <button type="button" data-pv="imprimir">Imprimir</button>
                    <button type="button" data-pv="cerrar">Cerrar</button>
                </div>
            </div>
            <div class="dx-preview-body zv-no-scrollbar">${pintarHoja(doc, exp, false)}</div>`;
        document.body.appendChild(ov);
        document.body.classList.add("dx-editor-open");
        ov.addEventListener("click", (e) => {
            const b = e.target.closest("[data-pv]");
            if (!b) return;
            if (b.dataset.pv === "cerrar") {
                ov.remove();
                if (!document.getElementById("dx-editor-overlay")) document.body.classList.remove("dx-editor-open");
            } else if (b.dataset.pv === "imprimir") {
                imprimirDoc(doc, exp);
            }
        });
    }

    /* ---------- ENVIAR A LOGÍSTICA ---------- */

    function enviarLogistica(desdeEditor) {
        const exp = RequerimientosDB.buscarExpediente(desdeEditor ? abiertoId : seleccionId);
        if (!exp) return;

        let doc;
        if (desdeEditor) { sincronizarModelo(); doc = docActual; }
        else doc = obtenerDoc(exp);

        const r = validarDoc(doc, exp);
        if (!r.ok) {
            if (!desdeEditor) {
                abrirEditor(exp.id);
                doc = docActual;
            }
            resaltarPrimerError(validarDoc(docActual, expActual));
            toast("Corrige los errores señalados antes de enviar a Logística.", "error");
            return;
        }

        // Guardar + generar y asociar PDF / Word / Excel.
        exp.documento = clon(doc);
        exp.documentoTs = Date.now();
        RequerimientosDB.registrarDocumentos(exp);
        exp.documentosAsociados = true;
        if (!Array.isArray(exp.versiones)) exp.versiones = [];
        exp.versiones.push({ version: exp.versiones.length + 1, doc: clon(doc), enviadoEn: Date.now() });
        exp.version = exp.versiones.length;
        // Enviar: cambia estado, marca enviado y bloquea edición.
        exp.estado = "enviado";
        exp.docEstado = "enviado-logistica";
        exp.enviadoLogistica = true;
        exp.bloqueado = true;
        exp.archivadoEn = Date.now();
        RequerimientosDB.registrarHistorial(exp, "Enviado a Logística y archivado (PDF, Word y Excel)", exp.versiones.length);
        RequerimientosDB.actualizarExpediente(exp);
        try { localStorage.removeItem(REC_KEY + exp.id); } catch (e) { /* noop */ }

        // Cierra el editor, sale de la lista de activos y vuelve al
        // administrador (el expediente queda en Archivo automáticamente).
        descartarEditor();
        const restantes = listarActivos();
        seleccionId = restantes[0] ? restantes[0].id : null;
        ReqWorkspace.render("documentos");
        mostrarMensajePrimerEnvio();
    }

    function mostrarMensajePrimerEnvio() {
        const clave = MSG_KEY + (usuarioActual() || "u");
        let visto = false;
        try { visto = localStorage.getItem(clave) === "1"; } catch (e) { visto = false; }
        if (visto) { toast("Expediente enviado a Logística y archivado."); return; }
        try { localStorage.setItem(clave, "1"); } catch (e) { /* noop */ }

        const ov = document.createElement("div");
        ov.className = "dx-msg-overlay";
        ov.id = "dx-msg-overlay";
        ov.innerHTML = `
            <div class="dx-msg-card">
                <div class="dx-msg-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3>Expediente enviado correctamente</h3>
                <p>Tu expediente fue enviado correctamente a Logística. Ahora se encuentra almacenado en <strong>Archivo</strong>, donde podrás consultarlo, descargarlo e imprimirlo cuando lo necesites.</p>
                <button type="button" class="nr-btn nr-btn-primary" data-msg-ok>Entendido</button>
            </div>`;
        document.body.appendChild(ov);
        ov.addEventListener("click", (e) => {
            if (e.target.closest("[data-msg-ok]") || e.target === ov) ov.remove();
        });
    }

    /* ---------- Apertura / cierre del editor ---------- */

    function abrirEditor(id) {
        const exp = RequerimientosDB.buscarExpediente(id);
        if (!exp) return;

        descartarEditor();

        abiertoId = id;
        expActual = exp;
        docActual = recuperarOCargar(exp);
        const recuperado = !!docActual.__recuperado;
        if (recuperado) delete docActual.__recuperado;

        undoStack = []; redoStack = []; snapshotPendiente = null;
        estadoGuardado = "guardado";
        menuDescarga = false; calidadColapsada = false;

        const est = ESTADOS[estadoDoc(exp)] || ESTADOS["listo"];
        const ov = document.createElement("div");
        ov.className = "dx-editor-overlay";
        ov.id = "dx-editor-overlay";
        ov.innerHTML = `
            <div class="dx-editor" id="dx-editor">
                ${pintarTopBar(exp, est)}
                ${pintarFormatBar(docActual)}
                <div class="dx-editor-stage">
                    <div class="dx-editor-scroll zv-no-scrollbar" id="dx-editor-scroll">
                        ${pintarHoja(docActual, exp, true)}
                    </div>
                    ${pintarCalidad()}
                </div>
                <div class="dx-toast" id="dx-toast-ed" hidden></div>
                <input type="file" accept="image/*" id="dx-logo-input" hidden>
            </div>`;
        document.body.appendChild(ov);
        document.body.classList.add("dx-editor-open");

        wireEditor(ov);
        actualizarUndoUI();

        if (recuperado) toast("Recuperamos tu trabajo no guardado.");
    }

    function descartarEditor() {
        clearTimeout(autosaveTimer);
        clearTimeout(calidadTimer);
        const ov = document.getElementById("dx-editor-overlay");
        if (ov) ov.remove();
        const pv = document.getElementById("dx-preview-overlay");
        if (pv) pv.remove();
        document.body.classList.remove("dx-editor-open");
        abiertoId = null;
        expActual = null;
        if (beforeUnloadAttached) {
            window.removeEventListener("beforeunload", flushAutosave);
            document.removeEventListener("visibilitychange", onVisibility);
            beforeUnloadAttached = false;
        }
    }

    /* ---------- Wiring del editor (delegación en el overlay) ---------- */

    function cerrarMenuEd() {
        const m = document.getElementById("dx-menu-ed");
        if (m) m.classList.remove("is-open");
    }

    function manejarClickEditor(e) {
        const cmd = e.target.closest("[data-cmd]");
        if (cmd) { ejecutarCmd(cmd.dataset.cmd); return; }

        const seg = e.target.closest("[data-fmt-seg]");
        if (seg) {
            capturar();
            docActual[seg.dataset.fmtSeg] = seg.dataset.val;
            renderSheet();
            pintarFormatBarRefresh();
            programarAutosave();
            return;
        }

        if (e.target.closest("[data-col-add]")) { capturar(); agregarColumna(); return; }
        const cmove = e.target.closest("[data-col-move]");
        if (cmove) { capturar(); moverColumna(parseInt(cmove.dataset.colMove, 10), parseInt(cmove.dataset.dir, 10)); return; }
        const cdel = e.target.closest("[data-col-del]");
        if (cdel) { capturar(); eliminarColumna(parseInt(cdel.dataset.colDel, 10)); return; }

        if (e.target.closest("[data-row-add]")) {
            capturar();
            docActual.filas.push(filaVacia());
            renderSheet();
            refrescarCalidad();
            programarAutosave();
            return;
        }
        const rdel = e.target.closest("[data-row-del]");
        if (rdel) {
            capturar();
            docActual.filas.splice(parseInt(rdel.dataset.rowDel, 10), 1);
            renderSheet();
            refrescarCalidad();
            programarAutosave();
            return;
        }

        const dl = e.target.closest("[data-ed-dl]");
        if (dl) {
            sincronizarModelo();
            descargarDoc(docActual, RequerimientosDB.buscarExpediente(abiertoId), dl.dataset.edDl);
            menuDescarga = false; cerrarMenuEd();
            return;
        }

        const goto = e.target.closest("[data-goto]");
        if (goto) { irAlCampo(goto.dataset.goto); return; }

        if (e.target.closest("[data-quality-toggle]")) {
            calidadColapsada = !calidadColapsada;
            const q = document.getElementById("dx-quality");
            if (q) q.classList.toggle("is-collapsed", calidadColapsada);
            return;
        }

        const ed = e.target.closest("[data-ed]");
        if (ed) {
            const a = ed.dataset.ed;
            if (a === "volver") { seleccionId = abiertoId; flushAutosave(); ReqWorkspace.render("documentos"); }
            else if (a === "undo") deshacer();
            else if (a === "redo") rehacer();
            else if (a === "guardar") guardarManual();
            else if (a === "imprimir") { sincronizarModelo(); imprimirDoc(docActual, expActual); }
            else if (a === "enviar") enviarLogistica(true);
            else if (a === "logo") { const inp = document.getElementById("dx-logo-input"); if (inp) inp.click(); }
            else if (a === "descargar") {
                menuDescarga = !menuDescarga;
                const m = document.getElementById("dx-menu-ed");
                if (m) m.classList.toggle("is-open", menuDescarga);
            }
            return;
        }

        if (!e.target.closest(".dx-menu-wrap")) { menuDescarga = false; cerrarMenuEd(); }
    }

    function manejarInputEditor(e) {
        const ed = e.target.closest('[data-edit],[data-dg],[data-cell],[data-firma],[data-firma-rol],[data-coltitle]');
        if (ed) {
            if (snapshotPendiente) {
                undoStack.push(snapshotPendiente);
                if (undoStack.length > 80) undoStack.shift();
                redoStack = [];
                snapshotPendiente = null;
                actualizarUndoUI();
            }
            programarCalidad();
            programarAutosave();
            return;
        }
        const live = e.target.closest("[data-fmt-live]");
        if (live) { aplicarFmtLive(live); return; }
    }

    function manejarChangeEditor(e) {
        const sel = e.target.closest("[data-fmt-sel]");
        if (sel) {
            capturar();
            docActual[sel.dataset.fmtSel] = (sel.dataset.fmtSel === "fontSize") ? parseInt(sel.value, 10) : sel.value;
            aplicarEstiloHoja();
            programarAutosave();
            return;
        }
        const file = e.target.closest("#dx-logo-input");
        if (file && file.files && file.files[0]) {
            const fr = new FileReader();
            fr.onload = () => { capturar(); docActual.logoUrl = fr.result; renderSheet(); programarAutosave(); };
            fr.readAsDataURL(file.files[0]);
        }
    }

    function wireEditor(ov) {
        ov.addEventListener("mousedown", (e) => {
            if (e.target.closest("[data-cmd]")) { e.preventDefault(); }   // conserva la selección de texto
            const rz = e.target.closest("[data-col-resize]");
            if (rz) { e.preventDefault(); iniciarResize(rz, e); }
        });
        ov.addEventListener("touchstart", (e) => {
            const rz = e.target.closest("[data-col-resize]");
            if (rz && e.touches[0]) iniciarResize(rz, e.touches[0]);
        }, { passive: true });

        ov.addEventListener("click", manejarClickEditor);
        ov.addEventListener("input", manejarInputEditor);
        ov.addEventListener("change", manejarChangeEditor);
        ov.addEventListener("focusin", (e) => {
            if (e.target.closest('[data-edit],[data-dg],[data-cell],[data-firma],[data-firma-rol],[data-coltitle]')) {
                sincronizarModelo();
                snapshotPendiente = clon(docActual);
            }
        });

        window.addEventListener("beforeunload", flushAutosave);
        document.addEventListener("visibilitychange", onVisibility);
        beforeUnloadAttached = true;
    }

    /* ---------- Ejemplos ---------- */

    function sembrar() {
        RequerimientosDB.sembrarEjemplos();
        ReqWorkspace.render("documentos");
    }

    /* ---------- Toast (editor o administrador) ---------- */

    function toast(msg, tipo) {
        const t = document.getElementById("dx-toast-ed") || document.getElementById("dx-toast");
        if (!t) return;
        t.className = `dx-toast is-${tipo || "ok"}`;
        t.textContent = msg;
        t.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { t.hidden = true; }, 3400);
    }

    /* ---------- MONTAJE del administrador (delegación) ---------- */

    function montar(ws, params) {
        const cont = ws.querySelector("#dx-root");
        if (!cont) return;

        cont.addEventListener("input", (e) => {
            if (e.target.id === "dx-search") repintarLista();
        });

        cont.addEventListener("click", (e) => {
            const sel = e.target.closest("[data-dx-sel]");
            if (sel) { seleccionarAdmin(sel.dataset.dxSel); return; }

            const dl = e.target.closest("[data-dx-dl]");
            if (dl) {
                const exp = RequerimientosDB.buscarExpediente(seleccionId);
                if (exp) descargarDoc(obtenerDoc(exp), exp, dl.dataset.dxDl);
                menuDescargaDet = false;
                const m = document.getElementById("dx-menu-det");
                if (m) m.classList.remove("is-open");
                return;
            }

            const act = e.target.closest("[data-dx-act]");
            if (act) {
                const a = act.dataset.dxAct;
                if (a === "editar") abrirEditor(seleccionId);
                else if (a === "preview") vistaPrevia(seleccionId);
                else if (a === "imprimir") {
                    const exp = RequerimientosDB.buscarExpediente(seleccionId);
                    if (exp) imprimirDoc(obtenerDoc(exp), exp);
                } else if (a === "enviar") enviarLogistica(false);
                else if (a === "descargar-menu") {
                    menuDescargaDet = !menuDescargaDet;
                    const m = document.getElementById("dx-menu-det");
                    if (m) m.classList.toggle("is-open", menuDescargaDet);
                } else if (a === "sembrar") sembrar();
                return;
            }

            if (!e.target.closest(".dx-menu-wrap")) {
                menuDescargaDet = false;
                const m = document.getElementById("dx-menu-det");
                if (m) m.classList.remove("is-open");
            }
        });

        // Apertura directa del editor cuando se solicita por parámetro.
        if (params && params.editar && seleccionId) abrirEditor(seleccionId);
    }

    return { render, montar };
})();

/* --------------------------------------------------------
   REQ WORKSPACE — dispatcher del contenedor #req-workspace
   --------------------------------------------------------
   Decide qué submódulo se pinta según la clave de la pestaña.
   "panel-control", "nuevo-requerimiento" y "documentos" están
   desarrollados; el resto muestran un marcador neutro hasta su fase.
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

        if (claveTab === "panel-control") {
            ws.innerHTML = PanelControl.render();
        } else if (claveTab === "nuevo-requerimiento") {
            ws.innerHTML = NuevoRequerimiento.render();
            NuevoRequerimiento.montar(ws);
        } else if (claveTab === "documentos") {
            ws.innerHTML = Documentos.render(params);
            Documentos.montar(ws, params);
        } else {
            ws.innerHTML = placeholder(claveTab, params);
        }

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