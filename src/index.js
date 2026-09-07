import { exportCandidatesExcel } from "./excel.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- Apex redirect: alcoveinfotech.com → www.alcoveinfotech.com ---
    if (url.hostname === "alcoveinfotech.com") {
      const dest = `https://www.alcoveinfotech.com${url.pathname}${url.search}`;
      return Response.redirect(dest, 301);
    }

    // --- Tracker API routes ---
    if (url.pathname.startsWith("/tracker/api/")) {
      return handleTrackerApi(request, env);
    }

    // --- Tracker UI (serve the tracker page) ---
    if (url.pathname === "/tracker" || url.pathname.startsWith("/tracker/")) {
      return env.ASSETS.fetch(request);
    }

    // --- Main website: map the public root to public/main-website ---
    if (url.pathname === "/" || url.pathname === "") {
      const mainWebsiteUrl = new URL(request.url);
      mainWebsiteUrl.pathname = "/main-website/index.html";
      return env.ASSETS.fetch(new Request(mainWebsiteUrl, request));
    }

    // --- Main website assets ---
    if (url.pathname.startsWith("/main-website/")) {
      return env.ASSETS.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};

// ============================================================
// Tracker API handler
// ============================================================
async function handleTrackerApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/tracker/api", "");
  const method = request.method;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Clients ----
    if (path === "/clients" && method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM clients ORDER BY created_at DESC").all();
      return jsonResponse(result.results, corsHeaders);
    }

    if (path === "/clients" && method === "POST") {
      const body = await request.json();
      const { name, company, email, phone, notes } = body;
      await env.DB.prepare(
        "INSERT INTO clients (name, company, email, phone, notes) VALUES (?, ?, ?, ?, ?)"
      ).bind(name, company || null, email || null, phone || null, notes || null).run();
      const inserted = await env.DB.prepare("SELECT * FROM clients WHERE id = last_insert_rowid()").first();
      return jsonResponse(inserted, corsHeaders, 201);
    }

    if (path.startsWith("/clients/") && method === "PUT") {
      const id = path.split("/")[2];
      const body = await request.json();
      const { name, company, email, phone, notes } = body;
      await env.DB.prepare(
        "UPDATE clients SET name = ?, company = ?, email = ?, phone = ?, notes = ? WHERE id = ?"
      ).bind(name, company || null, email || null, phone || null, notes || null, id).run();
      const updated = await env.DB.prepare("SELECT * FROM clients WHERE id = ?").first(id);
      return jsonResponse(updated, corsHeaders);
    }

    if (path.startsWith("/clients/") && method === "DELETE") {
      const id = path.split("/")[2];
      await env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
      return jsonResponse({ success: true }, corsHeaders);
    }

    // ---- Candidates ----
    if (path === "/candidates" && method === "GET") {
      const result = await env.DB.prepare(`
        SELECT c.*, cl.name as client_name
        FROM candidates c
        LEFT JOIN clients cl ON c.client_id = cl.id
        ORDER BY c.created_at DESC
      `).all();
      return jsonResponse(result.results, corsHeaders);
    }

    if (path === "/candidates" && method === "POST") {
      const formData = await request.formData();
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const position = formData.get("position");
      const clientId = formData.get("client_id");
      const notes = formData.get("notes");
      const resume = formData.get("resume");

      let resumeKey = null;

      if (resume && resume.size > 0) {
        resumeKey = `resumes/${Date.now()}-${resume.name}`;
        await env.RESUMES.put(resumeKey, resume.stream(), {
          customMetadata: { candidateName: name, uploadedAt: new Date().toISOString() },
        });
      }

      await env.DB.prepare(
        "INSERT INTO candidates (name, email, phone, position, client_id, status, resume_key, notes) VALUES (?, ?, ?, ?, ?, 'new', ?, ?)"
      ).bind(name, email || null, phone || null, position || null, clientId || null, resumeKey, notes || null).run();

      const candidateId = (await env.DB.prepare("SELECT last_insert_rowid() as id").first()).id;

      await env.DB.prepare(
        "INSERT INTO candidate_history (candidate_id, status, note) VALUES (?, 'new', 'Candidate added')"
      ).bind(candidateId).run();

      const inserted = await env.DB.prepare("SELECT * FROM candidates WHERE id = ?").first(candidateId);
      return jsonResponse(inserted, corsHeaders, 201);
    }

    if (path.startsWith("/candidates/") && method === "PUT") {
      const id = path.split("/")[2];
      const body = await request.json();
      const { name, email, phone, position, client_id, status, notes } = body;

      const existing = await env.DB.prepare("SELECT status FROM candidates WHERE id = ?").first(id);

      await env.DB.prepare(
        "UPDATE candidates SET name = ?, email = ?, phone = ?, position = ?, client_id = ?, status = ?, notes = ? WHERE id = ?"
      ).bind(name, email || null, phone || null, position || null, client_id || null, status || existing.status, notes || null, id).run();

      if (status && status !== existing.status) {
        await env.DB.prepare(
          "INSERT INTO candidate_history (candidate_id, status, note) VALUES (?, ?, ?)"
        ).bind(id, status, `Status changed from ${existing.status} to ${status}`).run();
      }

      const updated = await env.DB.prepare("SELECT * FROM candidates WHERE id = ?").first(id);
      return jsonResponse(updated, corsHeaders);
    }

    if (path.startsWith("/candidates/") && method === "DELETE") {
      const id = path.split("/")[2];

      const candidate = await env.DB.prepare("SELECT resume_key FROM candidates WHERE id = ?").first(id);
      if (candidate?.resume_key) {
        await env.RESUMES.delete(candidate.resume_key);
      }

      await env.DB.prepare("DELETE FROM candidates WHERE id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM candidate_history WHERE candidate_id = ?").bind(id).run();
      return jsonResponse({ success: true }, corsHeaders);
    }

    // ---- Candidate history ----
    if (path.startsWith("/candidates/") && path.endsWith("/history") && method === "GET") {
      const id = path.split("/")[2];
      const result = await env.DB.prepare(
        "SELECT * FROM candidate_history WHERE candidate_id = ? ORDER BY changed_at DESC"
      ).bind(id).all();
      return jsonResponse(result.results, corsHeaders);
    }

    // ---- Download resume from R2 ----
    if (path.startsWith("/candidates/") && path.endsWith("/resume") && method === "GET") {
      const id = path.split("/")[2];
      const candidate = await env.DB.prepare("SELECT resume_key FROM candidates WHERE id = ?").first(id);
      if (!candidate?.resume_key) {
        return jsonResponse({ error: "No resume found" }, corsHeaders, 404);
      }
      const object = await env.RESUMES.get(candidate.resume_key);
      if (!object) {
        return jsonResponse({ error: "Resume file not found in storage" }, corsHeaders, 404);
      }
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${candidate.resume_key.split("/").pop()}"`);
      return new Response(object.body, { headers });
    }

    // ---- Export candidates to Excel ----
    if (path === "/export/excel" && method === "GET") {
      const result = await env.DB.prepare(`
        SELECT c.name, c.email, c.phone, c.position, cl.name as client_name, c.status, c.created_at
        FROM candidates c
        LEFT JOIN clients cl ON c.client_id = cl.id
        ORDER BY c.created_at DESC
      `).all();
      return exportCandidatesExcel(result.results, corsHeaders);
    }

    // ---- Dashboard stats ----
    if (path === "/stats" && method === "GET") {
      const totalCandidates = await env.DB.prepare("SELECT COUNT(*) as count FROM candidates").first();
      const totalClients = await env.DB.prepare("SELECT COUNT(*) as count FROM clients").first();
      const byStatus = await env.DB.prepare(
        "SELECT status, COUNT(*) as count FROM candidates GROUP BY status"
      ).all();
      return jsonResponse({
        totalCandidates: totalCandidates.count,
        totalClients: totalClients.count,
        byStatus: byStatus.results,
      }, corsHeaders);
    }

    return jsonResponse({ error: "Not found" }, corsHeaders, 404);
  } catch (err) {
    return jsonResponse({ error: err.message }, corsHeaders, 500);
  }
}

function jsonResponse(data, corsHeaders, status = 200) {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status, headers });
}
