import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const normalizeSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripMarkdown(str) {
  if (!str) return '';
  return str
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

async function fetchActivity(slug) {
  // VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are shared between the
  // client-side Vite build and server-side Vercel functions to avoid
  // duplicating environment variable configuration.
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const normalizedKey = normalizeSlug(slug);

    if (isUuid(slug)) {
      const { data } = await supabase
        .from('activities')
        .select('id, title, description, cover_image')
        .eq('id', slug)
        .maybeSingle();
      return data;
    }

    // Try exact link_slug match first
    const { data } = await supabase
      .from('activities')
      .select('id, title, description, cover_image')
      .eq('link_slug', slug)
      .maybeSingle();
    if (data) return data;

    // Try normalized slug
    if (normalizedKey !== slug) {
      const { data: normalizedData } = await supabase
        .from('activities')
        .select('id, title, description, cover_image')
        .eq('link_slug', normalizedKey)
        .maybeSingle();
      if (normalizedData) return normalizedData;
    }

    // Try case-insensitive match
    const { data: ilikeData } = await supabase
      .from('activities')
      .select('id, title, description, cover_image')
      .ilike('link_slug', slug)
      .maybeSingle();
    return ilikeData || null;
  } catch (e) {
    console.error('Error fetching activity for OG:', e);
    return null;
  }
}

export default async function handler(req, res) {
  const { slug } = req.query;

  const activity = slug ? await fetchActivity(slug) : null;

  // Read dist/index.html (bundled via includeFiles in vercel.json)
  let html;
  try {
    html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
  } catch {
    // Fallback for local development where dist/ may not yet exist.
    // In production on Vercel, dist/index.html is always available via includeFiles.
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(503).send(
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Service Unavailable</title></head><body><p>Page not available. Please try again later.</p></body></html>`
    );
  }

  const host = req.headers.host || 'awesome-astron-workflow.dev';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;
  const pageUrl = `${siteUrl}/activities/${encodeURIComponent(slug || '')}`;

  const ogTitle = activity ? activity.title : 'Awesome Astron Workflow';
  const pageTitle = activity ? `${activity.title} - Astron` : 'Awesome Astron Workflow';
  const rawDescription = activity
    ? stripMarkdown(activity.description)
    : 'Discover and share awesome Astron workflows and activities.';
  const description =
    rawDescription.length > 200 ? rawDescription.substring(0, 197) + '...' : rawDescription;
  const imageUrl =
    activity?.cover_image
      ? activity.cover_image.startsWith('http')
        ? activity.cover_image
        : `${siteUrl}${activity.cover_image}`
      : `${siteUrl}/swag/event/4Y4A6315.JPG`;

  // Build tags to inject at the top of <head>
  const injectedTags = [
    `<title>${escapeHtml(pageTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
    `<meta property="og:type" content="${activity ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="Awesome Astron Workflow" />`,
    `<meta property="og:locale" content="zh_CN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(ogTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  ].join('\n  ');

  // Remove any pre-existing title, description, og: and twitter: tags then prepend ours
  html = html
    .replace(/<title>[^<]*<\/title>\s*/gi, '')
    .replace(/<meta\s+name="description"[^>]*\/?>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*\/?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*\/?>\s*/gi, '')
    .replace('<head>', `<head>\n  ${injectedTags}`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
