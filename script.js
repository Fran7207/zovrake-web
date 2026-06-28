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

function manejarTabsRequerimientos(evento) {

    const tab = evento.target.closest(".req-tab");

    if (!tab) return;

    document.querySelectorAll(".req-tab").forEach((t) => {
        t.classList.remove("active");
    });

    tab.classList.add("active");
}

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