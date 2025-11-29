export default function Card({ children, className = "" }) {
  return (
    <div
      className={`p-4 bg-white border border-gray-200 rounded shadow-sm ${className}`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}
