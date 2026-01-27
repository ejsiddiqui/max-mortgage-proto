**Project Specification**

_Max Mortgage System_


## **1. Executive Summary**

Max Mortgage is a specialized **Lead & Project Management System (MIS)** designed to streamline the mortgage workflow from intake to disbursement. Unlike generic CRMs, this system enforces a strict mortgage-specific lifecycle, ensuring data integrity for reporting (MIS) while maintaining flexibility through a robust template engine.

**Primary Goal:** To serve as a "backend office" engine where Admins and Agents manage cases with strict auditability, document compliance, and milestone tracking.


## **2. Actors & Access Control (RBAC)**

_Rationale: Defining who is in the room before defining what they do._


### **2.1 Internal Users (Authenticated)**

|           |                                                                                                 |                                                                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Role**  | **Responsibility**                                                                              | **Data Visibility Scope**                                                                                                                |
| **Admin** | Full system oversight. Manages users, master tables (Referral Companies, Banks), and templates. | **Global Access:** Can view/edit all projects, financials, backdate milestones, and verify documents.                                    |
| **Agent** | Case management. Focuses on moving their assigned leads through the pipeline.                   | **Scoped Access:** Can only view/edit projects assigned to them.**Financials:** Can view "Final Commission" for their own projects only. |


### **2.2 External Entities (Non-Authenticated)**

- **Client (Borrower):** A data entity (Name, Email, Phone) attached to a project. No login access.

- **Referral Company:** A master data entity managed by Admins. Used for tagging projects and calculating commission splits. No login access.


## **3. Core Functional Modules**

### **3.1 The "Project" Engine (Workflow & Lifecycle)**

_The central unit of work. Every submission is a unique Project._

- **The "One-Bank" Rule:** A project represents exactly **one** submission to **one** bank. If a client applies to a second bank, a new Project must be created.

- **Naming Convention:** Auto-generated: {Project Code} + {Client Name} + {Business Type}.

- **Status Logic (The 3 States):**

1. **Open:** Active project. Counters are running.

2. **On-Hold:** Temporarily paused (e.g., Client paused search). **Action:** Pauses the "Time in Stage" aging clock.

3. **Closed:** Terminal state. Requires an **Outcome** (Approved, Rejected, Cancelled, Disbursed).

- **Stage vs. Status:**

* Movement through Stages (Kanban) is allowed only when Status is Open.

* If Status is Closed or On-Hold, Stage is locked.


### **3.2 Commission & Financials Module**

_Handling the revenue flow. Located within the "Disbursement" section of a project._

**Data Flow:**

1. **Loan Amount:** Pulled from the project data.

2. **Expected Total Commission:** Calculated (Loan Amount \* Bank Rate) or Manual Override (Admin).

3. **Splits (Projected):**

- _Agent Share:_ % based on Agent profile.

- _Referral Share:_ % based on Referral Company agreement (if applicable).

4. **Final Commission (Actual):** Entered manually by Admin _after_ disbursement.

5. **Final Payouts:** System recalculates Agent/Referral payouts based on the _Actual_ amount received.


### **3.3 Dynamic Template System**

_Handling variability in requirements._

- **Hierarchy:** Business Type Template (Base) + Bank Override (Optional Layer).

- **Versioning:** Templates are versioned. Existing projects retain their legacy template version to prevent data corruption.

- **Components:** Screens (Sections) and Fields (Typed inputs: Text, Dropdown, Number, File).


### **3.4 Document Management**

- **Categories:**

* **Required Docs:** Defined by the Template. These drive the "Docs Completed" milestone.

* **Other Docs:** Ad-hoc uploads. Visible to Admin/Owner only.

- **Visibility:** "Other Docs" are strictly restricted to Admin and Project Owner.

- **Lifecycle:** Missing → Uploaded → Verified (Admin only) or Rejected.


## **4. Analytics & Reporting Architecture**

### **4.1 Automated Milestones (T1-T4)**

Milestones are **deterministic** timestamps.

- **T1 (Speed to Lead):** _Creation_ → _Docs Completed_

- **T2 (Prep Time):** _Docs Completed_ → _Submission_

- **T3 (Bank SLA):** _Submission_ → _Decision_

- **T4 (Closing):** _Decision_ → _Disbursement_


### **4.2 Data Integrity Rules**

- **Chronological Order:** System enforces Date(Stage N) >= Date(Stage N-1).

- **Backdating:** Only Admins can edit past milestone dates.

- **Caching Strategy:** A ProjectFacts table stores calculated rollups (e.g., "Days in Stage", "Commission Agent Share") for instant reporting.


## **5. Visual Process Flows**

### **5.1 Project Lifecycle (Status vs. Stage)**

This diagram illustrates the separation of "Stage" (Kanban) from "Status" (Lifecycle), including the new **On-Hold** state.

stateDiagram-v2
    direction LR
    
    state "Active Lifecycle" as Active {
        state "Open (Clock Ticking)" as Open
        state "On-Hold (Clock Paused)" as Hold
        
        Open --> Hold : Client Pauses
        Hold --> Open : Client Resumes
    }

    state "Closed (Terminal)" as Closed {
        state "Outcome Set" as Outcome
        Outcome --> Approved
        Outcome --> Rejected
        Outcome --> Cancelled
        Outcome --> Disbursed
    }

    Active --> Closed : Outcome Selected
    Closed --> Active : Admin Override Only


### **5.2 Commission Calculation Flow**

Logic for determining payouts.

    Loan Amount (from project data)
        ↓
    Expected Total Commission (calculated or manual entry by admin)
        ↓
        ├→ Agent Share (calculated from agent's commission rate)
        └→ Referral Share (calculated from referral company's commission rate)
        ↓
    Final Commission (actual received amount - entered after disbursement)
        ↓
        ├→ Agent Payout
        └→ Referral Payout


## **6. Technical Specifications**

### **6.1 Technology Stack**

- **Frontend:** React (React Starter Kit), UI components via ShadCN.

- **Backend & Database:** Convex (Backend-as-a-Service) for schema flexibility and real-time updates.

- **Auth:** Clerk (Authentication & User Management).

- **Testing:** Vitest, agent-browser.


### **6.2 Audit & Security**

- **Immutable Audit Log:** Every critical action (Stage Change, Document Upload, Commission Edit) is recorded in an append-only auditEvents table.

- **Field-Level History:** Track changes to "Loan Amount" and "Commission Rates" specifically.


## **7. Assumptions & Constraints**

1. **Currency:** Single currency assumed for MVP (or handled strictly as values without conversion logic).

2. **Notifications:** System generates email notifications; in-app notifications are out of scope for MVP v1.0.

3. **Mobile:** Responsive web design (mobile-friendly), but no native mobile app.
