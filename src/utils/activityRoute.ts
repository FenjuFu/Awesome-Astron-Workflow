export const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const getActivityPath = (id: string, linkSlug?: string | null): string =>
  `/activities/${linkSlug || id}`;

export const getRegistrationPath = (id: string, linkSlug?: string | null): string =>
  `/register/${linkSlug || id}`;
