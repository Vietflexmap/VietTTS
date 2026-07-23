(() => {
  if (globalThis.__VIETTTS_CONTENT_LOADED__) return;
  globalThis.__VIETTTS_CONTENT_LOADED__ = true;
  const api = globalThis.browser || globalThis.chrome;

  api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "VIETTTS_ACTION") return false;
    const options = Object.assign({ lang: "vi-VN" }, message.options || {});
    let task;
    if (message.action === "selection") task = VietTTS.readSelection(options);
    else if (message.action === "page") task = VietTTS.readPage(options);
    else if (message.action === "toggle") task = Promise.resolve({ toggled: VietTTS.toggle() });
    else if (message.action === "stop") task = Promise.resolve({ stopped: VietTTS.cancel() });
    else task = Promise.reject(new Error("Hành động không hợp lệ."));

    task.then((result) => sendResponse({ ok: true, result })).catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  });
})();
