# COSMOCARE — BOLD HOLOGRAPHIC SPACE MEDICAL COMMAND CENTER

Design and build a high-fidelity desktop web application for **CosmoCare**, an AI-powered medical intelligence system designed to monitor astronauts during long-duration deep-space missions.

This is a hackathon prototype, but it should feel like a believable next-generation spacecraft medical operations system rather than a generic futuristic dashboard.

The design should be:

**BOLD + STRIKING + FUTURISTIC + PREMIUM**

while simultaneously being:

**EXTREMELY READABLE + ORGANIZED + INTUITIVE + FUNCTIONAL**

The interface should feel impressive within the first 5 seconds, but a user should immediately understand where to look and what actions to take.

---

# CORE VISUAL CONCEPT

The central visual element is a **large interactive 3D spacecraft**.

The spacecraft is the physical environment.

CosmoCare's interface appears as **transparent holographic glass HUD panels floating around the spacecraft**.

Think:

**SpaceX mission control**
+
**advanced medical telemetry**
+
**transparent holographic HUD**
+
**premium modern product design**

Do NOT make it look like generic cyberpunk.

Do NOT make it look like a gaming HUD.

Do NOT make every element a rounded glass card.

The goal is a sophisticated, restrained sci-fi aesthetic.

---

# DESIGN PRINCIPLE

The hierarchy should be:

SPACE ENVIRONMENT
↓
3D SPACECRAFT
↓
HOLOGRAPHIC UI
↓
HEALTH DATA
↓
HEALTH INTELLIGENCE
↓
ACTIONS

The spacecraft should remain visible through the interface.

The UI should feel like it is **floating in the same physical space as the spacecraft**.

---

# COLOR SYSTEM

Use an extremely dark space background.

Base:

- near-black
- deep navy
- cool charcoal

Primary accent:

- cyan
- teal
- subtle electric blue

Status colors:

GREEN = Nominal
YELLOW = Monitor
ORANGE = Elevated Risk
RED = Critical

Status colors should only be used when communicating health state.

Avoid rainbow gradients.

Avoid excessive neon.

Use cyan/teal as the primary CosmoCare identity.

---

# GLASS / HOLOGRAPHIC DESIGN

Use transparent glass panels with subtle blur.

Panels should use:

- translucent dark backgrounds
- backdrop blur
- very thin borders
- subtle internal highlights
- small illuminated corners
- extremely restrained glow

Do not make the entire interface heavily blurred.

Create different levels of transparency.

Secondary UI:
very transparent.

Important analytics:
moderately transparent.

Selected/critical information:
slightly darker and more opaque.

The user should still see the spacecraft behind the panels.

---

# IMPORTANT

This should NOT become:

"20 floating glass rectangles over a spaceship."

Instead, use:

- asymmetrical layouts
- floating panels
- thin HUD lines
- small corner brackets
- technical labels
- subtle connector lines
- negative space
- overlapping layers
- varying panel sizes

Some information can exist directly on the HUD without a container.

The interface should feel spatial.

---

# TYPOGRAPHY

Use a clean modern sans-serif.

Prioritize readability.

Use:

- large clean numbers
- small uppercase technical labels
- generous letter spacing for telemetry labels
- strong hierarchy
- high contrast

Example:

COSMOCARE

MISSION OVERVIEW

DAY 147

94

HEALTH

NOMINAL

Avoid overly futuristic fonts.

This is a medical system, so information must be immediately readable.

---

# MAIN SCREEN — MISSION OVERVIEW

Create the primary mission dashboard.

The 3D spacecraft should occupy the majority of the central viewport.

Do not bury the spacecraft underneath UI.

The screen should immediately communicate:

1. Where the astronauts are
2. How they are doing
3. Who needs attention
4. Why they need attention
5. What CosmoCare recommends

---

# TOP BAR

Minimal floating navigation.

Left:

COSMOCARE

AI MEDICAL INTELLIGENCE

Center:

ARTEMIS FORWARD

MISSION DAY 147

Right:

● EARTH LINKED

3 ACTIVE ALERTS

---

# LEFT NAVIGATION

Create a slim translucent navigation rail.

Items:

MISSION OVERVIEW
CREW HEALTH
HEALTH INTELLIGENCE
MISSION READINESS
MEDICAL EVENTS
RECOVERY
ASTROTRIAGE
AI ASSISTANT

