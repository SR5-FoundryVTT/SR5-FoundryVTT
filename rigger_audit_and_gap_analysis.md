# Shadowrun 5e Rigger 1.0 Audit & Gap Analysis

Comprehensive audit comparing the SR5 Rigger rules dump against the current **SR5 Foundry VTT** system implementation.

---

## Summary Status Table

| Rule / Feature Area | Dump Rule Reference | Current Codebase Status | Missing / Required Addition |
| :--- | :--- | :--- | :--- |
| **Control Rig Modifiers** | SR5 p. 266 / 452 | Implemented in [`RiggingTestDataFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/tests/flows/RiggingTestDataFlow.ts#L18-L33) | Limit/Pool bonuses apply in tests. |
| **Rigger Interface Check** | SR5 p. 264 | Implemented in [`RiggerFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/RiggerFlow.ts) | Verifies `rigger_interface` item with G.O.D. warning alert or configurable hard block. |
| **RCC Noise & Sharing Allocation** | SR5 p. 267 | Implemented in [`matrix.hbs`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/templates/v2/actor/tabs/matrix.hbs) & [`SR5MatrixActorSheet.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/actor/sheets/SR5MatrixActorSheet.ts) | Interactive slider control on Matrix sheet with debounced Simple Action chat cards in play mode & compact icon setting. |
| **Vehicle Damage Biofeedback** | SR5 p. 266 | Implemented in [`DamageApplicationFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/actor/flows/DamageApplicationFlow.ts) | Prompts half-damage Biofeedback resist test chat cards for jumped-in drivers. |
| **Dump Shock & Ejection** | SR5 p. 266 / 226 | Implemented in [`RiggerFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/RiggerFlow.ts) | Forced ejection flow on vehicle destruction dealing 6S/6P Biofeedback damage & applying `disoriented` status penalty. |
| **Active Sensor Target Lock** | SR5 p. 269-270 | Implemented in [`ActiveSensorLockFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/ActiveSensorLockFlow.ts) | Active Sensor Lock status effect applying defense penalties to locked targets. |
| **Electronic Warfare Noise Reduction** | SR5 p. 268 | Missing | No action test flow for E-Warfare + Logic [Data Processing] to temporarily boost RCC Noise Reduction for the round. |
| **Matrix Device Repair** | SR5 p. 268 / 226 | Implemented in [`MatrixRepairFlow.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/MatrixRepairFlow.ts) | Hardware repair test flow repairing matrix condition monitor damage. |

---

## 1. Visual & UI Perspective

### Interactive RCC Allocation Control (Noise Reduction vs. Sharing)
- **Dump Rule**: An RCC's `Noise Reduction` + `Sharing (Zugriff)` cannot exceed its Device Rating, and re-allocating them requires a *Change Device Mode* action.
- **Current UI**: [`matrix.hbs`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/templates/v2/actor/tabs/matrix.hbs#L3-L24) displays static numbers and warning banners if over-allocated, but lacks an interactive visual widget (e.g., slider or stepper buttons) for players to adjust the allocation during play.

### Active Sensor Target Lock Overlay
- **Dump Rule**: Active Sensor Targeting locks onto a target, applying net hits as a defense penalty to the target.
- **Current UI**: There is no status effect badge (e.g., `Sensor Target Lock`) or visual indicator on target tokens to reflect an active sensor lock.

### Disorientation & Dump Shock Status Effect
- **Dump Rule**: Ejection or Dump Shock inflicts the Disorientation penalty (-2 to all dice pools for $10 - \text{Willpower}$ minutes).
- **Current UI**: There is no standard token status effect overlay (`sr5disoriented`) or active effect timer to represent disoriented riggers on the canvas.

### Persona & Vehicle Merged Icon Representation
- **Dump Rule**: In the Matrix, the rigger's persona and vehicle icon merge into a single icon.
- **Current UI**: Reflected on the Matrix Owned Icons tab, but token overlays on the canvas do not visually indicate a merged matrix persona beyond the steering wheel status effect.

---

## 2. Rule & Mechanics Perspective

### Vehicle Physical Damage $\rightarrow$ Driver Biofeedback Damage
- **Dump Rule**: Whenever a jumped-in vehicle suffers physical damage, the driver must resist Biofeedback damage equal to half the physical damage taken (rounded up): $\lceil \text{Damage} / 2 \rceil$ resisted with $\text{Willpower} + \text{Firewall}$.
- **Gap**: [`DamageApplicationFlow.applyDamageToActor`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/actor/flows/DamageApplicationFlow.ts#L39-L51) applies physical damage to vehicles, but does not notify or prompt a Biofeedback resist test for the jumped-in driver.

### Dump Shock & Forced Ejection
- **Dump Rule**: If a vehicle/RCC is destroyed or a direct connection cable is pulled while jumped in, the rigger suffers Dump Shock: 6S (Cold Sim) or 6P (Hot Sim) Biofeedback damage (resisted with $\text{Willpower} + \text{Firewall}$), plus Disorientation (-2 penalty to all actions for $10 - \text{Willpower}$ minutes).
- **Gap**: [`RiggerFlow.jumpOut`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/RiggerFlow.ts#L72-L97) handles voluntary jump-outs, but there is no forced ejection method triggered when a vehicle or RCC condition monitor fills up.

### Rigger Interface Validation on Jump-In
- **Dump Rule**: Jumping in requires a vehicle to have an installed Rigger Interface (drones have it built-in, but standard vehicles must install it as an upgrade).
- **Gap**: [`RiggerFlow.jumpIn`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/flows/RiggerFlow.ts#L12-L36) checks device ownership/GM status, but does not check if non-drone vehicles contain a `rigger_interface` gear/modification item.

### Passive & Active Sensor Targeting in Gunnery Attacks
- **Dump Rules**:
  - **Passive Sensor Targeting**: Uses Sensor rating as the limit instead of weapon Precision. Roll uses Gunnery + Logic [Sensor] instead of Gunnery + Agility [Precision].
  - **Active Sensor Targeting**: Simple action opposed sensor check ($\text{Perception} + \text{Intuition } [\text{Sensor}]$ vs $\text{Pilot/Stealth} + \text{Handling}$). Net hits subtract directly from target defense pools on subsequent attacks.
- **Gap**: Gunnery attacks in [`RangedAttackTest.ts`](file:///home/shadow/Documents/GitHub/SR5-FoundryVTT/src/module/tests/RangedAttackTest.ts) default to standard physical combat flows without options for Passive or Active Sensor targeting.

### Electronic Warfare Noise Reduction Action
- **Dump Rule**: Rigger can spend a Complex Action to roll $\text{Electronic Warfare} + \text{Logic } [\text{Data Processing}]$. Net hits count as extra Noise Reduction until the end of the combat round.
- **Gap**: No dedicated action item or test flow exists for this active noise reduction check.

### Matrix Device Damage Repair Flow
- **Dump Rule**: Matrix damage repair requires Hardware + Logic [Mental] and 1 hour base time. Each hit repairs 1 box OR halves repair time ($30\text{m} \rightarrow 15\text{m} \rightarrow \dots$). Critical glitch destroys the device.
- **Gap**: Matrix condition monitor boxes can be cleared manually on sheets, but no structured repair roll flow exists.
