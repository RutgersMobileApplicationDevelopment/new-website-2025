import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-wider">RUMAD</Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-300 hover:text-white">Home</Link>
          <Link href="/accelerator" className="text-sm text-gray-300 hover:text-white">Accelerator</Link>
          <Link href="/incubator" className="text-sm text-gray-300 hover:text-white">Incubator</Link>
          <Link href="/eboard" className="text-sm text-gray-300 hover:text-white">E-Board</Link>
          <Link href="/contact" className="px-4 py-2 text-sm bg-red-600 rounded-lg font-medium">Contact</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">CONTACT</h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          Have questions or want to get involved? Reach out to us and we&apos;ll get back to you.
        </p>
        <div className="mt-10">
          <a
            href="mailto:rumad@rutgers.edu"
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-500 rounded-xl text-lg font-medium transition-colors"
          >
            Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
