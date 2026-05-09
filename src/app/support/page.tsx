"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SupportRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/support");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
