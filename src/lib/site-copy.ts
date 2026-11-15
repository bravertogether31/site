/**
 * Editable, plain-text public copy. The allowlist prevents this editor from
 * changing scripts, markup, private messages, account permissions or styling.
 */
export const SITE_COPY_FIELDS = [
  {
    key: "home.hero_description",
    section: "Homepage",
    label: "Hero introduction",
    fallback: "The internet has rules — and most teens never get taught them. We're changing that.",
  },
  {
    key: "home.platform_paragraph_1",
    section: "Homepage",
    label: "Platform introduction — paragraph 1",
    fallback: "Every time you download an app, scroll through social media, or click \"I Agree\" on a terms and conditions page, the law is involved. But nobody's teaching you what any of it actually means — until now.",
  },
  {
    key: "home.platform_paragraph_2",
    section: "Homepage",
    label: "Platform introduction — paragraph 2",
    fallback: "This platform was built specifically for teens aged 12–18 who deserve to understand their digital rights in plain, honest language. No jargon. No lectures. Just the real stuff that affects your everyday life online.",
  },
  {
    key: "home.platform_paragraph_3",
    section: "Homepage",
    label: "Platform introduction — paragraph 3",
    fallback: "Whether you want to know what TikTok can actually do with your data, whether your school can monitor your DMs, or what you're really agreeing to when you sign up for a platform — this is your space to find out.",
  },
  {
    key: "about.founder_bio_1",
    section: "About",
    label: "Founder introduction — paragraph 1",
    fallback: "Tara Vishwakarthik is a 16-year-old with a serious interest in law — specifically technology law and mergers & acquisitions — alongside international relations and economics. She built this platform because she noticed something straightforward: teens are navigating complex digital environments every single day, and no one is giving them the legal context to do it informed.",
  },
  {
    key: "about.founder_bio_2",
    section: "About",
    label: "Founder introduction — paragraph 2",
    fallback: "Her interest in how law intersects with technology, global systems, and economic structures is what shaped the foundation of this initiative. She wanted to create something that didn't exist — a resource that meets teens where they are, speaks their language, and gives them real, usable knowledge about their digital rights.",
  },
  {
    key: "about.our_mission",
    section: "About",
    label: "Our Mission",
    fallback: "To make digital legal literacy accessible to every teen — regardless of their background, income, or interest in law — by providing free, clear, and relevant resources on the rights and laws that shape their lives online.",
  },
  {
    key: "about.our_goal",
    section: "About",
    label: "What We Aim to Achieve",
    fallback: "Every teen between 12 and 18 should finish using this platform with a working understanding of their digital rights — what data companies can collect, what they're agreeing to, what protections exist, and where to turn when something goes wrong.",
  },
  {
    key: "about.our_gap",
    section: "About",
    label: "The Gap We Fill",
    fallback: "Legal resources are written for adults, by adults. Teen-facing content rarely touches law. Meanwhile, digital law is increasingly affecting younger people. This platform sits at that intersection — where currently very little exists.",
  },
  {
    key: "curriculums.intro",
    section: "Curriculums",
    label: "Curriculums introduction",
    fallback: "Practical country-specific learning materials to help young people understand privacy, technology law, online safety and their digital rights.",
  },
] as const;

export type SiteCopyKey = typeof SITE_COPY_FIELDS[number]["key"];
export type SiteCopyOverrides = Partial<Record<SiteCopyKey, string>>;
export const SITE_COPY_ALLOWED = new Set<string>(SITE_COPY_FIELDS.map((field) => field.key));

export const SITE_COPY_DEFAULTS = Object.fromEntries(SITE_COPY_FIELDS.map(field=>[field.key,field.fallback])) as Record<SiteCopyKey,string>;
