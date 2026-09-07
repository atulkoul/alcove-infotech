/* ===========================================================
   ARMS v1.0
   Recruiter Productivity Module
=========================================================== */

function updateRecruiterProductivity() {
    const tbody = document.getElementById("recruiterProductivityBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const recruiters = [...new Set((Array.isArray(candidates) ? candidates : []).map(c => c.recruiter).filter(Boolean))];

    recruiters.forEach(recruiter => {
        const profiles = (Array.isArray(candidates) ? candidates : []).filter(c => c.recruiter === recruiter).length;
        const interviews = (Array.isArray(candidates) ? candidates : []).filter(c => c.recruiter === recruiter && c.status === "Interview Scheduled").length;
        const offers = (Array.isArray(candidates) ? candidates : []).filter(c => c.recruiter === recruiter && isOfferReleasedStatus(c.status)).length;
        const joinees = (Array.isArray(candidates) ? candidates : []).filter(c => c.recruiter === recruiter && c.status === "Joined").length;
        const targetPercent = profiles === 0 ? 0 : Math.round((joinees / Math.max(1, profiles)) * 100);

        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + recruiter + '</td>' +
            '<td>' + profiles + '</td>' +
            '<td>' + interviews + '</td>' +
            '<td>' + offers + '</td>' +
            '<td>' + joinees + '</td>' +
            '<td>' + targetPercent + '%</td>';
        tbody.appendChild(row);
    });
}
