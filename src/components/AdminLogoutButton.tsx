"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  const sair = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <Button type="button" variant="outline" onClick={sair} className="gap-2">
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sair
    </Button>
  );
}