The selected page should have:

- subtle cyan highlight
- thin illuminated edge
- slightly higher opacity

Do not make the sidebar huge.

---

# 3D SPACECRAFT

The spacecraft is the visual centerpiece.

Display a realistic futuristic exploration spacecraft.

The spacecraft should have identifiable areas such as:

- command
- habitation
- medical
- engineering
- life support
- communications

Allow the user to:

- rotate
- orbit
- zoom
- pan
- reset the camera

The spacecraft should have subtle cinematic lighting.

Use a sparse star field behind it.

Avoid excessive particles.

---

# CREW LOCATIONS

Four astronauts are physically positioned throughout the spacecraft.

Their locations are represented by small holographic markers.

Crew:

MAYA CHEN
COMMANDER
GREEN

ALEX RIVERA
FLIGHT ENGINEER
YELLOW

SAM PATEL
MISSION SPECIALIST
ORANGE

JORDAN LEE
SCIENCE OFFICER
RED

Each marker should:

- sit at the astronaut's location
- use the corresponding status color
- subtly pulse
- show the astronaut's name
- respond to hover
- be clickable

When hovered:

MAYA CHEN
COMMANDER
● NOMINAL

When clicked:

- highlight the astronaut
- smoothly move the camera toward them
- open their health information
- visually connect the marker to the health panel

---

# CREW STATUS PANEL

Place a compact translucent crew panel on one side.

Title:

CREW STATUS

4 CREW MONITORED

Show four compact rows.

MAYA CHEN
COMMANDER
● NOMINAL
94 HEALTH

ALEX RIVERA
FLIGHT ENGINEER
● MONITOR
74 HEALTH

SAM PATEL
MISSION SPECIALIST
● ELEVATED
58 HEALTH

JORDAN LEE
SCIENCE OFFICER
● CRITICAL
28 HEALTH

Each row should be clickable.

The spacecraft marker and crew row must represent the same state.

---

# HEALTH SUMMARY

Show three primary metrics for the selected astronaut:

HEALTH
94

RECOVERY
91

READINESS
92

Use large numbers and small labels.

Do not turn these into giant cards.

They can appear as part of a floating HUD panel.

---

# PERSONAL BASELINE

CosmoCare must emphasize **personalized health monitoring**.

Show current values compared with the astronaut's own baseline.

Example:

PERSONAL BASELINE

RESTING HEART RATE

BASELINE
68 BPM

CURRENT
76 BPM

HRV

BASELINE
62 ms

CURRENT
48 ms

SLEEP

BASELINE
7.4 HR

CURRENT
5.9 HR

Make this visually obvious.

The system should communicate:

"This is abnormal for this astronaut."

not merely:

"This is outside a generic medical range."

---

# HEALTH INTELLIGENCE

Create a highly prominent holographic panel.

Example:

COSMOCARE INTELLIGENCE

⚠ EMERGING FATIGUE PATTERN

CONTRIBUTING FACTORS

↓ Sleep quality
↓ HRV
↑ Resting heart rate
↓ Recovery

COSMOCARE ASSESSMENT

Multiple deviations from personal baseline indicate increasing physiological stress.

This section is extremely important.

CosmoCare should not look like a dashboard that simply assigns a red/yellow/green status.

It must explain:

WHY is the astronaut abnormal?

---

# RECOMMENDATION

Every alert should answer:

WHAT SHOULD WE DO?

Example:

COSMOCARE RECOMMENDS

MONITOR

• Increase physiological monitoring
• Encourage rest
• Hydration
• Recheck metrics in 30 min

For orange:

PREVENT

• Reduce workload
• Targeted health assessment
• Hydration/rest protocol
• Notify medical personnel

For red:

RESPOND

• Initiate AstroTriage
• Immediate crew action
• Begin medical protocol
• Contact flight surgeon

Make the recommended action visually obvious.

---

# HEALTH TRENDS

Include a small number of useful charts.

Do NOT create a dashboard full of charts.

Prioritize:

Heart Rate
HRV
SpO₂
Sleep
Recovery

Charts should use:

- transparent backgrounds
- subtle grid lines
- thin data lines
- personal baseline/reference ranges
- minimal labels

