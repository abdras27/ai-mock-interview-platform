"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, isAuthReady, isFirebaseConfigured, signInWithGoogle, logout } = useAuth();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to save and view your data from Firestore.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthReady ? (
            <p className="text-sm text-muted-foreground">Checking authentication status...</p>
          ) : !isFirebaseConfigured ? (
            <p className="text-sm text-destructive">
              Firebase is not configured. Add `NEXT_PUBLIC_FIREBASE_*` env vars.
            </p>
          ) : user ? (
            <>
              <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={next}>Continue</Link>
                </Button>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={signInWithGoogle} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with Google
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
