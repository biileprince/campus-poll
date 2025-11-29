export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white 
        rounded-[14px] 
        shadow-[0_2px_6px_rgba(0,0,0,0.04)] 
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
