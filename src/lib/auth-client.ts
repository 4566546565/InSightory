/**
 * Client-side auth helpers — replaces next-auth/react signIn/signOut
 * to avoid SessionProvider dependency issues with React 19.
 *
 * Uses browser-native form submission so Set-Cookie from 302 redirect
 * is processed correctly by the browser.
 */

/**
 * Submit login credentials via a hidden form so the browser handles
 * the redirect and Set-Cookie processing natively.
 *
 * On failure, NextAuth redirects to /login?error=CredentialsSignin.
 * The login page should detect that URL param and show an error.
 */
export function signInWithCredentials(email: string, password: string) {
  // Fetch a CSRF token first
  fetch("/api/auth/csrf", { credentials: "include" })
    .then(r => r.json())
    .then(({ csrfToken }) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/callback/credentials";
      form.style.display = "none";

      const fields: Record<string, string> = {
        email,
        password,
        csrfToken,
        callbackUrl: "/knowledge",
      };

      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    });

  // form.submit() navigates away; return value is not used
  return { ok: true };
}

export async function signOutAndRedirect(redirectTo: string = "/") {
  const csrfRes = await fetch("/api/auth/csrf", { credentials: "include" });
  const { csrfToken } = await csrfRes.json();

  await fetch("/api/auth/signout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, callbackUrl: redirectTo }),
    redirect: "follow",
  });

  window.location.href = redirectTo;
}
