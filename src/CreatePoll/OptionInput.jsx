import { X } from "lucide-react";
import Input from "../Common/Input";

export default function OptionInput({
  value,
  index,
  onChange,
  onRemove,
  allowRemove = true,
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Option Number */}
      <div className="text-[13px] font-medium text-[#5D5FEF] w-6">
        {index + 1}.
      </div>

      {/* Option Input */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${index + 1}`}
        className="flex-1"
      />

      {/* Remove Button */}
      {allowRemove && index >= 2 && (
        <button
          onClick={onRemove}
          className="
            p-2 
            bg-[#FCDDEC] 
            text-[#EF5DA8] 
            rounded-[10px] 
            hover:bg-[#F178B6] 
            hover:text-white 
            transition
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
