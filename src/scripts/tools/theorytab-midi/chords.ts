import {Key} from "./key";
import type {TabChord} from "./types";

/**
 * Chord families represented by root-relative diatonic intervals
 * @remark The key determines the qualities of these intervals
 */
const chordFamilies: Record<number, readonly number[]> = {
    5: [1, 3, 5], // basic triad
    7: [1, 3, 5, 7],
    9: [1, 3, 5, 7, 9],
    11: [1, 3, 5, 7, 9, 11],
    13: [1, 3, 5, 7, 9, 11, 13],
};

/**
 * Represents the harmonic identity of a chord
 * @remark This class is only responsible for storing chord data, validating the chord, and calculating its tones and bass note
 * @remark This class does not decide octave placement, performance voicing, bass register, or voice leading,
 * that is the responsibility of `ChordProgression`
 */
export class Chord {
    readonly key: Key;
    readonly data: TabChord;

    constructor(key: Key, data: TabChord) {
        this.key = key;
        this.data = data;

        if (data.isRest)
            throw new Error(
                "Rests cannot be represented as a Chord"
            );

        if (!Number.isInteger(data.root) ||
            data.root < 1 ||
            data.root > 7) {
            throw new Error(
                `Invalid chord root note0: ${data.root}`
            );
        }

        const family = chordFamilies[data.type];
        if (!family)
            throw new Error(`Unsupported chord family: ${data.type}`);

        if (!Number.isInteger(data.inversion) ||
            data.inversion < 0 ||
            data.inversion >= family.length) {
            throw new Error(
                `Invalid chord inversion: ${data.inversion}`
            );
        }
    }

    /**
     * Returns the chord's root-relative diatonic intervals
     */
    public getIntervals(): number[] {
        const family = chordFamilies[this.data.type];
        let intervals = [...family];

        // Suspensions replace the third
        if (this.data.suspensions.length > 0) {
            intervals = intervals.filter(i => i !== 3);
            intervals.push(...this.data.suspensions);
        }

        // Add chord notes explicitly described by the tab (adds)
        intervals.push(...this.data.adds);

        // Removed chord notes explicitly described by the tab (omits)
        intervals = intervals.filter(
            i => !this.data.omits.includes(i)
        );

        return [...new Set(intervals)]
            .sort((a, b) => a - b); // Sorted for the sake of readability & guaranteed order
    }

    /**
     * Resolves a root-relative interval to a reference MIDI pitch using the chord's key
     */
    private intervalToMidi(interval: number): number {
        // Gets the scale degree relative to the key's tonic note
        const degree = this.data.root + interval - 1; // -1 to avoid root being counted twice
        const normalizedDegree = ((degree - 1) % 7 + 7) % 7 + 1; // then wrap the degree in range 1-7

        const octaveOffset = Math.floor((degree - 1) / 7); // # of times the degree went over the diatonic octave

        return this.key.toMidi(
            String(normalizedDegree),
            octaveOffset
        );
    }

    /**
     * Converts chord intervals to actual MIDI note numbers
     * @remarks Will not apply omissions, explicit adds, doubles, inversions or voice leading
     * @returns Array of MIDI note numbers that make up the chord
     */
    public getChordTones(): number[] {
        return this.getIntervals().map(
            interval => this.intervalToMidi(interval)
        );
    }

    /**
     * Gets which chord tone should be in the bass note based on the chord's inversion
     */
    private getBassInterval(): number {
        const family = chordFamilies[this.data.type];
        let interval = family[this.data.inversion];

        // The suspended note replaces the third
        if (interval === 3 && this.data.suspensions.length > 0) {
            if (this.data.suspensions.length !== 1)
                throw new Error("Ambiguous bass: multiple suspensions");

            interval = this.data.suspensions[0];
        }

        if (!this.getIntervals().includes(interval))
            throw new Error(`Inversion selects omitted tone: ${interval}`);

        return interval;
    }

    /**
     * Gets the note name of the bass, ignores the octave.
     * The note name is represented as a number, 0-11 where 0 is C and 11 is B
     */
    public getBassPitchClass(): number {
        const pitch = this.intervalToMidi(
            this.getBassInterval()
        );

        return ((pitch % 12) + 12) % 12; // octave stripped
    }
}
