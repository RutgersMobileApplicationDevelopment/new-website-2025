import Link from 'next/link';

export default function EBoardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-wider">RUMAD</Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-300 hover:text-white">Home</Link>
          <Link href="/accelerator" className="text-sm text-gray-300 hover:text-white">Accelerator</Link>
          <Link href="/incubator" className="text-sm text-gray-300 hover:text-white">Incubator</Link>
          <Link href="/eboard" className="text-sm text-white font-medium">E-Board</Link>
          <Link href="/contact" className="px-4 py-2 text-sm bg-red-600 rounded-lg">Contact</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">E-BOARD</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Meet the executive board that drives RUMAD forward. Our team is passionate about
          mobile development and dedicated to creating an inclusive community at Rutgers.
        </p>
      </div>
    </div>
  );
}
