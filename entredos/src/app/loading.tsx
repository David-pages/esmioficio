export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#8FA7B3] flex items-center justify-center text-white font-heading font-bold animate-pulse shadow-lg shadow-primary/20">
        ED
      </div>
      <p className="text-muted-foreground text-sm font-medium animate-pulse">Organizando su dinero...</p>
    </div>
  );
}
