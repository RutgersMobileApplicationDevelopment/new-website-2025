/** Represents a RUMAD application/program shown as a 3D icon on the homepage. */
export interface Application {
  id: string;
  title: string;
  subtitle?: string;
  /** Next.js route the icon navigates to on click */
  route: string;
  /** Optional texture URL for the icon face */
  iconTextureUrl?: string;
  /** Accent colour used for the icon material */
  accentColor: string;
}
