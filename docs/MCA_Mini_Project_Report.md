# MCA MINI PROJECT REPORT (MCA 307)

---

<div align="center">

# SCRIPTIFY — MOTION GRAPHICS AUTOMATION WEB APPLICATION

### A Mini Project Report Submitted in Partial Fulfillment of the Requirements for the Award of the Degree of
## MASTER OF COMPUTER APPLICATIONS (MCA)
### Under the Course Code: **MCA 307 — Mini Project**

\
**Submitted by:**
### **CHRISTAN JAMES**
**MCA Third Semester**

\
**Department of Computer Applications**
**Academic Year 2025 – 2026**

</div>

---

## DECLARATION

I, **Christan James**, student of Master of Computer Applications (Third Semester), hereby declare that the mini project titled **"Scriptify — Motion Graphics Automation Web Application"** submitted in partial fulfillment of the requirement for the award of the degree of Master of Computer Applications under course **MCA 307 Mini Project**, is an authentic record of original work carried out by me.

The matter embodied in this report has not been submitted elsewhere for the award of any degree, diploma, or other similar titles.

\
**Date:** 22 October 2026  
**Place:** Scriptify Development Studio  
**Candidate:** Christan James (MCA 3rd Semester)

---

## CERTIFICATE

This is to certify that the mini project report entitled **"Scriptify — Motion Graphics Automation Web Application"** submitted by **Christan James** in partial fulfillment of the requirements for the degree of **Master of Computer Applications (MCA 307 Mini Project)** is a bonafide record of work carried out under appropriate academic supervision and guidance.

\
\
__________________________  
**Project Guide / Supervisor**  
Department of Computer Applications  

\
__________________________  
**Head of the Department (HOD)**  
Department of Computer Applications  

---

## ACKNOWLEDGEMENTS

I express my deepest gratitude to all the mentors, faculty members, and colleagues who contributed towards the successful design, architecture, and implementation of the **Scriptify** platform. 

I am thankful to the Department of Computer Applications for providing the requisite computational infrastructure, academic freedom, and environment to pursue industry-relevant motion graphics and full-stack software engineering research. 

Special thanks are also extended to the Adobe developer community, the open-source engineering ecosystem, and motion designers whose real-world workflow pain points formed the foundation and inspiration of this project.

---

## TABLE OF CONTENTS

1. **Phase 2: Project Overview & Abstract**
   - 1.1 Abstract
   - 1.2 Social and Industry Relevance
   - 1.3 Problem Statement
   - 1.4 Objectives of the System
   - 1.5 Project Scope & Boundaries
2. **Phase 3: System Design & Architecture**
   - 2.1 High-Level System Architecture
   - 2.2 Relational Database Design (PostgreSQL 3NF Schema)
     - 2.2.1 Normalization Process (1NF to 3NF)
     - 2.2.2 Data Dictionary & Table Specifications
     - 2.2.3 Integrity Constraints and Concurrency Control
   - 2.3 Data Flow Diagrams (DFD)
     - 2.3.1 Level 0: Context-Level DFD
     - 2.3.2 Level 1: Subsystem Data Flow Decomposition
   - 2.4 Unified Modeling Language (UML) Diagrams
     - 2.4.1 Use Case Diagram (Guest, User, Admin)
     - 2.4.2 System Class Diagram
     - 2.4.3 Interaction Sequence Diagram: Atomic Script Generation
3. **Technical Implementation & Module Decomposition**
   - 3.1 Technology Stack Justification
     - 3.1.1 Client-Side Tier (Vanilla HTML5, TailwindCSS, GSAP)
     - 3.1.2 Server-Side Tier (Node.js, Express.js, MVC Framework)
     - 3.1.3 Persistence Tier (PostgreSQL, Connection Pooling)
     - 3.1.4 Identity Tier (Firebase Authentication Bridge, JWT, Nodemailer OTP)
   - 3.2 Core Functional Modules
     - 3.2.1 Authentication & Authorization Module
     - 3.2.2 ExtendScript Generation & Panel Builder Engine
     - 3.2.3 Digital Marketplace & Content Management (CRUD) Module
     - 3.2.4 Credit Wallet, Transaction Accounting & Checkout Engine
4. **Verification, Testing & Security Audit**
   - 4.1 Testing Methodology & Environment
   - 4.2 Comprehensive System Test Cases
   - 4.3 Concurrency & ACID Integrity Verification
   - 4.4 Security Posture & Vulnerability Mitigation
5. **Conclusion & Future Scope**
   - 5.1 Summary of Achievements
   - 5.2 Key Limitations
   - 5.3 Roadmap for Future Enhancements
6. **References & Bibliography**

---

# CHAPTER 1: PROJECT OVERVIEW & ABSTRACT (PHASE 2)

## 1.1 Abstract

In modern digital media production, motion graphics artists, video editors, and Visual Effects (VFX) technicians spend up to 35% of their working hours executing mundane, repetitive manual tasks within Adobe After Effects. These repetitive actions include keyframe property staggering, multi-layer null controller parenting, camera rig construction, composition dimension normalization, and bespoke expression rigging. While Adobe After Effects features a robust, Turing-complete scripting engine based on ECMAScript 3 / ExtendScript (`.jsx`), motion designers rarely possess the programming expertise required to handcraft error-free ExtendScript code, build graphical ScriptUI panels, or maintain complex macro architectures.

**Scriptify** is an enterprise-grade, full-stack motion graphics automation web application engineered to bridge the technical divide between software engineering and creative digital design. Scriptify empowers creators to visually configure, generate, preview, and download production-grade, bug-free Adobe After Effects ExtendScript scripts (`.jsx`) and dockable ScriptUI panels through a browser-based visual interface.

The platform is designed around a multi-tier Model-View-Controller (MVC) architecture backed by a third-normal-form (3NF) PostgreSQL database, an Express.js server, and a modern responsive presentation layer built with Vanilla HTML5, TailwindCSS, and GSAP animations. Scriptify features dual-path passwordless authentication (Email OTP and Firebase Google OAuth), role-based access control (RBAC) separating Guests, Registered Users, and System Administrators, an atomic credit-based economy utilizing database row-level locking (`SELECT ... FOR UPDATE`), and a centralized digital marketplace for community asset exchange.

