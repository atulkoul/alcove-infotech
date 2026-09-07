// Excel export utility — generates a simple .xls file from candidate data

export function exportCandidatesExcel(candidates, corsHeaders) {
  const headers = ["Name", "Email", "Phone", "Position", "Client", "Status", "Created At"];

  const rows = candidates.map((c) => [
    c.name || "",
    c.email || "",
    c.phone || "",
    c.position || "",
    c.client_name || "",
    c.status || "",
    c.created_at || "",
  ]);

  const tableRows = [headers, ...rows]
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeXml(cell)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<?xml version="1.0"?>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Candidates</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table border="1">${tableRows}</table></body></html>`;

  const responseHeaders = new Headers(corsHeaders);
  responseHeaders.set("Content-Type", "application/vnd.ms-excel");
  responseHeaders.set("Content-Disposition", 'attachment; filename="candidates.xls"');

  return new Response(html, { headers: responseHeaders });
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
