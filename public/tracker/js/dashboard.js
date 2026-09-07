/* ===========================================================
   ARMS v1.0
   Dashboard & Analytics Module
=========================================================== */

let statusChart;

function updateMainDashboard() {
    // Candidates Section
    const dashCandidatesTotal = document.getElementById("dashCandidatesTotal");
    const dashCandidatesSelected = document.getElementById("dashCandidatesSelected");
    const dashCandidatesRejected = document.getElementById("dashCandidatesRejected");
    const dashCandidatesOnHold = document.getElementById("dashCandidatesOnHold");
    const dashCandidatesInProgress = document.getElementById("dashCandidatesInProgress");

    const allCandidates = Array.isArray(candidates) ? candidates : [];
    if (dashCandidatesTotal) dashCandidatesTotal.innerText = allCandidates.length;
    if (dashCandidatesSelected) dashCandidatesSelected.innerText = allCandidates.filter(c => isOfferReleasedStatus(c.status) || c.status === "Joined").length;
    if (dashCandidatesRejected) dashCandidatesRejected.innerText = allCandidates.filter(c => c.status === "Rejected").length;
    if (dashCandidatesOnHold) dashCandidatesOnHold.innerText = allCandidates.filter(c => c.status === "On Hold").length;
    if (dashCandidatesInProgress) dashCandidatesInProgress.innerText = allCandidates.filter(c => !isOfferReleasedStatus(c.status) && c.status !== "Joined" && c.status !== "Rejected" && c.status !== "On Hold").length;

    // Interviews Section
    const todayStr = getCurrentISTDateString();
    const todayDate = parseDateInputToUtcDate(todayStr);
    const todayWeekDay = todayDate ? todayDate.getUTCDay() : 0;
    const tomorrowStr = shiftDateInputValue(todayStr, 1);
    const endOfThisWeekStr = shiftDateInputValue(todayStr, 6 - todayWeekDay);
    const endOfNextWeekStr = shiftDateInputValue(endOfThisWeekStr, 7);

    const dashInterviewToday = document.getElementById("dashInterviewToday");
    const dashInterviewTomorrow = document.getElementById("dashInterviewTomorrow");
    const dashInterviewThisWeek = document.getElementById("dashInterviewThisWeek");
    const dashInterviewNextWeek = document.getElementById("dashInterviewNextWeek");

    if (dashInterviewToday) dashInterviewToday.innerText = allCandidates.filter(c => c.interviewDate === todayStr).length;
    if (dashInterviewTomorrow) dashInterviewTomorrow.innerText = allCandidates.filter(c => c.interviewDate === tomorrowStr).length;
    if (dashInterviewThisWeek) {
        const thisWeekCount = allCandidates.filter(c => {
            if (!c.interviewDate) return false;
            return c.interviewDate >= todayStr && c.interviewDate <= endOfThisWeekStr && c.interviewDate !== todayStr && c.interviewDate !== tomorrowStr;
        }).length;
        dashInterviewThisWeek.innerText = thisWeekCount;
    }
    if (dashInterviewNextWeek) {
        const nextWeekCount = allCandidates.filter(c => {
            if (!c.interviewDate) return false;
            return c.interviewDate > endOfThisWeekStr && c.interviewDate <= endOfNextWeekStr;
        }).length;
        dashInterviewNextWeek.innerText = nextWeekCount;
    }

    // Follow Ups Section
    const dashFollowupToday = document.getElementById("dashFollowupToday");
    const dashFollowupTomorrow = document.getElementById("dashFollowupTomorrow");
    const dashFollowupThisWeek = document.getElementById("dashFollowupThisWeek");
    const dashFollowupOverdue = document.getElementById("dashFollowupOverdue");

    if (dashFollowupToday) dashFollowupToday.innerText = allCandidates.filter(c => c.followupDate === todayStr).length;
    if (dashFollowupTomorrow) dashFollowupTomorrow.innerText = allCandidates.filter(c => c.followupDate === tomorrowStr).length;
    
    if (dashFollowupThisWeek) {
        const thisWeekCount = allCandidates.filter(c => {
            if (!c.followupDate) return false;
            return c.followupDate >= todayStr && c.followupDate <= endOfThisWeekStr && c.followupDate !== todayStr && c.followupDate !== tomorrowStr;
        }).length;
        dashFollowupThisWeek.innerText = thisWeekCount;
    }
    
    if (dashFollowupOverdue) dashFollowupOverdue.innerText = allCandidates.filter(c => c.followupDate && c.followupDate < todayStr).length;

    // Joinings Section
    const dashOfferReleasedTotal = document.getElementById("dashOfferReleasedTotal");
    const dashJoinedTotal = document.getElementById("dashJoinedTotal");
    const dashJoiningThisMonth = document.getElementById("dashJoiningThisMonth");
    const dashJoiningNextMonth = document.getElementById("dashJoiningNextMonth");
    const dashJoined45Days = document.getElementById("dashJoined45Days");

    if (dashOfferReleasedTotal) dashOfferReleasedTotal.innerText = allCandidates.filter(c => isOfferReleasedStatus(c.status)).length;
    if (dashJoinedTotal) dashJoinedTotal.innerText = allCandidates.filter(c => c.status === "Joined").length;
    
    if (dashJoiningThisMonth) {
        const nowParts = parseDateInputParts(todayStr);
        const thisMonthCount = allCandidates.filter(c => {
            if (!c.doj) return false;
            const dojParts = parseDateInputParts(c.doj);
            return dojParts && nowParts && dojParts.year === nowParts.year && dojParts.month === nowParts.month;
        }).length;
        dashJoiningThisMonth.innerText = thisMonthCount;
    }
    
    if (dashJoiningNextMonth) {
        const nowParts = parseDateInputParts(todayStr);
        const nextMonthStr = nowParts ? formatDateInputValue(nowParts.month === 12 ? nowParts.year + 1 : nowParts.year, nowParts.month === 12 ? 1 : nowParts.month + 1, 1) : todayStr;
        const nextMonthParts = parseDateInputParts(nextMonthStr);
        const nextMonthCount = allCandidates.filter(c => {
            if (!c.doj) return false;
            const dojParts = parseDateInputParts(c.doj);
            return dojParts && nextMonthParts && dojParts.year === nextMonthParts.year && dojParts.month === nextMonthParts.month;
        }).length;
        dashJoiningNextMonth.innerText = nextMonthCount;
    }
    
    if (dashJoined45Days) {
        const days45AgoStr = shiftDateInputValue(todayStr, -45);
        const joined45Count = allCandidates.filter(c => {
            if (!c.doj || c.status !== "Joined") return false;
            return c.doj <= days45AgoStr;
        }).length;
        dashJoined45Days.innerText = joined45Count;
    }

    // Revenue Section
    const dashPendingPayments3Days = document.getElementById("dashPendingPayments3Days");
    const dashRevenueLastMonth = document.getElementById("dashRevenueLastMonth");
    const dashRevenueThisMonth = document.getElementById("dashRevenueThisMonth");

    const allInvoices = Array.isArray(invoices) ? invoices : [];
    const now = new Date();
    
    // Pending payments > 3 days
    if (dashPendingPayments3Days) {
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const pendingCount = allInvoices.filter(inv => {
            if (!inv.invoiceDate) return false;
            const invDate = new Date(inv.invoiceDate);
            return (inv.status === "Draft" || inv.status === "Pending") && invDate <= threeDaysAgo;
        }).length;
        dashPendingPayments3Days.innerText = pendingCount;
    }
    
    // Revenue last month
    if (dashRevenueLastMonth) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const revenueLastMonth = allInvoices.filter(inv => {
            if (!inv.invoiceDate) return false;
            const invDate = new Date(inv.invoiceDate);
            return invDate.getFullYear() === lastMonth.getFullYear() && invDate.getMonth() === lastMonth.getMonth();
        }).reduce((sum, inv) => sum + (parseFloat(inv.billingAmount) || 0), 0);
        dashRevenueLastMonth.innerText = "₹" + revenueLastMonth.toFixed(0);
    }
    
    // Revenue this month
    if (dashRevenueThisMonth) {
        const revenueThisMonth = allInvoices.filter(inv => {
            if (!inv.invoiceDate) return false;
            const invDate = new Date(inv.invoiceDate);
            return invDate.getFullYear() === now.getFullYear() && invDate.getMonth() === now.getMonth();
        }).reduce((sum, inv) => sum + (parseFloat(inv.billingAmount) || 0), 0);
        dashRevenueThisMonth.innerText = "₹" + revenueThisMonth.toFixed(0);
    }
}

