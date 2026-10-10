/**
 * Scales represented as a scale degree's distance from the root note
 */
const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
} as const;

/**
 * Valid scale names, see the keys of the scales object
 */
type ScaleName = keyof typeof scales;

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

export class Key {
    /**
     * Root note of this key
     */
    readonly root: number;

    /**
     * Scale of this key
     */
    readonly scale: readonly number[];

    constructor(root: number, scale: ScaleName) {
        // Validate the root note
        if (!Number.isInteger(root) || root < 0 || root > 127) {
            throw new RangeError(`Invalid MIDI root: ${root}`);
        }

        this.root = root;
        this.scale = scales[scale];
    }

    /**
     * Static Factory Object that creates a Key from a tonic name and
     * an absolute octave number
     */
    static fromTonic(tonic: string, scale: string, octave: number = 4): Key {
        if (!Object.hasOwn(noteOffsets, tonic)) {
            throw new Error(`Unknown note: ${tonic}`);
        }

        if (!Object.hasOwn(scales, scale)) {
            throw new Error(`Unsupported scale: ${scale}`);
        }

        if (!Number.isInteger(octave)) {
            throw new RangeError(`Invalid octave: ${octave}`);
        }

        const root = (octave + 1) * 12 + noteOffsets[tonic];
        return new Key(root, scale as ScaleName);
    }

    /**
     * Converts a scale degree to its MIDI note number
     * @param degree scale degree (1–7), optionally prefixed with # or b for chromatic notes
     * @param octaveOffset which octave to place this note on
     */
    public toMidi(degree: string, octaveOffset: number = 0): number {
        let accidental: number = 0;
        let degreeValue: string = degree;

        // Determine whether the scale degree has an accidental
        if (degreeValue.startsWith("#")) {
            accidental = 1;
            degreeValue = degreeValue.slice(1);
        } else if (degreeValue.startsWith("b")) {
            accidental = -1;
            degreeValue = degreeValue.slice(1);
        }

        const degreeNumber: number = Number(degreeValue);

        if (
            !Number.isInteger(degreeNumber) ||
            degreeNumber < 1 ||
            degreeNumber > this.scale.length
        ) {
            throw new RangeError(`Invalid scale degree: ${degree}`);
        }

        if (!Number.isInteger(octaveOffset)) {
            throw new RangeError(
                `Invalid octave offset: ${octaveOffset}`
            );
        }

        const interval = this.scale[degreeNumber - 1];

        const pitch =
            this.root +
            interval +
            accidental +
            octaveOffset * 12;

        if (pitch < 0 || pitch > 127) {
            throw new RangeError(`MIDI pitch out of range: ${pitch}`);
        }

        return pitch;
    }
}
