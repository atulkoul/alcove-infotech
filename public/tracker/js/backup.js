/* ===========================================================
   ARMS v1.0
   Backup & Import Module
=========================================================== */

function downloadBackup() {
    const payload = {
        candidates: Array.isArray(candidates) ? candidates : [],
        clients: Array.isArray(clients) ? clients : [],
        requirements: Array.isArray(requirements) ? requirements : [],
        vendors: Array.isArray(vendors) ? vendors : []
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arms-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Backup downloaded.');
}

function importBackup() {
    const input = document.getElementById('importFile');
    if (!input || !input.files || !input.files[0]) {
        showNotification('Please choose a backup file.');
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        try {
            const parsed = JSON.parse(reader.result || '{}');
            if (Array.isArray(parsed.candidates)) {
                candidates = parsed.candidates;
                saveCandidates();
            }
            if (Array.isArray(parsed.clients)) {
                clients = parsed.clients;
                saveClients();
            }
            if (Array.isArray(parsed.requirements)) {
                requirements = parsed.requirements;
                saveRequirements();
            }
            if (Array.isArray(parsed.vendors)) {
                vendors = parsed.vendors;
                saveVendors();
            }

            renderTable();
            renderClients();
            renderRequirementsGrid();
            renderVendors();
            updateRevenueDashboard();
            updateMainDashboard();
            showNotification('Backup imported successfully.');
        } catch (error) {
            showNotification('Invalid backup file.');
        }
    };
    reader.readAsText(file);
}
