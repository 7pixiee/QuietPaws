// ==================== APP ELEMENTS ====================

const appView = document.querySelector("#app-view");
const authView = document.querySelector("#auth-view");
const revealView = document.querySelector("#reveal-view");

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");


// ==================== CAT DATA ====================

const cats = {
  Luna: {
    image: "assets/cats/cat3.jpeg",
    trait: "Naps in sunbeams, ignores everyone",
    quote: "“The sun is the best blanket.”",
  },

  Mochi: {
    image: "assets/cats/cat1.jpeg",
    trait: "Collects quiet moments by the window",
    quote: "“Slow is a lovely speed.”",
  },

  Poppy: {
    image: "assets/cats/cat2.jpeg",
    trait: "Always finds the warmest spot",
    quote: "“There is time for one more rest.”",
  },
};


// ==================== TIMER STATE ====================

let selectedMinutes = 5;
let totalSeconds = 300;
let remaining = 300;

let timerId;
let running = false;


// ==================== HOUSE STATE ====================

let catsFound = 3;
let piecesFound = 2;
let nextReward = "cat";


// ==================== VIEW MANAGEMENT ====================

function showView(name) {
  // Hide the reward screen
  revealView.classList.add("hidden");

  // Show the main application
  appView.classList.remove("hidden");

  // Hide all pages
  pages.forEach((page) => {
    page.classList.add("hidden");
  });

  // Show the selected page
  document
    .querySelector(`#${name}-view`)
    .classList.remove("hidden");

  // Update active navigation link
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.dataset.view === name
    );
  });

  // Update house information whenever House is opened
  if (name === "house") {
    updateHouse();
  }
}


