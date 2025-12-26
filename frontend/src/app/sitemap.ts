import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://psicoaissist.com';

  // Static pages
  const routes = [
    '',
    '/pricing',
    '/features',
    '/blog',
    '/clinics', // New landing page
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Blog posts (Static for now, later dynamic)
  const posts = [
    'etica-ia-psicologia',
    'automatizar-notas-clinicas'
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...posts];
}