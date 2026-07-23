/* ===========================================================
   ARMS v1.0
   Revenue Module
=========================================================== */

function parseCTCValue(value) {
    if (!value) return 0;
    const cleaned = String(value).replace(/,/g, '').toLowerCase();
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    const numeric = parseFloat(match[1]);
    if (cleaned.includes('l') || cleaned.includes('lac')) return numeric * 100000;
    if (cleaned.includes('k')) return numeric * 1000;
    return numeric;
}

function getClientByName(name) {
    return (Array.isArray(clients) ? clients : []).find(client => client.clientName === name) || null;
}

function getRevenueForCandidate(candidate) {
    const client = getClientByName(candidate.client || "");
    const billingPercent = Number(client && (client.commercialsPercentage || client.billingPercentage) ? (client.commercialsPercentage || client.billingPercentage) : 0);
    const ctcValue = parseCTCValue(candidate.currentCTC || 0);
    return ctcValue * (billingPercent / 100);
}

function updateRevenueDashboard() {
    const monthlyRevenue = (Array.isArray(candidates) ? candidates : []).filter(candidate => candidate.status === "Joined" && candidate.doj).reduce((sum, candidate) => sum + getRevenueForCandidate(candidate), 0);
    const pendingPayments = (Array.isArray(clients) ? clients : []).filter(client => (client.invoiceStatus || "").toLowerCase() === "pending" || (client.invoiceStatus || "").toLowerCase() === "unpaid").length;
    const collectedPayments = (Array.isArray(clients) ? clients : []).filter(client => (client.invoiceStatus || "").toLowerCase() === "paid").length;
    const expectedRevenue = (Array.isArray(candidates) ? candidates : []).filter(candidate => candidate.status === "Joined" || isOfferReleasedStatus(candidate.status)).reduce((sum, candidate) => sum + getRevenueForCandidate(candidate), 0);

    const monthlyEl = document.getElementById("monthlyRevenueValue");
    const pendingEl = document.getElementById("pendingPaymentsValue");
    const collectedEl = document.getElementById("collectedPaymentsValue");
    const expectedEl = document.getElementById("expectedRevenueValue");

    if (monthlyEl) monthlyEl.innerText = "₹" + monthlyRevenue.toLocaleString();
    if (pendingEl) pendingEl.innerText = pendingPayments;
    if (collectedEl) collectedEl.innerText = collectedPayments;
    if (expectedEl) expectedEl.innerText = "₹" + expectedRevenue.toLocaleString();

    const tbody = document.getElementById("revenueByClientBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const byClient = {};
    (Array.isArray(candidates) ? candidates : []).forEach(candidate => {
        if (!candidate.client) return;
        if (!byClient[candidate.client]) {
            byClient[candidate.client] = 0;
        }
        byClient[candidate.client] += getRevenueForCandidate(candidate);
    });

    Object.entries(byClient).forEach(([clientName, value]) => {
        const row = document.createElement("tr");
        row.innerHTML = '<td>' + clientName + '</td><td>₹' + value.toLocaleString() + '</td>';
        tbody.appendChild(row);
    });
}
