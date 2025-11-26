export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200";

  const variants = {
    primary: "bg-[#5D5FEF] text-white hover:opacity-90",
    secondary: "bg-white border border-[#5D5FEF] text-[#5D5FEF]",
    danger: "bg-red-500 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
