const domains = [
  {
    id: "airport",
    title: "Airport",
    icon: "Airport",
    group: "transport",
    accent: "rgba(77,216,255,0.9)",
    summary: "Runway, terminal, passenger, baggage, fire, surveillance, and airside operation model.",
    overview: "The Airport model demonstrates how passenger movement, baggage handling, runway lighting, surveillance, access control, emergency response, and IoT monitoring can be represented in a phygital training setup.",
    features: ["Runway and terminal monitoring", "Baggage and passenger flow", "Access control and CCTV", "Emergency and fire response"],
    steps: ["Sensor and camera events are generated from terminal, runway, and restricted zones.", "Gateway nodes forward events to the operations dashboard.", "Rules detect congestion, intrusion, equipment fault, or unsafe movement.", "Operators respond through SOPs, alerts, and cyber-physical incident drills."],
    red: "Test weak access control, exposed cameras, IoT device credentials, spoofed sensor events, and dashboard injection paths.",
    blue: "Monitor CCTV logs, gate access, alert timelines, unusual device traffic, and SIEM dashboards for airport operations.",
    twin: "Terminal, runway, vehicle, and passenger flow representation.",
    analytics: "Crowd density, baggage delay, intrusion, fire, and operational incident analytics.",
    simulation: "Runway closure, unauthorized access, baggage jam, evacuation, and camera outage scenarios.",
    image: "static/images/airport.jpeg",
    photos: ["Full airport model overview", "Runway lighting and aircraft zone", "Terminal and passenger area", "Control dashboard screen"]
  },
  {
    id: "water-treatment",
    title: "Water Treatment",
    icon: "Water",
    group: "critical",
    accent: "rgba(77,216,255,0.9)",
    summary: "Treatment plant flow with tanks, pumps, level sensors, dosing, SCADA, and water quality monitoring.",
    overview: "The Water Treatment model covers intake, filtration, tank levels, pump control, quality sensing, dosing workflow, and SCADA-style monitoring for safe plant operation.",
    features: ["Tank level monitoring", "Pump and valve control", "Water quality parameters", "SCADA/OT dashboard"],
    steps: ["Raw water enters monitored intake and tank stages.", "Sensors measure level, flow, pH, turbidity, and pump status.", "Controller logic triggers valves, pumps, and alarms.", "Dashboard and logs support maintenance, troubleshooting, and security exercises."],
    red: "Explore Moxa gateway discovery, Modbus RTU-over-TCP command injection, filtration stop behavior, pump control impact, and exposed OT paths.",
    blue: "Track filtration and pump events, Moxa gateway sessions, unauthorized TCP/4001 access, abnormal control commands, and OT recovery actions.",
    twin: "Intake, treatment, tank, pump, and distribution stages.",
    analytics: "Pump efficiency, tank thresholds, quality drift, leak indicators, and anomaly alerts.",
    simulation: "Low tank, pump failure, chemical dosing fault, sensor spoofing, and communication loss.",
    image: "static/images/water.jpg",
    photos: ["Treatment plant full model", "Tank and pump section", "Water quality sensor area", "SCADA display"]
  },
  {
    id: "industry",
    title: "Industrial",
    icon: "Factory",
    group: "critical",
    accent: "rgba(240,182,74,0.9)",
    summary: "Industrial automation, PLC workflow, process safety, production line monitoring, and OT security.",
    overview: "The Industrial model demonstrates a smart factory environment with PLC-style control, conveyor or process stations, safety monitoring, production visibility, and IT/OT cybersecurity exercises.",
    features: ["PLC and actuator logic", "Production line status", "Safety interlocks", "OT network monitoring"],
    steps: ["Machines and sensors generate process status.", "Controller logic manages actuators and safety interlocks.", "Production metrics are shown on dashboards.", "Cyber drills validate segmentation, access control, and alerting."],
    red: "Test PLC command abuse, engineering workstation exposure, weak segmentation, unsafe setpoint changes, and fake telemetry.",
    blue: "Monitor PLC traffic, workstation login events, operator actions, production anomalies, and safety alarms.",
    twin: "Process line, controllers, actuators, and safety zones.",
    analytics: "Downtime, throughput, temperature, vibration, unsafe states, and maintenance trends.",
    simulation: "Conveyor stoppage, overheat, emergency stop, rogue command, and network isolation.",
    image: "static/images/industry.jpeg",
    photos: ["Industrial model overview", "PLC/controller panel", "Production line area", "Operator dashboard"]
  },
  {
    id: "hospital",
    title: "Hospital",
    icon: "Hospital",
    group: "urban",
    accent: "rgba(120,213,111,0.9)",
    summary: "Smart hospital operations with patient zones, emergency systems, asset tracking, and safety monitoring.",
    overview: "The Hospital model represents patient care zones, emergency response, fire safety, restricted areas, medical asset tracking, environmental sensing, and cyber resilience for healthcare infrastructure.",
    features: ["Patient and ward monitoring", "Emergency alerts", "Medical asset tracking", "Fire and access safety"],
    steps: ["Sensors report ward occupancy, environmental status, and emergency triggers.", "Access and safety events are correlated with dashboard alerts.", "Operators follow emergency SOPs.", "Cyber exercises test resilience of healthcare systems."],
    red: "Assess weak IoT devices, unauthorized access, exposed dashboards, spoofed emergency alerts, and privacy-sensitive data paths.",
    blue: "Monitor access logs, patient-zone events, asset movement, emergency alarms, and network anomalies.",
    twin: "Wards, emergency area, restricted rooms, assets, and safety systems.",
    analytics: "Occupancy, response time, equipment availability, air quality, and abnormal events.",
    simulation: "Fire alert, asset missing, ward overload, network outage, and unauthorized entry.",
    image: "static/images/hospital.jpeg",
    photos: ["Hospital model overview", "Ward and emergency zone", "Fire and safety system", "Healthcare dashboard"]
  },
  {
    id: "banking",
    title: "Banking",
    icon: "Bank",
    group: "enterprise",
    accent: "rgba(124,167,255,0.9)",
    summary: "Branch, ATM, vault, queue, transaction, surveillance, and fraud detection training model.",
    overview: "The Banking model combines branch operations, ATM monitoring, vault security, customer queue visibility, transaction events, surveillance, and cyber-fraud exercises.",
    features: ["ATM status", "Vault and access control", "Transaction alerts", "Branch security"],
    steps: ["Branch and ATM events are collected from physical and logical devices.", "Access control and transaction telemetry are processed.", "Dashboards flag suspicious operations.", "Students investigate incidents through logs and exercises."],
    red: "Test ATM interface abuse, weak branch network controls, access bypass, transaction manipulation, and phishing-style entry points.",
    blue: "Monitor ATM health, access logs, transaction anomalies, suspicious authentication, and SIEM alerts.",
    twin: "Branch lobby, ATM, vault, counters, and surveillance zones.",
    analytics: "Queue time, ATM uptime, suspicious transaction patterns, and access attempts.",
    simulation: "ATM downtime, vault access alert, transaction spike, card fraud, and CCTV failure.",
    image: "static/images/Bank.jpg",
    photos: ["Banking model overview", "ATM and customer zone", "Vault/security area", "Transaction dashboard"]
  },
  {
    id: "power-grid",
    title: "Power Grid",
    icon: "Grid",
    group: "critical",
    accent: "rgba(255,109,97,0.9)",
    summary: "Generation, substation, transmission, distribution, load monitoring, and grid cybersecurity.",
    overview: "The Power Grid model demonstrates generation, substation switching, transmission, load balancing, fault detection, safety interlocks, and cyber-physical grid incident response.",
    features: ["Substation monitoring", "Load and fault indicators", "Breaker and relay workflow", "Grid OT security"],
    steps: ["Generation and load telemetry enters the control view.", "Substation events and breaker states are monitored.", "Fault rules detect overload or abnormal switching.", "Operators respond using isolation and recovery SOPs."],
    red: "Investigate relay misoperation, false data injection, unauthorized breaker commands, exposed protocols, and weak segmentation.",
    blue: "Monitor relay logs, load changes, breaker operations, event timelines, and grid control network traffic.",
    twin: "Generation, transmission, substation, feeders, and consumer load.",
    analytics: "Load forecast, outage detection, relay event correlation, and power quality.",
    simulation: "Overload, feeder fault, breaker trip, renewable fluctuation, and control network attack.",
    image: "static/images/power plant.jpeg",
    photos: ["Power grid model overview", "Substation section", "Transmission line area", "Grid monitoring dashboard"]
  },
  {
    id: "toll-plaza",
    title: "Toll Plaza",
    icon: "Toll",
    group: "transport",
    accent: "rgba(240,182,74,0.9)",
    summary: "Lane sensors, FASTag/RFID, vehicle count, barrier control, congestion, and payment security.",
    overview: "The Toll Plaza model shows lane automation, RFID/FASTag style detection, barrier control, vehicle classification, queue monitoring, transaction events, and cybersecurity for transport infrastructure.",
    features: ["Lane and barrier status", "RFID/vehicle detection", "Traffic flow analytics", "Payment event security"],
    steps: ["Vehicles trigger lane sensors and RFID reads.", "Barrier and payment events are processed.", "Dashboard tracks queue, violations, and lane availability.", "Cyber exercises investigate spoofing and transaction misuse."],
    red: "Test RFID replay, lane controller abuse, weak payment APIs, barrier tampering, and camera/feed manipulation.",
    blue: "Monitor lane events, abnormal barrier cycles, transaction mismatches, vehicle counts, and security alerts.",
    twin: "Toll booths, lanes, barriers, vehicle sensors, and camera zones.",
    analytics: "Throughput, lane wait time, failed payment, violation, and barrier health.",
    simulation: "Lane blockage, payment failure, RFID spoof, barrier fault, and traffic surge.",
    image: "static/images/toll plaza.jpeg",
    photos: ["Toll plaza model overview", "Lane and barrier section", "RFID/payment area", "Traffic dashboard"]
  },
  {
    id: "data-center",
    title: "Data Center",
    icon: "DC",
    group: "enterprise",
    accent: "rgba(77,216,255,0.9)",
    summary: "Server racks, cooling, power, access control, network monitoring, and incident response.",
    overview: "The Data Center model focuses on rack health, cooling, power backup, access control, network status, environmental sensing, and incident response for digital infrastructure.",
    features: ["Rack and server health", "Cooling and power status", "Access control", "Network monitoring"],
    steps: ["Rack, temperature, power, and access events are collected.", "Dashboard correlates thermal, electrical, and network state.", "Alerts identify abnormal conditions.", "Operators practice troubleshooting and cyber response."],
    red: "Assess exposed admin panels, weak remote access, rogue device insertion, alert suppression, and network pivot paths.",
    blue: "Monitor access events, rack temperature, UPS logs, network flows, failed logins, and service availability.",
    twin: "Racks, cooling, UPS, fire suppression, and network segments.",
    analytics: "Thermal trends, power load, uptime, capacity, and anomalous access.",
    simulation: "Cooling failure, UPS switchover, unauthorized access, DDoS, and server outage.",
    image: "static/images/datacenter.jpeg",
    photos: ["Data center model overview", "Rack and cooling section", "UPS/power area", "NOC dashboard"]
  },
  {
    id: "stock-market",
    title: "Stock Market",
    icon: "Market",
    group: "enterprise",
    accent: "rgba(120,213,111,0.9)",
    summary: "Trading floor, market feeds, order flow, risk alerts, fraud patterns, and cyber monitoring.",
    overview: "The Stock Market model demonstrates market data flow, trading terminal events, order lifecycle, risk monitoring, fraud detection, availability, and cybersecurity in financial systems.",
    features: ["Market feed visualization", "Order event monitoring", "Risk and fraud rules", "Availability tracking"],
    steps: ["Market and order events are generated by the model.", "Risk checks and transaction rules process activity.", "Dashboards show volatility, failures, and suspicious patterns.", "Cyber exercises test manipulation and resilience."],
    red: "Test API misuse, feed tampering, credential attacks, transaction replay, and dashboard manipulation.",
    blue: "Monitor order anomalies, feed integrity, login patterns, latency, and incident alerts.",
    twin: "Trading terminals, market feed, broker gateway, and risk engine.",
    analytics: "Volume spikes, failed orders, abnormal trades, latency, and fraud indicators.",
    simulation: "Flash movement, feed delay, suspicious order burst, API abuse, and terminal outage.",
    image: "static/images/stock exchange.jpeg",
    photos: ["Stock market model overview", "Trading terminal area", "Market feed screen", "Risk dashboard"]
  },
  {
    id: "metro",
    title: "Metro",
    icon: "Metro",
    group: "transport",
    accent: "rgba(124,167,255,0.9)",
    summary: "Train movement, station safety, ticketing, signaling, power, passenger flow, and control room operations.",
    overview: "The Metro model demonstrates station and train movement, signaling, track occupancy, ticketing gates, passenger safety, power supply, and control room workflows.",
    features: ["Train and track status", "Station safety", "Ticketing gates", "Signaling and power"],
    steps: ["Train, track, gate, and station events are collected.", "Control logic tracks occupancy, signals, and movement.", "Dashboard surfaces safety or timing incidents.", "Students practice operations and cyber response."],
    red: "Test ticketing bypass, signal spoofing concepts, dashboard abuse, exposed cameras, and network segmentation gaps.",
    blue: "Monitor train events, gate logs, station alerts, signal status, and unusual network traffic.",
    twin: "Stations, tracks, train units, ticket gates, and control room.",
    analytics: "Passenger flow, schedule adherence, gate exceptions, track occupancy, and safety alerts.",
    simulation: "Train delay, platform crowding, gate fault, signal alert, and power interruption.",
    image: "static/images/metro.jpeg",
    photos: ["Metro model overview", "Station platform", "Train and track area", "Metro control dashboard"]
  },
  {
    id: "warehouse",
    title: "Warehouse",
    icon: "Warehouse",
    group: "urban",
    accent: "rgba(240,182,74,0.9)",
    summary: "Inventory, loading dock, asset tracking, robotics, fire safety, access control, and logistics analytics.",
    overview: "The Warehouse model covers inventory movement, loading dock events, asset tracking, robotics or conveyor flow, access control, fire safety, and logistics monitoring.",
    features: ["Inventory and asset tracking", "Dock operations", "Conveyor/robot workflow", "Fire and access safety"],
    steps: ["Packages, assets, and dock events are captured.", "Movement and stock data updates the dashboard.", "Rules detect delays, missing assets, or unsafe conditions.", "Cyber exercises test logistics system resilience."],
    red: "Test RFID spoofing, inventory API misuse, access bypass, camera tampering, and rogue device entry.",
    blue: "Monitor asset movement, dock events, inventory mismatches, access logs, and safety alarms.",
    twin: "Storage racks, dock, conveyor/robot area, and access zones.",
    analytics: "Inventory accuracy, dock time, asset movement, exception rate, and safety events.",
    simulation: "Missing asset, dock congestion, conveyor stop, fire alert, and inventory tampering.",
    image: "static/images/ware house.jpeg",
    photos: ["Warehouse model overview", "Storage rack area", "Loading dock section", "Inventory dashboard"]
  }
];

