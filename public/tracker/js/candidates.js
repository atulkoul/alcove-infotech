/* ===========================================================
   ARMS v1.0
   Candidate Management Module
=========================================================== */

let candidates = [];
let currentFilter = null;

/* ===========================================================
   Create Empty Candidate
=========================================================== */

function createCandidate() {

    return {

        candidateId: generateCandidateId(),

        date: "",
        client: "",
        role: "",
        candidateName: "",
        mobile: "",
        email: "",
        source: "",
        recruiter: "",
        experience: "",
        currentCompany: "",
        currentCTC: "",
        expectedCTC: "",
        offeredCTC: "",
        noticePeriod: "",
        currentLocation: "",
        preferredLocation: "",

        screening: "Not Started",
        shared: "No",
        resumeReceived: "No",

        resumeSharedDate: "",
        clientFeedback: "",
        interviewDate: "",
        interviewRound: "",
        interviewMode: "",
        interviewPanel: "",
        meetingLink: "",
        calendarNotes: "",
        reminderSent: "No",
        joiningReminder: "No",
        resumeFile: "",
        resumeName: "",
        resumeUploadedDate: "",
        resumeVersion: "1",

        status: "Lead Created",

        offerReleased: "No",
        doj: "",

        followupDate: "",
        comments: ""

    };

}

/* ===========================================================
   Add Candidate
=========================================================== */

function addCandidate() {

    const candidate = createCandidate();

    candidates.push(candidate);

    saveCandidates();

    renderTable();

}

/* ===========================================================
   Render Table
=========================================================== */

function renderTable() {

    const tbody =
        document.getElementById("candidateBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    candidates.forEach((candidate, index) => {

        const row =
            document.createElement("tr");

        row.innerHTML =
            '<td>' + (candidate.candidateId || "") + '</td>' +
            '<td>' + (candidate.candidateName || "") + '</td>' +
            '<td>' + (candidate.client || "") + '</td>' +
            '<td>' + getRequirementName(candidate.role) + '</td>' +
            '<td>' + (candidate.recruiter || "") + '</td>' +
            '<td>' + (candidate.status || "") + '</td>' +
            '<td>' + formatDateDisplayIST(candidate.followupDate, "-") + '</td>' +
            '<td>' +
                '<button class="action-btn" title="AI Resume Match" onclick="compareCandidateWithRequirement(' + index + ')">✦</button>' +
                '<button class="action-btn" title="Map Requirement" onclick="openRequirementMappingModal(' + index + ')">🔗</button>' +
                '<button class="action-btn" onclick="editCandidate(' + index + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteCandidate(' + index + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);

    });

    updateDashboard();

    updatePipeline();

    updateFollowups();

    updateMainDashboard();

}

/* ===========================================================
   Filter By Status
=========================================================== */

function filterByStatus(status){

    currentFilter = status;

    const filtered =
        candidates.filter(
            c => status === "Offer Release"
                ? isOfferReleasedStatus(c.status)
                : c.status === status
        );

    renderFilteredTable(filtered);

}

function searchCandidates(){

    const searchText =
        document.getElementById("searchInput")
            .value.toLowerCase();

    const status =
        document.getElementById("statusFilter")
            .value;

    const filtered = candidates.filter(candidate => {

        const matchSearch =
            (candidate.candidateName || "")
                .toLowerCase()
                .includes(searchText) ||
            (candidate.mobile || "")
                .toLowerCase()
                .includes(searchText) ||
            (candidate.client || "")
                .toLowerCase()
                .includes(searchText) ||
            (candidate.recruiter || "")
                .toLowerCase()
                .includes(searchText);

        const matchStatus =
            status === "" ||
            (status === "Offer Release"
                ? isOfferReleasedStatus(candidate.status)
                : candidate.status === status);

        return matchSearch && matchStatus;

    });

    renderFilteredTable(filtered);

}

/* ===========================================================
   Render Filtered Table
=========================================================== */

