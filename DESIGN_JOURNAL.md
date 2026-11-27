# BBS College of Engineering & Technology, Prayagraj
## DESIGN THINKING LAB – PROJECT PORTFOLIO & DESIGN JOURNAL
**Course Code:** AID151 | **Class:** B. Tech 1st Year (2026-27)  

---

### 1. TEAM & PROJECT OVERVIEW (Week 1–2)

- **Project Title:** QuickLunch — Smart Canteen Queue & Token Management System
- **Team ID / Group No.:** BBS-CSE-T1-04
- **Course / Dept.:** B.Tech 1st Year (2026-27), Computer Science & Engineering
- **Faculty Facilitator:** Dr. S. K. Mishra (Dept. of CSE)
- **Selected Theme:** ☑ Campus & Community | ☐ Agriculture & Rural | ☐ Health & Wellbeing | ☐ Sustainability | ☐ Education | ☐ Smart Living | ☐ Other

#### Team Members & Assigned Stage Leads:
| # | Student Full Name | University Roll Number | Branch/Sec | Assigned Stage Lead (Rotating) |
|---|---|---|---|---|
| 1 | **Chetna Patel** | 260150101015 | CSE-1 | **Stage 1: Empathize Lead** |
| 2 | **Aarav Sharma** | 260150101002 | CSE-1 | **Stage 2: Define Lead** |
| 3 | **Rohan Gupta** | 260150101048 | CSE-1 | **Stage 3: Ideate Lead** |
| 4 | **Priya Verma** | 260150101042 | CSE-1 | **Stage 4 & 5: Prototype & Test Lead & Documentation** |

---

### 2. STAGE 1: EMPATHIZE (User Research & Insights) (Week 3–5)

- **Target Users & Research Methods:**
  - *Target Users:* 1st-year day scholars, hostelers, faculty, and canteen counter staff at BBS College of Engineering & Technology.
  - *Methods Used:* Direct Field Observation during 11:10 AM short break and 1:00 PM lunch peak (3 days, 140+ students observed), Semi-Structured In-Person Interviews (18 students, 2 canteen counter operators, 1 kitchen cook), Google Forms Survey ($n = 64$ respondents). Informed consent taken.

- **User Persona (Typical User Profile):**
  - **Name & Age:** Aarav Sharma, 19 yrs, 1st Year B.Tech CSE (Day Scholar)
  - **Goal:** Quickly buy a snack & hot beverage (Samosa & Masala Chai) during the 15-minute recess between Physics Lab and Mathematics lecture without being marked late.
  - **Biggest Pain Point:** Getting stuck in a single mixed 20-minute physical queue behind students waiting for slow-cooking items (Masala Dosa, Grilled Sandwich), forcing him to either skip food or arrive late to class.

- **Empathy Map Summary:**
  - **Says & Does:** Says: *"I only want a chai and samosa, why do I have to wait 20 minutes behind people waiting for dosas?"* Does: Hurries into crowded canteen, frantically glances at watch, struggles with cash change calculations in a cramped counter line.
  - **Thinks & Feels:** Thinks: *"Will my order number be skipped or grabbed by someone else?"* Feels: Frustrated with queue disorder, anxious about missing attendance, stressed by zero crowd visibility from the classroom.

- **Top 3 Validated User Needs / Pain Points Discovered:**
  1. **Head-of-Line Queue Blocking:** Grab-and-go snack buyers get trapped behind fresh-cooked order preparation in single mixed queues.
  2. **Zero Queue & Wait-Time Visibility:** Students cannot check canteen rush levels before leaving classrooms/labs.
  3. **Order Mix-ups & Food Theft:** Paper tokens and shouting token numbers lead to wrong pickups and chaotic counter disputes.

- **Evidence / Proof Attached:** ☑ Interview Notes | ☑ Survey Chart | ☑ Field Observation Photos (Consent taken)

---

### 3. STAGE 2: DEFINE (Problem Framing) (Week 6–7)

