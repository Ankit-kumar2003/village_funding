export default function ProgressBar({ percentage }) {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div 
        className="bg-secondary h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${safePercentage}%` }}
      ></div>
    </div>
  );
}
