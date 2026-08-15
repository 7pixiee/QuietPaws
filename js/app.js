const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");


// Show / hide password
togglePassword.addEventListener("click", () => {

    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    togglePassword.textContent = isPassword ? "Hide" : "Show";

});


// Temporary login behaviour
loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        return;
    }

    console.log("Login submitted:", email);

    alert("Login will be connected to the backend later.");

});