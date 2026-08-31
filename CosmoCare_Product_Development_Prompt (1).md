# CosmoCare --- Full Product Development Prompt

You are helping develop **CosmoCare**, a futuristic AI-powered medical
intelligence and crew health monitoring system designed for
long-duration space missions.

This is a **hackathon prototype**, so prioritize a polished, convincing,
highly interactive demo over unnecessary backend complexity.

The goal is to make the product feel like a **real NASA/SpaceX-style
mission control health system**, while clearly demonstrating the core
concept:

> **Monitor → Detect → Understand → Act → Recover**

CosmoCare should not feel like a generic medical dashboard with a space
theme. The **spacecraft itself should become the primary interface for
understanding where crew members are and how they are doing.**

Use the provided visual reference/mockup as inspiration for the overall
3D mission-control aesthetic.

------------------------------------------------------------------------

# 1. CORE VISUAL CONCEPT

The Mission Overview should revolve around a **large interactive 3D
spacecraft** in the center of the screen.

Do NOT use a planet/sphere as the primary interaction surface.

Instead:

-   Render a detailed futuristic spacecraft using **Three.js / React
    Three Fiber**
-   Load the spacecraft from a `.glb`, `.gltf`, or `.fbx` model
-   Allow the user to:
    -   orbit/rotate the spacecraft
    -   zoom
    -   pan
    -   reset the camera
-   Give the spacecraft a subtle space environment:
    -   extremely dark background
    -   sparse stars
    -   subtle atmospheric lighting
    -   cinematic but restrained lighting
    -   spacecraft should remain the visual focal point

The aesthetic should be:

**modern spacecraft engineering + medical mission control + futuristic
HUD**

Avoid:

-   cheesy sci-fi neon
-   excessive glowing effects
-   giant gradients
-   cyberpunk aesthetics
-   overly rounded SaaS cards
-   excessive glassmorphism

Think:

**NASA mission control × SpaceX interface × advanced medical telemetry
system**

The interface should feel expensive, precise, calm, and professional.

------------------------------------------------------------------------

# 2. 3D CREW INTERACTION

The four astronauts should exist as **spatially positioned entities on
the spacecraft**.

## Maya Chen

-   Role: Commander
-   Status: GREEN / NOMINAL
-   Health: 94
-   Recovery: 91
-   Readiness: 92

## Alex Rivera

-   Role: Flight Engineer
-   Status: YELLOW / MONITOR
-   Health: 74
-   Recovery: 62
-   Readiness: 63

## Sam Patel

-   Role: Mission Specialist
-   Status: ORANGE / ELEVATED
-   Health: 58
-   Recovery: 41
-   Readiness: 22

## Jordan Lee

-   Role: Science Officer
-   Status: RED / CRITICAL
-   Health: 28
-   Recovery: 18
-   Readiness: 0

Place a small marker at each astronaut's physical location on the
spacecraft.

**Known failure mode --- do not repeat it:** in previous iterations,
crew markers have drifted off the spacecraft and ended up floating in
empty space near it rather than sitting on it. Markers must read as
part of the ship, not decorations hovering beside it. Each marker's
position must be derived from an actual point on (or just above) the
spacecraft's surface/mesh --- e.g. anchored to a named hull location or
attachment point on the model --- never a loose world-space coordinate
that merely looks close to the ship from one angle. Verify placement
from multiple camera angles and zoom levels, since a marker can look
correctly placed from the default view and still be floating once the
camera orbits.

The markers should:

-   sit directly on or against the spacecraft's hull/mesh --- never
    detached or floating off the ship
-   stay correctly anchored to that surface position from every camera
    angle and zoom level, including after rotating/orbiting
-   move naturally when the spacecraft rotates
-   use status colors
-   subtly pulse
-   be clearly clickable
-   have hover states
-   display the astronaut's name/status on hover or selection

Example:

**MAYA CHEN**\
COMMANDER\
● NOMINAL

When clicked:

1.  Highlight their marker
2.  Smoothly move/zoom the camera toward their location
3.  Open their health analytics
4.  Highlight the corresponding crew member throughout the UI

This should feel like:

> "I'm looking at the spacecraft, and I'm selecting the person
> physically located here."

------------------------------------------------------------------------

# 3. MISSION OVERVIEW

The default screen should communicate the entire mission state at a
glance.

Top bar:

**COSMOCARE**

Mission Command · 3D Health View

**Artemis Forward --- Day 147**

