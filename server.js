const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5000);
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "phygital_ctf.json");
const adminPassword = process.env.ADMIN_PASSWORD || "cyberlancers@admin";
const adminSessions = new Set();

const domains = [
  ["airport", "Airport"],
  ["water-treatment", "Water Treatment"],
  ["industry", "Industrial"],
  ["hospital", "Hospital"],
  ["lift-house", "Lift House"],
  ["power-grid", "Power Grid"],
  ["toll-plaza", "Toll Plaza"],
  ["data-center", "Data Center"],
  ["stock-market", "Stock Market"],
  ["metro", "Metro"],
  ["traffic-lights", "Traffic Lights"]
];

const domainIds = domains.map(([id]) => id);
const legacyIndustryChallengeIds = new Set([
  "industry_001",
  "industry_002",
  "industry_003",
  "industry_mqtt_001",
  "industry_mqtt_002",
  "industry_mqtt_003",
  "industry_blue_001",
  "industry_blue_002",
  "industry_room_001",
  "industry_room_002",
  "industry_room_003",
  "industry_room_004",
  "industry_room_005",
  "industry_room_006",
  "industry_room_007",
  "industry_room_008",
  "industry_room_009",
  "industry_room_010"
]);
const legacyDataCenterChallengeIds = new Set([
  "data-center_001",
  "data-center_002",
  "data-center_003",
  "data_center_room_001",
  "data_center_room_002",
  "data_center_room_003",
  "data_center_room_004",
  "data_center_room_005",
  "data_center_room_006",
  "data_center_room_007",
  "data_center_hvac_001",
  "data_center_hvac_002",
  "data_center_hvac_003",
  "data_center_hvac_004",
  "data_center_hvac_005",
  "data_center_hvac_006",
  "data_center_hvac_007",
  "data_center_hvac_008",
  "data_center_hvac_009",
  "data_center_hvac_010",
  "data_center_hvac_011"
]);
const legacyWaterTreatmentChallengeIds = new Set([
  "water-treatment_001",
  "water-treatment_002",
  "water-treatment_003",
  "water_treatment_room_001",
  "water_treatment_room_002",
  "water_treatment_room_003",
  "water_treatment_room_004",
  "water_treatment_room_005",
  "water_treatment_room_006",
  "water_treatment_room_007",
  "water_treatment_room_008",
  "water_treatment_red_015",
  "water_treatment_red_016",
  "water_treatment_red_017",
  "water_treatment_red_018",
  "water_treatment_red_019",
  "water_treatment_red_020",
  "water_treatment_red_021"
]);
const legacyAirportChallengeIds = new Set([
  "airport_001",
  "airport_002",
  "airport_003"
]);
const legacyHospitalChallengeIds = new Set([
  "hospital_001",
  "hospital_002",
  "hospital_003"
]);
const legacyPowerGridChallengeIds = new Set([
  "power-grid_001",
  "power-grid_002",
  "power-grid_003"
]);
const legacyTollPlazaChallengeIds = new Set([
  "toll-plaza_001",
  "toll-plaza_002",
  "toll-plaza_003"
]);
const legacyStockMarketChallengeIds = new Set([
  "stock-market_001",
  "stock-market_002",
  "stock-market_003"
]);
const legacyMetroChallengeIds = new Set([
  "metro_001",
  "metro_002",
  "metro_003"
]);
const legacyWarehouseChallengeIds = new Set([
  "warehouse_001",
  "warehouse_002",
  "warehouse_003"
]);
const legacyTrafficLightsChallengeIds = new Set([
  "traffic-lights_001",
  "traffic-lights_002",
  "traffic-lights_003"
]);
const legacyBankingChallengeIds = new Set([
  "banking_001",
  "banking_002",
  "banking_003"
]);

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

