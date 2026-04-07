const form = document.getElementById("petForm");
const nameInput = document.getElementById("fullname");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");
const housingInput = document.getElementById("housing");
const dogLocationInput = document.querySelector('input[name="dog_location"]');
const petCountInput = document.getElementById("petCount");
const agreeInput = document.getElementById("agree");

form.addEventListener("submit", function (event) {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const petCount = petCountInput.value.trim();
    const petCountValue = Number(petCount);

    if (name === "" || phone === "") {
        alert("กรุณากรอกชื่อ-นามสกุล และเบอร์ผู้ติดต่อ");
        event.preventDefault();
        return;
    }

    if (!emailInput.checkValidity()) {
        event.preventDefault();
        emailInput.reportValidity();
        return;
    }

    if (!addressInput.checkValidity()) {
        event.preventDefault();
        addressInput.reportValidity();
        return;
    }

    if (!housingInput.checkValidity()) {
        event.preventDefault();
        housingInput.reportValidity();
        return;
    }

    if (!document.querySelector('input[name="dog_location"]:checked')) {
        event.preventDefault();
        dogLocationInput.reportValidity();
        return;
    }

    if (petCount === "" || Number.isNaN(petCountValue) || petCountValue < 0 || petCountValue > 100) {
        alert("จำนวนสัตว์เลี้ยงต้องเป็นตัวเลขระหว่าง 0 ถึง 100 เท่านั้น");
        event.preventDefault();
        return;
    }

    if (!agreeInput.checked) {
        alert("กรุณารับทราบว่าการส่งแบบฟอร์มนี้เป็นการแจ้งความสนใจ โดยไม่รับรองการได้รับอุปการะสุนัข");
        event.preventDefault();
    }
});