Right side:

**EARTH LINKED**

**3 ALERTS**

and optionally:

**MONITOR → DETECT → UNDERSTAND → ACT**

------------------------------------------------------------------------

# 4. LEFT SIDEBAR

Use a compact professional navigation system.

Navigation:

-   Mission Overview
-   Crew Health
-   Health Intelligence
-   Mission Readiness
-   Medical Events
-   Recovery
-   Medical Resources
-   AstroTriage
-   AI Assistant

Keep the sidebar visually restrained.

The 3D spacecraft should dominate the page.

------------------------------------------------------------------------

# 5. LEFT INFORMATION PANEL

On the Mission Overview page, display:

## CREW STATUS SUMMARY

4 crew monitored

Four status counters:

**1 NOMINAL**

**1 MONITOR**

**1 ELEVATED RISK**

**1 CRITICAL**

Below that, display compact crew cards.

Each card should contain:

-   avatar/initials
-   name
-   role
-   status
-   Health
-   Recovery
-   Readiness
-   small heart-rate trend
-   current alert

These cards should also be clickable.

Clicking a crew card should perform the same action as clicking that
astronaut's marker in the 3D spacecraft.

------------------------------------------------------------------------

# 6. HABITAT TELEMETRY

Show environmental information such as:

-   O₂ --- 91%
-   CO₂ --- 0.04%
-   Temperature --- 72.4°F
-   Pressure --- 14.7 PSI

Potentially include:

-   radiation
-   humidity
-   cabin pressure
-   water availability
-   life support status

Keep this compact.

------------------------------------------------------------------------

# 7. RIGHT SIDEBAR

The right side should dynamically display information relevant to the
selected crew member.

If nobody is selected:

### CREW HEALTH STATUS

Show the most important active crew alerts.

If an astronaut is selected:

### SELECTED CREW MEMBER

For example:

**Sam Patel**\
Mission Specialist

Health: 58\
Recovery: 41\
Readiness: 22

Then show:

### CARDIAC

Current HR: 82 BPM

with a small trend graph.

Then:

### CURRENT ALERT

⚠ Emerging physiological stress pattern detected.

------------------------------------------------------------------------

# 8. THE MOST IMPORTANT FEATURE: HEALTH INTELLIGENCE

Do NOT simply show:

> Elevated Risk

The entire point of CosmoCare is that it explains **why**.

Create a dedicated **Health Intelligence** experience.

Example:

## Emerging Fatigue Pattern Detected

**Risk: ELEVATED**

### Contributing factors

-   ↓ Sleep quality
-   ↓ HRV
-   ↑ Resting heart rate
-   ↓ Recovery score

Then:

### COSMOCARE ASSESSMENT

> Multiple deviations from the astronaut's personal baseline indicate
> increasing physiological stress.

Then display confidence/strength indicators if appropriate.

The system should visually communicate that CosmoCare is **connecting
multiple signals**, rather than reacting to a single abnormal number.

------------------------------------------------------------------------

# 9. PERSONAL BASELINES

This is extremely important.

Do not only compare astronauts against generic "normal human" ranges.

Each astronaut should have a **personal baseline**.

For example:

Alex:

-   Resting HR baseline: 68 BPM
-   Current: 76 BPM
-   HRV baseline: 62 ms
-   Current: 48 ms
-   Sleep baseline: 7.4 hr
-   Current: 5.9 hr
-   Recovery baseline: 82
-   Current: 62

The UI should visually distinguish:

**PERSONAL BASELINE**

vs.

**CURRENT VALUE**

Graphs should contain a subtle baseline/reference region.

The goal is to communicate:

> "This is abnormal FOR THIS ASTRONAUT."

That is a major part of CosmoCare's value proposition.

------------------------------------------------------------------------

# 10. INDIVIDUAL CREW HEALTH PAGE

Clicking an astronaut should open a dedicated health experience.

Show:

## Overview

-   Health score
-   Recovery score
-   Readiness
-   Risk level

## Current Vitals

-   Heart rate
-   SpO₂
-   respiratory rate
-   temperature
-   blood pressure
-   HRV

## Personal Baseline

Show current values alongside baseline values.

## Recovery

-   sleep
-   recovery score
-   activity
-   stress indicators

## Symptoms

Display reported or simulated symptoms.

## Trends

Provide useful graphs for:

-   Heart rate
-   HRV
-   SpO₂
-   Sleep
-   Recovery

