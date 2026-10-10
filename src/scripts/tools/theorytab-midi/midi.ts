import { Midi } from "@tonejs/midi";
import type {ConvertedTheoryTab, MidiNote} from "./types";

/**
 * Generates a MIDI file an array of notes
 * @param notes - Notes with MIDI pitches and their associated beats
 * @param bpm - Tempo (BPM), 120 default
 * @returns Encoded MIDI file as a byte array
 */
export function generateMidi(
    data: ConvertedTheoryTab,
    bpm: number = 120
): Uint8Array {
    const midi = new Midi();
    midi.header.setTempo(bpm);

    // Add melody notes
    const melodyTrack = midi.addTrack();
    melodyTrack.name = "Melody";

    for (const note of data.melody) {
        melodyTrack.addNote({
            midi: note.pitch,
            ticks: Math.round((note.beat - 1) * midi.header.ppq),
            durationTicks: Math.round(note.duration * midi.header.ppq),
            velocity: 0.8
        });
    }

    // Add chord notes
    const chordTrack = midi.addTrack();
    chordTrack.name = "Chords";

    for (const note of data.chords) {
        chordTrack.addNote({
            midi: note.pitch,
            ticks: Math.round((note.beat - 1) * midi.header.ppq),
            durationTicks: Math.round(note.duration * midi.header.ppq),
            velocity: 0.65
        });
    }

    return midi.toArray();
}