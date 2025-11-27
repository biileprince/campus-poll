export default function Input({
  label,
  placeholder = "",
  value,
  onChange,
  type = "text",
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[13px] font-medium text-[#1F1F1F]">
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          border 
          border-[#DADADA]
          rounded-[10px]
          px-4 
          py-2.5
          text-[13px]
          text-[#1F1F1F]
          placeholder:text-[#A0A0A0]
          outline-none
          transition-all
          duration-200
          focus:border-[#5D5FEF]
          focus:ring-2
          focus:ring-[#5D5FEF] 
        "
      />
    </div>
  );
}
