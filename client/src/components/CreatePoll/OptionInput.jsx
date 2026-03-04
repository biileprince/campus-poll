export default function OptionInput({
  value,
  index,
  onChange,
  onRemove,
  allowRemove = true,
}) {
  return (
    <div
      style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${index + 1}`}
        style={{
          flex: 1,
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #d1d5db",
        }}
      />
      <button
        onClick={onRemove}
        disabled={!allowRemove}
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "none",
          background: allowRemove ? "#ef4444" : "#9ca3af",
          color: "white",
          cursor: allowRemove ? "pointer" : "not-allowed",
        }}
      >
        Remove
      </button>
    </div>
  );
}
