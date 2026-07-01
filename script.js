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
        // Refresca el módulo "Configuración General" al entrar a la vista.
        if (typeof ConfiguracionGeneral !== "undefined") {
            ConfiguracionGeneral.alMostrar();
        }
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
        documentos:     "zovrake_req_documentos"
    };

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

    // --- Obras (consultadas desde Configuración General) ---
    //
    // Única fuente de verdad: el módulo Configuración General. Aquí
    // SOLO se consultan (nunca se crean ni modifican). Se devuelve la
    // lista plana de obras activas con el contexto de su empresa.

    function obtenerObras() {
        if (typeof ConfiguracionDB === "undefined") return [];

        const obras = [];
        ConfiguracionDB.catalogoObras().forEach((g) => {
            g.obras.forEach((o) => {
                obras.push({
                    id: o.id,
                    codigo: o.codigo,
                    nombre: o.nombre,
                    departamento: o.departamento,
                    provincia: o.provincia,
                    distrito: o.distrito,
                    empresaId: g.empresaId,
                    empresa: g.empresa,
                    ruc: g.ruc
                });
            });
        });
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

    // ¿Dos registros pertenecen a la misma obra? Se compara por el id
    // interno de la obra (fuente de verdad de Configuración General) y,
    // como respaldo para expedientes antiguos, por nombre + empresa.
    function mismaObra(a, b) {
        if (a.obraId && b.obraId) return a.obraId === b.obraId;
        return (a.obra || "") === (b.obra || "") && (a.empresaId || "") === (b.empresaId || "");
    }

    // Documento ABIERTO de una obra: expediente ya generado (no
    // borrador) que aún no fue enviado a Logística. Solo puede existir
    // uno por obra; mientras siga abierto, los nuevos requerimientos de
    // esa obra se acumulan en él.
    function documentoAbierto(datos) {
        return listarExpedientes().find((e) =>
            !e.enviadoLogistica &&
            e.estado && e.estado !== "borrador" &&
            mismaObra(e, datos)
        ) || null;
    }

    // Agrega ÚNICAMENTE los nuevos materiales y observaciones al
    // documento abierto. No cambia el número, la fecha ni el resto del
    // encabezado: el documento crece mientras permanezca abierto.
    function agregarADocumento(exp, datos) {
        const nuevos = (datos.materiales || []).filter((m) => (m.descripcion || "").trim() !== "");
        exp.materiales = (exp.materiales || []).concat(nuevos);

        const obs = (datos.observacionesGenerales || "").trim();
        if (obs) {
            exp.observacionesGenerales = exp.observacionesGenerales
                ? `${exp.observacionesGenerales}\n${obs}`
                : obs;
        }

        exp.actualizadoEn = Date.now();

        upsert(exp);
        aprenderDeExpediente(datos);

        registrarActividad({ tipo: "documento", texto: "Materiales agregados al documento", codigo: exp.codigo });

        return exp;
    }

    // Genera el EXPEDIENTE DIGITAL (confirmado). Estado "enviado":
    // emitido al flujo interno del módulo (aún NO entregado a
    // Logística, que es un traspaso posterior entre módulos). Alimenta
    // el aprendizaje y actualiza actividad / notificaciones / documentos.
    //
    // Regla de negocio: una obra solo puede tener UN documento abierto.
    // Si ya existe, los nuevos materiales se acumulan en él en lugar de
    // crear un documento (y un número) nuevo.
    function generarExpediente(datos) {
        if (!datos.id) {
            const abierto = documentoAbierto(datos);
            if (abierto) return agregarADocumento(abierto, datos);
        }

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

    // Lectura puntual de un Expediente por su código de requerimiento.
    // La reutiliza el submódulo Documentos para resolver el documento
    // completo a partir de la fila de la bandeja, sin duplicar datos.
    function expedientePorCodigo(codigo) {
        return listarExpedientes().find((e) => e.codigo === codigo) || null;
    }

    // Marca un Expediente como ENTREGADO a Logística. Reutiliza la
    // misma colección de expedientes (no crea otra base de datos): solo
    // añade trazabilidad de la entrega. A partir de aquí el submódulo
    // Documentos deja de mostrarlo y el submódulo Archivo lo lista,
    // quedando disponible para el módulo Logística.
    function marcarEnviadoLogistica(codigo, tituloDefinitivo) {
        const lista = listarExpedientes();
        const idx = lista.findIndex((e) => e.codigo === codigo);
        if (idx < 0) return null;
        if (lista[idx].enviadoLogistica) return lista[idx];

        lista[idx] = {
            ...lista[idx],
            enviadoLogistica: true,
            entregadoLogisticaEn: Date.now(),
            actualizadoEn: Date.now()
        };

        // El título queda DEFINITIVO al cerrarse el documento: ya no se
        // recalcula aunque cambien los datos o el algoritmo de títulos.
        if (tituloDefinitivo && !lista[idx].tituloDefinitivo) {
            lista[idx].tituloDefinitivo = tituloDefinitivo;
        }

        guardarColeccion(lista);

        registrarActividad({ tipo: "logistica", texto: "Expediente enviado a Logística", codigo });
        registrarNotificacion({ texto: `Expediente ${codigo} enviado a Logística`, codigo });

        return lista[idx];
    }

    return {
        obtenerObras, configObra, datosObra,
        sugerirCampo, sugerirPartidas, sugerirMateriales, umDeMaterial,
        listarExpedientes, guardarBorrador, generarExpediente,
        listarActividad, listarNotificaciones, listarDocumentos,
        expedientePorCodigo, marcarEnviadoLogistica
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

    // Carga html2canvas bajo demanda (igual patrón que jsPDF). Se usa
    // solo para exportar el PDF rasterizando la plantilla oficial, de
    // modo que el archivo conserve EXACTAMENTE el mismo diseño.
    let promesaHtml2Canvas = null;
    function cargarHtml2Canvas() {
        if (window.html2canvas) return Promise.resolve(window.html2canvas);
        if (promesaHtml2Canvas) return promesaHtml2Canvas;

        promesaHtml2Canvas = new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            s.onload = () => resolve(window.html2canvas);
            s.onerror = () => reject(new Error("No se pudo cargar html2canvas"));
            document.head.appendChild(s);
        });
        return promesaHtml2Canvas;
    }

    /* ---------- Utilidades de la plantilla ---------- */

    const MESES = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    // Fecha legible: "21 de octubre del 2025". Acepta ISO (yyyy-mm-dd)
    // y degrada al texto original si no es interpretable.
    function fechaLarga(iso) {
        if (!iso) return "";
        const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso + "T00:00:00" : iso);
        if (isNaN(d.getTime())) return iso;
        return `${d.getDate()} de ${MESES[d.getMonth()]} del ${d.getFullYear()}`;
    }

    // Escapa y conserva los saltos de línea (observaciones largas).
    function escMultilinea(t) {
        return esc(t == null ? "" : t).replace(/\r?\n/g, "<br>");
    }

    // Resuelve EN VIVO los datos de la empresa (nombre, RUC y logo)
    // desde Configuración General. Si el expediente es antiguo o la
    // empresa ya no existe, degrada a los datos guardados en el propio
    // expediente. Nunca inventa información.
    function contextoEmpresaDoc(exp) {
        let ctx = null;
        if (exp.empresaId && typeof ConfiguracionDB !== "undefined") {
            ctx = ConfiguracionDB.contextoEmpresa(exp.empresaId);
        }
        return {
            empresa: (ctx && ctx.nombre) || exp.empresa || "",
            ruc:     (ctx && ctx.ruc)    || exp.ruc     || "",
            logo:    (ctx && ctx.logo)   || null
        };
    }

    // Materiales reales (con descripción) del expediente.
    function materialesReales(exp) {
        return (exp.materiales || []).filter((m) => (m.descripcion || "").trim() !== "");
    }

    /* ---------- GENERADOR DE TÍTULOS PROFESIONALES ----------
       Analiza TODA la lista de materiales (no solo los primeros), la
       partida y la obra para deducir el objetivo técnico del documento
       y construir un único título profesional, al estilo de un
       documento oficial de una empresa constructora. Nunca lista
       materiales ni usa expresiones como "y N más". */

    // Familias técnicas de construcción. `etiqueta` es la forma extensa
    // (familia única dominante) y `combo` la forma breve (dos familias).
    const FAMILIAS_MATERIAL = [
        { clave: "acero",       etiqueta: "acero y estructuras metálicas", combo: "estructuras metálicas", palabras: ["acero", "fierro", "varilla", "corrugad", "viga", "ángulo", "angulo", "platina", "perfil", "electrosoldad", "malla", "alambre"] },
        { clave: "concreto",    etiqueta: "concreto y agregados",          combo: "concreto",              palabras: ["cemento", "concreto", "hormigon", "hormigón", "arena", "piedra", "gravilla", "agregado", "confitillo", "mortero", "aditivo"] },
        { clave: "albanileria", etiqueta: "albañilería",                   combo: "albañilería",           palabras: ["ladrillo", "bloque", "block", "yeso", "cal ", "pandereta", "king kong", "kingkong"] },
        { clave: "acabados",    etiqueta: "acabados",                      combo: "acabados",              palabras: ["ceramic", "cerámic", "porcelanato", "mayolic", "mayólic", "baldosa", "enchape", "zocalo", "zócalo", "fragua", "pegamento", "porcelana", "empaste"] },
        { clave: "pintura",     etiqueta: "pintura y recubrimientos",      combo: "pintura",               palabras: ["pintura", "esmalte", "latex", "látex", "imprimante", "barniz", "thinner", "laca", "sellador", "brocha", "rodillo", "lija", "masilla"] },
        { clave: "electricas",  etiqueta: "instalaciones eléctricas",      combo: "instalaciones eléctricas", palabras: ["cable", "interruptor", "tomacorriente", "luminaria", "fluorescente", "foco", "tablero", "breaker", "termica", "térmica", "canaleta", "conductor", " led", "socket", "enchufe"] },
        { clave: "sanitarias",  etiqueta: "instalaciones sanitarias",      combo: "instalaciones sanitarias", palabras: ["tuberia", "tubería", "tubo pvc", "codo", "tee", "union", "unión", "valvula", "válvula", "inodoro", "lavatorio", "gasfiter", "caño", "niple", "reduccion", "reducción", "trampa", "sanitari"] },
        { clave: "carpinteria", etiqueta: "carpintería y madera",          combo: "carpintería",           palabras: ["madera", "triplay", "melamin", "liston", "listón", "puerta", "marco", "bisagra", "contrachapad", "mdf"] },
        { clave: "coberturas",  etiqueta: "coberturas y techos",           combo: "coberturas",            palabras: ["calamina", "teja", "cobertura", "drywall", "policarbonato", "fibraforte", "eternit"] },
        { clave: "ferreteria",  etiqueta: "ferretería",                    combo: "ferretería",            palabras: ["perno", "tuerca", "arandela", "abrazadera", "disco", "broca", "cinta", "silicona", "tornillo", "clavo", "escalera", "carretilla"] }
    ];

    function familiaDeMaterial(desc) {
        const t = (desc || "").toLowerCase();
        for (const f of FAMILIAS_MATERIAL) {
            if (f.palabras.some((p) => t.includes(p))) return f;
        }
        return null;
    }

    // Título profesional del documento. Se calcula en cada render, de
    // modo que mientras el documento permanece abierto se actualiza al
    // agregar materiales. Al enviar a Logística se congela en
    // `tituloDefinitivo` y ya no vuelve a cambiar.
    function tituloInteligente(exp) {
        // Documento ya cerrado (enviado a Logística): título congelado.
        if (exp && exp.tituloDefinitivo) return exp.tituloDefinitivo;

        const mats = materialesReales(exp);
        const partida = (exp && exp.partida ? String(exp.partida) : "").trim();

        // Sin materiales todavía: se apoya en la partida.
        if (mats.length === 0) {
            return partida
                ? `Requerimiento de materiales para ${partida.toLowerCase()}`
                : "Requerimiento de materiales, insumos y servicios";
        }

        // Se analiza la lista COMPLETA y se agrupa por familia técnica.
        const conteo = new Map();
        mats.forEach((m) => {
            const f = familiaDeMaterial(m.descripcion);
            if (f) conteo.set(f.clave, (conteo.get(f.clave) || 0) + 1);
        });

        const familias = [...conteo.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([clave]) => FAMILIAS_MATERIAL.find((f) => f.clave === clave));

        if (familias.length >= 1) {
            const dom = familias[0];
            const domCount = conteo.get(dom.clave);

            // Una sola familia, o una claramente dominante (≥ 60 %).
            if (familias.length === 1 || domCount / mats.length >= 0.6) {
                return `Requerimiento de materiales de ${dom.etiqueta}`;
            }
            // Dos familias relevantes: se nombran ambas (nunca materiales).
            if (familias.length === 2) {
                return `Requerimiento de materiales de ${familias[0].combo} y ${familias[1].combo}`;
            }
            // Tres o más familias: documento multidisciplinario.
            return partida
                ? `Requerimiento de materiales para ${partida.toLowerCase()}`
                : "Requerimiento de materiales, insumos y servicios";
        }

        // Ninguna familia reconocida: prioriza la partida y luego lo genérico.
        return partida
            ? `Requerimiento de materiales para ${partida.toLowerCase()}`
            : "Requerimiento de materiales, insumos y servicios";
    }

    // Nombre de archivo seguro a partir del código + título.
    function nombreArchivo(exp, extension) {
        const base = `${exp.codigo || "REQ"} ${tituloInteligente(exp)}`
            .replace(/[\\/:*?"<>|]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);
        return `${base}.${extension}`;
    }

    /* ---------- PLANTILLA OFICIAL ÚNICA (A4) ----------
       Única fuente visual del documento. La consumen por igual la
       Vista previa, la Impresión y la exportación a PDF. Replica el
       documento físico de referencia (encabezado, cuadros de datos,
       tabla celeste, lugar de entrega y firmas) sin sombras, sin
       degradados y sin bordes redondeados. */

    const MIN_FILAS_TABLA = 8;

    function filaMaterialHTML(m, i) {
        return `
            <tr>
                <td class="zdoc-c-item">${i + 1}</td>
                <td class="zdoc-c-um">${esc(m.um)}</td>
                <td class="zdoc-c-cant">${esc(m.cantidad)}</td>
                <td class="zdoc-c-desc">${escMultilinea(m.descripcion)}</td>
                <td class="zdoc-c-obs">${escMultilinea(m.observaciones)}</td>
            </tr>`;
    }

    function filaVaciaHTML() {
        return `
            <tr class="zdoc-fila-vacia">
                <td class="zdoc-c-item">&nbsp;</td>
                <td class="zdoc-c-um"></td>
                <td class="zdoc-c-cant"></td>
                <td class="zdoc-c-desc"></td>
                <td class="zdoc-c-obs"></td>
            </tr>`;
    }

    function celdaDato(valor) {
        const v = esc(valor);
        return v || "&nbsp;";
    }

    /* ---------- BLOQUES REUTILIZABLES DE LA PLANTILLA ----------
       Una sola fuente para los bloques del documento. Los consumen por
       igual la vista previa, la impresión, la exportación y el motor de
       paginación. No se duplica marcado ni estilos. */

    // Encabezado institucional (logo + empresa + RUC + título) y cuadro
    // de datos del requerimiento. Solo aparece en la PRIMERA página.
    function cabeceraHTML(c, exp) {
        const logoHTML = c.logo
            ? `<img class="zdoc-logo-img" src="${esc(c.logo)}" alt="Logo de ${esc(c.empresa)}">`
            : `<span class="zdoc-logo-fallback">${esc((c.empresa || "ZOVRAKE").slice(0, 4).toUpperCase())}</span>`;

        return `
                <table class="zdoc-encabezado">
                    <colgroup><col style="width:34mm"><col></colgroup>
                    <tbody>
                        <tr>
                            <td class="zdoc-logo-cell">${logoHTML}</td>
                            <td class="zdoc-titulo-cell">
                                <div class="zdoc-empresa">${esc(c.empresa)}</div>
                                <div class="zdoc-ruc">RUC ${esc(c.ruc)}</div>
                                <div class="zdoc-doctipo">${esc(tituloInteligente(exp).toUpperCase())}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table class="zdoc-meta">
                    <colgroup>
                        <col style="width:32mm"><col><col style="width:36mm"><col style="width:40mm">
                    </colgroup>
                    <tbody>
                        <tr>
                            <td class="zdoc-lbl">OBRA:</td>
                            <td class="zdoc-val">${celdaDato(exp.obra)}</td>
                            <td class="zdoc-lbl">N.º DE REQUERIMIENTO:</td>
                            <td class="zdoc-val zdoc-val-strong">${celdaDato(exp.codigo)}</td>
                        </tr>
                        <tr>
                            <td class="zdoc-lbl">PARTIDA:</td>
                            <td class="zdoc-val">${celdaDato(exp.partida)}</td>
                            <td class="zdoc-lbl">FECHA:</td>
                            <td class="zdoc-val">${celdaDato(fechaLarga(exp.fecha))}</td>
                        </tr>
                        <tr>
                            <td class="zdoc-lbl">REQUERIDO POR:</td>
                            <td class="zdoc-val">${celdaDato(exp.requeridoPor)}</td>
                            <td class="zdoc-lbl">CARGO:</td>
                            <td class="zdoc-val">${celdaDato(exp.cargoRequerido)}</td>
                        </tr>
                        <tr>
                            <td class="zdoc-lbl">RECIBIDO POR:</td>
                            <td class="zdoc-val">${celdaDato(exp.recibidoPor)}</td>
                            <td class="zdoc-lbl">CARGO:</td>
                            <td class="zdoc-val">${celdaDato(exp.cargoRecibido)}</td>
                        </tr>
                        <tr>
                            <td class="zdoc-lbl">FECHA MÁXIMA DE INGRESO A OBRA:</td>
                            <td class="zdoc-val" colspan="3">${celdaDato(fechaLarga(exp.fechaMaxima))}</td>
                        </tr>
                    </tbody>
                </table>`;
    }

    // Apertura de la tabla de materiales (colgroup + encabezado de tabla).
    // El encabezado de la tabla se repite en TODAS las páginas.
    function tablaAbreHTML() {
        return `
                <table class="zdoc-tabla-mat">
                    <colgroup>
                        <col style="width:12mm"><col style="width:18mm"><col style="width:20mm"><col><col style="width:50mm">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>ITEM</th>
                            <th>U.M.</th>
                            <th>CANTIDAD</th>
                            <th>DESCRIPCIÓN DEL MATERIAL</th>
                            <th>OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>`;
    }

    function tablaCierraHTML() {
        return `
                    </tbody>
                </table>`;
    }

    // Lugar de entrega + firmas (Usuario / Gerencia / Jefe de Logística).
    // Solo aparece al FINAL del último material del documento.
    function pieHTML(exp) {
        return `
                <table class="zdoc-lugar">
                    <colgroup><col style="width:38mm"><col></colgroup>
                    <tbody>
                        <tr>
                            <td class="zdoc-lbl">LUGAR DE ENTREGA:</td>
                            <td class="zdoc-val">${celdaDato(exp.lugarEntrega)}</td>
                        </tr>
                    </tbody>
                </table>

                <table class="zdoc-firmas">
                    <colgroup><col style="width:33.33%"><col style="width:33.33%"><col style="width:33.34%"></colgroup>
                    <tbody>
                        <tr>
                            <td><div class="zdoc-firma-linea"></div><div class="zdoc-firma-rol">USUARIO</div></td>
                            <td><div class="zdoc-firma-linea"></div><div class="zdoc-firma-rol">GERENCIA</div></td>
                            <td><div class="zdoc-firma-linea"></div><div class="zdoc-firma-rol">JEFE DE LOGÍSTICA</div></td>
                        </tr>
                    </tbody>
                </table>`;
    }

    // Envuelve una página A4 completa.
    function paginaHTML(cab, cuerpo, pie, sinTabla) {
        const tabla = sinTabla ? "" : `${tablaAbreHTML()}${cuerpo}${tablaCierraHTML()}`;
        return `
        <div class="zdoc-page">
            <div class="zdoc-frame">
                ${cab}${tabla}${pie}
            </div>
        </div>`;
    }

    // Envuelve el documento (una o varias páginas) para el visor.
    function envolverDoc(paginasHTML) {
        return `<div class="zdoc-doc">${paginasHTML}</div>`;
    }

    /* ---------- MOTOR DE PAGINACIÓN PROFESIONAL ----------
       Mide la altura real (px) de cada bloque para repartir las filas
       como un documento técnico: nunca corta una fila, nunca deja hojas
       en blanco y coloca las firmas solo al final del último material. */

    function medirBloques(exp) {
        const c = contextoEmpresaDoc(exp);
        const mats = materialesReales(exp);

        const host = document.createElement("div");
        host.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;";
        host.innerHTML = `
            <div class="zdoc-page" data-probe="1"></div>
            <div class="zdoc-page"><div class="zdoc-frame">
                <div data-m="cab">${cabeceraHTML(c, exp)}</div>
                <table class="zdoc-tabla-mat" style="margin-top:0">
                    <colgroup><col style="width:12mm"><col style="width:18mm"><col style="width:20mm"><col><col style="width:50mm"></colgroup>
                    <thead data-m="thead"><tr><th>ITEM</th><th>U.M.</th><th>CANTIDAD</th><th>DESCRIPCIÓN DEL MATERIAL</th><th>OBSERVACIONES</th></tr></thead>
                    <tbody data-m="body">${mats.map(filaMaterialHTML).join("")}${filaVaciaHTML()}</tbody>
                </table>
                <div data-m="pie">${pieHTML(exp)}</div>
            </div></div>`;
        document.body.appendChild(host);

        const paginas = host.querySelectorAll(".zdoc-page");
        const probe = paginas[0];   // página vacía => A4 exacto (min-height 297mm)
        const real = paginas[1];

        const a4 = probe.offsetHeight;
        const cs = getComputedStyle(probe);
        const pad = parseFloat(cs.paddingTop || "0") + parseFloat(cs.paddingBottom || "0");

        const cabH = real.querySelector('[data-m="cab"]').getBoundingClientRect().height;
        const theadH = real.querySelector('[data-m="thead"]').getBoundingClientRect().height;
        const pieH = real.querySelector('[data-m="pie"]').getBoundingClientRect().height;

        const trs = [...real.querySelector('[data-m="body"]').querySelectorAll("tr")];
        const hFilaVacia = trs.length ? trs[trs.length - 1].getBoundingClientRect().height : 22;
        const filas = trs.slice(0, mats.length).map((tr) => tr.getBoundingClientRect().height);

        host.remove();

        return {
            usable: a4 - pad - 4,   // alto disponible dentro del marco, con margen de seguridad
            hCab: cabH,
            hThead: theadH,
            hPie: pieH,
            hFilaVacia: hFilaVacia || 22,
            filas
        };
    }

    // Reparte los índices de fila en páginas respetando la altura útil.
    function paginar(medida, nMats) {
        const { usable, hCab, hThead, hPie, filas } = medida;
        const paginas = [];
        let i = 0;

        while (i < nMats) {
            const primera = paginas.length === 0;
            const dispo = usable - (primera ? hCab : 0) - hThead;
            const grupo = [];
            let usado = 0;

            while (i < nMats) {
                const h = filas[i];
                const ultima = (i === nMats - 1);
                const reserva = ultima ? hPie : 0;   // el pie debe caber junto al último material
                if (usado + h + reserva <= dispo || grupo.length === 0) {
                    grupo.push(i);
                    usado += h;
                    i++;
                    if (ultima) break;
                } else {
                    break;
                }
            }
            paginas.push({ filas: grupo, primera, usado });
        }

        // Coloca el pie (lugar + firmas) al final del último material.
        const ult = paginas[paginas.length - 1];
        const dispoUlt = usable - (ult.primera ? hCab : 0) - hThead - ult.usado;
        if (dispoUlt >= hPie) {
            ult.pie = true;
            ult.relleno = Math.max(0, Math.floor((dispoUlt - hPie) / medida.hFilaVacia));
        } else {
            paginas.push({ filas: [], primera: false, usado: 0, pie: true, soloPie: true, relleno: 0 });
        }
        return paginas;
    }

    // Devuelve el HTML del documento A4 (una o varias páginas .zdoc-page,
    // envueltas en .zdoc-doc). Única fuente visual: la consumen la vista
    // previa, la impresión y la exportación a PDF. El estilo vive en
    // style.css (.zdoc-*) para no duplicar CSS.
    function plantillaHTML(exp) {
        const c = contextoEmpresaDoc(exp);
        const mats = materialesReales(exp);

        const medida = medirBloques(exp);
        const sumaFilas = medida.filas.reduce((a, b) => a + b, 0);
        const rellenoMin = Math.max(0, MIN_FILAS_TABLA - mats.length);
        const alturaConMin = medida.hCab + medida.hThead + medida.hPie
            + sumaFilas + rellenoMin * medida.hFilaVacia;

        // CASO A: todo el documento cabe en una sola hoja A4. Se conserva
        // exactamente la plantilla de una página (con filas mínimas de
        // relleno), como el comportamiento ya aprobado.
        if (alturaConMin <= medida.usable) {
            const filas = mats.map(filaMaterialHTML).join("");
            const relleno = Array.from({ length: rellenoMin }, filaVaciaHTML).join("");
            return envolverDoc(paginaHTML(cabeceraHTML(c, exp), filas + relleno, pieHTML(exp)));
        }

        // CASO B: el contenido supera una hoja -> paginación profesional.
        const paginas = paginar(medida, mats.length);
        const html = paginas.map((p) => {
            if (p.soloPie) {
                return paginaHTML("", "", pieHTML(exp), true);
            }
            const filas = p.filas.map((idx) => filaMaterialHTML(mats[idx], idx)).join("");
            const relleno = Array.from({ length: p.relleno || 0 }, filaVaciaHTML).join("");
            return paginaHTML(
                p.primera ? cabeceraHTML(c, exp) : "",
                filas + relleno,
                p.pie ? pieHTML(exp) : ""
            );
        }).join("");

        return envolverDoc(html);
    }

    /* ---------- IMPRESIÓN (misma plantilla) ---------- */

    function imprimir(exp) {
        const ventana = window.open("", "_blank");
        if (!ventana) return;

        ventana.document.write(`<!DOCTYPE html>
            <html lang="es"><head>
                <meta charset="utf-8">
                <base href="${esc(location.href)}">
                <title>${esc(nombreArchivo(exp, "pdf").replace(/\.pdf$/, ""))}</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    html,body{margin:0;background:#fff;}
                    body{display:block;}
                    .zdoc-doc{display:block;}
                    .zdoc-page{margin:0 auto;box-shadow:none;page-break-after:always;break-after:page;}
                    .zdoc-page:last-child{page-break-after:auto;break-after:auto;}
                    @page{size:A4;margin:0;}
                </style>
            </head><body class="zdoc-print">
                ${plantillaHTML(exp)}
                <script>
                    window.addEventListener("load", function(){
                        setTimeout(function(){ window.focus(); window.print(); }, 350);
                    });
                <\/script>
            </body></html>`);
        ventana.document.close();
    }

    /* ---------- EXPORTAR PDF (rasteriza la plantilla) ----------
       Conserva el diseño EXACTO. Si las librerías no cargan, recae en
       la impresión (que produce un PDF igual de fiel vía el navegador). */

    function exportarPDF(exp) {
        return Promise.all([cargarJsPDF(), cargarHtml2Canvas()])
            .then(([JsPDF, html2canvas]) => {
                if (!JsPDF || !html2canvas) { imprimir(exp); return; }

                // Render fuera de pantalla a tamaño A4 real para capturar nítido.
                const host = document.createElement("div");
                host.style.cssText = "position:fixed;left:-10000px;top:0;background:#fff;z-index:-1;";
                host.innerHTML = plantillaHTML(exp);
                document.body.appendChild(host);

                const paginas = [...host.querySelectorAll(".zdoc-page")];
                const doc = new JsPDF({ unit: "pt", format: "a4" });
                const pageW = doc.internal.pageSize.getWidth();
                const pageH = doc.internal.pageSize.getHeight();

                // Rasteriza cada página A4 por separado: una imagen = una
                // hoja. De este modo nunca se generan hojas en blanco ni se
                // cortan filas entre páginas.
                const render = (idx) => {
                    if (idx >= paginas.length) {
                        doc.save(nombreArchivo(exp, "pdf"));
                        return;
                    }
                    return html2canvas(paginas[idx], { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
                        .then((canvas) => {
                            let imgW = pageW;
                            let imgH = canvas.height * imgW / canvas.width;
                            if (imgH > pageH) {            // evita desbordes que crearían hojas vacías
                                imgH = pageH;
                                imgW = canvas.width * imgH / canvas.height;
                            }
                            const x = (pageW - imgW) / 2;
                            if (idx > 0) doc.addPage();
                            doc.addImage(canvas.toDataURL("image/png"), "PNG", x, 0, imgW, imgH);
                            return render(idx + 1);
                        });
                };

                return Promise.resolve(render(0)).finally(() => host.remove());
            })
            .catch(() => imprimir(exp));
    }

    /* ---------- EXPORTAR WORD (conserva tablas) ----------
       Mismo origen de datos; estructura con tablas e bordes en línea
       para que Word respete la cuadrícula del documento. */

    function exportarWord(exp) {
        const c = contextoEmpresaDoc(exp);
        const mats = materialesReales(exp);

        const filas = mats.map((m, i) => `
            <tr>
                <td style="text-align:center">${i + 1}</td>
                <td style="text-align:center">${esc(m.um)}</td>
                <td style="text-align:center">${esc(m.cantidad)}</td>
                <td>${escMultilinea(m.descripcion)}</td>
                <td>${escMultilinea(m.observaciones)}</td>
            </tr>`).join("");

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
            <head><meta charset="utf-8"><title>${esc(exp.codigo)}</title></head>
            <body style="font-family:Arial,sans-serif;color:#111;font-size:11px">

                <table border="1" cellspacing="0" cellpadding="6" width="100%" style="border-collapse:collapse">
                    <tr>
                        <td width="120" align="center"><strong>${esc(c.empresa || "—")}</strong></td>
                        <td align="center">
                            <div><strong>${esc(c.empresa)}</strong></div>
                            <div>RUC ${esc(c.ruc)}</div>
                            <div><strong>${esc(tituloInteligente(exp).toUpperCase())}</strong></div>
                        </td>
                    </tr>
                </table>

                <table border="1" cellspacing="0" cellpadding="5" width="100%" style="border-collapse:collapse;margin-top:8px">
                    <tr><td width="22%"><strong>OBRA</strong></td><td>${esc(exp.obra)}</td><td width="22%"><strong>N° DE REQUERIMIENTO</strong></td><td>${esc(exp.codigo)}</td></tr>
                    <tr><td><strong>PARTIDA</strong></td><td>${esc(exp.partida)}</td><td><strong>FECHA</strong></td><td>${esc(fechaLarga(exp.fecha))}</td></tr>
                    <tr><td><strong>REQUERIDO POR</strong></td><td>${esc(exp.requeridoPor)}</td><td><strong>CARGO</strong></td><td>${esc(exp.cargoRequerido)}</td></tr>
                    <tr><td><strong>RECIBIDO POR</strong></td><td>${esc(exp.recibidoPor)}</td><td><strong>CARGO</strong></td><td>${esc(exp.cargoRecibido)}</td></tr>
                    <tr><td><strong>FECHA MÁXIMA DE INGRESO A OBRA</strong></td><td colspan="3">${esc(fechaLarga(exp.fechaMaxima))}</td></tr>
                </table>

                <table border="1" cellspacing="0" cellpadding="5" width="100%" style="border-collapse:collapse;margin-top:8px">
                    <thead>
                        <tr style="background:#BDD7EE">
                            <th>ITEM</th><th>U.M.</th><th>CANTIDAD</th><th>DESCRIPCIÓN DEL MATERIAL</th><th>OBSERVACIONES</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>

                <table border="1" cellspacing="0" cellpadding="5" width="100%" style="border-collapse:collapse;margin-top:8px">
                    <tr><td width="22%"><strong>LUGAR DE ENTREGA</strong></td><td>${esc(exp.lugarEntrega)}</td></tr>
                </table>

                <table width="100%" cellpadding="24" style="margin-top:24px;text-align:center">
                    <tr>
                        <td>__________________<br>USUARIO</td>
                        <td>__________________<br>GERENCIA</td>
                        <td>__________________<br>JEFE DE LOGÍSTICA</td>
                    </tr>
                </table>

            </body></html>`;

        descargar(new Blob(["\ufeff" + html], { type: "application/msword" }), nombreArchivo(exp, "doc"));
    }

    /* ---------- EXPORTAR EXCEL (columnas organizadas) ---------- */

    function exportarExcel(exp) {
        const c = contextoEmpresaDoc(exp);
        const mats = materialesReales(exp);

        const filas = mats.map((m, i) => `
            <tr>
                <td>${i + 1}</td><td>${esc(m.um)}</td><td>${esc(m.cantidad)}</td>
                <td>${esc(m.descripcion)}</td><td>${esc(m.observaciones)}</td>
            </tr>`).join("");

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="utf-8"></head>
            <body>
                <table border="1">
                    <tr><th colspan="5" style="background:#BDD7EE">${esc(c.empresa)} — ${esc(tituloInteligente(exp).toUpperCase())}</th></tr>
                    <tr><td>RUC</td><td colspan="4">${esc(c.ruc)}</td></tr>
                    <tr><td>N° de Requerimiento</td><td colspan="4">${esc(exp.codigo)}</td></tr>
                    <tr><td>Obra</td><td colspan="4">${esc(exp.obra)}</td></tr>
                    <tr><td>Partida</td><td colspan="4">${esc(exp.partida)}</td></tr>
                    <tr><td>Requerido por</td><td colspan="4">${esc(exp.requeridoPor)} (${esc(exp.cargoRequerido)})</td></tr>
                    <tr><td>Recibido por</td><td colspan="4">${esc(exp.recibidoPor)} (${esc(exp.cargoRecibido)})</td></tr>
                    <tr><td>Fecha</td><td colspan="4">${esc(fechaLarga(exp.fecha))}</td></tr>
                    <tr><td>Fecha máxima de ingreso a obra</td><td colspan="4">${esc(fechaLarga(exp.fechaMaxima))}</td></tr>
                    <tr><td>Lugar de entrega</td><td colspan="4">${esc(exp.lugarEntrega)}</td></tr>
                    <tr><td colspan="5"></td></tr>
                    <tr style="background:#BDD7EE">
                        <th>ITEM</th><th>U.M.</th><th>CANTIDAD</th><th>DESCRIPCIÓN DEL MATERIAL</th><th>OBSERVACIONES</th>
                    </tr>
                    ${filas}
                </table>
            </body></html>`;

        descargar(new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel" }), nombreArchivo(exp, "xls"));
    }

    // Compatibilidad: los nombres previos siguen disponibles para el
    // resto del ERP (p. ej. la pantalla de éxito de Nuevo Requerimiento),
    // ahora apuntando a la plantilla oficial única.
    return {
        plantillaHTML, tituloInteligente, nombreArchivo,
        imprimir, exportarPDF, exportarWord, exportarExcel,
        descargarPDF: exportarPDF, descargarWord: exportarWord, descargarExcel: exportarExcel
    };
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
        // Las obras provienen de Configuración General (única fuente de
        // verdad). Se agrupan por empresa y cada opción lleva el contexto
        // de su empresa para identificarla automáticamente al seleccionar.
        const grupos = (typeof ConfiguracionDB !== "undefined")
            ? ConfiguracionDB.catalogoObras()
            : [];
        const hayObras = grupos.length > 0;

        const opciones = grupos.map((g) => {
            const ops = g.obras.map((o) =>
                `<option value="${PanelUtils.escapar(o.nombre)}"`
                + ` data-empresa-id="${PanelUtils.escapar(g.empresaId)}"`
                + ` data-empresa="${PanelUtils.escapar(g.empresa)}"`
                + ` data-ruc="${PanelUtils.escapar(g.ruc)}"`
                + ` data-obra-id="${PanelUtils.escapar(o.id)}"`
                + ` data-codigo="${PanelUtils.escapar(o.codigo)}">${PanelUtils.escapar(o.nombre)}</option>`
            ).join("");
            return `<optgroup label="${PanelUtils.escapar(g.empresa)}">${ops}</optgroup>`;
        }).join("");

        const placeholderObra = hayObras
            ? "Selecciona una obra…"
            : "No hay obras registradas en Configuración General";

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
                        <select class="nr-input" id="nr-obra" ${hayObras ? "" : "disabled"}>
                            <option value="">${placeholderObra}</option>
                            ${opciones}
                        </select>
                        ${hayObras ? "" : '<span class="nr-hint-inline">Registre una obra en Configuración General para habilitar este campo.</span>'}
                        <span class="nr-error" hidden></span>
                        <div class="nr-empresa-info" id="nr-empresa-info" hidden></div>
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

    // Lee el contexto de empresa de la obra seleccionada (lo aporta
    // Configuración General a través de los data-* de cada <option>).
    // Así el expediente queda vinculado a su empresa sin que el usuario
    // vuelva a escribir esos datos, y el futuro submódulo Documentos
    // podrá resolver el logo en vivo con ConfiguracionDB.contextoEmpresa.
    function contextoEmpresaSeleccionada(root) {
        const sel = root.querySelector("#nr-obra");
        const opt = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null;
        if (!opt || !opt.value) {
            return { empresaId: "", empresa: "", ruc: "", obraId: "", obraCodigo: "" };
        }
        return {
            empresaId:  opt.dataset.empresaId || "",
            empresa:    opt.dataset.empresa || "",
            ruc:        opt.dataset.ruc || "",
            obraId:     opt.dataset.obraId || "",
            obraCodigo: opt.dataset.codigo || ""
        };
    }

    function recolectar(root) {
        const ctx = contextoEmpresaSeleccionada(root);
        return {
            obra:               valor(root, "obra"),
            empresaId:          ctx.empresaId,
            empresa:            ctx.empresa,
            ruc:                ctx.ruc,
            obraId:             ctx.obraId,
            obraCodigo:         ctx.obraCodigo,
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

        // Obra -> autocompleta el resto de la Tarjeta 1 y muestra la
        // empresa identificada automáticamente (empresa + RUC).
        const selObra = root.querySelector("#nr-obra");
        const infoEmpresa = root.querySelector("#nr-empresa-info");

        function mostrarEmpresaIdentificada() {
            const ctx = contextoEmpresaSeleccionada(root);
            if (!infoEmpresa) return;
            if (ctx.empresa) {
                infoEmpresa.hidden = false;
                infoEmpresa.innerHTML =
                    `Empresa identificada: <strong>${PanelUtils.escapar(ctx.empresa)}</strong>` +
                    (ctx.ruc ? ` · RUC <strong>${PanelUtils.escapar(ctx.ruc)}</strong>` : "");
            } else {
                infoEmpresa.hidden = true;
                infoEmpresa.innerHTML = "";
            }
        }

        selObra.addEventListener("change", () => {
            mostrarEmpresaIdentificada();
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

/* --------------------------------------------------------
   REQ WORKSPACE — dispatcher del contenedor #req-workspace
   --------------------------------------------------------
   Decide qué submódulo se pinta según la clave de la pestaña.
   "panel-control" y "nuevo-requerimiento" están desarrollados;
   el resto muestran un marcador neutro hasta su fase.
   Centraliza también la navegación interna programática para
   reutilizar la misma navegación que el usuario (sin recargas).
   -------------------------------------------------------- */

/* ==========================================================
   MÓDULO REQUERIMIENTOS — SUBMÓDULO "DOCUMENTOS"
   ----------------------------------------------------------
   Bandeja limpia de documentos generados por el ERP. NO crea
   una segunda base de datos ni otro sistema de documentos:

     · Origen de datos   -> RequerimientosDB.listarExpedientes()
                            (filtrado por estado / entrega).
     · Plantilla / export -> DocumentGenerator (plantilla única
                            oficial: vista previa = impresión =
                            PDF; Word/Excel desde la misma fuente).

   Responsabilidades separadas:
     DocumentosData  -> consulta (bandeja / archivo).
     Documentos      -> interfaz: bandeja, menú ⋮, visor a
                        pantalla completa y envío a Logística.
   El mismo módulo sirve la pestaña "Documentos" (pendientes de
   envío) y "Archivo" (ya enviados a Logística) mediante un modo.
   ========================================================== */

const DocumentosData = (function () {

    // Un expediente es un "documento" cuando fue generado (no es un
    // borrador). Los borradores aún no producen documento oficial.
    function esGenerado(e) {
        return !!e.estado && e.estado !== "borrador";
    }

    // Bandeja "Documentos": generados y todavía no enviados a Logística.
    function bandejaDocumentos() {
        return RequerimientosDB.listarExpedientes()
            .filter((e) => esGenerado(e) && !e.enviadoLogistica);
    }

    // Bandeja "Archivo": ya entregados a Logística.
    function bandejaArchivo() {
        return RequerimientosDB.listarExpedientes()
            .filter((e) => !!e.enviadoLogistica);
    }

    function porModo(modo) {
        return modo === "archivo" ? bandejaArchivo() : bandejaDocumentos();
    }

    return { porModo, bandejaDocumentos, bandejaArchivo };
})();

const Documentos = (function () {

    // Estado de interfaz (no es información de negocio): qué modo se
    // está mostrando y qué documento opera el menú / el visor.
    const estado = { modo: "documentos", codigoMenu: null };
    const visor = { codigo: null, exp: null, escala: 1, anchoNat: 0, altoNat: 0 };

    let handlersGlobales = false;

    /* ---------- Utilidades de presentación ---------- */

    function esc(t) {
        return PanelUtils.escapar(t == null ? "" : t);
    }

    function empresaDe(exp) {
        if (exp.empresaId && typeof ConfiguracionDB !== "undefined") {
            const c = ConfiguracionDB.contextoEmpresa(exp.empresaId);
            if (c && c.nombre) return c.nombre;
        }
        return exp.empresa || "—";
    }

    function fechaCorta(iso) {
        if (!iso) return "—";
        const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso + "T00:00:00" : iso);
        if (isNaN(d.getTime())) return iso;
        return PanelUtils.fecha(d);
    }

    function materialesReales(exp) {
        return (exp.materiales || []).filter((m) => (m.descripcion || "").trim() !== "");
    }

    function expediente(codigo) {
        return RequerimientosDB.expedientePorCodigo(codigo);
    }

    /* ---------- BANDEJA (render) ---------- */

    function filaHTML(exp, modo) {
        const codigo = exp.codigo;
        const titulo = DocumentGenerator.tituloInteligente(exp);
        const estadoTxt = modo === "archivo" ? "Enviado a Logística" : "Por enviar";

        return `
            <tr class="zdoc-bj-row" data-codigo="${esc(codigo)}" tabindex="0">
                <td class="zdoc-bj-cod" data-label="N° Requerimiento">${esc(codigo)}</td>
                <td class="zdoc-bj-tit" data-label="Título">${esc(titulo)}</td>
                <td data-label="Empresa">${esc(empresaDe(exp))}</td>
                <td data-label="Obra">${esc(exp.obra)}</td>
                <td class="zdoc-bj-fecha" data-label="Fecha">${esc(fechaCorta(exp.fecha))}</td>
                <td data-label="Estado"><span class="zdoc-badge zdoc-badge-${modo}">${esc(estadoTxt)}</span></td>
                <td class="zdoc-bj-acc">
                    <button class="zdoc-kebab" type="button" data-zdoc-kebab="${esc(codigo)}" aria-label="Opciones del documento">⋮</button>
                </td>
            </tr>`;
    }

    function vacioHTML(modo) {
        const texto = modo === "archivo"
            ? "Aún no hay documentos enviados a Logística. Cuando envíes un documento desde la bandeja, aparecerá aquí."
            : "No hay documentos generados. Crea un requerimiento para generar su documento oficial.";
        return `
            <div class="zdoc-vacio">
                <div class="zdoc-vacio-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 12.5h5M9.5 16h5"/></svg>
                </div>
                <p class="zdoc-vacio-text">${texto}</p>
            </div>`;
    }

    function render(modo) {
        estado.modo = modo === "archivo" ? "archivo" : "documentos";
        const lista = DocumentosData.porModo(estado.modo);

        const titulo = estado.modo === "archivo" ? "Archivo" : "Documentos";
        const subtitulo = estado.modo === "archivo"
            ? "Documentos enviados a Logística."
            : "Bandeja de documentos generados por el ERP.";

        const cuerpo = lista.length
            ? `
            <div class="zdoc-bj-wrap zv-no-scrollbar">
                <table class="zdoc-bj">
                    <thead>
                        <tr>
                            <th>N° Requerimiento</th>
                            <th>Título</th>
                            <th>Empresa</th>
                            <th>Obra</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th class="zdoc-bj-acc"></th>
                        </tr>
                    </thead>
                    <tbody>${lista.map((e) => filaHTML(e, estado.modo)).join("")}</tbody>
                </table>
            </div>`
            : vacioHTML(estado.modo);

        return `
            <section class="zdoc-bandeja">
                <header class="zdoc-bandeja-head">
                    <h2 class="zdoc-bandeja-title">${titulo}</h2>
                    <p class="zdoc-bandeja-sub">${subtitulo}</p>
                </header>
                ${cuerpo}
            </section>`;
    }

    /* ---------- MENÚ DE TRES PUNTOS (⋮) ---------- */

    function menuNode() {
        let m = document.getElementById("zdoc-menu");
        if (m) return m;

        m = document.createElement("div");
        m.id = "zdoc-menu";
        m.className = "zdoc-menu";
        m.hidden = true;
        m.innerHTML = `
            <button type="button" class="zdoc-menu-item" data-act="preview">Vista previa</button>
            <div class="zdoc-menu-group">
                <button type="button" class="zdoc-menu-item zdoc-menu-haschild" data-act="export-toggle">
                    <span>Exportar</span><span class="zdoc-menu-caret">▸</span>
                </button>
                <div class="zdoc-submenu" hidden>
                    <button type="button" class="zdoc-menu-item" data-act="export" data-fmt="pdf">PDF</button>
                    <button type="button" class="zdoc-menu-item" data-act="export" data-fmt="excel">Excel</button>
                    <button type="button" class="zdoc-menu-item" data-act="export" data-fmt="word">Word</button>
                </div>
            </div>
            <button type="button" class="zdoc-menu-item" data-act="print">Imprimir</button>
            <button type="button" class="zdoc-menu-item zdoc-menu-send" data-act="logistica">Enviar a Logística</button>`;

        document.body.appendChild(m);
        m.addEventListener("click", onMenuClick);
        return m;
    }

    function cerrarMenu() {
        const m = document.getElementById("zdoc-menu");
        if (m && !m.hidden) {
            m.hidden = true;
            const sub = m.querySelector(".zdoc-submenu");
            if (sub) sub.hidden = true;
        }
        estado.codigoMenu = null;
    }

    function abrirMenu(btn, codigo) {
        const m = menuNode();
        estado.codigoMenu = codigo;

        // "Enviar a Logística" solo aplica a la bandeja Documentos.
        m.querySelector('[data-act="logistica"]').hidden = (estado.modo !== "documentos");
        m.querySelector(".zdoc-submenu").hidden = true;

        m.hidden = false;

        const r = btn.getBoundingClientRect();
        const mw = m.offsetWidth;
        const mh = m.offsetHeight;

        let left = r.right - mw;
        if (left < 8) left = 8;

        let top = r.bottom + 6;
        if (top + mh > window.innerHeight - 8) top = r.top - mh - 6;
        if (top < 8) top = 8;

        m.style.left = left + "px";
        m.style.top = top + "px";
    }

    function onMenuClick(evento) {
        const item = evento.target.closest(".zdoc-menu-item");
        if (!item) return;

        const act = item.dataset.act;

        if (act === "export-toggle") {
            const sub = item.parentElement.querySelector(".zdoc-submenu");
            if (sub) sub.hidden = !sub.hidden;
            return;
        }

        const codigo = estado.codigoMenu;
        cerrarMenu();
        if (!codigo) return;

        if (act === "preview") abrirVisor(codigo);
        else if (act === "print") imprimir(codigo);
        else if (act === "export") exportar(codigo, item.dataset.fmt);
        else if (act === "logistica") enviarLogistica(codigo);
    }

    /* ---------- VISOR DOCUMENTAL A PANTALLA COMPLETA ---------- */

    function visorNode() {
        let v = document.getElementById("zviewer");
        if (v) return v;

        v = document.createElement("div");
        v.id = "zviewer";
        v.className = "zviewer";
        v.hidden = true;
        v.innerHTML = `
            <div class="zviewer-bar">
                <div class="zviewer-info">
                    <span class="zviewer-title" id="zviewer-title"></span>
                    <span class="zviewer-sub" id="zviewer-sub"></span>
                </div>
                <div class="zviewer-tools">
                    <button type="button" class="zviewer-btn" data-zv="zoom-out" aria-label="Alejar">−</button>
                    <button type="button" class="zviewer-btn zviewer-zoom" data-zv="fit" aria-label="Ajustar">100%</button>
                    <button type="button" class="zviewer-btn" data-zv="zoom-in" aria-label="Acercar">+</button>
                    <span class="zviewer-sep"></span>
                    <button type="button" class="zviewer-btn" data-zv="print">Imprimir</button>
                    <button type="button" class="zviewer-btn" data-zv="pdf">PDF</button>
                    <span class="zviewer-sep"></span>
                    <button type="button" class="zviewer-btn zviewer-close" data-zv="close" aria-label="Cerrar">✕</button>
                </div>
            </div>
            <div class="zviewer-stage zv-no-scrollbar" id="zviewer-stage">
                <div class="zviewer-canvas" id="zviewer-canvas"></div>
            </div>`;

        document.body.appendChild(v);
        v.addEventListener("click", onVisorClick);

        // Zoom con rueda + Ctrl (escritorio).
        const stage = v.querySelector("#zviewer-stage");
        stage.addEventListener("wheel", (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            aplicarZoom(visor.escala * (e.deltaY < 0 ? 1.1 : 0.9));
        }, { passive: false });

        return v;
    }

    function paginaVisor() {
        // El documento puede tener una o varias páginas: se opera sobre
        // el contenedor .zdoc-doc para medir/escalar todo el conjunto.
        return document.querySelector("#zviewer-canvas .zdoc-doc");
    }

    function medirPagina() {
        const page = paginaVisor();
        if (!page) return;
        page.style.transform = "none";
        visor.anchoNat = page.offsetWidth;
        visor.altoNat = page.offsetHeight;
    }

    function aplicarZoom(escala) {
        const page = paginaVisor();
        const canvas = document.getElementById("zviewer-canvas");
        if (!page || !canvas) return;

        visor.escala = Math.min(3, Math.max(0.25, escala));

        page.style.transformOrigin = "top left";
        page.style.transform = `scale(${visor.escala})`;

        canvas.style.width = (visor.anchoNat * visor.escala) + "px";
        canvas.style.height = (visor.altoNat * visor.escala) + "px";

        const lbl = document.querySelector('[data-zv="fit"]');
        if (lbl) lbl.textContent = Math.round(visor.escala * 100) + "%";
    }

    // Ajusta el documento al ancho disponible (sin superar el 100 %).
    function ajustarVisor() {
        const stage = document.getElementById("zviewer-stage");
        if (!stage || !visor.anchoNat) return;
        const disponible = stage.clientWidth - 48;
        const escala = Math.min(1, disponible / visor.anchoNat);
        aplicarZoom(escala > 0 ? escala : 1);
        stage.scrollTop = 0;
    }

    function abrirVisor(codigo) {
        const exp = expediente(codigo);
        if (!exp) { toast("No se encontró el documento.", "error"); return; }

        const v = visorNode();
        visor.codigo = codigo;
        visor.exp = exp;

        v.querySelector("#zviewer-title").textContent = DocumentGenerator.tituloInteligente(exp);
        v.querySelector("#zviewer-sub").textContent = `${exp.codigo} · ${exp.obra || ""}`.trim();
        v.querySelector("#zviewer-canvas").innerHTML = DocumentGenerator.plantillaHTML(exp);

        v.hidden = false;
        document.body.classList.add("zviewer-open");

        // Espera al layout para medir el tamaño real de la página A4.
        requestAnimationFrame(() => { medirPagina(); ajustarVisor(); });
    }

    function cerrarVisor() {
        const v = document.getElementById("zviewer");
        if (v) v.hidden = true;
        document.body.classList.remove("zviewer-open");
        visor.codigo = null;
        visor.exp = null;
    }

    function onVisorClick(evento) {
        const btn = evento.target.closest("[data-zv]");
        if (!btn) return;

        const accion = btn.dataset.zv;

        if (accion === "close") cerrarVisor();
        else if (accion === "zoom-in") aplicarZoom(visor.escala * 1.2);
        else if (accion === "zoom-out") aplicarZoom(visor.escala / 1.2);
        else if (accion === "fit") ajustarVisor();
        else if (accion === "print" && visor.exp) DocumentGenerator.imprimir(visor.exp);
        else if (accion === "pdf" && visor.exp) DocumentGenerator.exportarPDF(visor.exp);
    }

    /* ---------- ACCIONES ---------- */

    function imprimir(codigo) {
        const exp = expediente(codigo);
        if (exp) DocumentGenerator.imprimir(exp);
    }

    function exportar(codigo, formato) {
        const exp = expediente(codigo);
        if (!exp) return;
        if (formato === "pdf") DocumentGenerator.exportarPDF(exp);
        else if (formato === "excel") DocumentGenerator.exportarExcel(exp);
        else if (formato === "word") DocumentGenerator.exportarWord(exp);
    }

    // Validación previa al envío: el documento debe estar completo.
    function validar(exp) {
        const faltan = [];
        if (!exp.obra) faltan.push("obra");
        if (!exp.requeridoPor) faltan.push("requerido por");
        if (!exp.recibidoPor) faltan.push("recibido por");
        if (!exp.lugarEntrega) faltan.push("lugar de entrega");
        if (!exp.fecha) faltan.push("fecha");
        if (materialesReales(exp).length === 0) faltan.push("materiales");
        return faltan;
    }

    function enviarLogistica(codigo) {
        const exp = expediente(codigo);
        if (!exp) { toast("No se encontró el documento.", "error"); return; }

        const faltan = validar(exp);
        if (faltan.length) {
            toast(`No se puede enviar: faltan datos (${faltan.join(", ")}).`, "error");
            return;
        }

        if (!confirm(`¿Enviar el documento ${codigo} a Logística?\n\nSe moverá automáticamente al Archivo y dejará la bandeja Documentos.`)) {
            return;
        }

        // El título se congela con el valor calculado mientras el
        // documento estaba abierto (contenido consolidado).
        const tituloFinal = DocumentGenerator.tituloInteligente(exp);
        RequerimientosDB.marcarEnviadoLogistica(codigo, tituloFinal);
        toast(`Documento ${codigo} enviado a Logística y archivado.`, "ok");
        refrescar();
    }

    /* ---------- TOAST (aviso transitorio) ---------- */

    function toast(mensaje, tipo) {
        let t = document.getElementById("zdoc-toast");
        if (!t) {
            t = document.createElement("div");
            t.id = "zdoc-toast";
            t.className = "zdoc-toast";
            document.body.appendChild(t);
        }
        t.className = `zdoc-toast is-${tipo === "error" ? "error" : "ok"} is-visible`;
        t.textContent = mensaje;

        clearTimeout(toast._t);
        toast._t = setTimeout(() => { t.classList.remove("is-visible"); }, 3200);
    }

    /* ---------- MONTAJE / WIRING ---------- */

    // Vuelve a pintar la bandeja del modo actual (tras un envío).
    function refrescar() {
        const ws = document.getElementById("req-workspace");
        if (!ws) return;
        ws.innerHTML = render(estado.modo);
        montar(ws, estado.modo);
    }

    function asegurarHandlersGlobales() {
        if (handlersGlobales) return;
        handlersGlobales = true;

        // Cerrar el menú al hacer clic fuera de él (y fuera del kebab).
        document.addEventListener("mousedown", (e) => {
            const m = document.getElementById("zdoc-menu");
            if (!m || m.hidden) return;
            if (e.target.closest("#zdoc-menu") || e.target.closest("[data-zdoc-kebab]")) return;
            cerrarMenu();
        });

        window.addEventListener("resize", () => {
            cerrarMenu();
            const v = document.getElementById("zviewer");
            if (v && !v.hidden) { medirPagina(); ajustarVisor(); }
        });

        document.addEventListener("scroll", cerrarMenu, true);

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            const v = document.getElementById("zviewer");
            if (v && !v.hidden) cerrarVisor();
            else cerrarMenu();
        });
    }

    function montar(ws, modo) {
        estado.modo = modo === "archivo" ? "archivo" : "documentos";
        asegurarHandlersGlobales();

        // La delegación se enlaza UNA sola vez al contenedor persistente
        // (#req-workspace); el manejador lee siempre el modo actual. Así
        // se evita acumular listeners en cada render / refresco.
        if (ws.dataset.zdocReady) return;
        ws.dataset.zdocReady = "true";

        ws.addEventListener("click", (evento) => {
            const kebab = evento.target.closest("[data-zdoc-kebab]");
            if (kebab) {
                evento.stopPropagation();
                abrirMenu(kebab, kebab.dataset.zdocKebab);
                return;
            }

            // Clic en la fila (no en el kebab) abre la vista previa.
            const fila = evento.target.closest(".zdoc-bj-row");
            if (fila) abrirVisor(fila.dataset.codigo);
        });

        // Accesibilidad: Enter sobre una fila abre la vista previa.
        ws.addEventListener("keydown", (evento) => {
            if (evento.key !== "Enter") return;
            const fila = evento.target.closest(".zdoc-bj-row");
            if (fila) { evento.preventDefault(); abrirVisor(fila.dataset.codigo); }
        });
    }

    return { render, montar, refrescar, abrirVisor };
})();

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
            ws.innerHTML = Documentos.render("documentos");
            Documentos.montar(ws, "documentos");
        } else if (claveTab === "archivo") {
            ws.innerHTML = Documentos.render("archivo");
            Documentos.montar(ws, "archivo");
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
   MÓDULO "CONFIGURACIÓN GENERAL" — NÚCLEO DEL ERP
   ----------------------------------------------------------
   Única fuente de verdad (Single Source of Truth) de las
   empresas y sus obras. Todos los demás módulos
   (Requerimientos, Compras, Documentos, Reportes, etc.) SOLO
   consultan esta información; nunca la modifican. Así se evita
   por completo la duplicación de datos.

   Arquitectura (cada pieza, una sola responsabilidad):

     ConfiguracionDB        -> capa de datos / persistencia.
                               API asíncrona (Promesas) preparada
                               para sustituir el backend local por
                               Supabase sin tocar la interfaz.
     ConfiguracionGeneral   -> componente de interfaz (lista +
                               editor) con renderizado quirúrgico
                               para no perder el foco al escribir.

   Se REUTILIZA la arquitectura existente: vista del Dashboard
   (#view-configuracion), tokens CSS (--dash-*), navegación por
   ruta (/configuracion) y el patrón de delegación de eventos.
   No se modifica el menú lateral ni el Router.
   ========================================================== */

/* --------------------------------------------------------
   CAPA DE DATOS: ConfiguracionDB
   --------------------------------------------------------
   Hoy persiste en localStorage. La API pública es asíncrona
   para que la migración a Supabase sea transparente: basta
   reemplazar el cuerpo de cada método por la llamada
   equivalente del cliente (supabaseClient.from(...)).

   Esquema relacional sugerido en Supabase (con RLS activo):

     empresas (
       id            uuid primary key default gen_random_uuid(),
       nombre        text not null,
       ruc           text not null,
       estado        text not null default 'activa',
       logo          text,                 -- URL en Storage o dataURL
       creado_en     timestamptz default now(),
       actualizado_en timestamptz default now()
     )

     obras (
       id            uuid primary key default gen_random_uuid(),
       empresa_id    uuid references empresas(id) on delete cascade,
       codigo        text not null,        -- identificador interno
       nombre        text not null,
       departamento  text,
       provincia     text,
       distrito      text,
       estado        text not null default 'activa'
     )
   -------------------------------------------------------- */

const ConfiguracionDB = (function () {

    const CLAVE = "zovrake_cfg_empresas";

    // --- Acceso seguro a localStorage (degrada sin romper) ---

    function leerTodo() {
        try {
            const valor = localStorage.getItem(CLAVE);
            const lista = valor ? JSON.parse(valor) : [];
            return Array.isArray(lista) ? lista : [];
        } catch (error) {
            console.warn("[Zovrake] No se pudo leer la configuración:", error);
            return [];
        }
    }

    function escribirTodo(lista) {
        try {
            localStorage.setItem(CLAVE, JSON.stringify(lista));
            return true;
        } catch (error) {
            console.warn("[Zovrake] No se pudo guardar la configuración:", error);
            return false;
        }
    }

    function uid(prefijo) {
        return (
            prefijo + "-" +
            Date.now().toString(36) + "-" +
            Math.random().toString(36).slice(2, 8)
        );
    }

    // Normaliza una empresa para garantizar una forma estable
    // aunque el almacenamiento provenga de una versión anterior.
    function normalizar(empresa) {
        const e = empresa || {};
        return {
            id: e.id || uid("emp"),
            nombre: e.nombre || "",
            ruc: e.ruc || "",
            estado: e.estado === "inactiva" ? "inactiva" : "activa",
            logo: e.logo || null,
            obras: Array.isArray(e.obras) ? e.obras.map(normalizarObra) : [],
            creadoEn: e.creadoEn || new Date().toISOString(),
            actualizadoEn: e.actualizadoEn || new Date().toISOString()
        };
    }

    function normalizarObra(obra) {
        const o = obra || {};
        return {
            id: o.id || uid("obr"),
            codigo: o.codigo || "",
            nombre: o.nombre || "",
            departamento: o.departamento || "",
            provincia: o.provincia || "",
            distrito: o.distrito || "",
            estado: o.estado === "inactiva" ? "inactiva" : "activa"
        };
    }

    // --- API pública (asíncrona, lista para Supabase) ---

    async function listarEmpresas() {
        return leerTodo().map(normalizar);
    }

    async function obtenerEmpresa(id) {
        return leerTodo().map(normalizar).find((e) => e.id === id) || null;
    }

    // Crea o actualiza una empresa completa (incluidas sus obras).
    // Se usa al pulsar "Guardar Configuración".
    async function guardarEmpresa(empresa) {
        const lista = leerTodo();
        const limpia = normalizar(empresa);
        limpia.actualizadoEn = new Date().toISOString();

        const indice = lista.findIndex((e) => e.id === limpia.id);

        if (indice >= 0) {
            lista[indice] = limpia;
        } else {
            limpia.creadoEn = new Date().toISOString();
            lista.push(limpia);
        }

        escribirTodo(lista);
        return limpia;
    }

    async function eliminarEmpresa(id) {
        const lista = leerTodo().filter((e) => e.id !== id);
        escribirTodo(lista);
        return true;
    }

    // Cambia únicamente el estado (activa/inactiva) sin abrir el editor.
    async function cambiarEstadoEmpresa(id, estado) {
        const lista = leerTodo();
        const indice = lista.findIndex((e) => e.id === id);
        if (indice >= 0) {
            lista[indice].estado = estado === "inactiva" ? "inactiva" : "activa";
            lista[indice].actualizadoEn = new Date().toISOString();
            escribirTodo(lista);
        }
        return true;
    }

    // Genera una empresa nueva en memoria (aún sin persistir).
    function nuevaEmpresa() {
        return {
            id: uid("emp"),
            nombre: "",
            ruc: "",
            estado: "activa",
            logo: null,
            obras: [],
            creadoEn: null,
            actualizadoEn: null
        };
    }

    // Genera una obra nueva en memoria con su identificador interno
    // (uid). Ese código nunca aparece en documentos: solo relaciona
    // la obra con su empresa dentro del sistema.
    function nuevaObra() {
        return {
            id: uid("obr"),
            codigo: uid("OBR").toUpperCase(),
            nombre: "",
            departamento: "",
            provincia: "",
            distrito: "",
            estado: "activa"
        };
    }

    /* --- Lectura para OTROS módulos (solo consulta, síncrona) ---
       Estos accesores permiten que módulos como Nuevo Requerimiento
       o el futuro Documentos consulten las obras y los datos de
       empresa registrados, sin duplicar información. Son síncronos
       porque hoy leen de localStorage; al migrar a Supabase basta
       con alimentar una caché en memoria desde la capa asíncrona y
       estos métodos seguirán sirviendo a los consumidores. */

    // Catálogo de obras para selección, agrupado por empresa.
    // Por defecto solo incluye empresas y obras ACTIVAS.
    function catalogoObras(opciones) {
        const incluirInactivas = !!(opciones && opciones.incluirInactivas);
        return leerTodo()
            .map(normalizar)
            .filter((e) => incluirInactivas || e.estado === "activa")
            .map((e) => ({
                empresaId: e.id,
                empresa: e.nombre,
                ruc: e.ruc,
                logo: e.logo,
                obras: e.obras.filter((o) => incluirInactivas || o.estado === "activa")
            }))
            .filter((g) => g.obras.length > 0);
    }

    // ¿Existe al menos una obra activa registrada?
    function hayObrasRegistradas() {
        return catalogoObras().length > 0;
    }

    // Contexto de empresa (nombre, RUC, logo) a partir de su id.
    // Lo usará el submódulo Documentos para resolver el logo en vivo
    // sin guardar copias del mismo en cada expediente.
    function contextoEmpresa(empresaId) {
        const e = leerTodo().map(normalizar).find((x) => x.id === empresaId);
        if (!e) return null;
        return { id: e.id, nombre: e.nombre, ruc: e.ruc, logo: e.logo };
    }

    // Contexto completo (empresa + obra) a partir de los ids.
    function contextoObra(empresaId, obraId) {
        const e = leerTodo().map(normalizar).find((x) => x.id === empresaId);
        if (!e) return null;
        const obra = e.obras.find((o) => o.id === obraId) || null;
        return {
            empresaId: e.id,
            empresa: e.nombre,
            ruc: e.ruc,
            logo: e.logo,
            obra
        };
    }

    return {
        listarEmpresas,
        obtenerEmpresa,
        guardarEmpresa,
        eliminarEmpresa,
        cambiarEstadoEmpresa,
        nuevaEmpresa,
        nuevaObra,
        catalogoObras,
        hayObrasRegistradas,
        contextoEmpresa,
        contextoObra
    };
})();

/* --------------------------------------------------------
   COMPONENTE DE INTERFAZ: ConfiguracionGeneral
   --------------------------------------------------------
   Controla dos vistas dentro de #cfg-root:
     • Lista de empresas registradas.
     • Editor de una empresa (datos de Empresa + Obras) y
       "Guardar".

   Renderizado quirúrgico: los campos de texto no re-renderizan
   el formulario (no se pierde el foco); solo se actualiza la
   zona afectada (logo u obras).
   -------------------------------------------------------- */

const ConfiguracionGeneral = (function () {

    // Estado interno del componente (no es información de negocio:
    // solo describe qué se está mostrando en pantalla).
    const estado = {
        vista: "lista",      // "lista" | "editor"
        empresa: null,       // borrador en edición (copia de trabajo)
        esNuevo: false,
        tab: "empresa",      // empresa | obras
        obraEnEdicion: null  // id de la obra que se está editando, o null
    };

    /* ---------- Utilidades ---------- */

    function root() {
        return document.getElementById("cfg-root");
    }

    function esc(texto) {
        return String(texto == null ? "" : texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function rucValido(ruc) {
        return /^\d{11}$/.test(String(ruc || "").trim());
    }

    function obrasActivas(empresa) {
        return (empresa.obras || []).filter((o) => o.estado === "activa").length;
    }

    /* ---------- ICONOS (SVG inline, coherentes con el Dashboard) ---------- */

    const ICONOS = {
        empresa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20.5h16"/><path d="M6 20.5V5.5A1.5 1.5 0 0 1 7.5 4h6A1.5 1.5 0 0 1 15 5.5v15"/><path d="M15 9h2.5A1.5 1.5 0 0 1 19 10.5v10"/><path d="M9 8h3M9 11.5h3M9 15h3"/></svg>',
        obras: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V8l5-3 5 3v13"/><path d="M15 21V11l4 2.2V21"/><path d="M8.5 9.5h0M8.5 13h0M8.5 16.5h0"/></svg>',
        mas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
        editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10a2 2 0 0 0-2.8-2.8L5 17.2V20Z"/><path d="m13.5 6.5 4 4"/></svg>',
        eliminar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M6 7v12.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7"/><path d="M10 11v6M14 11v6"/></svg>',
        volver: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>'
    };

    /* ====================================================
       VISTA 1 — LISTA DE CONFIGURACIONES EMPRESARIALES
       ==================================================== */

    function tarjetaEmpresaHTML(empresa) {
        const activa = empresa.estado === "activa";
        const logo = empresa.logo
            ? `<img src="${esc(empresa.logo)}" alt="Logo de ${esc(empresa.nombre)}">`
            : `<span class="cfg-logo-fallback">${esc((empresa.nombre || "?").charAt(0).toUpperCase())}</span>`;

        return `
            <article class="cfg-card" data-cfg-empresa="${esc(empresa.id)}">
                <div class="cfg-card-top">
                    <div class="cfg-card-logo">
                        ${logo}
                    </div>
                    <span class="cfg-badge ${activa ? "is-activa" : "is-inactiva"}">
                        ${activa ? "Activa" : "Inactiva"}
                    </span>
                </div>

                <h3 class="cfg-card-name">${esc(empresa.nombre) || "Sin nombre"}</h3>
                <p class="cfg-card-ruc">RUC: ${esc(empresa.ruc) || "—"}</p>

                <div class="cfg-card-meta">
                    <span>${empresa.obras.length} obra(s)</span>
                    <span>${obrasActivas(empresa)} activa(s)</span>
                </div>

                <div class="cfg-card-actions">
                    <button class="cfg-btn cfg-btn-primary" type="button" data-cfg-action="editar" data-id="${esc(empresa.id)}">Editar</button>
                    <button class="cfg-btn cfg-btn-ghost" type="button" data-cfg-action="toggle-estado" data-id="${esc(empresa.id)}">
                        ${activa ? "Desactivar" : "Activar"}
                    </button>
                    <button class="cfg-icon-btn cfg-icon-danger" type="button" title="Eliminar" data-cfg-action="eliminar" data-id="${esc(empresa.id)}">
                        ${ICONOS.eliminar}
                    </button>
                </div>
            </article>`;
    }

    function vistaListaHTML(empresas) {
        const tarjetas = empresas.length
            ? empresas.map(tarjetaEmpresaHTML).join("")
            : `
                <div class="cfg-empty">
                    <div class="cfg-empty-icon">${ICONOS.empresa}</div>
                    <h3 class="cfg-empty-title">Comience registrando su primera empresa</h3>
                    <p class="cfg-empty-text">
                        Registre la información de la empresa y las obras con las que trabajará.
                        Esta configuración permitirá que el ERP complete automáticamente la
                        información en los diferentes procesos y documentos del sistema.
                    </p>
                    <button class="cfg-btn cfg-btn-primary" type="button" data-cfg-action="nueva">
                        ${ICONOS.mas} Registrar empresa
                    </button>
                </div>`;

        return `
            <header class="cfg-header">
                <div>
                    <h2 class="dashboard-view-title">Configuración General</h2>
                    <p class="cfg-subtitle">
                        Configure la información principal de su organización para que el ERP pueda
                        automatizar correctamente los procesos, documentos y operaciones de cada una
                        de sus obras.
                    </p>
                </div>
                ${empresas.length ? `
                <button class="cfg-btn cfg-btn-primary" type="button" data-cfg-action="nueva">
                    ${ICONOS.mas} Registrar empresa
                </button>` : ""}
            </header>

            <div class="cfg-grid">
                ${tarjetas}
            </div>`;
    }

    /* ====================================================
       VISTA 2 — EDITOR DE CONFIGURACIÓN
       ==================================================== */

    function vistaEditorHTML() {
        const e = estado.empresa;
        const titulo = estado.esNuevo
            ? "Registrar empresa"
            : (e.nombre || "Editar empresa");

        return `
            <header class="cfg-editor-head">
                <button class="cfg-icon-btn" type="button" data-cfg-action="volver" title="Volver">
                    ${ICONOS.volver}
                </button>
                <div class="cfg-editor-titles">
                    <h2 class="dashboard-view-title">${esc(titulo)}</h2>
                    <p class="cfg-subtitle">Complete los datos de la empresa y registre sus obras. El ERP usará esta información de forma automática.</p>
                </div>
            </header>

            <div class="cfg-editor-grid">
                <div class="cfg-editor-main">
                    <nav class="cfg-tabs zv-no-scrollbar" id="cfg-tabs">
                        <button class="cfg-tab" type="button" data-cfg-tab="empresa">${ICONOS.empresa}<span>Empresa</span></button>
                        <button class="cfg-tab" type="button" data-cfg-tab="obras">${ICONOS.obras}<span>Obras</span></button>
                    </nav>
                    <div class="cfg-tab-panel" id="cfg-tab-panel"></div>
                </div>
            </div>

            <footer class="cfg-editor-foot">
                <span class="cfg-foot-msg" id="cfg-foot-msg"></span>
                <div class="cfg-foot-actions">
                    <button class="cfg-btn cfg-btn-ghost" type="button" data-cfg-action="volver">Cancelar</button>
                    <button class="cfg-btn cfg-btn-primary" type="button" data-cfg-action="guardar">Guardar</button>
                </div>
            </footer>`;
    }

    /* ---------- TAB: INFORMACIÓN DE LA EMPRESA ---------- */

    function logoBoxHTML() {
        const e = estado.empresa;
        const contenido = e.logo
            ? `<img src="${esc(e.logo)}" alt="Logo">`
            : `<div class="cfg-logo-placeholder">
                    ${ICONOS.empresa}
                    <span>Sin logo</span>
               </div>`;

        return `
            <div class="cfg-logo-preview">${contenido}</div>
            <div class="cfg-logo-controls">
                <button class="cfg-btn cfg-btn-soft" type="button" data-cfg-action="logo-subir">
                    ${e.logo ? "Reemplazar imagen" : "Subir imagen"}
                </button>
                ${e.logo ? `<button class="cfg-btn cfg-btn-ghost" type="button" data-cfg-action="logo-eliminar">Eliminar</button>` : ""}
                <p class="cfg-hint">Formatos PNG, JPG o SVG (máx. 1.5 MB). El logo se ajustará automáticamente conservando su proporción; no necesita modificar su tamaño.</p>
            </div>`;
    }

    function tabEmpresaHTML() {
        const e = estado.empresa;
        return `
            <div class="cfg-section">
                <h3 class="cfg-section-title">Información de la empresa</h3>

                <div class="cfg-logo-box" id="cfg-logo-box">
                    ${logoBoxHTML()}
                </div>

                <div class="cfg-form-grid">
                    <label class="cfg-field">
                        <span class="cfg-label">Nombre de la empresa <i>*</i></span>
                        <input class="cfg-input" type="text" data-cfg-field="nombre" value="${esc(e.nombre)}" placeholder="Ej. Constructora Andina S.A.C." maxlength="120">
                    </label>

                    <label class="cfg-field">
                        <span class="cfg-label">RUC <i>*</i></span>
                        <input class="cfg-input" type="text" inputmode="numeric" data-cfg-field="ruc" value="${esc(e.ruc)}" placeholder="11 dígitos" maxlength="11">
                    </label>

                    <label class="cfg-field">
                        <span class="cfg-label">Estado</span>
                        <select class="cfg-input" data-cfg-field="estado">
                            <option value="activa" ${e.estado === "activa" ? "selected" : ""}>Activa</option>
                            <option value="inactiva" ${e.estado === "inactiva" ? "selected" : ""}>Inactiva</option>
                        </select>
                    </label>
                </div>
            </div>`;
    }

    /* ---------- TAB: OBRAS ---------- */

    function filaObraHTML(obra) {
        const activa = obra.estado === "activa";
        return `
            <tr data-cfg-obra="${esc(obra.id)}">
                <td><span class="cfg-codigo" title="Identificador interno del sistema">Interno</span></td>
                <td class="cfg-td-strong">${esc(obra.nombre) || "—"}</td>
                <td>${esc(obra.departamento) || "—"}</td>
                <td>${esc(obra.provincia) || "—"}</td>
                <td>${esc(obra.distrito) || "—"}</td>
                <td>
                    <span class="cfg-badge ${activa ? "is-activa" : "is-inactiva"}">
                        ${activa ? "Activa" : "Inactiva"}
                    </span>
                </td>
                <td class="cfg-td-actions">
                    <button class="cfg-icon-btn" type="button" title="Editar" data-cfg-action="obra-editar" data-id="${esc(obra.id)}">${ICONOS.editar}</button>
                    <button class="cfg-icon-btn" type="button" title="${activa ? "Desactivar" : "Activar"}" data-cfg-action="obra-toggle" data-id="${esc(obra.id)}">
                        ${activa ? "⏸" : "▶"}
                    </button>
                    <button class="cfg-icon-btn cfg-icon-danger" type="button" title="Eliminar" data-cfg-action="obra-eliminar" data-id="${esc(obra.id)}">${ICONOS.eliminar}</button>
                </td>
            </tr>`;
    }

    function obrasListHTML() {
        const obras = estado.empresa.obras;
        if (!obras.length) {
            return `<p class="cfg-hint cfg-obras-empty">Todavía no hay obras registradas para esta empresa.</p>`;
        }
        return `
            <div class="cfg-table-wrap">
                <table class="cfg-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre de la obra</th>
                            <th>Departamento</th>
                            <th>Provincia</th>
                            <th>Distrito</th>
                            <th>Estado</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${obras.map(filaObraHTML).join("")}
                    </tbody>
                </table>
            </div>`;
    }

    function tabObrasHTML() {
        const editando = estado.obraEnEdicion;
        const obra = editando
            ? estado.empresa.obras.find((o) => o.id === editando)
            : null;

        return `
            <div class="cfg-section">
                <h3 class="cfg-section-title">Obras de la empresa</h3>
                <p class="cfg-hint">Cada obra recibe un identificador interno automático que el sistema usa para relacionarla con su empresa. Nunca aparece en los documentos.</p>

                <div class="cfg-obra-form" id="cfg-obra-form">
                    <div class="cfg-form-grid">
                        <label class="cfg-field cfg-field-wide">
                            <span class="cfg-label">Nombre de la obra <i>*</i></span>
                            <input class="cfg-input" type="text" data-cfg-obra-field="nombre" value="${obra ? esc(obra.nombre) : ""}" placeholder="Ej. Edificio Torre Norte">
                        </label>
                        <label class="cfg-field">
                            <span class="cfg-label">Departamento</span>
                            <input class="cfg-input" type="text" data-cfg-obra-field="departamento" value="${obra ? esc(obra.departamento) : ""}" placeholder="Opcional">
                        </label>
                        <label class="cfg-field">
                            <span class="cfg-label">Provincia</span>
                            <input class="cfg-input" type="text" data-cfg-obra-field="provincia" value="${obra ? esc(obra.provincia) : ""}" placeholder="Opcional">
                        </label>
                        <label class="cfg-field">
                            <span class="cfg-label">Distrito</span>
                            <input class="cfg-input" type="text" data-cfg-obra-field="distrito" value="${obra ? esc(obra.distrito) : ""}" placeholder="Opcional">
                        </label>
                        <label class="cfg-field">
                            <span class="cfg-label">Estado</span>
                            <select class="cfg-input" data-cfg-obra-field="estado">
                                <option value="activa" ${!obra || obra.estado === "activa" ? "selected" : ""}>Activa</option>
                                <option value="inactiva" ${obra && obra.estado === "inactiva" ? "selected" : ""}>Inactiva</option>
                            </select>
                        </label>
                    </div>
                    <div class="cfg-obra-form-actions">
                        ${editando ? `<button class="cfg-btn cfg-btn-ghost" type="button" data-cfg-action="obra-cancelar">Cancelar</button>` : ""}
                        <button class="cfg-btn cfg-btn-primary" type="button" data-cfg-action="${editando ? "obra-actualizar" : "obra-agregar"}">
                            ${editando ? "Actualizar obra" : "Agregar obra"}
                        </button>
                    </div>
                </div>

                <div id="cfg-obras-list">
                    ${obrasListHTML()}
                </div>
            </div>`;
    }

    /* ====================================================
       RENDERIZADO (general y quirúrgico)
       ==================================================== */

    function pintarTabActiva() {
        document.querySelectorAll(".cfg-tab").forEach((t) => {
            t.classList.toggle("active", t.dataset.cfgTab === estado.tab);
        });
    }

    function contenidoTab() {
        switch (estado.tab) {
            case "obras": return tabObrasHTML();
            default:      return tabEmpresaHTML();
        }
    }

    function pintarTab() {
        const panel = document.getElementById("cfg-tab-panel");
        if (panel) panel.innerHTML = contenidoTab();
        pintarTabActiva();
    }

    function pintarLogo() {
        const box = document.getElementById("cfg-logo-box");
        if (box) box.innerHTML = logoBoxHTML();
    }

    function pintarObras() {
        const cont = document.getElementById("cfg-obras-list");
        if (cont) cont.innerHTML = obrasListHTML();
    }

    function mensajePie(texto, tipo) {
        const msg = document.getElementById("cfg-foot-msg");
        if (!msg) return;
        msg.textContent = texto || "";
        msg.className = "cfg-foot-msg" + (tipo ? " is-" + tipo : "");
    }

    // Render completo de la vista actual.
    async function render() {
        const cont = root();
        if (!cont) return;

        if (estado.vista === "editor") {
            cont.innerHTML = vistaEditorHTML();
            pintarTab();
        } else {
            const empresas = await ConfiguracionDB.listarEmpresas();
            cont.innerHTML = vistaListaHTML(empresas);
        }

        cont.scrollTop = 0;
    }

    /* ====================================================
       ACCIONES
       ==================================================== */

    function abrirEditor(empresa, esNuevo) {
        // Copia profunda para trabajar sobre un borrador y no mutar
        // el almacenamiento hasta pulsar "Guardar".
        estado.empresa = JSON.parse(JSON.stringify(empresa));
        estado.esNuevo = !!esNuevo;
        estado.vista = "editor";
        estado.tab = "empresa";
        estado.obraEnEdicion = null;
        render();
    }

    async function editarEmpresa(id) {
        const empresa = await ConfiguracionDB.obtenerEmpresa(id);
        if (empresa) abrirEditor(empresa, false);
    }

    function nuevaConfiguracion() {
        abrirEditor(ConfiguracionDB.nuevaEmpresa(), true);
    }

    async function alternarEstadoEmpresa(id) {
        const empresa = await ConfiguracionDB.obtenerEmpresa(id);
        if (!empresa) return;
        const nuevo = empresa.estado === "activa" ? "inactiva" : "activa";
        await ConfiguracionDB.cambiarEstadoEmpresa(id, nuevo);
        render();
    }

    async function eliminarConfiguracion(id) {
        const empresa = await ConfiguracionDB.obtenerEmpresa(id);
        const nombre = empresa ? (empresa.nombre || "esta empresa") : "esta empresa";
        if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
        await ConfiguracionDB.eliminarEmpresa(id);
        render();
    }

    function volverALista() {
        const e = estado.empresa;
        const conDatos = e && (e.nombre || e.ruc || e.logo || e.obras.length);
        if (estado.esNuevo && conDatos && !confirm("¿Descartar los datos sin guardar?")) {
            return;
        }
        estado.vista = "lista";
        estado.empresa = null;
        render();
    }

    async function guardarConfiguracion() {
        const e = estado.empresa;
        const errores = [];

        if (!e.nombre.trim()) errores.push("Indica el nombre de la empresa.");
        if (!rucValido(e.ruc)) errores.push("El RUC debe tener 11 dígitos numéricos.");

        if (errores.length) {
            mensajePie(errores[0], "error");
            if (estado.tab !== "empresa") {
                estado.tab = "empresa";
                pintarTab();
            }
            return;
        }

        const guardada = await ConfiguracionDB.guardarEmpresa(e);
        estado.empresa = JSON.parse(JSON.stringify(guardada));
        estado.esNuevo = false;
        mensajePie("Empresa guardada correctamente.", "ok");

        // Tras guardar, regresa a la lista para reflejar el cambio.
        setTimeout(() => {
            estado.vista = "lista";
            estado.empresa = null;
            render();
        }, 650);
    }

    /* ---------- Logo ---------- */

    function dispararSelectorLogo() {
        const input = document.getElementById("cfg-logo-input");
        if (input) input.click();
    }

    function procesarArchivoLogo(archivo) {
        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            mensajePie("El archivo debe ser una imagen.", "error");
            return;
        }
        if (archivo.size > 1.5 * 1024 * 1024) {
            mensajePie("La imagen supera 1.5 MB.", "error");
            return;
        }

        const lector = new FileReader();
        lector.onload = () => {
            estado.empresa.logo = lector.result;
            pintarLogo();
            mensajePie("");
        };
        lector.onerror = () => mensajePie("No se pudo leer la imagen.", "error");
        lector.readAsDataURL(archivo);
    }

    function eliminarLogo() {
        estado.empresa.logo = null;
        pintarLogo();
    }

    /* ---------- Obras ---------- */

    function leerFormularioObra() {
        const panel = document.getElementById("cfg-obra-form");
        if (!panel) return null;
        const lee = (campo) => {
            const el = panel.querySelector(`[data-cfg-obra-field="${campo}"]`);
            return el ? el.value.trim() : "";
        };
        return {
            nombre: lee("nombre"),
            departamento: lee("departamento"),
            provincia: lee("provincia"),
            distrito: lee("distrito"),
            estado: lee("estado") === "inactiva" ? "inactiva" : "activa"
        };
    }

    function agregarObra() {
        const datos = leerFormularioObra();
        if (!datos || !datos.nombre) {
            mensajePie("La obra necesita un nombre.", "error");
            return;
        }
        const obra = Object.assign(ConfiguracionDB.nuevaObra(), datos);
        estado.empresa.obras.push(obra);
        estado.obraEnEdicion = null;
        pintarTab();        // limpia el formulario y repinta la tabla
        mensajePie("");
    }

    function actualizarObra() {
        const datos = leerFormularioObra();
        if (!datos || !datos.nombre) {
            mensajePie("La obra necesita un nombre.", "error");
            return;
        }
        const obra = estado.empresa.obras.find((o) => o.id === estado.obraEnEdicion);
        if (obra) Object.assign(obra, datos);
        estado.obraEnEdicion = null;
        pintarTab();
        mensajePie("");
    }

    function editarObra(id) {
        estado.obraEnEdicion = id;
        pintarTab();
    }

    function cancelarEdicionObra() {
        estado.obraEnEdicion = null;
        pintarTab();
    }

    function alternarEstadoObra(id) {
        const obra = estado.empresa.obras.find((o) => o.id === id);
        if (obra) obra.estado = obra.estado === "activa" ? "inactiva" : "activa";
        pintarObras();
    }

    function eliminarObra(id) {
        estado.empresa.obras = estado.empresa.obras.filter((o) => o.id !== id);
        if (estado.obraEnEdicion === id) {
            estado.obraEnEdicion = null;
            pintarTab();
        } else {
            pintarObras();
        }
    }

    /* ====================================================
       DELEGACIÓN DE EVENTOS
       ==================================================== */

    function manejarClic(evento) {
        // Cambio de pestaña interna.
        const tab = evento.target.closest(".cfg-tab");
        if (tab) {
            estado.tab = tab.dataset.cfgTab;
            estado.obraEnEdicion = null;
            pintarTab();
            return;
        }

        const accionEl = evento.target.closest("[data-cfg-action]");
        if (!accionEl) return;

        const accion = accionEl.dataset.cfgAction;
        const id = accionEl.dataset.id;

        const acciones = {
            "nueva": nuevaConfiguracion,
            "editar": () => editarEmpresa(id),
            "toggle-estado": () => alternarEstadoEmpresa(id),
            "eliminar": () => eliminarConfiguracion(id),
            "volver": volverALista,
            "guardar": guardarConfiguracion,
            "logo-subir": dispararSelectorLogo,
            "logo-eliminar": eliminarLogo,
            "obra-agregar": agregarObra,
            "obra-actualizar": actualizarObra,
            "obra-cancelar": cancelarEdicionObra,
            "obra-editar": () => editarObra(id),
            "obra-toggle": () => alternarEstadoObra(id),
            "obra-eliminar": () => eliminarObra(id)
        };

        if (acciones[accion]) acciones[accion]();
    }

    // Campos de texto/selección de la empresa: actualizan el borrador
    // SIN repintar el formulario (no se pierde el foco al escribir).
    function manejarEntrada(evento) {
        const campo = evento.target.closest("[data-cfg-field]");
        if (!campo || !estado.empresa) return;

        const clave = campo.dataset.cfgField;
        let valor = campo.value;
        if (clave === "ruc") {
            valor = valor.replace(/\D/g, "").slice(0, 11);
            if (campo.value !== valor) campo.value = valor;
        }
        estado.empresa[clave] = valor;
    }

    /* ====================================================
       ARRANQUE
       ==================================================== */

    function iniciar() {
        const cont = root();
        if (!cont || cont.dataset.iniciado) return;

        cont.addEventListener("click", manejarClic);
        cont.addEventListener("input", manejarEntrada);
        cont.addEventListener("change", manejarEntrada);

        const inputLogo = document.getElementById("cfg-logo-input");
        if (inputLogo) {
            inputLogo.addEventListener("change", (e) => {
                procesarArchivoLogo(e.target.files && e.target.files[0]);
                e.target.value = ""; // permite volver a elegir el mismo archivo
            });
        }

        cont.dataset.iniciado = "true";
        render();
    }

    // Se invoca cada vez que el usuario entra a la vista de
    // configuración: si está en la lista, la refresca.
    function alMostrar() {
        if (estado.vista === "lista") render();
    }

    return { iniciar, alMostrar };
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

    // Módulo "Configuración General": monta el contenido dentro del
    // contenedor #cfg-root ya existente (núcleo del ERP).
    ConfiguracionGeneral.iniciar();

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