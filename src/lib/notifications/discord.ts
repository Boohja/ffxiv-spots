import { absoluteUrl } from "@/lib/metadata";

const reviewWebhookEnvName = "XIVSPOTS_REVIEW_DISCORD_WEBHOOK_URL";

type ReviewSubmissionNotification = {
  slug: string;
  submitter: {
    id: string;
    displayname: string | null;
  };
  title: string;
};

export async function notifyReviewSubmission({ slug, submitter, title }: ReviewSubmissionNotification) {
  const webhookUrl = process.env[reviewWebhookEnvName]?.trim();

  if (!webhookUrl) {
    return false;
  }

  const reviewUrl = absoluteUrl(`/spots/${slug}/edit`);
  const submitterUrl = absoluteUrl(`/users/${submitter.id}`);
  const content = `New submission by [${escapeDiscordLinkText(submitter.displayname ?? "XIVSpots user")}](${submitterUrl}): [${escapeDiscordLinkText(title)}](${reviewUrl})`;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        content,
        allowed_mentions: {
          parse: [],
        },
      }),
    });

    if (!response.ok) {
      console.error(`Discord review webhook failed with status ${response.status}.`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Discord review webhook failed.", error);
    return false;
  }
}

function escapeDiscordLinkText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\[/g, "\\[");
}
