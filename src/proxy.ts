import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/server/supabase/proxy";

/**
 * Primeira camada de proteção do painel: sem sessão, /admin redireciona
 * para o login. A segunda camada (a decisiva) é `assertAdmin()` em cada
 * Server Action, e a terceira é a RLS no banco.
 */
const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/recuperar-senha", "/admin/redefinir-senha"];

function withCsp(response: NextResponse): NextResponse {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const dev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `img-src 'self' data: blob: ${supabase}`,
    `connect-src 'self' ${supabase}${dev ? " ws:" : ""}`,
    "frame-src https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, isAuthenticated } = await updateSession(request);

  if (!pathname.startsWith("/admin")) return withCsp(response);

  const isPublic = PUBLIC_ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!isAuthenticated && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.searchParams.set("redirecionar", pathname);
    return withCsp(NextResponse.redirect(login));
  }

  if (isAuthenticated && pathname === "/admin/login") {
    const painel = request.nextUrl.clone();
    painel.pathname = "/admin";
    painel.search = "";
    return withCsp(NextResponse.redirect(painel));
  }

  return withCsp(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|seed/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"],
};
