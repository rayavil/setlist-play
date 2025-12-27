
import { ref, onMounted, onUnmounted } from 'vue';
import MetronomeWorker from '../workers/metronome.worker.js?worker';

export function useAudioEngine() {
    const audioCtx = ref(null);
    const isPlaying = ref(false);
    const isMuted = ref(true); // Default to Muted
    const currentBeat = ref(0);
    const nextNoteTime = ref(0.0);
    
    // Config
    const bpm = ref(120);
    const timeSig = ref([4, 4]); // [numerator, denominator]

    let worker = null;
    let lookahead = 25.0; // ms
    let scheduleAheadTime = 0.1; // sec

    function initAudio() {
        if (!audioCtx.value) {
            audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
        }
        if(!worker) {
            worker = new MetronomeWorker();
            worker.onmessage = (e) => {
                if (e.data.type === "tick") {
                    scheduler();
                }
            };
        }
    }

    function nextNote() {
        const secondsPerBeat = 60.0 / bpm.value;
        nextNoteTime.value += secondsPerBeat;
        currentBeat.value++;
        if (currentBeat.value === timeSig.value[0]) {
            currentBeat.value = 0;
        }
    }

    function scheduleNote(beatNumber, time) {
        if(!audioCtx.value) return;
        
        // 1. Audio Generation (Only if NOT muted)
        if (!isMuted.value) {
            const osc = audioCtx.value.createOscillator();
            const gain = audioCtx.value.createGain();
    
            // High pitch for first beat
            osc.frequency.value = (beatNumber === 0) ? 1000 : 800;
            
            gain.gain.value = 1;
            gain.gain.exponentialRampToValueAtTime(1, time + 0.001);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
            osc.connect(gain);
            gain.connect(audioCtx.value.destination);
    
            osc.start(time);
            osc.stop(time + 0.05);
        }
        
        // 2. Visual Trigger (ALWAYS fires, even if muted)
        const delay = (time - audioCtx.value.currentTime) * 1000;
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('metronome-tick', { detail: { beat: beatNumber } }));
        }, Math.max(0, delay));
    }

    function scheduler() {
        // While there are notes that will play within this schedule interval...
        while (nextNoteTime.value < audioCtx.value.currentTime + scheduleAheadTime) {
            scheduleNote(currentBeat.value, nextNoteTime.value);
            nextNote();
        }
    }

    async function togglePlay(forceState = null, targetSystemTime = null) {
        await initAudio();
        if (audioCtx.value.state === 'suspended') {
            await audioCtx.value.resume();
        }

        const shouldPlay = forceState !== null ? forceState : !isPlaying.value;
        if (isPlaying.value === shouldPlay) return; 

        if (shouldPlay) {
            // START
            let delay = 0;
            let startPhase = 0; // In seconds relative to the beat

            if (targetSystemTime) {
                const now = Date.now();
                const diff = targetSystemTime - now;

                // delay in SECONDS for AudioContext
                let delaySec = 0;

                if (diff >= 0) {
                    // FUTURE START
                    // We schedule the first note to happen 'diff' ms from now
                    delaySec = diff / 1000;
                    console.log(`Audio: Precision Start scheduled at +${delaySec.toFixed(3)}s`);
                    
                    // Reset beat to 0 for a clean start
                    currentBeat.value = 0;
                    
                } else {
                    // PAST START (Late Join)
                    const elapsed = -diff / 1000; // seconds
                    const secondsPerBeat = 60.0 / bpm.value;
                    const beatsPassed = Math.floor(elapsed / secondsPerBeat);
                    
                    currentBeat.value = (beatsPassed + 1) % timeSig.value[0]; 
                    
                    const phase = elapsed % secondsPerBeat;
                    // startPhase is how far into the future the NEXT beat is
                    delaySec = secondsPerBeat - phase;
                    
                    console.log(`Audio: Catching up. Missed ${beatsPassed} beats. Next beat in ${delaySec.toFixed(3)}s`);
                }
                
                // CRITICAL: We anchor the Audio Clock to this future time.
                // The Worker will start ticking immediately, but the scheduler() function
                // will see that nextNoteTime is in the future and wait until it's time to trigger.
                // This eliminates JS timer jitter.
                nextNoteTime.value = audioCtx.value.currentTime + delaySec;
            } else {
                 // Immediate Start (Fallback)
                 nextNoteTime.value = audioCtx.value.currentTime + 0.05;
                 currentBeat.value = 0;
            }

            isPlaying.value = true;
            worker.postMessage({ action: "start", interval: lookahead });


        } else {
            // STOP
            isPlaying.value = false;
            worker.postMessage({ action: "stop" });
        }
    }

    return {
        initAudio,
        togglePlay,
        isPlaying,
        bpm,
        timeSig,
        isMuted
    };
}
