import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import type { Role } from "@/shared/auth/session";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly role: Role | null;
}

export const AppProviders = ({
  children,
  isAuthenticated,
  role,
}: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider isAuthenticated={isAuthenticated} role={role}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
