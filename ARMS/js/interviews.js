/* ===========================================================
   ARMS v1.0
   Interviews Management Module
=========================================================== */

let interviews = [];
let interviewCalendarMonth = null;

function parseInterviewDateParts(value) {
    if (!value) return null;

    if (typeof parseDateInputParts === 'function') {
        const parsed = parseDateInputParts(value);
        if (parsed) return parsed;
    }

    const trimmed = String(value).trim();
    const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        return {
            day: Number(slashMatch[1]),
            month: Number(slashMatch[2]),
            year: Number(slashMatch[3])
        };
    }

    const monthNames = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12
    };
    const textMonthMatch = trimmed.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})$/);
    if (textMonthMatch) {
        const month = monthNames[textMonthMatch[2].toLowerCase()];
        if (month) {
            return {
                day: Number(textMonthMatch[1]),
                month,
                year: Number(textMonthMatch[3])
            };
        }
    }

    return null;
}

function getInterviewMonthFromData() {
    if (!Array.isArray(interviews) || interviews.length === 0) return null;

    const withDate = interviews
        .map(i => ({ item: i, parts: parseInterviewDateParts(i && i.interviewDate) }))
        .filter(entry => entry.parts);

    if (withDate.length === 0) return null;

    withDate.sort((a, b) => {
        const aKey = a.parts.year * 10000 + a.parts.month * 100 + a.parts.day;
        const bKey = b.parts.year * 10000 + b.parts.month * 100 + b.parts.day;
        return aKey - bKey;
    });

    const chosen = withDate[withDate.length - 1].parts;
    return new Date(chosen.year, chosen.month - 1, 1);
}

function getTodayCalendarMonth() {
    const todayParts = parseDateInputParts(getCurrentISTDateString()) || parseDateInputParts(new Date().toISOString().split('T')[0]);
    return new Date(todayParts.year, todayParts.month - 1, 1);
}

function ensureInterviewCalendarMonth() {
    if (interviewCalendarMonth && !Number.isNaN(interviewCalendarMonth.getTime())) {
        return;
    }

    interviewCalendarMonth = getInterviewMonthFromData() || getTodayCalendarMonth();
}

function createInterview() {
    return {
        id: 'INT' + Date.now(),
        candidateName: '',
        requirement: '',
        interviewDate: '',
        interviewTime: '',
        mode: 'Virtual',
        panel: '',
        meetingLink: '',
        status: 'Scheduled',
        notes: '',
        feedback: ''
    };
}

function saveInterviews() {
    localStorage.setItem('armsInterviews', JSON.stringify(interviews));
}

function loadInterviews() {
    const data = localStorage.getItem('armsInterviews');
    if (data) {
        interviews = JSON.parse(data);
    } else {
        interviews = [];
    }
}

function openInterviewModal() {
    const modal = document.getElementById('interviewModal');
    if (!modal) {
        createInterviewModal();
    }
    document.getElementById('interviewModal')?.classList.add('show');
}

function closeInterviewModal() {
    document.getElementById('interviewModal')?.classList.remove('show');
}

function saveInterview() {
    const modal = document.getElementById('interviewModal');
    const readValue = (id) => {
        if (!modal) {
            return document.getElementById(id)?.value || '';
        }
        return modal.querySelector('#' + id)?.value || '';
    };

    const candidate = readValue('interviewCandidateName');
    if (!candidate) {
        alert('Candidate name is required.');
        return;
    }

    const interviewDate = readValue('interviewDate');
    if (!interviewDate) {
        alert('Interview date is required.');
        return;
    }

    const interview = createInterview();
    interview.candidateName = candidate;
    interview.requirement = readValue('interviewRequirement');
    interview.interviewDate = interviewDate;
    interview.interviewTime = readValue('interviewTime');
    interview.mode = readValue('interviewMode') || 'Virtual';
    interview.panel = readValue('interviewPanel');
    interview.meetingLink = readValue('meetingLink');
    interview.status = readValue('interviewStatus') || 'Scheduled';
    interview.notes = readValue('interviewNotes');
    interview.feedback = readValue('interviewFeedback');

    interviews.push(interview);
    const parts = parseInterviewDateParts(interview.interviewDate);
    if (parts) {
        interviewCalendarMonth = new Date(parts.year, parts.month - 1, 1);
    }
    saveInterviews();
    renderInterviewsGrid();
    closeInterviewModal();
}

