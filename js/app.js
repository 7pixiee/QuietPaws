// ==================== CONFIG ====================

const API_BASE = "http://localhost:5000/api";

// ==================== APP ELEMENTS ====================

const appView = document.querySelector("#app-view");
const authView = document.querySelector("#auth-view");
const revealView = document.querySelector("#reveal-view");

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");

const authForm = document.querySelector("#auth-form");
const authError = document.querySelector("#auth-error");

const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const nameInput = document.querySelector("#name");

const authSubmit = document.querySelector("#auth-submit");

// ==================== AUTH STATE ====================

let authMode = "login";
let token = localStorage.getItem("quietpaws_token");
let currentUser = null;

// ==================== TIMER STATE ====================

let selectedMinutes = 5;
let totalSeconds = 300;
let remaining = 300;

let timerId = null;
let running = false;

// ==================== VIEW MANAGEMENT ====================

function showView(name) {
  revealView.classList.add("hidden");
  appView.classList.remove("hidden");

  pages.forEach((page) => {
    page.classList.add("hidden");
  });

  const targetView = document.querySelector(`#${name}-view`);

  if (!targetView) {
    console.error(`View not found: ${name}-view`);
    return;
  }

  targetView.classList.remove("hidden");

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === name);
  });

  if (name === "house") {
    loadRewards();
  }

  if (name === "profile") {
    loadProfile();
  }
}

// ==================== API HELPER ====================

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
      }

      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError") {
      throw new Error(
        "Unable to connect to the server. Please make sure the backend is running.",
      );
    }

    throw error;
  }
}

// ==================== AUTH STORAGE ====================

function saveAuth(data) {
  token = data.token;
  currentUser = data.user;

  localStorage.setItem("quietpaws_token", token);

  if (currentUser) {
    localStorage.setItem("quietpaws_user", JSON.stringify(currentUser));
  }
}

function clearAuth() {
  token = null;
  currentUser = null;

  localStorage.removeItem("quietpaws_token");
  localStorage.removeItem("quietpaws_user");
}

function loadSavedUser() {
  const savedUser = localStorage.getItem("quietpaws_user");

  if (!savedUser) {
    return;
  }

  try {
    currentUser = JSON.parse(savedUser);
  } catch {
    currentUser = null;
  }
}

// ==================== AUTH MODE ====================

function setAuthMode(mode) {
  authMode = mode;

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.mode === mode);
  });

  if (nameInput) {
    nameInput.closest("label")?.classList.toggle("hidden", mode !== "signup");

    nameInput.required = mode === "signup";
  }

  if (authSubmit) {
    authSubmit.textContent = mode === "login" ? "Log In" : "Create account";
  }

  if (authError) {
    authError.textContent = "";
  }
}

// ==================== AUTHENTICATION ====================

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  authError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authError.textContent = "Please enter your email and password.";
    return;
  }

  if (authMode === "signup" && !nameInput.value.trim()) {
    authError.textContent = "Please enter your name.";
    return;
  }

  authSubmit.disabled = true;
  authSubmit.textContent =
    authMode === "login" ? "Logging in..." : "Creating account...";

  try {
    let data;

    if (authMode === "signup") {
      data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email,
          password,
        }),
      });
    } else {
      data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
    }

    saveAuth(data);

    authForm.reset();

    setAuthMode("login");

    authView.classList.add("hidden");
    appView.classList.remove("hidden");

    showView("timer");

    await loadProfile();
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authSubmit.disabled = false;

    authSubmit.textContent = authMode === "login" ? "Log In" : "Create account";
  }
});

// Login / Signup tabs

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthMode(tab.dataset.mode);
  });
});

// ==================== NAVIGATION ====================

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

// ==================== TIMER ====================

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);

  const secondsLeft = String(seconds % 60).padStart(2, "0");

  return `${minutes}:${secondsLeft}`;
}

function updateTimer() {
  const timeDisplay = document.querySelector("#time-display");

  const timerRing = document.querySelector("#timer-ring");

  timeDisplay.textContent = formatTime(remaining);

  const progress = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100;

  timerRing.style.setProperty("--progress", `${progress}%`);
}

