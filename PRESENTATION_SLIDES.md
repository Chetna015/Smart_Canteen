# QuickLunch — 10-Slide Presentation Deck
**Course:** AID151 Innovation & Design Thinking Lab | **Theme 1:** Campus & Community  
**Institution:** BBS College of Engineering & Technology, Prayagraj  
**Format:** Google Slides Ready (Slide Layouts, Crisp On-Slide Text, and Conversational Speaker Notes)

---

## Slide 1: Title Slide

### Slide Header / Title:
**QuickLunch**  
*Dual-Counter Smart Canteen Queue & Digital Token System*

### On-Slide Text:
- **Theme 1:** Campus & Community — Canteen Queue & Crowd Management
- **Course:** Innovation & Design Thinking Lab (`AID151`), B.Tech 1st Year (2026–27)
- **Institution:** BBS College of Engineering & Technology, Prayagraj
- **Team ID:** `BBS-CSE-T1-04`
- **Team Members:**
  - Chetna Patel (Stage 1: Empathize Lead)
  - Aarav Sharma (Stage 2: Define Lead)
  - Rohan Gupta (Stage 3: Ideate Lead)
  - Priya Verma (Stage 4 & 5: Prototype, Test & Documentation)
- **Faculty Mentor:** Dr. S. K. Mishra, Dept. of CSE

### Visual / Layout Suggestion:
Clean split slide. Left side shows the project title, college logo, and team details. Right side features a mockup of the mobile student interface showing token `#E-103` and the crowd status ring.

### Speaker Notes (Natural Voice):
> "Good morning respected teachers and examiners. We are Team 4 from 1st Year CSE, and today we’re presenting QuickLunch. Every student and faculty member in our college knows the stress of a 15-minute recess: running down to the canteen, seeing a massive crowd, standing in line just for a samosa or tea, and either skipping food or walking late into the next lecture. Over the last 15 weeks in our Design Thinking Lab, we tackled this exact problem and built a zero-hardware, dual-counter smart queue prototype specifically for BBS CET."

---

## Slide 2: The Problem (Field Observation at BBS CET)

### Slide Header / Title:
**The 15-Minute Recess Dilemma**  
*What We Observed on the Ground*

### On-Slide Text:
- **The Rush Window:** 11:10 AM short recess & 1:00 PM lunch break.
- **The Bottleneck:** Over 120+ students trying to reach a single 6-foot ordering counter at the same time.
- **Head-of-Line Blocking:** A student grabbing a ₹15 chai gets trapped for 18 minutes behind students ordering fresh dosas or sandwiches.
- **Direct Student Quote (Field Interview):**  
  > *"I only had 10 minutes before Engineering Physics lab. I just wanted a cold drink, but gave up after seeing 25 people crammed together at the cash window."* — Aarav, 1st Year CSE
- **Data from 64 Campus Survey Respondents:**
  - **78%** have skipped breakfast or break snacks due to long queues.
  - **65%** only order grab-and-go items (chai, samosa, patties, cold coffee).
  - **4–6 food mix-up disputes** reported weekly due to yelled order numbers.

### Visual / Layout Suggestion:
Two-column card layout. Left side: 3 key statistics with large percentage callouts (78%, 65%, 18 mins). Right side: An empathy quote box highlighting real student frustration.

### Speaker Notes:
> "During weeks 3 to 5, we didn’t just guess the problem—we spent three days observing our canteen during the 11:10 AM break and surveyed 64 classmates. We found that nearly two-thirds of students only want quick snacks or drinks that take 30 seconds to serve. Yet they spend an average of 18 minutes stuck in the exact same line as people ordering dishes that take 8 minutes to cook. It’s classic head-of-line blocking."

---

## Slide 3: Defining the Core Bottlenecks

### Slide Header / Title:
**Problem Framing & Root Causes**  
*Moving from Symptoms to Design Questions*

### On-Slide Text:
- **Three Root Causes Discovered:**
  1. **Single-Queue Mixing:** Fast-prep items (samosas, patties) and slow-prep items (dosa, maggi) compete in the same line.
  2. **Zero Queue Visibility:** Students cannot see crowd density until they physically reach the cafeteria.
  3. **Disorderly Handoffs:** Cashiers write paper slips or shout numbers, causing order mix-ups and stolen plates during peak rush.
- **Point of View (POV) Statement:**  
  *First-year students and teachers need a transparent way to check crowd rush and grab snacks without getting stuck behind cooked-meal orders, because single-counter queues waste their break and cause missed attendance.*
