/* ==========================
   ELEMENTOS DEL DOM
========================== */

const continueButton = document.getElementById("continue-zovrake");
const heroSection = document.querySelector(".hero");
const authScreen = document.querySelector(".auth-screen");
const googleButton = document.getElementById("google-login");

/* ==========================
   BOTÓN CONTINUAR
========================== */

continueButton.addEventListener("click", function () {

    /* Ocultar HERO */
    heroSection.style.display = "none";

    /* Mostrar AUTH SCREEN */
    authScreen.classList.add("active");

});


/* ==========================
   CUANDO CARGUE LA PÁGINA
========================== */

window.onload = function () {

    if (typeof google !== "undefined") {

        google.accounts.id.initialize({

            client_id: "220193972804-rcg4hvpm8rd94ls04ppuq3a6u68jdd2g.apps.googleusercontent.com",

            callback: handleCredentialResponse

        });

        console.log("Google cargado correctamente.");

    } else {

        console.error("La librería de Google no se cargó.");

    }

};


/* ==========================
   BOTÓN GOOGLE
========================== */

googleButton.addEventListener("click", function () {

    if (typeof google !== "undefined") {

        google.accounts.id.prompt();

    } else {

        alert("Google todavía no está listo. Recarga la página.");

    }

});


/* ==========================
   RESPUESTA DE GOOGLE
========================== */

function handleCredentialResponse(response) {

    console.log("Inicio de sesión exitoso");

    console.log(response);

}