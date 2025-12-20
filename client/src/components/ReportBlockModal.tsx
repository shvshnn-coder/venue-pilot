import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Flag, Ban, AlertTriangle } from "lucide-react";
import { REPORT_REASONS } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  currentUserId: string;
  mode: "report" | "block" | "both";
}

export default function ReportBlockModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  currentUserId,
  mode,
}: ReportBlockModalProps) {
  const [step, setStep] = useState<"choose" | "report" | "block" | "success">("choose");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const { toast } = useToast();

  const reportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reports", {
        reporterId: currentUserId,
        reportedUserId: targetUserId,
        reason: selectedReason,
        additionalDetails: additionalDetails || null,
      });
    },
    onSuccess: () => {
      if (alsoBlock) {
        blockMutation.mutate();
      } else {
        setStep("success");
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/blocks", {
        blockerId: currentUserId,
        blockedUserId: targetUserId,
      });
    },
    onSuccess: () => {
      setStep("success");
      toast({
        title: alsoBlock ? "Report submitted and user blocked" : "User blocked",
        description: alsoBlock 
          ? "Thank you for your report. You will no longer see this user."
          : `You will no longer see ${targetUserName} in your feed.`,
      });
    },
    onError: (error: Error) => {
      if (error.message?.includes("409")) {
        toast({
          title: "User already blocked",
          description: "You have already blocked this user.",
        });
        setStep("success");
      } else {
        toast({
          title: "Failed to block user",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  const handleClose = () => {
    setStep("choose");
    setSelectedReason("");
    setAdditionalDetails("");
    setAlsoBlock(false);
    onClose();
  };

  const handleSubmitReport = () => {
    if (!selectedReason) return;
    reportMutation.mutate();
  };

  const handleBlockOnly = () => {
    blockMutation.mutate();
  };

  const isPending = reportMutation.isPending || blockMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-md theme-card border-theme-accent/30" data-testid="modal-report-block">
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 theme-text">
                <AlertTriangle className="w-5 h-5 theme-highlight" />
                What would you like to do?
              </DialogTitle>
              <DialogDescription className="theme-text-muted">
                Choose an action for {targetUserName}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              {(mode === "report" || mode === "both") && (
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-4 px-4"
                  onClick={() => setStep("report")}
                  data-testid="button-report-user"
                >
                  <Flag className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <div className="font-medium">Report User</div>
                    <div className="text-sm theme-text-muted">Report inappropriate behavior</div>
                  </div>
                </Button>
              )}
              {(mode === "block" || mode === "both") && (
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-4 px-4"
                  onClick={() => setStep("block")}
                  data-testid="button-block-user"
                >
                  <Ban className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <div className="font-medium">Block User</div>
                    <div className="text-sm theme-text-muted">Stop seeing this person</div>
                  </div>
                </Button>
              )}
            </div>
          </>
        )}

        {step === "report" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 theme-text">
                <Flag className="w-5 h-5 text-orange-500" />
                Report {targetUserName}
              </DialogTitle>
              <DialogDescription className="theme-text-muted">
                Select a reason for your report. This will be sent to our moderation team.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <RadioGroup
                value={selectedReason}
                onValueChange={setSelectedReason}
                className="gap-3"
              >
                {REPORT_REASONS.map((reason) => (
                  <div key={reason} className="flex items-center space-x-3">
                    <RadioGroupItem value={reason} id={reason} data-testid={`radio-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`} />
                    <Label htmlFor={reason} className="cursor-pointer theme-text">
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-4">
                <Label htmlFor="details" className="theme-text-muted text-sm">
                  Additional details (optional)
                </Label>
                <Textarea
                  id="details"
                  placeholder="Provide any additional context..."
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  className="mt-2 theme-surface border-theme-accent/30"
                  data-testid="input-report-details"
                />
              </div>

              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="also-block"
                  checked={alsoBlock}
                  onChange={(e) => setAlsoBlock(e.target.checked)}
                  className="rounded border-theme-accent/30"
                  data-testid="checkbox-also-block"
                />
                <Label htmlFor="also-block" className="cursor-pointer theme-text text-sm">
                  Also block this user
                </Label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("choose")} disabled={isPending}>
                Back
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={!selectedReason || isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                data-testid="button-submit-report"
              >
                {isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "block" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 theme-text">
                <Ban className="w-5 h-5 text-red-500" />
                Block {targetUserName}?
              </DialogTitle>
              <DialogDescription className="theme-text-muted">
                They won't be able to see your profile or contact you. You can unblock them later from settings.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep("choose")} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={handleBlockOnly}
                disabled={isPending}
                variant="destructive"
                data-testid="button-confirm-block"
              >
                {isPending ? "Blocking..." : "Block User"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 theme-text">
                <AlertTriangle className="w-5 h-5 theme-highlight" />
                Done
              </DialogTitle>
              <DialogDescription className="theme-text-muted">
                Your request has been processed. Thank you for helping keep our community safe.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <Button onClick={handleClose} data-testid="button-close-modal">
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