seedChallenges.airport = [
  {
    id: "airport_room_001",
    category: "airport",
    title: "Task 1 - Airport Door Room Briefing",
    description: "You are investigating Airport door PLCs that expose OPC UA services. Open the Airport Red Team scenario page and identify the three approved PLC IP addresses for the door-control lab.",
    points: 50,
    flag: "FLAG{airport_opcua_room_started}",
    hint: "The scenario commands list all three Airport door PLC targets."
  },
  {
    id: "airport_room_002",
    category: "airport",
    title: "Task 2 - OPC UA Port Discovery",
    description: "Run the approved lab scan against the Airport door PLCs and identify the TCP port used by OPC UA.",
    points: 100,
    flag: "FLAG{airport_opcua_tcp_4840}",
    hint: "The scan command targets one OPC UA port on the PLCs."
  },
  {
    id: "airport_room_003",
    category: "airport",
    title: "Task 3 - Door PLC Targets",
    description: "Identify the three Airport PLC IP addresses documented for the OPC UA door-control drill.",
    points: 150,
    flag: "FLAG{airport_plcs_123_124_125}",
    hint: "The targets end in .123, .124, and .125."
  },
  {
    id: "airport_room_004",
    category: "airport",
    title: "Task 4 - OPC UA Client Validation",
    description: "Use UAExpert or another approved OPC UA client to connect to the PLC endpoint and determine whether authentication is required before browsing objects.",
    points: 150,
    flag: "FLAG{airport_uaexpert_auth_check}",
    hint: "This step validates whether anonymous access is blocked and credentials are needed."
  },
  {
    id: "airport_room_005",
    category: "airport",
    title: "Task 5 - Credential Audit Tool",
    description: "Identify the approved OPC UA vulnerability scanner used in the lab to audit weak OPC UA credentials with a username:password dictionary.",
    points: 150,
    flag: "FLAG{airport_opalopc_scanner}",
    hint: "The command starts with the tool name before -vv."
  },
  {
    id: "airport_room_006",
    category: "airport",
    title: "Task 6 - Dictionary Format",
    description: "Identify the required brute-force dictionary format used by the approved OPC UA credential audit.",
    points: 150,
    flag: "FLAG{airport_username_password_format}",
    hint: "The scenario says the dictionary should store each entry as username:password."
  },
  {
    id: "airport_room_007",
    category: "airport",
    title: "Task 7 - Report Review",
    description: "After opalopc completes, identify which report format students should open to find the recovered lab credentials.",
    points: 150,
    flag: "FLAG{airport_html_report_review}",
    hint: "The scenario mentions that opalopc generates a report in this format."
  },
  {
    id: "airport_room_008",
    category: "airport",
    title: "Task 8 - Door Object Discovery",
    description: "After authenticating with the OPC UA client, identify the object students browse to in order to find the airport door control value.",
    points: 200,
    flag: "FLAG{airport_objects_door}",
    hint: "Under Objects, the scenario says to select this object."
  },
  {
    id: "airport_room_009",
    category: "airport",
    title: "Task 9 - Safe Recovery",
    description: "After changing a Door value and observing movement, identify the required final safety action before ending the drill.",
    points: 200,
    flag: "FLAG{airport_restore_safe_door_state}",
    hint: "The Blue Team playbook requires restoring the approved safe door state."
  },
  {
    id: "airport_room_010",
    category: "airport",
    title: "Task 10 - OPC UA Hardening Plan",
    description: "Recommend the key protections for Airport door PLCs: disable anonymous access, remove weak credentials, restrict TCP/4840, segment PLCs, and alert on OPC UA write operations or brute-force attempts.",
    points: 250,
    flag: "FLAG{airport_opcua_hardening}",
    hint: "Look at the Airport Blue Team hardening checklist."
  },
  {
    id: "airport_baggage_001",
    category: "airport",
    title: "Task 11 - Baggage Reclaim Target",
    description: "Identify the Airport baggage reclaim PLC IP address and protocol used for the reclaim-belt lab.",
    points: 100,
    flag: "FLAG{airport_baggage_172_16_17_130_opcua}",
    hint: "The baggage reclaim system uses OPC UA on one PLC ending in .130."
  },
  {
    id: "airport_baggage_002",
    category: "airport",
    title: "Task 12 - Baggage Reclaim Port",
    description: "Run the approved scan against the baggage reclaim PLC and identify the TCP port where OPC UA is exposed.",
    points: 100,
    flag: "FLAG{airport_baggage_tcp_4840}",
    hint: "Use the same OPC UA port used by the Airport door PLCs."
  },
  {
    id: "airport_baggage_003",
    category: "airport",
    title: "Task 13 - Reclaim Belt Object",
    description: "After connecting with recovered credentials in an OPC UA client, identify the object area students inspect to find the value that controls the baggage reclaim belt.",
    points: 200,
    flag: "FLAG{airport_reclaim_belt_object}",
    hint: "Browse Objects and locate the control for the reclaim belt."
  },
  {
    id: "airport_baggage_004",
    category: "airport",
    title: "Task 14 - Baggage Reclaim Recovery",
    description: "Explain the required safety action after changing the baggage reclaim belt value and observing the effect on the physical model.",
    points: 200,
    flag: "FLAG{airport_baggage_restore_safe_state}",
    hint: "The drill should never end with the belt left in an unsafe or unexpected state."
  },
  {
    id: "airport_mqtt_001",
    category: "airport",
    title: "Task 15 - MQTT Target Identification",
    description: "Identify the two Airport MQTT-related IP addresses used for airplane parking and air-quality sensor telemetry.",
    points: 150,
    flag: "FLAG{airport_mqtt_101_207}",
    hint: "The airplane parking IP is in 172.16.20.0/24 and the air sensor IP is in 172.16.17.0/24."
  },
  {
    id: "airport_mqtt_002",
    category: "airport",
    title: "Task 16 - MQTT Port Discovery",
    description: "Run the approved scan against the Airport MQTT targets and identify the port used by the insecure MQTT service.",
    points: 100,
    flag: "FLAG{airport_mqtt_tcp_1883}",
    hint: "MQTT commonly listens on this TCP port."
  },
  {
    id: "airport_mqtt_003",
    category: "airport",
    title: "Task 17 - Wildcard Subscription",
    description: "Identify the MQTT wildcard topic used to subscribe to all visible topics during the Airport telemetry discovery step.",
    points: 150,
    flag: "FLAG{airport_mqtt_wildcard_hash}",
    hint: "The mosquitto_sub command uses a single-character wildcard wrapped in quotes."
  },
  {
    id: "airport_mqtt_004",
    category: "airport",
    title: "Task 18 - Topic Evidence",
    description: "Observe the MQTT stream and document why topic names and payload formats must be collected before publishing any lab-only false data.",
    points: 200,
    flag: "FLAG{airport_mqtt_topic_mapping_first}",
    hint: "Students should not guess payloads; they should learn the topic and value format from observed traffic."
  },
  {
    id: "airport_mqtt_005",
    category: "airport",
    title: "Task 19 - MQTT Blue Team Control",
    description: "Recommend the main MQTT controls that prevent unauthorized airplane parking or air-quality telemetry spoofing.",
    points: 250,
    flag: "FLAG{airport_mqtt_auth_acl_segmentation}",
    hint: "Think authentication, topic ACLs, trusted publishers, network segmentation, and alerts."
  },
  {
    id: "airport_mqtt_006",
    category: "airport",
    title: "Task 20 - Airport Multi-System Incident Report",
    description: "Write the final Airport incident summary covering affected systems, evidence collected, safe-state restoration, and hardening actions for OPC UA, MQTT, kiosk HTTP MITM, and billboard FTP/media workflow risk.",
    points: 300,
    flag: "FLAG{airport_multisystem_report_complete}",
    hint: "Include doors, baggage reclaim, airplane parking, air-quality telemetry, kiosk PNR responses, and billboard media handling."
  },
  {
    id: "airport_kiosk_001",
    category: "airport",
    title: "Task 21 - Kiosk Target Identification",
    description: "Identify the Airport kiosk IP address, protocol, and port used for the HTTP MITM lab.",
    points: 100,
    flag: "FLAG{airport_kiosk_172_16_17_112_http_80}",
    hint: "The kiosk section lists one IP address and uses HTTP."
  },
  {
    id: "airport_kiosk_002",
    category: "airport",
    title: "Task 22 - Kiosk MITM Pair",
    description: "Identify the two IP addresses used in the authorized ARP poisoning step for the Airport kiosk exercise.",
    points: 150,
    flag: "FLAG{airport_kiosk_mitm_112_100}",
    hint: "The ARP poisoning step targets the kiosk and the paired host ending in .100."
  },
  {
    id: "airport_kiosk_003",
    category: "airport",
    title: "Task 23 - Traffic Forwarding Rule",
    description: "Identify the local proxy port used when forwarding kiosk HTTP traffic to mitmproxy.",
    points: 150,
    flag: "FLAG{airport_kiosk_mitmproxy_8080}",
    hint: "The iptables DNAT rule forwards destination port 80 traffic to this port."
  },
  {
    id: "airport_kiosk_004",
    category: "airport",
    title: "Task 24 - Response Tampering Logic",
    description: "Review the kiosk response-tampering script and identify the JSON field used to decide whether a PNR lookup succeeded or failed.",
    points: 200,
    flag: "FLAG{airport_kiosk_success_field}",
    hint: "The script checks for success values of 1 and 0."
  },
  {
    id: "airport_kiosk_005",
    category: "airport",
    title: "Task 25 - Kiosk Cleanup And Defense",
    description: "Identify the cleanup and defense actions after kiosk MITM testing: stop mitmproxy, clear iptables forwarding, stop ARP poisoning, validate legitimate PNR responses, and harden against ARP/HTTP response tampering.",
    points: 250,
    flag: "FLAG{airport_kiosk_cleanup_and_defense}",
    hint: "The post-testing commands flush iptables and NAT rules."
  },
  {
    id: "airport_billboard_001",
    category: "airport",
    title: "Task 26 - Billboard FTP Enumeration",
    description: "Enumerate the Airport billboard host and identify the service and script category used to test for anonymous FTP exposure.",
    points: 100,
    flag: "FLAG{airport_billboard_ftp_anon_enum}",
    hint: "Use an FTP anonymous-access NSE check during enumeration."
  },
  {
    id: "airport_billboard_002",
    category: "airport",
    title: "Task 27 - Anonymous Upload Risk",
    description: "Document why anonymous FTP upload is dangerous for a billboard media workflow and what evidence proves the risk in the lab.",
    points: 150,
    flag: "FLAG{airport_billboard_anonymous_upload_risk}",
    hint: "Focus on whether a user can place media into a workflow without authentication."
  },
  {
    id: "airport_billboard_003",
    category: "airport",
    title: "Task 28 - Video Workflow Review",
    description: "Identify the media-management script or workflow that processes uploaded billboard videos and explain why its execution context matters.",
    points: 200,
    flag: "FLAG{airport_billboard_video_workflow_review}",
    hint: "The important evidence is what processes uploaded videos and what privileges it runs with."
  },
  {
    id: "airport_billboard_004",
    category: "airport",
    title: "Task 29 - Privilege Boundary Finding",
    description: "Explain the privilege-boundary issue demonstrated by the billboard workflow without leaving any unauthorized files or elevated changes behind.",
    points: 250,
    flag: "FLAG{airport_billboard_privilege_boundary}",
    hint: "Look for unsafe automation, unsafe library paths, or write permissions that cross a trust boundary."
  },
  {
    id: "airport_billboard_005",
    category: "airport",
    title: "Task 30 - Billboard Blue Team Plan",
    description: "Recommend the key billboard defenses: disable anonymous FTP, restrict upload paths, validate media, run processors with least privilege, monitor upload logs, and restore approved content.",
    points: 250,
    flag: "FLAG{airport_billboard_blue_team_plan}",
    hint: "A strong answer covers access control, file validation, least privilege, monitoring, and cleanup."
  }
];