const pages = document.querySelectorAll(".page");
const navLinks = document.getElementById("nav-links");
let currentDomain = domains[0];

function showPage(pageName) {
  pages.forEach((page) => page.classList.toggle("active", page.id === `page-${pageName}`));
  document.querySelectorAll(".nav-btn[data-page]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageName);
  });
  navLinks.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderDomains(filter = "all") {
  const grid = document.getElementById("domain-grid");
  grid.innerHTML = "";
  domains
    .filter((domain) => filter === "all" || domain.group === filter)
    .forEach((domain) => {
      const card = document.createElement("article");
      card.className = "domain-card reveal";
      card.style.setProperty("--accent", domain.accent);
      card.style.setProperty("--reveal-delay", `${Math.min(grid.children.length * 55, 420)}ms`);
      card.tabIndex = 0;
      card.innerHTML = `
        <h3>${domain.title}</h3>
        <p>${domain.summary}</p>
        <div class="tag-row">
          <span>About</span><span>Cybersecurity</span><span>Simulation</span>
        </div>
        <div class="card-action">Open Model</div>
      `;
      card.addEventListener("click", () => openDomain(domain.id));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") openDomain(domain.id);
      });
      card.addEventListener("pointermove", handleCardTilt);
      card.addEventListener("pointerleave", resetCardTilt);
      grid.appendChild(card);
    });
  observeReveals(grid);
}

