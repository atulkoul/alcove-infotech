let teamMembers = [];
let teamEditIndex = -1;

function loadTeam() {
    const data = localStorage.getItem("armsTeam");
    teamMembers = data ? JSON.parse(data) : [];
    if (!Array.isArray(teamMembers)) teamMembers = [];
}

function saveTeam() {
    localStorage.setItem("armsTeam", JSON.stringify(teamMembers));
}

function generateTeamEmployeeId() {
    if (teamMembers.length === 0) return "24584";

    const existingIds = new Set(teamMembers.map(member => String(member.employeeId || "")));
    let employeeId = "";

    do {
        const randomValue = window.crypto && window.crypto.getRandomValues
            ? window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
            : Math.random();
        employeeId = String(Math.floor(randomValue * 90000) + 10000);
    } while (existingIds.has(employeeId));

    return employeeId;
}

function openTeamModal(index = -1) {
    teamEditIndex = index;
    const member = index >= 0 ? teamMembers[index] : {};
    document.getElementById("teamEmployeeId").value = member.employeeId || generateTeamEmployeeId();
    document.getElementById("teamEmployeeName").value = member.employeeName || "";
    document.getElementById("teamDesignation").value = member.designation || "";
    document.getElementById("teamMobile").value = member.mobile || "";
    document.getElementById("teamEmail").value = member.email || "";
    document.getElementById("teamLocation").value = member.location || "";
    document.getElementById("teamEmploymentType").value = member.employmentType || "Full Time";
    document.getElementById("teamStatus").value = member.status || "Active";
    document.getElementById("teamModal").classList.add("show");
}

function closeTeamModal() {
    document.getElementById("teamModal").classList.remove("show");
}

function saveTeamMember() {
    const employeeId = document.getElementById("teamEmployeeId").value.trim();
    const employeeName = document.getElementById("teamEmployeeName").value.trim();
    if (!employeeId || !employeeName) {
        alert("Employee ID and Employee Name are required.");
        return;
    }

    const duplicate = teamMembers.some((member, index) => member.employeeId === employeeId && index !== teamEditIndex);
    if (duplicate) {
        alert("Employee ID already exists.");
        return;
    }

    const member = {
        employeeId,
        employeeName,
        designation: document.getElementById("teamDesignation").value.trim(),
        mobile: document.getElementById("teamMobile").value.trim(),
        email: document.getElementById("teamEmail").value.trim(),
        location: document.getElementById("teamLocation").value.trim(),
        employmentType: document.getElementById("teamEmploymentType").value,
        status: document.getElementById("teamStatus").value
    };

    if (teamEditIndex >= 0) teamMembers[teamEditIndex] = member;
    else teamMembers.push(member);
    saveTeam();
    renderTeam();
    populateRecruiterDropdowns();
    closeTeamModal();
}

function renderTeam() {
    const tableBody = document.getElementById("teamBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (!teamMembers.length) {
        tableBody.innerHTML = '<tr><td colspan="9">No team members added.</td></tr>';
        return;
    }

    teamMembers.forEach((member, index) => {
        const row = document.createElement("tr");
        [member.employeeId, member.employeeName, member.designation, member.mobile, member.email, member.location, member.employmentType || "Full Time", member.status || "Active"]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value || "";
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");
        actionCell.innerHTML = '<button class="action-btn" title="Edit Team Member" onclick="openTeamModal(' + index + ')">✏️</button>';
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

function populateRecruiterDropdowns() {
    ["recruiter", "reqRecruiter"].forEach(id => {
        const dropdown = document.getElementById(id);
        if (!dropdown) return;
        const previousValue = dropdown.value;
        dropdown.innerHTML = '<option value="">Select Recruiter</option>';
        teamMembers.filter(member => (member.status || "Active") === "Active").forEach(member => {
            const option = document.createElement("option");
            option.value = member.employeeName;
            option.textContent = member.employeeName;
            dropdown.appendChild(option);
        });
        if (previousValue && !teamMembers.some(member => member.employeeName === previousValue)) {
            const legacyOption = document.createElement("option");
            legacyOption.value = previousValue;
            legacyOption.textContent = previousValue + " (existing)";
            dropdown.appendChild(legacyOption);
        }
        dropdown.value = previousValue;
    });
}
