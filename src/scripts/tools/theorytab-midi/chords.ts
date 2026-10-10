import {Key} from "./key";
import type {TabChord} from "./types";

/**
 * Chord families represented as diatonic scale degrees from the chord root note
 * @remarks chord qualities, ie major / minor, are provided by the key
 */
const chordFamilies: Record<number, readonly number[]> = {
    5: [1, 3, 5], // basic triad
    7: [1, 3, 5, 7],
    9: [1, 3, 5, 7, 9],
    11: [1, 3, 5, 7, 9, 11],
    13: [1, 3, 5, 7, 9, 11, 13],
};

/**
 * Represents a musical chord within a particular key
 */
export class Chord {
    readonly key: Key;
    readonly data: TabChord;

    constructor(key: Key, data: TabChord) {
        this.key = key;
        this.data = data;
    }

    /**
     * Constructs the chord's intervals relative to its root
     */
    private getIntervals(): number[] {
        const family = chordFamilies[this.data.type];
        if (!family)
            throw new Error(`Unsupported chord family: ${this.data.type}`
            );

        // copy of the intervals, later operations will modify this array
        let intervals = [...family];

        // Apply suspensions, replace the third
        if (this.data.suspensions.length > 0) {
            intervals = intervals.filter(i => i !== 3);
            intervals.push(...this.data.suspensions);
        }

        // Add chords: add their added note
        intervals.push(...this.data.adds);

        // Remove omitted chord notes
        intervals = intervals.filter(
            i => !this.data.omits.includes(i)
        );

        // Remove duplicates and restore ascending order
        return [...new Set(intervals)].sort((a, b) => a - b);
    }

    /**
     * Converts a root-relative diatonic interval into a MIDI pitch
     */
    private intervalToMidi(
        interval: number,
        key: Key
    ): number {
        const degree = this.data.root + interval - 1;

        // Wrap scale degrees above 7 to something accepted by key.toMidi
        const normalizedDegree = ((degree - 1) % 7) + 1;

        // # of 7 scale degree cycles the interval crosses
        const octaveOffset = Math.floor((degree - 1) / 7);

        return key.toMidi(
            String(normalizedDegree),
            octaveOffset
        );
    }

    /**
     * Applies a chord inversion by raising the lowest notes by one octave
     */
    private applyInversion(pitches: number[]): number[] {
        const inversion = this.data.inversion;

        if (inversion < 0 || inversion >= pitches.length)
            throw new Error(
                `Invalid chord inversion: ${inversion}`
            );

        const result = [...pitches];

        // raise lowest notes
        for (let i = 0; i < inversion; i++) {
            const pitch = result.shift()!;
            result.push(pitch + 12);
        }

        return result;
    }

    /**
     * Calculates the MIDI pitches of this chord
     * @returns An array containing the chord's MIDI note numbers
     */
    public getPitches(): number[] {
        if (this.data.isRest)
            return [];

        const intervals = this.getIntervals();

        const key = this.key;

        // converts intervals to pitches
        const pitches = intervals.map(
            interval => this.intervalToMidi(interval, key)
        );

        return this.applyInversion(pitches);
    }
}