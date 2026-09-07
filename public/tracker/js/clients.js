/* ===========================================================
   ARMS v1.0
   Client Management Module
=========================================================== */

let clients = [];
let clientEditIndex = -1;

/* ===========================================================
   Create Empty Client
=========================================================== */

function createClient() {

    return {

        clientId: generateClientId(),

        clientName: "",
        industry: "",
        pocName: "",
        email: "",
        mobile: "",
        location: "",
        activeRoles: "",
        agreementSigned: "No",
        agreementDate: "",
        contractType: "",
        paymentTerms: "",
        gstNumber: "",
        address: "",
        linkedin: "",
        accountManager: "",
        status: "Active",
        billingTerms: "",
        commercialsPercentage: "",
        billingPercentage: "",
        invoiceAmount: "",
        invoiceStatus: "Pending",
        invoiceDate: "",
        paymentDate: "",
        comments: "",
        createdDate: getCurrentISTDateString()

    };

}

/* ===========================================================
   Generate Client ID
=========================================================== */

function generateClientId() {

    let lastId = localStorage.getItem("armsClientCounter");

    if (!lastId) {
        lastId = 1;
    } else {
        lastId = parseInt(lastId) + 1;
    }

    localStorage.setItem("armsClientCounter", lastId);

    return "CLI" + String(lastId).padStart(4, "0");

}

/* ===========================================================
   Save Clients
=========================================================== */

function saveClients() {

    localStorage.setItem("armsClients", JSON.stringify(clients));

}

/* ===========================================================
   Load Clients
=========================================================== */

function loadClients() {

    const data = localStorage.getItem("armsClients");

    if (data) {
        clients = JSON.parse(data);
    }

}

function getClientFieldValue(id, fallbackId) {
    const el = document.getElementById(id) || document.getElementById(fallbackId);
    return el ? el.value : "";
}

function setClientFieldValue(id, fallbackId, value) {
    const el = document.getElementById(id) || document.getElementById(fallbackId);
    if (el) {
        el.value = value;
    }
}

/* ===========================================================
   Render Client Table
=========================================================== */

function populateClientDropdown() {

    const dropdown = document.getElementById("client");

    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Client</option>';

    clients.forEach(client => {
        const option = document.createElement("option");
        option.value = client.clientName || "";
        option.textContent = client.clientName || "";
        dropdown.appendChild(option);
    });

}

function searchClients() {

    const searchText =
        document.getElementById("clientSearchInput")
            .value.toLowerCase();

    const filtered = clients.filter(client => {

        return (
            (client.clientName || "")
                .toLowerCase()
                .includes(searchText) ||
            (client.pocName || "")
                .toLowerCase()
                .includes(searchText) ||
            (client.mobile || "")
                .toLowerCase()
                .includes(searchText) ||
            (client.location || "")
                .toLowerCase()
                .includes(searchText) ||
            (client.activeRoles || "")
                .toLowerCase()
                .includes(searchText)
        );

    });

    renderClients(filtered);

}

function renderClients(data = clients) {

    const tbody = document.getElementById("clientBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach((client, index) => {

        const candidateCount = Array.isArray(candidates)
            ? candidates.filter(c => c.client === client.clientName).length
            : 0;

        const row = document.createElement("tr");

        row.innerHTML =
            '<td>' + (client.clientId || "") + '</td>' +
            '<td>' + (client.clientName || "") + '</td>' +
            '<td>' + (client.pocName || "") + '</td>' +
            '<td>' + (client.mobile || "") + '</td>' +
            '<td>' + (client.location || "") + '</td>' +
            '<td>' + (client.activeRoles || "-") + '</td>' +
            '<td>' + candidateCount + '</td>' +
            '<td>' + (client.agreementSigned || "No") + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="editClient(' + index + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteClient(' + index + ')">🗑️</button>' +
            '</td>';

        tbody.appendChild(row);

    });

}

/* ===========================================================
   Open Client Modal
=========================================================== */

function openClientModal() {

    clientEditIndex = -1;

    const title = document.getElementById("clientModalTitle");
    if (title) {
        title.innerText = "Add Client";
    }

    clearClientForm();

    const modal = document.getElementById("clientModal");
    if (modal) {
        modal.classList.add("show");
    }

}

function openAddClient() {
    openClientModal();
}

/* ===========================================================
   Close Client Modal
=========================================================== */

function closeClientModal() {

    const modal = document.getElementById("clientModal");
    if (modal) {
        modal.classList.remove("show");
    }

    clearClientForm();

}

/* ===========================================================
   Clear Client Form
=========================================================== */

