/* ===========================================================
   ARMS v1.0
   Quick Actions Module
=========================================================== */

function renderQuickActions() {
    const container = document.getElementById('quickActions');
    if (!container) return;

    container.innerHTML = [
        '<button class="primary-btn" onclick="openAddCandidate()">➕ New Candidate</button>',
        '<button class="primary-btn" onclick="openClientModal()">🏢 New Client</button>',
        '<button class="primary-btn" onclick="openRequirementModal()">📋 New Requirement</button>',
        '<button class="primary-btn" onclick="downloadBackup()">⬇️ Backup</button>'
    ].join('');
}

function renderHelpPanel() {
    const container = document.getElementById('helpPanel');
    if (!container) return;

    container.innerHTML = '<div class="notification-item"><strong>Quick tips</strong><div style="font-size:13px; color:#6c757d; margin-top:6px;">Use the search bar to find candidates quickly, then use the reminder button to mark follow-up activity.</div></div>';
}
