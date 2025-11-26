import { X } from "lucide-react"; // Only if your UI uses Lucide icons
import Input from "../common/Input";

export default function OptionInput({ value, onChange, onRemove, index }) {
  return (
    <div className="flex items-center gap-3">
      <Input
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Option ${index + 1}`}
        className="flex-1"
      />

      {index > 1 && ( // Prevent removing Option 1 & 2
        <button
          onClick={() => onRemove(index)}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
