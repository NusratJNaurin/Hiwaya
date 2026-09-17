# Hiwaya Architecture & System Design

This document details the architectural design, directory structure, data models, state flows, role-based access control (RBAC), and security mechanisms of the **Hiwaya** platform.

---

## 🏛️ High-Level Architecture

Hiwaya is built as a responsive, client-side Single Page Application (SPA) powered by React 19 and TypeScript, styled with Tailwind CSS v4, and structured for seamless future full-stack API integration.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Application (React 19)              │
│                                                                 │
│  ┌─────────────────┐   ┌───────────────────┐   ┌─────────────┐  │
│  │ Top Navigation  │   │  Animated Mascot  │   │ Audio Engine│  │
│  └────────┬────────┘   └─────────┬─────────┘   └──────┬──────┘  │
│           │                      │                    │         │
│  ┌────────▼──────────────────────▼────────────────────▼──────┐  │
│  │                     Screen State Router                   │  │
│  │  (Adventure Map | Project Module | Gallery | Parent Hub) │  │
│  └────────┬──────────────────────┬────────────────────┬──────┘  │
│           │                      │                    │         │
│  ┌────────▼────────┐   ┌─────────▼─────────┐   ┌──────▼──────┐  │
│  │ RBAC & Gating   │   │ AI Project Scorer │   │ Local Store │  │
│  └─────────────────┘   └───────────────────┘   └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/              # Static branding and media assets
│   ├── components/          # Reusable UI views and modal dialogs
│   │   ├── AdventureMapScreen.tsx      # Main quest track & map screen
│   │   ├── AuthScreen.tsx              # Login & multi-step onboarding
│   │   ├── CelebrationScreen.tsx       # Confetti & achievement modal
│   │   ├── CompanionFloating.tsx       # 3D/Animated AI companion widget
│   │   ├── DrawingPadModal.tsx         # Interactive in-app canvas drawing tool
│   │   ├── GalleryScreen.tsx           # Community showcase & peer reactions
│   │   ├── OnboardingScreen.tsx        # Initial companion & interest setup
│   │   ├── ParentDashboardScreen.tsx   # Parent analytics & moderation hub
│   │   ├── ParentPinModal.tsx          # 4-digit PIN security gate
│   │   ├── PricingScreen.tsx           # Premium subscription & course addons
│   │   ├── ProjectModuleScreen.tsx     # Video lesson & AI submission runner
│   │   ├── ShaderBackground.tsx        # Ambient dynamic backdrop
│   │   ├── ShareableAchievementCardModal.tsx # Digital certificate generator
│   │   ├── TellParentModal.tsx         # Quick child-to-parent notification
│   │   └── TopNavbar.tsx               # Top header, stats, and role toggle
│   ├── data/
│   │   └── mockData.ts      # Courses, companions, quest nodes & sample data
│   ├── utils/
│   │   └── sound.ts         # Web Audio API sound synthesizer engine
│   ├── types.ts             # Global TypeScript domain definitions & enums
│   ├── index.css            # Tailwind CSS v4 entry & custom tactile styles
│   ├── main.tsx             # React DOM mounting entry point
│   └── App.tsx              # Central state container & screen routing engine
├── metadata.json            # Platform capabilities and permissions
├── package.json             # Package scripts and dependencies
├── tsconfig.json            # TypeScript compiler configuration
└── vite.config.ts           # Vite build & plugin configuration
```

---

## 👤 User Roles & Access Control (RBAC)

The application supports three distinct user roles, defined in `src/types.ts`:

```typescript
export type UserRole = 'parent' | 'learner_kid' | 'learner_teen';
```

### 1. Child Learner (`learner_kid`)
* **Target Audience**: Ages 6–12.
* **Core Views**: Adventure Map, Video Quest Runner, Companion Interactions, Rewards Chest.
* **Safety & Restrictions**:
  * Cannot access the Parent Hub.
  * Project submissions enter the **Parent Moderation Queue** before appearing in the public gallery.
  * Subject to screen-time limits and category permissions configured by parents.

### 2. Teen Maker (`learner_teen`)
* **Target Audience**: Ages 13+.
* **Core Views**: Adventure Map, Teen Maker Studio, Direct Community Gallery, Advanced Portfolios.
* **Safety & Autonomy**:
  * Parent Hub buttons and PIN challenges are completely hidden.
  * Project photos and creations are published **directly** to the community showcase.
  * Focus on maker XP, advanced skill tracking, and peer interactions.

### 3. Parent (`parent`)
* **Target Audience**: Parents and guardians.
* **Core Views**: Parent Hub, Child Account Overview, Moderation Queue, Category Manager, Pricing.
* **Security**:
  * Access to sensitive areas is gated by a 4-digit Parent PIN (default: `1234`).
  * Full administrative rights to approve/reject gallery posts, adjust daily time limits, and purchase subscriptions.

---

## 🛡️ Parental Controls & Safety Architecture

Child safety and privacy are central to Hiwaya's design:

1. **PIN Security Gate (`ParentPinModal`)**:
   * Any attempt to access Parent Analytics, Billing, or Child Safety Settings prompts a 4-digit security code.
   * Auto-resets on incorrect attempts and includes a self-service reset flow.

2. **Moderated Gallery Pipeline**:
   ```
   [Child Learner submits project] 
             │
             ▼
   [Local Creation Object Created (status: 'pending_parent_review')]
             │
             ▼
   [Appears in Parent Hub Moderation Queue]
      ├── Approve  ──► Published to Community Showcase Gallery
      └── Reject   ──► Retained in Private Family Scrapbook Only
   ```

3. **Time Limit & Screen-Time Guardian**:
   * Configurable daily usage caps (e.g., 45 mins/day).
   * Visual warning states when limits approach.

4. **Curated & Safe Video Embeds**:
   * Embedded YouTube lessons utilize restricted player parameters (`rel=0`, `modestbranding=1`) to prevent external distractions.

---

## 🔄 Key Feature & Data Flows

### 1. Quest Progression & Milestone Flow
* Each course consists of 4 progressive steps (e.g., "The Mountain & Valley Fold", "The Classic Swan", "Modular Lotus", "The Grand Dragon").
* Step $N+1$ remains locked until Step $N$ is marked completed.
* Completing Step 4 triggers the **Course Mastery Celebration**, awarding a digital badge, certificate, and real-world voucher.

### 2. AI Project Evaluation Flow
1. Learner uploads a camera snapshot or draws their physical craft on the digital canvas.
2. System submits the payload to the evaluation processor.
3. The evaluation returns a **Dexterity Score (1–100%)**, **Constructive Feedback**, and **Earned XP (+100 XP)**.
4. Updates user profile XP and checks for level-up thresholds.

### 3. Course Paywall & Gating Architecture
* **Free Starter Tier**: *Origami* and *Crochet* are unlocked by default for all registered accounts.
* **Locked Premium Tier**: *Painting & Colors*, *STEM Rocketry*, *Pottery*, *Arabic Calligraphy*, and *Junior Finance*.
* Attempting to access locked courses renders a paywall prompt blocking video streams, checklists, and evaluation runners until upgraded.

---

## 🔊 Audio & Feedback Architecture

The procedural Web Audio API synthesizer (`src/utils/sound.ts`) generates zero-latency sound effects directly in the browser:
* `playPop()`: Tactile button taps and node selection.
* `playChime()`: Step progression and checklist toggles.
* `playFanfare()`: Quest completion and voucher unlocks.
* `playCelebrationCheer()`: Course completion confetti triggers.
