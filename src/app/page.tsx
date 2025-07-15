
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Moon, Users, Lock } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Moon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Sleep Tracker</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm font-medium hover:underline">Pricing</Link>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 px-4">
          <h2 className="text-5xl font-bold max-w-3xl mx-auto">Reliable Sleep Tracking for Professional Care</h2>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">Ensure safety and compliance with a simple, powerful tool designed for daycares and care facilities.</p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/signup">Start Your Free Trial</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <Moon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Never Miss a Check</h3>
              <p className="text-muted-foreground mt-2">Customizable timers and audible alarms ensure every required check-up is performed on time.</p>
            </div>
            <div className="text-center">
               <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Collaborate with Your Team</h3>
              <p className="text-muted-foreground mt-2">Invite your entire team, manage members, and view consolidated reports for your whole organization.</p>
            </div>
            <div className="text-center">
               <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Compliant</h3>
              <p className="text-muted-foreground mt-2">All logs are securely stored with timestamps, providing a reliable record for compliance and parent peace of mind.</p>
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold">Ready to Improve Your Sleep Check Process?</h2>
                <p className="text-lg text-muted-foreground mt-2">Get started today. No credit card required for trial.</p>
                <div className="mt-6">
                    <Button asChild size="lg">
                        <Link href="/signup">Sign Up Now</Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Sleep Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
