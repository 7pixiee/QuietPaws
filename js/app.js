const authForm = document.querySelector("#auth-form");

const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");

const confirmPasswordGroup = document.querySelector(".confirm-password-group");
const confirmPassword = document.querySelector("#confirm-password");

const authTitle = document.querySelector("#auth-title");
const authSubtitle = document.querySelector("#auth-subtitle");
const authButton = document.querySelector("#auth-button");

const switchText = document.querySelector("#switch-text");
const switchAuth = document.querySelector("#switch-auth");

let isSignup = false;

// SHOW / HIDE PASSWORD

togglePassword.addEventListener("click", () => {

    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    togglePassword.textContent = isPassword ? "Hide" : "Show";

});


// LOGIN ↔ SIGNUP

switchAuth.addEventListener("click", () => {

    isSignup = !isSignup;

    if (isSignup) {

        authTitle.textContent = "Create your account";

        authSubtitle.textContent =
            "Make a little space for yourself.";

        authButton.textContent = "Create account";

        switchText.textContent = "Already have an account?";

        switchAuth.textContent = "Log in";

        confirmPasswordGroup.classList.remove("hidden");

        confirmPassword.required = true;

    } else {

        authTitle.textContent = "Welcome back";

        authSubtitle.textContent =
            "Come back to your quiet little space.";

        authButton.textContent = "Log in";

        switchText.textContent = "Don't have an account?";

        switchAuth.textContent = "Create one";

        confirmPasswordGroup.classList.add("hidden");

        confirmPassword.required = false;

    }

});

// FORM SUBMISSION

authForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const email = document.querySelector("#email").value.trim();

    const password = passwordInput.value.trim();

    if (isSignup) {

        const confirm = confirmPassword.value.trim();

        if (password !== confirm) {
            alert("Passwords do not match.");
            return;
        }

        console.log("Signup:", email);

        alert("Signup will be connected to the backend later.");

    } else {

        console.log("Login:", email);

        alert("Login will be connected to the backend later.");

    }

});