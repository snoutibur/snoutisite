import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

export async function getDiscography()  {
    // Get and sort the data
    const discographyItems = await getCollection("discography");
    const discography = discographyItems.sort(
        (a: CollectionEntry<"discography">, b: CollectionEntry<"discography">) =>
            b.data.order - a.data.order
    );

    // Import cover images
    const coverModules = import.meta.glob<{ default: string }>(
        "../assets/discography/*.{png,jpg,jpeg,webp}",
        { eager: true }
    );
    const coverMap = Object.fromEntries(
        Object.entries(coverModules).map(([path, module]) => {
            const filename = path.split("/").pop();
            return [filename, module.default];
        })
    );

    // Final map
    const imageURLs = discography.map((item) => {
        const coverKey = item.data.cover.split("/").pop()!;
        const coverImage = coverMap[coverKey];
        if (!coverImage) {
            console.warn(`[discography] cover not found for "${coverKey}"`);
        }

        return {
            ...item,
            coverImage,
            slug: item.id,
        };
    });

    return imageURLs;
}
