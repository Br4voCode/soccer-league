"use client";

import { ShieldAlert } from "lucide-react";
import { UserContainer } from "@/features/users";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function Page() {
  const { role } = useAuth();

  if (role !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <ShieldAlert className="size-10 text-muted-foreground" />
          <p className="font-medium">Acceso denegado</p>
          <p className="text-sm text-muted-foreground">
            Solo un superadmin puede gestionar usuarios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <UserContainer />;
}
