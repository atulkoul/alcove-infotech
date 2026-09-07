/* ===========================================================
   ARMS v1.0
   Invoices & Billings Module
=========================================================== */

let invoices = [];

const INVOICE_COMPANY_PROFILE = {
    name: 'Alcove Infotech',
    address: 'Add company address',
    email: 'hr@alcoveinfotech.com',
    phone: 'Add phone number',
    gstin: 'Add GSTIN',
    website: 'www.alcoveinfotech.com',
    bankName: 'ICICI Bank',
    bankAccount: '727705003475',
    bankIfsc: 'ICIC0007277',
    bankBranch: 'Sector 35, Kharghar, Navi Mumbai'
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
    const prefix = 'ALC/INV/' + year + '/';
    const counter = (Array.isArray(invoices) ? invoices : []).reduce((maxValue, invoice) => {
        const number = String(invoice && invoice.invoiceNumber ? invoice.invoiceNumber : '');
        if (!number.startsWith(prefix)) return maxValue;
        const parsed = Number(number.slice(prefix.length));
        if (!Number.isFinite(parsed)) return maxValue;
        return Math.max(maxValue, parsed);
    }, 100) + 1;

    const sequence = String(counter).padStart(3, '0');
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
    const rawPercent = String(billingPercentage || '').replace(/%/g, '').replace(/,/g, '').trim();
    const percentValue = Number(rawPercent);
    if (!ctcValue || !Number.isFinite(percentValue) || percentValue === 0) return '';

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
        dueDate: addDaysToDateString(invoiceDate, 7),
        poNumber: '',
        clientName: candidate.client || '',
        clientCompany: candidate.client || '',
        clientAddress: client && client.address ? client.address : '',
        clientGstin: client && client.gstNumber ? client.gstNumber : '',
        clientEmail: client && client.email ? client.email : '',
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
        bankIfsc: INVOICE_COMPANY_PROFILE.bankIfsc,
        bankBranch: INVOICE_COMPANY_PROFILE.bankBranch
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
        clientAddress: invoice.clientAddress || (client && client.address ? client.address : ''),
        clientGstin: invoice.clientGstin || (client && client.gstNumber ? client.gstNumber : ''),
        clientEmail: invoice.clientEmail || (client && client.email ? client.email : ''),
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
        bankIfsc: INVOICE_COMPANY_PROFILE.bankIfsc,
        bankBranch: INVOICE_COMPANY_PROFILE.bankBranch
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
    invoice.clientAddress = payload.clientAddress || '';
    invoice.clientGstin = payload.clientGstin || '';
    invoice.clientEmail = payload.clientEmail || '';
    invoice.status = payload.status || 'Draft';
    invoice.savedHtml = generateInvoiceTemplate(buildInvoicePreviewData(invoice), false);

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
                        (savedInvoice
                                ? '<button title="Open Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="openSavedInvoiceForEdit(\'' + savedInvoice.id + '\')">✎</button>' +
                                    '<button title="View Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="previewInvoice(\'' + savedInvoice.id + '\')">👁</button>' +
                                    '<button title="Download Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="downloadInvoice(\'' + savedInvoice.id + '\')">⬇</button>' +
                                    '<button title="Delete Invoice" style="padding:6px 10px; border:none; border-radius:6px; background:#dc3545; color:white; cursor:pointer;" onclick="deleteInvoice(\'' + savedInvoice.id + '\')">🗑</button>'
                                : '<button style="padding:6px 10px; border:none; border-radius:6px; background:#0B5ED7; color:white; cursor:pointer;" onclick="openInvoiceTemplateForCandidate(\'' + (candidate.candidateId || '') + '\')">+ Create Invoice</button>') +
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

function openSavedInvoiceForEdit(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const preview = window.open('', 'Editable Invoice', 'width=1100,height=900');
    if (!preview) return;

    preview.document.write(generateInvoiceTemplate(buildInvoicePreviewData(invoice), true));
    preview.document.close();
}

function generateInvoiceTemplate(invoice, editable) {
    const readOnlyAttr = '';
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
                    background: #eef2f7;
                    font-family: "Poppins", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    color: #333333;
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
                    background: #0f4c81;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 22px rgba(15, 76, 129, 0.22);
                }
                .template-toolbar button:last-child {
                    background: #e2e8f0;
                    color: #0f172a;
                    box-shadow: none;
                }
                .page {
                    width: min(100%, 1040px);
                    margin: 28px auto 40px;
                    padding: 0;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 10px 35px rgba(0, 0, 0, .12);
                    overflow: hidden;
                }
                .invoice-header {
                    position: relative;
                    z-index: 1;
                    background: #ffffff;
                    color: #0f172a;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0;
                    padding: 18px 38px 14px;
                    border-bottom: 1px solid #dbe4f0;
                }
                .brand-block {
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                    gap: 8px;
                    justify-content: center;
                }
                .brand-block img {
                    width: 210px;
                    height: 210px;
                    object-fit: contain;
                    background: #ffffff;
                    border-radius: 0;
                    padding: 0;
                    border: none;
                    box-shadow: none;
                }
                .brand-center {
                    text-align: center;
                    margin-top: -8px;
                }
                .brand-center p {
                    margin: 0;
                    font-size: 16px;
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    opacity: 1;
                    color: #0f355d;
                    font-weight: 800;
                    text-decoration: underline;
                }
                .section {
                    padding: 30px 38px;
                }
                .top-info {
                    display: grid;
                    grid-template-columns: 1.35fr 0.65fr;
                    gap: 18px;
                    margin-bottom: 24px;
                }
                .panel {
                    border: 2px solid #dbe4f0;
                    border-radius: 12px;
                    padding: 10px;
                    background: #ffffff;
                }
                .panel h3 {
                    color: #0f4c81;
                    margin: 0 0 8px;
                    font-size: 15px;
                }
                .meta-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .meta-item {
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
                    border-radius: 8px;
                    background: #ffffff;
                    color: #0f172a;
                    padding: 8px 10px;
                    font-size: 13px;
                    outline: none;
                }
                .field-input {
                    min-height: 34px;
                }
                .field-input[readonly], .field-textarea[readonly] {
                    border-color: transparent;
                    background: transparent;
                    padding-left: 0;
                    padding-right: 0;
                    pointer-events: none;
                }
                .field-textarea {
                    min-height: 96px;
                    resize: vertical;
                }
                .field-textarea.two-line {
                    min-height: 66px;
                    height: 66px;
                    max-height: 66px;
                    line-height: 1.25;
                    resize: none;
                }
                .charges-panel {
                    position: relative;
                    overflow: hidden;
                    border: 2px solid #dbe4f0;
                    border-radius: 12px;
                    padding: 12px;
                    margin-top: 6px;
                }
                .charges-watermark {
                    position: absolute;
                    inset: 34px 0 0 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    opacity: 0.06;
                    z-index: 0;
                }
                .charges-watermark img {
                    width: 440px;
                    max-width: 75%;
                    height: auto;
                    object-fit: contain;
                    filter: grayscale(100%);
                }
                .charges-panel > *:not(.charges-watermark) {
                    position: relative;
                    z-index: 1;
                }
                .billto-grid {
                    display: grid;
                    gap: 8px;
                }
                .billto-row {
                    display: grid;
                    grid-template-columns: 126px 1fr;
                    align-items: center;
                    gap: 8px;
                }
                .billto-row label {
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .charges-heading {
                    color: #0f4c81;
                    margin: 0 0 12px;
                    font-size: 18px;
                }
                .charges-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 12px;
                }
                .charges-table th, .charges-table td {
                    border: 1px solid #ddd;
                    padding: 10px 12px;
                    vertical-align: top;
                }
                .charges-table th {
                    background: #0f4c81;
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .charges-table tbody tr:nth-child(even) {
                    background: #f8f9fb;
                }
                .summary-table {
                    width: 420px;
                    margin-left: auto;
                    margin-top: 16px;
                    border-collapse: separate;
                    table-layout: fixed;
                }
                .summary-table th,
                .summary-table td {
                    padding: 3px 8px;
                    border: none;
                }
                .summary-table th {
                    background: #ffffff;
                    color: #1f2937;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    width: 50%;
                    font-size: 12px;
                    line-height: 1.2;
                }
                .summary-table td {
                    background: #ffffff;
                    width: 50%;
                }
                .summary-table .field-input {
                    padding: 2px 8px;
                    text-align: right;
                    width: 100%;
                    min-height: 24px;
                    font-size: 12px;
                    line-height: 1.2;
                }
                .summary-table .summary-charge-row {
                    background: #ffffff;
                }
                .summary-table .summary-gst-row {
                    background: #ffffff;
                }
                .summary-table .total-row {
                    background: #ffffff;
                    color: #1f2937;
                    font-size: 15px;
                    font-weight: 700;
                }
                .bank-terms-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 18px;
                    margin-top: 24px;
                    align-items: stretch;
                }
                .bank-terms-grid .panel {
                    height: 100%;
                }
                .bank-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .bank-table td {
                    padding: 5px 7px;
                    border-bottom: 1px solid #eee;
                }
                .bank-table td:first-child {
                    font-weight: 600;
                    width: 144px;
                    font-size: 12px;
                }
                .bank-table .field-input {
                    min-height: 28px;
                    padding: 4px 7px;
                    font-size: 12px;
                }
                .terms-list {
                    margin: 2px 0 0;
                    padding-left: 18px;
                    color: #475569;
                    line-height: 1.45;
                    font-size: 12px;
                }
                .footer {
                    background: #ffffff;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .auth-note {
                    margin-top: 6px;
                    text-align: center;
                    font-size: 11px;
                    color: #475569;
                    font-style: italic;
                }
                .thankyou {
                    text-align: center;
                    padding: 10px 12px;
                    background: #f8fafc;
                    color: #0f172a;
                    font-size: 12px;
                    line-height: 1.4;
                    border-top: 1px solid #cbd5e1;
                }
                .thankyou strong {
                    display: block;
                    font-size: 16px;
                    color: #0f355d;
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
                        box-shadow: none;
                        border-radius: 0;
                    }
                }
                @media (max-width: 920px) {
                    .invoice-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    .brand-block,
                    .brand-center {
                        width: 100%;
                        justify-content: center;
                        text-align: center;
                    }
                    .section,
                    .footer {
                        margin-left: 0;
                        margin-right: 0;
                    }
                    .top-info,
                    .bank-terms-grid {
                        grid-template-columns: 1fr;
                    }
                    .summary-table {
                        width: 100%;
                    }
                    .footer {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .billto-row {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            ${toolbar}
            <div class="page">
                <div class="invoice-header">
                    <div class="brand-block">
                        <img src="images/logo.png" alt="Alcove Infotech logo">
                        <div class="brand-center">
                            <p>INVOICE</p>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="top-info">
                        <section class="panel">
                            <h3>Bill To</h3>
                            <div class="billto-grid">
                                <div class="billto-row">
                                    <label>Client Name</label>
                                    <input id="clientNameField" class="field-input" value="${escapeAttribute(invoice.clientName || '')}"${readOnlyAttr}>
                                </div>
                                <div class="billto-row">
                                    <label>Client Address</label>
                                    <textarea id="clientAddressField" rows="3" class="field-textarea two-line"${readOnlyAttr}>${escapeHtml(invoice.clientAddress || '')}</textarea>
                                </div>
                                <div class="billto-row">
                                    <label>GSTIN</label>
                                    <input id="clientGstinField" class="field-input" value="${escapeAttribute(invoice.clientGstin || '')}"${readOnlyAttr}>
                                </div>
                                <div class="billto-row">
                                    <label>Contact</label>
                                    <input class="field-input" value="${escapeAttribute(invoice.contactPerson || '')}"${readOnlyAttr}>
                                </div>
                                <div class="billto-row">
                                    <label>Email</label>
                                    <input id="clientEmailField" class="field-input" value="${escapeAttribute(invoice.clientEmail || '')}"${readOnlyAttr}>
                                </div>
                            </div>
                        </section>

                        <section class="panel">
                            <h3>Invoice Details</h3>
                            <div class="meta-grid">
                                <div class="meta-item">
                                    <label>Invoice No</label>
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
                                    <label>Payment Terms</label>
                                    <input class="field-input" value="7 Days"${readOnlyAttr}>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div class="charges-panel">
                        <div class="charges-watermark">
                            <img src="images/logo.png" alt="Alcove watermark">
                        </div>
                        <h3 class="charges-heading">Recruitment Service Charges</h3>
                        <table class="charges-table">
                            <thead>
                                <tr>
                                    <th>Candidate Name</th>
                                    <th>Position</th>
                                    <th>Date of Joining</th>
                                    <th>Offered CTC (₹)</th>
                                    <th>Commercials %</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><input id="candidateNameField" class="field-input" value="${escapeAttribute(invoice.candidateName || '')}"${readOnlyAttr}></td>
                                    <td><input id="positionField" class="field-input" value="${escapeAttribute(invoice.position || '')}"${readOnlyAttr}></td>
                                    <td><input id="joiningDateText" type="text" class="field-input" value="${escapeAttribute(formatDateForDisplay(invoice.joiningDate || ''))}"${readOnlyAttr}></td>
                                    <td><input id="offeredCtc" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.offeredCtc || invoice.annualCtc || ''))}"${readOnlyAttr}></td>
                                    <td><input id="billingPercentage" class="field-input" value="${escapeAttribute(invoice.billingPercentage || '')}"${readOnlyAttr}></td>
                                    <td><input id="professionalFee" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.professionalFee || ''))}"${readOnlyAttr}></td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="summary-table">
                            <tbody>
                                <tr class="summary-charge-row">
                                    <th>Professional Charges</th>
                                    <td><input id="subTotal" class="field-input" value="${escapeAttribute(formatMoneyValue(invoice.subTotal || invoice.professionalFee || ''))}"${readOnlyAttr}></td>
                                </tr>
                                <tr class="summary-gst-row">
                                    <th>GST (18%)</th>
                                    <td><input id="gstAmount" class="field-input" value=""${readOnlyAttr}></td>
                                </tr>
                                <tr class="total-row">
                                    <th>Total Amount</th>
                                    <td><input id="totalAmount" class="field-input" value=""${readOnlyAttr}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="bank-terms-grid">
                        <section class="panel">
                            <h3>Bank Details</h3>
                            <table class="bank-table">
                                <tr>
                                    <td>Account Name</td>
                                    <td><input class="field-input" value="Alcove Infotech" readonly></td>
                                </tr>
                                <tr>
                                    <td>Bank</td>
                                    <td><input class="field-input" value="${escapeAttribute(invoice.bankName || INVOICE_COMPANY_PROFILE.bankName || '')}" readonly></td>
                                </tr>
                                <tr>
                                    <td>Account Number</td>
                                    <td><input class="field-input" value="${escapeAttribute(invoice.bankAccount || INVOICE_COMPANY_PROFILE.bankAccount || '')}" readonly></td>
                                </tr>
                                <tr>
                                    <td>IFSC</td>
                                    <td><input class="field-input" value="${escapeAttribute(invoice.bankIfsc || INVOICE_COMPANY_PROFILE.bankIfsc || '')}" readonly></td>
                                </tr>
                                <tr>
                                    <td>Branch</td>
                                    <td><input class="field-input" value="${escapeAttribute(invoice.bankBranch || INVOICE_COMPANY_PROFILE.bankBranch || '')}" readonly></td>
                                </tr>
                            </table>
                        </section>

                        <section class="panel">
                            <h3>Terms & Conditions</h3>
                            <ul class="terms-list">
                                <li>Payment is due within <strong>7 days</strong> from the date of this invoice unless otherwise agreed in writing.</li>
                                <li>This invoice is raised upon the successful joining of the candidate placed by Alcove Infotech.</li>
                                <li>The replacement policy is applicable as per the mutually agreed Service Agreement or Purchase Order.</li>
                                <li>Kindly mention the <strong>Invoice Number</strong> while making the payment for easy reconciliation.</li>
                                <li>This is a computer-generated invoice and does not require a physical signature.</li>
                            </ul>
                        </section>
                    </div>
                </div>

                <div class="footer">
                </div>

                <div class="auth-note">This is a computer-generated invoice generated by Alcove Infotech systems and does not require a physical signature.</div>

                <div class="thankyou"><strong>Alcove Infotech</strong>Mumbai | Bangalore | Pune<br>Email: hr@alcoveinfotech.com&nbsp;&nbsp;&nbsp; Website: www.alcoveinfotech.com&nbsp;&nbsp;&nbsp; Phone: 022-35058109</div>

            </div>

            <script>
                (function () {
                    var basePayload = {
                        id: "${escapeAttribute(invoice.id || '')}",
                        candidateId: "${escapeAttribute(invoice.candidateId || '')}",
                        status: "${escapeAttribute(invoice.status || 'Draft')}"
                    };

                    function parseMoney(value) {
                        var source = String(value || '').trim().toLowerCase();
                        if (!source) return 0;

                        var multiplier = 1;
                        if (/\blac\b|\blakh\b/.test(source)) multiplier = 100000;
                        else if (/\bk\b/.test(source)) multiplier = 1000;

                        var numericText = source.replace(/[^0-9.\-]/g, '');
                        if (!numericText || numericText === '.' || numericText === '-') return 0;

                        var numeric = parseFloat(numericText);
                        if (!Number.isFinite(numeric)) return 0;
                        return numeric * multiplier;
                    }

                    function parsePercentage(value) {
                        var numericText = String(value || '').replace(/[^0-9.\-]/g, '');
                        if (!numericText || numericText === '.' || numericText === '-') return 0;
                        var numeric = parseFloat(numericText);
                        return Number.isFinite(numeric) ? numeric : 0;
                    }

                    function formatMoney(value) {
                        if (!value) return '';
                        return Math.round(value).toLocaleString('en-IN');
                    }

                    function updateSummaryFromProfessionalFee() {
                        var feeField = document.getElementById('professionalFee');
                        var totalField = document.getElementById('subTotal');
                        var gstField = document.getElementById('gstAmount');
                        if (!feeField || !totalField) return;

                        var currentFee = parseMoney(feeField.value);
                        totalField.value = formatMoney(currentFee);

                        var gstValue = currentFee * 0.18;
                        if (gstField) gstField.value = formatMoney(gstValue);
                        updateTotalFromGst();
                    }

                    function updateTotalFromGst() {
                        var feeField = document.getElementById('professionalFee');
                        var gstField = document.getElementById('gstAmount');
                        var grandTotalField = document.getElementById('totalAmount');
                        if (!feeField || !gstField || !grandTotalField) return;

                        var currentFee = parseMoney(feeField.value);
                        var gstValue = parseMoney(gstField.value);
                        grandTotalField.value = formatMoney(currentFee + gstValue);
                    }

                    function updateTotals() {
                        var ctcField = document.getElementById('offeredCtc');
                        var billingField = document.getElementById('billingPercentage');
                        var feeField = document.getElementById('professionalFee');
                        if (!ctcField || !billingField || !feeField) return;

                        var ctcValue = parseMoney(ctcField.value);
                        var percentageValue = parsePercentage(billingField.value);
                        var currentFee = ctcValue ? (ctcValue * (percentageValue / 100)) : 0;
                        feeField.value = formatMoney(currentFee);
                        updateSummaryFromProfessionalFee();
                    }

                    var ctcField = document.getElementById('offeredCtc');
                    var billingField = document.getElementById('billingPercentage');
                    var feeField = document.getElementById('professionalFee');
                    var gstField = document.getElementById('gstAmount');

                    if (ctcField) ctcField.addEventListener('input', updateTotals);
                    if (billingField) billingField.addEventListener('input', updateTotals);
                    if (feeField) feeField.addEventListener('input', function () {
                        updateSummaryFromProfessionalFee();
                    });
                    if (gstField) gstField.addEventListener('input', updateTotalFromGst);

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
                            clientGstin: document.getElementById('clientGstinField') ? document.getElementById('clientGstinField').value : '',
                            clientEmail: document.getElementById('clientEmailField') ? document.getElementById('clientEmailField').value : '',
                            candidateName: document.getElementById('candidateNameField') ? document.getElementById('candidateNameField').value : '',
                            position: document.getElementById('positionField') ? document.getElementById('positionField').value : '',
                            joiningDate: document.getElementById('joiningDateText') ? document.getElementById('joiningDateText').value : '',
                            offeredCtc: document.getElementById('offeredCtc') ? document.getElementById('offeredCtc').value : '',
                            annualCtc: document.getElementById('offeredCtc') ? document.getElementById('offeredCtc').value : '',
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
