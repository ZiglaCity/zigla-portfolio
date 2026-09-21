import { z } from "zod";

export const reactionTypes = [
  "like",
  "love",
  "fire",
  "laugh",
  "insightful",
] as const;

export const commentInputSchema = z.object({
  displayName: z.string().trim().max(80).optional().default(""),
  body: z.string().trim().min(1).max(2000),
  website: z.string().max(200).optional().default(""),
  imageUrl: z.string().url().max(2048).nullable().optional(),
});

export const reactionInputSchema = z.object({
  reactionType: z.enum(reactionTypes),
});

export type ReactionType = (typeof reactionTypes)[number];

export function isValidBlogSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 160;
}
