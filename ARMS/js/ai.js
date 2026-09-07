/* ===========================================================
   ARMS v1.0
   AI-assisted Resume Parsing
=========================================================== */

let lastAiMatchResult = null;
let currentMappingCandidateIndex = -1;
let pendingAiCompareIndex = -1;
let lastAiNarrativeText = "";

const AI_NARRATIVE_KEY_STORAGE = "armsAiNarrativeApiKey";
const AI_NARRATIVE_BASE_STORAGE = "armsAiNarrativeApiBase";
const AI_NARRATIVE_MODEL_STORAGE = "armsAiNarrativeModel";
const AI_DEFAULT_BASE = "https://api.openai.com/v1/chat/completions";
const AI_DEFAULT_MODEL = "gpt-4o-mini";

function parseResumeText(text) {
    const source = (text || "").replace(/\s+/g, " ").trim();

    const extractEmail = () => {
        const match = source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        return match ? match[0] : "";
    };

    const extractPhone = () => {
        const match = source.match(/(\+?\d[\d\s().-]{7,}\d)/);
        return match ? match[0].replace(/\s+/g, " ").trim() : "";
    };

    const extractName = () => {
        const match = source.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
        return match ? match[1] : "";
    };

    const extractExperience = () => {
        const match = source.match(/(\d+)\s*(?:\+\s*)?(?:years?|yrs?)/i);
        return match ? match[1] + " years" : "";
    };

    const extractCompany = () => {
        const match = source.match(/(?:at|with|from)\s+([A-Z][A-Za-z0-9&.\- ]{2,})/i);
        return match ? match[1].trim() : "";
    };

    const extractLocation = () => {
        const match = source.match(/(?:location|based in|current location)\s*[:\-]?\s*([A-Z][A-Za-z0-9,\- ]{2,})/i);
        return match ? match[1].trim() : "";
    };

    const extractRole = () => {
        const roles = ["Developer", "Engineer", "QA", "Analyst", "Manager", "Designer", "Recruiter", "Sales", "Support"];
        const matched = roles.find((role) => source.toLowerCase().includes(role.toLowerCase()));
        return matched || "";
    };

    return {
        candidateName: extractName(),
        email: extractEmail(),
        mobile: extractPhone(),
        experience: extractExperience(),
        currentCompany: extractCompany(),
        currentLocation: extractLocation(),
        role: extractRole()
    };
}

function applyParsedResume(parsed) {
    if (!parsed) return;

    const fields = [
        ["candidateName", parsed.candidateName],
        ["email", parsed.email],
        ["mobile", parsed.mobile],
        ["experience", parsed.experience],
        ["currentCompany", parsed.currentCompany],
        ["currentLocation", parsed.currentLocation]
    ];

    fields.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
}

function parseResumeFromUpload() {
    if (!pendingResumeFile) {
        alert("Please select a resume file first.");
        return;
    }

    const allowed = /\.(txt|pdf|docx)$/i;
    if (!allowed.test(pendingResumeFile.name || "")) {
        alert("Resume parsing supports TXT, PDF, and DOCX files.");
        return;
    }

    extractResumeTextFromFile(pendingResumeFile)
        .then(text => {
            const parsed = parseResumeText(text || "");
            applyParsedResume(parsed);

            const status = document.getElementById("resumeStatus");
            if (status) {
                status.innerText = text
                    ? "Resume parsed and fields filled."
                    : "Resume loaded, but readable text could not be extracted.";
            }

            showNotification("Resume parsed successfully.");
        })
        .catch(() => {
            alert("Could not parse this resume file. Please try TXT, searchable PDF, or DOCX.");
        });
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result || "");
        reader.onerror = () => reject(new Error("Failed to read resume file."));
        reader.readAsDataURL(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Failed to parse resume text."));
        reader.readAsText(file);
    });
}

function decodeTextFromDataUrl(dataUrl) {
    const value = String(dataUrl || "");
    const parts = value.split(",");
    if (parts.length < 2) {
        return "";
    }

    try {
        return decodeURIComponent(escape(atob(parts[1])));
    } catch (_error) {
        return "";
    }
}

async function extractTextFromPdf(file) {
    if (!window.pdfjsLib) {
        throw new Error("PDF library unavailable");
    }

    if (window.pdfjsLib.GlobalWorkerOptions) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/legacy/build/pdf.worker.min.js";
    }

    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;

    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
        const page = await pdf.getPage(pageNo);
        const textContent = await page.getTextContent();
        const pageText = (textContent.items || []).map(item => item.str || "").join(" ");
        pages.push(pageText);
    }

    return pages.join(" ").replace(/\s+/g, " ").trim();
}

async function extractTextFromDocx(file) {
    if (!window.mammoth || typeof window.mammoth.extractRawText !== "function") {
        throw new Error("DOCX library unavailable");
    }

    const buffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
    return String(result && result.value ? result.value : "").replace(/\s+/g, " ").trim();
}

async function extractResumeTextFromFile(file) {
    const fileName = String(file && file.name ? file.name : "").toLowerCase();

    if (fileName.endsWith(".txt")) {
        return readFileAsText(file);
    }

    if (fileName.endsWith(".pdf")) {
        return extractTextFromPdf(file);
    }

    if (fileName.endsWith(".docx")) {
        return extractTextFromDocx(file);
    }

    return "";
}

async function dataUrlToFile(dataUrl, fileName) {
    const response = await fetch(String(dataUrl || ""));
    const blob = await response.blob();
    return new File([blob], fileName || "resume", { type: blob.type || "application/octet-stream" });
}

async function ensureCandidateResumeText(index, candidate) {
    if (!candidate) return "";
    if (String(candidate.resumeText || "").trim()) {
        return candidate.resumeText;
    }

    if (!candidate.resumeFile) {
        return "";
    }

    try {
        let extracted = "";

        if (/\.txt$/i.test(candidate.resumeName || "")) {
            extracted = decodeTextFromDataUrl(candidate.resumeFile);
        } else if (/\.(pdf|docx)$/i.test(candidate.resumeName || "")) {
            const file = await dataUrlToFile(candidate.resumeFile, candidate.resumeName || "resume");
            extracted = await extractResumeTextFromFile(file);
        }

        if (extracted) {
            candidate.resumeText = extracted;
            if (index >= 0 && index < candidates.length) {
                candidates[index] = candidate;
                saveCandidates();
            }
        }

        return extracted;
    } catch (_error) {
        return "";
    }
}

