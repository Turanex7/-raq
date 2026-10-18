export const TICKET_CONFIG = {
  links: {
    "place-carpet-museum": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-national-history": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-miniature-book-museum": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-icherisheher": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-heydar-aliyev": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-modern-art": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-literature-museum": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-28-may": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-bulvar": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-fountains": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
    "place-ateshgah": [
      { provider: "iTicket", label: "Bilet al", url: "https://iticket.az/" },
    ],
  },
  sponsor: {
    // To switch sponsors without code changes, set active/name, add a URL template or placeUrls,
    // choose scope, and fill validFrom/validUntil. Sponsor links replace regular links in scope.
    active: false,
    name: "",
    urlTemplate: "",
    placeUrls: {},
    scope: "all",
    validFrom: "",
    validUntil: "",
    label: "Bilet al",
  },
};

function trackedUrl(url, placeId, medium) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    parsed.searchParams.set("utm_source", "chiraq");
    parsed.searchParams.set("utm_medium", medium);
    parsed.searchParams.set("utm_campaign", placeId);
    return parsed.toString();
  } catch {
    return null;
  }
}

function withinSponsorDates(sponsor, now) {
  const start = Date.parse(sponsor.validFrom);
  const end = Date.parse(sponsor.validUntil);
  return Number.isFinite(start) && Number.isFinite(end) && start <= end && now.getTime() >= start && now.getTime() <= end;
}

function sponsorUrlForPlace(sponsor, placeId) {
  const configuredUrl = sponsor.placeUrls?.[placeId] || sponsor.urlTemplate;
  if (typeof configuredUrl !== "string" || !configuredUrl.trim()) return null;
  const placeSlug = placeId.startsWith("place-") ? placeId.slice("place-".length) : placeId;
  return configuredUrl
    .replaceAll("{placeId}", encodeURIComponent(placeId))
    .replaceAll("{placeSlug}", encodeURIComponent(placeSlug));
}

export function resolveTicketLinks(placeId, config = TICKET_CONFIG, now = new Date()) {
  const sponsor = config.sponsor;
  const inSponsorScope = sponsor?.scope === "all" || (Array.isArray(sponsor?.scope) && sponsor.scope.includes(placeId));

  if (sponsor?.active && withinSponsorDates(sponsor, now) && inSponsorScope && sponsor.name?.trim()) {
    const url = trackedUrl(sponsorUrlForPlace(sponsor, placeId), placeId, "sponsor");
    if (url) return [{ provider: sponsor.name, label: sponsor.label || "Bilet al", url, sponsored: true }];
  }

  return (config.links?.[placeId] || []).flatMap((link) => {
    const url = trackedUrl(link.url, placeId, "ticket");
    return url ? [{ ...link, url, sponsored: false }] : [];
  });
}