Don't overwhelm the screen with charts.

Prefer a few highly informative visualizations.

------------------------------------------------------------------------

# 11. RISK STATES

There are four primary states. Frame the escalating response tiers as
**Monitor → Prevent → Respond**, mapped to Yellow, Orange, and Red
respectively — this is the same **Predict → Prevent → Respond** concept
that should be visible throughout the app's language.

## GREEN --- NOMINAL

Everything is within expected personal baseline.

Action:

**Continue monitoring**

------------------------------------------------------------------------

## YELLOW --- MONITOR

**Tier: MONITOR**

Early deviation detected.

Example:

> Emerging fatigue pattern detected.

Recommended actions:

-   increase monitoring
-   encourage rest/recovery
-   recheck metrics
-   monitor trend

------------------------------------------------------------------------

## ORANGE --- ELEVATED RISK

**Tier: PREVENT**

Multiple concerning signals.

Recommended actions:

-   targeted health assessment
-   reduce workload
-   hydration/rest recommendation
-   notify medical personnel
-   increase monitoring frequency

------------------------------------------------------------------------

## RED --- CRITICAL

**Tier: RESPOND**

Potential medical emergency.

Recommended actions:

-   initiate AstroTriage
-   immediate crew response
-   onboard medical protocol
-   notify flight surgeon
-   continuously monitor critical vitals

------------------------------------------------------------------------

# 12. RECOMMENDATION SYSTEM

Every meaningful alert should answer:

> **WHAT SHOULD WE DO?**

Example:

### Elevated Risk

**CosmoCare recommends:**

1.  Reduce workload
2.  Hydrate
3.  Begin recovery protocol
4.  Recheck vitals in 30 minutes
5.  Notify onboard medical personnel

Use an intervention queue.

Example:

**IMMEDIATE**

EMP-001\
Initiate emergency medical protocol

**URGENT**

HAB-PROT-014\
Adjust fluid intake + reduce EVA load

**ROUTINE**

HAB-PROT-007\
Increase physiological monitoring

------------------------------------------------------------------------

# 13. ASTROTRIAGE

Create a dedicated **AstroTriage** page/modal.

It does not need to be a massive chatbot.

Make it feel like an onboard emergency decision-support system.

Flow:

### MEDICAL EVENT DETECTED

↓

### IDENTIFY SYMPTOMS

↓

### REVIEW CRITICAL VITALS

↓

### ANALYZE CONTRIBUTING FACTORS

↓

### COSMOCARE RECOMMENDATION

↓

### CREW RESPONSE

↓

### ESCALATE TO FLIGHT SURGEON

Display:

-   current symptoms
-   critical vitals
-   relevant history
-   detected abnormalities
-   contributing factors
-   recommended response

Clearly state:

> **CosmoCare provides medical decision support and does not replace
> qualified medical professionals.**

Use simulated data throughout the prototype.

------------------------------------------------------------------------

# 14. RECOVERY SYSTEM

Recovery should show the entire lifecycle.

Example:

**Medical Event**

↓

**Intervention**

↓

**Recovery Monitoring**

↓

**Return Toward Baseline**

For example:

Recovery Score:

**42 → 58 → 71 → 86**

Show a trend graph.

Also display:

### Recovery Status

✓ Returning toward personal baseline

The important concept is:

> CosmoCare doesn't stop when it detects a problem.

It continues monitoring the astronaut until their health returns toward
baseline.

------------------------------------------------------------------------

# 15. EARTH COMMUNICATION DELAY

KEEP THIS FEATURE.

This is one of the strongest hackathon demonstrations.

Add a control:

**SIMULATE 18-MIN DELAY**

When activated:

Top status changes:

**EARTH: DELAYED**

**ESTIMATED RESPONSE: 18 MIN**

Then prominently display:

### LOCAL DECISION SUPPORT ACTIVE

Explain:

> Earth communication is currently delayed. CosmoCare continues local
> monitoring, risk assessment, and decision support.

This should be visually noticeable without becoming an annoying modal.

The point is to demonstrate:

> In deep space, astronauts cannot always wait for Earth.

------------------------------------------------------------------------

# 16. FOUR DEMO SCENARIOS

Create a demo/scenario system so judges can quickly see different
states.

## Scenario 1 --- Normal

Maya Chen

Everything nominal.

## Scenario 2 --- Fatigue Buildup

Alex Rivera

-   Declining sleep
-   ↓ HRV
-   ↑ resting HR
-   ↓ recovery