seedChallenges.hospital = [
  {
    id: "hospital_room_001",
    category: "hospital",
    title: "Task 1 - OpenEMR Room Briefing",
    description: "You are investigating a Hospital OpenEMR application exposed on the lab network. Open the Hospital Red Team scenario page and identify the OpenEMR URL used for this exercise.",
    points: 50,
    flag: "FLAG{hospital_openemr_room_started}",
    hint: "The Hospital scenario links directly to the OpenEMR application."
  },
  {
    id: "hospital_room_002",
    category: "hospital",
    title: "Task 2 - Target Service",
    description: "Identify the TCP port and protocol used by the public-facing Hospital OpenEMR web application.",
    points: 100,
    flag: "FLAG{hospital_tcp_80_http}",
    hint: "The OpenEMR URL uses plain HTTP."
  },
  {
    id: "hospital_room_003",
    category: "hospital",
    title: "Task 3 - Version Enumeration",
    description: "Enumerate the Hospital web application and identify the OpenEMR version associated with the approved exploit reference.",
    points: 150,
    flag: "FLAG{hospital_openemr_5_0_1}",
    hint: "The scenario brief names the vulnerable OpenEMR version."
  },
  {
    id: "hospital_room_004",
    category: "hospital",
    title: "Task 4 - Authenticated Attack Path",
    description: "Identify the vulnerability class for the Hospital OpenEMR drill and whether it requires credentials before exploitation.",
    points: 150,
    flag: "FLAG{hospital_authenticated_rce}",
    hint: "The vulnerability field in the scenario says authenticated RCE."
  },
  {
    id: "hospital_room_005",
    category: "hospital",
    title: "Task 5 - Lab Account",
    description: "Identify the lab account used to validate the authenticated OpenEMR attack path.",
    points: 150,
    flag: "FLAG{hospital_sahil_sahil}",
    hint: "The scenario lists the accountant credentials."
  },
  {
    id: "hospital_room_006",
    category: "hospital",
    title: "Task 6 - Listener Port",
    description: "Identify the listener port used by the attacker machine during the approved reverse-shell validation drill.",
    points: 150,
    flag: "FLAG{hospital_listener_4444}",
    hint: "Look at the nc listener command in the scenario."
  },
  {
    id: "hospital_room_007",
    category: "hospital",
    title: "Task 7 - phpMyAdmin Config Path",
    description: "After authorized lab access, identify the configuration file path students inspect to find phpMyAdmin database credentials.",
    points: 200,
    flag: "FLAG{hospital_phpmyadmin_config_path}",
    hint: "The path starts with C:\\Apache24\\htdocs\\phpMyAdmin."
  },
  {
    id: "hospital_room_008",
    category: "hospital",
    title: "Task 8 - Database Credential",
    description: "Identify the phpMyAdmin database credential found in the training scenario.",
    points: 200,
    flag: "FLAG{hospital_root_hacker_123}",
    hint: "The scenario lists the phpMyAdmin lab credential."
  },
  {
    id: "hospital_room_009",
    category: "hospital",
    title: "Task 9 - Patient Safety Impact",
    description: "Identify the patient-safety impact demonstrated by the database access portion of the Hospital scenario.",
    points: 200,
    flag: "FLAG{hospital_medication_tampering}",
    hint: "The final Red Team step changes a patient-related table."
  },
  {
    id: "hospital_room_010",
    category: "hospital",
    title: "Task 10 - Hospital Hardening Plan",
    description: "Recommend the key protections: upgrade OpenEMR, remove weak shared accounts, restrict phpMyAdmin, rotate database credentials, enforce least privilege, and alert on medication table changes.",
    points: 250,
    flag: "FLAG{hospital_openemr_hardening}",
    hint: "Use the Hospital Blue Team hardening checklist."
  }
];

seedChallenges["lift-house"] = [
  {
    id: "lift_house_room_001",
    category: "lift-house",
    title: "Task 1 - Lift House Room Briefing",
    description: "You are investigating the Lift House model where gas sensor data is transported over WebSocket and fire sensor data can be observed over CoAP. Open the Lift House Red Team scenario page and identify the two gas sensor IP addresses.",
    points: 50,
    flag: "FLAG{lift_house_room_started}",
    hint: "The gas sensor section lists two IP addresses."
  },
  {
    id: "lift_house_room_002",
    category: "lift-house",
    title: "Task 2 - Gas Sensor Targets",
    description: "Identify the two IP addresses involved in the Lift House gas sensor WebSocket attack path.",
    points: 100,
    flag: "FLAG{lift_house_gas_207_104}",
    hint: "The target pair ends in .207 and .104."
  },
  {
    id: "lift_house_room_003",
    category: "lift-house",
    title: "Task 3 - WebSocket Endpoint",
    description: "Identify the WebSocket endpoint path used in the sample gas sensor false-data injection program.",
    points: 150,
    flag: "FLAG{lift_house_ws_gas_h2}",
    hint: "Look at the URI in the sample WebSocket program."
  },
  {
    id: "lift_house_room_004",
    category: "lift-house",
    title: "Task 4 - Fake Gas Payload",
    description: "Identify the sample fake payload used to simulate a very high H2 gas reading.",
    points: 150,
    flag: "FLAG{lift_house_h2_99_99}",
    hint: "The payload starts with H2 and contains the high value 99.99."
  },
  {
    id: "lift_house_room_005",
    category: "lift-house",
    title: "Task 5 - Fire Sensor Protocol",
    description: "Identify the protocol and port used by the Lift House fire sensor MITM exercise.",
    points: 150,
    flag: "FLAG{lift_house_coap_5684}",
    hint: "The fire sensor section lists CoAP and the port."
  },
  {
    id: "lift_house_room_006",
    category: "lift-house",
    title: "Task 6 - Fire Sensor Server",
    description: "Identify the server IP address used as target 1 during the fire sensor CoAP MITM exercise.",
    points: 150,
    flag: "FLAG{lift_house_fire_server_172_16_17_113}",
    hint: "The fire sensor section labels this IP as Server."
  },
  {
    id: "lift_house_room_007",
    category: "lift-house",
    title: "Task 7 - CoAP Packet Filter",
    description: "Identify the Wireshark display filter used to focus only on CoAP traffic during the fire sensor exercise.",
    points: 150,
    flag: "FLAG{lift_house_wireshark_coap}",
    hint: "The scenario says to apply this filter in Wireshark."
  },
  {
    id: "lift_house_room_008",
    category: "lift-house",
    title: "Task 8 - Ettercap Filter Logic",
    description: "Identify the value replacement shown in the sample ettercap filter for the fire sensor MITM drill.",
    points: 200,
    flag: "FLAG{lift_house_true_to_false}",
    hint: "The sample filter replaces one boolean value with another."
  },
  {
    id: "lift_house_room_009",
    category: "lift-house",
    title: "Task 9 - Filter Compilation",
    description: "Identify the command-line tool used to compile coap_filter.ecf into coap_filter.ef.",
    points: 150,
    flag: "FLAG{lift_house_etterfilter}",
    hint: "The command starts with this tool name."
  },
  {
    id: "lift_house_room_010",
    category: "lift-house",
    title: "Task 10 - Lift House Hardening Plan",
    description: "Recommend protections for Lift House sensors: prevent ARP spoofing, segment sensor networks, authenticate WebSocket publishers, protect CoAP traffic, validate sensor ranges, and alert on impossible gas or fire-state changes.",
    points: 250,
    flag: "FLAG{lift_house_sensor_hardening}",
    hint: "Use the Lift House Blue Team hardening checklist."
  },
  {
    id: "lift_house_elevator_001",
    category: "lift-house",
    title: "Task 11 - Elevator PLC Discovery",
    description: "Identify the Lift House elevator PLC target and the protocol used for the elevator control drill.",
    points: 100,
    flag: "FLAG{lift_house_elevator_modbus_plc}",
    hint: "The Elevator section lists a PLC IP and Modbus Application Protocol."
  },
  {
    id: "lift_house_elevator_002",
    category: "lift-house",
    title: "Task 12 - Modbus Port Discovery",
    description: "Run the approved port scan against the elevator PLC and identify the TCP port exposing Modbus Application Protocol.",
    points: 100,
    flag: "FLAG{lift_house_elevator_tcp_502}",
    hint: "The scan command targets the standard Modbus TCP port."
  },
  {
    id: "lift_house_elevator_003",
    category: "lift-house",
    title: "Task 13 - Modbus Client Module",
    description: "Identify the Metasploit auxiliary module used to read Lift House elevator Modbus register values.",
    points: 150,
    flag: "FLAG{lift_house_modbusclient_module}",
    hint: "The module path ends with scada/modbusclient."
  },
  {
    id: "lift_house_elevator_004",
    category: "lift-house",
    title: "Task 14 - Floor Register Mapping",
    description: "Capture elevator register values while someone controls the elevator and identify the register addresses tested for different floors.",
    points: 200,
    flag: "FLAG{lift_house_floor_registers_0_1_2_3_4}",
    hint: "The exercise repeats data_address values from 0 through 4."
  },
  {
    id: "lift_house_elevator_005",
    category: "lift-house",
    title: "Task 15 - Safe Write Validation",
    description: "Explain why students should only use captured safe floor values when testing write_register actions against the elevator PLC.",
    points: 250,
    flag: "FLAG{lift_house_safe_floor_write_only}",
    hint: "The safe value must come from observed dashboard-driven elevator behavior."
  },
  {
    id: "lift_house_elevator_006",
    category: "lift-house",
    title: "Task 16 - Elevator Blue Team Hardening",
    description: "Recommend protections for the elevator PLC: restrict TCP/502, segment the PLC network, allow only trusted HMI/SCADA hosts, log register activity, and alert on write_register operations or unexpected floor changes.",
    points: 250,
    flag: "FLAG{lift_house_elevator_modbus_hardening}",
    hint: "Use the Elevator Blue Team response checklist."
  }
];

