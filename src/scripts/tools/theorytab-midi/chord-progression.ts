import type {Chord} from "./chords.ts";
import type {ChordVoicing, VoicingOptions} from "./types.ts";

/**
 * Represents a chord progression.
 * Optimization for minimal note movement between chords is provided.
 * Bass and harmony are optimized independently, preserving each chord's bass pitch class
 */
export class ChordProgression {
    readonly chords: readonly Chord[];

    constructor(chords: Chord[]) {
        this.chords = [...chords];
    }

    /**
     * Finds the ideal voice leading for this chord progression
     * @remarks if VoicingOptiuons.maxSpan cannot be met, the tightest available harmony voicings will be used
     * @param options options to use for this operation
     * @returns "Ideal" voicing for chords in this progression
     */
    public generateVoicings(options: VoicingOptions): ChordVoicing[] {
        this.validateRange(options.bassRange, "bassRange");
        this.validateRange(options.harmonyRange, "harmonyRange");
        if (this.chords.length === 0)
            return [];

        // the midpoint of the harmony's range, used to prefer certain registers
        const center = (options.harmonyRange[0] + options.harmonyRange[1]) / 2;

        // Generate every possible bass pitches for a chord
        const bassCandidates = this.chords.map(chord =>
            this.pitchesInRange(chord.getBassPitchClass(), options.bassRange)
        );

        // Generate every possible candidate for the harmony notes
        const harmonyCandidates = this.chords.map(chord =>
            this.harmonyVoicings(chord, options.harmonyRange, options.maxSpan ?? 16)
        );

        // Validate that every chord has at least one possible voicing
        for (let i = 0; i < this.chords.length; i++) {
            if (bassCandidates[i].length === 0) {
                throw new Error(
                    `No valid bass pitch for chord ${i} ` +
                    `within [${options.bassRange.join(", ")}]`
                );
            }

            if (harmonyCandidates[i].length === 0) {
                throw new Error(
                    `No valid harmony voicing for chord ${i} ` +
                    `within [${options.harmonyRange.join(", ")}]`
                );
            }
        }

        // Perform optimization
        const bassLine = this.bestPath(
            bassCandidates,
            (a, b) => Math.abs(a - b)
        );
        const harmonyLine = this.bestPath(
            harmonyCandidates,
            (a, b) => this.harmonyMovementCost(a, b),
            v => this.registerCost(v, center)
        );

        // Combined output into the right type
        return this.chords.map((_, i) => ({
            bass: bassLine[i],
            harmony: harmonyLine[i]
        }));
    }

    /**
     * Builds octave placements with one note per distinct pitch class
     * @param chord chord that's currently being voiced
     * @param range min & max allowed MIDI pitches
     * @param maxSpan maximum allowed distance between lowest & highest notes
     */
    private harmonyVoicings(chord: Chord, range: [number, number], maxSpan: number): number[][] {
        // Octave doubles in the chord's definition represent the same note. This strips away octaves & doubles
        const pitchClasses = [...new Set(chord.getChordTones().map(pitch => this.pitchClass(pitch)))];

        // Each chord tone gets its own octave choices
        const candidates = pitchClasses.map(pitchClass => this.pitchesInRange(pitchClass, range));
        // && verify that every chord tone has pitches available in the requested range
        if (candidates.some(pitches => pitches.length === 0))
            return []; // no valid harmony voicings

        // Generate combinations that will fit in maxSpan
        let voicings = this.combinations(candidates, maxSpan);
        if (voicings.length === 0) { // catch impossible span limits, this is a fallback
            // Applies a less restrictive span limit; every note must still fit within the MIDI range
            const all = this.combinations(candidates, Infinity);
            const minSpan = Math.min(...all.map(voicing => this.span(voicing)));
            voicings = all.filter(voicing => this.span(voicing) === minSpan);
        }

        // Store the voicings. Sorted for ease of usability
        return voicings.map(pitches => pitches.sort((a, b) => a - b));
    }

    /**
     * Checks for valid MIDI bounds
     */
    private validateRange(range: [number, number], name: string): void {
        const [min, max] = range;

        if (
            !Number.isInteger(min) ||
            !Number.isInteger(max) ||
            min < 0 ||
            max > 127 ||
            min > max
        ) {
            throw new Error(
                `Invalid ${name}: expected integer MIDI pitches with 0 <= min <= max <= 127`
            );
        }
    }

    /**
     * Takes a pitch and converts it to what pitch it is
     * 0 = C
     * 11 = B
     */
    private pitchClass(pitch: number): number {
        return ((pitch % 12) + 12) % 12;
    }

