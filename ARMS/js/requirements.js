/* ===========================================================
   ARMS v1.0
   Requirement Management Module
=========================================================== */

let requirements = [];
let requirementEditIndex = -1;
let requirementChart;

/* ===========================================================
   Create Empty Requirement
=========================================================== */

function createRequirement() {

    return {

        requirementId: generateRequirementId(),
        client: "",
        positionTitle: "",
        department: "",
        location: "",
        openings: "",
        experience: "",
        ctcBudget: "",
        noticePeriod: "",
        hiringManager: "",
        jdLink: "",
        jobDescription: "",
        priority: "Medium",
        status: "Open",
        targetDate: "",
        recruiter: "",
        profilesSubmitted: 0,
        interviews: 0,
        offers: 0,
        joinees: 0,
        comments: "",
        createdDate: getCurrentISTDateString()

    };

}

/* ===========================================================
   Generate Requirement ID
=========================================================== */

function generateRequirementId() {

    let counter = localStorage.getItem("armsRequirementCounter");

    if (!counter) {
        counter = 1;
    } else {
        counter = parseInt(counter) + 1;
    }

    localStorage.setItem("armsRequirementCounter", counter);

    return "REQ" + String(counter).padStart(5, "0");

}

/* ===========================================================
   Save / Load Requirements
=========================================================== */

function saveRequirements() {

    localStorage.setItem("armsRequirements", JSON.stringify(requirements));

}

function loadRequirements() {

    const data = localStorage.getItem("armsRequirements");

    if (data) {
        requirements = JSON.parse(data);
    }

}

/* ===========================================================
   Populate Requirement Client Dropdown
=========================================================== */

function populateRequirementClients() {

    const dropdown = document.getElementById("reqClient");

    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Client</option>';

    (Array.isArray(clients) ? clients : []).forEach(client => {
        const option = document.createElement("option");
        option.value = client.clientName || "";
        option.textContent = client.clientName || "";
        dropdown.appendChild(option);
    });

}

function populateRequirementDropdown() {

    const dropdown = document.getElementById("role");

    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Requirement</option>';

    (Array.isArray(requirements) ? requirements : []).forEach(req => {
        const label = (req.positionTitle || "") + (req.client ? " (" + req.client + ")" : "");
        const option = document.createElement("option");
        option.value = req.requirementId || "";
        option.textContent = (req.requirementId || "") + (label ? " - " + label : "");
        dropdown.appendChild(option);
    });

}

function getRequirementName(id) {

    const req = (Array.isArray(requirements) ? requirements : []).find(r => r.requirementId === id);

    if (!req) return id;

    return (req.positionTitle || "") + (req.client ? " (" + req.client + ")" : "");

}

/* ===========================================================
   Render Requirements Table
=========================================================== */

function updateRequirementDashboard() {

    const total = requirements.length;
    const open = requirements.filter(r => r.status === "Open" || r.status === "In Progress").length;
    const closed = requirements.filter(r => r.status === "Closed").length;
    const positions = requirements.reduce((sum, req) => sum + Number(req.openings || 0), 0);

    const totalReqCount = document.getElementById("totalReqCount");
    const openReqCount = document.getElementById("openReqCount");
    const closedReqCount = document.getElementById("closedReqCount");
    const openPositionCount = document.getElementById("openPositionCount");

    if (totalReqCount) totalReqCount.innerText = total;
    if (openReqCount) openReqCount.innerText = open;
    if (closedReqCount) closedReqCount.innerText = closed;
    if (openPositionCount) openPositionCount.innerText = positions;

}

function getRequirementAge(req) {

    const created = new Date(req.createdDate || new Date());
    const today = new Date();
    const diff = today - created;

    return Math.floor(diff / (1000 * 60 * 60 * 24));

}

function getFilledCount(req) {

    return (Array.isArray(candidates) ? candidates : []).filter(c =>
        c.role === req.requirementId && c.status === "Joined"
    ).length;

}

