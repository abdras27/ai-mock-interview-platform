import type {Metadata} from 'next';
import './globals.css';
import { InterviewProvider } from '@/context/InterviewContext';
import { Toaster } from "@/components/ui/toaster"
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider } from "@/context/AuthContext";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: 'Verbal Insights',
  description: 'AI-powered interview practice',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <InterviewProvider>
            <ThemeToggle />
            <AuthButton />
            {children}
            <Toaster />
          </InterviewProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
