# Intervencija measurement integration

No analytics vendor is connected. The site emits browser events that can be connected to a selected provider later.

Listen for `intervencija:measurement` on `window`; the event name is in `event.detail.name`.

| Event | Meaning |
|---|---|
| header_contact / mobile_header_contact | Header project enquiry link |
| hero_contact | Homepage primary CTA |
| hero_services | Homepage service exploration |
| service_system_audits / service_critical_builds / service_fractional_architecture | Homepage service links |
| capabilities_contact / approach_contact | Homepage context CTA |
| system-audits_contact / critical-builds_contact / fractional-architecture_contact | Service page primary CTA |
| direct_email / footer_email | Direct email alternative |
| form_start | First form interaction |
| form_success | Form endpoint confirmed acceptance |
| form_failure | Rejected, failed, or timed-out request |

Click events include the link destination. Form events contain only the event name. Names, emails, companies, selected service, and enquiry contents are not included.

A form success event measures acceptance by the endpoint, not a qualified lead, inbox delivery, or revenue. When analytics is connected, track enquiries through qualification and won work outside the public website to assess lead quality.

No tracker, consent service, external account, or Search Console integration was configured by this overhaul.