seedChallenges["power-grid"] = [
  {
    id: "power_grid_room_001",
    category: "power-grid",
    title: "Task 1 - Power Grid Room Briefing",
    description: "You are investigating a Power Grid model with internally exposed ISO-TSAP/S7 communication. Open the Power Grid Red Team scenario page and identify the dashboard used for observation.",
    points: 50,
    flag: "FLAG{power_grid_room_started}",
    hint: "The scenario page links the Power Grid dashboard."
  },
  {
    id: "power_grid_room_002",
    category: "power-grid",
    title: "Task 2 - Protocol Identification",
    description: "Identify the insecure internally exposed protocol family used in the Power Grid exercise.",
    points: 100,
    flag: "FLAG{power_grid_iso_tsap}",
    hint: "The protocol is commonly associated with Siemens S7 communication."
  },
  {
    id: "power_grid_room_003",
    category: "power-grid",
    title: "Task 3 - Port Discovery",
    description: "Run the approved scan against the Power Grid controller and identify the TCP port used by ISO-TSAP/S7 communication.",
    points: 100,
    flag: "FLAG{power_grid_tcp_102}",
    hint: "The scenario lists TCP/102."
  },
  {
    id: "power_grid_room_004",
    category: "power-grid",
    title: "Task 4 - Exploit Concept",
    description: "Identify the command concept demonstrated by the Power Grid lab tool and explain why it is unsafe on exposed controllers.",
    points: 150,
    flag: "FLAG{power_grid_s7comm_stop_risk}",
    hint: "The scenario refers to an S7COMM STOP command risk."
  },
  {
    id: "power_grid_room_005",
    category: "power-grid",
    title: "Task 5 - Tool Reference",
    description: "Identify the approved lab tool repository used for the Power Grid S7 communication drill.",
    points: 150,
    flag: "FLAG{power_grid_simatic_smackdown}",
    hint: "The GitHub repository name appears in the Red Team tool review section."
  },
  {
    id: "power_grid_room_006",
    category: "power-grid",
    title: "Task 6 - Build Step",
    description: "Identify the build command used before running the approved Power Grid lab tool.",
    points: 100,
    flag: "FLAG{power_grid_make_build}",
    hint: "The build command uses make."
  },
  {
    id: "power_grid_room_007",
    category: "power-grid",
    title: "Task 7 - Dashboard Evidence",
    description: "During the controlled simulation, identify which dashboard evidence students should record for relay, generation, load, or controller state impact.",
    points: 200,
    flag: "FLAG{power_grid_dashboard_evidence}",
    hint: "Record timestamp, observed effect, and affected state."
  },
  {
    id: "power_grid_room_008",
    category: "power-grid",
    title: "Task 8 - Safe Recovery",
    description: "Identify the required recovery action after a Power Grid controller stop or unsafe state is observed during the lab.",
    points: 200,
    flag: "FLAG{power_grid_restore_run_state}",
    hint: "Use the approved operator workflow to restore normal state."
  },
  {
    id: "power_grid_room_009",
    category: "power-grid",
    title: "Task 9 - Blue Team Detection",
    description: "Identify the main network and process indicators the Blue Team should monitor for this Power Grid ISO-TSAP/S7 exercise.",
    points: 200,
    flag: "FLAG{power_grid_detect_tcp102_s7}",
    hint: "Think TCP/102 connections and S7COMM stop/write indicators."
  },
  {
    id: "power_grid_room_010",
    category: "power-grid",
    title: "Task 10 - Power Grid Hardening Plan",
    description: "Recommend key protections: restrict TCP/102 to trusted engineering hosts, segment Power Grid PLCs, disable unnecessary ISO-TSAP exposure, alert on S7 STOP/write actions, and document recovery SOPs.",
    points: 250,
    flag: "FLAG{power_grid_iso_tsap_hardening}",
    hint: "Use the Power Grid Blue Team hardening checklist."
  }
];

seedChallenges["toll-plaza"] = [
  {
    id: "toll_plaza_room_001",
    category: "toll-plaza",
    title: "Task 1 - Toll Plaza Room Briefing",
    description: "You are investigating a Toll Plaza RFID reader that accepts vulnerable lab RFID cards. Open the Toll Plaza Red Team scenario page and identify the dashboard used for observation.",
    points: 50,
    flag: "FLAG{toll_plaza_room_started}",
    hint: "The scenario page links the Toll Plaza dashboard."
  },
  {
    id: "toll_plaza_room_002",
    category: "toll-plaza",
    title: "Task 2 - Target Identification",
    description: "Identify the target device in the Toll Plaza RFID cloning exercise.",
    points: 100,
    flag: "FLAG{toll_plaza_rfid_reader}",
    hint: "The target is the reader at the toll lane."
  },
  {
    id: "toll_plaza_room_003",
    category: "toll-plaza",
    title: "Task 3 - Protocol Family",
    description: "Identify the RFID card protocol family used in the Toll Plaza lab.",
    points: 100,
    flag: "FLAG{toll_plaza_rfid_mifare}",
    hint: "The scenario lists RFID MIFARE."
  },
  {
    id: "toll_plaza_room_004",
    category: "toll-plaza",
    title: "Task 4 - Vulnerability Class",
    description: "Identify the core vulnerability class demonstrated when a lab RFID card can be read and copied to another writable card.",
    points: 150,
    flag: "FLAG{toll_plaza_vulnerable_rfid_cards}",
    hint: "The issue is cloneable card data."
  },
  {
    id: "toll_plaza_room_005",
    category: "toll-plaza",
    title: "Task 5 - Read Evidence",
    description: "During the read step, identify what evidence students should record before writing any cloned test card.",
    points: 150,
    flag: "FLAG{toll_plaza_card_read_evidence}",
    hint: "Record card identifier, timestamp, reader response, and dashboard event."
  },
  {
    id: "toll_plaza_room_006",
    category: "toll-plaza",
    title: "Task 6 - Write Test Card",
    description: "Identify the type of card used during the lab write phase and why it must remain inside the approved lab exercise.",
    points: 150,
    flag: "FLAG{toll_plaza_writable_lab_card}",
    hint: "The scenario says to use an approved writable RFID lab card."
  },
  {
    id: "toll_plaza_room_007",
    category: "toll-plaza",
    title: "Task 7 - Access Simulation",
    description: "Use the approved cloned test card at the toll reader and identify the dashboard behavior that proves unauthorized access risk.",
    points: 200,
    flag: "FLAG{toll_plaza_cloned_card_access}",
    hint: "Watch lane, payment, and barrier behavior."
  },
  {
    id: "toll_plaza_room_008",
    category: "toll-plaza",
    title: "Task 8 - Blue Team Detection",
    description: "Identify the main dashboard indicators that help detect cloned or replayed RFID card behavior.",
    points: 200,
    flag: "FLAG{toll_plaza_duplicate_card_detection}",
    hint: "Look for repeated card IDs, impossible timing, and barrier events without valid payment context."
  },
  {
    id: "toll_plaza_room_009",
    category: "toll-plaza",
    title: "Task 9 - Containment",
    description: "Identify the immediate containment actions after cloned-card behavior is confirmed in the Toll Plaza lab.",
    points: 200,
    flag: "FLAG{toll_plaza_revoke_cloned_card}",
    hint: "Remove the cloned card and block or revoke the affected test-card identifier."
  },
  {
    id: "toll_plaza_room_010",
    category: "toll-plaza",
    title: "Task 10 - RFID Hardening Plan",
    description: "Recommend key Toll Plaza RFID protections: diversified keys, mutual authentication where supported, challenge-response cards, transaction binding, anti-passback checks, and duplicate-card alerting.",
    points: 250,
    flag: "FLAG{toll_plaza_rfid_hardening}",
    hint: "Use the Toll Plaza Blue Team hardening checklist."
  }
];