// ==================== COMPLETE SESSION ====================

async function finishSession() {
  clearInterval(timerId);

  timerId = null;
  running = false;

  const startButton = document.querySelector("#start-timer");

  startButton.textContent = "▶";
  startButton.disabled = true;

  try {
    const intentionInput = document.querySelector("#break-reason");

    const intention = intentionInput?.value.trim() || "";

    const data = await apiRequest("/sessions/complete", {
      method: "POST",
      body: JSON.stringify({
        durationMin: selectedMinutes,
        intention,
      }),
    });

    showReward(data.reward, selectedMinutes);

    updateStreak(data.newStreak);
  } catch (error) {
    alert(error.message);

    remaining = totalSeconds;
    updateTimer();
  } finally {
    startButton.disabled = false;
  }
}

// ==================== REWARD DISPLAY ====================

function showReward(reward, minutes) {
  const rewardTitle = document.querySelector("#reward-title");

  const rewardImage = document.querySelector("#reward-image");

  const rewardName = document.querySelector("#reward-name");

  const rewardTrait = document.querySelector("#reward-trait");

  const rewardMinutes = document.querySelector("#reward-minutes");

  const rewardType = document.querySelector("#reward-type");

  const rewardQuote = document.querySelector("#reward-quote");

  if (!reward) {
    rewardTitle.textContent = "Quiet time complete";

    rewardImage.classList.add("hidden");

    rewardName.textContent = "You did it.";

    rewardTrait.textContent = "You gave yourself some peaceful time.";

    rewardType.textContent = "";

    rewardQuote.textContent = "";
  } else {
    rewardImage.classList.remove("hidden");

    rewardImage.src = getAssetUrl(reward.image_url);

    rewardImage.alt = reward.name || "QuietPaws reward";

    rewardName.textContent = reward.name || "New reward";

    rewardTrait.textContent = reward.detail || "";

    rewardType.textContent =
      reward.type === "cat" ? "New cat friend" : "New house item";

    rewardTitle.textContent =
      reward.type === "cat" ? "A new friend!" : "Your house grew!";

    rewardQuote.textContent = "";
  }

  rewardMinutes.textContent = minutes;

  appView.classList.add("hidden");
  revealView.classList.remove("hidden");
}

// ==================== IMAGE URL ====================

function getAssetUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  // Already a complete URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Backend server origin
  const backendOrigin = API_BASE.replace(/\/api\/?$/, "");

  // Backend returned something like:
  // /assets/cats/luna.png
  if (imageUrl.startsWith("/")) {
    return `${backendOrigin}${imageUrl}`;
  }

  // Backend returned:
  // assets/cats/luna.png
  return `${backendOrigin}/${imageUrl}`;
}

// ==================== STREAK ====================

function updateStreak(streak) {
  const streakCount = document.querySelector("#streak-count");

  if (!streakCount) {
    return;
  }

  const dayText = streak === 1 ? "Day" : "Days";

  streakCount.textContent = `${streak} ${dayText} Streak`;
}

// ==================== TIMER DURATION ====================

document.querySelectorAll(".durations button").forEach((button) => {
  button.addEventListener("click", () => {
    if (running) {
      return;
    }

    selectedMinutes = Number(button.dataset.minutes);

    totalSeconds = selectedMinutes * 60;

    remaining = totalSeconds;

    document.querySelectorAll(".durations button").forEach((item) => {
      item.classList.toggle("selected", item === button);
    });

    updateTimer();
  });
});

// ==================== START / PAUSE TIMER ====================
document.querySelector("#start-timer").addEventListener("click", () => {
  if (running) {
    clearInterval(timerId);
    timerId = null;
    running = false;
    document.querySelector("#start-timer").textContent = "▶";
    document.querySelector("#timer-setup").classList.remove("hidden");
    document.querySelector("#time-display").classList.add("hidden");
    return;
  }

  if (remaining <= 0) {
    remaining = totalSeconds;
    updateTimer();
  }

  running = true;
  document.querySelector("#start-timer").textContent = "Ⅱ";
  document.querySelector("#timer-setup").classList.add("hidden");
  document.querySelector("#time-display").classList.remove("hidden");

  timerId = setInterval(() => {
    remaining--;
    updateTimer();
    if (remaining <= 0) {
      finishSession();
    }
  }, 1000);
});
// document.querySelector("#start-timer").addEventListener("click", () => {
//   if (running) {
//     clearInterval(timerId);

