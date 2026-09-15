export interface TokenPair {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly role: string;
  readonly email: string;
}

/**
 * Pide un nuevo par de tokens a la API Go usando el refresh token actual.
 * Devuelve null si el refresh token es inválido, expiró o fue revocado
 * (por ejemplo, tras un logout o una reutilización detectada).
 */
export const refreshAccessToken = async (
  refreshToken?: string,
): Promise<TokenPair | null> => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl || !refreshToken) return null;

  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    return (await response.json()) as TokenPair;
  } catch {
    return null;
  }
};