- **Point of View (POV) Problem Statement:**
  > 1st-year students and faculty at BBS College of Engineering & Technology need a fast, transparent way to pre-order food and track queue waiting times because the single-counter bottleneck forces them to spend 15–20 minutes in line during 15-minute breaks, causing them to skip meals or arrive late to lectures.

- **How Might We (HMW) Questions:**
  - **HMW 1:** *How might we segregate fast grab-and-go items (tea, snacks) from cooked-to-order meals so students with short breaks get their food in under 2 minutes?*
  - **HMW 2:** *How might we provide students with real-time crowd visibility and tamper-proof order verification from their phones without requiring any app installation or expensive hardware?*

---

### 4. STAGE 3: IDEATE (Brainstorming & Concept Selection) (Week 8–9)

- **Ideation Techniques Used:** ☑ Brainstorming | ☑ Mind Mapping | ☐ SCAMPER | ☑ Dot Voting | ☑ Impact-Effort Matrix
- **Shortlisted Top 3 Solution Ideas:**
  - **Idea 1:** *Dual-Counter Physical Token Vending Machine* — Automated coin/cash token kiosk installed at the canteen doorway.
  - **Idea 2:** *Native Mobile App with Wireless Buzzer Pagers* — Dedicated mobile app with IoT buzzing coasters like commercial food courts.
  - **Idea 3:** *Zero-Install QR-Based Smart Canteen with Dual-Lane Tokens & PIN Verification* — Lightweight web app via QR code, segregating Express (`#E`) vs Fresh (`#F`) queues with 4-digit PIN verification and live crowd rings.
- **Final Selected Concept & Selection Justification (High Impact / Low Cost):**
  > **Idea 3 was selected.** Physical vending kiosks (Idea 1) require high capital investment (₹25,000+), routine mechanical maintenance, and create physical queue choke points. Wireless buzzing pagers (Idea 2) involve high hardware costs (₹15,000+), loss/damage risks, and battery charging overhead. Idea 3 leverages existing student smartphones and counter screens with zero app installation (scan-and-go QR), zero hardware cost (₹0), operates even without internet via offline LAN/memory fallback, and directly eliminates food theft through the confidential 4-digit PIN verification protocol.

---

### 5. STAGE 4: PROTOTYPE (Low-Cost Working Model) (Week 10–12)

- **Prototype Type:** ☐ Cardboard/Clay | ☐ Paper Sketch | ☑ Digital UI (Figma/Canva) | ☑ Working Full-Stack Web Prototype
- **Total Prototype Cost:** ₹ 0 (Zero Cost — Built with native open-source Node.js, HTML5/CSS3/JS, and free-tier Supabase/Vercel)
- **Materials / Software:** Vanilla HTML5/CSS3/JavaScript, Node.js HTTP runtime (zero npm dependencies), Supabase PostgreSQL, Vercel serverless platform, embedded Reed-Solomon SVG QR generator.
- **Working Mechanism (3 Steps):**
  1. **Scan & Browse:** Student scans table/notice-board QR code, checks live crowd ring (Green/Yellow/Red) and lane wait times, and orders snacks or meals.
  2. **Lane Routing & Token Issuance:** Server automatically routes items into Counter A (Express `#E-xxx`) or Counter B (Fresh `#F-xxx`) and assigns a secret 4-digit PIN.
  3. **Kanban Kitchen & PIN Handshake:** Kitchen vendor advances orders on digital Kanban; counter TV chimes on ready; student provides 4-digit PIN at counter for verified delivery.
- **Prototype Visuals & Verified Interfaces:**
  1. *Student Marketplace UI:* Interactive food catalog, combo savings strip, and active digital token card with live PIN and progress bar.
  2. *Vendor Kitchen POS & Kanban:* Order card progression (`Queued` $\to$ `Preparing` $\to$ `Ready` $\to$ `Delivered`), walk-in creation (`+ Walk-in Express / Fresh`), and real-time inventory stock toggle.
  3. *Counter Overhead TV Display:* Split Ready vs Preparing layout with digital clock and audible audio chime.
  4. *Examiner Split-Screen Viva Demo:* Real-time synchronization accessible via `http://localhost:3000/?view=demo`.