## 1.2 Social and Industry Relevance

The commercial creative economy has witnessed exponential demand for high-velocity video content across broadcasting, commercial marketing, social entertainment platforms, and streaming services. Despite significant hardware advancements, Adobe After Effects workflows remain heavily bottlenecked by manual human mouse-clicks and repetitive operational overhead:

1. **Eradication of Creative Fatigue:** By automating repetitive rigging workflows (e.g., staggering 50 typography layers or binding 3D null trackers to cameras), designers reallocate high-value cognitive effort toward visual storytelling and creative experimentation rather than technical assembly.
2. **Democratization of ScriptUI Development:** Building native dockable UI panels for After Effects historically required mastering undocumented Adobe ExtendScript APIs and nested UI layout hierarchies. Scriptify's drag-and-drop Visual Panel Builder generates robust ScriptUI code with zero coding prerequisites.
3. **Economic Sustainability for Freelancers & Studios:** Commercial agencies save billable studio hours on mundane rigging, while individual creators gain access to an open marketplace where specialized scripts and presets can be monetized or shared.
4. **Safe and Audited Automation:** Hand-crafted scripts frequently trigger runtime errors or script execution freezes inside After Effects. Scriptify synthesizes syntactically validated, defensive `.jsx` code containing automated Undo grouping (`app.beginUndoGroup`), version checks, and sanity validations.

## 1.3 Problem Statement

Traditional motion design pipelines suffer from three fundamental limitations:
- **High Coding Barrier:** Artists lack knowledge of ExtendScript object models (`CompItem`, `AVLayer`, `Property`, `ScriptUI`), preventing them from developing customized tools.
- **Scattered and Fragile Script Snippets:** Motion designers rely on outdated forums and unsafe `.jsx` files downloaded from unverified sources, often lacking backward compatibility or corrupting After Effects project files.
- **Absence of Unified Workflow Tooling:** No single platform combines visual script assembly, drag-and-drop dockable panel generation, text physics animation synthesis, credit accounting, and a verified script marketplace within a singular responsive web application.

## 1.4 Objectives of the System

The primary objectives established for the Scriptify project include:
1. **Automated ExtendScript Synthesis:** Develop a web-based engine that accepts visual design parameters (layer delays, interpolation curves, camera rig types, kinetic typography physics) and dynamically generates clean, compliant ECMAScript 3 `.jsx` code.
2. **Visual ScriptUI Panel Builder:** Create an interactive canvas permitting users to arrange buttons, dropdowns, and toggles, binding them to 28+ pre-engineered After Effects production actions.
3. **Strict ACID Concurrency in Credit Accounting:** Design a PostgreSQL database schema in Third Normal Form (3NF) that prevents negative wallet balances and double-spend race conditions using transactional row locks.
4. **Hybrid Passwordless Authentication & RBAC:** Implement dual authentication (One-Time Password email verification and Firebase Google OAuth) integrated with a centralized JWT session management system and secure administrator privileges.
5. **Digital Marketplace with Full CRUD Lifecycle:** Provide a catalog of downloadable scripts and plugins with administrative catalog management and user acquisition history tracking.

## 1.5 Project Scope & Boundaries

The system encompasses:
- Responsive desktop and tablet interfaces covering 18 dedicated views.
- Visual Generator tools (Preset Generator, ScriptUI Panel Builder, Kinetic Text Rig Animator).
- Wallet management system with simulated payment checkout ("FakePay™").
- Administrator portal for product CRUD, platform analytics, and user role validation.

*Boundaries:* The system generates Adobe-compatible `.jsx` scripts meant for execution within Adobe After Effects CC 2018–2026. Real-time rendering of final video compositions occurs client-side within After Effects; Scriptify provides the automation scripts and canvas-based previews.

---

# CHAPTER 2: SYSTEM DESIGN & ARCHITECTURE (PHASE 3 REQUIREMENTS)

## 2.1 High-Level System Architecture

Scriptify is organized as a three-tier decoupled architecture:
1. **Presentation Tier (Client):** Multi-Page Application (MPA) rendered with semantic HTML5, stylized via a custom dark-mode design system utilizing TailwindCSS utility classes, and enhanced with GSAP animations. Client-side modules interact with the backend via a centralized, JWT-injecting asynchronous API client (`api.js`).
2. **Application Logic Tier (Server):** Modular Node.js / Express.js REST application operating under strict Model-View-Controller (MVC) separation. Business logic is segregated into specialized services (`walletService`, `extendScriptService`, `marketplaceService`, `emailService`).
3. **Persistence Tier (Database):** Cloud-hosted PostgreSQL relational database operating in 3NF, leveraging connection pooling (`pg.Pool`), parameterized queries, and row-level locking for atomic ledger operations.

```
+-------------------------------------------------------------------------+
|                         PRESENTATION TIER                               |
|   Vanilla HTML5 | TailwindCSS | GSAP Animations | Firebase Client SDK   |
|   [Generator UI]     [Panel Builder]     [Marketplace]     [Wallet UI]  |
+-------------------------------------------------------------------------+
                                    |
                     HTTPS / JSON REST API / JWT
                                    v
+-------------------------------------------------------------------------+
|                        APPLICATION LOGIC TIER                           |
|                         Express.js Server                               |
|   +----------------------- Middleware Pipeline -----------------------+ |
|   |  CORS Whitelisting  |  JWT requireAuth  |  requireAdmin RBAC      | |
|   +-------------------------------------------------------------------+ |
|   +--------------------- Controllers & Services ---------------------+ |
|   |  authController     <-->  emailService (Nodemailer / OTP Token)   | |
|   |  scriptController   <-->  extendScriptService / scriptUiBuilder   | |
|   |  walletController   <-->  walletService (ACID Ledger & Locks)     | |
|   |  marketController   <-->  marketplaceService (Catalog CRUD)       | |
|   +-------------------------------------------------------------------+ |
+-------------------------------------------------------------------------+
                                    |
                       pg Connection Pool / TCP-IP
                                    v
+-------------------------------------------------------------------------+
|                         DATA PERSISTENCE TIER                           |
|                       PostgreSQL 3NF Database                           |
|   [Users] <1:1> [CreditWallet]                                          |
|   [Users] <1:N> [HistoryLog]                                            |
|   [Users] <1:N> [Transactions]                                          |
|   [Users] <1:N> [MarketplacePurchases] <N:1> [MarketplaceProducts]      |
|   [AuthOtpTokens] (Transient Security Store)                            |
+-------------------------------------------------------------------------+
```

