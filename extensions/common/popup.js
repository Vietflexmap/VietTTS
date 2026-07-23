const api = globalThis.browser || globalThis.chrome;
const rate = document.querySelector("#rate");
const pitch = document.querySelector("#pitch");
const status = document.querySelector("#status");

function call(method, context, ...args) { return new Promise((resolve, reject) => { const callback = (result) => { const error = globalThis.chrome?.runtime?.lastError; error ? reject(new Error(error.message)) : resolve(result); }; try { const result = method.apply(context, [...args, callback]); if (result && typeof result.then === "function") result.then(resolve, reject); } catch (error) { reject(error); } }); }

async function load() {
  const saved = await call(api.storage.local.get, api.storage.local, ["rate", "pitch"]);
  rate.value = saved.rate || 1; pitch.value = saved.pitch || 1; updateOutputs();
}
function updateOutputs() { document.querySelector("#rateOut").value = Number(rate.value).toFixed(1); document.querySelector("#pitchOut").value = Number(pitch.value).toFixed(1); }
async function save() { updateOutputs(); await call(api.storage.local.set, api.storage.local, { rate: Number(rate.value), pitch: Number(pitch.value) }); }
rate.addEventListener("input", save); pitch.addEventListener("input", save);
document.querySelectorAll("button[data-action]").forEach((button) => button.addEventListener("click", async () => { status.textContent = "Đang xử lý…"; try { const response = await call(api.runtime.sendMessage, api.runtime, { type: "VIETTTS_EXTENSION_ACTION", action: button.dataset.action, options: { rate: Number(rate.value), pitch: Number(pitch.value), lang: "vi-VN" } }); status.textContent = response?.ok ? "Đã gửi lệnh." : response?.error || "Không thể thực hiện."; } catch (error) { status.textContent = error.message; } }));
load().catch((error) => status.textContent = error.message);
