/**
 * PostHog analytics helper — safely no-ops when PostHog is not configured.
 * Usage: track('architecture_generated', { projectType: 'SaaS Web App' })
 */

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, properties?: EventProperties): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posthog = (window as any).posthog;
    if (posthog && typeof posthog.capture === 'function') {
      posthog.capture(event, properties);
    }
  } catch {
    // Never throw — analytics should never break the app
  }
}

// Pre-defined events for type safety
export const Events = {
  ARCHITECTURE_GENERATED: 'architecture_generated',
  ARCHITECTURE_REFINED: 'architecture_refined',
  EXPORT_MARKDOWN: 'export_markdown',
  EXPORT_JSON: 'export_json',
  EXPORT_PDF: 'export_pdf',
  SHARE_LINK_COPIED: 'share_link_copied',
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  SIGN_OUT: 'sign_out',
} as const;
