import { TutorMode } from "../../types/tutor";

interface Props {
  value: TutorMode;
  onChange: (mode: TutorMode) => void;
}

export default function TutorModeSelector({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TutorMode)}
    >
      <option value="casual">Casual Conversation Tutor</option>
      <option value="academic">Structured Academic Tutor</option>
    </select>
  );
}