function openDomain(id) {
  currentDomain = domains.find((domain) => domain.id === id) || domains[0];
  const currentIndex = domains.findIndex((domain) => domain.id === currentDomain.id);
  const nextDomain = domains[(currentIndex + 1) % domains.length];
  document.getElementById("detail-banner").style.setProperty("--detail-accent", currentDomain.accent.replace("0.9", "0.32"));
  document.getElementById("detail-category").textContent = currentDomain.group.replace("-", " ");
  document.getElementById("detail-title").textContent = currentDomain.title;
  document.getElementById("detail-summary").textContent = currentDomain.summary;
  document.getElementById("next-model-btn").textContent = `Next: ${nextDomain.title}`;
  const visual = document.getElementById("detail-visual");
  visual.className = `domain-visual visual-${currentDomain.id}`;
  visual.innerHTML = renderDomainVisual(currentDomain);
  document.getElementById("detail-overview").textContent = currentDomain.overview;
  document.getElementById("detail-red").textContent = currentDomain.red;
  document.getElementById("detail-blue").textContent = currentDomain.blue;
  document.getElementById("detail-twin").textContent = currentDomain.twin;
  document.getElementById("detail-analytics").textContent = currentDomain.analytics;
  document.getElementById("detail-simulation").textContent = currentDomain.simulation;
  document.getElementById("detail-features").innerHTML = currentDomain.features.map((feature) => `
    <article class="feature-item reveal">
      <h4>${feature}</h4>
      <p>Mapped to physical model signals, dashboard readings, training observations, and documentation notes.</p>
    </article>
  `).join("");

  renderPhotoPanel(currentDomain);
  observeReveals(document.getElementById("page-detail"));
  switchTab("about");
  showPage("detail");
}

