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
 * @param note Musical name of the root note, i.e. "C" or "Eb"
 * @param octave Absolute octave number, defaults to 4
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
 * Converts a scale degree to its MIDI note number
 * @param degree scale degree (1–7), optionally prefixed with # or b for chromatic notes
 * @param root root note represented as a MIDI note number
 * @param octave which octave to place this note on
 * @returns MIDI note ID number
 */
export function scaleDegreeToMidi(
    degree: string,
    root: number,
    octave: number = 0
): number {
    let accidental = 0;

    // Determine whether the scale degree has an accidental
    if (degree.startsWith("#")) {
        accidental = 1;
        degree = degree.slice(1);
    } else if (degree.startsWith("b")) {
        accidental = -1;
        degree = degree.slice(1);
    }

    const degreeNumber = Number(degree);

    if (
        !Number.isInteger(degreeNumber) ||
        degreeNumber < 1 ||
        degreeNumber > 7
    ) {
        throw new RangeError(`Invalid scale degree: ${degree}`);
    }

    const interval = majorScale[degreeNumber - 1];

    const pitch = root + interval + accidental + (octave * 12);

    if (pitch < 0 || pitch > 127) {
        throw new RangeError(`MIDI pitch out of range: ${pitch}`);
    }

    return pitch;
}