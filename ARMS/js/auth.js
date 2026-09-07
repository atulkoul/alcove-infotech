/* ===========================================================
   ARMS v1.0
   Simple Auth & Roles Module
=========================================================== */

let currentUser = null;

function getStoredUsers() {
    const data = localStorage.getItem("armsUsers");
    return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
    localStorage.setItem("armsUsers", JSON.stringify(users));
}

function ensureDefaultUsers() {
    const users = getStoredUsers();
    if (users.length === 0) {
        users.push({ name: "Admin", email: "admin@arms.com", password: "admin123", role: "Admin", status: "Active" });
        users.push({ name: "Recruiter", email: "recruiter@arms.com", password: "recruiter123", role: "Recruiter", status: "Active" });
        users.push({ name: "Manager", email: "manager@arms.com", password: "manager123", role: "Manager", status: "Active" });
        saveUsers(users);
    }
}

function loginUser(email, password) {
    ensureDefaultUsers();
    const users = getStoredUsers();
    const user = users.find(entry => entry.email === email && entry.password === password);
    if (!user) return null;
    currentUser = user;
    localStorage.setItem("armsCurrentUser", JSON.stringify(user));
    return user;
}

function getCurrentUser() {
    if (currentUser) return currentUser;
    const stored = localStorage.getItem("armsCurrentUser");
    if (stored) {
        currentUser = JSON.parse(stored);
    }
    return currentUser;
}

function canAccessModule(role, moduleName) {
    if (role === "Admin") return true;
    if (role === "Recruiter") return moduleName !== "Reports";
    if (role === "Manager") return moduleName === "Reports" || moduleName === "Dashboard";
    return false;
}

function showAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function hideAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function submitLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    const user = loginUser(email, password);

    if (!user) {
        if (message) {
            message.innerText = "Invalid email or password.";
            message.style.color = "#dc3545";
        }
        return;
    }

    if (message) {
        message.innerText = "Login successful.";
        message.style.color = "#198754";
    }

    renderAuthPanel();
    applyRoleRestrictions();
    hideAuthModal();
}

function renderAuthPanel() {
    const user = getCurrentUser();
    const panel = document.getElementById("authPanel");
    if (!panel) return;

    if (!user) {
        panel.innerHTML = '<div class="auth-user-pill">Please login</div>';
        return;
    }

    panel.innerHTML =
        '<div class="auth-user-pill">Logged in as ' + user.name + '</div>' +
        '<button class="logout-btn" onclick="logoutUser()">Logout</button>';
}

function applyRoleRestrictions() {
    const user = getCurrentUser();
    const role = user ? user.role : "Guest";
    const revenueSection = document.getElementById("revenueSection");
    const vendorSection = document.getElementById("vendorSection");
    const roleNotice = document.getElementById("roleNotice");

    const hideFinance = role === "Recruiter" || role === "Manager";

    if (revenueSection) {
        revenueSection.style.display = hideFinance ? "none" : "block";
    }

    if (vendorSection) {
        vendorSection.style.display = hideFinance ? "none" : "block";
    }

    if (roleNotice) {
        roleNotice.innerText = role === "Admin"
            ? "Full access"
            : role === "Recruiter"
                ? "Recruiter view: candidate workflow enabled"
                : role === "Manager"
                    ? "Manager view: dashboard and reports"
                    : "Please sign in";
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem("armsCurrentUser");
    renderAuthPanel();
    applyRoleRestrictions();
    showAuthModal();
}
