/* ==========================================================
   ARMS v1.0
   Main Application
========================================================== */

let editIndex = -1;
let pendingResumeFile = null;

function runOneTimeDataReset() {
    const resetMarkerKey = "armsDataResetDoneV1";
    const persistedKeys = [
        "armsCandidates",
        "armsClients",
        "armsRequirements",
        "armsTeam",
        "armsVendors",
        "armsInterviews",
        "armsInvoices",
        "lastCandidateId",
        "armsClientCounter",
        "armsRequirementCounter",
        "armsVendorCounter",
        "armsInvoiceCounter"
    ];

    const hasExistingData = persistedKeys.some(key => {
        const value = localStorage.getItem(key);
        return value !== null && value !== undefined && value !== "";
    });

    if (localStorage.getItem(resetMarkerKey) !== "true") {
        localStorage.setItem(resetMarkerKey, "true");
    }

    if (!hasExistingData && localStorage.getItem("armsDisableStarterData") !== "true") {
        localStorage.setItem("armsDisableStarterData", "true");
    }
}

function switchView(viewName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.menu').forEach(button => {
        button.classList.remove('active');
    });

    if (viewName === 'candidates') {
        document.getElementById('candidatesView').classList.add('active');
        document.getElementById('navCandidates').classList.add('active');
    } else if (viewName === 'clients') {
        document.getElementById('clientsView').classList.add('active');
        document.getElementById('navClients').classList.add('active');
    } else if (viewName === 'requirements') {
        document.getElementById('requirementsView').classList.add('active');
        document.getElementById('navRequirements').classList.add('active');
        renderRequirementsGrid();
    } else if (viewName === 'interviews') {
        document.getElementById('interviewsView').classList.add('active');
        document.getElementById('navInterviews').classList.add('active');
        renderInterviewsGrid();
    } else if (viewName === 'invoices') {
        document.getElementById('invoicesView').classList.add('active');
        document.getElementById('navInvoices').classList.add('active');
        renderInvoicesList();
    } else if (viewName === 'team') {
        document.getElementById('teamView').classList.add('active');
        document.getElementById('navTeam').classList.add('active');
        renderTeam();
    } else if (viewName === 'deletedEntries') {
        document.getElementById('deletedEntriesView').classList.add('active');
        document.getElementById('navDeletedEntries').classList.add('active');
        renderDeletedEntries();
    } else {
        document.getElementById('dashboardView').classList.add('active');
        document.getElementById('navDashboard').classList.add('active');
    }
}

/* ==========================================================
   DOM Ready
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    runOneTimeDataReset();
    initializeAppStorageState();

    loadCandidates();
    loadClients();
    loadRequirements();
    loadVendors();
    loadInterviews();
    loadInvoices();
    loadTeam();
    loadStarterData();

    renderTable();
    renderClients();
    populateClientDropdown();
    populateRequirementClients();
    populateRequirementDropdown();
    renderRequirementsGrid();
    renderVendors();
    renderTeam();
    populateRecruiterDropdowns();
    updateRevenueDashboard();
    updateRecruiterProductivity();
    updateReportsDashboard();
    renderAuthPanel();
    applyRoleRestrictions();
    switchView('dashboard');

    runNotifications();
    renderEmailTemplates();
    buildActivityFeed();
    initializeSearch();

    const addBtn = document.getElementById("addCandidateBtn");
    const addClientBtn = document.getElementById("addClientBtn");
    const modal = document.getElementById("candidateModal");
    const closeBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");
    const closeClientBtn = document.getElementById("closeClientModal");
    const cancelClientBtn = document.getElementById("cancelClientBtn");
    const saveClientBtn = document.getElementById("saveClientBtn");
    const closeRequirementBtn = document.getElementById("closeRequirementModal");
    const resumeInput = document.getElementById("resumeUpload");

    addBtn.addEventListener("click", openAddCandidate);
    if (addClientBtn) {
        addClientBtn.addEventListener("click", openClientModal);
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    saveBtn.addEventListener("click", saveCandidate);

    if (closeClientBtn) {
        closeClientBtn.addEventListener("click", closeClientModal);
    }
    if (cancelClientBtn) {
        cancelClientBtn.addEventListener("click", closeClientModal);
    }
    if (closeRequirementBtn) {
        closeRequirementBtn.addEventListener("click", closeRequirementModal);
    }

    if (resumeInput) {
        resumeInput.addEventListener("change", (event) => {
            pendingResumeFile = event.target.files[0] || null;
            const status = document.getElementById("resumeStatus");
            if (status) {
                status.innerText = pendingResumeFile ? "Resume selected: " + pendingResumeFile.name : "No resume uploaded";
            }
        });
    }

});

/* ==========================================================
   Open Popup
========================================================== */