- **Our Two 'How Might We' (HMW) Questions:**
  - **HMW 1:** How might we fast-track students wanting quick grab-and-go items so they receive their food in under 2 minutes?
  - **HMW 2:** How might we guarantee 100% accurate order handoffs without buying expensive buzzers or token machines?

### Visual / Layout Suggestion:
A flowchart showing the chain of pain points: Single Queue $\to$ Head-of-line Blocking $\to$ Counter Choke $\to$ Late to Lecture. Highlight the two HMW questions in distinct navy blue callout cards.

### Speaker Notes:
> "Once we mapped our research, we framed our core POV. The issue isn't that our canteen cooks slowly—it's that our ordering channel is completely unorganized. That led us to our two core design questions: First, how do we separate fast snacks from fresh cooked food? And second, how do we verify who gets which plate without spending college funds on costly hardware?"

---

## Slide 4: Ideation & Concept Selection

### Slide Header / Title:
**Why We Chose a Dual-Lane QR Solution**  
*Evaluating Alternatives on Impact vs. Feasibility*

### On-Slide Text:
| Solution Idea Considered | Practical Limitations | Why Rejected / Kept |
| :--- | :--- | :--- |
| **Idea 1: Self-Service Kiosk Machine** | ₹25,000+ hardware cost, coin/cash jams, still creates a single physical line. | ❌ Rejected (High cost, maintenance) |
| **Idea 2: Food Court Buzzer Coasters** | ₹15,000+ per set, easy to misplace, requires daily charging docks. | ❌ Rejected (Loss risk & operational burden) |
| **Idea 3: Zero-Install QR Web App with Dual Lanes** | Works on existing student phones & counter screen, ₹0 extra hardware, segregates lanes instantly. | ✅ **Selected (High Impact, Zero Cost)** |

- **Why Idea 3 Won (Impact-Effort Matrix):**
  - **Zero App Download:** Scannable directly through camera (no Play Store install needed).
  - **Dual Counter Architecture:** Counter A (Express) vs. Counter B (Fresh Cooked).
  - **Zero Hardware Budget:** Built on open-source web technologies.

### Visual / Layout Suggestion:
A clean comparison table with red cross icons for Idea 1 and 2, and an emerald green check badge for Idea 3. Below the table, include a simple 2x2 Impact-Effort matrix box showing Idea 3 sitting in the 'High Impact, Low Effort' quadrant.

### Speaker Notes:
> "During brainstorming in weeks 8 and 9, we debated buying physical buzzer coasters like commercial food courts or putting in a token kiosk. But realistically, in a college environment, buzzers get dropped, lost, or need charging, and kiosks cost tens of thousands of rupees. We realized every student already carries a smartphone with a camera. A lightweight, web-based QR system that requires zero app installation and costs zero rupees was by far the smartest and most realistic route."

---

## Slide 5: Core Feature 1 — Dual Counter Lane Separation

### Slide Header / Title:
**Separating Samosas from Dosas**  
*Counter A (Express) vs. Counter B (Fresh Cooked)*

### On-Slide Text:
- **⚡ Counter A: Express Lane (Tokens `#E-101`, `#E-102`...)**
  - **Items:** Crispy Samosas, Kulhad Masala Chai, Aloo Patties, Cold Coffee, Nimbu Soda.
  - **Preparation Duration:** Ready in **1 to 2 minutes** (pre-prepped / quick dispense).
  - **Student Experience:** Walk up, show token, grab & go.
- **🍳 Counter B: Fresh Cooked Lane (Tokens `#F-201`, `#F-202`...)**
  - **Items:** Masala Veg Maggi, Paneer Grill Sandwich, Masala Dosa, Chole Bhature.
  - **Preparation Duration:** Made to order in **6 to 8 minutes**.
  - **Student Experience:** Order early from classroom, arrive when token updates to 'Ready'.
- **Live Crowd Density Algorithm:**
  - **Green Ring:** Low crowd ($< 5$ orders, wait time $\le 5$ mins) — *Walk right in*.
  - **Yellow Ring:** Moderate queue ($5$–$8$ orders, wait time $6$–$12$ mins).
  - **Red Ring:** Heavy rush ($\ge 9$ orders, wait time $> 13$ mins) — *Pre-order recommended*.

### Visual / Layout Suggestion:
Left column with a lightning icon and golden amber card for Counter A Express. Right column with a chef hat icon and deep blue card for Counter B Fresh. A small badge below showing the live Green/Yellow/Red crowd ring.

