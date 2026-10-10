/**
 * The Major scale represented as each scale degree's distance from the root note
 */
const majorScale: number[] = [0, 2, 4, 5, 7, 9, 11];

/**
 * Maps letter names to a semitone offset from C
 */
const noteOffsets: Record<string, number> = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11
};

/**
 * Converts a note name into a MIDI note number
 * @param note - Musical name of the root note, i.e. "C" or "Eb"
 * @param octave - Absolute octave number, defaults to 4
 * @returns The MIDI note number of the specified pitch
 */
export function noteToMidiID(
    note: string,
    octave: number = 4
): number {
    const offset = noteOffsets[note];

    if (offset === undefined) {
        throw new Error(`Unknown note: ${note}`);
    }

    return (octave + 1) * 12 + offset;
}

/**
 * Converts a specified scale degree to its MIDI note ID
 * @param degree scale degree to convert to MIDI
 * @param root root note, represented as a MIDI ID
 * @param octave which octave to place this scale degree on
 * @returns calculated MIDI note number
 */
export function scaleDegreeToMidi(
    degree: number,
    root: number,
    octave: number = 0
): number {
    if (degree < 1 || degree > 7) {
        throw new RangeError("Scale degree must be between 1 and 7");
    }

    const interval = majorScale[degree - 1];

    return root + interval + (octave * 12);
}