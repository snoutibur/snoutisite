import type {
    TheoryTab,
    MidiNote,
    ConvertedTheoryTab
} from "./types";

import { Key } from "./key";
import { Chord } from "./chords";

/**
 * Converts a TheoryTab to arrays of melody and chord MIDI notes
 * @param input JSON representation of a TheoryTab
 * @returns converted melody & chord notes
 */
export function convertTheoryTab(input: string): ConvertedTheoryTab {
    const data = JSON.parse(input) as TheoryTab;

    const tabKey = data.keys[0];
    if (!tabKey)
        throw new Error("TheoryTab must contain a key");

    const key = Key.fromTonic(tabKey.tonic, tabKey.scale);

    // Convert melody
    const melody: MidiNote[] = [];

    for (const note of data.notes) {
        if (note.isRest)
            continue;

        melody.push({
            pitch: key.toMidi(note.sd, note.octave),
            beat: note.beat,
            duration: note.duration
        });
    }

    // Convert chords
    const chords: MidiNote[] = [];

    for (const tabChord of data.chords) {
        const chord = new Chord(key, tabChord);

        // Construct a chord in the notes array,
        // represented as individual notes with the same beat and duration
        const pitches = chord.getPitches();
        for (const pitch of pitches) {
            chords.push({
                pitch,
                beat: tabChord.beat,
                duration: tabChord.duration
            });
        }
    }

    return {
        melody,
        chords
    };
}
