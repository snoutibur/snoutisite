/**
 * A complete TheoryTab
 */
export interface TheoryTab {
    notes: TabNote[];
    chords: TabChord[];
    keys: TabKey[];
}

/**
 * A TheoryTab converted to regular MIDI
 */
export interface ConvertedTheoryTab {
    melody: MidiNote[];
    chords: MidiNote[];
}

/**
 * A note of a TheoryTab
 */
export interface TabNote {
    beat: number;
    duration: number;
    sd: string;
    octave: number;
    isRest: boolean;
}

/**
 * A chord of a TheoryTab
 */
export interface TabChord {
    beat: number;
    duration: number;
    root: number;
    type: number;
    inversion: number;
    isRest: boolean;
    suspensions: number[];
    omits: number[];
    adds: number[];
}

/**
 * The key of a TheoryTab
 */
export interface TabKey {
    beat: number;
    scale: string;
    tonic: string;
}

/**
 * A MIDI note
 */
export interface MidiNote {
    pitch: number;
    beat: number;
    duration: number;
}

/**
 * Represents a chord with specified voicing
 */
export interface ChordVoicing {
    /**
     * Chord's associated bass note
     */
    bass: number;

    /**
     * Harmony notes of a chord
     */
    harmony: number[];
}

/**
 * Options for how a chord should be voiced, used by the ChordProgression class
 */
export interface VoicingOptions {
    /**
     * Lowest and highest MIDI pitches allowed for a chord's associated bass notes
     */
    bassRange: [number, number];

    /**
     * Lowest and highest MIDI pitches allowed for a chord's harmony notes
     */
    harmonyRange: [number, number];

    /**
     * Max semitones allowed lowest and highest harmony note
     * Defaults to 16
     */
    maxSpan?: number;
}