
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserPlus, Building } from "lucide-react";

// Mock function to get organization name
const getOrganizationName = async (id: string): Promise<string | null> => {
  // In a real app, this would fetch from a database
  if (id === "org_123_abc") {
    return "Happy Kids Daycare";
  }
  return null;
};

export default function OrgSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const organizationId = Array.isArray(params.organizationId) ? params.organizationId[0] : params.organizationId;

  useEffect(() => {
    if (organizationId) {
      setLoading(true);
      getOrganizationName(organizationId).then(name => {
        if (name) {
          setOrgName(name);
        } else {
          setError("Invalid organization link. Please check the URL and try again.");
        }
        setLoading(false);
      });
    }
  }, [organizationId]);


  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (email && password && name) {
          toast({ title: "Success", description: "Account created successfully. Please log in." });
          router.push("/");
      } else {
          toast({
              variant: "destructive",
              title: "Signup Failed",
              description: "Please fill in all fields.",
          });
          setLoading(false);
      }
    } catch(error) {
       toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Something went wrong. Please try again.",
        });
        setLoading(false);
    }
  };

  if (loading && !orgName) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <Building className="mx-auto h-12 w-12 text-primary animate-pulse" />
                    <h1 className="text-2xl font-bold mt-4">Loading...</h1>
                </CardHeader>
            </Card>
        </main>
    )
  }

  if (error) {
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                 <CardHeader className="text-center">
                    <Building className="mx-auto h-12 w-12 text-destructive" />
                    <h1 className="text-2xl font-bold mt-4">Invalid Link</h1>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center text-sm">
                    <Link href="/signup" className="underline">
                        Create a new account or organization
                    </Link>
                </CardFooter>
            </Card>
        </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Building className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-4">Join {orgName}</h1>
          <CardTitle className="mt-2 text-xl font-medium">Create Your Account</CardTitle>
          <CardDescription>You've been invited to join {orgName}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
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
              {loading ? "Creating account..." : "Join Organization"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Already have an account?&nbsp;
            <Link href="/" className="underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