    /**
     * Measures how spread out a voicing is
     */
    private span(pitches: number[]): number {
        return Math.max(...pitches) - Math.min(...pitches);
    }

    /**
     * Finds every octave placement of a pitch class within inclusive bounds
     */
    private pitchesInRange(pitchClass: number, range: [number, number]): number[] {
        const [min, max] = range;
        const pitches: number[] = [];

        // Smallest pitch >= min with the target pitch class
        const first = min + ((pitchClass - this.pitchClass(min)) + 12) % 12;

        for (let pitch = first; pitch <= max; pitch += 12)
            pitches.push(pitch);

        return pitches;
    }

    /**
     * Generates every valid voicing combinations.
     * Valid is when there's one pitch per distinct chord tone & voicings must be within the max span
     */
    private combinations(candidates: number[][], maxSpan: number): number[][] {
        let result: number[][] = [[]];

        // produces the Cartesian product of pitch groups
        for (const pitches of candidates) { // current chord tone
            const next: number[][] = [];

            for (const partial of result) { // expanding combinations
                for (const pitch of pitches) { // add possble pitches
                    const voicing = [...partial, pitch];
                    // constrain to only items that fit within the span
                    if (this.span(voicing) <= maxSpan)
                        next.push(voicing);
                }
            }

            result = next;
        }

        return result;
    }

    /**
     * Finds the penalty for a voicing that has an average pitch far from the desired harmonic center
     */
    private registerCost(pitches: number[], center: number): number {
        const mean =
            pitches.reduce((sum, pitch) => sum + pitch, 0) /
            pitches.length;

        return Math.abs(mean - center) * 0.5;
    }

    /**
     * Find the cheapest wa to reach each chord's candidate list to minimize the overall cost of a chord change.
     * It is assumed that layers are nonempty; nodeCost adds a preference for each candidate.
     * @remarks the lowest cost in this case refers to the smallest jump in the chord progression
     * @param layers array of candidates for the chords in the progression
     * @param movementCost a function that takes two candidates and returns the cost of moving between them
     * @param nodeCost assigns additional penalties to individual candidates, defaults to 0
     */
    private bestPath<T>(layers: T[][], movementCost: (a: T, b: T) => number, nodeCost: (x: T) => number = () => 0): T[] {
        // inits first layer, required to start the algorithm
        let costs = layers[0].map(nodeCost);
        const previous: number[][] = [layers[0].map(() => -1)]; // -1 since no previous chord exists

        // Evaluate all candidates
        for (let i = 1; i < layers.length; i++) { // each iteration processes the next chord in layers
            const layerCosts: number[] = [];
            const layerPrevious: number[] = [];

            // Examines the voicing candidate in this layer
            for (const candidate of layers[i]) {
                // first finite & valid costs will certainly replace these
                let bestCost = Infinity;
                let bestPrevious = -1;

                // Tries every candidate from the prior chord
                for (let k = 0; k < layers[i - 1].length; k++) {
                    const cost = costs[k] + movementCost(layers[i - 1][k], candidate);

                    // Uses first candidate in the event of a tie
                    if (cost < bestCost) {
                        bestCost = cost;
                        bestPrevious = k;
                    }
                }

                layerCosts.push(bestCost + nodeCost(candidate));
                layerPrevious.push(bestPrevious);
            }

            // for reconstructing path later as choosing the nearest chord at first glance ("greedily")
            // may result in a large jump later on in the progression, aka higher cost
            costs = layerCosts;
            previous.push(layerPrevious);
        }

        // locates the index of the lowest cost candidate in the final layer, which is the best candidate
        let index = 0;
        for (let i = 1; i < costs.length; i++) {
            if (costs[i] < costs[index])
                index = i;
        }

        // Reconstructs path
        const path: T[] = new Array(layers.length);
        for (let i = layers.length - 1; i >= 0; i--) {
            path[i] = layers[i][index];
            index = previous[i][index];
        }

        return path;
    }

    /**
     * Measures voice-leading distance between harmony stacks
     *
     * Each note is compared with its nearest note in the other chord,
     * in both directions, so chords with different numbers of tones are supported.
     * This does not require a one-to-one assignment between voices.
     */
    private harmonyMovementCost(chordA: number[], chordB: number[]): number {
        // Nearest note helper
        const nearest = (note: number, pitches: number[]) =>
            Math.min(...pitches.map(pitch => Math.abs(note - pitch)));

        // Accumulate cost (in both directions)
        let cost = 0;
        for (const note of chordA)
            cost += nearest(note, chordB);
        for (const note of chordB)
            cost += nearest(note, chordA);

        return cost;
    }
}
