export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-lavender-gradient">
      <div className="relative grid h-28 w-28 place-items-center">
        {/* Gift box */}
        <div className="absolute bottom-0 h-16 w-20 rounded-b-md bg-[#ffb6c1] shadow-md" />
        {/* Lid */}
        <div className="absolute -top-2 h-6 w-24 -rotate-1 rounded-md bg-[#ffd1dc] shadow-md animate-[lidBounce_1.2s_ease-in-out_infinite]" />
        {/* Ribbon vertical */}
        <div className="absolute bottom-0 h-16 w-3 rounded-md bg-[#ffd700]" />
        {/* Ribbon horizontal */}
        <div className="absolute bottom-6 h-3 w-20 rounded-md bg-[#ffd700]" />
        {/* Sparkles */}
        <div className="absolute -top-4 left-2 h-2 w-2 rounded-full bg-[#ffd700] animate-[pop_1.2s_ease-in-out_infinite]" />
        <div className="absolute -top-6 right-4 h-2 w-2 rounded-full bg-[#E6E6FA] animate-[pop_1.2s_ease-in-out_infinite_200ms]" />
        <div className="absolute -top-2 right-10 h-2 w-2 rounded-full bg-white/90 animate-[pop_1.2s_ease-in-out_infinite_400ms]" />
      </div>

      <style>
        {`@keyframes lidBounce { 0%,100%{ transform: translateY(0) rotate(-1deg);} 50%{ transform: translateY(-6px) rotate(1deg);} }`}
      </style>
      <style>
        {`@keyframes pop { 0%{ transform: translateY(0); opacity:0;} 50%{ transform: translateY(-10px); opacity:1;} 100%{ transform: translateY(0); opacity:0;} }`}
      </style>
    </div>
  );
}