function openAddCandidate(){

    editIndex = -1;

    document.getElementById("modalTitle").innerText =
        "Add Candidate";

    clearForm();
    populateRequirementDropdown();
    populateRecruiterDropdowns();

    document.getElementById("candidateModal")
        .classList.add("show");

}

/* ==========================================================
   Close Popup
========================================================== */

function closeModal(){

    document.getElementById("candidateModal")
        .classList.remove("show");

}

/* ==========================================================
   Clear Form
========================================================== */

function clearForm(){

    document.getElementById("candidateName").value="";
    document.getElementById("mobile").value="";
    document.getElementById("email").value="";
    document.getElementById("client").value="";
    document.getElementById("role").value="";
    document.getElementById("recruiter").value="";
    document.getElementById("source").selectedIndex=0;
    document.getElementById("experience").value="";
    document.getElementById("currentCompany").value="";
    document.getElementById("currentCTC").value="";
    document.getElementById("expectedCTC").value="";
    document.getElementById("offeredCTC").value="";
    document.getElementById("noticePeriod").value="";
    document.getElementById("currentLocation").value="";
    document.getElementById("preferredLocation").value="";
    document.getElementById("status").value="Lead Created";
    document.getElementById("interviewDate").value="";
    document.getElementById("interviewRound").value="";
    document.getElementById("interviewMode").value="";
    document.getElementById("interviewPanel").value="";
    document.getElementById("meetingLink").value="";
    document.getElementById("offerReleased").value="No";
    document.getElementById("doj").value="";
    document.getElementById("followupDate").value="";
    document.getElementById("clientFeedback").value="";
    document.getElementById("calendarNotes").value="";
    document.getElementById("comments").value="";

    const resumeInput = document.getElementById("resumeUpload");
    if (resumeInput) {
        resumeInput.value = "";
    }

    const resumeStatus = document.getElementById("resumeStatus");
    if (resumeStatus) {
        resumeStatus.innerText = "No resume uploaded";
    }

    pendingResumeFile = null;

}

/* ==========================================================
   Save Candidate
========================================================== */

async function saveCandidate(){

    const name=document.getElementById("candidateName").value.trim();

    if(name===""){

        alert("Candidate Name is required.");

        return;

    }

    const existingCandidate = editIndex === -1 ? null : candidates[editIndex];
    const candidate=createCandidate();

    candidate.candidateName=name;
    candidate.mobile=document.getElementById("mobile").value;
    candidate.email=document.getElementById("email").value;
    candidate.client=document.getElementById("client").value;
    candidate.role=document.getElementById("role").value;
    candidate.recruiter=document.getElementById("recruiter").value;
    candidate.source=document.getElementById("source").value;
    candidate.experience=document.getElementById("experience").value;
    candidate.currentCompany=document.getElementById("currentCompany").value;
    candidate.currentCTC=document.getElementById("currentCTC").value;
    candidate.expectedCTC=document.getElementById("expectedCTC").value;
    candidate.offeredCTC=document.getElementById("offeredCTC").value;
    candidate.noticePeriod=document.getElementById("noticePeriod").value;
    candidate.currentLocation=document.getElementById("currentLocation").value;
    candidate.preferredLocation=document.getElementById("preferredLocation").value;
    candidate.status=document.getElementById("status").value;
    candidate.interviewDate=document.getElementById("interviewDate").value;
    candidate.interviewRound=document.getElementById("interviewRound").value;
    candidate.interviewMode=document.getElementById("interviewMode").value;
    candidate.interviewPanel=document.getElementById("interviewPanel").value;
    candidate.meetingLink=document.getElementById("meetingLink").value;
    candidate.offerReleased=document.getElementById("offerReleased").value;
    candidate.doj=document.getElementById("doj").value;
    candidate.followupDate=document.getElementById("followupDate").value;
    candidate.clientFeedback=document.getElementById("clientFeedback").value;
    candidate.calendarNotes=document.getElementById("calendarNotes").value;
    candidate.comments=document.getElementById("comments").value;

    await attachResumeToCandidate(candidate, existingCandidate);

    if (isOfferReleasedStatus(candidate.status)) {
        candidate.offerReleased = "Yes";
    }

    if (candidate.status === "Joined") {
        candidate.offerReleased = "Yes";
    }

    if(editIndex === -1){

    candidates.push(candidate);

}
else{

    candidate.candidateId =
        existingCandidate.candidateId;

    candidates[editIndex] = candidate;

}

renderTable();

saveCandidates();

closeModal();

}