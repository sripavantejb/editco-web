export type Tone = "neutral" | "ok" | "warn" | "bad" | "accent";

export function salesLeadTone(status: string): Tone {
  if (status === "converted") return "ok";
  if (status === "lost" || status === "unqualified") return "bad";
  if (status === "qualified") return "accent";
  return "neutral";
}

export function salesDealTone(stage: string): Tone {
  if (stage === "won") return "ok";
  if (stage === "lost") return "bad";
  if (stage === "negotiation" || stage === "proposal") return "accent";
  return "neutral";
}

export function salesTemperatureTone(temperature: string): Tone {
  if (temperature === "hot") return "bad";
  if (temperature === "warm") return "warn";
  return "neutral";
}