function openNextDomain() {
  const currentIndex = domains.findIndex((domain) => domain.id === currentDomain.id);
  const nextDomain = domains[(currentIndex + 1) % domains.length];
  openDomain(nextDomain.id);
}

function renderPhotoPanel(domain) {
  const preview = document.getElementById("photo-preview");
  const list = document.getElementById("photo-list");
  if (!preview || !list) return;

  preview.classList.toggle("has-photo", Boolean(domain.image));
  if (domain.image) {
    preview.innerHTML = `
      <img class="model-photo" src="${domain.image}" alt="${domain.title} phygital lab model photo">
      <div class="photo-caption">
        <span>${domain.group.replace("-", " ")}</span>
        <strong>${domain.title} Scenario</strong>
      </div>
    `;
  } else {
    preview.innerHTML = `
      <span id="photo-icon">${domain.icon}</span>
      <strong id="photo-title">${domain.title} photo slots ready</strong>
      <p>Place your photos in <code>static/images/</code> and I can connect them to this section.</p>
    `;
  }

  list.innerHTML = domain.photos.map((photo) => `<li>${photo}</li>`).join("");
}

function openCyberScenario(mode) {
  const url = `/scenario.html?domain=${encodeURIComponent(currentDomain.id)}&mode=${encodeURIComponent(mode)}`;
  window.open(url, "_blank", "noopener");
}

