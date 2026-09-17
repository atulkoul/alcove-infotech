/* ==========================================
   Local Storage Module
========================================== */

const TRACKER_SYNC_ENDPOINT = "/tracker/api/sync";
const TRACKER_STORAGE_KEYS = {
    candidates: "armsCandidates",
    clients: "armsClients",
    requirements: "armsRequirements",
    team: "armsTeam",
    vendors: "armsVendors",
    interviews: "armsInterviews",
    invoices: "armsInvoices",
    deletedEntries: "armsDeletedEntries",
    lastCandidateId: "lastCandidateId",
    clientCounter: "armsClientCounter",
    requirementCounter: "armsRequirementCounter",
    vendorCounter: "armsVendorCounter",
    invoiceCounter: "armsInvoiceCounter"
};

function initializeAppStorageState() {
    const resetMarkerKey = "armsDataResetDoneV1";
    const persistedKeys = Object.values(TRACKER_STORAGE_KEYS);

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

function writeSnapshotToLocalStorage(snapshot = {}) {
    Object.entries(snapshot).forEach(([key, value]) => {
        const storageKey = TRACKER_STORAGE_KEYS[key] || key;
        if (value === undefined || value === null) {
            localStorage.removeItem(storageKey);
            return;
        }
        localStorage.setItem(storageKey, JSON.stringify(value));
    });
}

function readSnapshotFromLocalStorage() {
    const snapshot = {};
    Object.entries(TRACKER_STORAGE_KEYS).forEach(([key, storageKey]) => {
        const value = localStorage.getItem(storageKey);
        if (value === null || value === undefined || value === "") {
            return;
        }
        try {
            snapshot[key] = JSON.parse(value);
        } catch (_error) {
            snapshot[key] = value;
        }
    });
    return snapshot;
}

async function loadTrackerStateFromServer() {
    if (typeof fetch !== "function") {
        return null;
    }

    try {
        const response = await fetch(TRACKER_SYNC_ENDPOINT, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response || !response.ok) {
            return null;
        }

        const data = await response.json();
        return data && typeof data === "object" ? data : null;
    } catch (_error) {
        return null;
    }
}

async function persistTrackerData(snapshot = {}) {
    const currentSnapshot = {
        candidates: typeof candidates !== "undefined" && Array.isArray(candidates) ? candidates : [],
        clients: typeof clients !== "undefined" && Array.isArray(clients) ? clients : [],
        requirements: typeof requirements !== "undefined" && Array.isArray(requirements) ? requirements : [],
        team: typeof team !== "undefined" && Array.isArray(team) ? team : [],
        vendors: typeof vendors !== "undefined" && Array.isArray(vendors) ? vendors : [],
        interviews: typeof interviews !== "undefined" && Array.isArray(interviews) ? interviews : [],
        invoices: typeof invoices !== "undefined" && Array.isArray(invoices) ? invoices : [],
        deletedEntries: typeof deletedEntries !== "undefined" && Array.isArray(deletedEntries) ? deletedEntries : [],
        lastCandidateId: typeof lastCandidateId !== "undefined" ? lastCandidateId : localStorage.getItem("lastCandidateId"),
        clientCounter: localStorage.getItem("armsClientCounter"),
        requirementCounter: localStorage.getItem("armsRequirementCounter"),
        vendorCounter: localStorage.getItem("armsVendorCounter"),
        invoiceCounter: localStorage.getItem("armsInvoiceCounter")
    };

    const finalSnapshot = {
        ...currentSnapshot,
        ...snapshot
    };

    writeSnapshotToLocalStorage(finalSnapshot);

    if (typeof fetch !== "function") {
        return finalSnapshot;
    }

    try {
        const response = await fetch(TRACKER_SYNC_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(finalSnapshot)
        });

        if (!response || !response.ok) {
            throw new Error("Remote sync failed");
        }

        const result = await response.json().catch(() => null);
        return result && typeof result === "object" ? result : finalSnapshot;
    } catch (_error) {
        return finalSnapshot;
    }
}

async function saveCandidates() {
    return persistTrackerData({ candidates });
}

function archiveDeletedEntry(type, entry) {
    const archivedEntries = JSON.parse(localStorage.getItem("armsDeletedEntries") || "[]");
    archivedEntries.push({
        type,
        deletedAt: new Date().toISOString(),
        entry
    });
    localStorage.setItem("armsDeletedEntries", JSON.stringify(archivedEntries));
    persistTrackerData({ deletedEntries: archivedEntries });
}

async function loadCandidates() {
    const remoteData = await loadTrackerStateFromServer();

    const localData = localStorage.getItem("armsCandidates");
    const sourceData = (remoteData && Array.isArray(remoteData.candidates)) ? remoteData.candidates : (localData ? JSON.parse(localData) : null);

    if (sourceData) {
        candidates = Array.isArray(sourceData) ? sourceData : [];
        writeSnapshotToLocalStorage({ candidates });

        const resetCandidate = candidates.find(candidate => candidate && candidate.candidateId === "ALC00003");
        if (resetCandidate && !candidates.some(candidate => candidate && candidate.candidateId === "ALC00002")) {
            resetCandidate.candidateId = "ALC00002";
            if (localStorage.getItem("lastCandidateId") === "3") {
                localStorage.setItem("lastCandidateId", "2");
            }
            await saveCandidates();
        }

        return;
    }

    candidates = [];
}

if (typeof window !== "undefined") {
    window.initializeAppStorageState = initializeAppStorageState;
    window.loadTrackerStateFromServer = loadTrackerStateFromServer;
    window.persistTrackerData = persistTrackerData;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        initializeAppStorageState,
        loadTrackerStateFromServer,
        persistTrackerData,
        writeSnapshotToLocalStorage,
        readSnapshotFromLocalStorage
    };
}