---

## 2.2 Relational Database Design (PostgreSQL 3NF Schema)

### 2.2.1 Normalization Process (1NF to 3NF)

To ensure high transaction throughput, zero data redundancy, and absolute referential integrity, the database was normalized from an unnormalized state into Third Normal Form (3NF):

- **First Normal Form (1NF):**
  - All attributes contain strictly atomic, scalar values (UUIDs, strings, timestamps, integers).
  - Multi-valued attributes (such as purchase collections or multi-line instructions) are either decomposed into related child tables (`MarketplacePurchases`) or encapsulated within structured, indexable JSONB documents (`actionDetails`).
  - Every table possesses an immutable Primary Key (`userId`, `walletId`, `historyId`, `transactionId`, `productId`, `purchaseId`).
- **Second Normal Form (2NF):**
  - The database is in 1NF, and all non-key attributes are fully functionally dependent on the entire primary key.
  - In associative tables like `MarketplacePurchases`, attributes (`creditsSpent`, `purchasedAt`) depend on the unique composite relation `(userId, productId)` rather than individual foreign keys.
- **Third Normal Form (3NF):**
  - The database is in 2NF, and no non-key attribute is transitively dependent on the primary key.
  - User wallet balances were intentionally extracted into a dedicated `CreditWallet` table rather than stored directly inside `Users`, ensuring user identity concerns remain isolated from mutable financial ledger states.
  - Product pricing is kept strictly within `MarketplaceProducts`; historical purchase prices are captured at point-of-sale in `MarketplacePurchases.creditsSpent` to prevent transitive pricing recalculations.

### 2.2.2 Data Dictionary & Table Specifications

The database schema definition is formalized below:

#### Table 1: `Users` (D1)
Stores the master identity records for all registered accounts.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `userId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique immutable system user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | None | Normalized electronic mail address |
| `createdAt` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Account registration timestamp |

*Indexes:*
- `idx_users_email_lower` ON `Users (LOWER(email))` (Unique Index)

---

#### Table 2: `CreditWallet` (D2)
Maintains the real-time credit balance points for each user in a strict 1:1 relationship.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `walletId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique wallet entity identifier |
| `userId` | UUID | NOT NULL, UNIQUE, FK | None | References `Users(userId)` ON DELETE CASCADE |
| `balancePoints` | INTEGER | NOT NULL, CHECK (>= 0) | 100 | Spendable automation credits (Never negative) |
| `updatedAt` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Timestamp of most recent balance mutation |

*Indexes:*
- `idx_credit_wallet_user_id` ON `CreditWallet (userId)`

---

#### Table 3: `HistoryLog` (D3)
An immutable operational audit trail capturing all script synthesis actions and associated wallet deductions.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `historyId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique history event identifier |
| `userId` | UUID | NOT NULL, FK | None | References `Users(userId)` ON DELETE CASCADE |
| `actionDetails` | JSONB | NOT NULL | None | Structured payload (scriptType, parameters, cost) |
| `timestamp` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Time event occurred |

*Indexes:*
- `idx_history_log_user_id` ON `HistoryLog (userId)`
- `idx_history_log_timestamp` ON `HistoryLog (timestamp DESC)`
- `idx_history_log_action_type` ON `HistoryLog ((actionDetails->>'scriptType'))`

---

#### Table 4: `Transactions` (D4)
The immutable financial ledger recording top-ups, grant credits, and simulated monetary exchanges.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `transactionId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique transaction voucher identifier |
| `userId` | UUID | NOT NULL, FK | None | References `Users(userId)` ON DELETE CASCADE |
| `amountPaid` | NUMERIC(10,2) | NOT NULL, CHECK (>= 0) | None | Currency value processed (USD) |
| `paymentMethod` | VARCHAR(50) | NOT NULL | None | Method string (e.g., 'stripe_card', 'fakepay') |
| `status` | VARCHAR(20) | NOT NULL, CHECK (IN) | 'completed' | Status: 'pending', 'completed', 'failed', 'refunded' |
| `timestamp` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Financial ledger transaction timestamp |

*Indexes:*
- `idx_transactions_user_id` ON `Transactions (userId)`
- `idx_transactions_timestamp` ON `Transactions (timestamp DESC)`

---

#### Table 5: `AuthOtpTokens` (Supporting Security Table)
Manages transient 6-digit cryptographic verification codes for passwordless authentication.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `id` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique OTP challenge identifier |
| `email` | VARCHAR(255) | NOT NULL | None | Destination email of challenge |
| `otpHash` | VARCHAR(255) | NOT NULL | None | Salting & hashing via bcrypt (`bcryptjs`) |
| `expiresAt` | TIMESTAMPTZ | NOT NULL | None | Expiration boundary (10-minute validity) |
| `consumed` | BOOLEAN | NOT NULL | FALSE | Flag preventing replay attacks upon verification |
| `createdAt` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Issuance timestamp |

*Indexes:*
- `idx_auth_otp_email` ON `AuthOtpTokens (LOWER(email))`

---

