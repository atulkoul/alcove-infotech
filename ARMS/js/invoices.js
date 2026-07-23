/* ===========================================================
   ARMS v1.0
   Invoices & Billings Module
=========================================================== */

let invoices = [];

const INVOICE_COMPANY_PROFILE = {
    name: 'ALCOVE INFOTECH PRIVATE LIMITED',
    address: 'Add company address',
    email: 'Add company email',
    phone: 'Add phone number',
    gstin: 'Add GSTIN',
    website: 'Add company website',
    bankName: 'Add bank name',
    bankAccount: 'Add account number',
    bankIfsc: 'Add IFSC code'
};

function createInvoice() {
    return {
        id: 'INV' + Date.now(),
        invoiceNumber: generateProfessionalInvoiceNumber(),
        candidateId: '',
        clientName: '',
        candidateName: '',
        position: '',
        offeredCtc: '',
        annualCtc: '',
        joiningDate: '',
        billingAmount: '',
        billingPercentage: '',
        invoiceDate: getCurrentISTDateString(),
        dueDate: '',
        status: 'Draft',
        notes: ''
    };
}

function saveInvoices() {
    localStorage.setItem('armsInvoices', JSON.stringify(invoices));
}

function loadInvoices() {
    const data = localStorage.getItem('armsInvoices');
    if (data) {
        invoices = JSON.parse(data);
    } else {
        invoices = [];
    }
}

function generateProfessionalInvoiceNumber() {
    const year = new Date().getFullYear();
    const sequence = String(((Array.isArray(invoices) ? invoices.length : 0) + 1)).padStart(3, '0');
    return 'ALC/INV/' + year + '/' + sequence;
}

function findClientByName(clientName) {
    return (Array.isArray(clients) ? clients : []).find((item) => {
        return (item.clientName || '').trim().toLowerCase() === (clientName || '').trim().toLowerCase();
    }) || null;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}

function addDaysToDateString(dateString, days) {
    return shiftDateInputValue(dateString || getCurrentISTDateString(), days);
}

function formatDateForDisplay(dateString) {
    return formatDateDisplayIST(dateString, '');
}

function getAnnualCtcValue(candidate) {
    return candidate.expectedCTC || candidate.currentCTC || '';
}

function getBillingPercentageValue(client) {
    return client && (client.commercialsPercentage || client.billingPercentage)
        ? String(client.commercialsPercentage || client.billingPercentage)
        : '';
}

