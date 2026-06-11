window.CTF = (function () {
  'use strict';

  const STUDENT_KEY = 'cdac_ctf_student';
  const SHUFFLE_KEY = 'cdac_ctf_shuffle_seed';
  const ROLE_KEY = 'phygital_role';
  const LABELS = {
    "airport": "Airport",
    "water-treatment": "Water Treatment",
    "industry": "Industrial",
    "hospital": "Hospital",
    "lift-house": "Lift House",
    "power-grid": "Power Grid",
    "toll-plaza": "Toll Plaza",
    "data-center": "Data Center",
    "stock-market": "Stock Market",
    "metro": "Metro",
    "traffic-lights": "Traffic Lights"
  };
  const SEED = Object.fromEntries(Object.keys(LABELS).map((id) => [id, []]));

  function currentStudent() {
    try {
      const raw = localStorage.getItem(STUDENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveStudent(student) {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    localStorage.removeItem('phygital_admin_token');
    localStorage.setItem(ROLE_KEY, 'student');
  }

  async function api(path, options) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...(options || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.msg || 'Request failed.');
    }
    return data;
  }

  async function registerStudent(name, email) {
    const data = await api('/api/students', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    saveStudent(data.student);
    return data.student;
  }

  function ensureStudent(category, afterReady) {
    const student = currentStudent();
    if (student && student.id) {
      afterReady(student);
      return;
    }
    openStudentModal(category, afterReady);
  }

  function openStudentModal(category, afterReady) {
    let overlay = document.getElementById('ctf-student-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ctf-student-overlay';
      overlay.innerHTML = `
        <div class="ctf-student-modal" role="dialog" aria-modal="true" aria-labelledby="ctf-student-title">
          <button class="ctf-student-close" type="button" aria-label="Close">&times;</button>
          <div class="ctf-student-kicker">Student Entry</div>
          <h2 id="ctf-student-title">Join the CTF</h2>
          <p>Enter your name and email once. Your score and rank will continue from the same email.</p>
          <label for="ctf-student-name">Name</label>
          <input id="ctf-student-name" type="text" autocomplete="name" placeholder="Student name" />
          <label for="ctf-student-email">Email</label>
          <input id="ctf-student-email" type="email" autocomplete="email" placeholder="name@example.com" />
          <div class="ctf-student-error" id="ctf-student-error"></div>
          <button class="ctf-student-submit" type="button">Start CTF</button>
        </div>`;
      document.body.appendChild(overlay);
    }

    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    const closeBtn = overlay.querySelector('.ctf-student-close');
    const submitBtn = overlay.querySelector('.ctf-student-submit');
    const nameInp = overlay.querySelector('#ctf-student-name');
    const emailInp = overlay.querySelector('#ctf-student-email');
    const err = overlay.querySelector('#ctf-student-error');
    closeBtn.onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
    submitBtn.onclick = async () => {
      err.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Starting...';
      try {
        const student = await registerStudent(nameInp.value.trim(), emailInp.value.trim());
        close();
        afterReady(student, category);
      } catch (e) {
        err.textContent = e.message;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start CTF';
      }
    };
    [nameInp, emailInp].forEach((inp) => {
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') submitBtn.click();
      };
    });
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInp.focus(), 80);
  }

  async function getData() {
    const data = await api('/api/admin/challenges');
    return data.questions || SEED;
  }

  async function setData(d) {
    return d;
  }

  async function getProgress() {
    return { solved: [], attempts: {} };
  }

  async function saveProgress() {
    await api('/api/admin/reset-progress', { method: 'POST', body: '{}' });
  }

  async function getChallenges(category) {
    const student = currentStudent();
    const qs = new URLSearchParams({ category });
    if (student && student.id) qs.set('studentId', student.id);
    const data = await api('/api/challenges?' + qs.toString());
    return shuffleForBrowser(data.challenges || [], category);
  }

  function getShuffleSeed(category) {
    const student = currentStudent();
    const identity = student && student.id ? `student-${student.id}` : 'anonymous';
    const key = `${SHUFFLE_KEY}_${identity}_${category}`;
    let seed = localStorage.getItem(key);
    if (!seed) {
      seed = String(Date.now() + Math.floor(Math.random() * 1000000));
      localStorage.setItem(key, seed);
    }
    return Number(seed);
  }

  function seededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;
    return function () {
      value = value * 16807 % 2147483647;
      return (value - 1) / 2147483646;
    };
  }

  function shuffleForBrowser(items, category) {
    if (category === 'airport' || category === 'hospital' || category === 'industry' || category === 'lift-house' || category === 'power-grid' || category === 'toll-plaza' || category === 'stock-market' || category === 'metro' || category === 'traffic-lights' || category === 'data-center' || category === 'water-treatment') {
      return items.slice().sort((a, b) => a.id.localeCompare(b.id));
    }
    const list = items.slice();
    const random = seededRandom(getShuffleSeed(category));
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  async function submitFlag(challengeId, userFlag) {
    const student = currentStudent();
    if (!student || !student.id) throw new Error('Please enter your student details first.');
    return api('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ studentId: student.id, challengeId, answer: userFlag })
    });
  }

  async function recordHint(challengeId) {
    const student = currentStudent();
    if (!student || !student.id) throw new Error('Please enter your student details first.');
    return api('/api/hints', {
      method: 'POST',
      body: JSON.stringify({ studentId: student.id, challengeId })
    });
  }

  async function getLeaderboard(category) {
    const student = currentStudent();
    const qs = new URLSearchParams({ category });
    if (student && student.id) qs.set('studentId', student.id);
    return api('/api/leaderboard?' + qs.toString());
  }

  async function getOverallLeaderboard() {
    const student = currentStudent();
    const qs = new URLSearchParams();
    if (student && student.id) qs.set('studentId', student.id);
    const suffix = qs.toString() ? '?' + qs.toString() : '';
    return api('/api/leaderboard-overall' + suffix);
  }

  async function renderBoard(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const student = currentStudent();
    if (!student || !student.id) {
      container.innerHTML = `
        <div class="ctf-entry-card">
          <h3>Student details required</h3>
          <p>Enter your name and email to start this CTF and appear on the ${labelFor(category)} leaderboard.</p>
          <button class="ctf-start-btn" type="button">Start ${labelFor(category)} CTF</button>
        </div>`;
      const btn = container.querySelector('.ctf-start-btn');
      if (btn) btn.addEventListener('click', () => ensureStudent(category, () => renderBoard(category, containerId)));
      return;
    }

    container.innerHTML = '<div class="ctf-loading">Loading CTF...</div>';
    try {
      const challenges = await getChallenges(category);
      const board = await getLeaderboard(category);
      if (challenges.length === 0) {
        container.innerHTML = `
          <div class="ctf-empty">
            <span class="ctf-empty-icon">!</span>
            <p>No challenges configured yet.<br>
               Please contact the lab administrator to add this room.</p>
          </div>`;
        return;
      }

      const score = board.current ? board.current.score : 0;
      const solvedCount = challenges.filter(c => c.solved).length;
      const total = challenges.reduce((s, c) => s + c.points, 0);
      const pct = total ? Math.round((score / total) * 100) : 0;
      const isGuidedRoom = category === 'airport' || category === 'hospital' || category === 'industry' || category === 'lift-house' || category === 'power-grid' || category === 'toll-plaza' || category === 'stock-market' || category === 'metro' || category === 'traffic-lights' || category === 'data-center' || category === 'water-treatment';

      container.innerHTML = `
        ${isGuidedRoom ? renderGuidedRoomHeader(category, challenges, solvedCount, total) : ''}
        ${renderStudentStrip(student)}
        ${renderLeaderboard(board)}
        <div class="ctf-scorebar">
          <div class="ctf-sb-left">
            <span class="ctf-sb-score">${score}</span>
            <span class="ctf-sb-total">/ ${total} pts</span>
          </div>
          <div class="ctf-sb-track">
            <div class="ctf-sb-fill" style="width:${pct}%"></div>
          </div>
          <div class="ctf-sb-solved">${solvedCount} / ${challenges.length} solved</div>
        </div>
        ${category === 'data-center'
          ? renderDataCenterTaskRoom(challenges)
          : category === 'water-treatment'
          ? renderWaterTreatmentTaskRoom(challenges)
          : `<div class="ctf-challenges ${isGuidedRoom ? 'ctf-room-tasks' : ''}">
              ${challenges.map((challenge, index) => renderChallenge(challenge, index, isGuidedRoom)).join('')}
            </div>`}`;

      bindBoard(container, category, containerId);
    } catch (e) {
      container.innerHTML = `<div class="ctf-empty"><p>${escapeHtml(e.message)}</p></div>`;
    }
  }

  async function renderLeaderboardOnly(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="ctf-loading">Loading leaderboard...</div>';
    try {
      const board = await getLeaderboard(category);
      const top = board.top || [];
      container.innerHTML = `
        <div class="ctf-leaderboard-only">
          <div class="ctf-lb-only-head">
            <span>${escapeHtml(labelFor(category))} Room Leaderboard</span>
            <strong>Top ${top.length || 0}</strong>
          </div>
          <div class="ctf-lb-rows">
            ${top.length
              ? top.map(renderRankRow).join('')
              : '<div class="ctf-lb-empty">No student has solved a task in this room yet.</div>'}
          </div>
        </div>`;
    } catch (e) {
      container.innerHTML = `<div class="ctf-empty"><p>${escapeHtml(e.message)}</p></div>`;
    }
  }

  async function renderOverallLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div class="ctf-loading">Loading overall leaderboard...</div>';
    try {
      const board = await getOverallLeaderboard();
      const top = board.top || [];
      const current = board.current;
      const showCurrent = current && !top.some(row => row.studentId === current.studentId);
      container.innerHTML = `
        <div class="ctf-leaderboard-only">
          <div class="ctf-lb-only-head">
            <span>Overall Platform Leaderboard</span>
            ${current ? `<strong>Your rank: #${current.rank}</strong>` : '<strong>Top students</strong>'}
          </div>
          <div class="ctf-lb-rows">
            ${top.length
              ? top.map(renderOverallRankRow).join('')
              : '<div class="ctf-lb-empty">No student has solved a task yet.</div>'}
            ${showCurrent ? '<div class="ctf-lb-gap"></div>' + renderOverallRankRow(current, true) : ''}
          </div>
        </div>`;
    } catch (e) {
      container.innerHTML = `<div class="ctf-empty"><p>${escapeHtml(e.message)}</p></div>`;
    }
  }

  function bindBoard(container, category, containerId) {
    container.querySelectorAll('.ctf-task-header').forEach(header => {
      header.addEventListener('click', () => {
        const block = header.closest('.ctf-task-block');
        if (!block) return;
        block.classList.toggle('open');
        header.setAttribute('aria-expanded', block.classList.contains('open') ? 'true' : 'false');
      });
    });

    container.querySelectorAll('.ctf-submit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const inp = container.querySelector(`#ctf-inp-${id}`);
        if (!inp || !inp.value.trim()) {
          shakeInput(inp);
          return;
        }
        await handleSubmit(id, inp.value, category, containerId);
      });
    });

    container.querySelectorAll('.ctf-hint-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const hintEl = container.querySelector(`#ctf-hint-${btn.dataset.id}`);
        if (!hintEl) return;
        const hidden = hintEl.style.display === 'none' || !hintEl.style.display;
        if (hidden) {
          btn.disabled = true;
          try {
            const result = await recordHint(btn.dataset.id);
            hintEl.innerHTML = result.hint || 'No hint available.';
            hintEl.style.display = 'block';
            const ptsEl = container.querySelector(`#ctf-award-${btn.dataset.id}`);
            if (ptsEl) ptsEl.textContent = `${result.currentAward} pts available`;
            btn.textContent = 'Hide Hint';
          } catch (e) {
            hintEl.textContent = e.message;
            hintEl.style.display = 'block';
          } finally {
            btn.disabled = false;
          }
        } else {
          hintEl.style.display = 'none';
          btn.textContent = 'Show Hint';
        }
      });
    });

    container.querySelectorAll('.ctf-flag-input').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const btn = container.querySelector(`.ctf-submit-btn[data-id="${inp.dataset.id}"]`);
        if (btn) btn.click();
      });
    });
  }

  function renderStudentStrip(student) {
    return `
      <div class="ctf-student-strip">
        <span>Playing as <strong>${escapeHtml(student.name)}</strong></span>
        <button type="button" class="ctf-change-student" onclick="localStorage.removeItem('${STUDENT_KEY}'); location.reload();">Change</button>
      </div>`;
  }

  function renderLeaderboard(board) {
    const top = board.top || [];
    const current = board.current;
    const showCurrent = current && !top.some(row => row.studentId === current.studentId);
    return `
      <div class="ctf-leaderboard">
        <div class="ctf-lb-head">
          <span>Leaderboard</span>
          ${current ? `<strong>Your rank: #${current.rank}</strong>` : '<strong>No rank yet</strong>'}
        </div>
        <div class="ctf-lb-rows">
          ${top.length ? top.map(renderRankRow).join('') : '<div class="ctf-lb-empty">No one has solved a task in this room yet.</div>'}
          ${showCurrent ? '<div class="ctf-lb-gap"></div>' + renderRankRow(current, true) : ''}
        </div>
      </div>`;
  }

  function renderRankRow(row, current) {
    return `
      <div class="ctf-lb-row ${current ? 'current' : ''}">
        <span class="ctf-lb-rank">#${row.rank}</span>
        <span class="ctf-lb-name">${escapeHtml(row.name)}</span>
        <span class="ctf-lb-score">${row.score} pts</span>
      </div>`;
  }

  function renderOverallRankRow(row, current) {
    return `
      <div class="ctf-lb-row ${current ? 'current' : ''}">
        <span class="ctf-lb-rank">#${row.rank}</span>
        <span class="ctf-lb-name">${escapeHtml(row.name)} <small>${row.solvedCount} solved / ${row.roomCount} rooms</small></span>
        <span class="ctf-lb-score">${row.score} pts</span>
      </div>`;
  }

  function renderDataCenterTaskRoom(challenges) {
    const groups = [
      {
        no: '1',
        title: 'Reconnaissance - Confirm the Attack Surface',
        intro: 'Before interacting with any industrial protocol, confirm the service is actually exposed. Use a port scanner to probe the target and verify which port Modbus TCP is running on.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 1 '))
      },
      {
        no: '2',
        title: 'Register Enumeration - Map the Control Space',
        intro: 'Modbus devices expose data through numbered registers. Read register values while the HVAC system is operating and correlate them with dashboard state.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 2 '))
      },
      {
        no: '3',
        title: 'Exploitation - Write to a Control Register',
        intro: 'Use the discovered register map and captured values to understand how an unauthorized write can affect the HVAC coolant state. Restore safe state after the drill.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 3 '))
      }
    ].filter((group) => group.items.length);
    const completedGroups = groups.filter((group) => group.items.every((item) => item.solved)).length;

    return `
      <div class="ctf-dc-target">
        <div>
          <span>Target IP</span>
          <strong>172.16.17.126</strong>
        </div>
        <div>
          <span>Protocol</span>
          <strong>Modbus TCP</strong>
        </div>
        <p>This is a lab environment. Do not attack systems outside the designated IP range. Restore all registers before ending the drill.</p>
      </div>
      <div class="ctf-task-list-head">
        <h3>Tasks</h3>
        <span>${completedGroups} / ${groups.length} complete</span>
      </div>
      <div class="ctf-task-list">
        ${groups.map((group) => renderDataCenterTaskGroup(group)).join('')}
      </div>`;
  }

  function renderWaterTreatmentTaskRoom(challenges) {
    const groups = [
      {
        no: '1',
        title: 'Reconnaissance - Confirm the Attack Surface',
        intro: 'Before interacting with any industrial protocol, confirm the exposed Moxa NPort service. Use a port scanner to identify the open port, service name, MAC address, and vendor.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 1 '))
      },
      {
        no: '2',
        title: 'Protocol Analysis - Understand the Attack Vector',
        intro: 'The Moxa NPort bridges TCP connections directly to the Modbus RTU serial bus. Understand the raw payload structure before injecting commands.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 2 '))
      },
      {
        no: '3',
        title: 'Exploitation - Inject the Payload',
        intro: 'The gateway accepts raw Modbus RTU frames over TCP. Craft and deliver the payload that stops filtration, then observe dashboard impact.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 3 '))
      },
      {
        no: '4',
        title: 'Blue Team - Detection And Remediation',
        intro: 'A single unauthenticated TCP connection can stop filtration. Identify controls that would detect, restrict, and harden this pathway.',
        items: challenges.filter((challenge) => challenge.title.startsWith('Task 4 '))
      }
    ].filter((group) => group.items.length);
    const completedGroups = groups.filter((group) => group.items.every((item) => item.solved)).length;

    return `
      <div class="ctf-dc-target">
        <div>
          <span>Target IP</span>
          <strong>172.16.17.133</strong>
        </div>
        <div>
          <span>Protocol</span>
          <strong>Modbus RTU over TCP</strong>
        </div>
        <p>This is a lab environment. Do not attack systems outside the designated IP range. Restore filtration before ending the drill.</p>
      </div>
      <div class="ctf-task-list-head">
        <h3>Tasks</h3>
        <span>${completedGroups} / ${groups.length} complete</span>
      </div>
      <div class="ctf-task-list">
        ${groups.map((group) => renderDataCenterTaskGroup(group)).join('')}
      </div>`;
  }

  function renderDataCenterTaskGroup(group) {
    const complete = group.items.every((item) => item.solved);
    return `
      <section class="ctf-task-block ${complete ? 'completed' : ''}">
        <button class="ctf-task-header" type="button" aria-expanded="false">
          <span class="ctf-task-num">Task ${group.no}</span>
          <span class="ctf-task-check ${complete ? 'done' : ''}"></span>
          <strong>${escapeHtml(group.title)}</strong>
          <span class="ctf-task-arrow">v</span>
        </button>
        <div class="ctf-task-body">
          <p>${escapeHtml(group.intro)}</p>
          ${group.items.map((challenge, index) => renderDataCenterQuestion(challenge, group.no, index + 1)).join('')}
        </div>
      </section>`;
  }

  function renderDataCenterQuestion(challenge, taskNo, questionNo) {
    const solved = !!challenge.solved;
    return `
      <div class="ctf-question-block ${solved ? 'solved' : ''}">
        <label for="ctf-inp-${challenge.id}">
          <span>Q${taskNo}.${questionNo}</span>
          ${escapeHtml(challenge.description)}
        </label>
        ${solved
          ? `<div class="ctf-solved-banner">Answer accepted - question complete!</div>`
          : `<div class="ctf-answer-row">
              <input type="text" class="ctf-flag-input" id="ctf-inp-${challenge.id}"
                     data-id="${challenge.id}"
                     placeholder="Enter answer"
                     spellcheck="false" autocomplete="off" />
              <button class="ctf-submit-btn" data-id="${challenge.id}">Check</button>
            </div>
            <div class="ctf-question-meta">
              ${challenge.hasHint ? `<button class="ctf-hint-toggle" data-id="${challenge.id}">Show hint</button>` : ''}
              <span class="ctf-award-note" id="ctf-award-${challenge.id}">${challenge.currentAward} pts available</span>
            </div>
            <p class="ctf-hint-text" id="ctf-hint-${challenge.id}" style="display:none"></p>
            <div class="ctf-result-msg" id="ctf-res-${challenge.id}"></div>`
        }
      </div>`;
  }

  function openOverallLeaderboardModal() {
    let overlay = document.getElementById('ctf-overall-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ctf-overall-overlay';
      overlay.className = 'phygital-ctf-modal';
      overlay.innerHTML = `
        <div class="ctf-modal">
          <div class="ctf-modal-head">
            <div class="ctf-modal-title-group">
              <div class="ctf-modal-icon" aria-hidden="true">TOP</div>
              <div>
                <div class="ctf-modal-title">Overall Leaderboard</div>
                <div class="ctf-modal-subtitle">Combined score across every model room</div>
              </div>
            </div>
            <button class="ctf-modal-close" type="button" aria-label="Close overall leaderboard">x</button>
          </div>
          <div class="ctf-modal-body">
            <div id="ctf-overall-board"></div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.ctf-modal-close').addEventListener('click', closeOverallLeaderboardModal);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeOverallLeaderboardModal();
      });
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderOverallLeaderboard('ctf-overall-board');
  }

  function closeOverallLeaderboardModal() {
    const overlay = document.getElementById('ctf-overall-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderGuidedRoomHeader(category, challenges, solvedCount, total) {
    const rooms = {
      airport: {
        title: 'Airport Multi-System Intrusion',
        description: 'Investigate Airport doors, baggage reclaim, airplane parking, air-quality sensors, kiosk PNR responses, and billboard media handling where weak OPC UA, insecure MQTT, HTTP MITM, and unsafe FTP workflows can affect the model. Complete recon, credential audit, topic mapping, kiosk tampering review, billboard upload review, safe recovery, and Blue Team hardening tasks.',
        tags: ['OPC UA', 'MQTT', 'HTTP MITM', 'FTP Billboard']
      },
      hospital: {
        title: 'Hospital OpenEMR Authenticated RCE',
        description: 'Investigate a Hospital OpenEMR 5.0.1 application where authenticated RCE can lead to host access, phpMyAdmin credential exposure, and medication-record tampering risk. Complete enumeration, impact analysis, recovery, and Blue Team hardening tasks.',
        tags: ['OpenEMR', 'TCP/80', 'Authenticated RCE', 'Red + Blue Team']
      },
      'lift-house': {
        title: 'Lift House Gas, Fire, And Elevator Intrusion',
        description: 'Investigate Lift House gas sensors, fire sensors, and elevator controls where WebSocket, CoAP, and Modbus TCP paths can affect the physical model. Complete traffic analysis, false-data simulation, CoAP value tampering review, Modbus register mapping, recovery, and Blue Team hardening tasks.',
        tags: ['WebSocket', 'CoAP', 'Modbus TCP', 'Red + Blue Team']
      },
      'power-grid': {
        title: 'Power Grid ISO-TSAP Intrusion',
        description: 'Investigate a Power Grid controller where internally exposed ISO-TSAP/S7 communication on TCP/102 can lead to unsafe controller stop behavior. Complete enumeration, tool review, controlled simulation, recovery, and Blue Team hardening tasks.',
        tags: ['ISO-TSAP', 'TCP/102', 'S7COMM', 'Red + Blue Team']
      },
      'toll-plaza': {
        title: 'Toll Plaza RFID Clone Risk',
        description: 'Investigate a Toll Plaza RFID reader where vulnerable MIFARE-style lab cards can be read, cloned to a writable test card, and replayed at the toll lane. Complete card evidence collection, dashboard impact review, cleanup, and Blue Team anti-cloning controls.',
        tags: ['RFID', 'MIFARE', 'Cloned Card', 'Red + Blue Team']
      },
      'stock-market': {
        title: 'Stock Market Phishing And Billboard Incident',
        description: 'Investigate a Stock Market training workstation where phishing can trigger a benign ransomware simulation, and a billboard media workflow where unsafe FTP/upload handling creates content compromise risk. Complete mail evidence, file recovery, billboard review, and Blue Team hardening tasks.',
        tags: ['Phishing', 'Ransomware Drill', 'FTP Billboard', 'Red + Blue Team']
      },
      metro: {
        title: 'Metro Modbus Coil Intrusion',
        description: 'Investigate a Metro PLC where Modbus TCP on port 502 exposes write_coil behavior. Complete port discovery, interlock observation, controlled coil-write testing, safe recovery, and Blue Team hardening tasks.',
        tags: ['Modbus TCP', 'Write Coil', 'Interlock', 'Red + Blue Team']
      },
      'traffic-lights': {
        title: 'Traffic Lights MQTT Intrusion',
        description: 'Investigate a Traffic Lights MQTT broker where wildcard topic discovery and unauthorized publishes can force all green lights on. Complete broker enumeration, topic mapping, all-green simulation, safe recovery, and Blue Team MQTT hardening tasks.',
        tags: ['MQTT', 'TCP/1883', 'All-Green State', 'Red + Blue Team']
      },
      industry: {
        title: 'Industrial MQTT Telemetry Intrusion',
        description: 'Investigate a phygital Industrial model where a Kali machine can spoof MQTT sensor values and mislead the live Node-RED dashboard. Complete the Red Team discovery tasks, then finish with Blue Team containment and hardening.',
        tags: ['Beginner friendly', 'MQTT', 'IoT / OT', 'Red + Blue Team']
      },
      'data-center': {
        title: 'Data Center HVAC Modbus Intrusion',
        description: 'Work through a Data Center HVAC room where an exposed Modbus TCP PLC allows register reads and writes against coolant and ventilation control. Confirm the attack surface, map registers, perform a controlled write, restore safe cooling, and document the Blue Team controls.',
        tags: ['Easy', 'ICS/SCADA', 'Modbus TCP', 'HVAC']
      },
      'water-treatment': {
        title: 'Water Treatment Moxa Modbus RTU Intrusion',
        description: 'Investigate an exposed Moxa NPort serial-to-ethernet converter that bridges raw TCP traffic into the Water Treatment Modbus RTU bus. Discover the service, analyze the protocol, inject a controlled payload, and document detection and remediation.',
        tags: ['Moxa NPort', 'Modbus RTU', 'TCP/4001', 'Water Treatment']
      }
    };
    const room = rooms[category] || rooms.industry;
    return `
      <div class="ctf-room-hero">
        <div>
          <span class="ctf-room-kicker">Guided CTF Room</span>
          <h3>${room.title}</h3>
          <p>${room.description}</p>
          <div class="ctf-room-tags">
            ${room.tags.map((tag) => `<span>${tag}</span>`).join('')}
          </div>
        </div>
        <div class="ctf-room-statbox">
          <strong>${solvedCount}/${challenges.length}</strong>
          <span>Tasks solved</span>
          <em>${total} total pts</em>
        </div>
      </div>`;
  }

  function renderChallenge(ch, index = 0, roomStyle = false) {
    const solved = !!ch.solved;
    const attempts = ch.attempts || 0;
    const taskNo = String(index + 1).padStart(2, '0');
    return `
      <div class="ctf-card ${roomStyle ? 'ctf-room-card' : ''} ${solved ? 'ctf-card-solved' : ''}" id="ctf-card-${ch.id}">
        ${roomStyle ? `<div class="ctf-room-step ${solved ? 'done' : ''}">${solved ? 'OK' : taskNo}</div>` : ''}
        <div class="ctf-card-head">
          <div class="ctf-card-title-row">
            <span class="ctf-card-title">${ch.title}</span>
            <span class="ctf-card-pts">${ch.points} pts</span>
          </div>
          ${solved ? '<span class="ctf-solved-badge">SOLVED</span>' : ''}
        </div>
        <p class="ctf-card-desc">${ch.description}</p>
        <div class="ctf-card-foot">
          ${ch.hasHint ? `
          <div class="ctf-hint-wrap">
            <button class="ctf-hint-toggle" data-id="${ch.id}" ${solved ? 'disabled' : ''}>Show Hint</button>
            <span class="ctf-award-note" id="ctf-award-${ch.id}">${solved ? `${ch.awardedPoints} pts earned` : `${ch.currentAward} pts available`}</span>
            <p class="ctf-hint-text" id="ctf-hint-${ch.id}" style="display:none"></p>
          </div>` : ''}
          ${solved
            ? `<div class="ctf-solved-banner">Flag accepted - challenge complete!</div>`
            : `<div class="ctf-flag-row">
                 <input type="text" class="ctf-flag-input" id="ctf-inp-${ch.id}"
                        data-id="${ch.id}"
                        placeholder="Enter answer"
                        spellcheck="false" autocomplete="off" />
                 <button class="ctf-submit-btn" data-id="${ch.id}">Submit</button>
               </div>
               ${attempts > 0 ? `<span class="ctf-att-count">${attempts} attempt${attempts > 1 ? 's' : ''}</span>` : ''}
               <div class="ctf-result-msg" id="ctf-res-${ch.id}"></div>`
          }
        </div>
      </div>`;
  }

  async function handleSubmit(id, flagVal, category, containerId) {
    const resEl = document.getElementById(`ctf-res-${id}`);
    try {
      const result = await submitFlag(id, flagVal);
      if (resEl) {
        resEl.className = 'ctf-result-msg ' + (result.correct || result.already ? 'ctf-ok' : 'ctf-err');
        resEl.textContent = result.msg;
      }
      if (result.correct) {
        if (category === 'data-center') {
          markQuestionSolvedInPlace(id);
        } else {
          setTimeout(() => renderBoard(category, containerId), 900);
        }
      }
    } catch (e) {
      if (resEl) {
        resEl.className = 'ctf-result-msg ctf-err';
        resEl.textContent = e.message;
      }
    }
  }

  function markQuestionSolvedInPlace(id) {
    const input = document.getElementById(`ctf-inp-${id}`);
    const question = input ? input.closest('.ctf-question-block') : null;
    if (!question) return;
    question.classList.add('solved');
    const answerRow = question.querySelector('.ctf-answer-row');
    const meta = question.querySelector('.ctf-question-meta');
    const hint = question.querySelector('.ctf-hint-text');
    if (answerRow) answerRow.remove();
    if (meta) meta.remove();
    if (hint) hint.remove();
    const res = question.querySelector(`#ctf-res-${id}`);
    if (res) {
      res.className = 'ctf-solved-banner';
      res.textContent = 'Answer accepted - question complete!';
    }
  }

  function labelFor(category) {
    return LABELS[category] || category;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function shakeInput(inp) {
    if (!inp) return;
    inp.style.animation = 'none';
    inp.offsetHeight;
    inp.style.animation = 'ctf-shake 0.35s ease';
  }

  return {
    renderBoard,
    renderLeaderboardOnly,
    renderOverallLeaderboard,
    openOverallLeaderboardModal,
    getData,
    setData,
    getProgress,
    saveProgress,
    registerStudent,
    currentStudent,
    ensureStudent,
    SEED
  };
})();
