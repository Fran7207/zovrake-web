/* ==========================
   SUPABASE
========================== */

const SUPABASE_URL =
"https://jbvuufbaipjxgcpfvunz.supabase.co";

const SUPABASE_KEY =
"sb_publishable_YTA9ngImZJ--TLdNhTod4w_yJxP_geE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* ==========================
   ELEMENTOS DEL DOM
========================== */

const continueButton =
document.getElementById("continue-zovrake");

const heroSection =
document.querySelector(".hero");

const authScreen =
document.querySelector(".auth-screen");

const googleButton =
document.getElementById("google-login");


/* ==========================
   BOTÓN CONTINUAR
========================== */

continueButton.addEventListener("click", () => {

    heroSection.style.display = "none";

    authScreen.classList.add("active");

});


/* ==========================
   LOGIN CON GOOGLE
========================== */

googleButton.addEventListener("click", async () => {

    const { error } =
    await supabaseClient.auth.signInWithOAuth({

        provider: "google",

        options: {

            redirectTo:
            "https://zovrake-web.vercel.app"

        }

    });

    if (error) {

        console.error(error);

        alert("Error al iniciar sesión.");

    }

});


/* ==========================
   COMPROBAR SESIÓN
========================== */

window.addEventListener("load", async () => {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();
if (session) {

    console.log("Usuario autenticado:");

    console.log(session.user);

} else {

    console.log("No hay sesión activa.");

}

    /*
    AQUÍ MÁS ADELANTE
    ENTRARÁ AL DASHBOARD
    */

});