<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase policy guidance

Keep Supabase row-level security policies as coarse safety boundaries, not as the primary home for application workflow rules. Do not mirror application state machines in RLS. Business logic such as who may move a spot between review states, draft/submission quotas, duplicate handling, moderation transitions, and destructive review actions must live in version-controlled server/application code where it can be tested and reviewed.

Use RLS only for boring, broad defense-in-depth checks like ownership, public-read visibility, and broad moderator/admin access. Before adding or changing a policy, ask whether the same rule already exists in application code; if yes, do not duplicate it in RLS unless it is a simple ownership or role boundary. Prefer fixing server code over adding state-specific policies.
