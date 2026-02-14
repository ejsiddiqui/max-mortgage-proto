import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  X,
  FileCheck,
  Ban,
  Plus
} from "lucide-react";
import { DOCUMENT_SECTIONS, getDocSlotsForBorrowerType } from "@/lib/documentConfig";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { sanitizeFilename } from "@/lib/utils";

interface DocumentsTabProps {
  project: any;
}

export default function DocumentsTab({ project }: DocumentsTabProps) {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";
  const canModify = role === "admin" || role === "agent";
  const canVerify = role === "admin" || role === "viewer";

  const docs = useQuery(api.documents.listByProject, { projectId: project._id });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.upload);
  const verifyDoc = useMutation(api.documents.verify);
  const rejectDoc = useMutation(api.documents.reject);
  const removeFile = useMutation(api.documents.removeFile);
  const deleteDocument = useMutation(api.documents.deleteDocument);

  const [expandedSections, setExpandedSections] = useState<string[]>(["borrower"]);
  const [rejectingDoc, setRejectingDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  // Others section state
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherLabel, setOtherLabel] = useState("");

  const slots = getDocSlotsForBorrowerType(project.borrowerType);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(s => s !== sectionId) : [...prev, sectionId]
    );
  };

  const handleFileUpload = async (slot: any, e: React.ChangeEvent<HTMLInputElement>, isOther = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    if (slot.allowedTypes && !slot.allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type. Allowed: ${slot.allowedTypes.join(", ")}`);
      return;
    }

    const uploadKey = isOther ? `other-${slot._id || 'new'}` : slot.code;
    setIsUploading(uploadKey);
    
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      const sanitizedName = sanitizeFilename(file.name);

      await uploadDoc({
        projectId: project._id,
        documentCode: isOther ? "OTHER" : slot.code,
        section: slot.section,
        label: isOther ? slot.label : slot.label,
        storageId,
        fileName: sanitizedName,
      });
      
      toast.success(`${isOther ? slot.label : slot.code} uploaded successfully`);
      if (isOther) {
        setIsAddingOther(false);
        setOtherLabel("");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(null);
    }
  };

  const handleVerify = async (docId: any) => {
    try {
      await verifyDoc({ id: docId });
      toast.success("Document verified");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectDoc({ id: rejectingDoc._id, reason: rejectionReason });
      toast.success("Document rejected");
      setRejectingDoc(null);
      setRejectionReason("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveFile = async (docId: any, storageId: string) => {
    try {
      await removeFile({ id: docId, storageId });
      toast.success("File removed");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteDoc = async (docId: any) => {
    if (!confirm("Are you sure you want to delete this document entry and all its files?")) return;
    try {
      await deleteDocument({ id: docId });
      toast.success("Document deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDocStatusBadge = (status?: string) => {
    switch (status) {
      case "verified": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Verified</Badge>;
      case "uploaded": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Uploaded</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline" className="text-slate-500 border-slate-300">Missing</Badge>;
    }
  };

  const stats = {
    total: slots.length,
    uploaded: slots.filter(s => {
      const doc = docs?.find(d => d.documentCode === s.code);
      return doc && (doc.status === "uploaded" || doc.status === "verified");
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="rounded-3xl border-border shadow-sm bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Document Checklist Progress</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stats.uploaded} of {stats.total} Documents</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{Math.round((stats.uploaded / (stats.total || 1)) * 100)}%</p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${(stats.uploaded / (stats.total || 1)) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Document Sections */}
      <div className="space-y-4">
        {DOCUMENT_SECTIONS.filter(s => !s.selfEmployedOnly || project.borrowerType === "self_employed").map((section) => (
          <div key={section.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border/50"
            >
              <h4 className="font-bold text-foreground/80">{section.label}</h4>
              <div className="flex items-center gap-4">
                {section.id === "other" && canModify && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingOther(true);
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add Document
                  </Button>
                )}
                {expandedSections.includes(section.id) ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </div>
            </button>

            {expandedSections.includes(section.id) && (
              <div className="divide-y divide-border/50">
                {/* Regular Slots */}
                {section.id !== "other" && slots.filter(s => s.section === section.id).map((slot) => {
                  const doc = docs?.find(d => d.documentCode === slot.code);
                  return (
                    <div key={slot.code} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-4 items-start">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            doc?.status === "verified" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{slot.code}</span>
                              {slot.required && <Badge variant="secondary" className="text-[8px] bg-muted text-muted-foreground border-none uppercase h-4">Required</Badge>}
                              {slot.multiFile && <Badge variant="outline" className="text-[8px] border-border text-muted-foreground uppercase h-4">Multi-file</Badge>}
                            </div>
                            <h5 className="font-bold text-foreground">{slot.label}</h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getDocStatusBadge(doc?.status)}
                          
                          <div className="flex items-center gap-1">
                            {canModify && (
                              <div className="relative">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-xl h-9 gap-2 border-border"
                                  disabled={isUploading === slot.code || (doc && !slot.multiFile && doc.status === "verified")}
                                >
                                  <Upload className="w-4 h-4" />
                                  {isUploading === slot.code ? "..." : (doc?.fileIds?.length ? "Add More" : "Upload")}
                                </Button>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                  onChange={(e) => handleFileUpload(slot, e)}
                                  disabled={isUploading === slot.code || (doc && !slot.multiFile && doc.status === "verified")}
                                  multiple={slot.multiFile}
                                />
                              </div>
                            )}

                            {doc?.status === "uploaded" && canVerify && (
                              <>
                                <Button 
                                  onClick={() => handleVerify(doc._id)}
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-xl h-9 w-9 p-0 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                                  title="Verify"
                                >
                                  <FileCheck className="w-4 h-4" />
                                </Button>
                                <Button 
                                  onClick={() => setRejectingDoc(doc)}
                                  variant="outline" 
                                  size="sm" 
                                  className="rounded-xl h-9 w-9 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                                  title="Reject"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {doc?.rejectionReason && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex gap-3 items-start">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-red-700">Document Rejected</p>
                            <p className="text-[11px] text-red-600 font-medium mt-0.5">{doc.rejectionReason}</p>
                          </div>
                        </div>
                      )}

                      {/* File List */}
                      {doc?.fileIds && doc.fileIds.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Uploaded Files ({doc.fileIds.length})</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {doc.fileIds.map((fileId: string, idx: number) => (
                              <FileItem 
                                key={fileId} 
                                storageId={fileId} 
                                fileName={doc.filenames?.[idx]}
                                index={idx} 
                                canDelete={isAdmin}
                                onDelete={() => handleRemoveFile(doc._id, fileId)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Others Slots */}
                {section.id === "other" && docs?.filter(d => d.section === "other").map((doc) => (
                  <div key={doc._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4 items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          doc?.status === "verified" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OTHER</span>
                          </div>
                          <h5 className="font-bold text-foreground">{doc.label}</h5>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getDocStatusBadge(doc.status)}
                        
                        <div className="flex items-center gap-1">
                          {canModify && (
                            <div className="relative">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl h-9 gap-2 border-border"
                                disabled={isUploading === `other-${doc._id}`}
                              >
                                <Upload className="w-4 h-4" />
                                {isUploading === `other-${doc._id}` ? "..." : "Add More"}
                              </Button>
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(doc, e, true)}
                                disabled={isUploading === `other-${doc._id}`}
                              />
                            </div>
                          )}

                          {doc.status === "uploaded" && canVerify && (
                            <>
                              <Button 
                                onClick={() => handleVerify(doc._id)}
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl h-9 w-9 p-0 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              >
                                <FileCheck className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => setRejectingDoc(doc)}
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl h-9 w-9 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {isAdmin && (
                            <Button 
                              onClick={() => handleDeleteDoc(doc._id)}
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl h-9 w-9 p-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                              title="Delete Entire Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* File List */}
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {doc.fileIds.map((fileId: string, idx: number) => (
                          <FileItem 
                            key={fileId} 
                            storageId={fileId} 
                            fileName={doc.filenames?.[idx]}
                            index={idx} 
                            canDelete={isAdmin}
                            onDelete={() => handleRemoveFile(doc._id, fileId)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {section.id === "other" && docs?.filter(d => d.section === "other").length === 0 && !isAddingOther && (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">
                    No additional documents uploaded.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Other Doc Modal */}
      <Dialog open={isAddingOther} onOpenChange={setIsAddingOther}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Add Additional Document</DialogTitle>
            <DialogDescription>
              Enter a label for the document and upload the file(s).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Label *</label>
              <Input 
                placeholder="e.g. Credit Card Statement"
                value={otherLabel}
                onChange={e => setOtherLabel(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File *</label>
              <div className="relative">
                <Button variant="outline" className="w-full rounded-xl h-20 border-dashed border-2 flex flex-col gap-1">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click to select or drag and drop</span>
                </Button>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload({ label: otherLabel, section: "other" }, e, true)}
                  disabled={!otherLabel || isUploading === "other-new"}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingOther(false)} className="rounded-xl">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={!!rejectingDoc} onOpenChange={(open) => !open && setRejectingDoc(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Provide a reason why this document is being rejected. This will be visible to the agent.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="e.g. Image is blurred or document is expired..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingDoc(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleReject} className="rounded-xl px-8 bg-red-600 hover:bg-red-700">Reject Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FileItem({ storageId, fileName, index, canDelete, onDelete }: { storageId: string, fileName?: string, index: number, canDelete: boolean, onDelete: () => void }) {
  const url = useQuery(api.documents.getFileUrl, { storageId });

  return (
    <div className="flex items-center justify-between p-2 pl-3 rounded-xl bg-muted/50 border border-border/50 group">
      <div className="flex items-center gap-2 overflow-hidden">
        <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-[11px] font-medium text-foreground truncate" title={fileName || `File ${index + 1}`}>
          {fileName || `File ${index + 1}`}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {url && (
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-white">
            <a href={url} target="_blank" rel="noreferrer" download>
              <Download className="w-3.5 h-3.5 text-primary" />
            </a>
          </Button>
        )}
        {canDelete && (
          <Button 
            onClick={onDelete}
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