async function attachResumeToCandidate(candidate, existingCandidate) {
    if (!candidate) return;

    if (existingCandidate) {
        candidate.resumeFile = existingCandidate.resumeFile || "";
        candidate.resumeName = existingCandidate.resumeName || "";
        candidate.resumeUploadedDate = existingCandidate.resumeUploadedDate || "";
        candidate.resumeVersion = existingCandidate.resumeVersion || "1";
        candidate.resumeText = existingCandidate.resumeText || "";
    }

    if (!pendingResumeFile) {
        return;
    }

    try {
        candidate.resumeName = pendingResumeFile.name || "resume";
        candidate.resumeUploadedDate = getCurrentISTDateString();

        const prevVersion = Number(existingCandidate && existingCandidate.resumeVersion ? existingCandidate.resumeVersion : 0);
        candidate.resumeVersion = String(Math.max(1, prevVersion + 1));

        candidate.resumeFile = await readFileAsDataUrl(pendingResumeFile);
        candidate.resumeText = await extractResumeTextFromFile(pendingResumeFile);

        const status = document.getElementById("resumeStatus");
        if (status) {
            status.innerText = candidate.resumeText
                ? "Resume: " + candidate.resumeName + " (v" + candidate.resumeVersion + ")"
                : "Resume uploaded, but readable text extraction is limited for this file.";
        }

        const resumeInput = document.getElementById("resumeUpload");
        if (resumeInput) {
            resumeInput.value = "";
        }

        pendingResumeFile = null;
    } catch (error) {
        alert(error.message || "Unable to process resume file.");
    }
}

