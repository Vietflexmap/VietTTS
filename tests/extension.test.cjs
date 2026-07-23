const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("Chrome callback failure injects content script and retries the message", async () => {
  let messageCalls = 0;
  let injected = 0;
  let runtimeListener;
  const chrome = {
    runtime: {
      lastError: null,
      onInstalled: { addListener() {} },
      onMessage: { addListener(listener) { runtimeListener = listener; } }
    },
    contextMenus: {
      removeAll(callback) { callback(); },
      create() {},
      onClicked: { addListener() {} }
    },
    commands: { onCommand: { addListener() {} } },
    storage: {
      local: {
        get(_keys, callback) { callback({ mode: "system", rate: 1, pitch: 1 }); }
      }
    },
    tabs: {
      query(_query, callback) { callback([{ id: 7 }]); },
      sendMessage(_tabId, _message, callback) {
        messageCalls += 1;
        if (messageCalls === 1) {
          chrome.runtime.lastError = { message: "Receiving end does not exist." };
          callback();
          chrome.runtime.lastError = null;
          return;
        }
        callback({ ok: true, result: { voice: "ok" } });
      }
    },
    scripting: {
      executeScript(_details, callback) {
        injected += 1;
        callback([]);
      }
    }
  };
  const source = readFileSync(join(__dirname, "../extensions/common/background.js"), "utf8");
  const context = vm.createContext({ chrome, console });
  vm.runInContext(source, context);

  const response = await new Promise((resolve) => {
    runtimeListener(
      { type: "VIETTTS_EXTENSION_ACTION", action: "page", options: {} },
      {},
      resolve
    );
  });
  assert.equal(response.ok, true);
  assert.equal(injected, 1);
  assert.equal(messageCalls, 2);
});
