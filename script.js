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
    profileContinueButton: document.getElementById("profile-continue")
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
    });

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

    mostrarOnboarding(
        session.user.email
    );

} else {

    console.log(
        "[Zovrake] Sin sesión activa."
    );
}

});