export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyle = `
    inline-flex 
    items-center 
    justify-center 
    px-5 
    py-2.5
    rounded-[12px]
    text-[13px]
    font-medium
    transition-all
    duration-200
  `;

  const variants = {
    primary: `
      bg-[#5D5FEF]
      text-white
      hover:bg-[#7879F1]
    `,
    secondary: `
      bg-white
      border 
      border-[#5D5FEF]
      text-[#5D5FEF]
      hover:bg-[#FCDDEC]
    `,
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
