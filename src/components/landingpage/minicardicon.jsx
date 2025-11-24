export default function GradientCard({ icon, gradient }) {
  return (
    <div
      className={`cursor-pointer hover:ring-4 hover:ring-gray-100 hover:ring-opacity-50 sm:w-24 sm:h-24 h-16 w-16  space-y-4 flex items-center justify-center rounded-2xl  ${gradient}`}
    >
      <div className="text-white text-4xl">{icon}</div>
    </div>
  );
}
