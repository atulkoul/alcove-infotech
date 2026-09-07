function getDeletedEntries() {
    const storedEntries = localStorage.getItem("armsDeletedEntries");
    if (!storedEntries) return [];

    try {
        const entries = JSON.parse(storedEntries);
        return Array.isArray(entries) ? entries : [];
    } catch (error) {
        return [];
    }
}

function getDeletedEntryId(entry) {
    if (!entry) return "";
    return entry.candidateId || entry.clientId || entry.requirementId || "";
}

function getDeletedEntryName(entry) {
    if (!entry) return "";
    return entry.candidateName || entry.clientName || entry.positionTitle || "";
}

function renderDeletedEntries() {
    const archivedEntries = getDeletedEntries();
    const sections = [
        { type: "candidate", title: "Deleted Candidates", id: "deletedCandidatesSection" },
        { type: "client", title: "Deleted Clients", id: "deletedClientsSection" },
        { type: "requirement", title: "Deleted Requirements", id: "deletedRequirementsSection" }
    ];

    sections.forEach(section => {
        const container = document.getElementById(section.id);
        if (!container) return;
        const entries = archivedEntries
            .map((entry, index) => ({ entry, index }))
            .filter(item => item.entry.type === section.type);
        container.innerHTML = "<section class=\"table-wrapper\" style=\"margin:0 0 20px;\"><div style=\"padding:14px 18px 10px; border-bottom:1px solid #e9ecef;\"><h3 style=\"margin:0;\">" + section.title + "</h3></div><table><thead><tr><th>Original ID</th><th>Name / Title</th><th>Deleted On</th><th>Actions</th></tr></thead><tbody></tbody></table></section>";
        const tableBody = container.querySelector("tbody");
        if (!entries.length) {
            tableBody.innerHTML = '<tr><td colspan="4">No deleted entries.</td></tr>';
            return;
        }

        entries.forEach(item => {
        const archivedEntry = item.entry;
        const row = document.createElement("tr");
        const deletedDate = archivedEntry.deletedAt
            ? new Date(archivedEntry.deletedAt).toLocaleString("en-IN")
            : "";
        const values = [
            getDeletedEntryId(archivedEntry.entry),
            getDeletedEntryName(archivedEntry.entry),
            deletedDate
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const restoreButton = document.createElement("button");
        restoreButton.className = "action-btn";
        restoreButton.textContent = "Restore";
        restoreButton.addEventListener("click", () => restoreDeletedEntry(item.index));
        actionCell.appendChild(restoreButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
        });
    });
}

function restoreDeletedEntry(index) {
    const archivedEntries = getDeletedEntries();
    const archivedEntry = archivedEntries[index];
    if (!archivedEntry || !archivedEntry.entry) return;

    const entry = archivedEntry.entry;
    const type = archivedEntry.type;
    const id = getDeletedEntryId(entry);
    const collections = {
        candidate: { items: candidates, save: saveCandidates },
        client: { items: clients, save: saveClients },
        requirement: { items: requirements, save: saveRequirements }
    };
    const collection = collections[type];
    if (!collection || collection.items.some(item => getDeletedEntryId(item) === id)) {
        alert("This entry cannot be restored because its ID is already in use.");
        return;
    }

    collection.items.push(entry);
    collection.save();
    archivedEntries.splice(index, 1);
    localStorage.setItem("armsDeletedEntries", JSON.stringify(archivedEntries));

    renderDeletedEntries();
    renderTable();
    renderClients(clients);
    renderRequirementsGrid();
    populateClientDropdown();
    populateRequirementClients();
    populateRequirementDropdown();
}