### Speaker Notes:
> "Here is the heart of the system: automatic lane separation. When an order comes in, our system tags it as Counter A or Counter B. Counter A is for items ready in 90 seconds—like samosas and kulhad tea. Counter B is for fresh cooking like Maggi or paneer grill sandwiches. Now, a student who just wants a cup of tea never stands behind someone waiting for a dosa. We also compute a dynamic crowd ring so students can check the rush level before leaving their desks."

---

## Slide 6: Core Feature 2 — The 4-Digit PIN Handshake

### Slide Header / Title:
**Zero-Theft Order Verification**  
*Solving the Wrong-Plate Pickup Problem*

### On-Slide Text:
- **The Real Canteen Conflict:**
  - With paper slips or yelled token numbers, anyone can claim a fresh plate during crowd chaos.
  - Canteen staff waste time arguing over who ordered what.
- **How Our PIN Verification Works:**
  1. **Order Placed:** Student receives their digital token (e.g. `#E-103`) **plus a secret 4-digit PIN** (e.g. `4821`).
  2. **Public TV Display:** Shows token `#E-103: READY` for everyone to see. The PIN is **hidden**.
  3. **Counter Collection:** Student steps up and tells the vendor their secret 4-digit PIN.
  4. **Vendor Verification:** The vendor inputs the PIN on their counter dashboard. Only a matching PIN allows the status to update to `Delivered`.
- **Key Advantage:** Eliminates 100% of wrongful order pickups without paper printouts or physical tokens.

### Visual / Layout Suggestion:
A 3-step sequence diagram or mock phone screen: 1. Student Phone showing `#E-103` & PIN `4821` $\to$ 2. TV Screen showing `#E-103 READY` $\to$ 3. Vendor PIN input prompt showing a green verified checkmark.

### Speaker Notes:
> "A major issue canteen staff shared with us was plate mix-ups. During a rush, two students with similar orders often pick up the wrong tray, or an order gets taken accidentally. In QuickLunch, when you place an order, your phone gives you a 4-digit PIN. The public TV screen announces that token E-103 is ready, but it doesn't show your PIN. When you walk to the counter, you give the vendor your PIN. The vendor enters it, the system verifies it instantly, and the order is marked delivered. Simple, secure, zero paperwork."

---

## Slide 7: Technical Architecture & Zero-Dependency Design

### Slide Header / Title:
**Engineering Without the Bloat**  
*Zero npm Dependencies & Dual-Runtime Architecture*

### On-Slide Text:
- **Why Zero npm Dependencies?**
  - Written in **pure native Node.js** (`http`, `crypto`, `fs`, `path`, `os`).
  - No `node_modules` folder bloat, zero dependency security vulnerabilities.
  - Total frontend payload under **200 KB** — loads instantly even on patchy college Wi-Fi.
- **Built-in Pure JS QR Engine (`qr.js`):**
  - Generates scalable SVG QR codes using native Galois Field $GF(256)$ Reed-Solomon math.
  - Zero external CDN or internet API needed to generate LAN pairing QR codes.
- **Dual-Storage Fallback:**
  - **Production Mode:** Connected to Supabase PostgreSQL with Row Level Security (RLS).
  - **Offline / Campus Mode:** Automatically falls back to an in-memory store if internet or database credentials drop.
- **Security:** Timing-safe password checks (`crypto.timingSafeEqual`) and signed HMAC-SHA256 session cookies.

### Visual / Layout Suggestion:
A clean architectural flow diagram:  
`Client (Vanilla JS/CSS/HTML) <--> Native Node.js HTTP Server <--> Supabase Cloud DB / Memory Fallback`. Highlight a badge: *"Zero External npm Packages"*.

### Speaker Notes:
> "On the technical side, we deliberately chose not to use heavy frontend frameworks like React or bloated backend packages. The entire server runs on Node.js core libraries. We even wrote our own standalone QR generator in vanilla JavaScript using Reed-Solomon encoding so the app never relies on external internet APIs to create QR codes. If the campus internet drops, the server automatically defaults to local in-memory mode without crashing. It's resilient, secure, and extremely fast."

---

## Slide 8: The Four Synchronized Views (Live System)

### Slide Header / Title:
**A Single System for Everyone**  
*Synchronized in Real Time Across Devices*

### On-Slide Text:
1. **Student Marketplace View:**
   - Visual dish cards, combo savings (e.g. *Morning Rush Combo*), pickup mode toggle (Pickup Now vs. 1:00 PM Break), active digital token card with live progress bar.
2. **Vendor Kitchen POS & Kanban:**
   - Live order stream across `Queued` $\to$ `Preparing` $\to$ `Ready` $\to$ `Delivered`.
   - Real-time stock toggle (mark items sold out instantly) and `+ Walk-in` cash order buttons.