function renderFilteredTable(data){

    const tbody =
        document.getElementById("candidateBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach((candidate)=>{

        const actualIndex =
            candidates.indexOf(candidate);

        const row =
            document.createElement("tr");

        row.innerHTML =
            '<td>' + (candidate.candidateId || "") + '</td>' +
            '<td>' + (candidate.candidateName || "") + '</td>' +
            '<td>' + (candidate.client || "") + '</td>' +
            '<td>' + getRequirementName(candidate.role) + '</td>' +
            '<td>' + (candidate.recruiter || "") + '</td>' +
            '<td>' + (candidate.status || "") + '</td>' +
            '<td>' + formatDateDisplayIST(candidate.followupDate, "-") + '</td>' +
            '<td>' +
                '<button class="action-btn" title="AI Resume Match" onclick="compareCandidateWithRequirement(' + actualIndex + ')">✦</button>' +
                '<button class="action-btn" title="Map Requirement" onclick="openRequirementMappingModal(' + actualIndex + ')">🔗</button>' +
                '<button class="action-btn" onclick="editCandidate(' + actualIndex + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteCandidate(' + actualIndex + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);

    });

}

/* ===========================================================
   Delete Candidate
=========================================================== */

function deleteCandidate(index){

    if(confirm("Delete this candidate?")){

        archiveDeletedEntry("candidate", candidates[index]);
        candidates.splice(index,1);

        saveCandidates();

        renderTable();

    }

}

/* ===========================================================
   Dashboard
=========================================================== */

function updateDashboard(){

    const total =
        document.getElementById("totalCandidates");

    if(total){

        total.innerText =
            candidates.length;

    }

    const shared =
        document.getElementById("sharedCount");

    if(shared){

        shared.innerText =
            candidates.filter(
                c => c.shared === "Yes"
            ).length;

    }

    const selected =
        document.getElementById("selectedCount");

    if(selected){

        selected.innerText =
            candidates.filter(
                c => c.status === "Joined"
            ).length;

    }

    const rejected =
        document.getElementById("rejectedCount");

    if(rejected){

        rejected.innerText =
            candidates.filter(
                c => c.status === "Rejected"
            ).length;

    }

    const progress =
        document.getElementById("progressCount");

    if(progress){

        progress.innerText =
            candidates.filter(
                c =>
                    c.status === "Screening" ||
                    c.status === "Resume Shared" ||
                    c.status === "Interview Scheduled" ||
                    c.status === "Client Interview"
            ).length;

    }

    const hold =
        document.getElementById("holdCount");

    if(hold){

        hold.innerText =
            candidates.filter(
                c => c.status === "On Hold"
            ).length;

    }

}

/* ===========================================================
   Edit Candidate
=========================================================== */