seedChallenges["stock-market"] = [
  {
    id: "stock_market_room_001",
    category: "stock-market",
    title: "Task 1 - Stock Market Room Briefing",
    description: "You are investigating a Stock Market training scenario involving phishing-led ransomware simulation and billboard media workflow risk. Open the Stock Market Red Team scenario page and identify the training mailbox.",
    points: 50,
    flag: "FLAG{stock_market_room_started}",
    hint: "The Red Team page lists the training mailbox."
  },
  {
    id: "stock_market_room_002",
    category: "stock-market",
    title: "Task 2 - Phishing Target Mailbox",
    description: "Identify the approved mailbox used only for the Stock Market phishing-awareness drill.",
    points: 100,
    flag: "FLAG{stock_exchange_training_mailbox}",
    hint: "The mailbox address appears in the Phishing Awareness Setup section."
  },
  {
    id: "stock_market_room_003",
    category: "stock-market",
    title: "Task 3 - Ransomware Test File",
    description: "Identify the approved test file used by the classroom ransomware simulator.",
    points: 100,
    flag: "FLAG{stock_market_secret_dat}",
    hint: "The file path ends with secret.dat."
  },
  {
    id: "stock_market_room_004",
    category: "stock-market",
    title: "Task 4 - Recovery Key Evidence",
    description: "Identify the file path used to store the classroom recovery key and IV for the ransomware simulation.",
    points: 150,
    flag: "FLAG{stock_market_encryption_key_bin}",
    hint: "The key file path ends with encryption_key.bin."
  },
  {
    id: "stock_market_room_005",
    category: "stock-market",
    title: "Task 5 - Phishing Impact Evidence",
    description: "Identify the key evidence students should record when reviewing the phishing attachment execution chain.",
    points: 150,
    flag: "FLAG{stock_market_attachment_execution_evidence}",
    hint: "Look for download, execution, test-file change, and endpoint/mail alert evidence."
  },
  {
    id: "stock_market_room_006",
    category: "stock-market",
    title: "Task 6 - Billboard FTP Enumeration",
    description: "Identify the enumeration method used to check for anonymous FTP exposure in the Stock Market billboard workflow.",
    points: 100,
    flag: "FLAG{stock_market_billboard_ftp_anon}",
    hint: "The command uses the ftp-anon NSE script."
  },
  {
    id: "stock_market_room_007",
    category: "stock-market",
    title: "Task 7 - Media Workflow Risk",
    description: "Explain why anonymous uploads and unsafe media processing can compromise billboard content.",
    points: 200,
    flag: "FLAG{stock_market_billboard_media_risk}",
    hint: "Focus on untrusted uploads being processed into approved display content."
  },
  {
    id: "stock_market_room_008",
    category: "stock-market",
    title: "Task 8 - Blue Team Containment",
    description: "Identify the immediate containment actions for the phishing/ransomware simulation.",
    points: 200,
    flag: "FLAG{stock_market_isolate_block_stop}",
    hint: "Isolate the workstation, block the attachment, and stop the simulator process."
  },
  {
    id: "stock_market_room_009",
    category: "stock-market",
    title: "Task 9 - Recovery Validation",
    description: "Identify how Blue Team validates recovery after the ransomware simulation.",
    points: 200,
    flag: "FLAG{stock_market_restore_validate_hash}",
    hint: "Restore the approved test file and validate content/hash."
  },
  {
    id: "stock_market_room_010",
    category: "stock-market",
    title: "Task 10 - Stock Market Hardening Plan",
    description: "Recommend key controls: mail filtering, attachment sandboxing, user reporting, offline backups, FTP authentication, media validation, least privilege, and monitoring for encryption/upload events.",
    points: 250,
    flag: "FLAG{stock_market_phishing_billboard_hardening}",
    hint: "Use the Stock Market Blue Team hardening checklist."
  }
];

seedChallenges.metro = [
  {
    id: "metro_room_001",
    category: "metro",
    title: "Task 1 - Metro Room Briefing",
    description: "You are investigating a Metro PLC where Modbus TCP is exposed for a supervised write_coil lab. Open the Metro Red Team scenario page and identify the dashboard used for observation.",
    points: 50,
    flag: "FLAG{metro_room_started}",
    hint: "The scenario page links the Metro dashboard."
  },
  {
    id: "metro_room_002",
    category: "metro",
    title: "Task 2 - PLC Target",
    description: "Identify the Metro PLC IP address used in the Modbus write_coil drill.",
    points: 100,
    flag: "FLAG{metro_plc_172_16_17_127}",
    hint: "The Metro scenario lists the PLC target."
  },
  {
    id: "metro_room_003",
    category: "metro",
    title: "Task 3 - Modbus Port",
    description: "Run the approved port scan against the Metro PLC and identify the TCP port used by Modbus Application Protocol.",
    points: 100,
    flag: "FLAG{metro_modbus_tcp_502}",
    hint: "The scan command targets the standard Modbus TCP port."
  },
  {
    id: "metro_room_004",
    category: "metro",
    title: "Task 4 - Interlock Observation",
    description: "Explain what students should observe when normal Modbus tampering is blocked by the Metro interlocking mechanism or ladder logic.",
    points: 150,
    flag: "FLAG{metro_interlock_blocks_tamper}",
    hint: "The Red Team page says the interlock/ladder logic does not allow normal unsafe tampering."
  },
  {
    id: "metro_room_005",
    category: "metro",
    title: "Task 5 - Modbus Client Module",
    description: "Identify the Metasploit auxiliary module used to test the Metro Modbus write_coil behavior.",
    points: 150,
    flag: "FLAG{metro_modbusclient_module}",
    hint: "The module path ends with scada/modbusclient."
  },
  {
    id: "metro_room_006",
    category: "metro",
    title: "Task 6 - Coil Write Action",
    description: "Identify the Modbus action used during the controlled Metro coil-write test.",
    points: 150,
    flag: "FLAG{metro_write_coil_action}",
    hint: "The scenario command sets action to this value."
  },
  {
    id: "metro_room_007",
    category: "metro",
    title: "Task 7 - Coil Address And Data",
    description: "Identify the coil address and data value used in the approved Metro write_coil test.",
    points: 200,
    flag: "FLAG{metro_coil_0_data_1}",
    hint: "Look for data_address and data in the controlled coil write section."
  },
  {
    id: "metro_room_008",
    category: "metro",
    title: "Task 8 - Dashboard Evidence",
    description: "During the Metro write_coil simulation, identify what evidence students should record from the dashboard and physical model.",
    points: 200,
    flag: "FLAG{metro_dashboard_coil_evidence}",
    hint: "Record timestamp, coil address, written value, and visible impact."
  },
  {
    id: "metro_room_009",
    category: "metro",
    title: "Task 9 - Safe Recovery",
    description: "Identify the required recovery action after the controlled Metro write_coil test.",
    points: 200,
    flag: "FLAG{metro_restore_safe_state}",
    hint: "Use the approved operator workflow to restore normal train/signal/interlock state."
  },
  {
    id: "metro_room_010",
    category: "metro",
    title: "Task 10 - Metro Modbus Hardening",
    description: "Recommend protections for the Metro PLC: restrict TCP/502, segment PLCs, monitor write_coil actions, document approved coil/register addresses, and validate ladder-logic protections.",
    points: 250,
    flag: "FLAG{metro_modbus_hardening}",
    hint: "Use the Metro Blue Team hardening checklist."
  }
];

