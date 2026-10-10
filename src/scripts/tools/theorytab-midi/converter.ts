import { scaleDegreeToMidi, noteToMidiID } from "./pitches";
import type { TheoryTab, MidiNote } from "./types";

/**
 * Converts a TheoryTab to an array of a custom MIDI Note object
 * @param input JSON representation of a TheoryTab
 * @returns array of MIDI notes
 */
export function convertTheoryTab(input: string): MidiNote[] {
    const data = JSON.parse(input) as TheoryTab;

    const key = data.keys[0];
    const root = noteToMidiID(key.tonic);

    const convertedNotes: MidiNote[] = [];

    for (const note of data.notes) {
        if (note.isRest)
            continue;

        const degree = Number(note.scaleDegree);

        const pitch = scaleDegreeToMidi(
            degree,
            root,
            note.octave
        );

        convertedNotes.push({
            pitch: pitch,
            beat: note.beat,
            duration: note.duration
        });
    }

    return convertedNotes;
}