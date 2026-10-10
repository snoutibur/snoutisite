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