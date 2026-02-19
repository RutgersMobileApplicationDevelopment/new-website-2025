'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { ScrollHint } from '@/components/ScrollHint';
import { MobileFallback } from '@/components/MobileFallback';
import { useIsMobile } from '@/hooks/useIsMobile';

const SceneCanvas = dynamic(() => import('@/components/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#050505]">
      <div className="text-white text-lg animate-pulse">Loading…</div>
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#050505]">
      <NavBar />
      {isMobile ? (
        <MobileFallback />
      ) : (
        <>
          <SceneCanvas onNavigate={handleNavigate} />
          <ScrollHint />
        </>
      )}
    </main>
  );
}
