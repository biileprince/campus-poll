export default function Loader({ size = 24, className = "" }) {
  return (
    <div
      className={`
        animate-spin
        rounded-full
        border-4
        border-gray-300
        border-t-[#5D5FEF]
        ${className}
      `}
      style={{ width: size, height: size }}
    />
  );
}
