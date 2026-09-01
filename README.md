# CosmoCare

AI-Powered Medical Intelligence for Deep-Space Missions

Predict → Prevent → Respond → Recover

CosmoCare is an AI-powered onboard medical intelligence system designed to help astronauts monitor, identify, and respond to emerging health risks during long-duration deep-space missions, especially when communication with Earth is delayed.

## 1. The Problem
Long-duration space missions create unique medical challenges. Astronauts can face:
- Fatigue/Sleep deprivation
- Stress
- Illness
- Changes in Cardiovascular Health
- Cognitive and physical changes
- Medical emergencies

On Earth, medical professionals can provide immediate support but in deep-space missions, communication delays make it hard in cases of emergencies.

How can astronauts receive intelligent, personalized medical decision support when immediate communication with Earth isn't available?

## 2. Our Solution
Our answer: CosmoCare. CosmoCare provides an onboard AI medical intelligence layer that continuously analyzes astronaut health data and identifies meaningful deviations from each astronaut's personal baseline.
The questions CosmoCare attempts to answer are: "What is changing, why does it matter, and what should we do?"

How CosmoCare Works:
### Monitor

CosmoCare continuously monitors simulated physiological data including:
- Heart rate
- Resting heart rate
- HRV
- SpO₂
- Sleep
- Recovery
- Hydration
- Temperature
- Symptoms
- Readiness
- Environmental factors

### Personalize

Instead of relying solely on generic medical thresholds, CosmoCare establishes a personal baseline for each astronaut.

### Detect Patterns

CosmoCare looks for combinations of changes rather than treating each metric independently.

### Explain

Instead of simply displaying Elevated Risk, CosmoCare explains the reasoning behind the assessment.

Example:

**Emerging Fatigue Pattern**

Contributing factors:
- Sleep quality
- HRV
- Resting heart rate
- Recovery score

CosmoCare assessment: Multiple deviations from the astronaut's personal baseline indicate increasing physiological stress.

### Recommend

🟡 Monitor
- Increase monitoring
- Encourage rest
- Hydration
- Recheck metrics

🟠 Prevent
- Reduce workload
- Perform targeted health assessment
- Rest/hydration protocol
- Notify medical personnel

🔴 Respond
- Initiate AstroTriage
- Immediate crew action
- Begin medical protocol
- Escalate to flight surgeon

### Recover

CosmoCare doesn't stop once an event is detected.

Health Event -> Intervention -> Recovery Monitoring -> Return Toward Baseline

## 3. AI approach and architecture

We trained an Isolation Forest model on the HealthRing dataset (a sample of ~54 people with healthy vitals). From this data, the model learned what normal patterns of heart rate, respiratory rate, and SpO2 look like, as well as how to distinguish between true anomalies and normal deviations from an individual's baseline.

The output of the model is structured into a JSON payload, which is passed into an IBM Granite LLM that ingests information from official NASA manuals into its knowledge base, forming an RAG pipeline. Astronauts can query and interact with this system to receive medical advice and recommendations.

A high level outline of the full tool chain is shown below:

```
Synthetic vitals (per-astronaut, regime-tagged)
        │
        ▼
Feature engineering (baseline z-scores, slopes, cross-vital terms)
        │
        ▼
Isolation Forest (trained on normal data) ──► anomaly score
        │
        ▼
SHAP attribution ──► per-feature contributions
        │
        ▼
Factor analysis / PCA ──► mapped to body systems
        │
        ▼
Trend extrapolation ──► projected anomaly score (+1h/+3h/+6h)
        │
        │                                   NASA / flight-surgeon docs
        │                                            │
        │                                            ▼
        │                                   retrieved reference chunks
        │                                            │
        └──────────────► structured JSON ◄───────────┘
              (score, systems, top features, symptoms, regime)
                             │
                             ▼
                   watsonx / Granite LLM
                             │
                             ▼
      SUMMARY · CONCERN · SEVERITY · ACTION · SOURCE
                             │
                             ▼
                        Dashboard
```

## Technology Stack

### Frontend
- React
- TypeScript
- Vite / Next.js
- CSS / Tailwind CSS

### 3D
- Three.js
- React Three Fiber
- GLTF/FBX spacecraft models

Data Visualization
- MatPlotLib

AI
- IBM Bob
- IBM Granite
- Cursor

Backend
- [INSERT BACKEND]
- [INSERT DATABASE]

<img width="544" height="656" alt="aerohealth_ai_flowchart" src="https://github.com/user-attachments/assets/96ef2c28-a0b1-44aa-afed-0b5887710a28" />

## 4. Selected challenge theme
August Challenge Theme - Advance Space Exploration with AI

## 5. How IBM Bob was used
IBM Bob was used as an AI development assistant throughout the creation of CosmoCare.

Rather than using Bob only for isolated code snippets, it assisted with the overall application development process.

### Codebase Understanding

Bob was used to analyze:
- Application architecture
- Frontend components
- Routing
- Data structures
- 3D spacecraft implementation
- Crew interactions
- Health analytics

### UI Development
Bob assisted with:
- Holographic glass panels
- HUD components
- Crew status indicators
- Health analytics interfaces
- Alerts
- Navigation
- Responsive layouts
- Animation and transitions

### Feature Development
Bob assisted with:
- Crew health pages
- Health intelligence
- Risk states
- Recommendations
- AstroTriage
- Recovery tracking
- Earth communication delay simulation

### Debugging & Iteration
Bob was used to:
- Identify bugs
- Modify components
- Refactor code
- Implement changes
- Test functionality
- Iterate on the UI
