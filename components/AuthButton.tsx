"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function AuthButton() {
  const { user, isAuthReady, isFirebaseConfigured, signInWithGoogle, logout } = useAuth();

  if (!isAuthReady) {
    return null;
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="fixed top-4 left-4 z-50 text-xs text-muted-foreground rounded-md border bg-card px-2 py-1">
        Auth not configured
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      {user?.email && (
        <span className="hidden sm:inline text-xs text-muted-foreground rounded-md border bg-card px-2 py-1">
          {user.email}
        </span>
      )}
      {user ? (
        <Button size="sm" variant="outline" onClick={logout}>
          Sign Out
        </Button>
      ) : (
        <Button size="sm" onClick={signInWithGoogle}>
          Sign In
        </Button>
      )}
    </div>
  );
}