// ==================== TIMER ====================

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);

  const secondsLeft = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${secondsLeft}`;
}


function updateTimer() {
  const timeDisplay = document.querySelector("#time-display");
  const timerRing = document.querySelector("#timer-ring");

  // Update the countdown text
  timeDisplay.textContent = formatTime(remaining);

  // Update the circular progress
  timerRing.style.setProperty(
    "--progress",
    `${(remaining / totalSeconds) * 100}%`
  );
}


function finishSession() {
  // Stop the timer
  clearInterval(timerId);

  running = false;

  // Decide which cat will be rewarded
  const reward =
    catsFound % 3 === 0
      ? "Poppy"
      : catsFound % 2 === 0
        ? "Mochi"
        : "Luna";

  // Update progress
  catsFound++;
  nextReward = "piece";

  // Update reward screen
  document.querySelector("#reward-image").src =
    cats[reward].image;

  document.querySelector("#reward-name").textContent =
    reward;

  document.querySelector("#reward-trait").textContent =
    cats[reward].trait;

  document.querySelector("#reward-minutes").textContent =
    selectedMinutes;

  // Switch from app to reward screen
  appView.classList.add("hidden");
  revealView.classList.remove("hidden");

  // Update house progress
  updateHouse();
}


// ==================== AUTHENTICATION ====================

document
  .querySelector("#auth-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();

    // Hide login screen
    authView.classList.add("hidden");

    // Open timer
    showView("timer");
  });


// Login / Sign up tabs
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {

    // Remove active state from all tabs
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
    });

    // Activate clicked tab
    tab.classList.add("active");

    // Change button text
    document.querySelector("#auth-form .primary").textContent =
      tab.dataset.mode === "login"
        ? "Log In"
        : "Create account";
  });
});


// ==================== NAVIGATION ====================

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});


// ==================== TIMER DURATION ====================

document
  .querySelectorAll(".durations button")
  .forEach((button) => {

    button.addEventListener("click", () => {

      // Don't allow duration changes while timer is running
      if (running) return;

      // Get selected duration
      selectedMinutes = Number(button.dataset.minutes);

      // Convert minutes to seconds
      totalSeconds = selectedMinutes * 60;

      // Reset countdown
      remaining = totalSeconds;

      // Update selected button
      document
        .querySelectorAll(".durations button")
        .forEach((item) => {

          item.classList.toggle(
            "selected",
            item === button
          );
        });

      // Update timer display
      updateTimer();
    });
  });


// ==================== START / PAUSE TIMER ====================

document
  .querySelector("#start-timer")
  .addEventListener("click", () => {

    // If timer is already running, pause it
    if (running) {
      clearInterval(timerId);

      running = false;

      document.querySelector("#start-timer").textContent =
        "▶";

      return;
    }

    // Start timer
    running = true;

    // Change button to pause symbol
    document.querySelector("#start-timer").textContent =
      "Ⅱ";

    // Countdown every second
    timerId = setInterval(() => {

      remaining--;

      updateTimer();

      // Finish session when countdown reaches zero
      if (remaining <= 0) {
        finishSession();
      }

    }, 1000);
  });


// ==================== RESET TIMER ====================

document
  .querySelector("#reset-timer")
  .addEventListener("click", () => {

    // Stop timer
    clearInterval(timerId);

    running = false;

    // Reset to selected duration
    remaining = totalSeconds;

    // Update display
    updateTimer();

    // Restore play button
    document.querySelector("#start-timer").textContent =
      "▶";
  });


// ==================== STOP TIMER ====================

document
  .querySelector("#stop-timer")
  .addEventListener("click", () => {

    // Stop timer
    clearInterval(timerId);

    running = false;

    // Reset to selected duration
    remaining = totalSeconds;

    // Update display
    updateTimer();

    // Restore play button
    document.querySelector("#start-timer").textContent =
      "▶";
  });


// ==================== HOUSE ====================

function updateHouse() {

  // Update number of cats found
  document.querySelector("#cats-found").textContent =
    catsFound;

  // Update number of furniture pieces
  document.querySelector("#pieces-found").textContent =
    piecesFound;

  // Update progress bar
  document.querySelector("#progress-fill").style.width =
    `${((catsFound + piecesFound) / 24) * 100}%`;
}


// ==================== CAT INTERACTION ====================

document
  .querySelectorAll(".cat-at-home")
  .forEach((button) => {

    button.addEventListener("click", () => {

      // Get selected cat
      const cat = cats[button.dataset.cat];

      // Update modal image
      document.querySelector("#modal-image").src =
        cat.image;

      // Update cat name
      document.querySelector("#modal-name").textContent =
        button.dataset.cat;

      // Update cat trait
      document.querySelector("#modal-trait").textContent =
        `☀  ${cat.trait}`;

      // Update cat quote
      document.querySelector("#modal-quote").textContent =
        cat.quote;

      // Show modal
      document
        .querySelector("#cat-modal")
        .classList.remove("hidden");
    });
  });


// ==================== SETTINGS ====================

document
  .querySelector("#settings-button")
  .addEventListener("click", () => {

    document
      .querySelector("#settings-modal")
      .classList.remove("hidden");
  });


// Close modals
document.querySelectorAll("[data-close]").forEach((button) => {

  button.addEventListener("click", () => {

    button
      .closest(".modal")
      .classList.add("hidden");
  });
});


// ==================== RESET DEMO DATA ====================

document
  .querySelector("#reset-data")
  .addEventListener("click", () => {

    // Reset house progress
    catsFound = 0;
    piecesFound = 0;

    // Update house
    updateHouse();

    // Close settings
    document
      .querySelector("#settings-modal")
      .classList.add("hidden");
  });


// ==================== LOG OUT ====================

document
  .querySelector("#logout")
  .addEventListener("click", () => {

    // Close settings
    document
      .querySelector("#settings-modal")
      .classList.add("hidden");

    // Hide application
    appView.classList.add("hidden");

    // Show authentication screen
    authView.classList.remove("hidden");
  });


// ==================== INITIAL STATE ====================

// Set initial timer display
updateTimer();

// Set initial house progress
updateHouse();