// LOGIN ELEMENTS

const authForm = document.querySelector("#auth-form");

const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");

const confirmPasswordGroup =
    document.querySelector(".confirm-password-group");

const confirmPassword =
    document.querySelector("#confirm-password");

const authTitle =
    document.querySelector("#auth-title");

const authSubtitle =
    document.querySelector("#auth-subtitle");

const authButton =
    document.querySelector("#auth-button");

const switchText =
    document.querySelector("#switch-text");

const switchAuth =
    document.querySelector("#switch-auth");


// TIMER ELEMENTS

const timerPage =
    document.querySelector("#timer-page");

const countdownCard =
    document.querySelector("#countdown-card");

const startTimerButton =
    document.querySelector("#start-timer");

const durationButtons =
    document.querySelectorAll(".duration-button");

const customMinutesInput =
    document.querySelector("#custom-minutes");

const countdown =
    document.querySelector("#countdown");

const pauseButton =
    document.querySelector("#pause-timer");

const endButton =
    document.querySelector("#end-timer");

const progressBar =
    document.querySelector("#timer-progress-bar");

const breathingText =
    document.querySelector("#breathing-text");


// AUTH STATE

let isSignup = false;


// TIMER STATE

let selectedMinutes = 10;

let totalSeconds = selectedMinutes * 60;

let remainingSeconds = totalSeconds;

let timerInterval = null;

let isPaused = false;


// SHOW / HIDE PASSWORD

togglePassword.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    togglePassword.textContent =
        isPassword ? "Hide" : "Show";

});


// LOGIN ↔ SIGNUP

switchAuth.addEventListener("click", () => {

    isSignup = !isSignup;

    if (isSignup) {

        authTitle.textContent =
            "Create your account";

        authSubtitle.textContent =
            "Make a little space for yourself.";

        authButton.textContent =
            "Create account";

        switchText.textContent =
            "Already have an account?";

        switchAuth.textContent =
            "Log in";

        confirmPasswordGroup.classList.remove("hidden");

        confirmPassword.required = true;

    } else {

        authTitle.textContent =
            "Welcome back";

        authSubtitle.textContent =
            "Come back to your quiet little space.";

        authButton.textContent =
            "Log in";

        switchText.textContent =
            "Don't have an account?";

        switchAuth.textContent =
            "Create one";

        confirmPasswordGroup.classList.add("hidden");

        confirmPassword.required = false;

    }

});


// LOGIN / SIGNUP

authForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const email =
        document.querySelector("#email").value.trim();

    const password =
        passwordInput.value.trim();


    if (isSignup) {

        const confirm =
            confirmPassword.value.trim();

        if (password !== confirm) {

            alert("Passwords do not match.");

            return;
        }

        console.log("Signup:", email);

    } else {

        console.log("Login:", email);

    }


    // Temporary:
    // after successful authentication,
    // show the timer.

    document.querySelector(".auth-page")
        .classList.add("hidden");

    timerPage.classList.remove("hidden");

});


// DURATION SELECTION

durationButtons.forEach((button) => {

    button.addEventListener("click", () => {

        durationButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedMinutes =
            Number(button.dataset.minutes);

        customMinutesInput.value = "";

    });

});


// CUSTOM DURATION

customMinutesInput.addEventListener("input", () => {

    const customValue =
        Number(customMinutesInput.value);

    if (customValue > 0) {

        durationButtons.forEach((button) => {
            button.classList.remove("active");
        });

        selectedMinutes = customValue;
    }

});


// START TIMER

startTimerButton.addEventListener("click", () => {

    if (selectedMinutes < 1) {
        return;
    }

    totalSeconds =
        selectedMinutes * 60;

    remainingSeconds =
        totalSeconds;

    isPaused = false;

    pauseButton.textContent =
        "Pause";

    document.querySelector(".timer-card")
        .classList.add("hidden");

    countdownCard.classList.remove("hidden");

    updateCountdown();

    startCountdown();

});


// START COUNTDOWN

function startCountdown() {

    clearInterval(timerInterval);

    timerInterval =
        setInterval(() => {

            if (isPaused) {
                return;
            }

            remainingSeconds--;

            updateCountdown();

            if (remainingSeconds <= 0) {

                clearInterval(timerInterval);

                completeSession();

            }

        }, 1000);

}


// UPDATE COUNTDOWN

function updateCountdown() {

    const minutes =
        Math.floor(remainingSeconds / 60);

    const seconds =
        remainingSeconds % 60;

    countdown.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    const progress =
        (remainingSeconds / totalSeconds) * 100;

    progressBar.style.width =
        `${progress}%`;

        updateBreathingText();

}

function updateBreathingText() {

    if (isPaused) {
        breathingText.textContent = "Paused";
        return;
    }

    const cycle = Math.floor(remainingSeconds / 4) % 4;

    const messages = [
        "Breathe in",
        "Hold",
        "Breathe out",
        "Rest"
    ];

    breathingText.textContent = messages[cycle];
}

// PAUSE / RESUME

pauseButton.addEventListener("click", () => {

    isPaused = !isPaused;

    pauseButton.textContent =
        isPaused ? "Resume" : "Pause";

    breathingText.textContent =
        isPaused ? "Paused" : "Breathe in";

});


// END EARLY

endButton.addEventListener("click", () => {

    const shouldEnd =
        confirm("End this session early?");

    if (!shouldEnd) {
        return;
    }

    clearInterval(timerInterval);

    resetTimer();

});

// SESSION COMPLETE

function completeSession() {
clearInterval(timerInterval);

    breathingText.textContent = "Session complete";

    document.querySelector("#quiet-message").textContent =
        "You made some space for yourself.";

    pauseButton.classList.add("hidden");

    endButton.textContent = "Continue";

}

// RESET TIMER

function resetTimer() {

    clearInterval(timerInterval);

    countdownCard.classList.add("hidden");

    document.querySelector(".timer-card")
        .classList.remove("hidden");

    pauseButton.classList.remove("hidden");

    endButton.textContent =
        "End session early";

    remainingSeconds =
        selectedMinutes * 60;

    updateCountdown();

}