function getProfessionalFeeValue(annualCtc, billingPercentage, invoiceAmount) {
    if (invoiceAmount) {
        return String(invoiceAmount).replace(/,/g, '');
    }

    const ctcParser = typeof parseCTCValue === 'function'
        ? parseCTCValue
        : function fallbackParse(value) {
            const match = String(value || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
            return match ? Number(match[1]) : 0;
        };

    const ctcValue = ctcParser(annualCtc || 0);
    const percentValue = Number(String(billingPercentage || '').replace('%', ''));
    if (!ctcValue || !percentValue) return '';

    return String(Math.round(ctcValue * (percentValue / 100)));
}

function formatMoneyValue(value) {
    const numericValue = typeof parseCTCValue === 'function'
        ? parseCTCValue(value || 0)
        : Number(String(value || '').replace(/,/g, ''));
    if (!numericValue) {
        return value ? String(value) : '';
    }

    return numericValue.toLocaleString('en-IN');
}

function getBillingRoleName(requirementId) {
    const requirement = (Array.isArray(requirements) ? requirements : []).find((item) => item.requirementId === requirementId);
    if (requirement) {
        return requirement.positionTitle || requirement.requirementId || '';
    }

    if (typeof getRequirementName === 'function') {
        return getRequirementName(requirementId) || '';
    }

    return requirementId || '';
}

function getBillingClientAddress(clientName) {
    const client = findClientByName(clientName);
    return client && client.address ? client.address : '-';
}

function buildCandidateInvoiceDraft(candidateId) {
    const candidate = (Array.isArray(candidates) ? candidates : []).find((item) => item.candidateId === candidateId);
    if (!candidate) return null;

    const client = findClientByName(candidate.client || '');
    const annualCtc = getAnnualCtcValue(candidate);
    const billingPercentage = getBillingPercentageValue(client);
    const professionalFee = getProfessionalFeeValue(annualCtc, billingPercentage, client && client.invoiceAmount ? client.invoiceAmount : '');
    const invoiceDate = getCurrentISTDateString();

    return {
        id: 'INV' + Date.now(),
        invoiceNumber: generateProfessionalInvoiceNumber(),
        invoiceDate,
        dueDate: addDaysToDateString(invoiceDate, 15),
        poNumber: '',
        clientName: candidate.client || '',
        clientCompany: candidate.client || '',
        clientAddress: client && client.address ? client.address : '',
        clientGstin: client && client.gstNumber ? client.gstNumber : '',
        candidateName: candidate.candidateName || '',
        candidateId: candidate.candidateId || '',
        position: getBillingRoleName(candidate.role) || '',
        joiningDate: candidate.doj || '',
        offeredCtc: candidate.offeredCTC || '',
        annualCtc,
        billingPercentage,
        professionalFee,
        subTotal: professionalFee,
        billingTerms: client && client.billingTerms ? client.billingTerms : '',
        companyName: INVOICE_COMPANY_PROFILE.name,
        companyAddress: INVOICE_COMPANY_PROFILE.address,
        companyEmail: INVOICE_COMPANY_PROFILE.email,
        companyPhone: INVOICE_COMPANY_PROFILE.phone,
        companyGstin: INVOICE_COMPANY_PROFILE.gstin,
        companyWebsite: INVOICE_COMPANY_PROFILE.website,
        bankName: INVOICE_COMPANY_PROFILE.bankName,
        bankAccount: INVOICE_COMPANY_PROFILE.bankAccount,
        bankIfsc: INVOICE_COMPANY_PROFILE.bankIfsc
    };
}

function buildInvoicePreviewData(invoice) {
    const client = findClientByName(invoice.clientName || '');
    const professionalFee = invoice.billingAmount || '';

    return {
        id: invoice.id || ('INV' + Date.now()),
        invoiceNumber: invoice.invoiceNumber || generateProfessionalInvoiceNumber(),
        invoiceDate: invoice.invoiceDate || getCurrentISTDateString(),
        dueDate: invoice.dueDate || '',
        poNumber: '',
        clientName: invoice.clientName || '',
        clientCompany: invoice.clientName || '',
        clientAddress: client && client.address ? client.address : '',
        clientGstin: client && client.gstNumber ? client.gstNumber : '',
        candidateName: invoice.candidateName || '',
        candidateId: invoice.candidateId || '',
        position: invoice.position || '',
        joiningDate: invoice.joiningDate || '',
        offeredCtc: invoice.offeredCtc || '',
        annualCtc: invoice.annualCtc || '',
        billingPercentage: invoice.billingPercentage || (client && (client.commercialsPercentage || client.billingPercentage) ? (client.commercialsPercentage || client.billingPercentage) : ''),
        professionalFee,
        subTotal: professionalFee,
        billingTerms: client && client.billingTerms ? client.billingTerms : '',
        companyName: INVOICE_COMPANY_PROFILE.name,
        companyAddress: INVOICE_COMPANY_PROFILE.address,
        companyEmail: INVOICE_COMPANY_PROFILE.email,
        companyPhone: INVOICE_COMPANY_PROFILE.phone,
        companyGstin: INVOICE_COMPANY_PROFILE.gstin,
        companyWebsite: INVOICE_COMPANY_PROFILE.website,
        bankName: INVOICE_COMPANY_PROFILE.bankName,
        bankAccount: INVOICE_COMPANY_PROFILE.bankAccount,
        bankIfsc: INVOICE_COMPANY_PROFILE.bankIfsc
    };
}

function openInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (!modal) {
        createInvoiceModal();
    }
    resetInvoiceForm();
    document.getElementById('invoiceModal')?.classList.add('show');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal')?.classList.remove('show');
}

