/* ===========================================================
   ARMS v1.0
   Activity Timeline Module
=========================================================== */

function buildActivityFeed() {
    const container = document.getElementById('activityFeed');
    if (!container) return;

    const entries = [];

    (Array.isArray(candidates) ? candidates : []).forEach((candidate) => {
        if (candidate.interviewDate) {
            entries.push({
                title: (candidate.candidateName || 'Candidate') + ' interview scheduled',
                detail: candidate.interviewDate,
                type: 'interview'
            });
        }
        if (candidate.followupDate) {
            entries.push({
                title: (candidate.candidateName || 'Candidate') + ' follow-up set',
                detail: candidate.followupDate,
                type: 'followup'
            });
        }
        if (candidate.doj) {
            entries.push({
                title: (candidate.candidateName || 'Candidate') + ' joining date set',
                detail: candidate.doj,
                type: 'joining'
            });
        }
    });

    entries.sort((a, b) => (b.detail || '').localeCompare(a.detail || ''));

    container.innerHTML = entries.slice(0, 8).map((entry) => {
        const icon = entry.type === 'interview' ? '📅' : entry.type === 'followup' ? '🔔' : '🎯';
        return '<div class="notification-item"><strong>' + icon + ' ' + entry.title + '</strong><div style="font-size:13px; color:#6c757d; margin-top:4px;">' + formatDateDisplayIST(entry.detail, entry.detail) + '</div></div>';
    }).join('');
}