//     timerId = null;
//     running = false;

//     document.querySelector("#start-timer").textContent = "▶";

//     return;
//   }

//   if (remaining <= 0) {
//     remaining = totalSeconds;
//     updateTimer();
//   }

//   running = true;

//   document.querySelector("#start-timer").textContent = "Ⅱ";

//   timerId = setInterval(() => {
//     remaining--;

//     updateTimer();

//     if (remaining <= 0) {
//       finishSession();
//     }
//   }, 1000);
// });

// ==================== RESET TIMER ====================

document.querySelector("#reset-timer").addEventListener("click", () => {
  clearInterval(timerId);

  timerId = null;
  running = false;

  remaining = totalSeconds;

  updateTimer();

  document.querySelector("#start-timer").textContent = "▶";
  document.querySelector("#timer-setup").classList.remove("hidden");
  document.querySelector("#time-display").classList.add("hidden");
});

// ==================== STOP TIMER ====================

document.querySelector("#stop-timer").addEventListener("click", () => {
  clearInterval(timerId);

  timerId = null;
  running = false;

  remaining = totalSeconds;

  updateTimer();

  document.querySelector("#start-timer").textContent = "▶";
  document.querySelector("#timer-setup").classList.remove("hidden");
  document.querySelector("#time-display").classList.add("hidden");
});

// ==================== HOUSE / REWARDS ====================

async function loadRewards() {
  const collectiblesContainer = document.querySelector("#house-collectibles");

  if (!collectiblesContainer) {
    return;
  }

  collectiblesContainer.innerHTML = `<p class="loading">Loading your collection...</p>`;

  try {
    const data = await apiRequest("/user/rewards");

    const cats = Array.isArray(data.cats) ? data.cats : [];

    const pieces = Array.isArray(data.pieces) ? data.pieces : [];

    updateHouseCounts(cats, pieces);

    collectiblesContainer.innerHTML = "";

    if (cats.length === 0 && pieces.length === 0) {
      collectiblesContainer.innerHTML = `<p class="empty-collection">
          Complete a quiet session to unlock your first reward.
        </p>`;

      return;
    }

    cats.forEach((cat) => {
      if (cat.unlocked === false) {
        return;
      }

      const button = createCatElement(cat);

      collectiblesContainer.appendChild(button);
    });

    pieces.forEach((piece) => {
      if (piece.unlocked === false) {
        return;
      }

      const element = createFurnitureElement(piece);

      collectiblesContainer.appendChild(element);
    });
  } catch (error) {
    collectiblesContainer.innerHTML = `<p class="error">
        ${escapeHtml(error.message)}
      </p>`;
  }
}

function updateHouseCounts(cats, pieces) {
  const unlockedCats = cats.filter((cat) => cat.unlocked);
  const unlockedPieces = pieces.filter((piece) => piece.unlocked);

  const catsFound = document.querySelector("#cats-found");
  const piecesFound = document.querySelector("#pieces-found");

  if (catsFound) catsFound.textContent = unlockedCats.length;
  if (piecesFound) piecesFound.textContent = unlockedPieces.length;

  const progressFill = document.querySelector("#progress-fill");

  if (progressFill) {
    const total = unlockedCats.length + unlockedPieces.length;
    const progress = Math.min((total / 24) * 100, 100);
    progressFill.style.width = `${progress}%`;
  }
}

// ==================== CREATE CAT ====================

function createCatElement(cat) {
  const button = document.createElement("button");

  button.className = "cat-at-home";

  button.dataset.catId = cat.id;

  button.dataset.catName = cat.name;

  button.type = "button";

  const image = document.createElement("img");

  image.src = getAssetUrl(cat.image_url);

  image.alt = cat.name || "Cat";

  button.appendChild(image);

  button.addEventListener("click", () => {
    openCatModal(cat);
  });

  return button;
}

