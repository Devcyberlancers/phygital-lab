const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5000);
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "phygital_ctf.json");

const domains = [
  ["airport", "Airport"],
  ["water-treatment", "Water Treatment"],
  ["industry", "Industry"],
  ["hospital", "Hospital"],
  ["banking", "Banking"],
  ["power-grid", "Power Grid"],
  ["toll-plaza", "Toll Plaza"],
  ["data-center", "Data Center"],
  ["stock-market", "Stock Market"],
  ["metro", "Metro"],
  ["warehouse", "Warehouse"]
];

const domainIds = domains.map(([id]) => id);

const seedChallenges = Object.fromEntries(domains.map(([id, label]) => [id, [
  {
    id: `${id}_001`,
    category: id,
    title: `${label} Device Recon`,
    description: `Identify the exposed device or service in the ${label} model network and recover the banner flag from the training target.`,
    points: 100,
    flag: `FLAG{${id.replaceAll("-", "_")}_recon}`,
    hint: "Start with service discovery, then inspect the most unusual open port."
  },
  {
    id: `${id}_002`,
    category: id,
    title: `${label} Weak Credential Audit`,
    description: `A dashboard or controller account in the ${label} scenario uses weak credentials. Find the login path and submit the operator flag.`,
    points: 150,
    flag: `FLAG{${id.replaceAll("-", "_")}_weak_login}`,
    hint: "Check default, reused, or lab-demo credentials before trying anything advanced."
  },
  {
    id: `${id}_003`,
    category: id,
    title: `${label} Log Investigation`,
    description: `Analyze the incident logs for the ${label} model and identify the suspicious event sequence hidden in the alert timeline.`,
    points: 200,
    flag: `FLAG{${id.replaceAll("-", "_")}_log_trace}`,
    hint: "Sort events by time and compare failed access, command, and alarm entries."
  }
]]));

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon"
};

function nowIso() {
  return new Date().toISOString();
}

function emptyDb() {
  return {
    students: [],
    challenges: Object.values(seedChallenges).flat().map((item) => ({
      ...item,
      createdAt: nowIso(),
      updatedAt: nowIso()
    })),
    submissions: [],
    solves: [],
    hints: []
  };
}

function readDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const fresh = emptyDb();
    writeDb(fresh);
    return fresh;
  }
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  db.students ||= [];
  db.challenges ||= [];
  db.submissions ||= [];
  db.solves ||= [];
  db.hints ||= [];
  return db;
}

function writeDb(db) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function requireCategory(value) {
  return domainIds.includes(value) ? value : "";
}

function publicChallenge(ch, db, studentId) {
  const solve = db.solves.find((item) => item.studentId === studentId && item.challengeId === ch.id);
  const attempts = db.submissions.filter((item) => item.studentId === studentId && item.challengeId === ch.id).length;
  const hint = db.hints.find((item) => item.studentId === studentId && item.challengeId === ch.id);
  return {
    id: ch.id,
    category: ch.category,
    title: ch.title,
    description: ch.description,
    points: ch.points,
    hint: ch.hint || "",
    hasHint: Boolean(ch.hint),
    solved: Boolean(solve),
    awardedPoints: solve ? solve.awardedPoints : 0,
    attempts,
    hintCount: hint ? hint.hintCount : 0,
    currentAward: hint ? hint.currentAward : ch.points
  };
}

function adminChallenge(ch) {
  return {
    id: ch.id,
    category: ch.category,
    title: ch.title,
    description: ch.description,
    points: ch.points,
    flag: ch.flag,
    hint: ch.hint || ""
  };
}

function groupedChallenges(db, includeFlag = false) {
  const grouped = Object.fromEntries(domainIds.map((id) => [id, []]));
  db.challenges
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id))
    .forEach((ch) => {
      if (!grouped[ch.category]) grouped[ch.category] = [];
      grouped[ch.category].push(includeFlag ? adminChallenge(ch) : ch);
    });
  return grouped;
}

