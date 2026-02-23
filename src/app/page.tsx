
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { Layout, MessageSquare, FileText, Calendar, CheckCircle, Rocket, Globe, Shield } from 'lucide-react';

export default function Home() {
  // Safe find to prevent crashes if array is empty or initialization is pending
  const heroImage = PlaceHolderImages?.find(img => img.id === 'hero-student');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Layout className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">StudentHub AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden md:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Button asChild size="sm">
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium w-fit">
                  Powered by Google Gemini 2.5
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Your All-in-One AI Powered Student Assistant
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline your academic life with intelligent chatbots, effortless leave management, and professional resume building.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="px-8 shadow-lg">
                    <Link href="/login">Start Now</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8">
                    View Demo
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
                <Image
                  src={heroImage?.imageUrl || "https://picsum.photos/seed/student/1200/600"}
                  alt={heroImage?.description || "Student Life"}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint={heroImage?.imageHint || "students studying"}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-primary">Built for Modern Academia</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Every tool you need to excel in your university journey, integrated into a single high-performance platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-primary/10">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-headline">Intelligent Chatbot</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Instant, context-aware answers to academic queries and university policy questions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Calendar className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold font-headline">Live Approvals</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Seamless leave management with real-time status updates and administrative integration.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-8 rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <FileText className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-xl font-bold font-headline">AI Resume Polish</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Generate professional bullet points and summaries tailored to your target industry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-primary">10k+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Active Students</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-primary">99.9%</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Uptime</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-primary">2s</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">Avg Response</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-primary">50+</h4>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">AI Templates</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-6xl font-headline">Ready to boost your productivity?</h2>
                <p className="max-w-[700px] md:text-xl/relaxed opacity-90 mx-auto">
                  Join thousands of students who are already using StudentHub AI to simplify their daily university tasks.
                </p>
              </div>
              <div className="flex gap-4">
                <Button asChild size="lg" variant="secondary" className="px-12 font-bold shadow-xl">
                  <Link href="/login">Join StudentHub</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-slate-50">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">StudentHub AI</span>
        </div>
        <p className="text-xs text-muted-foreground md:ml-4">© 2024 StudentHub Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
