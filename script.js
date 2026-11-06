// --- إعدادات نظام توليد الـ QR المطور (qr-code-styling) ---
let currentLogoData = null;
const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "svg",
    data: "https://google.com",
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", hideBackgroundDots: true, imageSize: 0.4, margin: 5 }
});

// دمج الرمز داخل الحاوية في الصفحة
const canvasContainer = document.getElementById("canvas-container");
qrCode.append(canvasContainer);

// --- التحكم في تبديل الواجهات (Tabs) ---
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
let activeTab = "url";

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        
        btn.classList.add("active");
        activeTab = btn.getAttribute("data-tab");
        document.getElementById(`tab-${activeTab}`).classList.add("active");
        generateLiveQR(); // إعادة التحديث الفوري بناءً على التبويب الجديد
    });
});

// --- آلية التجميع والتوليد الفوري والمباشر (Live Generation) ---
function generateLiveQR() {
    let rawData = "";

    if (activeTab === "url") {
        rawData = document.getElementById("input-url").value.trim() || "https://google.com";
    } else if (activeTab === "text") {
        rawData = document.getElementById("input-text").value.trim() || "ستوديو الـ QR";
    } else if (activeTab === "wifi") {
        const ssid = document.getElementById("wifi-ssid").value.trim();
        const pass = document.getElementById("wifi-pass").value.trim();
        const type = document.getElementById("wifi-type").value;
        if(ssid) {
            rawData = `WIFI:S:${ssid};T:${type};P:${pass};;`;
        } else {
            rawData = "WIFI:S:ExampleNetwork;T:WPA;P:password;;";
        }
    } else if (activeTab === "phone") {
        const phone = document.getElementById("phone-num").value.trim();
        const msg = document.getElementById("whatsapp-msg").value.trim();
        if (phone) {
            rawData = msg ? `https://wa.me{phone.replace('+', '')}?text=${encodeURIComponent(msg)}` : `tel:${phone}`;
        } else {
            rawData = "tel:+201000000000";
        }
    }

    const size = parseInt(document.getElementById("qr-size").value) || 300;
    const colorDark = document.getElementById("color-dark").value;
    const colorLight = document.getElementById("color-light").value;

    // تحديث بيانات الكود برمجياً بمرونة وبدون أخطاء تكرار
    qrCode.update({
        width: size,
        height: size,
        data: rawData,
        dotsOptions: { color: colorDark },
        backgroundOptions: { color: colorLight },
        image: currentLogoData
    });
}

// ربط مستمعي الأحداث للتحديث الفوري أثناء الكتابة أو تحريك المنزلقات
const liveElements = ["input-url", "input-text", "wifi-ssid", "wifi-pass", "wifi-type", "phone-num", "whatsapp-msg", "color-dark", "color-light"];
liveElements.forEach(id => document.getElementById(id).addEventListener("input", generateLiveQR));

const sizeSlider = document.getElementById("qr-size");
sizeSlider.addEventListener("input", (e) => {
    document.getElementById("size-val").innerText = e.target.value;
    generateLiveQR();
});

// --- معالجة وتحميل شعار (Logo Upload) ---
document.getElementById("logo-input").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentLogoData = event.target.result;
            generateLiveQR();
        };
        reader.readAsDataURL(file);
    } else {
        currentLogoData = null;
        generateLiveQR();
    }
});

// --- أزرار الإجراءات (تحميل، نسخ، مشاركة) ---
document.getElementById("download-btn").addEventListener("click", () => {
    qrCode.download({ name: "qr-studio-code", extension: "png" });
});

document.getElementById("copy-btn").addEventListener("click", async () => {
    try {
        const svgElement = canvasContainer.querySelector("svg");
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);
        
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            canvas.toBlob(async (blob) => {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                alert("📋 تم نسخ صورة الـ QR كـ PNG بنجاح للذاكرة!");
            }, "image/png");
        };
        image.src = blobURL;
    } catch (err) {
        alert("عذراً، المتصفح لا يدعم النسخ المباشر للصور، يرجى استخدام زر التحميل.");
    }
});

document.getElementById("share-btn").addEventListener("click", async () => {
    if (navigator.share) {
        try {
            const svgElement = canvasContainer.querySelector("svg");
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
            const file = new File([svgBlob], "qr-code.svg", { type: "image/svg+xml" });
            
            await navigator.share({
                files: [file],
                title: "رمز QR مخصص",
                text: "إليك رمز الـ QR الذي قمت بإنشائه عبر موقعي."
            });
        } catch (err) {
            console.log("تم إلغاء المشاركة أو حدث خطأ ما.");
        }
    } else {
        alert("ميزة المشاركة المباشرة غير مدعومة في متصفحك الحالي.");
    }
});

// --- نظام قراءة ومسح الرموز (html5-qrcode) ---
const html5QrcodeScanner = new Html5QrcodeScanner("scanner-reader", { fps: 10, qrbox: 250 });

function onScanSuccess(decodedText, decodedResult) {
    const resultBox = document.getElementById("scanner-result");
    const resultText = document.getElementById("result-text");
    resultBox.classList.remove("hidden");
    resultText.innerText = decodedText;
}

html5QrcodeScanner.render(onScanSuccess);

// ميزة مسح رمز من ملف صورة مرفوع
const fileinput = document.getElementById("scanner-file");
fileinput.addEventListener("change", e => {
    if (e.target.files.length === 0) return;
    const imageFile = e.target.files[0];
    const html5QrCode = new Html5Qrcode("scanner-reader");
    html5QrCode.scanFile(imageFile, true)
        .then(decodedText => onScanSuccess(decodedText))
        .catch(err => alert("فشل قراءة الرمز. تأكد من جودة الصورة وأنها تحتوي على QR Code صحيح."));
});

document.getElementById("copy-result-btn").addEventListener("click", () => {
    const text = document.getElementById("result-text").innerText;
    navigator.clipboard.writeText(text);
    alert("تم نسخ النص المستخرج!");
});

// --- زر التحكم بالوضع الداكن (Dark Mode) ---
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
    if (document.body.getAttribute("data-theme") === "dark") {
        document.body.removeAttribute("data-theme");
        themeToggle.innerText = "🌙 الوضع الداكن";
    } else {
        document.body.setAttribute("data-theme", "dark");
        themeToggle.innerText = "☀️ الوضع الفاتح";
    }
});

// تشغيل أولي لضمان جاهزية البيانات الافتراضية
generateLiveQR();
