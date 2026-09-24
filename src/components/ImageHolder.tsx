// Filler for a photo that has not been supplied yet. Swap it for `next/image` with the same
// sizing classes once the real file lands.
export function ImageHolder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} (placeholder)`}
      className={`flex items-center justify-center bg-placeholder ${className}`}
    >
      <span className="label text-ink/40 [--label-size:11px]">{label}</span>
    </div>
  );
}
