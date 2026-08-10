# Elevator Control System – Modbus TCP Security Walkthrough

## 1. Objective

The objective of this activity was to perform an authorized security assessment of the elevator control system in the phygital/ICS lab.

The assessment focused on:
* Discovering exposed industrial services.
* Identifying the protocol used by the elevator controller.
* Establishing communication with the Modbus TCP service.
* Enumerating Modbus memory areas.
* Observing elevator motor-control states.
* Correlating Modbus values with physical elevator movement.
* Identifying potential security risks caused by unauthenticated access to industrial protocol data.

### Target
```text
Target IP : 172.16.17.129
Protocol  : Modbus TCP
Port      : TCP/502
System    : Elevator / Lift Control System
Attacker  : Kali Linux
Tools     : Nmap + Metasploit Framework
```

---

# 2. Attack Flow

```text
┌───────────────────────┐
│ Kali Linux Attacker   │
└──────────┬────────────┘
           │
           │ Nmap Reconnaissance
           ▼
┌───────────────────────┐
│ 172.16.17.129         │
│ Elevator Controller   │
└──────────┬────────────┘
           │
           ├── TCP/80   → KOS Web Server 2.0
           ├── TCP/102  → Industrial service / ISO-TSAP
           ├── TCP/502  → Modbus TCP
           └── TCP/503  → Additional exposed service
                       │
                       ▼
              Modbus Enumeration
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
       Coils                 Discrete Inputs
          │                         │
          ▼                         ▼
   Elevator direction        Sensor/position
       observed                 states
```

---

# 3. Phase 1 – Network Reconnaissance

The first stage was to identify exposed services on the elevator controller.

The following Nmap scan was performed:
```bash
nmap -Pn -sV -p 80,102,502,503 172.16.17.129
```

The scan identified:
```text
PORT    STATE   SERVICE
80/tcp  open    http
102/tcp open    iso-tsap?
502/tcp open    mbap?
503/tcp open    intrinsa?
```

Nmap also identified the web service as:
```text
KOS Web Server 2.0
```

The MAC address vendor information indicated:
```text
Siemens Industrial Automation Products, Chengdu
```

### Important Discovery
The most significant finding was:
```text
502/tcp OPEN
```
TCP port **502 is conventionally associated with Modbus TCP**, making it the primary protocol of interest for the elevator assessment.

---

# 4. Phase 2 – Modbus Client Setup

Metasploit Framework was used to communicate with the exposed Modbus service.

```text
use auxiliary/scanner/scada/modbusclient
```

The target was configured as:
```text
set RHOSTS 172.16.17.129
set RPORT 502
```

This provided a Modbus client capable of querying the controller's exposed Modbus data areas.

---

# 5. Phase 3 – Discrete Input Enumeration

The first data area investigated was **Discrete Inputs**.

```text
set ACTION READ_DISCRETE_INPUTS
set DATA_ADDRESS 0
set NUMBER 16
run
```

One observed response was:
```text
[0, 0, 1, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0]
```

This showed:
```text
Discrete Input 2 = 1
```
while the remaining queried inputs were inactive.

This demonstrated that the controller exposed real-time binary input information through Modbus.

---

# 6. Phase 4 – Input Register Enumeration

The Input Registers were subsequently queried.

```text
set ACTION READ_INPUT_REGISTERS
set DATA_ADDRESS 0
set NUMBER 16
run
```

Result:
```text
[0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0]
```

All Input Registers from addresses `0–15` were zero during this observation.

This suggested that the elevator's immediately observable movement information was not being represented in this particular register range at the time of testing.

---

# 7. Phase 5 – Coil Enumeration

The next investigation focused on Modbus **Coils**.

```text
set ACTION READ_COILS
set DATA_ADDRESS 0
set NUMBER 16
run
```

The elevator was then operated normally while the Modbus states were observed.

### Elevator Moving Toward Floor 1
The response was:
```text
[0, 1, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0]
```

Therefore:
```text
Coil 1 = ACTIVE
```

---

# 8. Phase 6 – Elevator Idle State

After the elevator reached Floor 1 and stopped, the coils were queried again.

Result:
```text
[0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0]
```

Therefore:
```text
Coil 0 = 0
Coil 1 = 0
```

This indicated that the previously observed coil was associated with an active movement condition rather than simply representing that the elevator was located at Floor 1.

---

# 9. Phase 7 – Upward Movement Observation

The elevator was then commanded through normal operation to move upward toward Floor 2.

The Modbus response changed to:
```text
[1, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0]
```

The same state was observed during upward movement toward Floor 3.

Therefore:
```text
Coil 0 = ACTIVE during upward movement
```

Combined with the previous observation, the likely mapping was established as:

| Coil | Observed behaviour |
| --- | --- |
| Coil 0 | Elevator moving UP |
| Coil 1 | Elevator moving DOWN |
| Both 0 | Elevator stopped/idle |

Therefore:
```text
Coil State

[0,0] → STOP
[1,0] → UP
[0,1] → DOWN
```

