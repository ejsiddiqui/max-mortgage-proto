# Document Requirements (PRD Section 5.2)

## Total Slots

29 predefined + Others section
- **Salaried borrowers:** 24 slots (Section B + D2 hidden)
- **Self-employed borrowers:** 29 slots (all visible)

## Document Slot Breakdown (PRD Section 5.2.2)

- Section A (Borrower): 7 slots (A1-A7)
- Section B (Company, self-employed only): 4 slots (B1-B4)
- Section C (Asset): 9 slots (C1-C9)
- Section D (Banking): 6 slots (D1-D6, D2 self-employed only)
- Section E (Lease): 3 slots (E1-E3)
- Section F (Others): Ad-hoc user-defined

## File Type Rules (PRD Section 5.2.3)

- Multi-file slots: PDF, JPG/JPEG, PNG, XLS, DOC, DOCX, PPT, PPTX
- PDF-only slots: C6, D1, D2, D3, D4, D6 (banking forms — must validate as application/pdf only)
- Use Convex `storage.store()` API, store `Id<"_storage">[]` array in documents table
- MIME types: application/pdf, image/jpeg, image/png, application/vnd.ms-excel, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation

## Key Rules

- **Conditional visibility:** Section B (Company Documents) and D2 (AECB Form Company) are hidden entirely for Salaried borrowers
- **Progress calculation:** `X of Y documents uploaded` where Y = total required slots for borrower type, X = slots with status uploaded/verified
- **Auto-milestone:** When all required docs reach uploaded/verified, auto-set `docsCompletedAt = Date.now()` if not already set
- **Multi-file support:** Store as array `fileIds: Id<"_storage">[]`, show list of files with individual download/delete actions
- **Action buttons:** Use explicit Upload/Verify/Reject/Download buttons (not click-to-cycle status)
- **Rejection flow:** Admin/Viewer can reject with required reason text, doc returns to Missing state for re-upload

## File Upload

- Allowed types: PDF, JPG/JPEG, PNG, XLS, DOC, DOCX, PPT, PPTX
- PDF-only slots: C6, D1, D2, D3, D4, D6 (banking forms)
- Multi-file slots: Most documents except single-file restricted ones
- Use Convex storage API in production
