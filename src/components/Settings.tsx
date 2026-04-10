import { TutorMode } from "../types/tutor";

interface Props {
  tutorMode: TutorMode;
  setTutorMode: (mode: TutorMode) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function Settings({
  tutorMode,
  setTutorMode,
  onClose,
  onReset,
}: Props) {
  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <h2>Settings</h2>

        <label>Tutor Mode</label>
        <select
          value={tutorMode}
          onChange={(e) =>
            setTutorMode(e.target.value as TutorMode)
          }
        >
          <option value="casual">Casual</option>
          <option value="academic">Academic</option>
        </select>

        <hr />

        <button onClick={onReset}>
          End Chat
        </button>

        <button onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}