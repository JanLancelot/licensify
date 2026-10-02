/** A light backing keeps both colors of the original mark visible in either theme. */
export function BrandMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      {/* A static SVG stays crisp at sidebar, login, and loading-state sizes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/p-app.svg" alt="" width={40} height={48} className="h-4/5 w-4/5 object-contain" />
    </span>
  );
}