function renderRecruiterAnalytics() {

    const tbody = document.getElementById("recruiterAnalyticsBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const recruiters = [...new Set((Array.isArray(candidates) ? candidates : []).map(c => c.recruiter).filter(r => r))];

    recruiters.forEach(recruiter => {

        const profiles = (Array.isArray(candidates) ? candidates : []).filter(c => c.recruiter === recruiter);
        const interviews = profiles.filter(c => c.status === "Interview Scheduled").length;
        const offers = profiles.filter(c => isOfferReleasedStatus(c.status)).length;
        const joinees = profiles.filter(c => c.status === "Joined").length;
        const conversion = profiles.length === 0 ? 0 : ((joinees / profiles.length) * 100).toFixed(1);

        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + recruiter + '</td>' +
            '<td>' + profiles.length + '</td>' +
            '<td>' + interviews + '</td>' +
            '<td>' + offers + '</td>' +
            '<td>' + joinees + '</td>' +
            '<td>' + conversion + '%</td>';

        tbody.appendChild(row);

    });

}

function updateFollowupDashboard() {

    const today = getCurrentISTDateString();

    const overdue = document.getElementById("overdueCount");
    const upcoming = document.getElementById("upcomingInterviewCount");
    const joiningWeek = document.getElementById("joiningWeekCount");

    if (overdue) {
        overdue.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.followupDate && c.followupDate < today).length;
    }

    if (upcoming) {
        upcoming.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.interviewDate && c.interviewDate >= today).length;
    }

    if (joiningWeek) {
        const weekString = shiftDateInputValue(today, 7);
        joiningWeek.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.doj && c.doj <= weekString).length;
    }

}

