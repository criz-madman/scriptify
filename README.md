# Scriptify — Adobe After Effects ExtendScript & ScriptUI Platform

**Scriptify** is a multi-page web platform built for Adobe After Effects motion designers, VFX artists, and technical directors to generate production-ready ExtendScript (`.jsx`) scripts and dockable ScriptUI panels effortlessly.

---

## 1. Multi-Page Architecture

Scriptify features a multi-page layout with dedicated studios:

| Page Route | File | Description |
|---|---|---|
| **`/`** | [`frontend/index.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/index.html) | **Landing / Home Page**: Hero showcase, feature highlights, and entry points. |
| **`/login`** | [`frontend/login.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/login.html) | **Authentication Flow**: Dedicated passwordless Email OTP sign-in with auto-redirect. |
| **`/dashboard`** | [`frontend/dashboard.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/dashboard.html) | **Studio Tools Hub**: Overview of balance, recent generations, and quick launch to all studios. |
| **`/panel-builder`** | [`frontend/panel-builder.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/panel-builder.html) | **UI Panel Builder**: 3-section workspace with 28 actions, drag-and-drop sorting, and live AE preview. |
| **`/text-animator`** | [`frontend/text-animator.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/text-animator.html) | **Text Animation Generator**: Two-column studio with live wiggle simulation, Frequency/Amplitude sliders, Null controller option, and .jsx export. |
| **`/presets`** | [`frontend/presets.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/presets.html) | **Preset & Expression Studio**: Layer Stagger, Auto-Null Rigging, Batch Render Queue items, and ES3 code sanitizer. |
| **`/wallet`** | [`frontend/wallet.html`](file:///e:/Scriptify%20Project/Scriptify/frontend/wallet.html) | **Credit Wallet & Ledger**: Balance management, pricing packages ($5 / $12 / $35), free dev grant, and full financial transactions ledger. |

---

## 2. Dedicated Text Animation Generator

- **Left Column ("Animation Parameters")**:
  - Slider: **Frequency (Speed)** with live numeric feedback (1 to 20 Hz, default 5 Hz).
  - Slider: **Amplitude (Distance)** with live numeric feedback (5 to 100 px, default 30 px).
  - Checkbox: **Include Null Object Generation** (creates a master Null controller with live Slider Controls linking the expression).
  - Input: **Text Content** (customizable string).
  - CTA Button: Deep purple/violet **Download .jsx Script** (-1 Credit).
  - Secondary Actions: **Copy Code** and **Inspect Rig**.
- **Right Column ("Live Web Preview")**:
  - Dark-themed viewport simulating a 1080p composition at 24/60 fps with composition center guide lines.
  - Multi-octave harmonic wiggle physics loop matching Adobe After Effects `wiggle(freq, amp)` in real-time.
  - Live status subtext displaying active parameters.

---

## 3. Database Schema (PostgreSQL 3NF)

Strictly normalized 3NF database schema with atomic row-locking:
- **D1: `Users`** (`userId` UUID PK, `email` VARCHAR UNIQUE, `createdAt` TIMESTAMPTZ)
- **D2: `CreditWallet`** (`walletId` UUID PK, `userId` FK UNIQUE 1:1, `balancePoints` INT with `CHECK ("balancePoints" >= 0)`)
- **D3: `HistoryLog`** (`historyId` UUID PK, `userId` FK, `actionDetails` JSONB, `timestamp` TIMESTAMPTZ)
- **D4: `Transactions`** (`transactionId` UUID PK, `userId` FK, `amountPaid` NUMERIC with `CHECK ("amountPaid" >= 0)`, `paymentMethod` VARCHAR, `status` VARCHAR, `timestamp` TIMESTAMPTZ)
- **Auth: `AuthOtpTokens`** (`id` UUID PK, `email`, `otpHash`, `expiresAt`, `consumed`)

---

## 4. How to Run

### 1. Start Server
```powershell
npm start
```

### 2. Run Test Pipeline
```powershell
npm test
```
Verifies HTTP routes, 28 actions in the panel builder, ExtendScript generator & text animator, and PostgreSQL 3NF transactions.
