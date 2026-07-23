const assert = require('node:assert/strict');
const { getDefaultEmailTemplates, buildTemplateContent, createEmailTemplate } = require('../js/email.js');

const templates = getDefaultEmailTemplates();
assert.ok(Array.isArray(templates) && templates.length >= 1, 'default templates should exist');

const preview = buildTemplateContent(templates[0], {
  candidateName: 'Asha',
  role: 'Developer',
  client: 'Alcove'
});
assert.match(preview.subject, /Asha/);
assert.match(preview.body, /Asha/);
assert.match(preview.body, /Developer/);

const updatedTemplates = createEmailTemplate(templates, {
  name: 'Custom Follow-up',
  subject: 'Hi {{candidateName}}',
  body: 'Hello {{candidateName}}'
});
assert.equal(updatedTemplates.length, templates.length + 1);
assert.equal(updatedTemplates[updatedTemplates.length - 1].name, 'Custom Follow-up');

console.log('Email template helpers verified');
