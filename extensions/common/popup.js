const api = globalThis.browser || globalThis.chrome;
const rate = document.querySelector("#rate");
const pitch = document.querySelector("#pitch");
const mode = document.querySelector("#mode");
const status = document.querySelector("#status");

const usesPromiseApi = typeof globalThis.browser !== "undefined" && globalThis.browser !== globalThis.chrome;
function call(method, context, ...args) {
  if (usesPromiseApi) {
    try { return Promise.resolve(method.apply(context, args)); }
    catch (error) { return Promise.reject(error); }
  }
  return new Promise((resolve, reject) => {
    const callback = (result) => {
      const error = globalThis.chrome?.runtime?.lastError;
      error ? reject(new Error(error.message)) : resolve(result);
    };
    try { method.apply(context, [...args, callback]); }
    catch (error) { reject(error); }
  });
}

async function load() {
  const saved = await call(api.storage.local.get, api.storage.local, ["rate", "pitch", "mode"]);
  rate.value = saved.rate || 1;
  pitch.value = saved.pitch || 1;
  mode.value = saved.mode === "microsoft" ? "microsoft" : "system";
  updateOutputs();
}
function updateOutputs() { document.querySelector("#rateOut").value = Number(rate.value).toFixed(1); document.querySelector("#pitchOut").value = Number(pitch.value).toFixed(1); }
async function save() {
  updateOutputs();
  await call(api.storage.local.set, api.storage.local, {
    rate: Number(rate.value),
    pitch: Number(pitch.value),
    mode: mode.value
  });
  status.textContent = mode.value === "microsoft"
    ? "Microsoft Voice đã bật. Chỉ giọng Microsoft tiếng Việt được sử dụng."
    : "Đang dùng giọng hệ thống tiếng Việt.";
}
rate.addEventListener("input", save); pitch.addEventListener("input", save);
mode.addEventListener("change", save);
document.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", async () => {
  status.textContent = "Đang xử lý…";
  try {
    const response = await call(api.runtime.sendMessage, api.runtime, {
      type: "VIETTTS_EXTENSION_ACTION",
      action: button.dataset.action,
      options: {
        rate: Number(rate.value),
        pitch: Number(pitch.value),
        lang: "vi-VN",
        mode: mode.value
      }
    });
    status.textContent = response?.ok ? "Đã gửi lệnh đọc." : response?.error || "Không thể thực hiện.";
  } catch (error) { status.textContent = error.message; }
}));
load().catch((error) => status.textContent = error.message);