// ==================== CREATE FURNITURE ====================

function createFurnitureElement(piece) {
  const element = document.createElement("div");

  element.className = "furniture-at-home";

  const image = document.createElement("img");

  image.src = getAssetUrl(piece.image_url);

  image.alt = piece.name || "Furniture";

  const name = document.createElement("span");

  name.textContent = piece.name || "Furniture";

  element.appendChild(image);
  element.appendChild(name);

  return element;
}

// ==================== CAT MODAL ====================

function openCatModal(cat) {
  const modal = document.querySelector("#cat-modal");

  const image = document.querySelector("#modal-image");

  const name = document.querySelector("#modal-name");

  const trait = document.querySelector("#modal-trait");

  const quote = document.querySelector("#modal-quote");

  image.src = getAssetUrl(cat.image_url);

  image.alt = cat.name || "Cat portrait";

  name.textContent = cat.name || "Cat";

  trait.textContent = `☀  ${cat.detail || ""}`;

  quote.textContent = cat.quote || "";

  modal.classList.remove("hidden");
}

document.querySelector("#close-reveal").addEventListener("click", () => {
  showView("timer");
});

// ==================== PROFILE ====================

async function loadProfile() {
  try {
    const data = await apiRequest("/user/profile");

    const user = data.user || data;

    currentUser = user;

    localStorage.setItem("quietpaws_user", JSON.stringify(user));

    const profileName = document.querySelector("#profile-name");

    const profileEmail = document.querySelector("#profile-email");

    const profileSessions = document.querySelector("#profile-sessions");

    const profileCurrentStreak = document.querySelector(
      "#profile-current-streak",
    );

    const profileBestStreak = document.querySelector("#profile-best-streak");

    if (profileName) {
      profileName.textContent = user.name || "QuietPaws user";
    }

    if (profileEmail) {
      profileEmail.textContent = user.email || "";
    }

    if (profileSessions) {
      profileSessions.textContent = user.totalSessions ?? 0;
    }

    if (profileCurrentStreak) {
      profileCurrentStreak.textContent = user.streak?.current ?? 0;
    }

    if (profileBestStreak) {
      profileBestStreak.textContent = user.streak?.best ?? 0;
    }

    updateStreak(user.streak?.current ?? 0);
  } catch (error) {
    console.error("Could not load profile:", error);
  }
}

// ==================== SETTINGS ====================

document.querySelector("#settings-button").addEventListener("click", () => {
  document.querySelector("#settings-modal").classList.remove("hidden");
});

// ==================== CLOSE MODALS ====================

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");

    if (modal) {
      modal.classList.add("hidden");
    }
  });
});

// Close modal when clicking outside

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

// ==================== RESET DATA ====================

document.querySelector("#reset-data").addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Reset demo data? This will clear your local login session.",
  );

  if (!confirmed) {
    return;
  }

  clearAuth();

  clearInterval(timerId);

  timerId = null;
  running = false;

  remaining = totalSeconds;

  updateTimer();

  document.querySelector("#settings-modal").classList.add("hidden");

  appView.classList.add("hidden");
  revealView.classList.add("hidden");

  authView.classList.remove("hidden");

  setAuthMode("login");
});

// ==================== LOG OUT ====================

function handleLogout() {
  clearAuth();

  clearInterval(timerId);

  timerId = null;
  running = false;

  appView.classList.add("hidden");
  revealView.classList.add("hidden");

  authView.classList.remove("hidden");

  setAuthMode("login");
}

document.querySelector("#logout").addEventListener("click", () => {
  document.querySelector("#settings-modal").classList.add("hidden");

  handleLogout();
});

// ==================== HTML ESCAPE ====================

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = String(value ?? "");

  return div.innerHTML;
}

// ==================== INITIALIZATION ====================

loadSavedUser();

setAuthMode("login");

updateTimer();

// If a saved token exists,
// try opening the application.

if (token) {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");

  showView("timer");

  loadProfile().catch(() => {
    handleLogout();
  });
}
