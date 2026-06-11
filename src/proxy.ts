import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const offlineMessage = process.env.XIVSPOTS_OFFLINE_MESSAGE?.trim();

  if (offlineMessage) {
    return new Response(getOfflinePageHtml(offlineMessage), {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, max-age=0",
      },
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

function getOfflinePageHtml(message: string) {
  const escapedMessage = escapeHtml(message);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>XIVSpots is offline</title>
    <style>
      :root {
        color-scheme: dark;
        --surface-page: #030712;
        --surface-base: #07111f;
        --surface-elevated: #101d33;
        --border-default: #334155;
        --border-active: #38bdf8;
        --brand-spark: #5debff;
        --brand-azure: #2f8cff;
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 2rem;
        background:
          linear-gradient(135deg, rgba(34, 211, 238, 0.08), transparent 35%),
          repeating-linear-gradient(
            0deg,
            rgba(10, 23, 43, 0.92) 0,
            rgba(10, 23, 43, 0.92) 2px,
            rgba(5, 14, 30, 0.92) 2px,
            rgba(5, 14, 30, 0.92) 6px
          ),
          var(--surface-page);
        color: var(--text-primary);
        font-family: "Segoe UI", system-ui, sans-serif;
      }

      main {
        width: min(100%, 44rem);
        border: 1px solid rgba(71, 85, 105, 0.65);
        border-radius: 0.75rem;
        background: linear-gradient(180deg, rgba(14, 28, 50, 0.86), rgba(7, 17, 31, 0.92));
        padding: clamp(1.5rem, 5vw, 3rem);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03), 0 24px 56px -36px rgba(15, 23, 42, 0.95);
        text-align: center;
      }

      img {
        width: 6.5rem;
        height: 6.5rem;
        object-fit: contain;
      }

      .brand {
        margin-top: 0.75rem;
        font-size: clamp(2rem, 8vw, 3.25rem);
        font-weight: 800;
        letter-spacing: 0;
        line-height: 1;
      }

      .brand span {
        color: var(--brand-spark);
      }

      h1 {
        margin: 2rem 0 0;
        font-size: clamp(1.75rem, 6vw, 2.75rem);
        line-height: 1.1;
      }

      p {
        margin: 1rem auto 0;
        max-width: 34rem;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.7;
      }

      .message {
        margin-top: 1.5rem;
        border: 1px solid var(--border-default);
        border-radius: 0.75rem;
        background: rgba(3, 7, 18, 0.36);
        padding: 1rem;
        color: var(--text-primary);
        white-space: pre-wrap;
      }

      .status {
        margin-top: 1.25rem;
        color: var(--text-muted);
        font-size: 0.875rem;
      }
    </style>
  </head>
  <body>
    <main>
      <img src="/brand/icon.png?v=transparent" alt="" />
      <div class="brand">xiv<span>spots</span></div>
      <h1>Service temporarily offline</h1>
      <p>XIVSpots is currently unavailable while maintenance or migration work is in progress.</p>
      <p class="message">${escapedMessage}</p>
      <p class="status">Please check back later.</p>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