#### Table 6: `MarketplaceProducts` (D5)
Catalog of verified After Effects scripts, CEP plugins, and project presets.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `productId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique digital product identifier |
| `title` | VARCHAR(255) | NOT NULL | None | Title of the tool or script |
| `description` | TEXT | NOT NULL | None | Descriptive summary of functionality |
| `category` | VARCHAR(50) | NOT NULL, CHECK (IN) | None | Category: 'script', 'plugin', 'project_file' |
| `creditPrice` | INTEGER | NOT NULL, CHECK (>= 0) | None | Price in Scriptify balance points |
| `instructions` | TEXT | NOT NULL | None | Markdown installation & usage documentation |
| `payloadCode` | TEXT | NULLABLE | None | Complete executable `.jsx` code or distribution URL |
| `version` | VARCHAR(50) | NOT NULL | '1.0.0' | SemVer release version |
| `author` | VARCHAR(100) | NOT NULL | 'Scriptify' | Author or creator attribution |
| `createdAt` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Catalog publication timestamp |

*Indexes:*
- `idx_marketplace_category` ON `MarketplaceProducts (category)`
- `idx_marketplace_created_at` ON `MarketplaceProducts (createdAt DESC)`

---

#### Table 7: `MarketplacePurchases` (D6)
Associative relational ledger tracking asset acquisitions by users.

| Column Name | Data Type | Constraints | Default | Description |
|---|---|---|---|---|
| `purchaseId` | UUID | PRIMARY KEY | `gen_random_uuid()` | Unique receipt identifier |
| `userId` | UUID | NOT NULL, FK | None | References `Users(userId)` ON DELETE CASCADE |
| `productId` | UUID | NOT NULL, FK | None | References `MarketplaceProducts(productId)` ON DELETE CASCADE |
| `creditsSpent` | INTEGER | NOT NULL, CHECK (>= 0) | None | Balance points deducted at purchase time |
| `purchasedAt` | TIMESTAMPTZ | NOT NULL | `CURRENT_TIMESTAMP` | Timestamp of acquisition |

*Composite Constraints & Indexes:*
- UNIQUE CONSTRAINT `uq_user_product ("userId", "productId")` (Prevents duplicate charging)
- `idx_purchases_user_id` ON `MarketplacePurchases (userId)`
- `idx_purchases_product_id` ON `MarketplacePurchases (productId)`

---

### 2.2.3 Integrity Constraints and Concurrency Control

To ensure transactional safety under concurrent user loads:
1. **Database-Level CHECK Constraints:** The constraint `CHECK ("balancePoints" >= 0)` enforces that balance values cannot drop below zero under any execution condition.
2. **ACID Transaction Isolation & Row-Level Locking:** All operations decrementing user credits (`deductCreditsForScript` and `purchaseProduct`) execute within explicit `BEGIN ... COMMIT / ROLLBACK` boundaries. Crucially, the wallet lookup queries use:
   ```sql
   SELECT "balancePoints" FROM "CreditWallet" WHERE "userId" = $1 FOR UPDATE;
   ```
   This prevents race conditions and dirty reads by acquiring an exclusive write lock on the target user's row until the transaction completes.

---

## 2.3 Data Flow Diagrams (DFD)

### 2.3.1 Level 0: Context-Level DFD

The Context Diagram defines the system boundary, external entities (Guest, Registered User, Administrator, Adobe After Effects Environment, and Mail Delivery Gateway), and the primary high-level information streams.

```mermaid
flowchart TD
    subgraph External_Entities [External Entities]
        G[Guest User]
        U[Registered User]
        A[Administrator]
        AE[Adobe After Effects Host]
        SMTP[SMTP Email Gateway]
    end

    subgraph Scriptify_System [Scriptify Motion Graphics System 0.0]
        SYS((Scriptify Web Platform))
    end

    G -->|Browse Showcase & Landing Page| SYS
    SYS -->|Render Public Views & Demos| G

    U -->|Provide Auth Credentials / OTP| SYS
    SYS -->|Request OTP Delivery| SMTP
    SMTP -->|Dispatch 6-Digit Code| U

    U -->|Configure Animation & Panel Parameters| SYS
    SYS -->|Return Synthesized .jsx Code & Panel Manifest| U
    U -->|Execute .jsx File / Dock ScriptUI Panel| AE

    U -->|Browse Catalog & Order Product| SYS
    SYS -->|Deliver Script Payload & Deduct Credits| U

    U -->|Submit Top-up / FakePay Voucher| SYS
    SYS -->|Issue Verified Credits & Receipt| U

    A -->|Admin Auth & Catalog Management| SYS
    SYS -->|Platform Analytics & CRUD Confirmation| A
```

---

### 2.3.2 Level 1: Subsystem Data Flow Decomposition

The Level 1 DFD decomposes the system into four major operational processes:
- **1.0 Authentication & Identity Management**
- **2.0 Credit Wallet & Financial Ledger**
- **3.0 ExtendScript Synthesis & Panel Builder**
- **4.0 Marketplace Catalog & Purchase Management**

```mermaid
flowchart TD
    %% Entities
    User[Registered User]
    Admin[Administrator]
    EmailServer[SMTP Email Gateway]

    %% Processes
    P1[1.0 Authenticate User & Issue JWT]
    P2[2.0 Manage Wallet & Settle Credits]
    P3[3.0 Generate ExtendScript & Panels]
    P4[4.0 Catalog & Settle Purchases]

    %% Data Stores
    D1[(D1: Users)]
    D2[(D2: CreditWallet)]
    D3[(D3: HistoryLog)]
    D4[(D4: Transactions)]
    D5[(D5: MarketplaceProducts)]
    D6[(D6: MarketplacePurchases)]
    D7[(D7: AuthOtpTokens)]

    %% Auth Flows
    User -->|Enter Email| P1
    P1 -->|Create Salted OTP| D7
    P1 -->|Send OTP Token| EmailServer
    User -->|Submit OTP Code| P1
    P1 -->|Verify & Consume OTP| D7
    P1 -->|Read / Create User| D1
    P1 -->|Initialize 100 Credits| D2
    P1 -->|Return Bearer JWT| User

    %% Wallet Flows
    User -->|Top-up Balance / Payment| P2
    P2 -->|Increment Credits with Row Lock| D2
    P2 -->|Record Ledger Entry| D4
    P2 -->|Return Updated Balance| User

    %% Script Gen Flows
    User -->|Submit Script Configuration & Cost| P3
    P3 -->|Check & Decrement Credit Balance FOR UPDATE| D2
    P3 -->|Log Generation Action & Parameters| D3
    P3 -->|Return Assembled .jsx Code| User

    %% Marketplace Flows
    Admin -->|Add / Update / Delete Product| P4
    P4 -->|Write Catalog Record| D5

    User -->|Browse Products| P4
    P4 -->|Read Active Listings| D5
    User -->|Initiate Purchase| P4
    P4 -->|Deduct Product Price FOR UPDATE| D2
    P4 -->|Record Ownership Receipt| D6
    P4 -->|Deliver Script & Instructions| User
