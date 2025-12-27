
// metastronome.worker.js
// This runs in a clear separate thread for milliseconds precision

let timerID = null;
let interval = 25.0; // Check every 25ms

function run() {
    // We send a "tick" message to the main thread
    // The main thread is responsible for looking at the time and "scheduling" the audio
    // This simple loop just ensures the scheduler in main thread is called frequently
    postMessage({ type: "tick" });
    timerID = setTimeout(run, interval);
}

onmessage = function(e) {
    if (e.data.action === "start") {
        interval = e.data.interval || 25.0;
        run();
    } else if (e.data.action === "stop") {
        clearTimeout(timerID);
    }
};