seedChallenges["traffic-lights"] = [
  {
    id: "traffic_lights_room_001",
    category: "traffic-lights",
    title: "Task 1 - Traffic Lights Room Briefing",
    description: "You are investigating a Traffic Lights model where exposed MQTT can affect signal states. Open the Traffic Lights Red Team scenario page and identify the dashboard used for observation.",
    points: 50,
    flag: "FLAG{traffic_lights_room_started}",
    hint: "The scenario page links the Traffic Lights dashboard."
  },
  {
    id: "traffic_lights_room_002",
    category: "traffic-lights",
    title: "Task 2 - Broker Target",
    description: "Identify the MQTT broker IP address used by the Traffic Lights model.",
    points: 100,
    flag: "FLAG{traffic_lights_broker_172_16_17_208}",
    hint: "The broker IP is listed in the Enumeration section."
  },
  {
    id: "traffic_lights_room_003",
    category: "traffic-lights",
    title: "Task 3 - MQTT Port",
    description: "Run the approved scan against the Traffic Lights broker and identify the TCP port used by MQTT.",
    points: 100,
    flag: "FLAG{traffic_lights_mqtt_1883}",
    hint: "The scan command targets the standard MQTT port."
  },
  {
    id: "traffic_lights_room_004",
    category: "traffic-lights",
    title: "Task 4 - Wildcard Subscription",
    description: "Identify the MQTT wildcard topic used to subscribe to all visible Traffic Lights topics.",
    points: 150,
    flag: "FLAG{traffic_lights_wildcard_hash}",
    hint: "The mosquitto_sub command subscribes to a single-character wildcard."
  },
  {
    id: "traffic_lights_room_005",
    category: "traffic-lights",
    title: "Task 5 - Topic Mapping",
    description: "Identify an example topic pattern used to control a traffic light color.",
    points: 150,
    flag: "FLAG{traffic_lights_t1_control_g}",
    hint: "The topic examples include t1/control/r, t1/control/y, and t1/control/g."
  },
  {
    id: "traffic_lights_room_006",
    category: "traffic-lights",
    title: "Task 6 - Green Topics",
    description: "Identify the four green-light topics used by the all-green simulation.",
    points: 200,
    flag: "FLAG{traffic_lights_all_green_topics}",
    hint: "The list contains t1/control/g through t4/control/g."
  },
  {
    id: "traffic_lights_room_007",
    category: "traffic-lights",
    title: "Task 7 - Publish Value",
    description: "Identify the MQTT payload value used to turn on each green signal during the simulation.",
    points: 150,
    flag: "FLAG{traffic_lights_publish_1}",
    hint: "The script publishes one character to each green topic."
  },
  {
    id: "traffic_lights_room_008",
    category: "traffic-lights",
    title: "Task 8 - Unsafe State",
    description: "Identify the unsafe condition created when every green topic is repeatedly published as ON.",
    points: 200,
    flag: "FLAG{traffic_lights_all_green_chaos}",
    hint: "The scenario describes all green lights on at the same time."
  },
  {
    id: "traffic_lights_room_009",
    category: "traffic-lights",
    title: "Task 9 - Safe Recovery",
    description: "Identify the safe recovery steps after the Traffic Lights all-green simulation.",
    points: 200,
    flag: "FLAG{traffic_lights_restore_safe_state}",
    hint: "Stop the script and use dashboard/manual controls to restore safe signal state."
  },
  {
    id: "traffic_lights_room_010",
    category: "traffic-lights",
    title: "Task 10 - MQTT Hardening Plan",
    description: "Recommend key protections: MQTT authentication, anonymous publish disablement, topic ACLs, TCP/1883 restriction, signal logic validation, and alerts for impossible all-green states.",
    points: 250,
    flag: "FLAG{traffic_lights_mqtt_hardening}",
    hint: "Use the Traffic Lights Blue Team hardening checklist."
  }
];

seedChallenges.industry = [
  {
    id: "industry_red_001",
    category: "industry",
    title: "Task 1 - Reconnaissance: MQTT Port",
    description: "What port is the MQTT broker running on?",
    points: 50,
    flag: "1883",
    hint: "Run nmap against the target on the MQTT default port."
  },
  {
    id: "industry_red_002",
    category: "industry",
    title: "Task 1 - Reconnaissance: Service Name",
    description: "What is the service name Nmap shows?",
    points: 50,
    flag: "mqtt",
    hint: "Read the service column in the Nmap result."
  },
  {
    id: "industry_red_003",
    category: "industry",
    title: "Task 1 - Reconnaissance: Broker MAC Address",
    description: "What is the MAC address of the broker?",
    points: 100,
    flag: "BC:24:11:C0:C9:02",
    hint: "Read the MAC address line in the scan output."
  },
  {
    id: "industry_red_004",
    category: "industry",
    title: "Task 1 - Reconnaissance: Server Company",
    description: "Which company runs this server?",
    points: 100,
    flag: "Proxmox Server Solutions GmbH",
    hint: "Read the MAC vendor/company information from the scan output."
  },
  {
    id: "industry_red_005",
    category: "industry",
    title: "Task 2 - Enumeration: Subscribe Tool",
    description: "What tool is used to subscribe to MQTT topics?",
    points: 100,
    flag: "mosquitto_sub",
    hint: "Use the command-line MQTT subscriber."
  },
  {
    id: "industry_red_006",
    category: "industry",
    title: "Task 2 - Enumeration: Wildcard Topic",
    description: "What wildcard subscribes to all topics at once?",
    points: 100,
    flag: "#",
    hint: "Use mosquitto_sub with the all-topic wildcard."
  },
  {
    id: "industry_red_007",
    category: "industry",
    title: "Task 2 - Enumeration: Sensor Topic Count",
    description: "How many unique sensor topics does the ZPHS01B publish?",
    points: 150,
    flag: "11",
    hint: "Subscribe to all topics and count the unique ZPHS01B sensor topics."
  },
  {
    id: "industry_red_008",
    category: "industry",
    title: "Task 2 - Enumeration: Alert Topic",
    description: "What is the topic that publishes alert values?",
    points: 150,
    flag: "sensor/value/alert",
    hint: "Look for the non-ZPHS01B topic that carries alert values."
  },
  {
    id: "industry_red_009",
    category: "industry",
    title: "Task 2 - Enumeration: Normal Alert Value",
    description: "What is the normal value being published to sensor/value/alert?",
    points: 150,
    flag: "33",
    hint: "Watch the alert topic output during normal operation."
  },
  {
    id: "industry_red_010",
    category: "industry",
    title: "Task 2 - Enumeration: Sensor Prefix",
    description: "What sensor prefix is used for all air quality topics?",
    points: 150,
    flag: "ZPHS01B",
    hint: "The prefix appears before each air-quality topic name."
  },
  {
    id: "industry_red_011",
    category: "industry",
    title: "Task 3 - Passive Reconnaissance: CO2 Baseline",
    description: "What is the normal CO2 reading?",
    points: 150,
    flag: "~1124 ppm",
    hint: "Watch mosquitto_sub output for 30 seconds and record the stable CO2 value."
  },
  {
    id: "industry_red_012",
    category: "industry",
    title: "Task 3 - Passive Reconnaissance: Temperature Baseline",
    description: "What is the normal Temperature reading?",
    points: 150,
    flag: "~30°C",
    hint: "Watch mosquitto_sub output for 30 seconds and record the stable Temperature value."
  },
  {
    id: "industry_red_013",
    category: "industry",
    title: "Task 3 - Passive Reconnaissance: Humidity Baseline",
    description: "What is the normal Humidity reading?",
    points: 150,
    flag: "~86%",
    hint: "Watch mosquitto_sub output for 30 seconds and record the stable Humidity value."
  },
  {
    id: "industry_red_014",
    category: "industry",
    title: "Task 3 - Passive Reconnaissance: NO2 Baseline",
    description: "What is the normal NO2 reading?",
    points: 150,
    flag: "0.23 ppm",
    hint: "Watch the NO2 topic and record the normal value."
  },
  {
    id: "industry_red_015",
    category: "industry",
    title: "Task 3 - Passive Reconnaissance: Zero Value Topic",
    description: "Which topic shows a value of 0 in normal state?",
    points: 150,
    flag: "ZPHS01B/VOC",
    hint: "Find the topic that reports 0 during normal operation."
  },
  {
    id: "industry_red_016",
    category: "industry",
    title: "Task 4 - Exploitation: Publish Tool",
    description: "What tool is used to publish to MQTT topics?",
    points: 100,
    flag: "mosquitto_pub",
    hint: "Use the command-line MQTT publisher."
  },
  {
    id: "industry_red_017",
    category: "industry",
    title: "Task 4 - Exploitation: NO2 Spoof Command",
    description: "What command spoofs the NO2 sensor to 999?",
    points: 250,
    flag: "mosquitto_pub -h 172.16.17.207 -t \"ZPHS01B/NO2\" -m \"999\"",
    hint: "Use mosquitto_pub with host, topic, and message flags."
  },
  {
    id: "industry_red_018",
    category: "industry",
    title: "Task 4 - Exploitation: Host Flag",
    description: "What flag do you use to specify the broker host?",
    points: 100,
    flag: "-h",
    hint: "This option comes before the broker IP."
  },
  {
    id: "industry_red_019",
    category: "industry",
    title: "Task 4 - Exploitation: Topic Flag",
    description: "What flag specifies the topic?",
    points: 100,
    flag: "-t",
    hint: "This option comes before the topic string."
  },
  {
    id: "industry_red_020",
    category: "industry",
    title: "Task 4 - Exploitation: Message Flag",
    description: "What flag specifies the message value?",
    points: 100,
    flag: "-m",
    hint: "This option comes before the payload value."
  },
  {
    id: "industry_red_021",
    category: "industry",
    title: "Task 4 - Exploitation: NO2 Dashboard Flag",
    description: "Submit flag after NO2 gauge hits 999 on dashboard.",
    points: 250,
    flag: "FLAG{industry_no2_999}",
    hint: "Read the flag shown by the dashboard or instructor validation panel after the NO2 gauge reaches 999."
  },
  {
    id: "industry_red_022",
    category: "industry",
    title: "Task 5 - Full Exploitation: Spoof Value",
    description: "What value is published to all topics in the full attack?",
    points: 150,
    flag: "999",
    hint: "The full attack pushes the same high fake value to every sensor topic."
  },
  {
    id: "industry_red_023",
    category: "industry",
    title: "Task 5 - Full Exploitation: Spoofed Topic Count",
    description: "How many topics are spoofed in the full attack?",
    points: 150,
    flag: "12",
    hint: "Include all spoofed sensor and alert topics in the full loop."
  },
  {
    id: "industry_red_024",
    category: "industry",
    title: "Task 5 - Full Exploitation: Loop Construct",
    description: "What bash construct is used to loop through all topics?",
    points: 150,
    flag: "for loop",
    hint: "It iterates over every topic name."
  },
  {
    id: "industry_red_025",
    category: "industry",
    title: "Task 5 - Full Exploitation: Sleep Value",
    description: "What sleep value keeps the attack sustained?",
    points: 150,
    flag: "0.02",
    hint: "This short delay keeps messages flowing rapidly."
  },
  {
    id: "industry_red_026",
    category: "industry",
    title: "Task 5 - Full Exploitation: Full Dashboard Flag",
    description: "Submit flag when all gauges turn red at 999.",
    points: 300,
    flag: "FLAG{industry_all_gauges_999}",
    hint: "Read the flag shown after all gauges reach the full alarm state."
  },
  {
    id: "industry_red_027",
    category: "industry",
    title: "Task 6 - Blue Team: Authentication Control",
    description: "What MQTT security feature would prevent unauthenticated publishing?",
    points: 150,
    flag: "authentication",
    hint: "Require clients to prove identity before publishing."
  },
  {
    id: "industry_red_028",
    category: "industry",
    title: "Task 6 - Blue Team: Encrypted Protocol",
    description: "What protocol adds TLS encryption to MQTT?",
    points: 150,
    flag: "MQTTS",
    hint: "It is MQTT over TLS."
  },
  {
    id: "industry_red_029",
    category: "industry",
    title: "Task 6 - Blue Team: Encrypted MQTT Port",
    description: "What port does encrypted MQTT run on?",
    points: 150,
    flag: "8883",
    hint: "This is the default TLS-enabled MQTT port."
  },
  {
    id: "industry_red_030",
    category: "industry",
    title: "Task 6 - Blue Team: MITRE Technique",
    description: "Which MITRE ATT&CK ICS technique covers sensor spoofing?",
    points: 200,
    flag: "T0856",
    hint: "Look for the ATT&CK for ICS technique related to spoof reporting messages."
  },
  {
    id: "industry_red_031",
    category: "industry",
    title: "Task 6 - Blue Team: Suricata Port Keyword",
    description: "What Suricata rule keyword detects traffic on port 1883?",
    points: 150,
    flag: "port 1883",
    hint: "The answer should include the monitored MQTT port."
  },
  {
    id: "industry_red_032",
    category: "industry",
    title: "Task 6 - Blue Team: Wildcard Subscription Control",
    description: "What is the fix to prevent wildcard subscriptions?",
    points: 200,
    flag: "ACL - Access Control List",
    hint: "Restrict which topics clients can subscribe or publish to."
  }
];

