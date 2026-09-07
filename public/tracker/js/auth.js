/* ===========================================================
   ARMS v1.0
   Simple Auth & Roles Module
=========================================================== */

const TRACKER_USERNAME = "ritika.koul@alcoveinfotech.com";
const TRACKER_PASSWORD = "Aayansh@2016";
const TRACKER_AUTH_KEY = "armsTrackerAuthenticated";
let currentUser = null;

function getStoredUsers() {
    return [];
}

function saveUsers(users) {
    return users;
}

function ensureDefaultUsers() {
    currentUser = null;
}

function loginUser(email, password) {
    if (email !== TRACKER_USERNAME || password !== TRACKER_PASSWORD) return null;
    currentUser = { name: "Ritika Koul", email: TRACKER_USERNAME, role: "Admin", status: "Active" };
    sessionStorage.setItem(TRACKER_AUTH_KEY, "true");
    return currentUser;
}

function getCurrentUser() {
    if (!currentUser && sessionStorage.getItem(TRACKER_AUTH_KEY) === "true") {
        currentUser = { name: "Ritika Koul", email: TRACKER_USERNAME, role: "Admin", status: "Active" };
    }
    return currentUser;
}

function canAccessModule(role, moduleName) {
    return true;
}

function showAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "flex";
    }
    document.body.classList.remove("authenticated");
}

function hideAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function submitLogin() {
    const message = document.getElementById("loginMessage");
    const email = document.getElementById("loginEmail")?.value.trim() || "";
    const password = document.getElementById("loginPassword")?.value || "";
    const user = loginUser(email, password);

    if (!user) {
        if (message) {
            message.innerText = "Invalid username or password.";
            message.style.color = "#DC3545";
        }
        return;
    }

    if (message) message.innerText = "";
    document.body.classList.add("authenticated");
    renderAuthPanel();
    applyRoleRestrictions();
    hideAuthModal();
}

function renderAuthPanel() {
    const user = getCurrentUser();
    const panel = document.getElementById("authPanel");
    if (!panel) return;

    if (!user) {
        panel.innerHTML = "";
        return;
    }

    panel.innerHTML = "";
}

function applyRoleRestrictions() {
    const revenueSection = document.getElementById("revenueSection");
    const vendorSection = document.getElementById("vendorSection");
    const roleNotice = document.getElementById("roleNotice");

    if (revenueSection) {
        revenueSection.style.display = "block";
    }

    if (vendorSection) {
        vendorSection.style.display = "block";
    }

    if (roleNotice) {
        roleNotice.innerText = "";
    }
}

function logoutUser() {
    currentUser = null;
    sessionStorage.removeItem(TRACKER_AUTH_KEY);
    renderAuthPanel();
    applyRoleRestrictions();
    showAuthModal();
}

document.addEventListener("DOMContentLoaded", () => {
    if (getCurrentUser()) {
        document.body.classList.add("authenticated");
        hideAuthModal();
    } else {
        showAuthModal();
    }
});
