/**
 * A complete TheoryTab
 */
export interface TheoryTab {
    notes: TabNote[];
    keys: TabKey[];
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