This was the most significant result of the assessment.

---

# 10. Phase 8 – Physical-to-Cyber Correlation

The key aspect of the exercise was correlating network values with the **physical elevator model**.

When the physical elevator moved upward:
```text
Physical Elevator
       │
       │ UP
       ▼

Modbus TCP

Coil 0 = 1
Coil 1 = 0
```

When the physical elevator moved downward:
```text
Physical Elevator
       │
       │ DOWN
       ▼

Modbus TCP

Coil 0 = 0
Coil 1 = 1
```

When movement stopped:
```text
Coil 0 = 0
Coil 1 = 0
```

This demonstrated that Modbus traffic exposed information directly related to the physical process.

---

# 11. Phase 9 – Position/Sensor Observation

Discrete Inputs were monitored while the elevator travelled:
```text
Floor 3 → Floor 2 → Floor 1
```

Three notable readings were obtained.

### Observation 1
```text
[0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]
```
Therefore: `Discrete Input 3 = ACTIVE`

### Observation 2
```text
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
```
No monitored input was active at that instant.

### Observation 3
```text
[0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]
```
Therefore: `Discrete Input 2 = ACTIVE`

Because these readings were captured during movement rather than after controlled stationary measurements at every floor, the safe conclusion is:
```text
DI 2 → position/limit sensor event
DI 3 → position/limit sensor event
```
They should **not yet be labelled definitively as specific floor numbers**.

---

# 12. Final Modbus Mapping

Based strictly on the observations obtained during the experiment:

| Modbus Area | Address | Observed Function |
| --- | ---: | --- |
| Coil | 0 | UP movement |
| Coil | 1 | DOWN movement |
| Discrete Input | 2 | Position/limit sensor event |
| Discrete Input | 3 | Position/limit sensor event |
| Input Registers | 0–15 | No active values observed |

The resulting control observation can be represented as:
```text
                   MODBUS TCP
                 172.16.17.129
                       │
            ┌──────────┴──────────┐
            │                     │
          COILS            DISCRETE INPUTS
            │                     │
       ┌────┴────┐           ┌────┴────┐
       │         │           │         │
     Coil 0    Coil 1       DI 2      DI 3
       │         │           │         │
       ▼         ▼           └────┬────┘
      UP        DOWN               │
                                   ▼
                         Position/limit events
```

---

# 13. Security Finding

### Finding: Unauthenticated Exposure of Elevator Operational Data

The assessment demonstrated that a system on the same reachable network could communicate with the elevator's Modbus TCP service and retrieve operational data.

No application-level authentication was encountered during these read operations.

An observer with network access could potentially determine information such as:
```text
Elevator stopped → Elevator moving upward → Position sensor triggered → Elevator continues → Elevator stopped → Elevator moving downward
```

This represents an **information-disclosure and industrial-network-segmentation concern**.

---

# 14. Attacker's POV

From an attacker-simulation perspective, the activity followed this sequence:
```text
STEP 1: Discover elevator controller (172.16.17.129)
STEP 2: Enumerate exposed services (80 / 102 / 502 / 503)
STEP 3: Identify Modbus TCP (TCP/502)
STEP 4: Connect using Metasploit modbusclient
STEP 5: Enumerate discrete inputs (Sensor states discovered)
STEP 6: Enumerate input registers (No useful values in 0–15)
STEP 7: Monitor coils (Coil states change with physical movement)
STEP 8: Correlate cyber + physical behaviour (Coil 0 → UP, Coil 1 → DOWN)
STEP 9: Observe position/limit events (DI 2 / DI 3 change during travel)
STEP 10: Document security exposure
```

---

# 15. Evidence of Successful Assessment

The activity successfully demonstrated three things:
1. **Network discovery**: The elevator controller was reachable and exposed several industrial/network services, including Modbus TCP on port 502.
2. **Protocol-level visibility**: Modbus data could be queried remotely without encountering application-level authentication during the performed reads.
3. **Cyber-physical correlation**: Changes in Modbus coil states could be correlated with movement of the physical elevator model (`Coil 0` = UP, `Coil 1` = DOWN).

---

# 16. CTF Challenge Structure

### Challenge: Elevator Under Observation

**Scenario:**
A network-connected elevator controller is operating inside an industrial facility. Security engineers suspect that operational information is exposed through an industrial protocol. Perform reconnaissance and protocol analysis to identify how elevator movement is represented.

**Target:** `172.16.17.129`

**Tasks:**
1. Identify the open industrial-control port.
2. Identify the industrial protocol.
3. Determine which coil becomes active during upward movement.
4. Determine which coil becomes active during downward movement.
5. Identify the discrete inputs observed as position/limit events.

**Answers & Flag:**
```text
Industrial Port  : 502
Protocol         : Modbus TCP
UP               : Coil 0
DOWN             : Coil 1
Sensor Events    : DI 2 and DI 3
FLAG             : FLAG{MODBUS_COIL0_UP_COIL1_DOWN}
```