function tokenizeForMatch(text) {
    const stopWords = new Set([
        "the", "and", "for", "with", "from", "that", "this", "are", "was", "were", "have", "has", "had", "you", "your", "our", "their", "they", "will", "shall", "can", "must", "job", "role", "work", "years", "year", "skills", "skill", "candidate", "requirements", "requirement", "experience", "good", "strong", "knowledge", "ability", "team"
    ]);

    const normalized = String(text || "")
        .toLowerCase()
        .replace(/c\+\+/g, " cpp ")
        .replace(/c#/g, " csharp ")
        .replace(/\.net/g, " dotnet ")
        .replace(/node\.?js/g, " nodejs ")
        .replace(/react\.?js/g, " reactjs ")
        .replace(/next\.?js/g, " nextjs ")
        .replace(/express\.?js/g, " expressjs ")
        .replace(/\bms\s*sql\b/g, " mssql ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return normalized
        .split(" ")
        .filter(token => token.length > 2 && !stopWords.has(token));
}

function uniqueTokens(tokens) {
    return Array.from(new Set(Array.isArray(tokens) ? tokens : []));
}

function buildCandidateComparableText(candidate) {
    if (!candidate) return "";

    const profileSnapshot = [
        candidate.candidateName,
        candidate.role,
        candidate.currentCompany,
        candidate.experience,
        candidate.currentLocation,
        candidate.preferredLocation,
        candidate.comments,
        candidate.clientFeedback,
        candidate.calendarNotes
    ].join(" ");

    let resumeBody = candidate.resumeText || "";

    if (!resumeBody && /\.txt$/i.test(candidate.resumeName || "") && candidate.resumeFile) {
        resumeBody = decodeTextFromDataUrl(candidate.resumeFile);
    }

    return [resumeBody, profileSnapshot]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

function buildTermsForMatch(text) {
    const tokens = tokenizeForMatch(text);
    const unigrams = uniqueTokens(tokens);
    const bigrams = [];

    for (let i = 0; i < tokens.length - 1; i += 1) {
        const first = tokens[i];
        const second = tokens[i + 1];
        if (first && second) {
            bigrams.push(first + " " + second);
        }
    }

    return uniqueTokens(unigrams.concat(bigrams));
}

function getExperienceNumber(value) {
    const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : null;
}

function scoreResumeAgainstJobDescription(resumeText, jdText) {
    const jdTokens = buildTermsForMatch(jdText);
    const resumeTokens = buildTermsForMatch(resumeText);

    if (!jdTokens.length || !resumeTokens.length) {
        return {
            score: 0,
            coverage: 0,
            matchedKeywords: [],
            missingKeywords: [],
            jdTermsCount: jdTokens.length,
            resumeTermsCount: resumeTokens.length,
            matchedTermsCount: 0
        };
    }

    const resumeSet = new Set(resumeTokens);
    const matchedKeywords = jdTokens.filter(token => resumeSet.has(token));
    const missingKeywords = jdTokens.filter(token => !resumeSet.has(token));

    const coverage = (matchedKeywords.length / jdTokens.length) * 100;
    const unionSize = new Set(jdTokens.concat(resumeTokens)).size;
    const jaccard = unionSize === 0 ? 0 : (matchedKeywords.length / unionSize) * 100;

    const score = Math.round((coverage * 0.75) + (jaccard * 0.25));

    return {
        score: Math.max(0, Math.min(100, score)),
        coverage: Math.round(coverage),
        matchedKeywords,
        missingKeywords,
        jdTermsCount: jdTokens.length,
        resumeTermsCount: resumeTokens.length,
        matchedTermsCount: matchedKeywords.length
    };
}

function containsAny(text, keywords) {
    const haystack = normalizeText(text);
    return (Array.isArray(keywords) ? keywords : []).some(keyword => haystack.includes(normalizeText(keyword)));
}

function countKeywordHits(text, keywords) {
    const haystack = normalizeText(text);
    const uniq = uniqueTokens(Array.isArray(keywords) ? keywords.map(k => normalizeText(k)) : []);
    return uniq.filter(keyword => keyword && haystack.includes(keyword)).length;
}

function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function toStatus(score) {
    if (score >= 80) return "✅ " + score + "%";
    if (score >= 50) return "⚠️ " + score + "%";
    return "❌ " + score + "%";
}

function parseYearsFromText(text) {
    const source = String(text || "");
    const matches = [...source.matchAll(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/gi)];
    if (!matches.length) return null;
    return matches.reduce((max, item) => Math.max(max, Number(item[1] || 0)), 0);
}

function buildDetailedAssessment(candidate, requirement, jdText, resumeText) {
    const jdLower = normalizeText(jdText);
    const resumeLower = normalizeText(resumeText);

    const candidateYears = getExperienceNumber(candidate.experience) || parseYearsFromText(resumeText) || 0;
    const requiredYears = parseYearsFromText(jdText) || getExperienceNumber(requirement.experience) || 0;

    const criteria = [
        { key: "experience", label: "Experience Requirement", weight: 10, jdKeywords: ["years", "experience"] },
        { key: "leadership", label: "Senior Leadership", weight: 8, jdKeywords: ["lead", "leadership", "head", "director", "manage team"], resumeKeywords: ["lead", "managed", "manager", "head", "director", "team lead"] },
        { key: "operations", label: "Operations Management", weight: 9, jdKeywords: ["operations", "operational", "process"], resumeKeywords: ["operations", "operational", "process", "workflow", "execution"] },
        { key: "crossfunctional", label: "Cross-functional Coordination", weight: 7, jdKeywords: ["cross-functional", "cross functional", "stakeholder", "collaboration"], resumeKeywords: ["cross-functional", "stakeholder", "coordination", "collaboration"] },
        { key: "strategy", label: "Strategic Planning", weight: 7, jdKeywords: ["strategy", "strategic", "planning", "roadmap"], resumeKeywords: ["strategy", "strategic", "planning", "roadmap", "transformation"] },
        { key: "policy", label: "Policy & Process Development", weight: 6, jdKeywords: ["policy", "process development", "sop", "governance"], resumeKeywords: ["policy", "sop", "process improvement", "governance"] },
        { key: "resource", label: "Resource Management", weight: 6, jdKeywords: ["resource management", "resource planning", "capacity"], resumeKeywords: ["resource", "allocation", "capacity", "planning"] },
        { key: "budget", label: "Budget Management", weight: 8, jdKeywords: ["budget", "cost", "p&l", "financial"], resumeKeywords: ["budget", "cost", "finance", "p&l", "forecast"] },
        { key: "kpi", label: "KPI / MIS Reporting", weight: 7, jdKeywords: ["kpi", "mis", "dashboard", "reporting"], resumeKeywords: ["kpi", "mis", "dashboard", "reporting", "analytics"] },
        { key: "quality", label: "Quality & Compliance", weight: 6, jdKeywords: ["quality", "compliance", "audit", "iso"], resumeKeywords: ["quality", "compliance", "audit", "iso", "qa"] },
        { key: "team", label: "Team Leadership", weight: 7, jdKeywords: ["team", "people management", "leadership"], resumeKeywords: ["team", "managed", "mentor", "coach", "people"] },
        { key: "vendor", label: "Vendor Management", weight: 5, jdKeywords: ["vendor", "procurement", "partner management"], resumeKeywords: ["vendor", "supplier", "partner"] },
        { key: "stakeholder", label: "Stakeholder Management", weight: 6, jdKeywords: ["stakeholder", "client management", "cxo"], resumeKeywords: ["stakeholder", "client", "customer", "executive"] },
        { key: "project", label: "Project Management", weight: 5, jdKeywords: ["project", "program", "delivery"], resumeKeywords: ["project", "program", "delivery", "implementation"] },
        { key: "problem", label: "Problem Solving", weight: 4, jdKeywords: ["problem solving", "root cause", "escalation"], resumeKeywords: ["problem", "root cause", "escalation", "resolution"] },
        { key: "communication", label: "Communication Skills", weight: 4, jdKeywords: ["communication", "presentation", "stakeholder"], resumeKeywords: ["communication", "presentation", "documentation", "coordination"] },
        { key: "tools", label: "Operational Software", weight: 4, jdKeywords: ["software", "erp", "crm", "excel", "dashboard"], resumeKeywords: ["sap", "oracle", "salesforce", "zoho", "excel", "power bi", "qlik", "crm", "erp"] },
        { key: "domain", label: "Domain Fit", weight: 5, jdKeywords: ["industry", "domain", "infrastructure", "its", "tolling", "transport"], resumeKeywords: ["infrastructure", "its", "tolling", "transport", "engineering", "manufacturing", "automotive"] },
        { key: "military", label: "Military Preference", weight: 2, jdKeywords: ["military", "army", "navy", "air force", "veteran"], resumeKeywords: ["military", "army", "navy", "air force", "veteran"] }
    ];

    const rows = criteria.map(item => {
        const jdRelevant = containsAny(jdLower, item.jdKeywords || []);
        let score = 45;
        let comment = "Limited evidence.";

        if (item.key === "experience") {
            if (requiredYears > 0) {
                score = candidateYears > 0 ? clampScore((candidateYears / requiredYears) * 100) : 0;
                comment = candidateYears > 0
                    ? candidateYears + "+ years vs required " + requiredYears + "+ years"
                    : "Experience years not detected in resume.";
            } else {
                score = candidateYears > 0 ? 80 : 45;
                comment = candidateYears > 0 ? candidateYears + "+ years detected" : "Could not estimate total experience.";
            }
        } else if (item.key === "military") {
            const jdWantsMilitary = containsAny(jdLower, item.jdKeywords || []);
            const resumeMilitary = containsAny(resumeLower, item.resumeKeywords || []);
            score = jdWantsMilitary ? (resumeMilitary ? 100 : 0) : 60;
            comment = jdWantsMilitary
                ? (resumeMilitary ? "Relevant military/veteran background found." : "JD prefers military profile; not found in resume.")
                : "Not strongly required in JD.";
        } else {
            const expected = Math.max(1, uniqueTokens(item.resumeKeywords || []).length);
            const hits = countKeywordHits(resumeLower, item.resumeKeywords || []);
            score = clampScore((hits / expected) * 100);

            if (!jdRelevant) {
                score = clampScore((score * 0.6) + 30);
            }

            if (score >= 80) {
                comment = "Strong evidence in resume.";
            } else if (score >= 50) {
                comment = "Partial evidence; may need deeper interview validation.";
            } else {
                comment = "Low evidence against JD expectation.";
            }
        }

        return {
            key: item.key,
            label: item.label,
            score,
            status: toStatus(score),
            comment,
            relevantWeight: jdRelevant ? item.weight : Math.max(1, Math.round(item.weight * 0.45))
        };
    });

    const weightedTotal = rows.reduce((sum, row) => sum + (row.score * row.relevantWeight), 0);
    const weightedBase = rows.reduce((sum, row) => sum + row.relevantWeight, 0) || 1;
    const overall = clampScore(weightedTotal / weightedBase);

    const strengths = rows
        .filter(row => row.score >= 75)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(row => row.label + " (" + row.score + "%)");

    const gaps = rows
        .filter(row => row.score < 55)
        .sort((a, b) => a.score - b.score)
        .slice(0, 8)
        .map(row => row.label + " (" + row.score + "%)");

    const leadershipScore = rows.find(row => row.key === "leadership");
    const strategyScore = rows.find(row => row.key === "strategy");
    const budgetScore = rows.find(row => row.key === "budget");

    let suitableRoles;
    if (overall >= 75 && leadershipScore && leadershipScore.score >= 70) {
        suitableRoles = ["Head of Operations", "General Manager - Operations", "Director - Operations"];
    } else if (overall >= 60) {
        suitableRoles = ["Business Operations Manager", "Operations Manager", "Program Operations Lead"];
    } else {
        suitableRoles = ["Operations Coordinator", "Executive Business Partner", "Manager - Administration & Operations"];
    }

    let recommendation = "Conditional / Average Fit";
    if (overall >= 78) {
        recommendation = "Strong Fit";
    } else if (overall < 55) {
        recommendation = "Low Fit";
    }

    const summary = overall >= 75
        ? "Candidate appears to be a strong fit for this role based on resume-JD overlap."
        : overall >= 55
            ? "Candidate appears to be a moderate fit; key strengths exist, but some critical areas require validation."
            : "Candidate appears to be a limited fit for this role, with significant gaps against key JD expectations.";

    const strategicGap = strategyScore ? strategyScore.score : 0;
    const budgetGap = budgetScore ? budgetScore.score : 0;

    return {
        overall,
        recommendation,
        summary,
        rows,
        strengths: strengths.length ? strengths : ["No dominant strengths detected; review resume quality."],
        gaps: gaps.length ? gaps : ["No major gaps identified from keyword analysis."],
        suitableRoles,
        leadershipScore: leadershipScore ? leadershipScore.score : 0,
        strategicScore: strategicGap,
        budgetScore: budgetGap
    };
}

function getMatchBandClass(score) {
    if (score >= 70) return "ai-score-high";
    if (score >= 40) return "ai-score-mid";
    return "ai-score-low";
}

function setKeywordList(listId, items, fallbackText) {
    const target = document.getElementById(listId);
    if (!target) return;

    target.innerHTML = "";

    const values = Array.isArray(items) ? items.slice(0, 12) : [];
    if (!values.length) {
        const li = document.createElement("li");
        li.textContent = fallbackText;
        target.appendChild(li);
        return;
    }

    values.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        target.appendChild(li);
    });
}

function renderAiBreakdownRows(rows) {
    const tbody = document.getElementById("aiRequirementBreakdownBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    (Array.isArray(rows) ? rows : []).forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" + (row.label || "") + "</td>" +
            "<td>" + (row.status || "") + "</td>" +
            "<td>" + (row.comment || "") + "</td>";
        tbody.appendChild(tr);
    });
}

