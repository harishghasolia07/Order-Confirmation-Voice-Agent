import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Bot, PhoneCall, ShieldCheck, Zap, BarChart, CheckCircle2, Clock, Globe } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative overflow-x-hidden selection:bg-primary/30 text-foreground">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[60vw] max-w-[600px] max-h-[900px] rounded-full bg-secondary/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[40vw] max-w-[1000px] max-h-[600px] rounded-full bg-primary/5 blur-[150px] mix-blend-screen" />
      </div>

      {/* Navbar layer */}
      <header className="relative z-50 w-full bg-background/40 backdrop-blur-2xl sticky top-0 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-[0_0_15px_rgba(186,158,255,0.4)]">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight space-grotesk">
              CODConfirm<span className="text-primary">.ai</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
            <Link href="#roi" className="hover:text-primary transition-colors">ROI Calculator</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-primary/10 text-primary border border-primary/30 px-5 py-2.5 rounded-full hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(186,158,255,0.4)] transition-all flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 flex flex-col items-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-8 uppercase tracking-widest shadow-[0_0_15px_rgba(186,158,255,0.1)]">
            <Zap className="w-4 h-4" />
            <span>Intelligent AI Voice Agent</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl space-grotesk font-extrabold max-w-4xl mb-6 text-foreground drop-shadow-lg leading-tight">
            Stop RTO Losses with <br className="hidden md:block" />
            <span className="text-primary drop-shadow-[0_0_15px_rgba(186,158,255,0.4)]">
              AI Voice Confirmations
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-light">
            Automate Cash-on-Delivery verifications with human-like, native-speaking AI. 
            Reduce fake orders, boost delivery rates, and directly cut your RTO costs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:shadow-[0_0_30px_rgba(186,158,255,0.5)] transition-all flex items-center justify-center gap-2 group"
            >
              Start Automating <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto bg-white/5 text-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md border border-white/10"
            >
              <PhoneCall className="w-5 h-5 text-primary" /> Hear a Demo
            </Link>
          </div>

          {/* Abstract Dashboard Mockup */}
          <div className="mt-24 w-full max-w-5xl relative perspective-1000 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000"></div>
            <div className="relative glass-card overflow-hidden flex flex-col border border-white/10 rounded-[2rem]">
              <div className="h-14 bg-white/5 border-b border-white/5 flex items-center px-6 gap-3 backdrop-blur-md">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
                <div className="mx-auto bg-black/20 border border-white/5 rounded-full px-6 py-1.5 text-xs text-muted-foreground font-mono">
                  dashboard.codconfirm.ai/live
                </div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-card/40">
                <div className="col-span-1 md:col-span-2 space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xl space-grotesk text-foreground">Live Processing Feed</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]"></div>
                      <span className="text-xs font-semibold text-primary uppercase">System Active</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center border border-white/10">
                            <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">ORD-{1000 + i}</div>
                            <div className="text-xs text-muted-foreground tracking-widest">+91 98765 4321{i}</div>
                          </div>
                        </div>
                        {i === 1 ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-medium shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                            <CheckCircle2 className="w-4 h-4" /> Confirmed
                          </div>
                        ) : i === 2 ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium shadow-[0_0_15px_rgba(186,158,255,0.15)]">
                            <PhoneCall className="w-4 h-4 animate-pulse" /> Calling...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10 text-sm font-medium">
                            Pending
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 space-y-4 text-left flex flex-col">
                  <h3 className="font-semibold text-xl space-grotesk text-foreground">Analytics Insight</h3>
                  <div className="p-6 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 flex-1 justify-center relative overflow-hidden">
                    <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-green-500/20 rounded-full blur-[40px]"></div>
                    <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Live RTO Savings</span>
                    <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-green-600 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">₹45,200</span>
                    <span className="text-xs text-muted-foreground">Updated just now</span>
                  </div>
                  <div className="p-6 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute bottom-[-30px] right-[-30px] w-24 h-24 bg-primary/20 rounded-full blur-[30px]"></div>
                    <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Confirmation Rate</span>
                    <span className="text-4xl font-bold text-foreground">87%</span>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-secondary w-[87%] h-full rounded-full shadow-[0_0_10px_rgba(186,158,255,0.8)] relative">
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl space-grotesk font-bold mb-6 tracking-tight text-foreground drop-shadow-md">The Intelligence Engine</h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed">Scale your COD confirmations effortlessly. An AI that works 24/7, never takes a break, and adapts directly to your order volume with intelligent precision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-10 hover:shadow-[0_0_40px_rgba(186,158,255,0.15)] hover:border-primary/30 transition-all hover:-translate-y-2 group">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary/40 transition-colors shadow-lg shadow-secondary/30">
                  <Globe className="w-7 h-7 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 space-grotesk text-foreground">Native Linguistic AI</h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  Our Bolna integration speaks perfectly fluent Hindi, English, and Hinglish. It detects optimal dialects in real-time.
                </p>
              </div>
              <div className="glass-card p-10 hover:shadow-[0_0_40px_rgba(186,158,255,0.15)] hover:border-primary/30 transition-all hover:-translate-y-2 group">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary/40 transition-colors shadow-lg shadow-primary/30">
                  <Zap className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 space-grotesk text-foreground">Sub-Second Triggers</h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  Calls initiate milliseconds after order placement. Connect with customers exactly at the peak of their purchase intent.
                </p>
              </div>
              <div className="glass-card p-10 hover:shadow-[0_0_40px_rgba(186,158,255,0.15)] hover:border-primary/30 transition-all hover:-translate-y-2 group">
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary/40 transition-colors shadow-lg shadow-green-500/30">
                  <BarChart className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 space-grotesk text-foreground">Actionable Analytics</h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  Track confirmation rates, failed attempts, and exact predictive RTO savings directly within a luminous deep-data dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="w-full py-32 relative">
          <div className="container mx-auto px-6">
             <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl space-grotesk font-bold mb-6 tracking-tight text-foreground drop-shadow-md">The Action Sequence</h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed">A seamless workflow from algorithmic order reception to final validation.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-16 relative items-center justify-center">
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2 z-0 shadow-[0_0_15px_rgba(186,158,255,0.5)]"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl space-grotesk font-bold shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8 text-muted-foreground group hover:border-primary/50 hover:text-primary transition-all">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-3 space-grotesk text-foreground">Order Hook</h3>
                <p className="text-muted-foreground font-light px-4">Webhook bridges sync order context to our processing engine instantly.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-[0_0_40px_rgba(186,158,255,0.6)] mb-8 border border-white/20 transform hover:scale-105 transition-transform group relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100 rounded-2xl"></div>
                  <PhoneCall className="w-10 h-10 relative z-10 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-3 space-grotesk text-foreground">Neural Call</h3>
                <p className="text-muted-foreground font-light px-4">Bolna algorithm generates a contextual, human-like voice sequence.</p>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl space-grotesk font-bold shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-8 text-muted-foreground group hover:border-green-500/50 hover:text-green-400 transition-all">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3 space-grotesk text-foreground">Status Output</h3>
                <p className="text-muted-foreground font-light px-4">The platform updates the database to Confirmed or Cancelled instantly.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-24 px-6 relative">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className="w-[800px] h-[400px] rounded-full bg-primary/10 blur-[150px]"></div>
          </div>
          <div className="container mx-auto p-12 md:p-24 glass-panel rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <ShieldCheck className="w-20 h-20 text-primary mb-8 drop-shadow-[0_0_20px_rgba(186,158,255,0.6)]" />
              <h2 className="text-4xl md:text-6xl space-grotesk font-bold mb-8 drop-shadow-md leading-tight text-foreground">Deploy the Ultimate <br/> Retention Engine.</h2>
              <p className="text-xl text-muted-foreground mb-12 font-light max-w-2xl leading-relaxed">Join elite D2C brands manipulating the margins in their favor. Cut RTO overhead by 40% with autonomous conversational intelligence.</p>
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground px-12 py-5 rounded-full text-xl font-bold hover:shadow-[0_0_40px_rgba(186,158,255,0.6)] hover:bg-primary/90 transition-all flex items-center gap-3 group"
              >
                Assemble Your Agents <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 py-12 bg-background relative z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(186,158,255,0.5)]"></div>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg text-foreground space-grotesk tracking-wide">CODConfirm.ai</span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-xs font-semibold">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-xs font-semibold">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-xs font-semibold">Contact</Link>
          </div>
          <p className="font-light tracking-wide">© {new Date().getFullYear()} CODConfirm AI. Standardized Precision.</p>
        </div>
      </footer>
    </div>
  );
}