function renderDomainVisual(domain) {
  const scenes = {
    airport: `
      <svg class="scene-svg airport-scene" viewBox="0 0 360 210" role="img" aria-label="Animated airport model">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#122940"></stop>
            <stop offset="1" stop-color="#071018"></stop>
          </linearGradient>
          <linearGradient id="runwayGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#2f3742"></stop>
            <stop offset=".5" stop-color="#555f6c"></stop>
            <stop offset="1" stop-color="#252d37"></stop>
          </linearGradient>
          <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"></stop>
            <stop offset=".55" stop-color="#cfeeff"></stop>
            <stop offset="1" stop-color="#4dd8ff"></stop>
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#000000" flood-opacity=".38"></feDropShadow>
          </filter>
        </defs>
        <rect class="scene-sky" x="0" y="0" width="360" height="210" rx="10" fill="url(#skyGrad)"></rect>
        <circle class="sun-glow" cx="302" cy="42" r="26"></circle>
        <rect class="scene-ground" x="0" y="150" width="360" height="60" rx="8"></rect>
        <rect class="runway" x="26" y="172" width="308" height="22" rx="4" fill="url(#runwayGrad)"></rect>
        <g class="runway-lines">
          <rect x="44" y="181" width="28" height="4"></rect><rect x="100" y="181" width="28" height="4"></rect>
          <rect x="156" y="181" width="28" height="4"></rect><rect x="212" y="181" width="28" height="4"></rect>
          <rect x="268" y="181" width="28" height="4"></rect>
        </g>
        <g class="terminal">
          <rect x="36" y="102" width="96" height="44" rx="6"></rect>
          <rect class="glass" x="50" y="112" width="15" height="14"></rect><rect class="glass" x="75" y="112" width="15" height="14"></rect><rect class="glass" x="100" y="112" width="15" height="14"></rect>
          <path class="jetbridge" d="M132 126h42v20h-42z"></path>
          <path class="tower" d="M198 144 V84 h22 v60 M192 84 h34 l-8-18 h-18z"></path>
        </g>
        <path class="flight-path" d="M46 88 C100 18 250 12 310 72 C354 116 272 142 214 112 C154 80 92 112 46 88"></path>
        <g class="flying-plane" filter="url(#softShadow)">
          <path d="M0 0 L54 13 L0 26 L9 15 L-22 15 L-22 11 L9 11 Z"></path>
          <path d="M7 11 L-8 -7 L11 9 Z"></path>
          <path d="M7 15 L-8 33 L11 17 Z"></path>
          <circle cx="30" cy="13" r="2.2"></circle>
        </g>
        <g class="cloud cloud-one"><ellipse cx="0" cy="0" rx="22" ry="9"></ellipse><ellipse cx="18" cy="-4" rx="14" ry="10"></ellipse></g>
        <g class="cloud cloud-two"><ellipse cx="0" cy="0" rx="18" ry="8"></ellipse><ellipse cx="15" cy="-4" rx="12" ry="9"></ellipse></g>
      </svg>`,
    hospital: `
      <svg class="scene-svg hospital-scene" viewBox="0 0 360 210">
        <defs>
          <linearGradient id="hospitalWall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#f7ffff"></stop>
            <stop offset="1" stop-color="#9fd8c5"></stop>
          </linearGradient>
          <filter id="hospitalShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity=".32"></feDropShadow>
          </filter>
        </defs>
        <rect class="scene-sky hospital-sky" x="0" y="0" width="360" height="210" rx="10"></rect>
        <rect class="scene-ground" x="0" y="154" width="360" height="56" rx="8"></rect>
        <g class="hospital-building-2d">
          <rect x="118" y="42" width="124" height="110" rx="8" filter="url(#hospitalShadow)"></rect>
          <rect x="154" y="18" width="52" height="44" rx="6"></rect>
          <path d="M176 28h8v12h12v8h-12v12h-8V48h-12v-8h12z"></path>
          <rect x="138" y="72" width="18" height="18"></rect><rect x="172" y="72" width="18" height="18"></rect><rect x="206" y="72" width="18" height="18"></rect>
          <rect x="138" y="106" width="18" height="18"></rect><rect x="172" y="106" width="18" height="18"></rect><rect x="206" y="106" width="18" height="18"></rect>
          <rect class="hospital-door" x="169" y="126" width="22" height="26" rx="4"></rect>
        </g>
        <path class="ecg-line" d="M38 44 H88 L98 28 L116 70 L132 38 L146 44 H318"></path>
        <g class="ambulance">
          <rect x="0" y="0" width="80" height="30" rx="5"></rect><rect x="52" y="-18" width="28" height="20" rx="4"></rect>
          <path d="M14 8h8v-8h8v8h8v8h-8v8h-8v-8h-8z"></path>
          <circle cx="18" cy="32" r="7"></circle><circle cx="64" cy="32" r="7"></circle>
        </g>
      </svg>`,
    metro: `
      <svg class="scene-svg metro-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="156" width="360" height="54" rx="8"></rect>
        <rect class="station" x="42" y="70" width="276" height="72" rx="8"></rect>
        <path class="track" d="M28 166 H332"></path><path class="track track-two" d="M28 184 H332"></path>
        <g class="metro-train">
          <rect x="0" y="0" width="138" height="42" rx="13"></rect>
          <rect x="18" y="9" width="26" height="14" rx="2"></rect><rect x="56" y="9" width="26" height="14" rx="2"></rect><rect x="94" y="9" width="26" height="14" rx="2"></rect>
          <circle cx="30" cy="43" r="6"></circle><circle cx="108" cy="43" r="6"></circle>
        </g>
      </svg>`,
    "water-treatment": `
      <svg class="scene-svg water-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <g class="tank tank-a"><rect x="54" y="62" width="78" height="96" rx="14"></rect><path class="tank-water" d="M58 124 Q76 112 94 124 T130 124 V154 H58z"></path></g>
        <g class="tank tank-b"><rect x="218" y="42" width="84" height="116" rx="14"></rect><path class="tank-water" d="M222 110 Q242 96 260 110 T298 110 V154 H222z"></path></g>
        <path class="pipe-flow" d="M132 116 H218"></path><circle class="pump-wheel" cx="176" cy="116" r="20"></circle>
      </svg>`,
    industry: `
      <svg class="scene-svg industry-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <path class="factory-body" d="M48 150 V90 L92 62 V90 L136 62 V90 L180 62 V150z"></path>
        <rect class="chimney" x="218" y="52" width="34" height="98" rx="3"></rect>
        <g class="smoke"><circle cx="235" cy="38" r="8"></circle><circle cx="250" cy="24" r="11"></circle><circle cx="268" cy="12" r="7"></circle></g>
        <rect class="conveyor" x="52" y="166" width="256" height="14" rx="7"></rect>
        <rect class="box-moving" x="0" y="140" width="32" height="26" rx="3"></rect>
      </svg>`,
    banking: `
      <svg class="scene-svg bank-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <g class="bank-building"><path d="M68 78 L180 24 L292 78 Z"></path><rect x="82" y="78" width="196" height="78" rx="4"></rect>
        <rect x="104" y="92" width="18" height="56"></rect><rect x="152" y="92" width="18" height="56"></rect><rect x="200" y="92" width="18" height="56"></rect><rect x="248" y="92" width="18" height="56"></rect></g>
        <g class="coin"><circle cx="0" cy="0" r="16"></circle><text x="-5" y="6">$</text></g>
      </svg>`,
    "power-grid": `
      <svg class="scene-svg grid-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <path class="tower-one" d="M78 154 L124 42 L170 154 M100 98 H148 M88 126 H160"></path>
        <path class="tower-two" d="M202 154 L246 58 L290 154 M220 106 H272 M210 132 H282"></path>
        <path class="power-line line-one" d="M124 44 C160 76 210 82 246 60"></path>
        <path class="power-line line-two" d="M102 98 C158 126 212 130 270 106"></path>
        <path class="bolt" d="M178 72 L158 112 H180 L162 150 L214 94 H188 Z"></path>
      </svg>`,
    "toll-plaza": `
      <svg class="scene-svg toll-scene" viewBox="0 0 360 210">
        <rect class="road" x="0" y="122" width="360" height="88" rx="8"></rect>
        <rect class="booth" x="148" y="48" width="64" height="72" rx="6"></rect>
        <rect class="gate-arm" x="210" y="82" width="110" height="8" rx="4"></rect>
        <g class="toll-car"><rect x="0" y="0" width="76" height="28" rx="14"></rect><circle cx="18" cy="29" r="6"></circle><circle cx="58" cy="29" r="6"></circle></g>
      </svg>`,
    "data-center": `
      <svg class="scene-svg dc-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <g class="server-racks"><rect x="70" y="42" width="58" height="116" rx="6"></rect><rect x="151" y="42" width="58" height="116" rx="6"></rect><rect x="232" y="42" width="58" height="116" rx="6"></rect></g>
        <g class="server-lights"><circle cx="92" cy="66" r="4"></circle><circle cx="173" cy="92" r="4"></circle><circle cx="254" cy="120" r="4"></circle></g>
        <path class="data-flow" d="M92 66 C130 22 210 22 254 120"></path>
      </svg>`,
    "stock-market": `
      <svg class="scene-svg market-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <polyline class="market-line" points="40,132 78,102 118,116 158,70 204,86 252,44 320,64"></polyline>
        <g class="bars"><rect x="62" y="112" width="28" height="46"></rect><rect x="130" y="86" width="28" height="72"></rect><rect x="198" y="98" width="28" height="60"></rect><rect x="266" y="58" width="28" height="100"></rect></g>
        <text class="ticker-text" x="42" y="42">LIVE MARKET</text>
      </svg>`,
    warehouse: `
      <svg class="scene-svg warehouse-scene" viewBox="0 0 360 210">
        <rect class="scene-ground" x="0" y="158" width="360" height="52" rx="8"></rect>
        <path class="warehouse-building" d="M52 150 V82 L180 34 L308 82 V150 Z"></path>
        <g class="boxes"><rect x="92" y="118" width="34" height="32"></rect><rect x="130" y="98" width="34" height="52"></rect><rect x="168" y="124" width="34" height="26"></rect></g>
        <g class="forklift"><rect x="0" y="0" width="58" height="28" rx="5"></rect><path d="M58 4 H82 V9 H64 V36 H58z"></path><circle cx="15" cy="30" r="6"></circle><circle cx="45" cy="30" r="6"></circle></g>
      </svg>`
  };
  return scenes[domain.id] || `<div class="visual-generic">${domain.title}</div>`;
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabName));
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.toggle("active", tab.id === `tab-${tabName}`));
}

