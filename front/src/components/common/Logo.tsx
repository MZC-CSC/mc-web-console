export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-lg">MC</span>
      </div>
      <span className="font-semibold text-lg">MC Web Console</span>
    </div>
  );
}
