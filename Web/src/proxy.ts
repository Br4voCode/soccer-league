import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  verifyAccessToken,
} from "@/shared/auth/session";
import { isPublicRoute } from "@/shared/auth/routes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicRoute(pathname);

  // Gate liviano: si el access token es válido o al menos hay un refresh token,
  // dejamos pasar. La renovación real del access token (y el rechazo si el refresh
  // también expiró/fue revocado) ocurre en /api/backend al primer fetch de datos.
  const claims = await verifyAccessToken(
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
  );
  const hasRefreshToken = Boolean(
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value,
  );
  const isAuthenticated = Boolean(claims) || hasRefreshToken;

  if (!isAuthenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
