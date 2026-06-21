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
    googleButton: document.getElementById("google-login")
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


/* --------------------------------------------------------
   3. CONTROL DE PANTALLAS (hero / auth-screen)
   -------------------------------------------------------- */

function mostrarPantallaAuth() {
    dom.heroSection.style.display = "none";
    dom.authScreen.classList.add("active");
}

function ocultarPantallaAuth() {
    dom.authScreen.classList.remove("active");
    dom.heroSection.style.display = "none";
    // NOTA: aún no existe una sección de "dashboard" en el HTML.
    // Cuando exista, aquí se debe mostrar esa sección, por ejemplo:
    // dom.dashboardSection.classList.add("active");
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
    console.log("[Zovrake] Usuario autenticado:", session.user.email);

    console.log(
        "[Zovrake] Esperando la siguiente estructura."
    );
} else {
        console.log("[Zovrake] Sin sesión activa.");
    }
});