Charts should feel like holographic medical telemetry.

---

# EARTH COMMUNICATION

Create a highly visible mission communication indicator.

Normal:

● EARTH LINKED

When simulated:

⚠ EARTH LINK DELAYED

18:00 RESPONSE DELAY

Then display:

LOCAL DECISION SUPPORT ACTIVE

This is a major demonstration feature.

The visual design should communicate why autonomous onboard medical intelligence matters during deep-space missions.

---

# ASTROTRIAGE

Create a medical event interface.

MEDICAL EVENT DETECTED

CRITICAL VITALS

SYMPTOMS

CONTRIBUTING FACTORS

COSMOCARE ASSESSMENT

RECOMMENDED RESPONSE

ESCALATE TO FLIGHT SURGEON

Include the disclaimer:

"CosmoCare provides medical decision support and does not replace qualified medical professionals."

Use simulated/demo health data.

---

# RECOVERY

Create a recovery visualization.

MEDICAL EVENT

↓

INTERVENTION

↓

RECOVERY MONITORING

↓

RETURN TOWARD BASELINE

Example:

RECOVERY SCORE

42 → 58 → 71 → 86

Then:

✓ RETURNING TOWARD PERSONAL BASELINE

The recovery system should demonstrate that CosmoCare continues monitoring after the emergency.

---

# DEMO SCENARIOS

Create a scenario selector.

NORMAL

Maya:
Nominal.

FATIGUE

Alex:
Declining sleep + HRV + recovery.

DEVELOPING ILLNESS

Sam:
Multiple physiological abnormalities.

MEDICAL EMERGENCY

Jordan:
Critical health state.

Switching scenarios should update the entire dashboard consistently.

---

# VISUAL STATES

GREEN:

Calm, stable, minimal visual intensity.

YELLOW:

Subtle warning glow.

ORANGE:

More prominent warning elements.

RED:

Strong but professional warning state.

Do not flash the entire screen.

Do not make the application look like an alarm system.

Even critical states should remain readable and controlled.

---

# INTERACTION DESIGN

Every important element should have a clear interaction.

Crew marker:

Hover → identify astronaut.

Click → focus astronaut.

Crew row:

Hover → highlight marker.

Click → focus astronaut.

Alert:

Click → Health Intelligence.

Recommendation:

Click → intervention details.

Chart:

Hover → exact value.

Navigation:

Click → corresponding page.

Avoid dead buttons.

---

# MOTION

Use subtle motion.

Examples:

- holographic marker pulses
- telemetry updates
- graph animations
- smooth camera transitions
- panel transitions
- subtle scan effects
- status changes

Animations should be fast and intentional.

Do not make the interface constantly move.

---

# RESPONSIVENESS

Prioritize desktop.

This is a mission-control interface.

For smaller screens:

- collapse side panels
- use drawers
- keep spacecraft visible
- preserve crew selection
- prioritize critical information

---

# INFORMATION HIERARCHY

This is extremely important.

Despite the futuristic aesthetic, the user must be able to scan the dashboard immediately.

Priority:

### LEVEL 1

Who needs attention?

### LEVEL 2

What is wrong?

### LEVEL 3

Why is it happening?

### LEVEL 4

What should we do?

### LEVEL 5

What are the detailed metrics?

Do not allow decorative effects to compete with this hierarchy.

---

# AESTHETIC BALANCE

The design should be approximately:

40% futuristic visual identity
60% usability and information clarity

It should look bold enough to impress a hackathon judge but practical enough that a medical operator could actually use it.

---

# FINAL EXPERIENCE

When someone first opens CosmoCare, they should immediately see:

A beautiful 3D spacecraft in deep space.

Four astronauts distributed throughout it.

Small holographic crew markers.

Transparent health HUDs surrounding the spacecraft.

One astronaut clearly showing a warning state.

A health intelligence panel explaining WHY.

A recommendation explaining WHAT TO DO.

Earth communication status showing whether help is delayed.

Everything should feel like one coherent system.

The final impression should be:

> "This is what an AI medical system aboard a deep-space spacecraft might actually look like."

Not:

> "This is a normal dashboard with a space theme."

Build a bold, striking, premium, highly readable interface with a strong visual identity while maintaining the usability and information hierarchy expected from a professional dashboard.