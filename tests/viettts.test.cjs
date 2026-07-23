const assert = require("node:assert/strict");
const test = require("node:test");
const VietTTS = require("../dist/viettts.min.js");

function environment(voices) {
  class Utterance {
    constructor(text) {
      this.text = text;
      this.voice = null;
    }
  }
  const spoken = [];
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => voices,
    addEventListener: () => {},
    cancel: () => {},
    pause: () => { synth.paused = true; },
    resume: () => { synth.paused = false; },
    speak: (utterance) => {
      spoken.push(utterance);
      queueMicrotask(() => {
        utterance.onstart?.();
        utterance.onend?.();
      });
    }
  };
  return {
    spoken,
    api: VietTTS.create({
      speechSynthesis: synth,
      SpeechSynthesisUtterance: Utterance,
      navigator: { userAgent: "Mozilla/5.0 Chrome/150.0.0.0" }
    })
  };
}

test("system mode is default and reads with a Vietnamese system voice", async () => {
  const regular = { name: "Vietnamese System", lang: "vi-VN", localService: true, default: true };
  const microsoft = { name: "Microsoft HoaiMy", lang: "vi-VN", voiceURI: "Microsoft HoaiMy" };
  const { api, spoken } = environment([regular, microsoft]);
  const result = await api.speak("Xin chào Việt Nam");
  assert.equal(result.mode, "system");
  assert.equal(spoken[0].voice.name, "Vietnamese System");
});

test("Microsoft mode is opt-in and selects only a Microsoft vi-VN voice", async () => {
  const regular = { name: "Vietnamese System", lang: "vi-VN", localService: true };
  const microsoft = { name: "Microsoft NamMinh", lang: "vi-VN", voiceURI: "Microsoft NamMinh" };
  const { api, spoken } = environment([regular, microsoft]);
  const result = await api.speak("Xin chào", { mode: "microsoft" });
  assert.equal(result.mode, "microsoft");
  assert.equal(spoken[0].voice.name, "Microsoft NamMinh");
  assert.deepEqual(api.getVoices({ lang: "vi", mode: "microsoft" }).map((voice) => voice.name), [
    "Microsoft NamMinh"
  ]);
});

test("Microsoft mode fails clearly instead of silently falling back", async () => {
  const { api } = environment([{ name: "Vietnamese System", lang: "vi-VN" }]);
  await assert.rejects(
    api.speak("Xin chào", { mode: "microsoft" }),
    (error) => error.code === "VIETTTS_MICROSOFT_VOICE_MISSING"
  );
});

test("system mode never silently selects a Microsoft voice", async () => {
  const { api } = environment([
    { name: "Microsoft HoaiMy", lang: "vi-VN", voiceURI: "Microsoft HoaiMy" }
  ]);
  assert.deepEqual(api.getVoices({ lang: "vi", mode: "system" }), []);
  await assert.rejects(
    api.speak("Xin chào"),
    (error) => error.code === "VIETTTS_SYSTEM_VOICE_MISSING"
  );
});
