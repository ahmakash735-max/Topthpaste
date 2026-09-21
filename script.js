/* ===== এখানে আপনার তথ্য বদলান ===== */
const CONFIG = {
  brand: "Toufik's Organic Collection",
  productName: "তৌফিক অর্গানিক টুথপেস্ট",

  phone: "01891668334",            // আপনার কল নাম্বার (১১ সংখ্যা)
  whatsapp: "8801891668334",       // হোয়াটসঅ্যাপ নাম্বার, দেশের কোড সহ (৮৮ দিয়ে শুরু), + বা স্পেস ছাড়া

  oldPrice: 350,                   // আগের দাম (কাটা দাম হিসেবে দেখাবে)
  options: [                       // অর্ডারের অপশন
    { label: "তৌফিক টুথপেস্ট × ১", price: 250 },
    { label: "তৌফিক টুথপেস্ট × ২", price: 450 }
  ],

  offerBadge: "বিশেষ অফার",
  offerNote: "আজকে অর্ডার করলে ফ্রি ডেলিভারি",
  shippingText: "সারাদেশে ডেলিভারি চার্জ ফ্রী",

  youtubeId: "",                   // ইউটিউব ভিডিও লিংকের v= এর পরের অংশ; ফাঁকা রাখলে ভিডিও সেকশন লুকানো থাকবে
  productThumb: "product.jpg",

  // ঐচ্ছিক: Formspree/Google Apps Script এর লিংক দিলে অর্ডার ওখানেও জমা হবে
  formEndpoint: ""
};
/* ================================== */

const bn = (n) => Number(n).toLocaleString("bn-BD");
const money = (n) => bn(n) + "৳";
const $ = (id) => document.getElementById(id);

/* ছবি না পেলে: আবশ্যিক ছবিতে প্লেসহোল্ডার, ঐচ্ছিক সেকশনে লুকিয়ে ফেলা */
function handleBrokenImage(img) {
  const optional = img.closest("[data-optional]");
  if (optional) {
    const fig = img.closest("figure");
    if (fig) fig.remove();
    if (!optional.querySelector("figure")) optional.hidden = true;
  } else if (img.dataset.placeholder) {
    const ph = document.createElement("div");
    ph.className = "img-placeholder";
    ph.textContent = img.dataset.placeholder;
    img.replaceWith(ph);
  }
}
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => handleBrokenImage(img));
  if (img.complete && img.naturalWidth === 0) handleBrokenImage(img);
});

/* অফার সেকশন */
$("offer-badge").textContent = "🔥 " + CONFIG.offerBadge + " 🔥";
$("old-price").textContent = bn(CONFIG.oldPrice) + " টাকা";
$("offer-price").textContent = bn(CONFIG.options[0].price) + " টাকা";
$("offer-note").textContent = CONFIG.offerNote;
$("ship-box").textContent = CONFIG.shippingText;

/* ভিডিও */
if (CONFIG.youtubeId) {
  $("yt").src = "https://www.youtube.com/embed/" + CONFIG.youtubeId;
  $("video-section").hidden = false;
}

/* ফুটার ও কল বাটন */
$("year").textContent = new Date().getFullYear().toLocaleString("bn-BD", { useGrouping: false });
const tel = "tel:+88" + CONFIG.phone.replace(/^0/, "0");
$("footer-phone").href = tel;
$("footer-phone").textContent = CONFIG.phone;
$("float-call").href = tel;

/* পণ্য অপশন */
const optionsBox = $("product-options");
CONFIG.options.forEach((opt, i) => {
  const label = document.createElement("label");
  label.className = "product-option";
  label.innerHTML =
    `<input type="radio" name="product" value="${i}" ${i === 0 ? "checked" : ""}>` +
    `<img src="${CONFIG.productThumb}" alt="" onerror="this.outerHTML='<span class=&quot;thumb-ph&quot;></span>'">` +
    `<span>${opt.label}</span><span>${money(opt.price)}</span>`;
  optionsBox.appendChild(label);
});

function selected() {
  const i = Number(document.querySelector('input[name="product"]:checked').value);
  return CONFIG.options[i];
}
function updateSummary() {
  const opt = selected();
  $("sum-name").textContent = opt.label;
  $("sum-line").textContent = money(opt.price);
  $("sum-sub").textContent = money(opt.price);
  $("sum-total").textContent = money(opt.price);
  $("confirm-btn").textContent = "অর্ডার কনফার্ম করুন  " + money(opt.price);
}
optionsBox.addEventListener("change", updateSummary);
updateSummary();

/* বাংলা সংখ্যা ইংরেজিতে রূপান্তর (ফোন নাম্বারের জন্য) */
const toEn = (s) => s.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d));

/* অর্ডার সাবমিট */
$("order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  const err = $("form-error");
  const name = f.name.value.trim();
  const phone = toEn(f.phone.value.trim());
  const address = f.address.value.trim();

  if (!name || !phone || !address) {
    err.textContent = "অনুগ্রহ করে নাম, ফোন নাম্বার ও ঠিকানা লিখুন।";
    return;
  }
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    err.textContent = "সঠিক ১১ সংখ্যার মোবাইল নাম্বার লিখুন (যেমন 01XXXXXXXXX)।";
    return;
  }
  err.textContent = "";

  const opt = selected();
  const text =
    `নতুন অর্ডার - ${CONFIG.brand}\n` +
    `পণ্য: ${opt.label}\n` +
    `মোট: ${opt.price} টাকা (ক্যাশ অন ডেলিভারি)\n` +
    `নাম: ${name}\n` +
    `ফোন: ${phone}\n` +
    `ঠিকানা: ${address}`;

  const btn = $("confirm-btn");
  btn.disabled = true;

  if (CONFIG.formEndpoint) {
    try {
      await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, phone, address, product: opt.label, total: opt.price })
      });
    } catch (_) { /* হোয়াটসঅ্যাপে তবু যাবে */ }
  }

  window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");

  f.hidden = true;
  $("thanks").hidden = false;
  $("thanks").scrollIntoView({ behavior: "smooth", block: "center" });
});
