import {Key} from "./key";
import type {TabChord} from "./types";

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
     * Calculates the MIDI pitches of this chord
     * @remarks only does basic trads at the moment
     * @returns An array containing the chord's MIDI note numbers
     */
    public getPitches(): number[] {
        if (this.data.isRest)
            return [];
        if (this.data.type !== 5)
            throw new Error(
                `Unsupported chord type: ${this.data.type}`
            );
        if (this.data.inversion !== 0)
            throw new Error(
                "Chord inversions haven't been implemented"
            );

        // Construct the chord
        const pitches: number[] = [];
        for (let i = 0; i < 3; i++) {
            const degree = this.data.root + i * 2;

            // Wrap scale degrees above 7 to something accepted by key.toMidi
            const normalizedDegree = ((degree - 1) % 7) + 1;
            const octaveOffset = Math.floor((degree - 1) / 7);

            const pitch = this.key.toMidi(
                String(normalizedDegree),
                octaveOffset
            );

            pitches.push(pitch);
        }

        return pitches;
    }
}