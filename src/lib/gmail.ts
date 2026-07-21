/** Open Gmail compose with a prefilled draft (avoids Outlook via mailto). */
export function openGmailCompose(params: {
  subject: string;
  body: string;
  to?: string;
}) {
  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  if (params.to) url.searchParams.set("to", params.to);
  url.searchParams.set("su", params.subject);
  url.searchParams.set("body", params.body);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
