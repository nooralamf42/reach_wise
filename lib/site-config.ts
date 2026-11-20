/** Single source of truth for editable site content. Rename the brand here. */
export const site = {
  brand: "Reachwise", // TODO: working name — change once you pick the final agency name
  tagline: "Where brands and creators grow together.",
  domain: "reachwise.in", // TODO
  description:
    "A digital marketing agency run by two working creators. Brands hire vetted creators for influencer campaigns and UGC; creators join once and get matched with paid collaborations.",
  email: "info@bytesquadtech.com", // TODO: confirm public contact email
  phone: "", // TODO: add a public phone / WhatsApp number (shown only if set)
  whatsappNumber: "", // TODO: digits only with country code, e.g. 919XXXXXXXXX
  communityUrl: "", // TODO: optional WhatsApp community invite for creators
  locale: "en_IN",
};

export type Founder = {
  id: string;
  name: string;
  handle: string;
  url: string;
  followers: string;
  photo: string;
  bio: string;
};

// TODO: confirm exact follower split and add each founder's role
export const founders: Founder[] = [
  {
    id: "noor",
    name: "Noor",
    handle: "@active.noor",
    url: "https://instagram.com/active.noor",
    followers: "70K+",
    photo: "/founders/active.noor.webp",
    bio: "Meesho seller and creator who grew active.noor to 70K+ followers while running a real seller business day to day.",
  },
  {
    id: "ankit",
    name: "Ankit",
    handle: "@ecomwithankit",
    url: "https://instagram.com/ecomwithankit",
    followers: "62K+",
    photo: "/founders/ecomwithankit.webp",
    bio: "Meesho seller and creator behind ecomwithankit, 62K+ followers, sharing the playbook for scaling a real product-selling business.",
  },
];

export const services = [
  { title: "Influencer campaigns", text: "We shortlist, brief, and manage creators end to end, from outreach to posting." },
  { title: "UGC & short-form content", text: "Reels, product videos and authentic reviews your ads and pages can reuse." },
  { title: "Creator sourcing", text: "Tell us your niche, budget and audience. We bring back a vetted shortlist." },
  { title: "Social media management", text: "Content calendars, posting and community replies handled for you." },
  { title: "Performance reporting", text: "Clear reports on reach, views, clicks and what to repeat next." },
  { title: "Product seeding & reviews", text: "Get your product into the hands of creators who actually sell it." },
];

export const brandSteps = [
  { title: "Share your brief", text: "Fill a 2-minute form with your goal, budget and niche." },
  { title: "We shortlist creators", text: "Within 48 hours you get matched creators with real stats and rates." },
  { title: "Campaign runs", text: "We handle briefing, approvals and posting dates." },
  { title: "You get a report", text: "Reach, views and results, so you know what worked." },
];

export const creatorSteps = [
  { title: "Fill the form", text: "Tell us your niche, platforms, followers and rates. Takes about 3 minutes." },
  { title: "We review your profile", text: "We check fit, engagement and content quality." },
  { title: "Get matched", text: "When a brand fits your niche we message you on WhatsApp." },
  { title: "Create and get paid", text: "Deliver the content, get approvals, and receive payment as agreed." },
];

export const faqs = [
  { q: "Does it cost anything for creators to join?", a: "No. Joining is free. We only earn when you get a paid collaboration." },
  { q: "Do you guarantee collaborations?", a: "No. We match creators to briefs that fit their niche and audience. Not every profile gets matched immediately." },
  { q: "How long until I hear back?", a: "We review profiles within a few days and contact you on WhatsApp or email if a brand fits." },
  { q: "Which niches do you work with?", a: "Fashion, beauty, ecommerce, food, tech, education, finance, fitness, lifestyle and more." },
  { q: "How do brands pay?", a: "Brands agree scope and budget with us up front. We share payment terms before the campaign starts." },
];
