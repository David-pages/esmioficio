export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative premium blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-premium/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#8FA7B3] flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg shadow-primary/20 mb-6">
            ED
          </div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-center">EntreDos</h1>
          <p className="text-muted-foreground mt-2 text-center text-sm md:text-base">
            Paz, orden y metas en la economía de pareja.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
