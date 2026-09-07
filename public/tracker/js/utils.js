/* ==========================================
   Utility Functions
========================================== */

function generateCandidateId() {

    const lastId = localStorage.getItem("lastCandidateId");

    let nextNumber = 1;

    if (lastId) {
        nextNumber = parseInt(lastId) + 1;
    }

    localStorage.setItem("lastCandidateId", nextNumber);

    return "ALC" + String(nextNumber).padStart(5, "0");

}

const IST_TIME_ZONE = "Asia/Kolkata";
const IST_SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function padDateSegment(value) {
    return String(value).padStart(2, "0");
}

function getCurrentISTDateString() {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const year = parts.find(part => part.type === "year")?.value;
    const month = parts.find(part => part.type === "month")?.value;
    const day = parts.find(part => part.type === "day")?.value;

    return year && month && day
        ? year + "-" + month + "-" + day
        : new Date().toISOString().split("T")[0];
}

function parseDateInputParts(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return { year, month, day };
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
        year: parsed.getFullYear(),
        month: parsed.getMonth() + 1,
        day: parsed.getDate()
    };
}

function parseDateInputToUtcDate(value) {
    const parts = parseDateInputParts(value);
    if (!parts) return null;

    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

function formatDateInputValue(year, month, day) {
    return year + "-" + padDateSegment(month) + "-" + padDateSegment(day);
}

function shiftDateInputValue(value, days) {
    const baseDate = parseDateInputToUtcDate(value || getCurrentISTDateString());
    if (!baseDate) {
        return getCurrentISTDateString();
    }

    baseDate.setUTCDate(baseDate.getUTCDate() + days);

    return formatDateInputValue(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth() + 1,
        baseDate.getUTCDate()
    );
}

function formatDateDisplayIST(value, fallback = "") {
    const parts = parseDateInputParts(value);
    if (!parts) {
        return value || fallback;
    }

    return padDateSegment(parts.day) + "-" + IST_SHORT_MONTHS[parts.month - 1] + "-" + parts.year;
}

function isOfferReleasedStatus(status) {
    return status === "Offer Release" || status === "Offer Released";
}