CosmoCare detects an emerging fatigue pattern.

## Scenario 3 --- Developing Illness / Physiological Stress

Sam Patel

Multiple abnormal signals.

CosmoCare detects elevated risk.

## Scenario 4 --- Medical Emergency

Jordan Lee

Critical vitals.

CosmoCare initiates emergency decision support.

The scenario controls should allow switching between these states
without requiring a backend.

------------------------------------------------------------------------

# 17. AI ASSISTANT

This is lower priority.

Only implement if the core experience is polished.

Example questions:

> Why is Alex marked Yellow?

Response:

> Alex has experienced declining sleep quality, reduced HRV, elevated
> resting heart rate, and declining recovery over the past three mission
> days. These changes represent meaningful deviations from his personal
> baseline.

Another:

> Who requires immediate attention?

Response:

> Jordan Lee is currently classified as Critical due to multiple
> simultaneous deviations in cardiovascular and physiological metrics.

The assistant should reference the same simulated data already displayed
throughout the application.

Do NOT make it feel like a generic ChatGPT window.

------------------------------------------------------------------------

# 18. VISUAL DESIGN

Overall design:

## Background

Near-black / extremely dark navy.

## Cards

Dark translucent/opaque surfaces with very subtle borders.

## Typography

Modern technical sans-serif.

Small uppercase labels for telemetry.

Large clean numbers for important metrics.

## Status colors

-   GREEN = nominal
-   YELLOW = monitor
-   ORANGE = elevated
-   RED = critical

Use these consistently everywhere.

## Accent

Use a restrained cyan/teal/blue accent for the CosmoCare interface.

Avoid rainbow gradients.

------------------------------------------------------------------------

# 19. 3D SPACECRAFT DESIGN

The spacecraft is the centerpiece.

Use a detailed, realistic-looking futuristic spacecraft.

It should look like an actual exploration vessel rather than a fantasy
fighter.

Ideally the model should have identifiable sections:

-   command
-   habitation
-   medical
-   engineering
-   life support
-   communications
-   propulsion

If the model supports separate meshes, make those objects interactable.

Potential future interactions:

-   Click Medical Bay → medical system telemetry
-   Click Life Support → O₂/CO₂/environment telemetry
-   Click Engineering → power/reactor telemetry
-   Click Crew Location → astronaut health

------------------------------------------------------------------------

# 20. 3D CAMERA BEHAVIOR

Make the spacecraft feel physical.

Default:

-   slowly rotate or remain stationary
-   user can drag to orbit
-   scroll to zoom
-   right click / appropriate gesture to pan
-   reset camera button

When selecting a crew member:

**smoothly animate the camera toward their location.**

Do NOT instantly teleport the camera.

Use a cinematic but short transition.

When deselecting:

smoothly return to overview.

------------------------------------------------------------------------

# 21. INTERACTION DESIGN

Every important element should have clear interaction feedback.

Crew marker:

hover → glow/pulse + name

click → selected state + camera movement

Crew card:

hover → highlight

click → same crew selection

Alert:

click → open relevant health intelligence

Recommendation:

click → show action details

Chart:

hover → display exact value

Navigation:

active page clearly indicated

Avoid interactions that exist visually but don't actually work.

------------------------------------------------------------------------

# 22. TECHNICAL IMPLEMENTATION

Prefer:

**React + TypeScript**

**Three.js**

**React Three Fiber**

**@react-three/drei**

Use GLB/glTF where possible.

Use component-based architecture.

Keep simulated health data in a centralized data structure so every page
uses the same underlying data.

For example:

``` text
crew/
  maya
  alex
  sam
  jordan

metrics/
  vitals
  sleep
  recovery
  baseline
  trends

alerts/
recommendations/
scenarios/
```

Do not hardcode contradictory values into different components.

If the scenario changes, the entire UI should update from the same
state.

------------------------------------------------------------------------

# 23. RESPONSIVENESS

Primary target:

**desktop/laptop**

This is a mission-control application, so prioritize large screens.

Still make the interface usable on smaller screens.

On smaller widths:

-   collapse side panels
-   keep spacecraft visible
-   convert analytics panels into drawers
-   preserve crew selection

------------------------------------------------------------------------

# 24. IMPORTANT UX PRINCIPLE

The product should tell a story without requiring the user to understand
the interface first.

The ideal demo flow is:

### 1. Mission looks normal

