export default function ResultsHeader({ title }) {
  return (
    <div className="mb-5 animate-fade-in-up">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
        Poll Results
      </h1>
      <p className="text-sm text-gray-500 font-medium">
        {title || "Loading..."}
      </p>
    </div>
  );
}
