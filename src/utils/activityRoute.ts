export const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const isMissingLinkSlugColumnError = (error: { code?: string; message?: string } | null): boolean =>
  Boolean(error) &&
  (error?.code === 'PGRST204' || 
   error?.code === '42703' ||
   error?.message?.includes("Could not find the 'link_slug' column of 'activities' in the schema cache") ||
   error?.message?.includes('column "link_slug" does not exist') ||
   error?.message?.includes('column activities.link_slug does not exist'));

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

type ActivityWithSlug = {
  id: string;
  link_slug?: string | null;
  additional_fields?: {
    link_slug?: string | null;
  };
};

export const getActivitySlug = (activity: ActivityWithSlug): string | null =>
  activity.link_slug || activity.additional_fields?.link_slug || null;
