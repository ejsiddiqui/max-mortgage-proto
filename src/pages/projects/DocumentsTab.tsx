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
  Ban
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
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DocumentsTabProps {
  project: any;
}

export default function DocumentsTab({ project }: DocumentsTabProps) {
  const { role } = useCurrentUser();
  const isAdmin = role === "admin";
  const isViewer = role === "viewer";
  const canModify = role === "admin" || role === "agent";
  const canVerify = role === "admin" || role === "viewer";

  const docs = useQuery(api.documents.listByProject, { projectId: project._id });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDoc = useMutation(api.documents.upload);
  const verifyDoc = useMutation(api.documents.verify);
  const rejectDoc = useMutation(api.documents.reject);
  const removeFile = useMutation(api.documents.removeFile);

  const [expandedSections, setExpandedSections] = useState<string[]>(["borrower"]);
  const [rejectingDoc, setRejectingDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const slots = getDocSlotsForBorrowerType(project.borrowerType);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(s => s !== sectionId) : [...prev, sectionId]
    );
  };

  const handleFileUpload = async (slot: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(slot.code);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await uploadDoc({
        projectId: project._id,
        documentCode: slot.code,
        section: slot.section,
        label: slot.label,
        storageId,
      });
      toast.success(`${slot.code} uploaded successfully`);
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
              <p className="text-2xl font-bold text-primary">{Math.round((stats.uploaded / stats.total) * 100)}%</p>
            </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${(stats.uploaded / stats.total) * 100}%` }}
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
              {expandedSections.includes(section.id) ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>

            {expandedSections.includes(section.id) && (
              <div className="divide-y divide-border/50">
                {slots.filter(s => s.section === section.id).map((slot) => {
                  const doc = docs?.find(d => d.documentCode === slot.code);
                  return (
                    <div key={slot.code} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          </div>
                          <h5 className="font-bold text-foreground">{slot.label}</h5>
                          {doc?.rejectionReason && (
                            <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-2 items-start max-w-md">
                              <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5" />
                              <p className="text-[11px] text-destructive font-medium">Rejection: {doc.rejectionReason}</p>
                            </div>
                          )}
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
                                disabled={isUploading === slot.code}
                              >
                                <Upload className="w-4 h-4" />
                                {isUploading === slot.code ? "..." : "Upload"}
                              </Button>
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(slot, e)}
                                disabled={isUploading === slot.code}
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

                          {doc?.fileIds?.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl h-9 w-9 p-0 border-border"
                              title="Download Latest"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

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
