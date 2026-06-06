/**
 * Client-side auth helpers — replaces next-auth/react signIn/signOut
 * to avoid SessionProvider dependency issues with React 19.
 *
 * Uses native browser form POST so the browser handles HttpOnly cookies
 * (Set-Cookie / Clear-Cookie headers) correctly.
 */

function submitForm(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export async function signInWithCredentials(email: string, password: string) {
  const csrfRes = await fetch("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  // Use fetch to check credentials first (so we can show errors)
  const res = await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email, password, csrfToken }),
    redirect: "manual",
  });

  const location = res.headers.get("Location") || "";
  const url = new URL(location, window.location.origin);
  const error = url.searchParams.get("error");
  if (error) {
    return { ok: false, error: decodeURIComponent(error) || "邮箱或密码错误" };
  }

  // Success — use native form POST so browser saves HttpOnly session cookie
  submitForm("/api/auth/callback/credentials", { email, password, csrfToken, callbackUrl: "/knowledge" });
  return { ok: true };
}

export async function signOutAndRedirect(redirectTo: string = "/") {
  const csrfRes = await fetch("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  // Use native form POST — NextAuth returns Set-Cookie to clear HttpOnly cookies
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/signout";
  form.style.display = "none";

  const csrfInput = document.createElement("input");
  csrfInput.type = "hidden";
  csrfInput.name = "csrfToken";
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const redirectInput = document.createElement("input");
  redirectInput.type = "hidden";
  redirectInput.name = "callbackUrl";
  redirectInput.value = redirectTo;
  form.appendChild(redirectInput);

  document.body.appendChild(form);
  form.submit();
}
