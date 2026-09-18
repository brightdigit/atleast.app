/**
 * Contact-quality scoring shared by the bulk-source lead finders.
 *
 * Both open-data sources hand back far more rows than are worth contacting. The
 * bottleneck on outreach is never finding names — it's finding a way to reach
 * someone. So every lead is scored on how reachable it is, and the reports lead
 * with the reachable ones.
 *
 * Scoring is deliberately blunt: a published email outranks a contact form,
 * which outranks a bare homepage. Signals that merely suggest a business is real
 * (a phone number, a recent update) break ties rather than carrying a lead.
 */

/** Weighting for each contact signal. Tuned so one email beats any pile of weak signals. */
const WEIGHTS = {
  email: 50,
  website: 25,
  // A page on a hosting platform is a weaker contact path than an owned domain:
  // it usually offers no contact route beyond the platform's own messaging.
  hostedPage: 10,
  social: 12,
  phone: 8,
  address: 5,
};

/** Leads at or above this score have a directly usable contact path. */
export const STRONG_CONTACT_SCORE = 50;

/**
 * Leads below this are reported separately rather than dropped. Set at the
 * hosting-page weight so a platform-only listing still makes the report — it is
 * reachable, just more work than an owned domain.
 */
export const MIN_CONTACT_SCORE = 10;

const asArray = (value) => {
  if (value == null) return [];
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
};

/**
 * Role addresses are what we actually want: they belong to the business rather
 * than a person, so contacting them raises none of the concerns that mailing a
 * named individual's address would.
 */
const ROLE_ADDRESS = /^(info|hello|hi|contact|studio|team|support|bookings?|admin|office|inquiries|enquiries)@/i;

/** Addresses that are inboxes nobody reads, or that we should never mail. */
const UNUSABLE_ADDRESS = /^(noreply|no-reply|donotreply|postmaster|abuse|webmaster|privacy|legal|dmca)@/i;

/** Hosts that are a social presence rather than a site the business controls. */
const SOCIAL_HOST =
  /(facebook|instagram|twitter|x\.com|linkedin|youtube|tiktok|threads|mastodon|bsky|linktr\.ee)/i;

/** Placeholder hosts that carry no contact value. */
const PLACEHOLDER_HOST =
  /(example\.(com|org)|localhost|wixsite\.com\/?$|godaddysites\.com\/?$|business\.site\/?$)/i;

/**
 * Hosting and link-aggregator platforms. A URL here belongs to the platform, not
 * the business, so it rarely leads to a contact route — worth keeping, but worth
 * less than a domain the owner controls.
 */
const HOSTED_PLATFORM =
  /(buzzsprout|libsyn|podbean|anchor\.fm|podcasters\.spotify|spotify\.com|captivate\.fm|transistor\.fm|simplecast|megaphone|redcircle|spreaker|podomatic|fireside\.fm|castos|blubrry|acast\.com|substack\.com|patreon\.com|mykajabi\.com|squarespace\.com|wordpress\.com|blogspot\.com|weebly\.com)/i;

/** Normalize a URL for comparison and display; returns null when unusable. */
export function normalizeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes('.')) return null;
    if (PLACEHOLDER_HOST.test(url.hostname)) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

/** True when a URL points at a social profile rather than an owned website. */
export function isSocialUrl(value) {
  const url = normalizeUrl(value);
  return url ? SOCIAL_HOST.test(url) : false;
}

/** Validate and classify an email address. Returns null when it is unusable. */
export function classifyEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return null;
  if (UNUSABLE_ADDRESS.test(email)) return null;
  return { email, isRole: ROLE_ADDRESS.test(email) };
}

/**
 * Score a lead's reachability and describe why it scored that way.
 *
 * Accepts already-extracted contact fields so both sources — which have very
 * different shapes — can share one definition of "reachable".
 */
export function scoreContact({ emails = [], websites = [], socials = [], phones = [], address = null } = {}) {
  const reasons = [];
  let score = 0;

  const validEmails = asArray(emails).map(classifyEmail).filter(Boolean);
  // Role addresses are worth slightly more than personal ones for cold outreach.
  const roleEmail = validEmails.find((e) => e.isRole);
  if (validEmails.length) {
    score += WEIGHTS.email + (roleEmail ? 5 : 0);
    reasons.push(roleEmail ? `role email (${roleEmail.email})` : `email (${validEmails[0].email})`);
  }

  // Split anything URL-shaped into owned sites vs. social profiles, regardless of
  // which field the source filed it under — sources are inconsistent about this.
  const allUrls = [...asArray(websites), ...asArray(socials)].map(normalizeUrl).filter(Boolean);
  const siteUrls = [...new Set(allUrls.filter((u) => !SOCIAL_HOST.test(u)))];
  const socialUrls = [...new Set(allUrls.filter((u) => SOCIAL_HOST.test(u)))];

  // An owned domain is the contact path worth having; a hosting page is a fallback.
  const ownedUrls = siteUrls.filter((u) => !HOSTED_PLATFORM.test(u));
  const hostedUrls = siteUrls.filter((u) => HOSTED_PLATFORM.test(u));

  if (ownedUrls.length) {
    score += WEIGHTS.website;
    reasons.push('own website');
  } else if (hostedUrls.length) {
    score += WEIGHTS.hostedPage;
    reasons.push('hosting page only');
  }
  if (socialUrls.length) {
    score += WEIGHTS.social;
    reasons.push(`${socialUrls.length} social profile${socialUrls.length === 1 ? '' : 's'}`);
  }

  const validPhones = asArray(phones).filter((p) => String(p).replace(/\D/g, '').length >= 7);
  if (validPhones.length) {
    score += WEIGHTS.phone;
    reasons.push('phone');
  }

  if (address) {
    score += WEIGHTS.address;
    reasons.push('address');
  }

  return {
    score,
    reasons,
    emails: validEmails.map((e) => e.email),
    // Owned domains first, so callers rendering websites[0] show the better link.
    websites: [...ownedUrls, ...hostedUrls],
    hasOwnDomain: ownedUrls.length > 0,
    socials: socialUrls,
    phones: validPhones.map(String),
    address: address ?? null,
    // A lead with no email but a live site is still workable — you just have to
    // go find the contact page. Flagging it keeps that cost visible.
    needsEnrichment: !validEmails.length && siteUrls.length > 0,
  };
}

/** Sort by contact quality, then by whatever secondary signal the caller supplies. */
export function byContactQuality(secondary = () => 0) {
  return (a, b) => b.contact.score - a.contact.score || secondary(a, b);
}

/** Render a lead's contact block as Markdown detail lines. */
export function renderContactLines(contact) {
  const lines = [];

  if (contact.emails.length) lines.push(`- **Email:** ${contact.emails.join(', ')}`);
  if (contact.websites.length) {
    const label = contact.hasOwnDomain ? 'Website' : 'Hosting page';
    lines.push(`- **${label}:** <${contact.websites[0]}>`);
  }
  if (contact.socials.length) {
    lines.push(`- **Social:** ${contact.socials.map((u) => `<${u}>`).join(' · ')}`);
  }
  if (contact.phones.length) lines.push(`- **Phone:** ${contact.phones.join(', ')}`);
  if (contact.address) lines.push(`- **Address:** ${contact.address}`);

  lines.push(`- **Contact score:** ${contact.score} (${contact.reasons.join(', ') || 'none'})`);
  if (contact.needsEnrichment) {
    lines.push('- **Needs enrichment:** no published email — check the site\'s contact page');
  }

  return lines;
}
