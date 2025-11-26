export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        bg-white 
        rounded-xl 
        shadow-md 
        p-4 
        ${className}
      `}
    >
      {children}
    </div>
  );
}
