/**
 * Client-side auth helpers — replaces next-auth/react signIn/signOut
 * to avoid SessionProvider dependency issues with React 19.
 */

export async function signInWithCredentials(email: string, password: string) {
  const csrfRes = await fetch("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  // redirect: "follow" lets the browser set cookies from NextAuth's 302 redirect
  const res = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password, csrfToken }),
    redirect: "follow",
  });

  // Check if the final URL contains an error
  const url = new URL(res.url);
  const error = url.searchParams.get("error");
  if (error) {
    return { ok: false, error: decodeURIComponent(error) };
  }

  // Success — cookies are already set, navigate to knowledge
  window.location.href = "/knowledge";
  return { ok: true };
}

export function signOutAndRedirect(redirectTo: string = "/") {
  document.cookie = "authjs.session-token=; path=/; max-age=0";
  document.cookie = "__Secure-authjs.session-token=; path=/; max-age=0";
  document.cookie = "authjs.callback-url=; path=/; max-age=0";
  document.cookie = "__Secure-authjs.callback-url=; path=/; max-age=0";
  document.cookie = "authjs.csrf-token=; path=/; max-age=0";
  document.cookie = "__Host-authjs.csrf-token=; path=/; max-age=0";
  window.location.href = redirectTo;
}
