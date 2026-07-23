/* ===========================================================
   ARMS v1.0
   Onboarding & Starter Data
=========================================================== */

function loadStarterData() {
    if (localStorage.getItem("armsDisableStarterData") === "true") {
        return;
    }

    const hasData = localStorage.getItem('armsCandidates') || localStorage.getItem('armsClients') || localStorage.getItem('armsRequirements');
    if (hasData) return;

    const today = getCurrentISTDateString();

    const starter = {
        candidates: [
            {
                candidateId: 'ALC00001',
                candidateName: 'Asha Sharma',
                mobile: '9876543210',
                email: 'asha@example.com',
                client: 'Alcove',
                role: 'Developer',
                recruiter: 'Admin',
                status: 'Interview Scheduled',
                interviewDate: today,
                followupDate: today,
                comments: 'Starter profile'
            }
        ],
        clients: [
            {
                clientId: 'CLI00001',
                clientName: 'Alcove',
                pocName: 'Rahul Verma',
                email: 'rahul@alcove.com',
                mobile: '9123456780',
                location: 'Bengaluru',
                activeRoles: 'Developer',
                agreementSigned: 'Yes'
            }
        ],
        requirements: [
            {
                id: 'REQ00001',
                client: 'Alcove',
                position: 'Developer',
                openings: '2',
                priority: 'High',
                status: 'Open',
                assignedRecruiter: 'Admin',
                comments: 'Starter requirement'
            }
        ],
        vendors: []
    };

    localStorage.setItem('armsCandidates', JSON.stringify(starter.candidates));
    localStorage.setItem('armsClients', JSON.stringify(starter.clients));
    localStorage.setItem('armsRequirements', JSON.stringify(starter.requirements));
    localStorage.setItem('armsVendors', JSON.stringify(starter.vendors));
    showNotification('Starter data loaded.');
}

function renderWelcomeBanner() {
    const banner = document.getElementById('welcomeBanner');
    if (!banner) return;

    const user = getCurrentUser();
    const name = user ? user.name : 'Recruiter';
    banner.innerHTML = '<strong>Welcome, ' + name + '.</strong> Start by adding a candidate or opening a requirement.';
}