```

---

## 2.4 Unified Modeling Language (UML) Diagrams

### 2.4.1 Use Case Diagram

The Use Case Diagram defines the operational boundaries and interactions among three core actors:
- **Guest (Unauthenticated Creator):** Can browse the platform landing page, explore interactive animation previews, and request an authentication challenge.
- **Registered User:** Can generate ExtendScript files, assemble drag-and-drop panels, purchase digital marketplace goods, and audit their personal history.
- **Administrator (`christanjames07@gmail.com`):** Inherits all Registered User capabilities and possesses elevated permissions to moderate the marketplace catalog and view platform metrics.

```mermaid
flowchart LR
    %% Actors
    Guest((Guest))
    User((Registered User))
    Admin((Administrator))

    %% System Boundary
    subgraph Scriptify_System_Boundary [Scriptify Automation Application]
        UC1[Browse Landing Page & Demos]
        UC2[Request Email OTP / Google OAuth]
        UC3[Generate ExtendScript .jsx]
        UC4[Build Custom ScriptUI Panel]
        UC5[Configure Text Kinetic Animator]
        UC6[Audit Generation History Log]
        UC7[Top-up Credit Wallet]
        UC8[Purchase Marketplace Scripts]
        UC9[Download Script Artifacts]
        UC10[Manage Products CRUD]
        UC11[View Platform Analytics]
    end

    %% Guest Relationships
    Guest --> UC1
    Guest --> UC2

    %% Registered User Relationships
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9

    %% Admin Relationships
    Admin --> UC3
    Admin --> UC8
    Admin --> UC10
    Admin --> UC11

    %% Use Case Inclusions
    UC3 -.->|<<includes>>| UC12[Deduct 1 Credit with Row Lock]
    UC8 -.->|<<includes>>| UC13[Deduct Product Price with Row Lock]
    UC8 -.->|<<includes>>| UC9
```

---

### 2.4.2 System Class Diagram

The Class Diagram illustrates the object-oriented structure of the backend application architecture, depicting domain controllers, business services, database data access interfaces, and domain models.

```mermaid
classDiagram
    class User {
        +UUID userId
        +String email
        +DateTime createdAt
    }

    class CreditWallet {
        +UUID walletId
        +UUID userId
        +int balancePoints
        +DateTime updatedAt
        +hasSufficientBalance(int amount) bool
    }

    class HistoryLog {
        +UUID historyId
        +UUID userId
        +Object actionDetails
        +DateTime timestamp
    }

    class Transaction {
        +UUID transactionId
        +UUID userId
        +float amountPaid
        +String paymentMethod
        +String status
        +DateTime timestamp
    }

    class MarketplaceProduct {
        +UUID productId
        +String title
        +String description
        +String category
        +int creditPrice
        +String instructions
        +String payloadCode
        +String version
        +String author
        +DateTime createdAt
    }

    class MarketplacePurchase {
        +UUID purchaseId
        +UUID userId
        +UUID productId
        +int creditsSpent
        +DateTime purchasedAt
    }

    class AuthController {
        +sendOtp(req, res, next)
        +verifyOtp(req, res, next)
        +firebaseLogin(req, res, next)
        +getMe(req, res, next)
    }

    class WalletService {
        +getBalance(userId) int
        +deductCreditsForScript(userId, details) Object
        +topupCredits(userId, amount, method) Object
        +getTransactions(userId) Array
        +getHistoryLogs(userId) Array
    }

    class ExtendScriptService {
        +generateLayerStagger(options) String
        +generateCameraRig(options) String
        +generateBatchRename(options) String
        +generateCompCleaner(options) String
        +generateScriptUiPanel(manifest) String
    }

    class MarketplaceService {
        +getAllProducts(category, search) Array
        +getProductById(productId) Object
        +createProduct(data) Object
        +updateProduct(productId, data) Object
        +deleteProduct(productId) bool
        +purchaseProduct(userId, productId) Object
        +getUserPurchases(userId) Array
    }

    %% Relationships
    User "1" *-- "1" CreditWallet : owns
    User "1" *-- "0..*" HistoryLog : generates
    User "1" *-- "0..*" Transaction : logs
    User "1" *-- "0..*" MarketplacePurchase : acquires
    MarketplaceProduct "1" *-- "0..*" MarketplacePurchase : purchased_in

    AuthController ..> User : authenticates
    WalletService ..> CreditWallet : mutates
    WalletService ..> HistoryLog : writes
    WalletService ..> Transaction : records
    MarketplaceService ..> MarketplaceProduct : manages
    MarketplaceService ..> MarketplacePurchase : records
    MarketplaceService ..> WalletService : delegates_charge
