---
# Cấu hình chung cho toàn bộ slides
theme: seriph
background: https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170
title: "Giới thiệu HTML - CSS - JavaScript"
info: |
  ## Bài học Tin học 11
  Nhập môn Lập trình Web dành cho học sinh Trung học Phổ thông Việt Nam.
class: "text-center"
# Bật tính năng vẽ
drawings:
  persist: false
# Hiệu ứng chuyển slide mặc định
transition: slide-left
# Bật các thành phần MDC (Markdown Components)
mdc: true
---

# Nhập môn Lập Trình Web

**HTML • CSS • JavaScript**

<div class="abs-br m-6">
Lớp 11 - Bộ môn Tin học
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
transition: fade-out
---

# Mục tiêu bài học

Hôm nay chúng ta sẽ tìm hiểu:

<v-clicks>

- **HTML** là gì? (Bộ xương của trang web)
- **CSS** dùng để làm gì? (Lớp da và quần áo)
- **JavaScript** (JS) là gì? (Bộ não và cơ bắp)
- Làm thế nào cả 3 kết hợp với nhau?

</v-clicks>

---

# Mục lục

<Toc maxDepth="2" />

::right::

<div class="prose">
  <h2>Cấu trúc bài học</h2>
  <ol>
    <li>HTML - Ngôn ngữ đánh dấu</li>
    <li>CSS - Thêm phong cách</li>
    <li>JS - Thêm tương tác</li>
    <li>Animation (Hiệu ứng)</li>
    <li>Tổng kết & Thực hành</li>
  </ol>
  <img src="https://i.imgur.com/nNjs42s.png" class="mt-4 rounded shadow" alt="Biểu tượng HTML, CSS, JS">
</div>

---

# 1. HTML là gì?

<v-clicks>

- Viết tắt của **H**yper**T**ext **M**arkup **L**anguage (Ngôn ngữ Đánh dấu Siêu văn bản).
- Dùng để **xây dựng cấu trúc** và **nội dung** cho trang web.
- Giống như "khung xương" của một ngôi nhà.
- Sử dụng các **thẻ (tags)** để định nghĩa các thành phần.

</v-clicks>

<div class="grid grid-cols-2 gap-4 mt-4">

<div v-click="4">
<b>Ví dụ code HTML:</b>
```html
<h1>Chào các em!</h1>

<p>Đây là bài học về web.</p>

<img src="logo.png" />
```

</div>

<div v-click="5" class="prose p-4 rounded bg-white bg-opacity-20">
<b>Kết quả hiển thị:</b>
<h1>Chào các em!</h1>
<p>Đây là bài học về web.</p>
</div>

</div>

---

# 2\. CSS là gì?

<v-clicks>

- Viết tắt của **C**ascading **S**tyle **S**heets (Các tấm mẫu định dạng tầng).
- Dùng để **trang trí** và **làm đẹp** cho HTML.
- Giống như "sơn, đồ nội thất, quần áo" cho ngôi nhà.
- Quyết định màu sắc, font chữ, bố cục...

</v-clicks>

<div class="grid grid-cols-2 gap-4 mt-4">

<div v-click="4">
<b>Ví dụ code CSS:</b>

```css
/* Chọn thẻ h1 và đổi màu */
h1 {
  color: blue;
  font-size: 30px;
}

/\* Chọn thẻ p và đổi font \*/ p {
  color: green;
  font-family: Arial;
}
```

</div>

<div v-click="5" class="prose p-4 rounded bg-white bg-opacity-20">
  <b>Kết quả hiển thị:</b>
  <h1 style="color: blue; font-size: 30px; margin: 0;">Chào các em!</h1>
  <p style="color: green; font-family: Arial; margin: 0;">Đây là bài học về web.</p>
</div>

</div>

---

# 3\. JavaScript (JS) là gì?

<v-clicks>

- Là một **ngôn ngữ lập trình** thực thụ.
- Dùng để tạo ra **sự tương tác** và **logic** trên trang web.
- Giống như "hệ thống điện, cửa tự động, công tắc" trong ngôi nhà.
- Xử lý khi người dùng nhấn nút, kiểm tra dữ liệu, thay đổi nội dung...

</v-clicks>

<div class="grid grid-cols-2 gap-4 mt-4">

<div v-click="4">
<b>Ví dụ code JS (kết hợp HTML):</b>
```html
<button id="myButton">
  Bấm vào em!
</button>

<script>
  // Tìm cái nút
  let nut = document.getElementById("myButton");
  
  // Khi người dùng bấm vào nút
  nut.onclick = function() {
    // Hiện một thông báo
    alert("Bạn đã bấm vào nút!");
  };
</script>

```

