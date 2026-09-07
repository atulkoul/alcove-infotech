/* ===========================================================
   ARMS v1.0
   Notifications Module
=========================================================== */

function showNotification(message) {
    const container = document.getElementById("notificationCenter");
    if (!container) return;

    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerText = message;
    container.appendChild(item);

    setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
    }, 4000);
}

function runNotifications() {
    const today = getCurrentISTDateString();
    const tomorrowStr = shiftDateInputValue(today, 1);

    (Array.isArray(candidates) ? candidates : []).forEach(candidate => {
        if (candidate.interviewDate === today) {
            showNotification("Interview today for " + (candidate.candidateName || "candidate"));
        }
        if (candidate.followupDate === today) {
            showNotification("Follow-up due today for " + (candidate.candidateName || "candidate"));
        }
        if (candidate.doj && candidate.doj === tomorrowStr) {
            showNotification("Joining tomorrow for " + (candidate.candidateName || "candidate"));
        }
    });
}
