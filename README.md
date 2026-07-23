# 🇻🇳 VietTTS

**Công cụ Text-to-Speech tiếng Việt cho website, Microsoft Edge, Google Chrome và Mozilla Firefox.**
Mã nguồn mở MIT, phát triển bởi **Long Ngo**.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VietTTS 1.2.0](https://img.shields.io/badge/VietTTS-1.2.0-b91c1c.svg)](package.json)
[![jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js)
[![Microsoft Edge recommended](https://img.shields.io/badge/recommended-Microsoft_Edge-0C59A4?logo=microsoftedge&logoColor=white)](#trình-duyệt-khuyến-nghị)
[![Chrome](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)](extensions/manifests/manifest.chrome.json)
[![Firefox](https://img.shields.io/badge/Firefox-WebExtensions-FF7139?logo=firefoxbrowser&logoColor=white)](extensions/manifests/manifest.firefox.json)

## Trình duyệt khuyến nghị

> **Nên dùng Microsoft Edge trên Windows 10/11 khi nhúng VietTTS qua `cdn.jsdelivr.net`.**

Microsoft Edge thường tích hợp ổn định hơn với hệ thống giọng nói của Windows và các voice tiếng Việt đã cài trên máy. Chrome và Firefox vẫn được hỗ trợ, nhưng danh sách voice, chính sách tự động phát âm thanh và khả năng công bố voice `vi-VN` có thể khác nhau tùy phiên bản trình duyệt, hệ điều hành và gói ngôn ngữ.

VietTTS không mang sẵn tệp âm thanh hoặc mô hình giọng nói. SDK gọi **Web Speech API** và sử dụng voice mà trình duyệt/hệ điều hành đang cung cấp.

## Dùng thử tool HTML hoàn chỉnh

- [Xem mã nguồn tool HTML](examples/VietTTS-jsDelivr-Tool-1.2.0.html)
- [Mở tool qua jsDelivr](https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/examples/VietTTS-jsDelivr-Tool-1.2.0.html)
- [Tải trực tiếp tool HTML](https://raw.githubusercontent.com/Vietflexmap/VietTTS/main/examples/VietTTS-jsDelivr-Tool-1.2.0.html)

Tool có sẵn:

- nhập văn bản tiếng Việt;
- tự động tải danh sách voice `vi-VN`;
- lựa chọn voice cụ thể;
- chỉnh tốc độ, cao độ và âm lượng;
- đọc, tạm dừng, tiếp tục và dừng;
- đếm ký tự và hiển thị lỗi bằng tiếng Việt.

## Nhúng nhanh bằng jsDelivr

```html
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>VietTTS Demo</title>
  <script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js"></script>
</head>
<body>
  <textarea id="noiDung">Xin chào Việt Nam!</textarea>
  <button id="docVanBan" type="button">🔊 Đọc tiếng Việt</button>
  <button id="dungDoc" type="button">⏹ Dừng</button>
  <p id="trangThai" role="status"></p>

  <script>
    const noiDung = document.getElementById("noiDung");
    const trangThai = document.getElementById("trangThai");

    VietTTS.warmup();
    VietTTS.loadVoices(2500);

    document.getElementById("docVanBan").addEventListener("click", async () => {
      try {
        trangThai.textContent = "Đang đọc...";

        // Gọi speak trực tiếp trong sự kiện click của người dùng.
        await VietTTS.speak(noiDung.value, {
          lang: "vi-VN",
          rate: 1,
          pitch: 1,
          volume: 1,
          maxChunkLength: 220
        });

        trangThai.textContent = "Đã đọc xong.";
      } catch (error) {
        trangThai.textContent = `${error.code || "VIETTTS_ERROR"}: ${error.message}`;
      }
    });

    document.getElementById("dungDoc").addEventListener("click", () => {
      VietTTS.cancel();
      trangThai.textContent = "Đã dừng.";
    });
  </script>
</body>
</html>
```

### Quy tắc quan trọng

1. Gọi `VietTTS.speak()` trực tiếp bên trong sự kiện `click`, `pointerdown` hoặc thao tác thật của người dùng.
2. Nạp voice trước bằng `VietTTS.warmup()` và `VietTTS.loadVoices()`.
3. Trong cấu hình phổ thông, nên để SDK tự chọn voice; không cần truyền `mode`.
4. Không tự động phát ngay khi trang vừa tải vì trình duyệt có thể chặn âm thanh.
5. Trang phải có kết nối Internet để tải SDK từ jsDelivr.

## URL CDN

Theo nhánh chính:

```text
https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js
```

Nhúng:

```html
<script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js"></script>
```

`@main` nhận bản mới sau mỗi lần cập nhật nhánh `main`, nhưng có thể chịu cache CDN trong thời gian ngắn. Với hệ thống sản xuất cần phiên bản bất biến, hãy thay `@main` bằng tag hoặc commit SHA:

```html
<script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@COMMIT_SHA/dist/viettts.min.js"></script>
```

## API chính

### Đọc văn bản

```js
const result = await VietTTS.speak("Nội dung tiếng Việt", {
  lang: "vi-VN",
  voice: "",
  rate: 1,
  pitch: 1,
  volume: 1,
  maxChunkLength: 220
});
```

### Danh sách voice tiếng Việt

```js
await VietTTS.loadVoices(2500);
const voices = VietTTS.getVoices({ lang: "vi" });
console.table(voices);
```

### Điều khiển

```js
VietTTS.pause();
VietTTS.resume();
VietTTS.cancel();
```

### Đọc phần được chọn hoặc nội dung trang

```js
VietTTS.readSelection({ lang: "vi-VN" });
VietTTS.readPage({ lang: "vi-VN", selector: "article" });
```

### Chẩn đoán

```js
console.log(VietTTS.supported());
console.table(VietTTS.getVoices({ lang: "vi" }));
console.log(VietTTS.diagnose());
```

## Web Component

```html
<script src="https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js"></script>

<article id="bai-viet">
  Đây là nội dung tiếng Việt cần đọc.
</article>

<viet-tts-button
  target="#bai-viet"
  label="🔊 Đọc nội dung">
</viet-tts-button>

<script>
  VietTTS.defineElement();
</script>
```

Hoặc gắn vào nút HTML:

```html
<article id="bai-viet">Nội dung...</article>
<button data-viettts data-viettts-target="#bai-viet">Đọc bài viết</button>
<script>VietTTS.mountAll();</script>
```

## Khắc phục sự cố

### Bấm nút nhưng không có âm thanh

1. Thử bằng **Microsoft Edge**.
2. Kiểm tra âm lượng Windows và thiết bị phát mặc định.
3. Mở `edge://settings/content/mediaAutoplay` và kiểm tra chính sách tự động phát.
4. Bảo đảm `VietTTS.speak()` được gọi từ thao tác bấm thật.
5. Tải lại trang sau khi cài thêm voice.

### Không tìm thấy voice `vi-VN`

Trên Windows 10/11:

1. Mở **Settings**.
2. Vào **Time & language → Language & region**.
3. Thêm **Vietnamese / Tiếng Việt**.
4. Cài thành phần **Speech** nếu Windows cung cấp.
5. Khởi động lại trình duyệt.

Sau đó kiểm tra:

```js
await VietTTS.loadVoices(3000);
console.table(VietTTS.getVoices({ lang: "vi" }));
```

### CDN không tải được

Mở trực tiếp URL sau:

```text
https://cdn.jsdelivr.net/gh/Vietflexmap/VietTTS@main/dist/viettts.min.js
```

Nếu URL không mở, kiểm tra Internet, DNS, tường lửa hoặc tiện ích chặn nội dung. Không tải SDK bằng `file://` từ một đường dẫn CDN đã bị chặn bởi chính sách mạng nội bộ.

### Firefox hoặc Chrome không đọc trong khi Edge đọc được

Đây thường là khác biệt về voice mà trình duyệt công bố, không nhất thiết là lỗi CDN. Hãy thử:

- cập nhật trình duyệt;
- tải lại trang sau một thao tác bấm;
- kiểm tra `VietTTS.diagnose()`;
- để trống trường `voice`;
- dùng Microsoft Edge trên Windows nếu cần độ ổn định cao hơn.

## Browser Extension

Build đồng thời Chrome, Edge và Firefox:

```bash
git clone https://github.com/Vietflexmap/VietTTS.git
cd VietTTS
npm run build
npm test
npm run check
```

Kết quả:

```text
build/chrome/
build/edge/
build/firefox/
```

### Cài Microsoft Edge

1. Mở `edge://extensions/`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `build/edge`.

### Cài Google Chrome

1. Mở `chrome://extensions/`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục `build/chrome`.

### Cài Firefox tạm thời

1. Mở `about:debugging#/runtime/this-firefox`.
2. Chọn **Load Temporary Add-on**.
3. Chọn `build/firefox/manifest.json`.

Firefox yêu cầu add-on được ký để cài cố định trên bản phát hành chính thức.

## Cấu trúc repository

```text
dist/viettts.min.js
examples/VietTTS-jsDelivr-Tool-1.2.0.html
examples/cross-browser.html
extensions/common/
extensions/manifests/
scripts/
tests/
```

## Bảo mật và quyền riêng tư

- Không gửi telemetry.
- Không dùng `eval`.
- Không lưu văn bản người dùng nhập.
- SDK CDN không thể tự cài voice hoặc thay đổi cấu hình hệ điều hành.
- Bản extension đóng gói JavaScript cục bộ, không thực thi mã CDN từ xa.
- Nội dung đọc được chuyển tới engine TTS do trình duyệt/hệ điều hành cung cấp; voice trực tuyến có thể tuân theo chính sách riêng của nhà cung cấp.

## Kiểm thử

```bash
npm run build
npm test
npm run check
```

`npm run check` xác nhận ba bản extension dùng chung lõi VietTTS có checksum giống nhau.

## Giấy phép

MIT License — © 2026 Long Ngo. Xem [LICENSE](LICENSE) và [NOTICE.md](NOTICE.md).
