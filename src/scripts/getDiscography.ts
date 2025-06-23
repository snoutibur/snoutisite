import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export async function getDiscography() {
    // Reading markdown collection & sorting it
    const discographyItems = await getCollection('discography');
    const discography = discographyItems.sort((a: CollectionEntry<'discography'>, b: CollectionEntry<'discography'>) =>
        a.data.order - b.data.order
    );

    // Reading cover images, impatient
    const coverModules = import.meta.glob<{ default: string }>(
        '../assets/discography/*.{png,jpg,jpeg,webp}', {
        eager: true
    });

    // Map filenames to their imported image modules
    const coverMap = Object.fromEntries(
        Object.entries(coverModules).map(([path, module]) => {
            // Extract filename from path
            const filename = path.split('/').pop();
            return [filename, module.default];
        })
    );

    const imageURLs = discography.map(item => {
        const coverKey = item.data.cover.split('/').pop()!;
        const coverImage = coverMap[coverKey];
        if (!coverImage) {
            console.warn(`[discography] cover not found for "${coverKey}"`);
        }
        return {
            ...item,
            coverImage,
            slug: (item as any).slug,
        };
    });

    return imageURLs; // Returns an array of image URL's
}