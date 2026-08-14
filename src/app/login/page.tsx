"use client";

import { AuthPanel } from "@/components/auth-panel";
import { Header } from "@/components/header";
import { Particles } from "@/components/particles";
import { getSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getSession()) router.replace("/profile");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

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