seedChallenges["data-center"] = [
  {
    id: "data_center_red_001",
    category: "data-center",
    title: "Task 1 - Reconnaissance: Modbus Port",
    description: "What port is the Modbus service running on?",
    points: 50,
    flag: "502",
    hint: "Run the approved Nmap scan against the PLC."
  },
  {
    id: "data_center_red_002",
    category: "data-center",
    title: "Task 1 - Reconnaissance: Service Name",
    description: "What is the service name shown by Nmap on that port?",
    points: 100,
    flag: "mbap",
    hint: "Look at the SERVICE column in the Nmap output for TCP/502."
  },
  {
    id: "data_center_red_003",
    category: "data-center",
    title: "Task 1 - Reconnaissance: PLC MAC Address",
    description: "What is the MAC address of the PLC?",
    points: 100,
    flag: "8C:F3:19:01:34:AD",
    hint: "Use network discovery output and check the MAC address line."
  },
  {
    id: "data_center_red_004",
    category: "data-center",
    title: "Task 1 - Reconnaissance: PLC Manufacturer",
    description: "Which company manufactured this PLC?",
    points: 150,
    flag: "Siemens",
    hint: "The vendor can be inferred from the MAC/vendor output."
  },
  {
    id: "data_center_red_005",
    category: "data-center",
    title: "Task 2 - Register Enumeration: Default Action",
    description: "What is the default action of the Metasploit Modbus module?",
    points: 200,
    flag: "READ_HOLDING_REGISTERS",
    hint: "Inspect the module options after loading auxiliary/scanner/scada/modbusclient."
  },
  {
    id: "data_center_red_006",
    category: "data-center",
    title: "Task 2 - Register Enumeration: Supported Actions",
    description: "How many total actions does the module support?",
    points: 200,
    flag: "9",
    hint: "Check the ACTION option list in the Metasploit module."
  },
  {
    id: "data_center_red_007",
    category: "data-center",
    title: "Task 2 - Register Enumeration: Address 1 Value",
    description: "What value was returned when reading data_address 1?",
    points: 250,
    flag: "0",
    hint: "Read data_address 1 and record the returned value."
  },
  {
    id: "data_center_red_008",
    category: "data-center",
    title: "Task 2 - Register Enumeration: Coolant Address",
    description: "What data address controls the coolant?",
    points: 200,
    flag: "0",
    hint: "Compare register changes while the coolant is controlled from the dashboard."
  },
  {
    id: "data_center_red_009",
    category: "data-center",
    title: "Task 3 - Exploitation: Coolant OFF",
    description: "What value turns the coolant OFF?",
    points: 250,
    flag: "333",
    hint: "Use the captured value from the write_register test."
  },
  {
    id: "data_center_red_010",
    category: "data-center",
    title: "Task 3 - Exploitation: Coolant ON",
    description: "What value turns the coolant ON (safe state)?",
    points: 250,
    flag: "111",
    hint: "This is the value used to restore the safe state."
  },
  {
    id: "data_center_red_011",
    category: "data-center",
    title: "Task 3 - Exploitation: Write Confirmation",
    description: "What message confirms a successful register write?",
    points: 300,
    flag: "Value 333 successfully written at registry address 0",
    hint: "Copy the success message shown after the register write."
  }
];

