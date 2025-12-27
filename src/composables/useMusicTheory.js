
// Logic ported from User Prototype
const SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP = {
    Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B"
};

export function useMusicTheory() {
    
    function getTransposedNote(note, semitones) {
        let n = note.charAt(0).toUpperCase() + (note.length > 1 ? note.charAt(1) : "");
        if (FLAT_TO_SHARP[n]) n = FLAT_TO_SHARP[n];
        
        let idx = SCALE.indexOf(n);
        if (idx === -1) return note; // Not a standard note, return as is
        
        let newIdx = (idx + semitones) % 12;
        if (newIdx < 0) newIdx += 12;
        
        return SCALE[newIdx];
    }

    function processChord(chord, transposeLevel = 0) {
        if (transposeLevel === 0) return chord;
        // Regex to find notes A-G with optional # or b
        return chord.replace(/([A-G][b#]?)/g, (match) => 
            getTransposedNote(match, transposeLevel)
        );
    }

    function getChordColor(chord) {
        if (!chord) return "bg-gray-600";
        const root = chord.charAt(0).toUpperCase();
        const colors = {
            C: "bg-red-600 border-red-400",
            D: "bg-blue-600 border-blue-400",
            E: "bg-yellow-500 text-black border-yellow-300",
            F: "bg-green-600 border-green-400",
            G: "bg-orange-600 border-orange-400",
            A: "bg-purple-600 border-purple-400",
            B: "bg-pink-600 border-pink-400",
        };
        return colors[root] || "bg-gray-600 border-gray-500";
    }

    return {
        processChord,
        getChordColor
    };
}
