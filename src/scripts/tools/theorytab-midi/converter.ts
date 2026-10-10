import type { TheoryTab, MidiNote } from "./types";
import { Key } from "./key";

/**
 * Converts a TheoryTab to an array of a custom MIDI Note object
 * @param input JSON representation of a TheoryTab
 * @returns array of MIDI notes
 */
export function convertTheoryTab(input: string): MidiNote[] {
    const data = JSON.parse(input) as TheoryTab;

    const tabKey = data.keys[0];

    if (!tabKey)
        throw new Error("TheoryTab must contain a key");

    const key = Key.fromTonic(tabKey.tonic, tabKey.scale);

    const convertedNotes: MidiNote[] = [];

    for (const note of data.notes) {
        if (note.isRest)
            continue;

        const pitch = key.toMidi(note.sd, note.octave);

        convertedNotes.push({
            pitch: pitch,
            beat: note.beat,
            duration: note.duration
        });
    }

    return convertedNotes;
}
