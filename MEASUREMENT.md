# Intervencija measurement integration

Cloudflare Web Analytics (cookieless beacon on every public page) counts page views, referrers and countries. It does not record custom events, so the `data-track` browser events below are not collected yet.

Listen for `intervencija:measurement` on `window`; the event name is in `event.detail.name`.

| Event | Meaning |
|---|---|
| header_contact / mobile_header_contact | Header project enquiry link |
| hero_contact | Homepage primary CTA |
| hero_book_call / contact_book_call / audit_book_call | Cal.com booking buttons (hero, homepage contact, System Audit contact) |
| hero_free_audit | Hero note linking to the free System Audit |
| engagements_system_audits | Homepage engagements note linking to the free System Audit |
| sample_release | Accountability section link to the sample signed release record PDF |
| sample_report | Sample monthly report PDF download from the homepage hero |
| system-audits_contact | System Audit page primary CTA |
| insight_replatform / insight_production_ready / insights_index | Homepage article links |
| related_replatform | Service page links to the matching article |
| article_replatform_contact / article_production_ready_contact | Article CTA to the matching enquiry |
| insights_contact | Insights index CTA |
| direct_email / footer_email / faq_email / supplier_email | Direct email alternative |
| about_contact | About section "Talk to us" CTA |
| capability_statement | Capability statement PDF download in the Enterprise section |
| founder_linkedin | Leadership LinkedIn profile link in the About section |
| footer_linkedin | Footer link to the company LinkedIn page |
| form_start | First form interaction |
| form_success | Form endpoint confirmed acceptance |
| form_failure | Rejected, failed, or timed-out request |

Click events include the link destination. Form events contain only the event name. Names, emails, companies, selected service, and enquiry contents are not included.

A form success event measures acceptance by the endpoint, not a qualified lead, inbox delivery, or revenue. When analytics is connected, track enquiries through qualification and won work outside the public website to assess lead quality.

The enquiry form also sends an optional timing answer, so incoming leads can be prioritised by urgency without asking for budget.

No consent service is needed: the only analytics is Cloudflare Web Analytics, which sets no cookies. The privacy notice describes it; update the notice in the same change as any new provider.