function renderCyberScope() {
  const grid = document.getElementById("cyber-scope-grid");
  grid.innerHTML = domains.map((domain) => `
    <article class="cyber-scope-card reveal">
      <h3>${domain.title}</h3>
      <p>${domain.red}</p>
      <div class="cyber-actions">
        <button class="primary-action" type="button" data-icon="ctf" onclick="openCtfBoard('${domain.id}')">Open CTF</button>
      </div>
    </article>
  `).join("");
  [...grid.children].forEach((card, index) => card.style.setProperty("--reveal-delay", `${Math.min(index * 50, 400)}ms`));
  observeReveals(grid);
}

function handleCardTilt(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -7;
  card.style.setProperty("--tilt-x", `${x}deg`);
  card.style.setProperty("--tilt-y", `${y}deg`);
}

function resetCardTilt(event) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
}

function observeReveals(root = document) {
  const targets = [...root.querySelectorAll(".reveal:not(.visible)")];
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  targets.forEach((target) => observer.observe(target));
}

function openCtfBoard(domainId) {
  const domain = domains.find((item) => item.id === domainId) || domains[0];
  const overlay = document.getElementById("ctf-modal-overlay");
  document.getElementById("ctf-modal-title").textContent = `${domain.title} CTF Challenges`;
  document.getElementById("ctf-modal-subtitle").textContent = "Red Team / Blue Team training exercise";
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  CTF.renderBoard(domain.id, "ctf-domain-board");
}