function getRequirementStatusClass(status) {

    switch (status) {
        case "Open": return "open";
        case "In Progress": return "in-progress";
        case "On Hold": return "on-hold";
        case "Closed": return "closed";
        case "Cancelled": return "cancelled";
        default: return "";
    }

}

function renderFilteredRequirements(data) {

    const tbody = document.getElementById("requirementBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach((req) => {

        req.profilesSubmitted = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId).length;
        req.interviews = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Interview Scheduled").length;
        req.offers = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && isOfferReleasedStatus(c.status)).length;
        req.joinees = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Joined").length;

        const filled = getFilledCount(req);
        const balance = Math.max(0, Number(req.openings || 0) - filled);
        const actualIndex = requirements.indexOf(req);

        const row = document.createElement("tr");

        row.innerHTML =
            '<td>' + (req.requirementId || "") + '</td>' +
            '<td>' + (req.client || "") + '</td>' +
            '<td>' + (req.positionTitle || "") + '</td>' +
            '<td>' + (req.openings || "") + '</td>' +
            '<td><span class="priority-badge ' + (req.priority || "Medium") + '">' + (req.priority || "") + '</span></td>' +
            '<td><span class="status-badge ' + getRequirementStatusClass(req.status) + '">' + (req.status || "") + '</span></td>' +
            '<td>' + getRequirementAge(req) + ' Days</td>' +
            '<td>' + (req.profilesSubmitted || 0) + '</td>' +
            '<td>' + (req.interviews || 0) + '</td>' +
            '<td>' + (req.offers || 0) + '</td>' +
            '<td>' + (req.joinees || 0) + '</td>' +
            '<td>' + filled + '</td>' +
            '<td>' + balance + '</td>' +
            '<td>' + (req.recruiter || "-") + '</td>' +
            '<td>' + (req.profilesSubmitted || 0) + '/' + (req.openings || 0) + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="editRequirement(' + actualIndex + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteRequirement(' + actualIndex + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);

    });

}

function updateRequirementPipeline() {

    const profiles = (Array.isArray(candidates) ? candidates : []).length;
    const interviews = (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Interview Scheduled").length;
    const offers = (Array.isArray(candidates) ? candidates : []).filter(c => isOfferReleasedStatus(c.status)).length;
    const joinees = (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Joined").length;
    const totalOpenings = requirements.reduce((total, req) => total + Number(req.openings || 0), 0);
    const closure = totalOpenings === 0 ? 0 : ((joinees / totalOpenings) * 100).toFixed(1);

    document.getElementById("reqProfilesCount").innerText = profiles;
    document.getElementById("reqInterviewCount").innerText = interviews;
    document.getElementById("reqOfferCount").innerText = offers;
    document.getElementById("reqJoineeCount").innerText = joinees;
    document.getElementById("reqClosurePercent").innerText = closure + "%";

}

function updateSLAAlerts() {

    const count = requirements.filter(req => getRequirementAge(req) > 30 && req.status !== "Closed").length;

    const sla = document.getElementById("slaCount");
    if (sla) {
        sla.innerText = count;
    }

}

function renderRequirementChart() {

    const ctx = document.getElementById("requirementChart");

    if (!ctx) return;

    if (requirementChart) {
        requirementChart.destroy();
    }

    requirementChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Open", "In Progress", "Closed", "On Hold"],
            datasets: [{
                data: [
                    requirements.filter(r => r.status === "Open").length,
                    requirements.filter(r => r.status === "In Progress").length,
                    requirements.filter(r => r.status === "Closed").length,
                    requirements.filter(r => r.status === "On Hold").length
                ]
            }]
        }
    });

}

