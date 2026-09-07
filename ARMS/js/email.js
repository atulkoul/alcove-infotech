/* ===========================================================
   ARMS v1.0
   Email Templates Module
=========================================================== */

function getDefaultEmailTemplates() {
    return [
        {
            id: 'interview-invite',
            name: 'Interview Invite',
            subject: 'Interview Invitation for {{candidateName}}',
            body: 'Hello {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{role}} role with {{client}}. Please confirm your availability and we will share the meeting details shortly.\n\nBest regards,\nARMS Team'
        },
        {
            id: 'follow-up',
            name: 'Follow-up',
            subject: 'Follow-up for {{candidateName}}',
            body: 'Hello {{candidateName}},\n\nThis is a friendly follow-up regarding your application for the {{role}} position with {{client}}. We would love to share an update soon.\n\nBest regards,\nARMS Team'
        },
        {
            id: 'offer-update',
            name: 'Offer Update',
            subject: 'Offer Update for {{candidateName}}',
            body: 'Hello {{candidateName}},\n\nWe are sharing an update on your offer for the {{role}} role with {{client}}. Please let us know if you would like us to arrange a call.\n\nBest regards,\nARMS Team'
        }
    ];
}

function createEmailTemplate(templates, template) {
    return [...(templates || []), {
        id: template.id || 'custom-' + Date.now(),
        name: template.name || 'Custom Template',
        subject: template.subject || '',
        body: template.body || ''
    }];
}

function buildTemplateContent(template, context) {
    const subject = (template.subject || '').replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return context[key.trim()] || '';
    });
    const body = (template.body || '').replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return context[key.trim()] || '';
    });

    return { subject, body };
}

function renderEmailTemplates() {
    const container = document.getElementById('emailTemplateList');
    if (!container) return;

    const templates = getDefaultEmailTemplates();
    container.innerHTML = templates.map((template) => {
        return '<div class="notification-item" style="cursor:pointer;" onclick="previewEmailTemplate(\'' + template.id + '\')">' +
            '<strong>' + (template.name || 'Template') + '</strong><div style="font-size:13px; color:#6c757d; margin-top:4px;">' +
            (template.subject || '') + '</div></div>';
    }).join('');
}

function previewEmailTemplate(templateId) {
    const templates = getDefaultEmailTemplates();
    const template = templates.find(item => item.id === templateId) || templates[0];
    const context = {
        candidateName: document.getElementById('emailCandidateName')?.value || 'Candidate',
        role: document.getElementById('emailRole')?.value || 'Role',
        client: document.getElementById('emailClient')?.value || 'Client'
    };

    const preview = buildTemplateContent(template, context);
    const subjectField = document.getElementById('emailSubject');
    const bodyField = document.getElementById('emailBody');

    if (subjectField) subjectField.value = preview.subject;
    if (bodyField) bodyField.value = preview.body;
}

function sendEmailTemplate() {
    const subject = document.getElementById('emailSubject')?.value || '';
    const body = document.getElementById('emailBody')?.value || '';
    if (!subject || !body) {
        showNotification('Please add subject and body before sending.');
        return;
    }

    showNotification('Email template prepared for delivery.');
}