function leaderboard(db, category, studentId) {
  const rows = db.students.map((student) => {
    const solves = db.solves.filter((solve) => {
      const challenge = db.challenges.find((ch) => ch.id === solve.challengeId);
      return solve.studentId === student.id && challenge && challenge.category === category;
    });
    return {
      studentId: student.id,
      name: student.name,
      score: solves.reduce((sum, solve) => sum + solve.awardedPoints, 0),
      solvedCount: solves.length,
      lastSolvedAt: solves.reduce((latest, solve) => latest > solve.solvedAt ? latest : solve.solvedAt, "")
    };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const entries = rows.map((row, index) => ({ rank: index + 1, ...row }));
  return {
    ok: true,
    top: entries.filter((row) => row.solvedCount > 0).slice(0, 3),
    current: entries.find((row) => row.studentId === studentId) || null
  };
}

async function handleApi(req, res, url) {
  const db = readDb();

  if (req.method === "GET" && url.pathname === "/api/domains") {
    return sendJson(res, 200, { ok: true, domains: domains.map(([id, title]) => ({ id, title })) });
  }

  if (req.method === "POST" && url.pathname === "/api/students") {
    const payload = await readBody(req);
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    if (!name || !email.includes("@")) return sendJson(res, 400, { ok: false, msg: "Name and a valid email are required." });
    let student = db.students.find((item) => item.email === email);
    if (student) {
      student.name = name;
      student.updatedAt = nowIso();
    } else {
      student = { id: Date.now(), name, email, createdAt: nowIso(), updatedAt: nowIso() };
      db.students.push(student);
    }
    writeDb(db);
    return sendJson(res, 200, { ok: true, student });
  }

  if (req.method === "GET" && url.pathname === "/api/challenges") {
    const category = requireCategory(url.searchParams.get("category"));
    const studentId = Number(url.searchParams.get("studentId") || 0);
    if (!category) return sendJson(res, 400, { ok: false, msg: "Invalid category." });
    const challenges = db.challenges
      .filter((ch) => ch.category === category)
      .map((ch) => publicChallenge(ch, db, studentId));
    return sendJson(res, 200, { ok: true, challenges });
  }

  if (req.method === "POST" && url.pathname === "/api/hints") {
    const payload = await readBody(req);
    const studentId = Number(payload.studentId || 0);
    const challengeId = String(payload.challengeId || "");
    const ch = db.challenges.find((item) => item.id === challengeId);
    if (!studentId || !ch) return sendJson(res, 404, { ok: false, msg: "Challenge not found." });
    let hint = db.hints.find((item) => item.studentId === studentId && item.challengeId === challengeId);
    if (!hint) {
      hint = { studentId, challengeId, hintCount: 0, currentAward: ch.points, updatedAt: nowIso() };
      db.hints.push(hint);
    }
    const solved = db.solves.some((item) => item.studentId === studentId && item.challengeId === challengeId);
    if (!solved) {
      hint.hintCount += 1;
      hint.currentAward = Math.max(1, Math.floor(hint.currentAward / 2));
      hint.updatedAt = nowIso();
    }
    writeDb(db);
    return sendJson(res, 200, { ok: true, hint: ch.hint || "", hintCount: hint.hintCount, currentAward: hint.currentAward });
  }

  if (req.method === "POST" && url.pathname === "/api/submissions") {
    const payload = await readBody(req);
    const studentId = Number(payload.studentId || 0);
    const challengeId = String(payload.challengeId || "");
    const answer = String(payload.answer || "").trim();
    const ch = db.challenges.find((item) => item.id === challengeId);
    if (!studentId || !ch || !answer) return sendJson(res, 400, { ok: false, msg: "Student, challenge, and answer are required." });
    if (db.solves.some((item) => item.studentId === studentId && item.challengeId === challengeId)) {
      return sendJson(res, 200, { ok: true, already: true, msg: "Already solved!" });
    }
    const correct = answer === ch.flag;
    let awarded = 0;
    if (correct) {
      const hint = db.hints.find((item) => item.studentId === studentId && item.challengeId === challengeId);
      awarded = hint ? hint.currentAward : ch.points;
      db.solves.push({ studentId, challengeId, awardedPoints: awarded, solvedAt: nowIso() });
    }
    db.submissions.push({ id: Date.now(), studentId, challengeId, answer, correct, awardedPoints: awarded, createdAt: nowIso() });
    writeDb(db);
    const attempts = db.submissions.filter((item) => item.studentId === studentId && item.challengeId === challengeId).length;
    return sendJson(res, 200, correct
      ? { ok: true, correct: true, points: awarded, msg: `Correct! +${awarded} pts` }
      : { ok: false, correct: false, attempts, msg: `Wrong flag. Attempt #${attempts}` });
  }

  if (req.method === "GET" && url.pathname === "/api/leaderboard") {
    const category = requireCategory(url.searchParams.get("category"));
    const studentId = Number(url.searchParams.get("studentId") || 0);
    if (!category) return sendJson(res, 400, { ok: false, msg: "Invalid category." });
    return sendJson(res, 200, leaderboard(db, category, studentId));
  }

  if (req.method === "GET" && url.pathname === "/api/admin/challenges") {
    return sendJson(res, 200, { ok: true, domains: domains.map(([id, title]) => ({ id, title })), questions: groupedChallenges(db, true) });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/challenges") {
    const payload = await readBody(req);
    const category = requireCategory(payload.category);
    const title = String(payload.title || "").trim();
    const description = String(payload.description || "").trim();
    const flag = String(payload.flag || "").trim();
    const hint = String(payload.hint || "").trim();
    const points = Number(payload.points || 0);
    if (!category || !title || !description || !flag || points < 1) {
      return sendJson(res, 400, { ok: false, msg: "Category, title, description, flag, and points are required." });
    }
    const challenge = { id: `${category}_${Date.now()}`, category, title, description, points, flag, hint, createdAt: nowIso(), updatedAt: nowIso() };
    db.challenges.push(challenge);
    writeDb(db);
    return sendJson(res, 200, { ok: true, id: challenge.id });
  }

  const challengeMatch = url.pathname.match(/^\/api\/admin\/challenges\/(.+)$/);
  if (challengeMatch && req.method === "PUT") {
    const id = decodeURIComponent(challengeMatch[1]);
    const payload = await readBody(req);
    const ch = db.challenges.find((item) => item.id === id);
    const category = requireCategory(payload.category);
    if (!ch || !category) return sendJson(res, 404, { ok: false, msg: "Challenge not found." });
    ch.category = category;
    ch.title = String(payload.title || "").trim();
    ch.description = String(payload.description || "").trim();
    ch.points = Number(payload.points || 0);
    ch.flag = String(payload.flag || "").trim();
    ch.hint = String(payload.hint || "").trim();
    ch.updatedAt = nowIso();
    if (!ch.title || !ch.description || !ch.flag || ch.points < 1) {
      return sendJson(res, 400, { ok: false, msg: "Title, description, flag, and points are required." });
    }
    writeDb(db);
    return sendJson(res, 200, { ok: true });
  }

  if (challengeMatch && req.method === "DELETE") {
    const id = decodeURIComponent(challengeMatch[1]);
    const before = db.challenges.length;
    db.challenges = db.challenges.filter((item) => item.id !== id);
    db.submissions = db.submissions.filter((item) => item.challengeId !== id);
    db.solves = db.solves.filter((item) => item.challengeId !== id);
    db.hints = db.hints.filter((item) => item.challengeId !== id);
    writeDb(db);
    return sendJson(res, before === db.challenges.length ? 404 : 200, before === db.challenges.length ? { ok: false, msg: "Challenge not found." } : { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/students") {
    const students = db.students.map((student) => {
      const solves = db.solves.filter((solve) => solve.studentId === student.id);
      const scores = Object.fromEntries(domainIds.map((id) => [id, 0]));
      const solved = Object.fromEntries(domainIds.map((id) => [id, 0]));
      solves.forEach((solve) => {
        const ch = db.challenges.find((item) => item.id === solve.challengeId);
        if (ch) {
          scores[ch.category] += solve.awardedPoints;
          solved[ch.category] += 1;
        }
      });
      return {
        ...student,
        scores,
        solved,
        totalScore: Object.values(scores).reduce((sum, value) => sum + value, 0),
        totalSolved: Object.values(solved).reduce((sum, value) => sum + value, 0),
        attempts: db.submissions.filter((item) => item.studentId === student.id).length,
        lastActivity: db.submissions.filter((item) => item.studentId === student.id).map((item) => item.createdAt).sort().pop() || student.updatedAt
      };
    }).sort((a, b) => b.totalScore - a.totalScore || b.lastActivity.localeCompare(a.lastActivity));
    return sendJson(res, 200, { ok: true, students });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/reset-progress") {
    db.submissions = [];
    db.solves = [];
    db.hints = [];
    writeDb(db);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && url.pathname === "/api/admin/restore-defaults") {
    const fresh = emptyDb();
    fresh.students = db.students;
    writeDb(fresh);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/export") {
    return sendJson(res, 200, { domains, questions: groupedChallenges(db, true), progress: db.solves, exportedAt: nowIso() });
  }

  return sendJson(res, 404, { ok: false, msg: "API endpoint not found." });
}

function resolveRequest(urlPath) {
  if (urlPath === "/") return path.join(root, "index.html");
  if (urlPath === "/faq") return path.join(root, "faq.html");
  if (urlPath === "/wiki" || urlPath === "/wiki/") return "http://172.16.17.219/";
  return path.join(root, decodeURIComponent(urlPath.replace(/^\/+/, "")));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  const filePath = resolveRequest(url.pathname);
  if (/^https?:\/\//.test(filePath)) {
    res.writeHead(302, { Location: filePath });
    res.end();
    return;
  }

  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolved, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(resolved)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`CDAC Phygital Lab running at http://localhost:${port}`);
});