function openAiMatchModal(payload) {
    const modal = document.getElementById("aiMatchModal");
    if (!modal || !payload) return;

    lastAiMatchResult = {
        candidateName: payload.candidateName || "Candidate",
        requirementName: payload.requirementName || "Requirement",
        score: Number(payload.score || 0),
        coverage: Number(payload.coverage || 0),
        expNote: payload.expNote || "Not enough data",
        matchedKeywords: Array.isArray(payload.matchedKeywords) ? payload.matchedKeywords.slice(0, 30) : [],
        missingKeywords: Array.isArray(payload.missingKeywords) ? payload.missingKeywords.slice(0, 30) : [],
        breakdownRows: Array.isArray(payload.breakdownRows) ? payload.breakdownRows : [],
        strengths: Array.isArray(payload.strengths) ? payload.strengths : [],
        gaps: Array.isArray(payload.gaps) ? payload.gaps : [],
        suitableRoles: Array.isArray(payload.suitableRoles) ? payload.suitableRoles : [],
        recommendation: payload.recommendation || "Conditional / Average Fit",
        summary: payload.summary || "",
        resumeChars: Number(payload.resumeChars || 0),
        jdTermsCount: Number(payload.jdTermsCount || 0),
        resumeTermsCount: Number(payload.resumeTermsCount || 0),
        matchedTermsCount: Number(payload.matchedTermsCount || 0),
        generatedAt: new Date().toLocaleString()
    };

    lastAiNarrativeText = "";

    const score = Number(payload.score || 0);
    const scorePill = document.getElementById("aiMatchScorePill");

    const candidateName = document.getElementById("aiMatchCandidateName");
    if (candidateName) {
        candidateName.textContent = payload.candidateName || "Candidate";
    }

    const requirementName = document.getElementById("aiMatchRequirementName");
    if (requirementName) {
        requirementName.textContent = payload.requirementName || "Requirement";
    }

    const matchPercentage = document.getElementById("aiMatchPercentage");
    if (matchPercentage) {
        matchPercentage.textContent = score + "%";
    }

    const coveragePercentage = document.getElementById("aiCoveragePercentage");
    if (coveragePercentage) {
        coveragePercentage.textContent = Number(payload.coverage || 0) + "%";
    }

    const experienceNote = document.getElementById("aiExperienceNote");
    if (experienceNote) {
        experienceNote.textContent = payload.expNote || "Not enough data";
    }

    if (scorePill) {
        scorePill.textContent = score + "%";
        scorePill.classList.remove("ai-score-high", "ai-score-mid", "ai-score-low");
        scorePill.classList.add(getMatchBandClass(score));
    }

    setKeywordList("aiMatchedList", payload.matchedKeywords, "No major keyword overlap detected.");
    setKeywordList("aiMissingList", payload.missingKeywords, "No obvious keyword gaps.");
    renderAiBreakdownRows(payload.breakdownRows);
    setKeywordList("aiStrengthsList", payload.strengths, "No clear strengths detected from extracted text.");
    setKeywordList("aiGapsList", payload.gaps, "No major gaps identified from extracted text.");
    setKeywordList("aiSuitableRolesList", payload.suitableRoles, "Suitable role inference unavailable.");

    const recommendation = document.getElementById("aiRecommendationText");
    if (recommendation) {
        const summaryText = payload.summary ? payload.summary + " " : "";
        recommendation.textContent = summaryText + "Recommendation: " + (payload.recommendation || "Conditional / Average Fit");
    }

    const debugResumeChars = document.getElementById("aiDebugResumeChars");
    if (debugResumeChars) {
        debugResumeChars.textContent = String(Number(payload.resumeChars || 0));
    }

    const debugJdTerms = document.getElementById("aiDebugJdTerms");
    if (debugJdTerms) {
        debugJdTerms.textContent = String(Number(payload.jdTermsCount || 0));
    }

    const debugResumeTerms = document.getElementById("aiDebugResumeTerms");
    if (debugResumeTerms) {
        debugResumeTerms.textContent = String(Number(payload.resumeTermsCount || 0));
    }

    const debugMatchedTerms = document.getElementById("aiDebugMatchedTerms");
    if (debugMatchedTerms) {
        debugMatchedTerms.textContent = String(Number(payload.matchedTermsCount || 0));
    }

    const narrativeStatus = document.getElementById("aiNarrativeStatus");
    if (narrativeStatus) {
        narrativeStatus.textContent = "Click Generate AI Narrative to create a detailed recruiter-style summary.";
    }

    const narrativeContent = document.getElementById("aiNarrativeContent");
    if (narrativeContent) {
        narrativeContent.textContent = "Narrative not generated yet.";
    }

    const narrativeBtn = document.getElementById("generateNarrativeBtn");
    if (narrativeBtn) {
        narrativeBtn.disabled = false;
    }

    modal.classList.add("show");
}

