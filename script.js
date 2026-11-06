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
                // معيار الروابط العالمي
                rawData = document.getElementById("input-url").value.trim() || "https://google.com";
            } else if (activeTab === "text") {
                // معيار النصوص الحرة
                rawData = document.getElementById("input-text").value.trim() || "QR Code Standard";
            } else if (activeTab === "wifi") {
                // البروتوكول العالمي الصارم لقراءة شبكات الواي فاي تلقائياً
                const ssid = document.getElementById("wifi-ssid").value.trim();
                const pass = document.getElementById("wifi-pass").value.trim();
                const type = document.getElementById("wifi-type").value;
                rawData = ssid ? `WIFI:S:${ssid};T:${type};P:${pass};;` : "WIFI:S:MyNetwork;T:WPA;P:12345678;;";
            } else if (activeTab === "phone") {
                // البروتوكول العالمي للمكالمات وروابط المراسلة الفورية المباشرة
                const phone = document.getElementById("phone-num").value.trim();
                const msg = document.getElementById("whatsapp-msg").value.trim();
                if (phone) {
                    rawData = msg ? `https://wa.me{phone.replace('+', '')}?text=${encodeURIComponent(msg)}` : `tel:${phone}`;
                } else {
                    rawData = "tel:+201000000000";
                }
            }

            if (qrContainer) {
                qrContainer.innerHTML = ""; // إفراغ نظيف للحاوية
                const colorDark = document.getElementById("color-dark").value;
                const colorLight = document.getElementById("color-light").value;

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

    // آلية معالجة تحميل الصورة المتوافقة تماماً مع جيت هوب وهواتف آيفون وأندرويد
    const downloadBtn = document.getElementById("download-btn");
    if(downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const img = qrContainer.querySelector("img");
            if (img && img.src) {
                const link = document.createElement("a");
                link.href = img.src;
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
            const currentText = document.getElementById("input-url").value || window.location.href;
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