function clearClientForm() {

    setClientFieldValue("clientNameInput", "clientName", "");
    setClientFieldValue("industryInput", "industry", "");
    setClientFieldValue("pocNameInput", "pocName", "");
    setClientFieldValue("clientEmailInput", "email", "");
    setClientFieldValue("clientMobileInput", "clientMobile", "");
    setClientFieldValue("clientLocationInput", "location", "");
    setClientFieldValue("activeRolesInput", "activeRoles", "");
    setClientFieldValue("agreementInput", "agreementSigned", "No");
    setClientFieldValue("billingInput", "billingTerms", "");
    setClientFieldValue("commercialsPercentageInput", "commercialsPercentage", "");
    setClientFieldValue("clientAddressInput", "address", "");
    setClientFieldValue("invoiceAmountInput", "invoiceAmount", "");
    setClientFieldValue("invoiceStatusInput", "invoiceStatus", "Pending");
    setClientFieldValue("invoiceDateInput", "invoiceDate", "");
    setClientFieldValue("paymentDateInput", "paymentDate", "");
    setClientFieldValue("clientCommentsInput", "clientComments", "");

}

/* ===========================================================
   Edit Client
=========================================================== */

function editClient(index) {

    const client = clients[index];

    if (!client) return;

    clientEditIndex = index;

    const title = document.getElementById("clientModalTitle");
    if (title) {
        title.innerText = "Edit Client";
    }

    setClientFieldValue("clientNameInput", "clientName", client.clientName || "");
    setClientFieldValue("industryInput", "industry", client.industry || "");
    setClientFieldValue("pocNameInput", "pocName", client.pocName || "");
    setClientFieldValue("clientEmailInput", "email", client.email || "");
    setClientFieldValue("clientMobileInput", "clientMobile", client.mobile || "");
    setClientFieldValue("clientLocationInput", "location", client.location || "");
    setClientFieldValue("activeRolesInput", "activeRoles", client.activeRoles || "");
    setClientFieldValue("agreementInput", "agreementSigned", client.agreementSigned || "No");
    setClientFieldValue("billingInput", "billingTerms", client.billingTerms || "");
    setClientFieldValue("commercialsPercentageInput", "commercialsPercentage", client.commercialsPercentage || client.billingPercentage || "");
    setClientFieldValue("clientAddressInput", "address", client.address || "");
    setClientFieldValue("invoiceAmountInput", "invoiceAmount", client.invoiceAmount || "");
    setClientFieldValue("invoiceStatusInput", "invoiceStatus", client.invoiceStatus || "Pending");
    setClientFieldValue("invoiceDateInput", "invoiceDate", client.invoiceDate || "");
    setClientFieldValue("paymentDateInput", "paymentDate", client.paymentDate || "");
    setClientFieldValue("clientCommentsInput", "clientComments", client.comments || "");

    const modal = document.getElementById("clientModal");
    if (modal) {
        modal.classList.add("show");
    }

}

/* ===========================================================
   Save Client
=========================================================== */

function saveClient() {

    const clientName = getClientFieldValue("clientNameInput", "clientName").trim();

    if (clientName === "") {
        alert("Client Name is required.");
        return;
    }

    let client;

    if (clientEditIndex === -1) {
        client = createClient();
        clients.push(client);
    } else {
        client = clients[clientEditIndex];
    }

    client.clientName = clientName;
    client.industry = getClientFieldValue("industryInput", "industry");
    client.pocName = getClientFieldValue("pocNameInput", "pocName");
    client.email = getClientFieldValue("clientEmailInput", "email");
    client.mobile = getClientFieldValue("clientMobileInput", "clientMobile");
    client.location = getClientFieldValue("clientLocationInput", "location");
    client.activeRoles = getClientFieldValue("activeRolesInput", "activeRoles");
    client.agreementSigned = getClientFieldValue("agreementInput", "agreementSigned");
    client.billingTerms = getClientFieldValue("billingInput", "billingTerms");
    client.commercialsPercentage = getClientFieldValue("commercialsPercentageInput", "commercialsPercentage");
    client.billingPercentage = client.commercialsPercentage;
    client.address = getClientFieldValue("clientAddressInput", "address");
    client.invoiceAmount = getClientFieldValue("invoiceAmountInput", "invoiceAmount");
    client.invoiceStatus = getClientFieldValue("invoiceStatusInput", "invoiceStatus");
    client.invoiceDate = getClientFieldValue("invoiceDateInput", "invoiceDate");
    client.paymentDate = getClientFieldValue("paymentDateInput", "paymentDate");
    client.comments = getClientFieldValue("clientCommentsInput", "clientComments");

    saveClients();
    renderClients();
    populateClientDropdown();
    updateMainDashboard();
    updateRevenueDashboard();
    closeClientModal();

}

/* ===========================================================
   Delete Client
=========================================================== */

function deleteClient(index) {

    if (confirm("Delete this client?")) {
        archiveDeletedEntry("client", clients[index]);
        clients.splice(index, 1);
        saveClients();
        renderClients();
        populateClientDropdown();
        updateMainDashboard();
        updateRevenueDashboard();
    }

}

function clearClientSearch() {
    const input = document.getElementById("clientSearchInput");
    if (input) {
        input.value = "";
    }
    renderClients();
}
