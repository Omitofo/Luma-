import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import type { TutorMode } from "../types/tutor";

interface Props {
  open: boolean;
  tutorMode: TutorMode;
  setTutorMode: (mode: TutorMode) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function Settings({
  open,
  tutorMode,
  setTutorMode,
  onClose,
  onReset,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tutor Mode */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Tutor Mode
            </Label>

            <Select
              value={tutorMode}
              onValueChange={(value) =>
                setTutorMode(value as TutorMode)
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>

              <SelectContent className="z-[100] border border-border bg-popover text-popover-foreground shadow-xl">
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Reset current conversation and return to onboarding.
            </p>

            <Button
              variant="destructive"
              className="w-full"
              onClick={onReset}
            >
              End Chat
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}