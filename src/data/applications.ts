import type { Application } from '@/three/types/application';

/**
 * Central registry of RUMAD applications.
 * Add or remove entries here — the 3D homepage automatically generates
 * one icon per entry, so the number is never hard-coded.
 */
export const applications: Application[] = [
  {
    id: 'accelerator',
    title: 'Accelerator',
    subtitle: 'Build & ship your own app',
    route: '/accelerator',
    accentColor: '#cc1111',
  },
  {
    id: 'incubator',
    title: 'Incubator',
    subtitle: 'Level up your dev skills',
    route: '/incubator',
    accentColor: '#ee6622',
  },
  {
    id: 'events',
    title: 'Events',
    subtitle: 'Workshops & meetups',
    route: '/eboard',
    accentColor: '#39e6b0',
  },
];
