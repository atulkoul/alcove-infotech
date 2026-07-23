/* ===========================================================
   ARMS v1.0
   Requirements Grid Rendering Module
=========================================================== */

function renderRequirementsGrid(data) {
    const tbody = document.getElementById("requirementsGridBody");
    if (!tbody) return;
    
    // Ensure requirements is loaded
    if (!requirements || !Array.isArray(requirements)) {
        loadRequirements();
    }

    const list = Array.isArray(data) ? data : (Array.isArray(requirements) ? requirements : []);

    tbody.innerHTML = "";

    // Update summary cards
    const totalCount = list.length;
    const openCount = list.filter(r => r.status === "Open").length;
    const closedCount = list.filter(r => r.status === "Closed").length;
    const slaCount = list.filter(r => getRequirementAge(r) > 30).length;

    document.getElementById("reqTotalCount").textContent = totalCount;
    document.getElementById("reqOpenCount").textContent = openCount;
    document.getElementById("reqClosedCount").textContent = closedCount;
    document.getElementById("reqSLACount").textContent = slaCount;

    list.forEach((req) => {
        req.profilesSubmitted = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId).length;
        req.interviews = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Interview Scheduled").length;
        req.offers = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && isOfferReleasedStatus(c.status)).length;
        req.joinees = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Joined").length;

        const actualIndex = (Array.isArray(requirements) ? requirements : []).indexOf(req);
        const row = document.createElement("tr");
        const statusBadgeClass = getRequirementStatusClass(req.status);

        row.innerHTML =
            '<td>' + (req.requirementId || '-') + '</td>' +
            '<td>' + (req.client || '-') + '</td>' +
            '<td>' + (req.positionTitle || '-') + '</td>' +
            '<td><span class="status-badge ' + statusBadgeClass + '">' + (req.status || '-') + '</span></td>' +
            '<td><span class="priority-badge ' + (req.priority || 'Medium') + '">' + (req.priority || '-') + '</span></td>' +
            '<td>' + (req.openings || '0') + '</td>' +
            '<td>' + formatDateDisplayIST(req.targetDate, '-') + '</td>' +
            '<td>' + (req.recruiter || '-') + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="editRequirement(' + actualIndex + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteRequirement(' + actualIndex + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);
    });
}
