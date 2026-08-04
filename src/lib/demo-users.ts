/** Canonical demo accounts — only these should appear in sharing. */
export const DEMO_USER_EMAILS = [
  "ali@alidocs.dev",
  "bob@alidocs.dev",
  "carol@alidocs.dev",
] as const;

export type DemoUserEmail = (typeof DEMO_USER_EMAILS)[number];
