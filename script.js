// الحاوية الأساسية للـ QR
const qrContainer = document.getElementById("qrcode-container");

// إنشاء كائن المولد وتجهيزه بشكل مستقر
let qrcodeInstance = new QRCode(qrContainer, {
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.H
});

// إعداد التبويبات واكتشاف النشط منها
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
        generateQR(); 
    });
});

// دالة التوليد التلقائي والمستقر
function generateQR() {
    let rawData = "";

    if (activeTab === "url") {
        rawData = document.getElementById("input-url").value.trim() || "https://google.com";
    } else if (activeTab === "text") {
        rawData = document.getElementById("input-text").value.trim() || "مرحباً بك";
    } else if (activeTab === "wifi") {
        const ssid = document.getElementById("wifi-ssid").value.trim();
        const pass = document.getElementById("wifi-pass").value.trim();
        const type = document.getElementById("wifi-type").value;
        rawData = ssid ? `WIFI:S:${ssid};T:${type};P:${pass};;` : "WIFI:S:MyNetwork;T:WPA;P:12345678;;";
    } else if (activeTab === "phone") {
        const phone = document.getElementById("phone-num").value.trim();
        const msg = document.getElementById("whatsapp-msg").value.trim();
        if (phone) {
            rawData = msg ? `https://wa.me{phone.replace('+', '')}?text=${encodeURIComponent(msg)}` : `tel:${phone}`;
        } else {
            rawData = "tel:+201000000000";
        }
    }

    // تفريغ الحاوية وإعادة البناء لضمان تطبيق الألوان وتجنب التعليق على السيرفرات
    qrContainer.innerHTML = "";
    const colorDark = document.getElementById("color-dark").value;
    const colorLight = document.getElementById("color-light").value;

    qrcodeInstance = new QRCode(qrContainer, {
        text: rawData,
        width: 200,
        height: 200,
        colorDark: colorDark,
        colorLight: colorLight,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// تشغيل التوليد الفوري أثناء الكتابة وتغيير الألوان
const liveInputs = ["input-url", "input-text", "wifi-ssid", "wifi-pass", "wifi-type", "phone-num", "whatsapp-msg", "color-dark", "color-light"];
liveInputs.forEach(id => document.getElementById(id).addEventListener("input", generateQR));

// ميزة تحميل الصورة بشكل متوافق تماماً مع جيت هوب والهواتف
document.getElementById("download-btn").addEventListener("click", () => {
    const img = qrContainer.querySelector("img");
    if (img) {
        const link = document.createElement("a");
        link.href = img.src;
        link.download = "qr-code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("انتظر توليد الرمز أولاً");
    }
});

// ميزة مشاركة الرابط النصي المشفر
document.getElementById("share-btn").addEventListener("click", () => {
    const currentText = document.getElementById("input-url").value || window.location.href;
    if (navigator.share) {
        navigator.share({ title: 'مشاركة رابط من موقعي', text: currentText, url: currentText })
            .catch(console.error);
    } else {
        navigator.clipboard.writeText(currentText);
        alert("تم نسخ الرابط للذاكرة لعدم دعم متصفحك للمشاركة المباشرة.");
    }
});

// نظام قراءة ومسح الرموز (Scanner)
const html5QrcodeScanner = new Html5QrcodeScanner("scanner-reader", { fps: 10, qrbox: 250 });
function onScanSuccess(decodedText) {
    const resultBox = document.getElementById("scanner-result");
    const resultText = document.getElementById("result-text");
    resultBox.classList.remove("hidden");
    resultText.innerText = decodedText;
}
html5QrcodeScanner.render(onScanSuccess);

// قراءة الرمز من ملف صورة مرفوع
document.getElementById("scanner-file").addEventListener("change", e => {
    if (e.target.files.length === 0) return;
    const html5QrCode = new Html5Qrcode("scanner-reader");
    html5QrCode.scanFile(e.target.files[0], true)
        .then(decodedText => onScanSuccess(decodedText))
        .catch(() => alert("لم يتم العثور على رمز QR صحيح في الصورة."));
});

document.getElementById("copy-result-btn").addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("result-text").innerText);
    alert("تم نسخ النتيجة المستخرجة بنجاح!");
});

// نظام الوضع الداكن (Dark Mode)
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

// تشغيل افتراضي
generateQR();
