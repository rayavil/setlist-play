import { ref } from "vue";
import { supabase } from "../lib/supabase";

export function useLiveSession() {
  const role = ref(null); // 'leader' | 'follower'
  const status = ref("Músico");
  let channel = null;

  // Events to emit to the app
  // We can use a simple callback system or just expose refs that App.vue watches?
  // Callbacks are better for "Events" like "Jump to song X"
  const onSyncCommand = ref(null); // Function
  const onPeerJoin = ref(null); // Function (Leader only)

  const offset = ref(0);
  const rtt = ref(0);
  const myId = Math.random().toString(36).substr(2, 9);

  // Sync Internal State
  let pingStart = 0;
  let samples = [];
  const SAMPLE_COUNT = 5;

  function joinSession(selectedRole, roomId) {
    if (!roomId) {
      console.error("Room ID required to join session");
      return;
    }

    role.value = selectedRole;
    status.value =
      selectedRole === "leader"
        ? "Transmitiendo (Líder)"
        : "Esperando comandos...";

    if (channel) {
      supabase.removeChannel(channel);
      channel = null;
    }

    channel = supabase.channel(`live_room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        // 1. Leader Logic: Respond to Ping (Immediate Echo)
        if (role.value === "leader" && payload.type === "ping") {
          channel.send({
            type: "broadcast",
            event: "sync",
            payload: {
              type: "pong",
              leaderTime: Date.now(),
              targetId: payload.from,
            },
          });
          
          // Notify app that someone joined/synced
          if (onPeerJoin.value) onPeerJoin.value(payload.from);
        }

        // 2. Follower Logic: Process Pong
        if (
          role.value === "follower" &&
          payload.type === "pong" &&
          payload.targetId === myId
        ) {
          const now = Date.now();
          const roundTrip = now - pingStart;

          // Calculate sample offset: LeaderTime + RTT/2 - LocalTime
          const sampleOffset = payload.leaderTime + roundTrip / 2 - now;

          samples.push({ rtt: roundTrip, offset: sampleOffset });

          // If we need more samples, ping again immediately
          if (samples.length < SAMPLE_COUNT) {
            setTimeout(sendPing, 100); // Small delay to avoid congestion
          } else {
            // Process Final Result
            // Strategy: Sort by RTT (best quality first), take average of top 3 (or best 1)
            // "Best RTT" is usually the closest to truth (least jitter)
            samples.sort((a, b) => a.rtt - b.rtt);

            // Take average of the best 3 samples to smooth out
            const bestSamples = samples.slice(0, 3);
            const avgOffset =
              bestSamples.reduce((sum, s) => sum + s.offset, 0) /
              bestSamples.length;
            const avgRtt =
              bestSamples.reduce((sum, s) => sum + s.rtt, 0) /
              bestSamples.length;

            offset.value = avgOffset;
            rtt.value = avgRtt;

            console.log(
              "SYNC COMPLETE. Samples:",
              samples.map((s) => s.rtt),
              "Final Offset:",
              offset.value
            );
            samples = []; // Reset
          }
        }

        // Pass Commands
        if (
          role.value === "follower" &&
          onSyncCommand.value &&
          payload.type !== "ping" &&
          payload.type !== "pong"
        ) {
          onSyncCommand.value(payload, offset.value);

          // SMART SYNC: Auto-calibrate on "Change Song" or "Stop"
          // This ensures the clock is fresh before the next song starts,
          // without requiring manual buttons or constant polling.
          const isStop = payload.type === "metro" && payload.playing === false;
          const isSongChange = payload.type === "jump";

          if (isStop || isSongChange) {
            console.log(`Smart Sync: Triggered by event '${payload.type}'`);
            startSyncProcess();
          }
        }
      })
      .subscribe((state) => {
        if (state === "SUBSCRIBED" && selectedRole === "follower") {
          startSyncProcess();
        }
      });
  }

  function sendPing() {
    pingStart = Date.now();
    channel.send({
      type: "broadcast",
      event: "sync",
      payload: { type: "ping", from: myId },
    });
  }

  function startSyncProcess() {
    if (role.value !== "follower") return;
    samples = [];
    console.log("Starting Sync Burst...");
    sendPing();
  }

  // Automatic Re-Sync Loop
  let syncInterval = null;

  // Alias for UI
  function resync() {
    startSyncProcess();
  }

  function broadcast(payload) {
    if (role.value === "leader" && channel) {
      channel.send({
        type: "broadcast",
        event: "sync",
        payload,
      });
    }
  }

  // Watch role to start/stop loop
  // Since we are not inside a Vue component setup with watchers here easily without importing 'watch',
  // we can just hook into 'joinSession'.

  // We need to clear interval if we switch roles or re-join
  function clearSyncLoop() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }

  return {
    role,
    status,
    offset, // Exported for UI
    rtt, // Exported for UI
    joinSession: (r, roomId) => {
      clearSyncLoop();
      joinSession(r, roomId);
      if (r === "follower") {
        // Initial Sync Only
        startSyncProcess();
      }
    },
    resync, // Exported for UI
    broadcast,
    onSyncCommand,
    onPeerJoin, // Exported: callback for leader when follower pings
  };
}
