
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Moon } from "lucide-react";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email && password) {
        toast({ title: "Success", description: "Logged in successfully." });
        Cookies.set('firebaseIdToken', 'mock-token-for-dev', { expires: 1 });
        router.push("/dashboard");
      } else {
         toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Please enter an email and password.",
        });
        setLoading(false);
      }
    } catch (error) {
        console.error("Login error:", error);
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Something went wrong. Please try again.",
        });
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Moon className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-4">MFSFD - Sleep Tracker</h1>
          <CardTitle className="mt-2 text-xl font-medium">Welcome Back</CardTitle>
          <CardDescription>Log in to track sleep sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Don't have an account?&nbsp;
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
