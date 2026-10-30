# Intervencija measurement integration

No analytics vendor is connected. The site emits browser events that can be connected to a selected provider later.

Listen for `intervencija:measurement` on `window`; the event name is in `event.detail.name`.

| Event | Meaning |
|---|---|
| header_contact / mobile_header_contact | Header project enquiry link |
| hero_contact | Homepage primary CTA |
| hero_services | Homepage service exploration |
| service_system_audits / service_critical_builds / service_fractional_architecture | Homepage service links |
| situation_replatform / situation_due_diligence / situation_core_system / situation_integrations / situation_new_platform / situation_growing_team | Homepage "Recognise one of these moments?" routes; shows which buyer situation resonates |
| system-audits_contact / critical-builds_contact / fractional-architecture_contact | Service page primary CTA |
| insight_replatform / insight_production_ready / insight_fractional / insights_index | Homepage article links |
| related_replatform / related_production_ready / related_fractional | Service page links to the matching article |
| article_replatform_contact / article_production_ready_contact / article_fractional_contact | Article CTA to the matching service enquiry |
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

No tracker, consent service, external account, or Search Console integration is configured. The privacy notice states that the site uses no analytics and sets no cookies; update it in the same change that connects a provider.
