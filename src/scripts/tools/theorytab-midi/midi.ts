import { Midi } from "@tonejs/midi";
import type { MidiNote } from "./types";

/**
 * Generates a MIDI file an array of notes
 * @param notes - Notes with MIDI pitches and their associated beats
 * @param bpm - Tempo (BPM)
 * @returns Encoded MIDI file as a byte array
 */
export function generateMidi(
    notes: MidiNote[],
    bpm: number = 120
): Uint8Array {
    const midi = new Midi();

    midi.header.setTempo(bpm);

    const track = midi.addTrack();
    track.name = "Melody";

    for (const note of notes) {
        track.addNote({
            midi: note.pitch,
            ticks: Math.round((note.beat - 1) * midi.header.ppq),
            durationTicks: Math.round(note.duration * midi.header.ppq),
            velocity: 0.8
        });
    }

    return midi.toArray();
}