function renderInterviewsGrid() {
    const container = document.getElementById('interviewsGrid');
    if (!container) return;

    ensureInterviewCalendarMonth();

    const monthLabel = document.getElementById('interviewMonthLabel');
    if (monthLabel) {
        monthLabel.textContent = interviewCalendarMonth.toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
            timeZone: IST_TIME_ZONE
        });
    }

    const monthStart = new Date(interviewCalendarMonth.getFullYear(), interviewCalendarMonth.getMonth(), 1);
    const monthEnd = new Date(interviewCalendarMonth.getFullYear(), interviewCalendarMonth.getMonth() + 1, 0);
    const leadDays = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();

    const byDate = {};
    (Array.isArray(interviews) ? interviews : []).forEach((item) => {
        if (!item) return;

        const rawDate = item.interviewDate || item.date || item.interview_date || '';
        const parts = parseInterviewDateParts(rawDate);
        if (!parts) return;

        const normalizedDate = formatDateInputValue(parts.year, parts.month, parts.day);

        if (!byDate[normalizedDate]) {
            byDate[normalizedDate] = [];
        }

        byDate[normalizedDate].push({
            ...item,
            interviewDate: normalizedDate
        });
    });

    let html = '<div class="interview-weekdays">' +
        '<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>' +
        '</div>' +
        '<div class="interview-calendar-days">';

    for (let i = 0; i < leadDays; i++) {
        html += '<div class="interview-day interview-day-empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = formatDateInputValue(monthStart.getFullYear(), monthStart.getMonth() + 1, day);
        const list = byDate[dateKey] || [];

        html += '<div class="interview-day">' +
            '<div class="interview-day-header">' + day + '</div>';

        if (list.length === 0) {
            html += '<div class="interview-empty">No interviews</div>';
        } else {
            list.forEach((interview) => {
                html += '<div class="interview-event">' +
                    '<div><strong>Candidate:</strong> ' + (interview.candidateName || '-') + '</div>' +
                    '<div><strong>Requirement:</strong> ' + (interview.requirement || '-') + '</div>' +
                    '<div><strong>Date:</strong> ' + formatDateDisplayIST(interview.interviewDate, '-') + '</div>' +
                    '<div><strong>Time:</strong> ' + (interview.interviewTime || '-') + '</div>' +
                    '<div><strong>Mode:</strong> ' + (interview.mode || '-') + '</div>' +
                    '<div><strong>Panel:</strong> ' + (interview.panel || '-') + '</div>' +
                    '<div><strong>Meeting Link:</strong> ' + (interview.meetingLink || '-') + '</div>' +
                    '<div><strong>Status:</strong> ' + (interview.status || '-') + '</div>' +
                    '<div><strong>Notes:</strong> ' + (interview.notes || '-') + '</div>' +
                    '<div><strong>Feedback:</strong> ' + (interview.feedback || '-') + '</div>' +
                    '<button class="interview-delete-btn" onclick="deleteInterview(\'' + interview.id + '\')">Delete</button>' +
                '</div>';
            });
        }

        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

function changeInterviewMonth(step) {
    ensureInterviewCalendarMonth();

    interviewCalendarMonth = new Date(interviewCalendarMonth.getFullYear(), interviewCalendarMonth.getMonth() + step, 1);
    renderInterviewsGrid();
}

function deleteInterview(id) {
    if (confirm('Delete this interview?')) {
        interviews = interviews.filter(i => i.id !== id);
        interviewCalendarMonth = getInterviewMonthFromData() || getTodayCalendarMonth();
        saveInterviews();
        renderInterviewsGrid();
    }
}

function createInterviewModal() {
    const modal = document.createElement('div');
    modal.id = 'interviewModal';
    modal.className = 'modal';
    modal.innerHTML = '<div class="modal-content">' +
        '<div class="modal-header"><h2>Add Interview</h2><span class="close" onclick="closeInterviewModal()">&times;</span></div>' +
        '<div class="modal-body"><div class="form-grid">' +
        '<div class="form-group"><label>Candidate Name</label><input type="text" id="interviewCandidateName"></div>' +
        '<div class="form-group"><label>Requirement</label><input type="text" id="interviewRequirement"></div>' +
        '<div class="form-group"><label>Interview Date</label><input type="date" id="interviewDate"></div>' +
        '<div class="form-group"><label>Interview Time</label><input type="time" id="interviewTime"></div>' +
        '<div class="form-group"><label>Mode</label><select id="interviewMode"><option>Virtual</option><option>Offline</option><option>Phone</option></select></div>' +
        '<div class="form-group"><label>Panel Members</label><input type="text" id="interviewPanel"></div>' +
        '<div class="form-group"><label>Meeting Link</label><input type="text" id="meetingLink"></div>' +
        '<div class="form-group"><label>Status</label><select id="interviewStatus"><option>Scheduled</option><option>Completed</option><option>Rescheduled</option><option>Cancelled</option></select></div>' +
        '<div class="form-group full"><label>Notes</label><textarea id="interviewNotes"></textarea></div>' +
        '<div class="form-group full"><label>Feedback</label><textarea id="interviewFeedback"></textarea></div>' +
        '</div></div>' +
        '<div class="modal-footer"><button class="btn btn-secondary" onclick="closeInterviewModal()">Cancel</button>' +
        '<button class="btn btn-primary" onclick="saveInterview()">Save</button></div>' +
        '</div>';
    document.body.appendChild(modal);
}