function closeCtfBoard() {
  const overlay = document.getElementById("ctf-modal-overlay");
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  document.getElementById("ctf-domain-board").innerHTML = "";
}

function openDemoVideo() {
  const overlay = document.getElementById("video-modal-overlay");
  const video = document.getElementById("demo-video-player");
  const fallback = document.getElementById("demo-video-fallback");
  fallback.classList.remove("visible");
  video.src = "/static/videos/phygital-lab-demo.mp4";
  video.load();
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  video.play().catch(() => {});
}

function closeDemoVideo() {
  const overlay = document.getElementById("video-modal-overlay");
  const video = document.getElementById("demo-video-player");
  video.pause();
  video.removeAttribute("src");
  video.load();
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

function drawCanvas() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  let tick = 0;
  const animate = () => {
    tick += 0.006;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.strokeStyle = "rgba(77,216,255,0.12)";
    ctx.lineWidth = 1;
    const gap = 44;
    for (let x = -gap; x < window.innerWidth + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x + Math.sin(tick + x * 0.01) * 10, 0);
      ctx.lineTo(x + Math.cos(tick + x * 0.01) * 10, window.innerHeight);
      ctx.stroke();
    }
    for (let y = -gap; y < window.innerHeight + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.cos(tick + y * 0.01) * 10);
      ctx.lineTo(window.innerWidth, y + Math.sin(tick + y * 0.01) * 10);
      ctx.stroke();
    }
    requestAnimationFrame(animate);
  };
  animate();
}