function renderRequirementPipeline() {

    const container = document.getElementById("requirementPipeline");

    if (!container) return;

    const open = requirements.filter(r => r.status === "Open" || r.status === "In Progress").length;
    const profiles = requirements.reduce((sum, r) => sum + Number(r.profilesSubmitted || 0), 0);
    const interviews = requirements.reduce((sum, r) => sum + Number(r.interviews || 0), 0);
    const offers = requirements.reduce((sum, r) => sum + Number(r.offers || 0), 0);
    const joinees = requirements.reduce((sum, r) => sum + Number(r.joinees || 0), 0);
    const totalOpenings = requirements.reduce((sum, r) => sum + Number(r.openings || 0), 0);
    const totalFilled = requirements.reduce((sum, r) => sum + getFilledCount(r), 0);
    const closurePercent = totalOpenings > 0 ? Math.round((totalFilled / totalOpenings) * 100) : 0;

    container.innerHTML =
        '<div class="stat-card"><h4>Open</h4><h3>' + open + '</h3></div>' +
        '<div class="stat-card"><h4>Profiles Submitted</h4><h3>' + profiles + '</h3></div>' +
        '<div class="stat-card"><h4>Interviews</h4><h3>' + interviews + '</h3></div>' +
        '<div class="stat-card"><h4>Offers</h4><h3>' + offers + '</h3></div>' +
        '<div class="stat-card"><h4>Joinees</h4><h3>' + joinees + '</h3></div>' +
        '<div class="stat-card"><h4>Closures %</h4><h3>' + closurePercent + '%</h3></div>';

}

function renderRequirements() {

    const tbody = document.getElementById("requirementBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    requirements.forEach((req) => {

        req.profilesSubmitted = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId).length;
        req.interviews = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Interview Scheduled").length;
        req.offers = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && isOfferReleasedStatus(c.status)).length;
        req.joinees = (Array.isArray(candidates) ? candidates : []).filter(c => c.role === req.requirementId && c.status === "Joined").length;

        const filled = getFilledCount(req);
        const balance = Math.max(0, Number(req.openings || 0) - filled);
        const actualIndex = requirements.indexOf(req);

        const row = document.createElement("tr");

        row.innerHTML =
            '<td>' + (req.requirementId || "") + '</td>' +
            '<td>' + (req.client || "") + '</td>' +
            '<td>' + (req.positionTitle || "") + '</td>' +
            '<td>' + (req.openings || "") + '</td>' +
            '<td><span class="priority-badge ' + (req.priority || "Medium") + '">' + (req.priority || "") + '</span></td>' +
            '<td><span class="status-badge ' + getRequirementStatusClass(req.status) + '">' + (req.status || "") + '</span></td>' +
            '<td>' + getRequirementAge(req) + ' Days</td>' +
            '<td>' + (req.profilesSubmitted || 0) + '</td>' +
            '<td>' + (req.interviews || 0) + '</td>' +
            '<td>' + (req.offers || 0) + '</td>' +
            '<td>' + (req.joinees || 0) + '</td>' +
            '<td>' + filled + '</td>' +
            '<td>' + balance + '</td>' +
            '<td>' + (req.recruiter || "-") + '</td>' +
            '<td>' + (req.profilesSubmitted || 0) + '/' + (req.openings || 0) + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="editRequirement(' + actualIndex + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteRequirement(' + actualIndex + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);

    });

    updateRequirementDashboard();
    updateRequirementPipeline();
    updateSLAAlerts();
    renderRequirementPipeline();
    renderRequirementChart();

}

/* ===========================================================
   Open / Close Modal
=========================================================== */

function openRequirementModal() {

    requirementEditIndex = -1;

    clearRequirementForm();
    populateRequirementClients();

    const modal = document.getElementById("requirementModal");
    if (modal) {
        modal.classList.add("show");
    }

}

function closeRequirementModal() {

    const modal = document.getElementById("requirementModal");
    if (modal) {
        modal.classList.remove("show");
    }

}

