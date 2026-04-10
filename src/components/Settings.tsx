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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* TUTOR MODE */}
          <div className="space-y-2">
            <Label>Tutor Mode</Label>

            <Select value={tutorMode} onValueChange={setTutorMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="destructive" onClick={onReset}>
              End chat
            </Button>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}