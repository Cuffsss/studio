
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();

    const handleChoosePlan = () => {
        // In a real app, this would redirect to a checkout page (e.g., Stripe)
        // and then redirect to the signup page upon success.
        // For now, we will just redirect to signup.
        router.push('/signup');
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
             <header className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Moon className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-bold">Sleep Tracker</h1>
                </Link>
                <nav className="flex items-center gap-4">
                    <Button asChild variant="ghost">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Get Started</Link>
                    </Button>
                </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">Choose the Right Plan for You</h1>
                    <p className="text-lg text-muted-foreground mt-2">Simple, transparent pricing. Cancel anytime.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Individual Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Individual</CardTitle>
                            <CardDescription>For personal use or a single caregiver.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div className="text-4xl font-bold">
                                $10<span className="text-xl text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Track unlimited people</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Audible alarms & notifications</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Detailed sleep reports</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Exportable logs</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleChoosePlan}>Choose Individual</Button>
                        </CardFooter>
                    </Card>

                    {/* Organization Plan */}
                    <Card className="border-primary flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Organization</CardTitle>
                            <CardDescription>For teams and facilities that need collaboration.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div className="text-4xl font-bold">
                                $10<span className="text-xl text-muted-foreground">/month</span> + $4<span className="text-xl text-muted-foreground">/member</span>
                            </div>
                            <ul className="space-y-3 text-muted-foreground">
                                 <li className="flex items-center gap-2 font-semibold text-foreground">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>All features from Individual</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Invite & manage team members</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Centralized billing</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Org-wide reporting</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span>Admin roles & permissions</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleChoosePlan}>Choose Organization</Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
