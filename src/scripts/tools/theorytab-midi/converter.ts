import type {
    TheoryTab,
    MidiNote,
    ConvertedTheoryTab,
    VoicingOptions
} from "./types";

import {Key} from "./key";
import {Chord} from "./chords";
import {ChordProgression} from "./chord-progression";

/**
 * Converts a TheoryTab to arrays of melody and chord MIDI notes
 * @param input JSON representation of a TheoryTab
 * @returns converted melody & chord notes
 */
export function convertTheoryTab(input: string): ConvertedTheoryTab {
    const theoryTab = JSON.parse(input) as TheoryTab;

    const tabKey = theoryTab.keys[0];
    if (!tabKey)
        throw new Error("TheoryTab must contain a key");
    const key = Key.fromTonic(tabKey.tonic, tabKey.scale);

    // Convert melody
    const melody: MidiNote[] = [];
    for (const note of theoryTab.notes) {
        if (note.isRest)
            continue;

        melody.push({
            pitch: key.toMidi(note.sd, note.octave),
            beat: note.beat,
            duration: note.duration
        });
    }

    // Build the chord progression while preserving its musical identity //
    const activeChords = theoryTab.chords.filter(
        tabChord => !tabChord.isRest
    );
    const progression = new ChordProgression( //
        activeChords.map(tabChord => new Chord(key, tabChord))
    );

    // Set chord voicing appropriately for "smoothness" (least large jumps between notes)
    const voicingOptions: VoicingOptions = {
        bassRange: [28, 52],
        harmonyRange: [48, 72],
    };
    const chordVoicings = progression.generateVoicings(voicingOptions);

    // Convert chord voicings to MIDI notes
    const chords: MidiNote[] = [];
    for (let i = 0; i < activeChords.length; i++) {
        const currentTabChord = activeChords[i];
        const currentVoicing = chordVoicings[i];

        // Bass note
        chords.push({
            pitch: currentVoicing.bass,
            beat: currentTabChord.beat,
            duration: currentTabChord.duration
        });

        // Harmony notes
        for (const pitch of currentVoicing.harmony) {
            chords.push({
                pitch,
                beat: currentTabChord.beat,
                duration: currentTabChord.duration
            });
        }
    }

    return {
        melody,
        chords
    };
}