---

### 6. STAGE 5: TEST, ITERATE & VALUE PITCH (Week 13–15)

#### User Feedback & Iteration Table:
| What Worked Well (+) | User Criticism / Issues (-) | Iteration / Change Made |
|---|---|---|
| **1.** Express lane items (Samosa, Chai) were handed over in under 90 seconds without queueing behind cooked orders. | **1.** When campus Wi-Fi network fluctuated, external third-party QR code APIs and CDN scripts failed to load. | **1.** Built a native, self-contained Galois Field GF(256) QR generator (`qr.js`) and in-memory fallback, removing all external CDN and package dependencies. |
| **2.** The 4-digit secret PIN protocol completely eliminated wrongful order pickups and food disputes at the counter. | **2.** Students engaged in conversation near the counter missed seeing their token number turn green on the TV screen. | **2.** Integrated an automatic audible audio chime and pulsing emerald visual animation whenever an order status updates to 'Ready'. |

- **Basic Value & Business Pitch Summary (Tested with 25 Users):**
  - **Value Proposition:** Reduces average canteen wait time by 85% (from 15–20 minutes to 1–3 minutes), prevents 100% of order theft via PIN handshake, and provides real-time crowd visibility directly to students' phones before they walk to the canteen.
  - **Adoption / Sustainability:** Adoptable immediately by the BBS College of Engineering & Technology Canteen Committee and Administration. Zero recurring software fees and zero new hardware expenses. Easily scalable to other campus facilities such as stationery counters, library book issue, and fee deposit desks.

---

### 7. WEEKLY DESIGN JOURNAL LOGBOOK & EVALUATION

| Week | Date | Studio Activity & Milestone | Individual Contribution (Who did what?) | Faculty Sign |
|:---:|:---:|---|---|:---:|
| **W 1–2** | 12/08 | Team formation, theme & charter | **Chetna:** Project charter & role assignment; **Aarav:** Problem scope definition | |
| **W 3–5** | 26/08 | User interviews, persona & empathy map | **Chetna & Aarav:** Conducted 18 student & staff interviews; **Priya:** Survey data analysis; **Rohan:** Persona & Empathy Map drafting | |
| **W 6–7** | 16/09 | Finalized POV & HMW questions | **Rohan:** Formulated POV statement; **Chetna:** Drafted HMW questions; **Aarav:** Faculty mentor review | |
| **W 8–9** | 07/10 | Brainstorming & concept selection | **All Members:** Ideation workshop, dot voting & Impact-Effort matrix; **Chetna:** Selected Dual-Lane QR concept | |
| **W 10–12** | 28/10 | Built low-cost working prototype | **Chetna & Rohan:** Node.js server, Supabase schema & API routes; **Aarav & Priya:** Student UI, Vendor Kanban & TV Board | |
| **W 13–14** | 11/11 | User testing & 1st iteration | **All Members:** Field testing with 25 campus users; **Chetna:** Integrated offline qr.js & audio chimes | |
| **W 15** | 25/11 | Final Pitch deck & Viva prep | **All Members:** Pitch deck preparation, split-screen viva demo validation & design journal documentation | |

**External Exam Eligibility Checklist:**  
☑ Completed Design Journal &nbsp;&nbsp;&nbsp;&nbsp; ☑ Working Prototype &nbsp;&nbsp;&nbsp;&nbsp; ☑ 5-Min Pitch Deck &nbsp;&nbsp;&nbsp;&nbsp; ☑ Original Work Declaration  

- **Faculty Facilitator Signature & Date:** __________________________ &nbsp;&nbsp;&nbsp;&nbsp; **Internal Assessment Marks (Out of 50):** _________
- **External Examiner Signature & Date:** __________________________ &nbsp;&nbsp;&nbsp;&nbsp; **External Assessment Marks (Out of 50):** _________