function saveInvoice() {
    const clientName = document.getElementById('invoiceClientName')?.value || '';
    if (!clientName) {
        alert('Client name is required.');
        return;
    }

    const invoice = createInvoice();
    invoice.clientName = clientName;
    invoice.candidateName = document.getElementById('invoiceCandidateName')?.value || '';
    invoice.position = document.getElementById('invoicePosition')?.value || '';
    invoice.billingAmount = document.getElementById('invoiceBillingAmount')?.value || '';
    invoice.billingPercentage = document.getElementById('invoiceBillingPercentage')?.value || '';
    invoice.dueDate = document.getElementById('invoiceDueDate')?.value || '';
    invoice.notes = document.getElementById('invoiceNotes')?.value || '';

    invoices.push(invoice);
    saveInvoices();
    renderInvoicesList();
    closeInvoiceModal();
}

function resetInvoiceForm() {
    const invoiceDate = getCurrentISTDateString();

    const fieldDefaults = {
        invoiceClientName: '',
        invoiceCandidateName: '',
        invoicePosition: '',
        invoiceBillingAmount: '',
        invoiceBillingPercentage: '',
        invoiceDueDate: '',
        invoiceNotes: ''
    };

    Object.keys(fieldDefaults).forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = fieldDefaults[fieldId];
        }
    });

    const invoiceDateField = document.getElementById('invoiceDate');
    if (invoiceDateField) {
        invoiceDateField.value = invoiceDate;
    }
}

function openInvoiceTemplateForCandidate(candidateId) {
    const invoiceDraft = buildCandidateInvoiceDraft(candidateId);
    if (!invoiceDraft) return;

    const preview = window.open('', 'Candidate Invoice', 'width=1100,height=900');
    if (!preview) return;

    preview.document.write(generateInvoiceTemplate(invoiceDraft, true));
    preview.document.close();
}

function parseTemplateDateToInput(value) {
    if (!value) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const tokens = String(value).trim().split('-');
    if (tokens.length !== 3) return value;

    const day = Number(tokens[0]);
    const year = Number(tokens[2]);
    const monthMap = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
    const month = monthMap[tokens[1]];

    if (!month || Number.isNaN(day) || Number.isNaN(year)) return value;

    return formatDateInputValue(year, month, day);
}

function saveInvoiceFromTemplate(payload) {
    if (!payload || !payload.clientName) {
        alert('Client name is required to save invoice.');
        return false;
    }

    const invoice = createInvoice();
    invoice.id = payload.id || ('INV' + Date.now());
    invoice.invoiceNumber = payload.invoiceNumber || generateProfessionalInvoiceNumber();
    invoice.candidateId = payload.candidateId || '';
    invoice.clientName = payload.clientName || '';
    invoice.candidateName = payload.candidateName || '';
    invoice.position = payload.position || '';
    invoice.offeredCtc = payload.offeredCtc || '';
    invoice.annualCtc = payload.annualCtc || '';
    invoice.billingAmount = payload.billingAmount || '';
    invoice.billingPercentage = payload.billingPercentage || '';
    invoice.joiningDate = parseTemplateDateToInput(payload.joiningDate || '');
    invoice.invoiceDate = parseTemplateDateToInput(payload.invoiceDate || getCurrentISTDateString());
    invoice.dueDate = parseTemplateDateToInput(payload.dueDate || '');
    invoice.status = payload.status || 'Draft';

    if (invoice.candidateId) {
        invoices = invoices.filter(item => item.candidateId !== invoice.candidateId);
    }

    invoices.push(invoice);
    saveInvoices();
    renderInvoicesList();
    return true;
}

