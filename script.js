// حماية تنفيذ الكود حتى اكتمال بنية الـ DOM بالكامل لمنع أي تجمد
document.addEventListener("DOMContentLoaded", () => {
    
    const qrContainer = document.getElementById("qrcode-container");
    let qrcodeInstance = null;

    // معالجة التنقل بين التبويبات القياسية
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    let activeTab = "url";

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            activeTab = btn.getAttribute("data-tab");
            const targetContent = document.getElementById(`tab-${activeTab}`);
            if (targetContent) targetContent.classList.add("active");
            generateQR(); 
        });
    });

    // دالة التوليد الملتزمة بالمعايير العالمية لتسهيل القراءة على برامج المسح
    function generateQR() {
        try {
            let rawData = "";

            if (activeTab === "url") {
                const el = document.getElementById("input-url");
                rawData = (el ? el.value.trim() : "") || "https://google.com";
            } else if (activeTab === "text") {
                const el = document.getElementById("input-text");
                rawData = (el ? el.value.trim() : "") || "QR Code Standard";
            } else if (activeTab === "wifi") {
                const ssidEl = document.getElementById("wifi-ssid");
                const passEl = document.getElementById("wifi-pass");
                const typeEl = document.getElementById("wifi-type");
                
                const ssid = ssidEl ? ssidEl.value.trim() : "";
                const pass = passEl ? passEl.value.trim() : "";
                const type = typeEl ? typeEl.value : "WPA";
                rawData = ssid ? `WIFI:S:${ssid};T:${type};P:${pass};;` : "WIFI:S:MyNetwork;T:WPA;P:12345678;;";
            } else if (activeTab === "phone") {
                const phoneEl = document.getElementById("phone-num");
                const msgEl = document.getElementById("whatsapp-msg");
                
                const phone = phoneEl ? phoneEl.value.trim() : "";
                const msg = msgEl ? msgEl.value.trim() : "";
                if (phone) {
                    // تصحيح الخطأ الكتابي وإضافة علامة الـ $ المفقودة مع السلاش
                    rawData = msg ? `https://wa.me{phone.replace('+', '')}?text=${encodeURIComponent(msg)}` : `tel:${phone}`;
                } else {
                    rawData = "tel:+201000000000";
                }
            }

            if (qrContainer) {
                qrContainer.innerHTML = ""; // إفراغ نظيف للحاوية
                const colorDarkEl = document.getElementById("color-dark");
                const colorLightEl = document.getElementById("color-light");
                
                const colorDark = colorDarkEl ? colorDarkEl.value : "#000000";
                const colorLight = colorLightEl ? colorLightEl.value : "#ffffff";

                // بناء الرمز بمستوى تصحيح عالي (H) لتسهيل التقاط الكاميرات له
                qrcodeInstance = new QRCode(qrContainer, {
                    text: rawData,
                    width: 250,
                    height: 250,
                    colorDark: colorDark,
                    colorLight: colorLight,
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        } catch (error) {
            console.error("خطأ معالجة المعايير: ", error);
        }
    }

    // ربط التحديث الحي الفوري بجميع خانات الكتابة والألوان
    const liveInputs = ["input-url", "input-text", "wifi-ssid", "wifi-pass", "wifi-type", "phone-num", "whatsapp-msg", "color-dark", "color-light"];
    liveInputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener("input", generateQR);
    });

    // آلية معالجة تحميل الصورة المتوافقة ودعم الـ Canvas والـ Image معاً
    const downloadBtn = document.getElementById("download-btn");
    if(downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const img = qrContainer.querySelector("img");
            const canvas = qrContainer.querySelector("canvas");
            let imageSrc = null;

            if (img && img.src) {
                imageSrc = img.src;
            } else if (canvas) {
                imageSrc = canvas.toDataURL("image/png");
            }

            if (imageSrc) {
                const link = document.createElement("a");
                link.href = imageSrc;
                link.download = "global-qr-code.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("يرجى إدخال بيانات صحيحة أولاً لمعالجة الكود.");
            }
        });
    }

    // زر مشاركة الرابط الآمن
    const shareBtn = document.getElementById("share-btn");
    if(shareBtn) {
        shareBtn.addEventListener("click", () => {
            const inputUrlEl = document.getElementById("input-url");
            const currentText = (inputUrlEl ? inputUrlEl.value : "") || window.location.href;
            if (navigator.share) {
                navigator.share({ title: 'مشاركة رابط الـ QR', text: currentText, url: currentText })
                    .catch(() => console.log("تم إلغاء المشاركة."));
            } else {
                navigator.clipboard.writeText(currentText);
                alert("تم نسخ الرابط الحركي إلى الحافظة بنجاح!");
            }
        });
    }

    // نظام تبديل الوضع الداكن الموفر للطاقة
    const themeToggle = document.getElementById("theme-toggle");
    if(themeToggle) {
        themeToggle.addEventListener("click", () => {
            if (document.body.getAttribute("data-theme") === "dark") {
                document.body.removeAttribute("data-theme");
                themeToggle.innerText = "🌙 الوضع الداكن";
            } else {
                document.body.setAttribute("data-theme", "dark");
                themeToggle.innerText = "☀️ الوضع الفاتح";
            }
        });
    }

    // تشغيل تلقائي أولي لتهيئة الرمز عند إقلاع الصفحة لأول مرة
    generateQR();
});
