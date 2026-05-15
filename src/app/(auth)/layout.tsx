export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-xl font-bold">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Fusion UX</span>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight mb-4">
              AI-Powered UX Intelligence for Enterprise Teams
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Audit, analyze, and improve your product experience using our proprietary
              12-category heuristic framework and AI synthesis engine.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: "🔍", title: "12-Category Heuristic Engine", desc: "153 expert checks across UX, accessibility, IA, and trust" },
              { icon: "🤖", title: "AI Vision Analysis", desc: "GPT-4o and Claude analyze screenshots against your framework" },
              { icon: "✅", title: "Human-in-the-Loop Review", desc: "Verify, edit, and approve AI findings before reporting" },
              { icon: "📊", title: "Enterprise PDF Reports", desc: "Executive-ready reports with ROI impact analysis" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/20">
                  <span className="text-lg">{feature.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-white/60 text-sm mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-sm">
          © 2024 Fusion UX. Enterprise UX Intelligence Platform.
        </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Fusion UX</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