function clearRequirementForm() {

    const client = document.getElementById("reqClient");
    if (client) {
        client.value = "";
    }

    const position = document.getElementById("reqPosition");
    if (position) {
        position.value = "";
    }

    const department = document.getElementById("reqDepartment");
    if (department) {
        department.value = "";
    }

    const location = document.getElementById("reqLocation");
    if (location) {
        location.value = "";
    }

    const openings = document.getElementById("reqOpenings");
    if (openings) {
        openings.value = "";
    }

    const experience = document.getElementById("reqExperience");
    if (experience) {
        experience.value = "";
    }

    const ctc = document.getElementById("reqCTC");
    if (ctc) {
        ctc.value = "";
    }

    const hiringManager = document.getElementById("reqHiringManager");
    if (hiringManager) {
        hiringManager.value = "";
    }

    const targetDate = document.getElementById("reqTargetDate");
    if (targetDate) {
        targetDate.value = "";
    }

    const priority = document.getElementById("reqPriority");
    if (priority) {
        priority.value = "Medium";
    }

    const status = document.getElementById("reqStatus");
    if (status) {
        status.value = "Open";
    }

    const jobDescription = document.getElementById("reqJobDescription");
    if (jobDescription) {
        jobDescription.value = "";
    }

    const comments = document.getElementById("reqComments");
    if (comments) {
        comments.value = "";
    }
}

/* ===========================================================
   Save Requirement
=========================================================== */

function saveRequirement() {

    const client = document.getElementById("reqClient").value;
    const positionTitle = document.getElementById("reqPosition").value.trim();

    if (!client || positionTitle === "") {
        alert("Client and Position Title are required.");
        return;
    }

    let req;

    if (requirementEditIndex === -1) {
        req = createRequirement();
        requirements.push(req);
    } else {
        req = requirements[requirementEditIndex];
    }

    req.client = client;
    req.positionTitle = positionTitle;
    req.department = document.getElementById("reqDepartment").value;
    req.location = document.getElementById("reqLocation").value;
    req.openings = document.getElementById("reqOpenings").value;
    req.experience = document.getElementById("reqExperience").value;
    req.ctcBudget = document.getElementById("reqCTC").value;
    req.hiringManager = document.getElementById("reqHiringManager").value;
    req.targetDate = document.getElementById("reqTargetDate").value;
    req.priority = document.getElementById("reqPriority").value;
    req.status = document.getElementById("reqStatus").value;
    req.jobDescription = document.getElementById("reqJobDescription").value.trim().slice(0, 4000);
    req.comments = document.getElementById("reqComments").value;

    saveRequirements();
    renderRequirementsGrid();
    populateRequirementDropdown();
    closeRequirementModal();

}

/* ===========================================================
   Edit / Delete Requirement
=========================================================== */

function editRequirement(index) {

    const req = requirements[index];

    if (!req) return;

    requirementEditIndex = index;
    populateRequirementClients();

    document.getElementById("reqClient").value = req.client || "";
    document.getElementById("reqPosition").value = req.positionTitle || "";
    document.getElementById("reqDepartment").value = req.department || "";
    document.getElementById("reqLocation").value = req.location || "";
    document.getElementById("reqOpenings").value = req.openings || "";
    document.getElementById("reqExperience").value = req.experience || "";
    document.getElementById("reqCTC").value = req.ctcBudget || "";
    document.getElementById("reqHiringManager").value = req.hiringManager || "";
    document.getElementById("reqTargetDate").value = req.targetDate || "";
    document.getElementById("reqPriority").value = req.priority || "Medium";
    document.getElementById("reqStatus").value = req.status || "Open";
    document.getElementById("reqJobDescription").value = (req.jobDescription || "").slice(0, 4000);
    document.getElementById("reqComments").value = req.comments || "";

    const modal = document.getElementById("requirementModal");
    if (modal) {
        modal.classList.add("show");
    }

}

function deleteRequirement(index) {

    if (confirm("Delete this requirement?")) {
        requirements.splice(index, 1);
        saveRequirements();
        renderRequirementsGrid();
        populateRequirementDropdown();
    }

}

function searchRequirements() {

    const text = document.getElementById("reqSearch").value.toLowerCase();

    if (!text) {
        renderRequirementsGrid();
        return;
    }

    const filtered = requirements.filter(r => {
        const client = String(r.client || "").toLowerCase();
        const position = String(r.positionTitle || "").toLowerCase();
        return client.includes(text) || position.includes(text);
    });

    renderRequirementsGrid(filtered);
}
