const api = globalThis.browser || globalThis.chrome;
const usesPromiseApi = typeof globalThis.browser !== "undefined" && globalThis.browser !== globalThis.chrome;

const MENUS = [
  { id: "viettts-selection", title: "VietTTS: Đọc phần đã chọn", contexts: ["selection"] },
  { id: "viettts-page", title: "VietTTS: Đọc nội dung trang", contexts: ["page"] },
  { id: "viettts-stop", title: "VietTTS: Dừng đọc", contexts: ["page", "selection"] }
];

function call(method, context, ...args) {
  if (usesPromiseApi) {
    try {
      return Promise.resolve(method.apply(context, args));
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return new Promise((resolve, reject) => {
    const callback = (result) => {
      const error = globalThis.chrome?.runtime?.lastError;
      error ? reject(new Error(error.message)) : resolve(result);
    };
    try {
      method.apply(context, [...args, callback]);
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
  let response;
  try {
    response = await call(api.tabs.sendMessage, api.tabs, tabId, message);
  } catch (_) {
    await inject(tabId);
    response = await call(api.tabs.sendMessage, api.tabs, tabId, message);
  }
  if (!response) throw new Error("Content script không trả lời. Hãy tải lại trang và thử lại.");
  if (response.ok === false) throw new Error(response.error || "Không thể phát giọng nói.");
  return response.result;
}

async function currentTab() {
  const tabs = await call(api.tabs.query, api.tabs, { active: true, currentWindow: true });
  return tabs && tabs[0];
}

async function perform(action, tabId, extra) {
  const id = tabId || (await currentTab())?.id;
  if (!id) throw new Error("Không tìm thấy tab đang hoạt động.");
  const settings = await call(api.storage.local.get, api.storage.local, ["rate", "pitch", "voice", "mode"]);
  return send(id, { type: "VIETTTS_ACTION", action, options: Object.assign({}, settings, extra || {}) });
}

api.runtime.onInstalled.addListener(() => {
  call(api.contextMenus.removeAll, api.contextMenus)
    .then(() => MENUS.forEach((menu) => api.contextMenus.create(menu)))
    .catch(console.error);
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
