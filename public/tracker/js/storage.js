/* ==========================================
   Local Storage Module
========================================== */

function initializeAppStorageState() {
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

    return {
        didReset: false,
        hasExistingData
    };
}

function saveCandidates(){

    localStorage.setItem(
        "armsCandidates",
        JSON.stringify(candidates)
    );

}

function archiveDeletedEntry(type, entry) {
    const archivedEntries = JSON.parse(localStorage.getItem("armsDeletedEntries") || "[]");
    archivedEntries.push({
        type,
        deletedAt: new Date().toISOString(),
        entry
    });
    localStorage.setItem("armsDeletedEntries", JSON.stringify(archivedEntries));
}

function loadCandidates(){

    const data =
        localStorage.getItem("armsCandidates");

    if(data){

        candidates = JSON.parse(data);

        const resetCandidate = candidates.find(candidate => candidate && candidate.candidateId === "ALC00003");
        if (resetCandidate && !candidates.some(candidate => candidate && candidate.candidateId === "ALC00002")) {
            resetCandidate.candidateId = "ALC00002";
            if (localStorage.getItem("lastCandidateId") === "3") {
                localStorage.setItem("lastCandidateId", "2");
            }
            saveCandidates();
        }

    }
    else{

        candidates = [];

    }

}

if (typeof window !== "undefined") {
    window.initializeAppStorageState = initializeAppStorageState;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        initializeAppStorageState
    };
}