import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Guide articles rendered at /<slug> by src/pages/[slug].astro and listed on
// /guides. The file name is the slug: src/content/articles/<slug>.md
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),                 // H1 and <title> (" — AtLeast" appended in the layout)
    description: z.string().max(160),  // meta description, answer-first
    cluster: z.enum(['breathwork', 'meditation', 'cold-plunge', 'haptic']),
    pillar: z.boolean().default(false),
    order: z.number().default(100),    // ordering within cluster on the hub
    targetQueries: z.array(z.string()).min(1),
    datePublished: z.coerce.date(),
    dateModified: z.coerce.date().optional(),
    related: z.array(z.string()).default([]), // slugs; rendered only if they exist
    citations: z.array(z.object({ text: z.string(), url: z.string().url() })).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]), // → FAQPage JSON-LD
    issue: z.number().optional(),      // GitHub issue number, for traceability
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