function drawHomeMatrix() {
  const canvas = document.getElementById("home-matrix-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const glyphs = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&+-*/<>[]{}";
  let columns = [];
  let fontSize = 18;
  let lastFrame = 0;

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    fontSize = window.innerWidth < 720 ? 14 : 18;
    const count = Math.ceil(rect.width / fontSize);
    columns = Array.from({ length: count }, () => Math.random() * -rect.height);
  };

  const draw = (time) => {
    const homeVisible = document.getElementById("page-home")?.classList.contains("active");
    if (homeVisible && time - lastFrame > 38) {
      lastFrame = time;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.fillStyle = "rgba(7, 9, 13, 0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";

      columns.forEach((y, index) => {
        const x = index * fontSize;
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillStyle = Math.random() > 0.92 ? "rgba(255,255,255,0.96)" : "rgba(226,236,240,0.7)";
        ctx.shadowColor = "rgba(255,255,255,0.38)";
        ctx.shadowBlur = 9;
        ctx.fillText(char, x, y);

        columns[index] = y + fontSize;
        if (columns[index] > height + Math.random() * 260) {
          columns[index] = Math.random() * -220;
        }
      });
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

document.addEventListener("DOMContentLoaded", () => {
  renderDomains();
  renderCyberScope();
  drawCanvas();
  drawHomeMatrix();
  document.querySelectorAll(".overview-grid article, .hero-panel, .content-card, .feature-item, .cyber-card, .metric-grid div, .photo-placeholder, .photo-notes").forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index * 45, 360)}ms`);
  });
  observeReveals(document);

  document.querySelectorAll("[data-page]").forEach((item) => {
    item.addEventListener("click", () => showPage(item.dataset.page));
  });

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderDomains(button.dataset.filter);
    });
  });

  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  document.querySelectorAll(".cyber-mode-btn").forEach((button) => {
    button.addEventListener("click", () => openCyberScenario(button.dataset.cyberMode));
  });

  document.getElementById("next-model-btn").addEventListener("click", openNextDomain);

  document.getElementById("menu-toggle").addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  document.getElementById("ctf-modal-close-btn").addEventListener("click", closeCtfBoard);
  document.getElementById("ctf-modal-overlay").addEventListener("click", (event) => {
    if (event.target.id === "ctf-modal-overlay") closeCtfBoard();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCtfBoard();
  });

  document.getElementById("open-demo-btn").addEventListener("click", openDemoVideo);
  document.getElementById("video-modal-close-btn").addEventListener("click", closeDemoVideo);
  document.getElementById("demo-video-player").addEventListener("error", () => {
    document.getElementById("demo-video-fallback").classList.add("visible");
  });
  document.getElementById("video-modal-overlay").addEventListener("click", (event) => {
    if (event.target.id === "video-modal-overlay") closeDemoVideo();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDemoVideo();
  });

  const hashPage = window.location.hash.replace("#", "");
  if (hashPage === "models") showPage("domains");
  if (hashPage === "cyber") showPage("cyber");
});