function closeAiMatchModal() {
    const modal = document.getElementById("aiMatchModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
}

function getActiveRequirementsForClient(clientName) {
    const clientKey = normalizeText(clientName);
    return (Array.isArray(requirements) ? requirements : []).filter(req => {
        const status = normalizeText(req.status);
        const isActive = status === "open" || status === "in progress" || status === "on hold";
        return normalizeText(req.client) === clientKey && isActive;
    });
}

function closeRequirementMappingModal() {
    const modal = document.getElementById("requirementMappingModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

function populateRequirementMappingSelect(options, selectedRequirementId) {
    const select = document.getElementById("mappingRequirementSelect");
    if (!select) return;

    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Requirement";
    select.appendChild(placeholder);

    options.forEach(req => {
        const option = document.createElement("option");
        option.value = req.requirementId || "";
        option.textContent = (req.requirementId || "") + " - " + (req.positionTitle || "") + " (" + (req.status || "") + ")";
        select.appendChild(option);
    });

    if (selectedRequirementId) {
        select.value = selectedRequirementId;
    }
}

function openRequirementMappingModal(index) {
    const candidate = (Array.isArray(candidates) ? candidates : [])[index];
    if (!candidate) {
        alert("Candidate record not found.");
        return;
    }

    const options = getActiveRequirementsForClient(candidate.client);
    if (!options.length) {
        alert("No active requirements found for this candidate's client.");
        return;
    }

    currentMappingCandidateIndex = index;

    const candidateLabel = document.getElementById("mappingCandidateLabel");
    if (candidateLabel) {
        candidateLabel.textContent = (candidate.candidateName || "-") + " (" + (candidate.candidateId || "") + ")";
    }

    const clientLabel = document.getElementById("mappingClientLabel");
    if (clientLabel) {
        clientLabel.textContent = candidate.client || "-";
    }

    populateRequirementMappingSelect(options, candidate.role || candidate.mappedRequirementId || "");

    const modal = document.getElementById("requirementMappingModal");
    if (modal) {
        modal.classList.add("show");
    }
}

function saveRequirementMappingFromModal() {
    if (currentMappingCandidateIndex < 0) {
        alert("No candidate selected for mapping.");
        return;
    }

    const candidate = candidates[currentMappingCandidateIndex];
    if (!candidate) {
        alert("Candidate record not found.");
        return;
    }

    const select = document.getElementById("mappingRequirementSelect");
    const selectedRequirementId = select ? select.value : "";
    if (!selectedRequirementId) {
        alert("Please select a requirement.");
        return;
    }

    const allRequirements = Array.isArray(requirements) ? requirements : [];
    const requirement = allRequirements.find(req => normalizeText(req.requirementId) === normalizeText(selectedRequirementId));
    if (!requirement) {
        alert("Selected requirement was not found.");
        return;
    }

    persistCandidateRequirementMapping(currentMappingCandidateIndex, candidate, requirement);
    closeRequirementMappingModal();
    showNotification("Requirement mapped: " + (requirement.requirementId || "") + " for " + (candidate.candidateName || "candidate"));

    const mappedIndex = currentMappingCandidateIndex;
    const shouldResumeAiCompare = pendingAiCompareIndex === mappedIndex;
    currentMappingCandidateIndex = -1;

    if (shouldResumeAiCompare) {
        pendingAiCompareIndex = -1;
        compareCandidateWithRequirement(mappedIndex);
    }
}

function persistCandidateRequirementMapping(index, candidate, requirement) {
    if (!candidate || !requirement) return;

    candidate.role = requirement.requirementId;
    candidate.mappedRequirementId = requirement.requirementId;
    candidate.mappedRequirementName = requirement.positionTitle || "";

    if (index >= 0 && index < candidates.length) {
        candidates[index] = candidate;
    }

    saveCandidates();
    renderTable();
}

function resolveRequirementForCandidate(index, candidate) {
    const allRequirements = Array.isArray(requirements) ? requirements : [];

    const directId = normalizeText(candidate.role || candidate.mappedRequirementId);
    if (directId) {
        const direct = allRequirements.find(req => normalizeText(req.requirementId) === directId);
        if (direct) {
            if (normalizeText(candidate.role) !== normalizeText(direct.requirementId)) {
                persistCandidateRequirementMapping(index, candidate, direct);
            }
            return direct;
        }
    }

    const roleText = normalizeText(candidate.role);
    const clientRequirements = getActiveRequirementsForClient(candidate.client);

    if (roleText && clientRequirements.length) {
        const titleMatched = clientRequirements.filter(req => normalizeText(req.positionTitle) === roleText);
        if (titleMatched.length === 1) {
            persistCandidateRequirementMapping(index, candidate, titleMatched[0]);
            return titleMatched[0];
        }
    }

    if (clientRequirements.length === 1) {
        persistCandidateRequirementMapping(index, candidate, clientRequirements[0]);
        showNotification("Auto-mapped requirement " + (clientRequirements[0].requirementId || "") + " for " + (candidate.candidateName || "candidate"));
        return clientRequirements[0];
    }

    if (clientRequirements.length > 1) {
        pendingAiCompareIndex = index;
        openRequirementMappingModal(index);
        return null;
    }

    if (roleText) {
        const globalTitleMatched = allRequirements.filter(req => normalizeText(req.positionTitle) === roleText);
        if (globalTitleMatched.length === 1) {
            persistCandidateRequirementMapping(index, candidate, globalTitleMatched[0]);
            return globalTitleMatched[0];
        }
    }

    return null;
}

function sanitizeReportFilePart(value) {
    return String(value || "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "report";
}

function getAiReportFilenameBase() {
    if (!lastAiMatchResult) return "ai-match-report";

    const candidate = sanitizeReportFilePart(lastAiMatchResult.candidateName);
    const requirement = sanitizeReportFilePart(lastAiMatchResult.requirementName);
    const date = new Date().toISOString().slice(0, 10);
    return "ai-match-" + candidate + "-" + requirement + "-" + date;
}

function buildAiMatchReportText() {
    if (!lastAiMatchResult) return "";

    const matched = lastAiMatchResult.matchedKeywords.length
        ? lastAiMatchResult.matchedKeywords.join(", ")
        : "No major keyword overlap detected.";

    const missing = lastAiMatchResult.missingKeywords.length
        ? lastAiMatchResult.missingKeywords.join(", ")
        : "No obvious keyword gaps.";

    const breakdownLines = (lastAiMatchResult.breakdownRows || []).map(row => {
        return "- " + (row.label || "") + ": " + (row.status || "") + " | " + (row.comment || "");
    });

    const strengthsLines = (lastAiMatchResult.strengths || []).map(item => "- " + item);
    const gapsLines = (lastAiMatchResult.gaps || []).map(item => "- " + item);
    const roleLines = (lastAiMatchResult.suitableRoles || []).map(item => "- " + item);

    return [
        "AI Resume Match Report",
        "Generated At: " + lastAiMatchResult.generatedAt,
        "Candidate: " + lastAiMatchResult.candidateName,
        "Requirement: " + lastAiMatchResult.requirementName,
        "Match Percentage: " + lastAiMatchResult.score + "%",
        "JD Coverage: " + lastAiMatchResult.coverage + "%",
        "Experience Check: " + lastAiMatchResult.expNote,
        "Summary: " + (lastAiMatchResult.summary || ""),
        "Recommendation: " + (lastAiMatchResult.recommendation || "Conditional / Average Fit"),
        "Resume Text Characters: " + lastAiMatchResult.resumeChars,
        "JD Terms: " + lastAiMatchResult.jdTermsCount,
        "Resume Terms: " + lastAiMatchResult.resumeTermsCount,
        "Matched Terms: " + lastAiMatchResult.matchedTermsCount,
        "",
        "Detailed JD Requirement Fit:",
        breakdownLines.length ? breakdownLines.join("\n") : "No detailed breakdown available.",
        "",
        "Key Strengths:",
        strengthsLines.length ? strengthsLines.join("\n") : "No major strengths identified.",
        "",
        "Major Gaps:",
        gapsLines.length ? gapsLines.join("\n") : "No major gaps identified.",
        "",
        "Suitable Designations:",
        roleLines.length ? roleLines.join("\n") : "No role suggestion available.",
        "",
        "Matching Areas:",
        matched,
        "",
        "Potential Gaps:",
        missing,
        "",
        "AI Narrative:",
        lastAiNarrativeText || "Narrative not generated."
    ].join("\n");
}

function getStoredAiNarrativeConfig() {
    return {
        apiKey: String(localStorage.getItem(AI_NARRATIVE_KEY_STORAGE) || "").trim(),
        apiBase: String(localStorage.getItem(AI_NARRATIVE_BASE_STORAGE) || AI_DEFAULT_BASE).trim() || AI_DEFAULT_BASE,
        model: String(localStorage.getItem(AI_NARRATIVE_MODEL_STORAGE) || AI_DEFAULT_MODEL).trim() || AI_DEFAULT_MODEL
    };
}

function hasValidAiNarrativeConfig(config) {
    if (!config) return false;
    return Boolean(String(config.apiKey || "").trim() && String(config.apiBase || "").trim() && String(config.model || "").trim());
}

function setAiSettingsStatus(message, isError) {
    const el = document.getElementById("aiSettingsStatus");
    if (!el) return;
    el.textContent = message || "";
    el.style.color = isError ? "#b02a37" : "#35516b";
}

function parseJsonSafe(text) {
    try {
        return JSON.parse(String(text || ""));
    } catch (_error) {
        return null;
    }
}

function mapAiApiError(status, payloadText) {
    const parsed = parseJsonSafe(payloadText);
    const errorObj = parsed && parsed.error ? parsed.error : null;
    const rawCode = String(errorObj && errorObj.code ? errorObj.code : "").toLowerCase();
    const rawType = String(errorObj && errorObj.type ? errorObj.type : "").toLowerCase();
    const rawMessage = String(errorObj && errorObj.message ? errorObj.message : payloadText || "").toLowerCase();

    const isQuota = rawCode.includes("insufficient_quota") || rawType.includes("insufficient_quota") || rawMessage.includes("insufficient_quota") || rawMessage.includes("quota") || rawMessage.includes("billing") || rawMessage.includes("rate limit");

    if (status === 402 || isQuota) {
        return "AI quota exhausted or billing required. Please recharge credits or enable billing in your AI provider account.";
    }

    if (status === 401) {
        return "AI authentication failed. Please verify API key in AI Settings.";
    }

    if (status === 403) {
        return "AI request forbidden. API key may not have access to this model or endpoint.";
    }

    if (status === 404) {
        return "AI endpoint/model not found. Please verify endpoint and model in AI Settings.";
    }

    if (status === 429) {
        return "AI rate limit reached or quota exhausted. Please retry later or upgrade billing limits.";
    }

    if (status >= 500) {
        return "AI provider service is temporarily unavailable. Please try again shortly.";
    }

    const providerMessage = errorObj && errorObj.message ? String(errorObj.message).trim() : "";
    if (providerMessage) {
        return "AI request failed: " + providerMessage;
    }

    return "AI request failed (HTTP " + status + "). Please check AI Settings and provider account status.";
}

function openAiSettingsModal() {
    const config = getStoredAiNarrativeConfig();

    const apiBase = document.getElementById("aiSettingsApiBase");
    if (apiBase) {
        apiBase.value = config.apiBase || AI_DEFAULT_BASE;
    }

    const model = document.getElementById("aiSettingsModel");
    if (model) {
        model.value = config.model || AI_DEFAULT_MODEL;
    }

    const apiKey = document.getElementById("aiSettingsApiKey");
    if (apiKey) {
        apiKey.value = config.apiKey || "";
    }

    setAiSettingsStatus(hasValidAiNarrativeConfig(config) ? "Saved settings loaded." : "Enter settings and click Save.", false);

    const modal = document.getElementById("aiSettingsModal");
    if (modal) {
        modal.classList.add("show");
    }
}

function closeAiSettingsModal() {
    const modal = document.getElementById("aiSettingsModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

function collectAiSettingsFromModal() {
    const apiBase = document.getElementById("aiSettingsApiBase");
    const model = document.getElementById("aiSettingsModel");
    const apiKey = document.getElementById("aiSettingsApiKey");

    return {
        apiBase: String(apiBase ? apiBase.value : "").trim() || AI_DEFAULT_BASE,
        model: String(model ? model.value : "").trim() || AI_DEFAULT_MODEL,
        apiKey: String(apiKey ? apiKey.value : "").trim()
    };
}

function saveAiNarrativeSettings() {
    const config = collectAiSettingsFromModal();

    if (!config.apiKey) {
        setAiSettingsStatus("API key is required.", true);
        return;
    }

    localStorage.setItem(AI_NARRATIVE_BASE_STORAGE, config.apiBase);
    localStorage.setItem(AI_NARRATIVE_MODEL_STORAGE, config.model);
    localStorage.setItem(AI_NARRATIVE_KEY_STORAGE, config.apiKey);

    setAiSettingsStatus("Settings saved successfully.", false);
    showNotification("AI settings saved.");
}

function resetAiNarrativeSettings() {
    if (!confirm("Reset saved AI narrative settings?")) {
        return;
    }

    localStorage.removeItem(AI_NARRATIVE_BASE_STORAGE);
    localStorage.removeItem(AI_NARRATIVE_MODEL_STORAGE);
    localStorage.removeItem(AI_NARRATIVE_KEY_STORAGE);

    const apiBase = document.getElementById("aiSettingsApiBase");
    if (apiBase) {
        apiBase.value = AI_DEFAULT_BASE;
    }

    const model = document.getElementById("aiSettingsModel");
    if (model) {
        model.value = AI_DEFAULT_MODEL;
    }

    const apiKey = document.getElementById("aiSettingsApiKey");
    if (apiKey) {
        apiKey.value = "";
    }

    setAiSettingsStatus("Settings reset. Add values and save again.", false);
    showNotification("AI settings reset.");
}

async function testAiNarrativeSettings() {
    const config = collectAiSettingsFromModal();

    if (!config.apiKey) {
        setAiSettingsStatus("API key is required for test.", true);
        return;
    }

    setAiSettingsStatus("Testing connection...", false);

    try {
        const response = await fetch(config.apiBase, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + config.apiKey
            },
            body: JSON.stringify({
                model: config.model,
                temperature: 0,
                max_tokens: 20,
                messages: [
                    {
                        role: "user",
                        content: "Reply with: connection-ok"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(mapAiApiError(response.status, errText));
        }

        setAiSettingsStatus("Connection successful. You can save settings.", false);
    } catch (error) {
        const message = (error && error.message) ? error.message : "Connection test failed.";
        setAiSettingsStatus(message, true);
    }
}

function setNarrativeUiState(statusText, contentText, isLoading) {
    const statusEl = document.getElementById("aiNarrativeStatus");
    if (statusEl && statusText !== undefined) {
        statusEl.textContent = statusText;
    }

    const contentEl = document.getElementById("aiNarrativeContent");
    if (contentEl && contentText !== undefined) {
        contentEl.textContent = contentText;
    }

    const btn = document.getElementById("generateNarrativeBtn");
    if (btn) {
        btn.disabled = Boolean(isLoading);
        btn.textContent = isLoading ? "Generating..." : "Generate AI Narrative";
    }
}

function buildNarrativePrompt(data) {
    const rows = (data.breakdownRows || []).map(row => {
        return "- " + row.label + ": " + row.status + " | " + row.comment;
    }).join("\n");

    return [
        "Generate a recruiter-quality narrative assessment.",
        "Tone: professional, concise, evidence-driven.",
        "Output sections:",
        "1) Overall fit summary (3-5 lines)",
        "2) Why match score is this value",
        "3) Key strengths (bullets)",
        "4) Major gaps (bullets)",
        "5) Suitable designations",
        "6) Final hiring recommendation",
        "",
        "Candidate: " + (data.candidateName || ""),
        "Requirement: " + (data.requirementName || ""),
        "Match %: " + (data.score || 0),
        "JD Coverage %: " + (data.coverage || 0),
        "Experience Check: " + (data.expNote || ""),
        "Summary: " + (data.summary || ""),
        "Recommendation: " + (data.recommendation || ""),
        "Detailed breakdown:",
        rows,
        "",
        "Strengths (detected): " + (data.strengths || []).join(", "),
        "Gaps (detected): " + (data.gaps || []).join(", "),
        "Suitable roles (detected): " + (data.suitableRoles || []).join(", "),
        "",
        "Keep the response under 350 words."
    ].join("\n");
}

async function generateAiNarrative() {
    if (!lastAiMatchResult) {
        alert("Please run AI match first.");
        return;
    }

    const config = getStoredAiNarrativeConfig();
    if (!hasValidAiNarrativeConfig(config)) {
        setNarrativeUiState("AI settings required before narrative generation.", "Open AI Settings and save API details.", false);
        openAiSettingsModal();
        return;
    }

    const promptText = buildNarrativePrompt(lastAiMatchResult);

    setNarrativeUiState("Request sent to AI model. Generating narrative...", "Generating narrative...", true);

    try {
        const response = await fetch(config.apiBase, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + config.apiKey
            },
            body: JSON.stringify({
                model: config.model,
                temperature: 0.35,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert recruitment analyst. Produce accurate, balanced hiring narratives."
                    },
                    {
                        role: "user",
                        content: promptText
                    }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(mapAiApiError(response.status, errText));
        }

        const payload = await response.json();
        const narrative = (((payload || {}).choices || [])[0] || {}).message
            ? (((payload || {}).choices || [])[0].message.content || "")
            : "";

        if (!narrative.trim()) {
            throw new Error("Model response was empty.");
        }

        lastAiNarrativeText = narrative.trim();
        setNarrativeUiState("Narrative generated successfully.", lastAiNarrativeText, false);
        showNotification("AI narrative generated.");
    } catch (error) {
        const message = error && error.message ? error.message : "Unable to generate narrative.";
        setNarrativeUiState("Narrative generation failed.", message, false);
        alert(message);
    }
}

function downloadTextFile(fileName, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadAiMatchReportTxt() {
    if (!lastAiMatchResult) {
        alert("Please run AI match first.");
        return;
    }

    const content = buildAiMatchReportText();
    downloadTextFile(getAiReportFilenameBase() + ".txt", content);
}

function downloadAiMatchReportPdf() {
    if (!lastAiMatchResult) {
        alert("Please run AI match first.");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("PDF library failed to load. Please refresh and try again.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxLineWidth = pageWidth - (margin * 2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("AI Resume Match Report", margin, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const content = buildAiMatchReportText();
    const lines = doc.splitTextToSize(content, maxLineWidth);
    doc.text(lines, margin, 78);

    doc.save(getAiReportFilenameBase() + ".pdf");
}

async function compareCandidateWithRequirement(index) {
    const candidate = (Array.isArray(candidates) ? candidates : [])[index];
    if (!candidate) {
        alert("Candidate record not found.");
        return;
    }

    const requirement = resolveRequirementForCandidate(index, candidate);
    if (!requirement) {
        if (pendingAiCompareIndex === index) {
            showNotification("Select requirement mapping to continue AI match.");
            return;
        }

        alert("No mapped requirement found. Please ensure Client is selected and active requirements exist for that client.");
        return;
    }

    const jobDescription = String(requirement.jobDescription || "").trim();
    if (!jobDescription) {
        alert("Job Description is empty for requirement " + (requirement.requirementId || "") + ". Please add it first.");
        return;
    }

    const recoveredResumeText = await ensureCandidateResumeText(index, candidate);
    if (recoveredResumeText && !candidate.resumeText) {
        candidate.resumeText = recoveredResumeText;
    }

    const resumeText = buildCandidateComparableText(candidate);
    if (!resumeText) {
        alert("No resume/profile content found to compare. Please upload and save resume in TXT, searchable PDF, or DOCX format.");
        return;
    }

    const analysis = scoreResumeAgainstJobDescription(resumeText, jobDescription);
    const detailed = buildDetailedAssessment(candidate, requirement, jobDescription, resumeText);

    const reqExp = getExperienceNumber(requirement.experience);
    const candExp = getExperienceNumber(candidate.experience);
    let expNote = "Not enough data";
    if (reqExp !== null && candExp !== null) {
        expNote = candExp >= reqExp
            ? "Matches (" + candExp + "y vs required " + reqExp + "y)"
            : "Gap (" + candExp + "y vs required " + reqExp + "y)";
    }

    openAiMatchModal({
        candidateName: candidate.candidateName || "Candidate",
        requirementName: requirement.positionTitle || "Requirement",
        score: detailed.overall,
        coverage: analysis.coverage,
        expNote,
        summary: detailed.summary,
        recommendation: detailed.recommendation,
        breakdownRows: detailed.rows,
        strengths: detailed.strengths,
        gaps: detailed.gaps,
        suitableRoles: detailed.suitableRoles,
        resumeChars: resumeText.length,
        jdTermsCount: analysis.jdTermsCount,
        resumeTermsCount: analysis.resumeTermsCount,
        matchedTermsCount: analysis.matchedTermsCount,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords
    });

    showNotification("AI match ready: " + detailed.overall + "% for " + (candidate.candidateName || "candidate"));
}
