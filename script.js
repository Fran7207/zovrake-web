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

    heroSection.style.display = "none";

    authScreen.classList.add("active");

});

/* ==========================
   CARGAR GOOGLE
========================== */

window.onload = function () {

    google.accounts.id.initialize({

        client_id: "220193972804-rcg4hvpm8rd94ls04ppuq3a6u68jdd2g.apps.googleusercontent.com",

        callback: handleCredentialResponse

    });

    google.accounts.id.renderButton(

        document.getElementById("google-button-container"),

        {
            theme: "outline",
            size: "large"
        }

    );

};

/* ==========================
   BOTÓN PERSONALIZADO
========================== */

googleButton.addEventListener("click", function () {

    const officialButton = document.querySelector(
        "#google-button-container div[role='button']"
    );

    if (officialButton) {

        officialButton.click();

    } else {

        alert("Google todavía no está listo.");

    }

});

/* ==========================
   RESPUESTA DE GOOGLE
========================== */

function handleCredentialResponse(response) {

    console.log("Inicio de sesión exitoso");

    console.log(response);

}