function renderInvoiceBillingGrid() {
    const tbody = document.getElementById('invoiceBillingBody');
    if (!tbody) return;

    const joinedCandidates = (Array.isArray(candidates) ? candidates : []).filter((candidate) => candidate.status === 'Joined');

    if (!joinedCandidates.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:16px; color:#6c757d;">No joined candidates available for billing.</td></tr>';
        return;
    }

    tbody.innerHTML = joinedCandidates.map((candidate) => {
        const savedInvoice = (Array.isArray(invoices) ? invoices : []).find((item) => item.candidateId === candidate.candidateId);
        const clientCommercials = getBillingPercentageValue(findClientByName(candidate.client || '')) || '-';

        return '<tr>' +
            '<td>' + (candidate.candidateName || '-') + '</td>' +
            '<td>' + (getBillingRoleName(candidate.role) || '-') + '</td>' +
            '<td>' + (candidate.client || '-') + '</td>' +
            '<td>' + getBillingClientAddress(candidate.client) + '</td>' +
            '<td>' + (candidate.status || '-') + '</td>' +
            '<td>' + (candidate.offeredCTC || '-') + '</td>' +
            '<td>' + clientCommercials + '</td>' +
            '<td>' + formatDateForDisplay(candidate.doj || '-') + '</td>' +
            '<td class="invoice-actions">' +
            '<span class="invoice-actions-wrap">' +
            '<button style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="openInvoiceTemplateForCandidate(\'' + (candidate.candidateId || '') + '\')">+ Create Invoice</button>' +
            (savedInvoice ? '<button title="Download Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="downloadInvoice(\'' + savedInvoice.id + '\')">⬇</button><button title="Delete Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#dc3545; color:white; cursor:pointer;" onclick="deleteInvoice(\'' + savedInvoice.id + '\')">🗑</button>' : '') +
            '</span>' +
            '</td>' +
            '</tr>';
    }).join('');
}

function renderInvoicesList() {
    renderInvoiceBillingGrid();
}

function previewInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const template = generateInvoiceTemplate(buildInvoicePreviewData(invoice), false);
    const preview = window.open('', 'Invoice Preview', 'width=800,height=600');
    preview.document.write(template);
    preview.document.close();
}