```

---

### 2.4.3 Interaction Sequence Diagram: Atomic Script Generation

The following Sequence Diagram illustrates the lifecycle of a script generation request, demonstrating client JWT authorization, database transaction isolation (`BEGIN / FOR UPDATE / COMMIT`), and final `.jsx` payload dispatch.

```mermaid
sequenceDiagram
    autonumber
    actor Client as User Browser (Generator UI)
    participant AuthMW as requireAuth Middleware
    participant SC as scriptController
    participant WS as walletService
    participant ES as extendScriptService
    participant DB as PostgreSQL Database

    Client->>AuthMW: POST /api/scripts/generate (Bearer JWT + Script Params)
    AuthMW->>AuthMW: Verify Token Signature & Expiry
    AuthMW->>DB: SELECT userId FROM "Users" WHERE userId = $1
    DB-->>AuthMW: User Record Confirmed
    AuthMW->>SC: Forward with req.user

    SC->>WS: deductCreditsForScript(userId, scriptMetadata)
    WS->>DB: BEGIN TRANSACTION
    WS->>DB: SELECT balancePoints FROM "CreditWallet" WHERE userId = $1 FOR UPDATE
    Note over WS,DB: Row-level lock acquired on user's CreditWallet row
    DB-->>WS: balancePoints = 42

    alt Balance >= 1
        WS->>DB: UPDATE "CreditWallet" SET balancePoints = balancePoints - 1 WHERE userId = $1
        WS->>DB: INSERT INTO "HistoryLog" (userId, actionDetails) VALUES ($1, $2)
        WS->>DB: COMMIT TRANSACTION
        Note over WS,DB: Transaction committed; row lock released
        DB-->>WS: Transaction Successful

        SC->>ES: buildExtendScript(scriptType, parameters)
        ES-->>SC: Synthesized ECMAScript 3 JSX Code String

        SC-->>Client: 200 OK { success: true, script: "...", newBalance: 41 }
    else Insufficient Balance (Balance < 1)
        WS->>DB: ROLLBACK TRANSACTION
        Note over WS,DB: Rollback performed; row lock released
        WS-->>SC: Error: "Insufficient credits (Requires 1 credit)"
        SC-->>Client: 402 Payment Required { error: "Insufficient credits" }
    end
