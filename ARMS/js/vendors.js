/* ===========================================================
   ARMS v1.0
   Vendor Management Module
=========================================================== */

let vendors = [];
let vendorEditIndex = -1;

function createVendor() {
    return {
        vendorId: generateVendorId(),
        vendorName: "",
        contactPerson: "",
        email: "",
        mobile: "",
        agreementStatus: "Pending",
        paymentTerms: "",
        profilesReceived: 0,
        interviews: 0,
        offers: 0,
        paymentsDue: 0,
        comments: ""
    };
}

function generateVendorId() {
    let counter = localStorage.getItem("armsVendorCounter");
    if (!counter) counter = 1; else counter = parseInt(counter) + 1;
    localStorage.setItem("armsVendorCounter", counter);
    return "VEN" + String(counter).padStart(4, "0");
}

function saveVendors() {
    localStorage.setItem("armsVendors", JSON.stringify(vendors));
}

function loadVendors() {
    const data = localStorage.getItem("armsVendors");
    if (data) vendors = JSON.parse(data);
}

function openVendorModal() {
    vendorEditIndex = -1;
    document.getElementById("vendorModalTitle").innerText = "Add Vendor";
    clearVendorForm();
    document.getElementById("vendorModal").classList.add("show");
}

function closeVendorModal() {
    document.getElementById("vendorModal").classList.remove("show");
}

function clearVendorForm() {
    document.getElementById("vendorNameInput").value = "";
    document.getElementById("contactPersonInput").value = "";
    document.getElementById("vendorEmailInput").value = "";
    document.getElementById("vendorMobileInput").value = "";
    document.getElementById("agreementStatusInput").value = "Pending";
    document.getElementById("paymentTermsInput").value = "";
    document.getElementById("vendorCommentsInput").value = "";
}

function saveVendor() {
    const name = document.getElementById("vendorNameInput").value.trim();
    if (!name) {
        alert("Vendor name is required.");
        return;
    }

    let vendor;
    if (vendorEditIndex === -1) {
        vendor = createVendor();
        vendors.push(vendor);
    } else {
        vendor = vendors[vendorEditIndex];
    }

    vendor.vendorName = name;
    vendor.contactPerson = document.getElementById("contactPersonInput").value;
    vendor.email = document.getElementById("vendorEmailInput").value;
    vendor.mobile = document.getElementById("vendorMobileInput").value;
    vendor.agreementStatus = document.getElementById("agreementStatusInput").value;
    vendor.paymentTerms = document.getElementById("paymentTermsInput").value;
    vendor.comments = document.getElementById("vendorCommentsInput").value;

    saveVendors();
    renderVendors();
    updateRevenueDashboard();
    closeVendorModal();
}

function renderVendors(data = vendors) {
    const tbody = document.getElementById("vendorBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.forEach((vendor, index) => {
        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + (vendor.vendorId || "") + '</td>' +
            '<td>' + (vendor.vendorName || "") + '</td>' +
            '<td>' + (vendor.contactPerson || "") + '</td>' +
            '<td>' + (vendor.email || "") + '</td>' +
            '<td>' + (vendor.mobile || "") + '</td>' +
            '<td>' + (vendor.agreementStatus || "Pending") + '</td>' +
            '<td>' + (vendor.paymentTerms || "") + '</td>' +
            '<td>' +
                '<button class="action-btn" onclick="editVendor(' + index + ')">✏️</button>' +
                '<button class="action-btn" onclick="deleteVendor(' + index + ')">🗑️</button>' +
            '</td>';
        tbody.appendChild(row);
    });
}

function editVendor(index) {
    const vendor = vendors[index];
    if (!vendor) return;
    vendorEditIndex = index;
    document.getElementById("vendorModalTitle").innerText = "Edit Vendor";
    document.getElementById("vendorNameInput").value = vendor.vendorName || "";
    document.getElementById("contactPersonInput").value = vendor.contactPerson || "";
    document.getElementById("vendorEmailInput").value = vendor.email || "";
    document.getElementById("vendorMobileInput").value = vendor.mobile || "";
    document.getElementById("agreementStatusInput").value = vendor.agreementStatus || "Pending";
    document.getElementById("paymentTermsInput").value = vendor.paymentTerms || "";
    document.getElementById("vendorCommentsInput").value = vendor.comments || "";
    document.getElementById("vendorModal").classList.add("show");
}

function deleteVendor(index) {
    if (confirm("Delete this vendor?")) {
        vendors.splice(index, 1);
        saveVendors();
        renderVendors();
        updateRevenueDashboard();
    }
}
