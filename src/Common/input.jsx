export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          border border-gray-300 
          rounded-lg 
          px-3 py-2 
          outline-none 
          focus:ring-2 focus:ring-[#5D5FEF]
          transition-all
        "
      />
    </div>
  );
}
