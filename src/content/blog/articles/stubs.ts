import { INTERNAL_ANCHORS, INTERNAL_PATHS } from "@/content/internal-links";

/** Short starter content for topics not yet expanded to full guides */
export const blogArticleStubs: Record<
  string,
  { content: string; faqs?: { q: string; a: string }[] }
> = {
  "why-every-clinic-needs-online-appointment-booking": {
    content: `
<p>Most patients search online before they call. If your clinic only accepts bookings by phone, you add friction — and many enquiries never convert.</p>
<h2>Why online booking matters</h2>
<p>A <a href="${INTERNAL_PATHS.clinics}">${INTERNAL_ANCHORS.clinics}</a> with online appointment booking lets patients choose slots 24/7, share details once, and receive instant confirmation. Your front desk spends less time on back-and-forth messages.</p>
<h2>What to include</h2>
<ul>
  <li>Clear services and doctor profiles</li>
  <li>Mobile-friendly booking flow</li>
  <li>WhatsApp or SMS confirmation</li>
  <li>Integration with your call and CRM workflow</li>
</ul>
<p>Full guide coming soon. Meanwhile, see our <a href="${INTERNAL_PATHS.smartWebsites}">${INTERNAL_ANCHORS.smartWebsites}</a> and clinic growth services.</p>`,
  },
  "website-vs-google-business-profile-leads": {
    content: `
<p>Your Google Business Profile helps patients <strong>find</strong> you on Maps and local search. Your website helps them <strong>trust you and take action</strong>.</p>
<h2>Google Business Profile strengths</h2>
<ul>
  <li>Visible for “clinic near me” searches</li>
  <li>Reviews, hours, and directions in one place</li>
  <li>Quick tap-to-call and message actions</li>
</ul>
<h2>Why you still need a website</h2>
<p>Websites explain services in depth, capture forms, run booking flows, and support <a href="${INTERNAL_PATHS.seoAeo}">${INTERNAL_ANCHORS.seoAeo}</a>. The best local lead strategy uses both — profile for discovery, site for conversion.</p>
<p>Explore <a href="${INTERNAL_PATHS.smartWebsites}">${INTERNAL_ANCHORS.smartWebsites}</a> with Editco Media.</p>`,
  },
  "how-whatsapp-automation-converts-missed-leads": {
    content: `
<p>In India, WhatsApp is where customers expect fast replies. When a lead messages and waits hours, they often book elsewhere.</p>
<h2>How automation helps</h2>
<p><a href="${INTERNAL_PATHS.whatsappAutomation}">${INTERNAL_ANCHORS.whatsappAutomation}</a> sends instant welcomes, follow-ups, appointment reminders, and nurture sequences — without your team typing the same replies all day.</p>
<h2>Connect calls and chat</h2>
<p>Pair WhatsApp flows with <a href="${INTERNAL_PATHS.aiCallAgents}">${INTERNAL_ANCHORS.aiCallAgents}</a> and <a href="${INTERNAL_PATHS.businessAutomation}">${INTERNAL_ANCHORS.businessAutomation}</a> so every enquiry from phone or chat lands in one pipeline.</p>
<p>Full guide coming soon.</p>`,
  },
  "seo-vs-aeo-vs-geo-what-businesses-need": {
    content: `
<p><strong>SEO</strong> helps you rank on Google. <strong>AEO (Answer Engine Optimization)</strong> structures content so AI assistants can recommend you. <strong>GEO (Generative Engine Optimization)</strong> extends that to generative search experiences.</p>
<h2>What to prioritize first</h2>
<ol>
  <li>Fix Google visibility — local pages, Maps, and technical SEO</li>
  <li>Add clear FAQs and service pages (helps AI and humans)</li>
  <li>Build trust signals — reviews, consistent NAP, fast mobile site</li>
</ol>
<p>Our <a href="${INTERNAL_PATHS.seoAeo}">${INTERNAL_ANCHORS.seoAeo}</a> cover the foundations most clinics and local brands need before chasing every new acronym.</p>
<p>Full comparison guide coming soon.</p>`,
  },
  "best-website-features-clinics-hospitals": {
    content: `
<p>Clinic websites should build trust and make booking easy — not impress with heavy animation.</p>
<h2>Must-have features</h2>
<ul>
  <li>Doctor and service pages with plain-language explanations</li>
  <li>Online appointment booking</li>
  <li>Click-to-call and WhatsApp buttons</li>
  <li>Timings, location, and insurance or payment notes where relevant</li>
  <li>Patient-friendly FAQs</li>
</ul>
<p>We build these as part of our <a href="${INTERNAL_PATHS.clinics}">${INTERNAL_ANCHORS.clinics}</a>. See also <a href="${INTERNAL_PATHS.smartWebsites}">${INTERNAL_ANCHORS.smartWebsites}</a>.</p>
<p>Expanded checklist coming soon.</p>`,
  },
  "how-ai-automation-saves-time-small-businesses": {
    content: `
<p>Small teams lose hours copying leads between WhatsApp, spreadsheets, and CRM. <a href="${INTERNAL_PATHS.businessAutomation}">${INTERNAL_ANCHORS.businessAutomation}</a> connects your tools so repetitive work runs on schedule.</p>
<h2>Common time sinks automation fixes</h2>
<ul>
  <li>Manual lead entry after forms or calls</li>
  <li>Forgotten follow-up reminders</li>
  <li>After-hours enquiries with no response</li>
  <li>Reporting built by hand every week</li>
</ul>
<p>Add <a href="${INTERNAL_PATHS.aiCallAgents}">${INTERNAL_ANCHORS.aiCallAgents}</a> for phone coverage and WhatsApp flows for instant replies. Full playbook coming soon — <a href="${INTERNAL_PATHS.contact}">${INTERNAL_ANCHORS.contact}</a> for a free audit.</p>`,
  },
};
