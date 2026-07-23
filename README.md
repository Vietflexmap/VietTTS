# 🇻🇳 VietTTS

**TTS tiếng Việt cho website và ba trình duyệt Chrome, Firefox, Microsoft Edge.**  
Mã nguồn mở MIT, phát triển bởi **Long Ngo**.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![No runtime dependencies](https://img.shields.io/badge/runtime_dependencies-0-blue.svg)](package.json)
[![Chrome](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)](extensions/manifests/manifest.chrome.json)
[![Firefox](https://img.shields.io/badge/Firefox-WebExtensions-FF7139?logo=firefoxbrowser&logoColor=white)](extensions/manifests/manifest.firefox.json)
[![Edge](https://img.shields.io/badge/Edge-MV3-0C59A4?logo=microsoftedge&logoColor=white)](extensions/manifests/manifest.edge.json)

## Điểm chính

- SDK JavaScript nhúng bằng **jsDelivr**, không cần framework.
- Dùng Web Speech API chuẩn, ưu tiên giọng `vi-VN` có trên thiết bị.
- Đọc văn bản, vùng được chọn hoặc nội dung chính của trang.
- Điều chỉnh tốc độ, cao độ, âm lượng và tên giọng.
- Web Component `<viet-tts-button>` và API JavaScript `VietTTS.speak()`.
- Bản mở rộng riêng cho Chrome, Firefox và Microsoft Edge.
- Không gửi telemetry, không dùng `eval`, không lưu nội dung cần đọc.
- **0 runtime dependency**; không cần chạy `npm install`.

## Nhúng qua jsDelivr

Dùng phiên bản cố định trong môi trường thật:

```html
<script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@v1.0.0/dist/viettts.min.js"></script>
<script>
  document.querySelector('#doc').addEventListener('click', () => {
    VietTTS.speak('Xin chào Việt Nam!', { lang: 'vi-VN', rate: 1 });
  });
</script>
```

Hoặc dùng Web Component:

```html
<script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@v1.0.0/dist/viettts.min.js"></script>

<p id="noi-dung">Đây là văn bản tiếng Việt cần được đọc.</p>
<viet-tts-button target="#noi-dung" label="🔊 Đọc nội dung"></viet-tts-button>

<script>VietTTS.defineElement();</script>
```

> Không dùng `@main` cho hệ thống sản xuất. jsDelivr lưu cache branch; tag SemVer như `@v1.0.0` giúp bản nhúng bất biến và dễ kiểm soát.

## API

```js
await VietTTS.speak('Nội dung cần đọc', {
  lang: 'vi-VN',
  voice: '',       // tên voice; để trống sẽ tự chọn voice tiếng Việt tốt nhất
  rate: 1,         // 0.1–10
  pitch: 1,        // 0–2
  volume: 1,       // 0–1
  maxChunkLength: 220
});

VietTTS.pause();
VietTTS.resume();
VietTTS.cancel();
VietTTS.readSelection();
VietTTS.readPage({ selector: 'article' });
console.table(VietTTS.getVoices({ lang: 'vi' }));
```

Gắn vào nút HTML có sẵn:

```html
<article id="bai-viet">...</article>
<button data-viettts data-viettts-target="#bai-viet">Đọc bài viết</button>
<script>VietTTS.mountAll();</script>
```

## Cài bản mở rộng trên Windows 10

Dự án không cần `npm install`:

```bat
git clone https://github.com/Vietflexmap/VietTTS.git
cd VietTTS
npm run build
npm test
```

### Chrome

1. Mở `chrome://extensions/`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `build/chrome`.

### Microsoft Edge

1. Mở `edge://extensions/`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `build/edge`.

### Firefox

1. Mở `about:debugging#/runtime/this-firefox`.
2. Chọn **Load Temporary Add-on**.
3. Chọn `build/firefox/manifest.json`.

Firefox yêu cầu ký add-on để cài cố định trên bản phát hành chính thức.

## Build

```bash
npm run build
npm test
npm run check
```

Kết quả:

```text
dist/viettts.js
dist/viettts.min.js
dist/viettts.esm.js
build/chrome/
build/firefox/
build/edge/
```

## Tương thích thực tế

`speechSynthesis` có mặt trên Chrome, Firefox và Edge hiện đại. Tuy nhiên, **danh sách giọng phụ thuộc trình duyệt và hệ điều hành**. Trên Windows 10, hãy cài gói giọng nói tiếng Việt trong phần Language/Speech nếu `VietTTS.getVoices({lang:'vi'})` trả về danh sách rỗng.

SDK CDN chỉ phân phối JavaScript. Nó không thể tự cài voice hệ thống và không thể bảo đảm cùng một giọng trên mọi thiết bị.

## Quy tắc bảo mật

- Bản extension chỉ thực thi mã đóng gói cục bộ; không tải mã thực thi từ CDN.
- Quyền tối thiểu: `activeTab`, `scripting`, `contextMenus`, `storage`.
- Không có host permission thường trực trên mọi website.
- Nội dung được chuyển cho engine TTS do trình duyệt/hệ điều hành cung cấp. Kiểm tra chính sách của voice đang sử dụng nếu đó là voice trực tuyến.

## Giấy phép

MIT License — © 2026 Long Ngo. Xem [LICENSE](LICENSE) và [NOTICE.md](NOTICE.md).
