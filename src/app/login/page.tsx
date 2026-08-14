"use client";

import { AuthPanel } from "@/components/auth-panel";
import { Header } from "@/components/header";
import { Particles } from "@/components/particles";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("out")) {
      clearSession();
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      <Particles />
      <Header />
      <main className="relative mx-auto flex max-w-6xl justify-center px-4 pb-20 pt-10">
        <AuthPanel onDone={() => router.push("/profile")} />
      </main>
    </div>
  );
}
