export default function GradientCardLarge({ icon, gradient, bordergradient }) {
  return (
    <div className={`p-[2px] rounded-3xl cursor-pointer  ${bordergradient}`}>
      <div
        className={`cursor-pointer hover:shadow-2xl hover:shadow-gray-600/50 hover:brightness-125 sm:w-44 sm:h-44 h-36 w-36 space-y-4 flex items-center justify-center rounded-3xl ${gradient}`}
      >
        <div className="text-white text-4xl">{icon}</div>
      </div>
    </div>
  );
}
