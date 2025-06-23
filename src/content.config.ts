import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {pattern} from "regex";

// Defining collections
const discography = defineCollection({
    loader: glob({pattern: "**/*.md", base: "./src/content/discography"}),
    schema: z.object({
        title: z.string(),
        cover: z.string(),
        order: z.number().int(),
        tags: z.array(z.string()), // Array of tags
        link: z.string().optional(), // Link could be optional and a URL string
    }),
});

// Register collections
export const collections = {
    discography,
};