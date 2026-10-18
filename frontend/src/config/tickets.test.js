import test from "node:test";
import assert from "node:assert/strict";
import { resolveTicketLinks } from "./tickets.js";

const placeId = "place-carpet-museum";
const now = new Date("2026-10-18T12:00:00+04:00");

function configWithSponsor(overrides = {}) {
  return {
    links: {
      [placeId]: [{ provider: "iTicket", label: "Bilet al", url: "https://example.com/regular" }],
    },
    sponsor: {
      active: true,
      name: "Sınaq sponsoru",
      urlTemplate: "https://example.com/sponsor/{placeSlug}",
      placeUrls: {},
      scope: [placeId],
      validFrom: "2026-10-01T00:00:00+04:00",
      validUntil: "2026-10-31T23:59:59+04:00",
      label: "Bilet al",
      ...overrides,
    },
  };
}

test("valid in-scope sponsor replaces regular ticket links and gets sponsor UTM tags", () => {
  const result = resolveTicketLinks(placeId, configWithSponsor(), now);

  assert.equal(result.length, 1);
  assert.equal(result[0].sponsored, true);
  assert.equal(result[0].provider, "Sınaq sponsoru");
  const url = new URL(result[0].url);
  assert.equal(url.pathname, "/sponsor/carpet-museum");
  assert.equal(url.searchParams.get("utm_source"), "chiraq");
  assert.equal(url.searchParams.get("utm_medium"), "sponsor");
  assert.equal(url.searchParams.get("utm_campaign"), placeId);
});

test("inactive, out-of-scope, or out-of-date sponsor falls back to regular ticket links", () => {
  for (const sponsor of [
    { active: false },
    { scope: ["place-national-history"] },
    { validFrom: "2026-11-01T00:00:00+04:00" },
    { urlTemplate: "", placeUrls: {} },
  ]) {
    const result = resolveTicketLinks(placeId, configWithSponsor(sponsor), now);
    assert.equal(result.length, 1);
    assert.equal(result[0].sponsored, false);
    const url = new URL(result[0].url);
    assert.equal(url.searchParams.get("utm_medium"), "ticket");
    assert.equal(url.searchParams.get("utm_campaign"), placeId);
  }
});

test("regular resolution keeps every provider link and never marks it sponsored", () => {
  const config = {
    links: {
      [placeId]: [
        { provider: "iTicket", label: "Bilet al", url: "https://example.com/one" },
        { provider: "Platforma 2", label: "Bilet al", url: "https://example.com/two" },
      ],
    },
    sponsor: { active: false },
  };
  const result = resolveTicketLinks(placeId, config, now);

  assert.deepEqual(result.map((link) => link.provider), ["iTicket", "Platforma 2"]);
  assert.ok(result.every((link) => link.sponsored === false));
});

test("per-place sponsor URLs work and places without configured links return an empty list", () => {
  const sponsorConfig = configWithSponsor({
    urlTemplate: "",
    placeUrls: { [placeId]: "https://example.com/custom-sponsor" },
  });
  assert.equal(new URL(resolveTicketLinks(placeId, sponsorConfig, now)[0].url).pathname, "/custom-sponsor");
  assert.deepEqual(resolveTicketLinks("place-heydar-aliyev", { links: {}, sponsor: { active: false } }, now), []);
});