</div>

<div v-click="5" class="prose p-4 rounded bg-white bg-opacity-20">
  <b>Kết quả tương tác:</b>
  <p>Thử bấm vào nút bên dưới:</p>
  <button
    class="px-4 py-2 rounded bg-blue-500 text-white"
    onclick="alert('Bạn đã bấm vào nút!')"
  >
    Bấm vào em!
  </button>
</div>

</div>

-----

# Chúng hoạt động cùng nhau


<div class="grid grid-cols-3 gap-8 mt-8">
  <div class="p-4 rounded bg-gray-700 bg-opacity-50" v-click>
    <h3 class="text-2xl">HTML</h3>
    <p>Cấu trúc (Danh từ)</p>
    <code class="text-lg">&lt;button&gt;Nút bấm&lt;/button&gt;</code>
  </div>
  <div class="p-4 rounded bg-gray-700 bg-opacity-50" v-click>
    <h3 class="text-2xl">CSS</h3>
    <p>Trang trí (Tính từ)</p>
    <code class="text-sm">button { background: red; }</code>
  </div>
  <div class="p-4 rounded bg-gray-700 bg-opacity-50" v-click>
    <h3 class="text-2xl">JavaScript</h3>
    <p>Hành động (Động từ)</p>
    <code class="text-sm">button.onclick = ...</code>
  </div>
</div>

<img v-click src="https://media.giphy.com/media/l4pT0Kx4m2dKE5I4w/giphy.gif" class="mt-8 rounded-lg shadow-lg" alt="HTML CSS JS combine meme">

-----

# 4\. Animation (Hiệu ứng)

Chúng ta có thể tạo hiệu ứng chuyển động đơn giản chỉ bằng CSS\!

<div class="grid grid-cols-2 gap-8 items-center">

<div>
<b>Code CSS Animation:</b>
```css
/* Tạo một khối hộp */
.box {
  width: 100px;
  height: 100px;
  background: crimson;
  border-radius: 10px;

/\* Áp dụng animation \*/
animation: spin 3s infinite linear;
}

/\* Định nghĩa animation tên 'spin' \*/
@keyframes spin {
from {
transform: rotate(0deg);
}
to {
transform: rotate(360deg);
}
}

```

</div>

<div class="flex justify-center items-center h-60">
  <div 
    style="width: 100px; height: 100px; background: crimson; border-radius: 10px; animation: spin 3s infinite linear;"
  ></div>

  <style>
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>

</div>

</div>

---

# Tóm tắt

<div class="grid grid-cols-3 gap-4 mt-8 text-2xl">
  <div v-click>
    <div class="text-8xl">🦴</div>
    <b>HTML</b>
    <p>Cấu trúc</p>
  </div>
  <div v-click>
    <div class="text-8xl">🎨</div>
    <b>CSS</b>
    <p>Vẻ ngoài</p>
  </div>
  <div v-click>
    <div class="text-8xl">⚡️</div>
    <b>JavaScript</b>
    <p>Tương tác</p>
  </div>
</div>

---

# Bài tập thực hành nhỏ 🧠

**Thử thách:** Tạo một file `index.html` đơn giản.

1.  Mở Notepad (hoặc bất kỳ trình soạn thảo văn bản nào).
2.  Copy và dán đoạn code bên dưới vào.
3.  Lưu file với tên `index.html` (chọn "Save as type: All Files").
4.  Mở file đó bằng trình duyệt (Chrome, Firefox...).

<!-- end list -->

```html
<html>
  <head>
    <title>Trang Web Đầu Tiên</title>
    <style>
      /* Đây là CSS */
      body {
        font-family: Arial;
        text-align: center;
      }
      h1 {
        color: teal;
      }
      .my-box {
        background: yellow;
        padding: 20px;
        border: 2px solid black;
      }
    </style>
  </head>
  <body>
    <h1>Chào mừng đến lớp Tin học 11!</h1>

    <div class="my-box">
      <p>Đây là HTML và CSS đầu tiên của em.</p>
      <button onclick="alert('Tuyệt vời!')">Bấm em đi!</button>
    </div>

    <script>
      console.log("Trang web đã tải xong!");
    </script>
  </body>
</html>
```

---

# Câu hỏi?

Cảm ơn các em đã lắng nghe\!