```

---

# CHAPTER 3: TECHNICAL IMPLEMENTATION & MODULES

## 3.1 Technology Stack Justification

| Layer | Selected Technology | Technical Justification |
|---|---|---|
| **Client Core** | Vanilla HTML5 & ES6 Modules | Zero bundle compilation overhead, rapid browser load times, and straightforward maintenance without framework obsolescence risks. |
| **Styling** | TailwindCSS + Vanilla CSS Design System | High-velocity utility class styling paired with custom glassmorphism components (`.glass-card`), CSS variable theming, and responsive viewports. |
| **Motion/FX** | GSAP 3.12 (GreenSock) | Hardware-accelerated timeline orchestration for homepage marketing carousels and smooth micro-interactions. |
| **Server Runtime** | Node.js (>= v18 LTS) | Asynchronous event-driven I/O ideal for concurrent API routing and script code assembly pipelines. |
| **Application Layer** | Express.js 4.21 | Minimalist, robust routing architecture providing uniform middleware support (CORS, JWT guards, error handlers). |
| **Database System** | PostgreSQL 13+ (Supabase) | Production-grade ACID guarantees, native JSONB support, strict CHECK constraints, and row-level locking primitives. |
| **Client-DB Bridge** | `node-postgres` (`pg` v8.13) | Lightweight native connection pooling (`pg.Pool`) enabling efficient connection reuse and parameterized SQL execution. |
| **Authentication** | Firebase Auth + JWT + Nodemailer | Hybrid authentication: low-friction Google OAuth via Firebase Client SDK complemented by passwordless Email OTP verification. |

---

## 3.2 Core Functional Modules

### 3.2.1 Authentication & Authorization Module

The Authentication Subsystem implements a defense-in-depth security model featuring dual authentication pathways:

1. **Passwordless Email OTP Workflow:**
   - The client invokes `POST /api/auth/send-otp` with an email address.
   - The backend generates a cryptographically random 6-digit numerical token, hashes the token using `bcryptjs` (salt rounds: 10), and persists it into `AuthOtpTokens` with a 10-minute expiration window (`expiresAt`).
   - The unhashed code is delivered via `emailService` using an authenticated SMTP transport (with automated fallback to development console output).
   - Upon submission to `POST /api/auth/verify-otp`, the hash is verified using `bcrypt.compare()`. Once matched, the token is flagged as `consumed = TRUE` to prevent replay exploits.
   - The user is upserted into the `Users` table, an initial grant of **100 credits** is allocated in `CreditWallet` if newly registered, and a signed JSON Web Token (JWT, 7-day validity) is returned.

2. **Firebase Google OAuth Synchronization:**
   - Users signing in via Google are authenticated through the Firebase Client SDK popup.
   - Upon obtaining the verified credential, the frontend dispatches `POST /api/auth/firebase-login` transmitting the user's email.
   - The backend reconciles the account in PostgreSQL and returns an authorized backend JWT token, ensuring all API endpoints use a unified authentication signature.

3. **Role-Based Access Control (RBAC):**
   - Protected routes execute `requireAuth`, which decodes the Bearer token and verifies the `userId` directly against active database records.
   - Administrative endpoints (`POST`, `PUT`, `DELETE` on `/api/marketplace/products`) append the `requireAdmin` middleware. This checks the authenticated email against the system configuration (`ADMIN_EMAIL = christanjames07@gmail.com`), rejecting unauthorized requests with a `403 Forbidden` response.

---

### 3.2.2 ExtendScript Generation & Panel Builder Engine

The ExtendScript generation engine translates visual parameters into clean Adobe After Effects automation code:

1. **Syntactic Encapsulation:** Every synthesized script is wrapped in an isolated scope with Undo grouping:
   ```javascript
   (function () {
       app.beginUndoGroup("Scriptify: Automated Operation");
       try {
           var comp = app.project.activeItem;
           if (!comp || !(comp instanceof CompItem)) {
               alert("Scriptify Error: Please select an active composition.");
               return;
           }
           // Synthesized parametric logic executed here...
       } catch (err) {
           alert("Scriptify Runtime Exception: " + err.toString());
       } finally {
           app.endUndoGroup();
       }
   })();
   ```
2. **Visual ScriptUI Panel Builder (`panelBuilder.js`):**
   - Implements an interactive visual builder allowing creators to construct dockable ScriptUI panels (`Window("palette", ...)`).
   - Includes a library of **28 pre-built After Effects actions** across layer management, composition settings, keyframing, and rendering.
   - Assembles native ExtendScript UI code with automatic control positioning, event listener bindings (`onClick`), and defensive null-checking.
3. **Text Animator Rig Engine (`textAnimator.js`):**
   - Synthesizes advanced typography expression rigs (overshoot, elastic bounce, character staggering) using After Effects Text Animator properties (`ADBE Text Animator`).
   - Provides a real-time HTML5 Canvas simulation of the animation physics directly in the web browser prior to script download.

---

### 3.2.3 Digital Marketplace & Content Management (CRUD) Module

The Marketplace module facilitates community asset exchange and catalog administration:

1. **Catalog Retrieval & Filtering (`GET /api/marketplace/products`):**
   - Supports category filtering (`script`, `plugin`, `project_file`) and parameterized text searching across titles and descriptions using case-insensitive SQL patterns:
     ```sql
     WHERE category = $1 AND (title ILIKE $2 OR description ILIKE $3)
     ```
2. **Administrative Product CRUD:**
   - Administrators can add new scripts, modify metadata, update pricing, or delete obsolete tools through a modal dialog in `admin.html`.
   - Deletions are executed within database transactions to preserve referential consistency across related purchases.
3. **Asset Delivery Pipeline:**
   - Once acquired, scripts are made available for on-demand download via client-side Blob generation (`new Blob([payloadCode], { type: 'text/javascript' })`), enabling immediate execution inside After Effects without external download redirects.

---

### 3.2.4 Credit Wallet, Transaction Accounting & Checkout Engine

The Financial and Accounting subsystem enforces strict ledger integrity:

1. **Registration Grant:** Every newly created account receives a complimentary balance of **100 credits**, permitting immediate evaluation of the platform's generation tools without requiring upfront payment.
2. **Atomic Credit Settlement (`deductCreditsForScript`):**
   - Generation of standard scripts costs **1 credit**; marketplace products carry author-defined credit prices.
   - Balances are decremented through transactional queries backed by row-level locking (`FOR UPDATE`), ensuring concurrent requests from the same user account cannot produce race conditions or negative balances.
3. **Simulated Payment Gateway ("FakePay™" / `checkout.html`):**
   - Implements a simulated commercial checkout experience supporting Credit Card, UPI, and Net Banking interfaces.
   - Upon completing the checkout flow, the client calls `POST /api/wallet/topup`, logging an entry into `Transactions` and crediting the user's wallet with the purchased points.

---

# CHAPTER 4: VERIFICATION, TESTING & SECURITY AUDIT

## 4.1 Testing Methodology & Environment

System verification followed a structured test plan covering Unit Testing, Integration Testing, Concurrency Testing, and Security Auditing:
- **Test Server:** Node.js v20 LTS on Windows 11 / Linux Ubuntu 22.04.
- **Database Target:** PostgreSQL 15 on Supabase (SSL enabled, connection pool size: 20).
- **Client Testing Browsers:** Google Chrome v128, Mozilla Firefox v129, Apple Safari v17.
- **Target Host Application:** Adobe After Effects CC 2024 (ExtendScript Toolkit & AE Scripting Console).

---

## 4.2 Comprehensive System Test Cases

| Test Case ID | Module / Feature | Test Objective & Input | Expected System Behavior | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Authentication | Send OTP request to `user@test.com` | 6-digit numeric token generated, hashed with bcrypt, stored in DB with 10min expiry; dispatch triggered. | Token created and stored; verification email dispatched. | **PASS** |
| **TC-AUTH-02** | Authentication | Verify with incorrect OTP code (`000000`) | Comparison fails (`bcrypt.compare` returns false); HTTP 400 with invalid token message. | HTTP 400 returned: "Invalid or expired OTP code". | **PASS** |
| **TC-AUTH-03** | Authentication | Replay previously used valid OTP | Verification rejected because `consumed = TRUE`; HTTP 400 returned. | Replay attempt blocked cleanly. | **PASS** |
| **TC-AUTH-04** | RBAC Guard | Non-admin user calls `DELETE /api/marketplace/products/:id` | Token verified, but email does not match `ADMIN_EMAIL`; HTTP 403 Forbidden returned. | HTTP 403 Forbidden returned. | **PASS** |
| **TC-WALL-01** | Wallet Engine | Deduct 1 credit when balance = 100 | Transaction completes; balance decrements to 99; record logged in `HistoryLog`. | Balance updated to 99; history record created. | **PASS** |
| **TC-WALL-02** | Wallet Engine | Attempt deduction when balance = 0 | Transaction aborts; `CHECK (balancePoints >= 0)` and application logic reject request with HTTP 402. | HTTP 402 returned: "Insufficient credits". | **PASS** |
| **TC-WALL-03** | Wallet Engine | Top-up 500 credits via `/api/wallet/topup` | Balance increments by 500; record logged in `Transactions` with status 'completed'. | Balance updated; transaction logged. | **PASS** |
| **TC-GEN-01** | Script Generator | Synthesize Layer Stagger with 5-frame delay | Synthesizes valid `.jsx` containing `app.beginUndoGroup` and layer loop logic. | Clean ECMAScript 3 code generated. | **PASS** |
| **TC-GEN-02** | AE Execution | Run generated `.jsx` inside After Effects CC | Script executes in active composition without syntax errors; creates undo entry. | Script executed cleanly in AE composition. | **PASS** |
| **TC-PANEL-01**| Panel Builder | Add 3 action buttons and export ScriptUI | Generates valid `Window("palette")` code with operational `onClick` handlers. | ScriptUI code generated; dockable in AE. | **PASS** |
| **TC-MARK-01** | Marketplace | Purchase script for 25 credits | Deducts 25 credits from wallet; inserts record into `MarketplacePurchases`. | Balance decremented; product marked as owned. | **PASS** |
| **TC-MARK-02** | Marketplace | Repurchase already owned script | Unique constraint `uq_user_product` prevents duplicate purchase; HTTP 400 returned. | Duplicate acquisition blocked cleanly. | **PASS** |

---

## 4.3 Concurrency & ACID Integrity Verification

To verify concurrency safety under simultaneous credit deduction requests, simulated automated load testing was executed:
- **Scenario:** 10 concurrent requests to `/api/scripts/generate` dispatched simultaneously for a user with a balance of 5 credits.
- **Outcome Without Row Locking:** Traditional `SELECT` then `UPDATE` patterns without locks can result in race conditions where multiple requests read the initial balance before any update commits, leading to overdrafts.
- **Outcome With Scriptify Implementation:** Thanks to `SELECT ... FOR UPDATE` row-level locks, transactions execute sequentially at the row level. Exactly 5 requests succeeded (decrementing balance from 5 to 0), and the remaining 5 requests were cleanly rejected with `HTTP 402 Insufficient credits`. Balance remained exactly at 0, demonstrating absolute transactional consistency.

---

## 4.4 Security Posture & Vulnerability Mitigation

| Threat / Vulnerability | Risk Level | Scriptify Mitigation Strategy | Verification Status |
|---|---|---|---|
| **SQL Injection (SQLi)** | High | 100% of database queries use parameterized `$1, $2` prepared statement bindings via `pg`. Raw string concatenation is strictly prohibited across all services. | **Verified Safe** |
| **Cross-Site Scripting (XSS)** | Medium | Frontend DOM population relies on `textContent` and parameterized template structures. Instruction rendering in `marketplace.js` processes content safely. | **Mitigated** |
| **OTP Replay Attacks** | High | Tokens are hashed with `bcryptjs` and enforce a single-use lifecycle flag (`consumed = TRUE`) alongside a 10-minute expiry boundary. | **Verified Safe** |
| **Administrative Privilege Escalation** | High | Admin API routes enforce combined middleware checks (`requireAuth + requireAdmin`) validating identity server-side against protected configurations. | **Verified Safe** |
| **Cross-Origin Resource Sharing (CORS)** | Medium | Production CORS configuration restricts origins to authorized domains and verified deployment previews, preventing unauthorized cross-origin requests. | **Configured** |

---

# CHAPTER 5: CONCLUSION & FUTURE SCOPE

## 5.1 Summary of Achievements

The development of the **Scriptify** platform successfully achieved all primary research, design, and implementation goals established for the MCA 307 Mini Project:
1. **Architectural Cohesion:** Implemented a full-stack web application combining 18 responsive frontend interfaces with an Express.js MVC backend and a normalized 3NF PostgreSQL database.
2. **Effective Creative Automation:** Built functional generators capable of synthesizing valid Adobe After Effects ExtendScript (`.jsx`) files, kinetic typography rigs, and dockable ScriptUI panels.
3. **Resilient Financial Ledger:** Engineered a dual-entry credit ledger protected against race conditions through PostgreSQL row-level locks (`FOR UPDATE`) and database-level `CHECK` constraints.
4. **Secure Hybrid Authentication:** Delivered a passwordless authentication experience supporting both Email OTP codes and Firebase Google OAuth.
5. **Verified Industry Relevance:** Successfully eliminated repetitive manual rigging workflows in After Effects, demonstrating measurable productivity gains for motion design pipelines.

## 5.2 Key Limitations

While the current release is robust and feature-complete for its intended scope, the following limitations are acknowledged:
- **Client Execution Boundary:** Scripts are synthesized server-side and downloaded as `.jsx` files; execution within Adobe After Effects requires manual invocation via `File > Scripts > Run Script File...` or installation into the AE `Startup` directory.
- **Simulated Payment Processing:** The current payment gateway implementation ("FakePay™") simulates credit card and UPI transactions rather than processing live banking cards via Stripe or Razorpay.
- **Client-Side Preview Fidelity:** The in-browser text animator preview uses a 2D HTML5 canvas approximation rather than rendering native Adobe After Effects composition frames.

## 5.3 Roadmap for Future Enhancements

The platform architecture is designed to accommodate several planned future capabilities:
1. **Native Adobe UXP / CEP Panel Extension:** Package Scriptify as a native Adobe Common Extensibility Platform (CEP) / Unified Extensibility Platform (UXP) panel, enabling users to generate and execute scripts directly inside the After Effects application window.
2. **Natural Language Script Synthesis:** Integrate an AI-powered natural language code generation interface, allowing creators to describe complex rigging behaviors in plain English (e.g., *"Stagger all 3D layers in a spiral outward from composition center"*) and receive synthesized ExtendScript.
3. **Live Payment Gateway Integration:** Replace the simulated payment engine with verified Stripe and Razorpay webhook integrations for automated processing of commercial transactions.
4. **Cloud-Based AE Render Engine:** Connect the backend to headless Adobe After Effects instances (`aerender.exe`) on cloud worker nodes to provide server-rendered MP4 previews directly within the browser interface.

---

# CHAPTER 6: REFERENCES & BIBLIOGRAPHY

1. **Adobe Systems Inc.** (2023). *After Effects Scripting Guide: ExtendScript Tools and Features*. Adobe Developer Network.
2. **Adobe Systems Inc.** (2018). *JavaScript Tools Guide: Creative Suite CS6 & Creative Cloud Edition*. Adobe Systems Incorporated.
3. **Elmasri, R., & Navathe, S. B.** (2016). *Fundamentals of Database Systems* (7th ed.). Pearson Education.
4. **Fielding, R. T.** (2000). *Architectural Styles and the Design of Network-based Software Architectures* (Doctoral dissertation). University of California, Irvine.
5. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
6. **Mozilla Developer Network (MDN).** (2024). *Express Web Framework (Node.js/JavaScript)*. MDN Web Docs.
7. **PostgreSQL Global Development Group.** (2024). *PostgreSQL 16 Documentation: Transactions and Concurrency Control*. pgsql.org.
8. **GreenSock.** (2024). *GSAP Documentation: High-performance animations for the modern web*. greensock.com/docs.
9. **Firebase Documentation.** (2024). *Firebase Authentication for Web: Federated Identity and OAuth 2.0*. Google Developers.
10. **Resig, J., Bibeault, B., & Maras, J.** (2016). *Secrets of the JavaScript Ninja* (2nd ed.). Manning Publications.

---
*End of Report — Scriptify MCA Mini Project Documentation (MCA 307)*