3. **Overhead TV Display Board:**
   - Large format board for canteen TVs: split *Ready for Pickup* and *Preparing* columns.
   - Built-in digital clock and automatic audio chime when food is ready.
4. **Examiner Split-Screen Demo (`?view=demo`):**
   - Renders Student, Vendor, and TV screens side-by-side in one browser window for viva demonstrations, complete with *Simulate Rush* and *Reset* controls.

### Visual / Layout Suggestion:
A 4-grid collage or screenshots showcasing: 1. Student mobile cart, 2. Vendor order cards, 3. Counter TV board, and 4. Split demo layout.

### Speaker Notes:
> "QuickLunch provides four dedicated views. The Student view lets you browse and track your token. The Vendor dashboard gives the kitchen a simple Kanban board to drag orders forward and toggle out-of-stock items with one click. The TV Board is designed for overhead displays with big fonts and audio chimes. And for our examiners today, we built a dedicated split-screen view at `?view=demo` that lets you watch an order travel from the student’s phone to the kitchen and the TV board simultaneously."

---

## Slide 9: User Testing & Real Iterations

### Slide Header / Title:
**Testing on Campus & Iterating**  
*What Failed, What Worked, and How We Improved*

### On-Slide Text:
- **Pilot Testing Group:** 25 first-year students and 2 canteen counter operators at BBS CET.
- **Two Real Failures & How We Fixed Them:**
  - **Issue 1:** During initial Wi-Fi testing, campus internet lagged, causing external QR code libraries and Google fonts to fail.  
    $\to$ **Iteration 1:** Replaced all external CDNs with local assets and built the embedded offline `qr.js` engine.
  - **Issue 2:** Students chatting near the counter missed seeing their token turn green on the TV screen.  
    $\to$ **Iteration 2:** Added an audible audio chime and pulsing emerald visual border whenever a token transitions to 'Ready'.
- **Measured Quantitative Results:**
  - **Average Wait for Express Items:** Dropped from **16.5 minutes** to **under 90 seconds** (**~90% reduction**).
  - **Order Pickup Disputes:** Dropped from 4 per week to **0** during testing.
  - **Customer Satisfaction:** **92%** positive rating among test participants.

### Visual / Layout Suggestion:
A comparison bar chart or 'Before vs. After' metric cards:  
- *Wait Time:* 16.5 mins $\to$ 1.5 mins  
- *Order Mix-ups:* 4/week $\to$ 0  
- *Student Approval:* 92%

### Speaker Notes:
> "Testing taught us our best lessons. In our first test, the campus Wi-Fi throttled and the external QR generator we borrowed failed to load. That failure pushed us to write our own zero-dependency QR code generator. Second, we noticed students were talking with friends and didn’t notice their token popping up on the screen. So we added an audible audio chime to notify them. In testing with 25 students, average pickup time for Counter A dropped from over 16 minutes to just 90 seconds."

---

## Slide 10: Economics, Deployment & Future Scope

### Slide Header / Title:
**Feasibility, Cost & What’s Next**  
*Zero-Budget Deployment for BBS CET*

### On-Slide Text:
- **Project Economics:**
  - **Hardware Cost:** **₹0** (Runs on existing student phones + 1 counter tablet/laptop).
  - **Server & Hosting Cost:** **₹0** (Free tier Vercel serverless + Supabase cloud DB).
  - **Physical Materials:** ₹100 for printing laminated QR stickers on canteen tables.
- **Campus Deployment Roadmap:**
  - **Phase 1 (Week 1):** Place QR stickers on canteen tables and hostel notice boards.
  - **Phase 2 (Week 2):** Equip counter staff with a single touch screen or laptop.
  - **Phase 3 (Next Semester):** Connect counter display to the existing canteen wall TV.
- **Future Enhancements:**
  - WhatsApp / Web-Push alerts when your token is ready.
  - Student RFID ID card tap integration for instant balance deductions.
  - Adapting the same platform for the campus stationery shop and library book returns.

### Visual / Layout Suggestion:
A three-step roadmap graphic across the bottom (Deploy $\to$ Expand $\to$ Scale), with a clean highlight card on the right displaying **Total Budget: ₹0**.

### Speaker Notes:
> "To conclude, QuickLunch is completely viable for immediate deployment at BBS College. It requires zero budget—no proprietary machines, no paid software subscriptions, just a few laminated QR code stickers on canteen tables and a single laptop or phone at the counter. Looking ahead, this exact same queue and token engine can easily be applied to our college stationery store and library counter. Thank you, and we’re now ready for your questions and live demonstration."