Four astronauts visible on spacecraft.

↓

### 2. Alex starts deteriorating

CosmoCare identifies:

-   ↓ Sleep
-   ↓ HRV
-   ↑ Resting HR
-   ↓ Recovery

↓

### 3. CosmoCare explains WHY

**Emerging Fatigue Pattern Detected**

↓

### 4. CosmoCare determines risk

**YELLOW --- MONITOR**

↓

### 5. CosmoCare recommends an action

Rest + hydration + increased monitoring.

↓

### 6. Simulate Earth communication delay

**EARTH RESPONSE DELAYED --- 18 MIN**

↓

### 7. CosmoCare continues local decision support

↓

### 8. Condition worsens

Alex/Sam/Jordan scenario.

↓

### 9. AstroTriage activates

Critical vitals + contributing factors + recommended response.

↓

### 10. Intervention occurs

↓

### 11. Recovery tracking

**42 → 58 → 71 → 86**

↓

### 12. Astronaut returns toward baseline

**✓ Returning toward personal baseline**

This should be the core narrative of the application.

------------------------------------------------------------------------

# 25. POLISH THE DEMO

Before adding any further functionality, confirm all of the following:

-   every navigation button works
-   every crew member opens correctly
-   every scenario works
-   no dead pages
-   no placeholder text
-   no broken charts
-   no weird scrolling
-   alert text never gets cut off
-   terminology and colors stay consistent everywhere

Also clearly label the prototype as using **simulated/demo health
data**.

A judge should be able to follow this exact journey end to end:

> Crew looks normal → health changes begin → CosmoCare recognizes a
> pattern → explains WHY → assigns a risk level → recommends WHAT TO DO
> → Earth communication is delayed → onboard response occurs →
> CosmoCare tracks recovery.

If that single story works extremely well, prioritize it over adding
ten more pages. The four demo astronauts already map cleanly onto it:

-   **Maya** --- Normal
-   **Alex** --- Fatigue buildup
-   **Sam** --- Developing illness/stress
-   **Jordan** --- Medical emergency

------------------------------------------------------------------------

# 26. PRIORITY ORDER

Do NOT try to build everything at once.

Prioritize in this exact order:

## P0 --- Absolutely critical

1.  3D spacecraft
2.  Interactive camera controls
3.  Crew markers
4.  Clickable crew members
5.  Crew health data
6.  Mission overview
7.  Risk colors
8.  Health Intelligence explanation
9.  Personal baseline comparison
10. Recommendations

## P1 --- Important

11. Individual crew page
12. Trends
13. Earth communication delay
14. Demo scenarios
15. AstroTriage
16. Recovery tracking

## P2 --- Nice to have

17. AI Assistant
18. Interactive spacecraft systems
19. More advanced animations
20. Additional telemetry

Do not sacrifice P0 polish to implement P2 functionality.

------------------------------------------------------------------------

# 27. FINAL DESIGN GOAL

The final product should feel like:

> **A real onboard AI medical intelligence system for a deep-space
> mission.**

Not:

> A dashboard with a spaceship image.

The spacecraft should be an **interactive spatial representation of the
mission**, while CosmoCare's intelligence explains the health state of
the people inside it.

The most important visual relationship is:

**ASTRONAUT LOCATION → HEALTH STATE → WHY → RISK → ACTION → RECOVERY**

Make that relationship immediately understandable.

Use the provided reference images as **visual inspiration**, but do not
copy them directly. Develop a cohesive original CosmoCare design
language around the interactive 3D spacecraft.

**Build the experience so that a hackathon judge can understand the
value of CosmoCare within 10--15 seconds of seeing the Mission
Overview.**

------------------------------------------------------------------------

# 28. INSTRUCTIONS FOR THE CODING AGENT

Before making major changes, inspect the existing codebase and preserve
existing functionality that already works.

Do not rebuild working features unnecessarily.

First identify:

-   current framework
-   routing
-   component structure
-   state management
-   existing pages
-   data model
-   existing 3D implementation, if any

Then implement the redesign incrementally.

After each major feature, verify that:

-   navigation works
-   state management works
-   charts still work
-   crew selection works
-   3D interactions work
-   scenario switching works
-   responsive behavior works

Do not leave placeholder buttons or dead navigation.

Do not remove working functionality simply to make implementation
easier.

Keep simulated/demo health data clearly labeled as such.

The final application should be a **cohesive, polished prototype**, not
a collection of disconnected screens.