function generateInvoiceTemplate(invoice, editable) {
    const readOnlyAttr = editable ? '' : ' readonly';
    const pageTitle = editable ? 'Editable Invoice' : 'Invoice Preview';
    const toolbar = '<div class="template-toolbar">' +
        (editable ? '<button onclick="saveInvoiceTemplate()">Save</button>' : '') +
        '<button onclick="window.print()">Print</button>' +
        '<button onclick="window.close()">Close</button>' +
        '</div>';

    return `<html>
        <head>
            <base href="${escapeAttribute(window.location.href)}">
            <title>${escapeHtml(pageTitle)}</title>
            <style>
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    background: linear-gradient(180deg, #eef4fb 0%, #f8fafc 100%);
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    color: #1f2937;
                }
                .template-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 18px 24px;
                    background: rgba(248, 250, 252, 0.94);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
                }
                .template-toolbar button {
                    border: none;
                    border-radius: 999px;
                    padding: 10px 18px;
                    background: #0b5ed7;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 22px rgba(11, 94, 215, 0.22);
                }
                .template-toolbar button:last-child {
                    background: #e2e8f0;
                    color: #0f172a;
                    box-shadow: none;
                }
                .page {
                    width: min(100%, 980px);
                    margin: 28px auto 40px;
                    padding: 48px;
                    position: relative;
                    background: #ffffff;
                    border: 1px solid rgba(15, 23, 42, 0.08);
                    border-radius: 28px;
                    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.10);
                    overflow: hidden;
                }
                .watermark {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    opacity: 0.05;
                }
                .watermark img {
                    width: 380px;
                    max-width: 65%;
                    filter: grayscale(100%);
                }
                .invoice-header {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    gap: 28px;
                    padding-bottom: 28px;
                    border-bottom: 1px solid #dbe4f0;
                }
                .brand-block {
                    display: flex;
                    gap: 18px;
                    align-items: flex-start;
                    max-width: 58%;
                }
                .brand-block img {
                    width: 82px;
                    height: 82px;
                    object-fit: contain;
                    border-radius: 20px;
                    background: #f8fafc;
                    padding: 10px;
                    border: 1px solid #dbe4f0;
                }
                .brand-block h1 {
                    margin: 0 0 10px;
                    font-size: 28px;
                    line-height: 1.1;
                    letter-spacing: 0.04em;
                    color: #0f172a;
                }
                .brand-lines {
                    display: grid;
                    gap: 8px;
                    font-size: 14px;
                    color: #475569;
                }
                .invoice-title {
                    min-width: 280px;
                    padding: 20px 22px;
                    border-radius: 24px;
                    background: linear-gradient(135deg, #0b5ed7 0%, #1d4ed8 100%);
                    color: #ffffff;
                    box-shadow: 0 18px 32px rgba(11, 94, 215, 0.22);
                }
                .invoice-title .eyebrow {
                    font-size: 12px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    opacity: 0.78;
                }
                .invoice-title h2 {
                    margin: 8px 0 18px;
                    font-size: 32px;
                    letter-spacing: 0.08em;
                }
                .meta-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px 14px;
                }
                .meta-item, .field-stack {
                    display: grid;
                    gap: 6px;
                }
                .meta-item label, .section-heading, .field-stack label, .detail-card label {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .field-input, .field-textarea {
                    width: 100%;
                    border: 1px solid #d7e0eb;
                    border-radius: 12px;
                    background: #f8fafc;
                    color: #0f172a;
                    padding: 10px 12px;
                    font-size: 14px;
                    outline: none;
                }
                .field-input[readonly], .field-textarea[readonly] {
                    border-color: transparent;
                    background: transparent;
                    padding-left: 0;
                    padding-right: 0;
                    pointer-events: none;
                }
                .field-textarea {
                    min-height: 84px;
                    resize: vertical;
                }
                .layout-grid {
                    position: relative;
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 22px;
                    margin-top: 28px;
                }
                .panel {
                    background: #ffffff;
                    border: 1px solid #dbe4f0;
                    border-radius: 22px;
                    padding: 22px;
                    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
                }
                .billto-grid, .detail-grid {
                    display: grid;
                    gap: 14px;
                }
                .detail-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .charges-section {
                    margin-top: 24px;
                }
                .charges-table, .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    overflow: hidden;
                    border-radius: 18px;
                    margin-top: 14px;
                }
                .charges-table th, .charges-table td, .summary-table th, .summary-table td {
                    border: 1px solid #dbe4f0;
                    padding: 12px 14px;
                    vertical-align: top;
                }
                .charges-table th, .summary-table th {
                    background: #eff6ff;
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .charges-table td .field-input, .summary-table td .field-input {
                    min-width: 0;
                    padding: 8px 10px;
                    border-radius: 10px;
                }
                .note-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 22px;
                    margin-top: 24px;
                }
                .terms-list {
                    margin: 12px 0 0;
                    padding-left: 18px;
                    color: #475569;
                    line-height: 1.7;
                }
                .signature-block {
                    margin-top: 28px;
                    display: flex;
                    justify-content: flex-end;
                }
                .signature-card {
                    min-width: 280px;
                    padding: 18px 20px;
                    border-radius: 18px;
                    background: linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%);
                    border: 1px dashed #b6c4d8;
                    text-align: center;
                    color: #334155;
                }
                .footer {
                    margin-top: 32px;
                    padding-top: 18px;
                    border-top: 1px solid #dbe4f0;
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    font-size: 13px;
                    color: #475569;
                }
                .footer strong {
                    color: #0f172a;
                }
                .footer-line {
                    display: block;
                    margin-top: 6px;
                }
                @media print {
                    body {
                        background: #ffffff;
                    }
                    .template-toolbar {
                        display: none;
                    }
                    .page {
                        margin: 0;
                        width: 100%;
                        border: none;
                        border-radius: 0;
                        box-shadow: none;
                        padding: 24px;
                    }
                }
            </style>
        </head>
        <body>
            ${toolbar}
            <div class="page">
                <div class="watermark">
                    <img src="images/logo.png" alt="Alcove watermark">
                </div>

                <div class="invoice-header">
                    <div class="brand-block">
                        <img src="images/logo.png" alt="Alcove Infotech logo">
                        <div>
                            <h1>${escapeHtml(invoice.companyName || INVOICE_COMPANY_PROFILE.name)}</h1>
                            <div class="brand-lines">
                                <span>Address: <input class="field-input" value="${escapeAttribute(invoice.companyAddress || '')}"${readOnlyAttr}></span>
                                <span>Email: <input class="field-input" value="${escapeAttribute(invoice.companyEmail || '')}"${readOnlyAttr}></span>
                                <span>Phone: <input class="field-input" value="${escapeAttribute(invoice.companyPhone || '')}"${readOnlyAttr}></span>
                                <span>GSTIN: <input class="field-input" value="${escapeAttribute(invoice.companyGstin || '')}"${readOnlyAttr}></span>
                            </div>
                        </div>
                    </div>

                    <div class="invoice-title">
                        <div class="eyebrow">Recruitment Billing</div>
                        <h2>INVOICE</h2>
                        <div class="meta-grid">
                            <div class="meta-item">
                                <label>Invoice No.</label>
                                <input id="invoiceNumber" class="field-input" value="${escapeAttribute(invoice.invoiceNumber || '')}"${readOnlyAttr}>
                            </div>
                            <div class="meta-item">
                                <label>Invoice Date</label>
                                <input id="invoiceDateText" type="text" class="field-input" value="${escapeAttribute(formatDateForDisplay(invoice.invoiceDate || ''))}"${readOnlyAttr}>
                            </div>
                            <div class="meta-item">
                                <label>Due Date</label>
                                <input id="dueDateText" type="text" class="field-input" value="${escapeAttribute(formatDateForDisplay(invoice.dueDate || ''))}"${readOnlyAttr}>
                            </div>
                            <div class="meta-item">
                                <label>PO No.</label>
                                <input class="field-input" value="${escapeAttribute(invoice.poNumber || '')}"${readOnlyAttr}>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="layout-grid">
                    <section class="panel">
                        <div class="section-heading">Bill To</div>
                        <div class="billto-grid">
                            <div class="field-stack">
                                <label>Client Name</label>
                                <input id="clientNameField" class="field-input" value="${escapeAttribute(invoice.clientName || '')}"${readOnlyAttr}>
                            </div>
                            <div class="field-stack">
                                <label>Company</label>
                                <input class="field-input" value="${escapeAttribute(invoice.clientCompany || '')}"${readOnlyAttr}>
                            </div>
                            <div class="field-stack">
                                <label>Address</label>
                                <textarea id="clientAddressField" class="field-textarea"${readOnlyAttr}>${escapeHtml(invoice.clientAddress || '')}</textarea>
                            </div>
                            <div class="field-stack">
                                <label>GSTIN</label>
                                <input class="field-input" value="${escapeAttribute(invoice.clientGstin || '')}"${readOnlyAttr}>
                            </div>
                        </div>
                    </section>

                    <section class="panel">
                        <div class="section-heading">Candidate Snapshot</div>
                        <div class="detail-grid">
                            <div class="detail-card">
                                <label>Name of Candidate</label>
                                <input id="candidateNameField" class="field-input" value="${escapeAttribute(invoice.candidateName || '')}"${readOnlyAttr}>
                            </div>
                            <div class="detail-card">
                                <label>Joining Date</label>
                                <input id="joiningDateText" type="text" class="field-input" value="${escapeAttribute(formatDateForDisplay(invoice.joiningDate || ''))}"${readOnlyAttr}>
                            </div>
                            <div class="detail-card" style="grid-column: 1 / -1;">
                                <label>Position</label>
                                <input id="positionField" class="field-input" value="${escapeAttribute(invoice.position || '')}"${readOnlyAttr}>
                            </div>
                        </div>
                    </section>
                </div>

                <section class="charges-section">
                    <div class="section-heading">Recruitment Services Charges</div>
                    <table class="charges-table">
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Position</th>
                                <th>Joining Date</th>
                                <th>Offered CTC (₹)</th>
                                <th>Annual CTC (₹)</th>
                                <th>Commercials %</th>
                                <th>Professional Fee (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input class="field-input" value="${escapeAttribute(invoice.candidateName || '')}"${readOnlyAttr}></td>
                                <td><input class="field-input" value="${escapeAttribute(invoice.position || '')}"${readOnlyAttr}></td>
                                <td><input type="text" class="field-input" value="${escapeAttribute(formatDateForDisplay(invoice.joiningDate || ''))}"${readOnlyAttr}></td>
                                <td><input id="offeredCtc" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.offeredCtc || ''))}"${readOnlyAttr}></td>
                                <td><input id="annualCtc" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.annualCtc || ''))}"${readOnlyAttr}></td>
                                <td><input id="billingPercentage" class="field-input" value="${escapeAttribute(invoice.billingPercentage || '')}"${readOnlyAttr}></td>
                                <td><input id="professionalFee" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.professionalFee || ''))}"${readOnlyAttr}></td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="summary-table">
                        <tbody>
                            <tr>
                                <th style="width:70%;">Particulars</th>
                                <th>Amount (₹)</th>
                            </tr>
                            <tr>
                                <td>Sub Total</td>
                                <td><input id="subTotal" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.subTotal || invoice.professionalFee || ''))}"${readOnlyAttr}></td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <div class="note-grid">
                    <section class="panel">
                        <div class="section-heading">Payment Terms</div>
                        <ul class="terms-list">
                            <li>Payment Due: Within 15 days from invoice date.</li>
                            <li>Replacement clause as per agreement.</li>
                            <li>Kindly quote Invoice Number while remitting payment.</li>
                        </ul>
                        <div class="field-stack" style="margin-top:16px;">
                            <label>Client Specific Billing Terms</label>
                            <textarea class="field-textarea"${readOnlyAttr}>${escapeHtml(invoice.billingTerms || '')}</textarea>
                        </div>
                    </section>

                    <section class="panel">
                        <div class="section-heading">Bank Details</div>
                        <div class="billto-grid">
                            <div class="field-stack">
                                <label>Beneficiary Name</label>
                                <input class="field-input" value="${escapeAttribute(invoice.companyName || '')}"${readOnlyAttr}>
                            </div>
                            <div class="field-stack">
                                <label>Bank Name</label>
                                <input class="field-input" value="${escapeAttribute(invoice.bankName || '')}"${readOnlyAttr}>
                            </div>
                            <div class="field-stack">
                                <label>A/c No.</label>
                                <input class="field-input" value="${escapeAttribute(invoice.bankAccount || '')}"${readOnlyAttr}>
                            </div>
                            <div class="field-stack">
                                <label>IFSC Code</label>
                                <input class="field-input" value="${escapeAttribute(invoice.bankIfsc || '')}"${readOnlyAttr}>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="signature-block">
                    <div class="signature-card">
                        <strong>For ${escapeHtml(invoice.companyName || INVOICE_COMPANY_PROFILE.name)}</strong>
                        <div style="margin-top:46px;">Authorized Signatory</div>
                    </div>
                </div>

                <div class="footer">
                    <div>
                        <strong>${escapeHtml(invoice.companyName || INVOICE_COMPANY_PROFILE.name)}</strong>
                        <span class="footer-line">${escapeHtml(invoice.companyAddress || '')}</span>
                    </div>
                    <div style="text-align:right;">
                        <span class="footer-line">Website: ${escapeHtml(invoice.companyWebsite || '')}</span>
                        <span class="footer-line">Email: ${escapeHtml(invoice.companyEmail || '')}</span>
                    </div>
                </div>
            </div>

            <script>
                (function () {
                    var basePayload = {
                        id: "${escapeAttribute(invoice.id || '')}",
                        candidateId: "${escapeAttribute(invoice.candidateId || '')}",
                        status: "${escapeAttribute(invoice.status || 'Draft')}"
                    };

                    function parseMoney(value) {
                        var cleaned = String(value || '').replace(/,/g, '').toLowerCase();
                        var match = cleaned.match(/(\d+(?:\.\d+)?)/);
                        if (!match) return 0;
                        var numeric = parseFloat(match[1]);
                        if (cleaned.indexOf('lac') !== -1 || cleaned.indexOf('l') !== -1) return numeric * 100000;
                        if (cleaned.endsWith('k')) return numeric * 1000;
                        return numeric;
                    }

                    function formatMoney(value) {
                        if (!value) return '';
                        return Math.round(value).toLocaleString('en-IN');
                    }

                    function updateTotals() {
                        var ctcField = document.getElementById('annualCtc');
                        var billingField = document.getElementById('billingPercentage');
                        var feeField = document.getElementById('professionalFee');
                        var totalField = document.getElementById('subTotal');
                        if (!ctcField || !billingField || !feeField || !totalField) return;

                        var ctcValue = parseMoney(ctcField.value);
                        var percentageValue = parseFloat(String(billingField.value || '').replace('%', '')) || 0;
                        var currentFee = parseMoney(feeField.value);

                        if (ctcValue && percentageValue) {
                            currentFee = ctcValue * (percentageValue / 100);
                            feeField.value = formatMoney(currentFee);
                        }

                        totalField.value = formatMoney(currentFee);
                    }

                    var ctcField = document.getElementById('annualCtc');
                    var billingField = document.getElementById('billingPercentage');
                    var feeField = document.getElementById('professionalFee');

                    if (ctcField) ctcField.addEventListener('input', updateTotals);
                    if (billingField) billingField.addEventListener('input', updateTotals);
                    if (feeField) feeField.addEventListener('input', function () {
                        var totalField = document.getElementById('subTotal');
                        if (totalField) totalField.value = feeField.value;
                    });

                    window.saveInvoiceTemplate = function () {
                        if (!window.opener || typeof window.opener.saveInvoiceFromTemplate !== 'function') {
                            alert('Unable to save invoice in parent window.');
                            return;
                        }

                        var payload = {
                            id: basePayload.id,
                            candidateId: basePayload.candidateId,
                            status: basePayload.status,
                            invoiceNumber: document.getElementById('invoiceNumber') ? document.getElementById('invoiceNumber').value : '',
                            invoiceDate: document.getElementById('invoiceDateText') ? document.getElementById('invoiceDateText').value : '',
                            dueDate: document.getElementById('dueDateText') ? document.getElementById('dueDateText').value : '',
                            clientName: document.getElementById('clientNameField') ? document.getElementById('clientNameField').value : '',
                            clientAddress: document.getElementById('clientAddressField') ? document.getElementById('clientAddressField').value : '',
                            candidateName: document.getElementById('candidateNameField') ? document.getElementById('candidateNameField').value : '',
                            position: document.getElementById('positionField') ? document.getElementById('positionField').value : '',
                            joiningDate: document.getElementById('joiningDateText') ? document.getElementById('joiningDateText').value : '',
                            offeredCtc: document.getElementById('offeredCtc') ? document.getElementById('offeredCtc').value : '',
                            annualCtc: document.getElementById('annualCtc') ? document.getElementById('annualCtc').value : '',
                            billingPercentage: document.getElementById('billingPercentage') ? document.getElementById('billingPercentage').value : '',
                            billingAmount: document.getElementById('professionalFee') ? document.getElementById('professionalFee').value : ''
                        };

                        if (window.opener.saveInvoiceFromTemplate(payload)) {
                            alert('Invoice saved successfully.');
                        }
                    };

                    updateTotals();
                }());
            </script>
        </body>
    </html>`;
}

function downloadInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const template = generateInvoiceTemplate(buildInvoicePreviewData(invoice), false);
    const link = document.createElement('a');
    link.href = 'data:text/html,' + encodeURIComponent(template);
    link.download = invoice.invoiceNumber + '.html';
    link.click();
}

function deleteInvoice(id) {
    if (confirm('Delete this invoice?')) {
        invoices = invoices.filter(i => i.id !== id);
        saveInvoices();
        renderInvoicesList();
    }
}

function createInvoiceModal() {
    const modal = document.createElement('div');
    modal.id = 'invoiceModal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content">' +
        '<div class="modal-header"><h2>Create Invoice</h2><span class="close" onclick="closeInvoiceModal()">&times;</span></div>' +
        '<div class="modal-body"><div class="form-grid">' +
        '<div class="form-group"><label>Client Name</label><input type="text" id="invoiceClientName"></div>' +
        '<div class="form-group"><label>Candidate Name</label><input type="text" id="invoiceCandidateName"></div>' +
        '<div class="form-group"><label>Position</label><input type="text" id="invoicePosition"></div>' +
        '<div class="form-group"><label>Billing Amount</label><input type="number" id="invoiceBillingAmount"></div>' +
        '<div class="form-group"><label>Commercials %</label><input type="number" id="invoiceBillingPercentage"></div>' +
        '<div class="form-group"><label>Due Date</label><input type="date" id="invoiceDueDate"></div>' +
        '<div class="form-group full"><label>Notes</label><textarea id="invoiceNotes"></textarea></div>' +
        '</div></div>' +
        '<div class="modal-footer"><button class="btn btn-secondary" onclick="closeInvoiceModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveInvoice()">Create</button></div>' +
        '</div>';
    document.body.appendChild(modal);
}