function updateInterviewDashboard() {

    const today = getCurrentISTDateString();
    const tomorrowStr = shiftDateInputValue(today, 1);

    const todayCount = document.getElementById("todayInterviewCount");
    const tomorrowCount = document.getElementById("tomorrowInterviewCount");
    const joiningCount = document.getElementById("calendarJoiningCount");
    const feedbackCount = document.getElementById("pendingFeedbackCount");

    if (todayCount) {
        todayCount.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.interviewDate === today).length;
    }

    if (tomorrowCount) {
        tomorrowCount.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.interviewDate === tomorrowStr).length;
    }

    if (joiningCount) {
        const weekString = shiftDateInputValue(today, 7);
        joiningCount.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.doj && c.doj <= weekString).length;
    }

    if (feedbackCount) {
        feedbackCount.innerText = (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Interview Scheduled" && !c.clientFeedback).length;
    }

}

function renderInterviewCalendar() {

    const tbody = document.getElementById("interviewCalendarBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    (Array.isArray(candidates) ? candidates : []).filter(c => c.interviewDate).forEach(candidate => {
        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + (candidate.candidateName || "") + '</td>' +
            '<td>' + getRequirementName(candidate.role) + '</td>' +
            '<td>' + formatDateDisplayIST(candidate.interviewDate, "") + '</td>' +
            '<td>' + (candidate.interviewMode || "-") + '</td>' +
            '<td>' + (candidate.interviewPanel || "-") + '</td>' +
            '<td><span class="calendar-pill">' + (candidate.status || "") + '</span></td>' +
            '<td>' + (candidate.calendarNotes || "-") + '</td>';
        tbody.appendChild(row);
    });

}

function renderOfferPipeline() {

    const tbody = document.getElementById("offerPipelineBody");
    const offersCount = document.getElementById("offerPipelineCount");
    const joiningMonthCount = document.getElementById("joiningMonthCount");
    const joinedCount = document.getElementById("joinedPipelineCount");

    if (!tbody) return;

    tbody.innerHTML = "";

    const list = (Array.isArray(candidates) ? candidates : []).filter(candidate => {
        return candidate.offerReleased === "Yes" || isOfferReleasedStatus(candidate.status) || candidate.status === "Joined" || candidate.doj;
    });

    if (offersCount) {
        offersCount.innerText = list.filter(c => c.offerReleased === "Yes" || isOfferReleasedStatus(c.status) || c.status === "Joined").length;
    }

    if (joiningMonthCount) {
        const nowParts = parseDateInputParts(todayStr);
        joiningMonthCount.innerText = list.filter(c => {
            if (!c.doj) return false;
            const dojParts = parseDateInputParts(c.doj);
            return dojParts && nowParts && dojParts.year === nowParts.year && dojParts.month === nowParts.month;
        }).length;
    }

    if (joinedCount) {
        joinedCount.innerText = list.filter(c => c.status === "Joined").length;
    }

    list.forEach(candidate => {
        const row = document.createElement("tr");
        row.innerHTML =
            '<td>' + (candidate.candidateName || "") + '</td>' +
            '<td>' + getRequirementName(candidate.role) + '</td>' +
            '<td>' + (candidate.offerReleased === "Yes" || isOfferReleasedStatus(candidate.status) || candidate.status === "Joined" ? "Yes" : "No") + '</td>' +
            '<td>' + formatDateDisplayIST(candidate.doj, "-") + '</td>' +
            '<td><span class="calendar-pill">' + (candidate.status || "") + '</span></td>' +
            '<td>' + (candidate.comments || candidate.calendarNotes || "-") + '</td>';
        tbody.appendChild(row);
    });

}

