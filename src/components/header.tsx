"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getSession, signOut } from "@/lib/auth";
import { useEffect, useState } from "react";

export function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setEmail(session?.email || null);
  }, []);

  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
      <Link href="/" className="flex items-center gap-2 font-medium">
        <Sparkles className="h-4 w-4 text-fuchsia-300" />
        Infinite Mashup
      </Link>
      <nav className="flex items-center gap-5 text-sm text-white/70">
        <Link href="/" className="hover:text-white">
          Studio
        </Link>
        <Link href="/gallery" className="hover:text-white">
          Gallery
        </Link>
        <Link href="/profile" className="hover:text-white">
          Profile
        </Link>
        {email ? (
          <button
            className="hover:text-white"
            onClick={() => {
              signOut();
              setEmail(null);
            }}
          >
            Sign out
          </button>
        ) : (
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
