# Intervencija measurement integration

No analytics vendor is connected by default. The website emits privacy-neutral browser events that can be connected to a selected analytics provider later without changing the public interaction design.

## Event interface

Events are dispatched on `window` as `intervencija:measurement` custom events. The event payload is available at `event.detail`.

Example integration:

```js
window.addEventListener('intervencija:measurement', (event) => {
  const { name, ...properties } = event.detail;
  // Forward only the approved event name and properties to the selected provider.
});
```

## Current events

| Event | Trigger | Included properties |
|---|---|---|
| `header_contact` | Desktop homepage header CTA | Link destination |
| `mobile_header_contact` | Mobile homepage header CTA | Link destination |
| `hero_contact` | Homepage primary CTA | Link destination |
| `hero_engagements` | Homepage engagement CTA | Link destination |
| `service_system_audits` | Homepage System Audits link | Link destination |
| `service_critical_builds` | Homepage Critical Builds link | Link destination |
| `service_fractional_architecture` | Homepage Fractional Architecture link | Link destination |
| `direct_email` | Homepage direct email link | `mailto:` destination |
| `footer_email` | Homepage footer email link | `mailto:` destination |
| `service_header_contact` | Service-page header CTA | Link destination |
| `audit_primary_contact` | System Audits primary CTA | Link destination |
| `audit_final_contact` | System Audits final CTA | Link destination |
| `build_primary_contact` | Critical Builds primary CTA | Link destination |
| `build_final_contact` | Critical Builds final CTA | Link destination |
| `fractional_primary_contact` | Fractional Architecture primary CTA | Link destination |
| `fractional_final_contact` | Fractional Architecture final CTA | Link destination |
| `service_footer_email` | Service-page email link | `mailto:` destination |
| `form_start` | First focus inside the enquiry form | None |
| `form_success` | Confirmed successful form submission | None |
| `form_failure` | Failed form submission | None |

## Privacy boundary

- Enquiry field values are never placed in event payloads.
- No names, email addresses, companies, roles, or message contents are emitted.
- No provider should be connected until its retention, cookies, consent requirements, and privacy notice impact are reviewed.
- Search Console and webmaster-tool connections remain external owner actions and are not configured in this repository.