function renderFollowupCenter() {

    const tbody = document.getElementById("followupCenterBody");
    const overdueCount = document.getElementById("followupOverdueCount");
    const todayCount = document.getElementById("followupTodayCount");
    const tomorrowCount = document.getElementById("followupTomorrowCount");
    const attentionCount = document.getElementById("followupAttentionCount");

    if (!tbody) return;

    tbody.innerHTML = "";

    const today = getCurrentISTDateString();
    const tomorrowStr = shiftDateInputValue(today, 1);
    const joiningReminderCutoff = shiftDateInputValue(today, 7);

    const list = (Array.isArray(candidates) ? candidates : []).filter(candidate => candidate.followupDate || candidate.interviewDate || candidate.doj);

    if (overdueCount) {
        overdueCount.innerText = list.filter(candidate => candidate.followupDate && candidate.followupDate < today).length;
    }

    if (todayCount) {
        todayCount.innerText = list.filter(candidate => candidate.followupDate === today || candidate.interviewDate === today).length;
    }

    if (tomorrowCount) {
        tomorrowCount.innerText = list.filter(candidate => candidate.interviewDate === tomorrowStr || candidate.followupDate === tomorrowStr).length;
    }

    if (attentionCount) {
        attentionCount.innerText = list.filter(candidate => {
            if (candidate.followupDate && candidate.followupDate < today) return true;
            if (candidate.interviewDate === today) return true;
            return candidate.doj && candidate.doj <= joiningReminderCutoff;
        }).length;
    }

    list.forEach(candidate => {
        const row = document.createElement("tr");
        const reminderType = candidate.doj && candidate.doj <= joiningReminderCutoff ? "Joining Reminder" : (candidate.followupDate && candidate.followupDate < today ? "Overdue Follow-up" : (candidate.interviewDate === today ? "Interview Today" : "Follow-up"));
        const severity = candidate.followupDate && candidate.followupDate < today ? "Red" : (candidate.interviewDate === today || (candidate.doj && candidate.doj <= joiningReminderCutoff) ? "Orange" : "Green");
        const badgeClass = severity === "Red" ? "reminder-pill danger" : (severity === "Orange" ? "reminder-pill warning" : "reminder-pill success");
        row.innerHTML =
            '<td>' + (candidate.candidateName || "") + '</td>' +
            '<td>' + getRequirementName(candidate.role) + '</td>' +
            '<td>' + formatDateDisplayIST(candidate.followupDate || candidate.interviewDate || candidate.doj, "-") + '</td>' +
            '<td><span class="' + badgeClass + '">' + reminderType + '</span></td>' +
            '<td>' + ((candidate.reminderSent === "Yes" || candidate.joiningReminder === "Yes") ? "Sent" : "Pending") + '</td>' +
            '<td>' + (candidate.comments || candidate.calendarNotes || "-") + '</td>';
        tbody.appendChild(row);
    });

}

function renderStatusChart() {

    const ctx = document.getElementById("statusChart");

    if (!ctx) return;

    const labels = ["Lead", "Screening", "Interview", "Offer", "Joined"];
    const data = [
        (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Lead Created").length,
        (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Screening").length,
        (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Interview Scheduled").length,
        (Array.isArray(candidates) ? candidates : []).filter(c => isOfferReleasedStatus(c.status)).length,
        (Array.isArray(candidates) ? candidates : []).filter(c => c.status === "Joined").length
    ];

    if (statusChart) {
        statusChart.destroy();
    }

    if (typeof Chart !== "undefined") {
        statusChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Candidates",
                    data,
                    backgroundColor: ["#0B5ED7", "#6C757D", "#FFC107", "#198754", "#DC3545"]
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

}
