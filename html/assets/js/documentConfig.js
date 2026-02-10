/**
 * documentConfig.js
 * 29 PRD-compliant document slots for Max Mortgage
 * Section 5.2.2 of the PRD is authoritative
 */

export const DOCUMENT_CONFIG = [
    // Section A — Borrower Documents
    { code: 'A1', label: 'Valid UAE ID', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'A2', label: 'Valid Passport', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'A3', label: 'Visa', section: 'borrower', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'A4', label: 'DEWA Bill of current residence', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
    { code: 'A5', label: 'Bank Account details', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
    { code: 'A6', label: 'Existing Bank Account Statement for 12 months', section: 'borrower', multiFile: false, required: true, selfEmployedOnly: false },
    { code: 'A7', label: 'Salary Certificate', section: 'borrower', multiFile: false, required: false, selfEmployedOnly: false },

    // Section B — Company Documents (Self-Employed Only)
    { code: 'B1', label: 'Trade License, MOA & AOA', section: 'company', multiFile: true, required: true, selfEmployedOnly: true },
    { code: 'B2', label: 'Company Information / Activity', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },
    { code: 'B3', label: 'Bank Account Statement for 6 months', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },
    { code: 'B4', label: 'Company Profile / Website', section: 'company', multiFile: false, required: true, selfEmployedOnly: true },

    // Section C — Asset Documents
    { code: 'C1', label: 'Title Deed', section: 'asset', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'C2', label: 'Affection / Site plan of plot/land', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
    { code: 'C3', label: 'Floor Plan or Approved Drawings', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
    { code: 'C4', label: 'Certificate of Completion / Completion Notice', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
    { code: 'C5', label: 'MOU or SPA or Initial Contract of Sale', section: 'asset', multiFile: true, required: false, selfEmployedOnly: false },
    { code: 'C6', label: 'Form F', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
    { code: 'C7', label: 'Developer Statement of Accounts', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false },
    { code: 'C8', label: 'Valuation Slip (to be PAID)', section: 'asset', multiFile: false, required: true, selfEmployedOnly: false },
    { code: 'C9', label: 'Project Profile', section: 'asset', multiFile: false, required: false, selfEmployedOnly: false },

    // Section D — Banking Documents
    { code: 'D1', label: 'AECB Form for Individual (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
    { code: 'D2', label: 'AECB Form Company (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: true, allowedTypes: ['application/pdf'] },
    { code: 'D3', label: 'Bank Application Form (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
    { code: 'D4', label: 'PNWS Form (to be filled & signed)', section: 'bank', multiFile: false, required: true, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },
    { code: 'D5', label: 'Existing Asset Title Information', section: 'bank', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'D6', label: 'Key Fact Statement — FAB Bundle T&C (to be signed)', section: 'bank', multiFile: false, required: false, selfEmployedOnly: false, allowedTypes: ['application/pdf'] },

    // Section E — Lease of Target Asset
    { code: 'E1', label: 'Trade License of Company or UAE ID of individual tenancy', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'E2', label: 'Tenancy or Ijary agreement (min AED 0.525m)', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false },
    { code: 'E3', label: 'Tenancy 4 Cheques', section: 'lease', multiFile: true, required: true, selfEmployedOnly: false }
];

export const getDocSlotsForBorrowerType = (borrowerType) => {
    if (borrowerType === 'salaried') {
        return DOCUMENT_CONFIG.filter(slot => !slot.selfEmployedOnly);
    }
    return DOCUMENT_CONFIG;
};
