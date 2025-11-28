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
      border border-[#5D5FEF]
      text-[#5D5FEF]
      hover:bg-[#A5A6F6]/20
    `,
    accent: `
      bg-[#EF5DA8]
      text-white
      hover:bg-[#F178B6]
    `,
    accentOutline: `
      bg-white
      border border-[#EF5DA8]
      text-[#EF5DA8]
      hover:bg-[#FCDDEC]
    `,
    soft: `
      bg-[#A5A6F6]/20
      text-[#5D5FEF]
      hover:bg-[#A5A6F6]/40
    `,
    danger: `
      bg-[#ff4d4f]
      text-white
      hover:bg-[#d9363e]
    `,
    disabled: `
      bg-[#DADADA]
      text-[#6B6B6B]
      cursor-not-allowed
    `,
  };

  const styleSelected = disabled ? variants["disabled"] : variants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${styleSelected} ${className}`}
    >
      {children}
    </button>
  );
}
