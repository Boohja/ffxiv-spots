<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase policy guidance

Prefer keeping Supabase row-level security policies as coarse safety boundaries, not as the primary home for application workflow rules. Business logic such as who may move a spot between review states, draft/submission quotas, duplicate handling, and moderation transitions should live in version-controlled server/application code where it can be tested and reviewed. Use RLS for defense-in-depth checks like ownership, public-read visibility, and broad moderator access.
