/* ===========================================================
   ARMS v1.0
   Export Module
=========================================================== */

function exportCandidates() {

    const data = (Array.isArray(candidates) ? candidates : []).map(c => ({
        CandidateID: c.candidateId,
        CandidateName: c.candidateName,
        Mobile: c.mobile,
        Email: c.email,
        Client: c.client,
        Role: c.role,
        Recruiter: c.recruiter,
        Experience: c.experience,
        CurrentCompany: c.currentCompany,
        CurrentCTC: c.currentCTC,
        ExpectedCTC: c.expectedCTC,
        NoticePeriod: c.noticePeriod,
        Status: c.status,
        FollowupDate: c.followupDate,
        Comments: c.comments
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");
    XLSX.writeFile(wb, "Candidates.xlsx");

}

function exportClients() {

    const data = (Array.isArray(clients) ? clients : []).map(c => ({
        ClientID: c.clientId,
        ClientName: c.clientName,
        Industry: c.industry,
        POCName: c.pocName,
        Email: c.email,
        Mobile: c.mobile,
        Location: c.location,
        ActiveRoles: c.activeRoles,
        AgreementSigned: c.agreementSigned,
        BillingTerms: c.billingTerms,
        Status: c.status,
        Comments: c.comments
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "Clients.xlsx");

}