function editCandidate(index){

    const c = candidates[index];

    if(!c) return;

    editIndex = index;

    document.getElementById("modalTitle")
        .innerText = "Edit Candidate";

    document.getElementById("candidateName").value =
        c.candidateName || "";

    document.getElementById("mobile").value =
        c.mobile || "";

    document.getElementById("email").value =
        c.email || "";

    document.getElementById("client").value =
        c.client || "";

    document.getElementById("role").value =
        c.role || "";

    document.getElementById("recruiter").value =
        c.recruiter || "";

    document.getElementById("source").value =
        c.source || "";

    document.getElementById("experience").value =
        c.experience || "";

    document.getElementById("currentCompany").value =
        c.currentCompany || "";

    document.getElementById("currentCTC").value =
        c.currentCTC || "";

    document.getElementById("expectedCTC").value =
        c.expectedCTC || "";

    document.getElementById("offeredCTC").value =
        c.offeredCTC || "";

    document.getElementById("noticePeriod").value =
        c.noticePeriod || "";

    document.getElementById("currentLocation").value =
        c.currentLocation || "";

    document.getElementById("preferredLocation").value =
        c.preferredLocation || "";

    document.getElementById("status").value =
        c.status || "";

    document.getElementById("interviewDate").value =
        c.interviewDate || "";

    document.getElementById("interviewRound").value =
        c.interviewRound || "";

    document.getElementById("interviewMode").value =
        c.interviewMode || "";

    document.getElementById("interviewPanel").value =
        c.interviewPanel || "";

    document.getElementById("meetingLink").value =
        c.meetingLink || "";

    document.getElementById("offerReleased").value =
        c.offerReleased || "No";

    document.getElementById("doj").value =
        c.doj || "";

    document.getElementById("followupDate").value =
        c.followupDate || "";

    document.getElementById("clientFeedback").value =
        c.clientFeedback || "";

    document.getElementById("calendarNotes").value =
        c.calendarNotes || "";

    document.getElementById("comments").value =
        c.comments || "";

    const resumeStatus = document.getElementById("resumeStatus");
    if (resumeStatus) {
        resumeStatus.innerText = c.resumeName ? "Resume: " + c.resumeName + " (v" + (c.resumeVersion || "1") + ")" : "No resume uploaded";
    }

    const resumeInput = document.getElementById("resumeUpload");
    if (resumeInput) {
        resumeInput.value = "";
    }

    pendingResumeFile = null;

    document.getElementById(
        "candidateModal"
    ).classList.add("show");

}

/* ===========================================================
   Pipeline
=========================================================== */

function updatePipeline(){

    const total =
        document.getElementById(
            "totalCandidateCount"
        );

    if(total){

        total.innerText =
            candidates.length;

    }

    const lead =
        document.getElementById("leadCount");

    if(lead){

        lead.innerText =
            candidates.filter(
                c => c.status === "Lead Created"
            ).length;

    }

    const screening =
        document.getElementById(
            "screeningCount"
        );

    if(screening){

        screening.innerText =
            candidates.filter(
                c => c.status === "Screening"
            ).length;

    }

    const interview =
        document.getElementById(
            "interviewCount"
        );

    if(interview){

        interview.innerText =
            candidates.filter(
                c => c.status === "Interview Scheduled"
            ).length;

    }

    const offer =
        document.getElementById(
            "offerCount"
        );

    if(offer){

        offer.innerText =
            candidates.filter(
                c => isOfferReleasedStatus(c.status)
            ).length;

    }

    const joined =
        document.getElementById(
            "joinedCount"
        );

    if(joined){

        joined.innerText =
            candidates.filter(
                c => c.status === "Joined"
            ).length;

    }

    const rejected =
        document.getElementById(
            "rejectedCount"
        );

    if(rejected){

        rejected.innerText =
            candidates.filter(
                c => c.status === "Rejected"
            ).length;

    }

}

/* ===========================================================
   Clear Filters
=========================================================== */

function clearFilters(){

    currentFilter = null;

    const search =
        document.getElementById("searchInput");

    if(search){
        search.value = "";
    }

    const status =
        document.getElementById("statusFilter");

    if(status){
        status.value = "";
    }

    renderTable();

}

function updateFollowups(){

    const today = getCurrentISTDateString();

    const count = candidates.filter(
        c => c.followupDate === today
    ).length;

    const element = document.getElementById("todayFollowupCount");

    if(element){
        element.innerText = count;
    }

}

function downloadResume(index){

    const candidate = candidates[index];

    if(!candidate || !candidate.resumeFile){
        alert("No resume uploaded for this candidate.");
        return;
    }

    const link = document.createElement("a");
    link.href = candidate.resumeFile;
    link.download = candidate.resumeName || "resume.pdf";
    link.click();

}

function markReminderSent(index){

    const candidate = candidates[index];

    if(!candidate) return;

    if(candidate.doj && candidate.doj <= shiftDateInputValue(getCurrentISTDateString(), 7)){
        candidate.joiningReminder = "Yes";
    } else {
        candidate.reminderSent = "Yes";
    }

    saveCandidates();
    renderTable();

}
