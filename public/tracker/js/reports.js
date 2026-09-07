/* ===========================================================
   ARMS v1.0
   Reports Module
=========================================================== */

function updateReportsDashboard() {
    const profileCount = (Array.isArray(candidates) ? candidates : []).length;
    const interviewCount = (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Interview Scheduled").length;
    const offerCount = (Array.isArray(candidates) ? candidates : []).filter(c => isOfferReleasedStatus(c.status)).length;
    const joinCount = (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Joined").length;
    const closurePercent = profileCount === 0 ? 0 : Math.round((joinCount / profileCount) * 100);

    const elements = [
        ["reportProfiles", profileCount],
        ["reportInterviews", interviewCount],
        ["reportOffers", offerCount],
        ["reportJoinees", joinCount],
        ["reportClosure", closurePercent + "%"]
    ];

    elements.forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    });
}
