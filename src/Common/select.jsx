export default function Select({
  label,
  options = [],
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-sm font-medium">{label}</label>}

      <select
        value={value}
        onChange={onChange}
        className="
          border border-gray-300 
          rounded-lg 
          px-3 py-2 
          outline-none 
          bg-white
          focus:ring-2 focus:ring-[#5D5FEF]
          transition-all
        "
      >
        <option value="" disabled>
          -- Select --
        </option>

        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
