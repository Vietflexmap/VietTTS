const api = globalThis.browser || globalThis.chrome;

const MENUS = [
  { id: "viettts-selection", title: "VietTTS: Đọc phần đã chọn", contexts: ["selection"] },
  { id: "viettts-page", title: "VietTTS: Đọc nội dung trang", contexts: ["page"] },
  { id: "viettts-stop", title: "VietTTS: Dừng đọc", contexts: ["page", "selection"] }
];

function call(method, context, ...args) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const callback = (result) => {
      settled = true;
      const error = globalThis.chrome?.runtime?.lastError;
      error ? reject(new Error(error.message)) : resolve(result);
    };
    try {
      const result = method.apply(context, [...args, callback]);
      if (result && typeof result.then === "function") result.then(resolve, reject);
      else if (method.length < args.length + 1 && !settled) resolve(result);
    } catch (error) { reject(error); }
  });
}

async function inject(tabId) {
  try {
    await call(api.scripting.executeScript, api.scripting, { target: { tabId }, files: ["lib/viettts.js", "content.js"] });
  } catch (error) {
    if (!String(error.message).includes("already")) throw error;
  }
}

async function send(tabId, message) {
  try { return await call(api.tabs.sendMessage, api.tabs, tabId, message); }
  catch (_) { await inject(tabId); return call(api.tabs.sendMessage, api.tabs, tabId, message); }
}

async function currentTab() {
  const tabs = await call(api.tabs.query, api.tabs, { active: true, currentWindow: true });
  return tabs && tabs[0];
}

async function perform(action, tabId, extra) {
  const id = tabId || (await currentTab())?.id;
  if (!id) throw new Error("Không tìm thấy tab đang hoạt động.");
  const settings = await call(api.storage.local.get, api.storage.local, ["rate", "pitch", "voice"]);
  return send(id, { type: "VIETTTS_ACTION", action, options: Object.assign({}, settings, extra || {}) });
}

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.removeAll(() => MENUS.forEach((menu) => api.contextMenus.create(menu)));
});

api.contextMenus.onClicked.addListener((info, tab) => {
  const actions = { "viettts-selection": "selection", "viettts-page": "page", "viettts-stop": "stop" };
  const action = actions[info.menuItemId];
  if (action && tab?.id) perform(action, tab.id).catch(console.error);
});

api.commands?.onCommand.addListener((command) => {
  const actions = { "read-selection": "selection", "read-page": "page", "toggle-playback": "toggle", "stop-playback": "stop" };
  if (actions[command]) perform(actions[command]).catch(console.error);
});

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "VIETTTS_EXTENSION_ACTION") return false;
  perform(message.action, null, message.options)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
