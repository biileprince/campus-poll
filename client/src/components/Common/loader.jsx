export default function Loader({ size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid #e5e7eb",
        borderTopColor: "#3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
      aria-hidden="true"
    />
  );
}