seedChallenges["water-treatment"] = [
  {
    id: "water_treatment_red_001",
    category: "water-treatment",
    title: "Task 1 - Reconnaissance: Moxa Port",
    description: "What port is the Moxa NPort service running on?",
    points: 50,
    flag: "4001",
    hint: "Run Nmap against the target and identify the open Moxa service port."
  },
  {
    id: "water_treatment_red_002",
    category: "water-treatment",
    title: "Task 1 - Reconnaissance: Service Name",
    description: "What is the service name Nmap shows on that port?",
    points: 100,
    flag: "newoak",
    hint: "Read the SERVICE column from the scan output."
  },
  {
    id: "water_treatment_red_003",
    category: "water-treatment",
    title: "Task 1 - Reconnaissance: Moxa MAC Address",
    description: "What is the MAC address of the Moxa device?",
    points: 100,
    flag: "00:90:E8:4F:EF:4D",
    hint: "Read the full Nmap output carefully, including the MAC address line."
  },
  {
    id: "water_treatment_red_004",
    category: "water-treatment",
    title: "Task 1 - Reconnaissance: Device Manufacturer",
    description: "Which company manufactured this device?",
    points: 150,
    flag: "Moxa Technologies",
    hint: "Use the MAC vendor line from the scan output."
  },
  {
    id: "water_treatment_red_005",
    category: "water-treatment",
    title: "Task 2 - Protocol Analysis: Bridged Protocol",
    description: "What industrial protocol is the Moxa NPort bridging to TCP?",
    points: 200,
    flag: "Modbus RTU",
    hint: "The Moxa is a serial-to-ethernet converter for the plant Modbus bus."
  },
  {
    id: "water_treatment_red_006",
    category: "water-treatment",
    title: "Task 2 - Protocol Analysis: Slave ID",
    description: "What is the Modbus slave ID used to address this device?",
    points: 200,
    flag: "1",
    hint: "The slave ID is the first byte of the raw payload."
  },
  {
    id: "water_treatment_red_007",
    category: "water-treatment",
    title: "Task 2 - Protocol Analysis: Function Code",
    description: "What Modbus function code is used to write a single register?",
    points: 200,
    flag: "6",
    hint: "Modbus RTU function code 06 is used for this operation."
  },
  {
    id: "water_treatment_red_008",
    category: "water-treatment",
    title: "Task 2 - Protocol Analysis: Function Name",
    description: "What is the name of that function code?",
    points: 250,
    flag: "Write Single Register",
    hint: "Function code 06 is also called Preset Single Holding Register."
  },
  {
    id: "water_treatment_red_009",
    category: "water-treatment",
    title: "Task 2 - Protocol Analysis: Filtration Register",
    description: "What register address controls the filtration motor?",
    points: 250,
    flag: "0",
    hint: "The filtration motor is controlled through register address 0."
  },
  {
    id: "water_treatment_red_010",
    category: "water-treatment",
    title: "Task 3 - Exploitation: Payload Delivery Tool",
    description: "What command-line tool is used to deliver the raw payload to the Moxa?",
    points: 150,
    flag: "netcat",
    hint: "The Python bytes.fromhex output is piped into this network tool."
  },
  {
    id: "water_treatment_red_011",
    category: "water-treatment",
    title: "Task 3 - Exploitation: Filtration Stop Value",
    description: "What value written to register 0 stops the filtration motor?",
    points: 200,
    flag: "333",
    hint: "Use the value documented for stopping filtration."
  },
  {
    id: "water_treatment_red_012",
    category: "water-treatment",
    title: "Task 3 - Exploitation: Hex Value",
    description: "What is the hex representation of 333 in the payload?",
    points: 200,
    flag: "014D",
    hint: "Convert decimal 333 to a two-byte hexadecimal value."
  },
  {
    id: "water_treatment_red_013",
    category: "water-treatment",
    title: "Task 3 - Exploitation: Full Payload",
    description: "What is the full hex payload used in the attack?",
    points: 250,
    flag: "01060000014D486F",
    hint: "Copy the full Modbus RTU payload used for the filtration stop command."
  },
  {
    id: "water_treatment_red_014",
    category: "water-treatment",
    title: "Task 3 - Exploitation: CRC Bytes",
    description: "What are the last 2 bytes of the payload used for?",
    points: 200,
    flag: "CRC",
    hint: "The final bytes validate the Modbus RTU frame."
  }
];

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
  let changed = false;
  const removedLegacyIndustry = db.challenges.filter((challenge) => legacyIndustryChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyDataCenter = db.challenges.filter((challenge) => legacyDataCenterChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyWaterTreatment = db.challenges.filter((challenge) => legacyWaterTreatmentChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyAirport = db.challenges.filter((challenge) => legacyAirportChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyHospital = db.challenges.filter((challenge) => legacyHospitalChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyPowerGrid = db.challenges.filter((challenge) => legacyPowerGridChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyTollPlaza = db.challenges.filter((challenge) => legacyTollPlazaChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyStockMarket = db.challenges.filter((challenge) => legacyStockMarketChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyMetro = db.challenges.filter((challenge) => legacyMetroChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyWarehouse = db.challenges.filter((challenge) => legacyWarehouseChallengeIds.has(challenge.id) || challenge.category === "warehouse").map((challenge) => challenge.id);
  const removedLegacyTrafficLights = db.challenges.filter((challenge) => legacyTrafficLightsChallengeIds.has(challenge.id)).map((challenge) => challenge.id);
  const removedLegacyBanking = db.challenges.filter((challenge) => legacyBankingChallengeIds.has(challenge.id) || challenge.category === "banking").map((challenge) => challenge.id);
  const removedLegacy = [...removedLegacyIndustry, ...removedLegacyDataCenter, ...removedLegacyWaterTreatment, ...removedLegacyAirport, ...removedLegacyHospital, ...removedLegacyPowerGrid, ...removedLegacyTollPlaza, ...removedLegacyStockMarket, ...removedLegacyMetro, ...removedLegacyWarehouse, ...removedLegacyTrafficLights, ...removedLegacyBanking];
  if (removedLegacy.length) {
    const removed = new Set(removedLegacy);
    db.challenges = db.challenges.filter((challenge) => !removed.has(challenge.id));
    db.submissions = db.submissions.filter((item) => !removed.has(item.challengeId));
    db.solves = db.solves.filter((item) => !removed.has(item.challengeId));
    db.hints = db.hints.filter((item) => !removed.has(item.challengeId));
    changed = true;
  }
  const existingChallenges = new Set(db.challenges.map((challenge) => challenge.id));
  for (const item of Object.values(seedChallenges).flat()) {
    if (!existingChallenges.has(item.id)) {
      db.challenges.push({ ...item, createdAt: nowIso(), updatedAt: nowIso() });
      changed = true;
    }
  }
  if (changed) writeDb(db);
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

function makeToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function isAdminRequest(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(token && adminSessions.has(token));
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
    top: entries.filter((row) => row.solvedCount > 0).slice(0, 5),
    current: entries.find((row) => row.studentId === studentId) || null
  };
}

function overallLeaderboard(db, studentId) {
  const rows = db.students.map((student) => {
    const solves = db.solves.filter((solve) => solve.studentId === student.id);
    const categories = new Set();
    solves.forEach((solve) => {
      const challenge = db.challenges.find((ch) => ch.id === solve.challengeId);
      if (challenge) categories.add(challenge.category);
    });
    return {
      studentId: student.id,
      name: student.name,
      score: solves.reduce((sum, solve) => sum + solve.awardedPoints, 0),
      solvedCount: solves.length,
      roomCount: categories.size,
      lastSolvedAt: solves.reduce((latest, solve) => latest > solve.solvedAt ? latest : solve.solvedAt, "")
    };
  }).sort((a, b) => b.score - a.score || b.solvedCount - a.solvedCount || a.name.localeCompare(b.name));
  const entries = rows.map((row, index) => ({ rank: index + 1, ...row }));
  return {
    ok: true,
    top: entries.filter((row) => row.solvedCount > 0).slice(0, 10),
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
    const correct = answer.toLowerCase() === String(ch.flag || "").toLowerCase();
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

  if (req.method === "GET" && url.pathname === "/api/leaderboard-overall") {
    const studentId = Number(url.searchParams.get("studentId") || 0);
    return sendJson(res, 200, overallLeaderboard(db, studentId));
  }

  if (req.method === "POST" && url.pathname === "/api/admin/login") {
    const payload = await readBody(req);
    const password = String(payload.password || "");
    if (password !== adminPassword) return sendJson(res, 401, { ok: false, msg: "Incorrect password." });
    const token = makeToken();
    adminSessions.add(token);
    return sendJson(res, 200, { ok: true, token });
  }

  if (url.pathname.startsWith("/api/admin/") && !isAdminRequest(req)) {
    return sendJson(res, 401, { ok: false, msg: "Admin login required." });
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
    return sendJson(res, 200, { ok: true, domains: domains.map(([id, title]) => ({ id, title })), students });
  }

  if (req.method === "DELETE" && url.pathname === "/api/admin/students") {
    const payload = await readBody(req);
    const ids = Array.isArray(payload.ids) ? payload.ids.map(Number).filter(Boolean) : [];
    const deleteAll = Boolean(payload.all);
    const selected = deleteAll ? new Set(db.students.map((student) => student.id)) : new Set(ids);
    if (!selected.size) return sendJson(res, 400, { ok: false, msg: "Select at least one student." });
    const before = db.students.length;
    db.students = db.students.filter((student) => !selected.has(student.id));
    db.submissions = db.submissions.filter((item) => !selected.has(item.studentId));
    db.solves = db.solves.filter((item) => !selected.has(item.studentId));
    db.hints = db.hints.filter((item) => !selected.has(item.studentId));
    writeDb(db);
    return sendJson(res, 200, { ok: true, deleted: before - db.students.length });
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
  console.log(`Phygital Lab running at http://localhost:${port}`);
});
