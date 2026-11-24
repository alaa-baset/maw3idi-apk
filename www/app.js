const $ = s => document.querySelector(s);

const SPECIALTY_TILES = [
  { name: "النساء والولادة", icon: "🤰", bg: "#fdeaea", color: "#d94343" },
  { name: "طب الأسنان", icon: "🦷", bg: "#eaf3fc", color: "#0b66c3" },
  { name: "الطب العام", icon: "🩺", bg: "#e6f7f0", color: "#109c68" },
  { name: "الباطنية والقلب", icon: "🫀", bg: "#eef2ff", color: "#3b5bdb" },
  { name: "الجلدية", icon: "✨", bg: "#fff4e2", color: "#d9820b" },
  { name: "الأطفال", icon: "👶", bg: "#e7f5ff", color: "#1c7ed6" }
];

const DEFAULT_CLINICS = [
  {
    id: 1,
    name: "مركز الشفاء الطبي",
    specialty: "الطب العام",
    area: "صنعاء - حدة",
    phone: "01441122",
    fee: 5000,
    deposit: 1500,
    desc: "استشارات وفحوصات طبية عامة ومختبر متكامل",
    doctors: [
      { id: 11, name: "د. أحمد العريقي", spec: "استشاري الطب العام", fee: 5000, deposit: 1500, days: "السبت - الخميس", times: ["09:00", "10:00", "11:00", "16:00", "18:00"] },
      { id: 12, name: "د. سارة محمد", spec: "طب الأسرة", fee: 5500, deposit: 1500, days: "الأحد - الخميس", times: ["10:00", "12:00", "17:00"] }
    ]
  },
  {
    id: 2,
    name: "عيادات النور التخصصية",
    specialty: "الأطفال",
    area: "صنعاء - شارع الزبيري",
    phone: "01223344",
    fee: 6000,
    deposit: 2000,
    desc: "رعاية الأطفال ومتابعة النمو والتطعيمات",
    doctors: [
      { id: 21, name: "د. منى صالح", spec: "أخصائية طب الأطفال", fee: 6000, deposit: 2000, days: "السبت - الأربعاء", times: ["09:00", "11:00", "13:00", "17:00"] }
    ]
  },
  {
    id: 3,
    name: "مركز الحياة للباطنية والقلب",
    specialty: "الباطنية والقلب",
    area: "صنعاء - حدة",
    phone: "01556677",
    fee: 8000,
    deposit: 2500,
    desc: "استشارات وفحوصات الباطنية وتخطيط القلب",
    doctors: [
      { id: 31, name: "د. خالد ياسين", spec: "استشاري أمراض القلب والباطنية", fee: 8000, deposit: 2500, days: "الأحد - الخميس", times: ["10:00", "12:00", "15:00", "18:00"] }
    ]
  },
  {
    id: 4,
    name: "عيادة الابتسامة لطب الأسنان",
    specialty: "طب الأسنان",
    area: "صنعاء - شملان",
    phone: "01334455",
    fee: 5000,
    deposit: 1500,
    desc: "علاج وتجميل وزراعة الأسنان بأحدث الأجهزة",
    doctors: [
      { id: 41, name: "د. ريم عبدالله", spec: "طبيبة وجراحة الأسنان", fee: 5000, deposit: 1500, days: "السبت - الخميس", times: ["09:00", "12:00", "16:00", "18:00"] }
    ]
  },
  {
    id: 5,
    name: "مركز الأمومة التخصصي",
    specialty: "النساء والولادة",
    area: "صنعاء - الستين",
    phone: "01667788",
    fee: 6000,
    deposit: 2000,
    desc: "متابعة الحمل والنساء والولادة والسونار",
    doctors: [
      { id: 51, name: "د. أروى الحمادي", spec: "استشارية النساء والولادة", fee: 6000, deposit: 2000, days: "السبت - الخميس", times: ["10:00", "12:00", "16:00"] }
    ]
  },
  {
    id: 6,
    name: "عيادة النضارة للجلدية",
    specialty: "الجلدية",
    area: "صنعاء - حدة",
    phone: "01778899",
    fee: 5000,
    deposit: 1500,
    desc: "علاج الأمراض الجلدية والعناية بالبشرة",
    doctors: [
      { id: 61, name: "د. طارق الشامي", spec: "أخصائي الأمراض الجلدية", fee: 5000, deposit: 1500, days: "الأحد - الخميس", times: ["11:00", "16:00", "18:00"] }
    ]
  }
];

let selectedSpecialty = "الكل";
let selectedClinic = null;
let selectedDoctor = null;
let selectedPay = "full";
let deferredInstall = null;

const loadClinics = () => {
  const raw = localStorage.getItem("maw3idi_clinics_v3");
  if (!raw) {
    localStorage.setItem("maw3idi_clinics_v3", JSON.stringify(DEFAULT_CLINICS));
    return structuredClone(DEFAULT_CLINICS);
  }
  return JSON.parse(raw);
};
const saveClinics = list => localStorage.setItem("maw3idi_clinics_v3", JSON.stringify(list));

const loadBookings = () => JSON.parse(localStorage.getItem("maw3idi_bookings_v3") || "[]");
const saveBookings = list => localStorage.setItem("maw3idi_bookings_v3", JSON.stringify(list));

const getAdminPin = () => localStorage.getItem("maw3idi_admin_pin_v3") || "";
const setAdminPin = pin => localStorage.setItem("maw3idi_admin_pin_v3", pin);
let isAdminUnlocked = !getAdminPin();

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function toast(t) {
  const el = $("#toast");
  el.textContent = t;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

function go(id) {
  document.querySelectorAll(".view").forEach(x => x.classList.toggle("active", x.id === id));
  document.querySelectorAll(".bottom-nav button").forEach(x => x.classList.toggle("selected", x.dataset.go === id));
  if (id === "home") renderHome();
  if (id === "mybookings") renderBookings();
  if (id === "doctor_queue") renderDoctorQueueView();
  if (id === "admin") renderAdmin();
  window.scrollTo(0, 0);
}

document.querySelectorAll("[data-go]").forEach(b => b.onclick = () => go(b.dataset.go));
$("#homeLink").onclick = e => { e.preventDefault(); selectedSpecialty = "الكل"; go("home"); };

// ================= 1. الرئيسية للمريض =================
function renderHome() {
  const clinics = loadClinics();

  $("#specialtiesGrid").innerHTML = SPECIALTY_TILES.map(st => `
    <button type="button" class="spec-tile ${selectedSpecialty === st.name ? "active" : ""}" data-spec="${esc(st.name)}">
      <span class="spec-ico" style="background:${st.bg}; color:${st.color};">${st.icon}</span>
      <b>${esc(st.name)}</b>
    </button>
  `).join("");

  document.querySelectorAll("[data-spec]").forEach(b => b.onclick = () => {
    const clicked = b.dataset.spec;
    selectedSpecialty = selectedSpecialty === clicked ? "الكل" : clicked;
    renderHome();
  });

  const q = $("#searchInput").value.trim().toLowerCase();
  const rows = clinics.filter(c =>
    (selectedSpecialty === "الكل" || c.specialty === selectedSpecialty) &&
    [c.name, c.specialty, c.area, c.desc, ...c.doctors.map(d => `${d.name} ${d.spec}`)].join(" ").toLowerCase().includes(q)
  );

  $("#clinicCount").textContent = `${rows.length} عيادة / مركز`;
  $("#clinicList").innerHTML = rows.length ? rows.map(c => `
    <article class="clinic-card" data-clinic="${c.id}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge blue">${esc(c.specialty)}</span>
        <span class="badge green">متاح للحجز</span>
      </div>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.desc)}</p>
      <div class="meta">
        <span>📍 ${esc(c.area)}</span>
        <span>💳 من ${Number(c.fee).toLocaleString("ar")} ر.ي</span>
        <span>👨‍⚕️ ${c.doctors.length} طبيب</span>
      </div>
    </article>
  `).join("") : `<div class="empty">لا توجد عيادات مطابقة لبحثك. <br><br><button class="btn blue-btn" onclick="selectedSpecialty='الكل'; document.getElementById('searchInput').value=''; renderHome();">عرض جميع العيادات</button></div>`;

  document.querySelectorAll("[data-clinic]").forEach(b => b.onclick = () => showClinic(+b.dataset.clinic));
}

$("#searchBtn").onclick = renderHome;
$("#searchInput").oninput = renderHome;
$("#nearbyBtn").onclick = () => {
  selectedSpecialty = "الكل";
  renderHome();
  document.getElementById("clinicList").scrollIntoView({ behavior: "smooth" });
  toast("تم عرض جميع العيادات القريبة المتاحة");
};

function showClinic(id) {
  const clinics = loadClinics();
  selectedClinic = clinics.find(c => c.id === id);
  if (!selectedClinic) return go("home");

  $("#clinic").innerHTML = `
    <button class="back" onclick="go('home')">← العودة للرئيسية</button>
    <div class="clinic-banner">
      <div class="heart-logo">✚</div>
      <div>
        <h2 style="margin:0 0 4px;">${esc(selectedClinic.name)}</h2>
        <p style="margin:0 0 6px; color:var(--muted); font-size:13px;">${esc(selectedClinic.desc)} · 📍 ${esc(selectedClinic.area)} ${selectedClinic.phone ? `· 📞 ${esc(selectedClinic.phone)}` : ""}</p>
        <span class="badge blue">${esc(selectedClinic.specialty)}</span>
      </div>
    </div>
    <h3 style="margin:18px 0 8px;">الأطباء المتاحون في العيادة</h3>
    ${selectedClinic.doctors.length ? selectedClinic.doctors.map(d => {
      const docFee = d.fee || selectedClinic.fee;
      const docDep = d.deposit ?? Math.ceil(docFee * 0.3);
      return `
        <div class="doctor">
          <div class="doctor-head">
            <div>
              <h3>${esc(d.name)}</h3>
              <p>${esc(d.spec)} · الدوام: ${esc(d.days)}</p>
              <b style="font-size:13px; color:var(--blue-dark);">الكشف: ${Number(docFee).toLocaleString("ar")} ر.ي · العربون: ${Number(docDep).toLocaleString("ar")} ر.ي</b>
            </div>
            <button class="btn blue-btn" data-doctor="${d.id}">احجز موعداً</button>
          </div>
        </div>
      `;
    }).join("") : `<div class="empty">لم يتم إضافة أطباء لهذه العيادة بعد.</div>`}
  `;
  document.querySelectorAll("[data-doctor]").forEach(b => b.onclick = () => showBooking(+b.dataset.doctor));
  go("clinic");
}

function showBooking(docId) {
  selectedDoctor = selectedClinic.doctors.find(d => d.id === docId);
  if (!selectedDoctor) return;
  const docFee = Number(selectedDoctor.fee || selectedClinic.fee || 0);
  const depositFee = Number(selectedDoctor.deposit ?? Math.ceil(docFee * 0.3));
  const date = new Date().toISOString().slice(0, 10);

  $("#booking").innerHTML = `
    <button class="back" onclick="showClinic(${selectedClinic.id})">← العودة لصفحة العيادة</button>
    <div class="panel">
      <h2 style="margin:0 0 4px;">تأكيد الحجز والدفع</h2>
      <p class="muted" style="margin:0 0 16px;">${esc(selectedClinic.name)} · <b>${esc(selectedDoctor.name)}</b></p>

      <div class="form-grid">
        <div class="field">
          <label>اسم المريض الثلاثي *</label>
          <input id="patientName" placeholder="أدخل اسم المريض الكامل" required>
        </div>
        <div class="field">
          <label>رقم الهاتف *</label>
          <input id="patientPhone" inputmode="tel" placeholder="مثال: 770000000" required>
        </div>
        <div class="field">
          <label>تاريخ الموعد *</label>
          <input id="appointmentDate" type="date" min="${date}" value="${date}">
        </div>
        <div class="field">
          <label>الوقت المتاح *</label>
          <select id="appointmentTime"></select>
        </div>
      </div>

      <h3 style="margin:16px 0 8px; font-size:16px;">اختر وسيلة الدفع</h3>
      <div class="payment-options">
        <button type="button" class="pay-option selected" data-pay="full">
          <b>🟢 دفع بالكامل</b>
          <small>تثبيت أولوية الموعد فوراً</small>
          <strong>${docFee.toLocaleString("ar")} ر.ي</strong>
        </button>
        <button type="button" class="pay-option" data-pay="deposit">
          <b>🔵 عربون مدفوع</b>
          <small>دفع العربون والباقي في العيادة</small>
          <strong>${depositFee.toLocaleString("ar")} ر.ي</strong>
        </button>
        <button type="button" class="pay-option" data-pay="unpaid">
          <b>🟠 الدفع عند الوصول</b>
          <small>يضاف لقائمة انتظار الطبيب</small>
          <strong>0 ر.ي الآن</strong>
        </button>
      </div>

      <div id="paymentNotice" class="notice">
        سيتم ربط حجزك مباشرة بقائمة حجوزات <b>${esc(selectedDoctor.name)}</b> فور التأكيد.
      </div>
      <button class="btn blue-btn full-btn" id="confirmBooking">تأكيد الحجز وإرساله للطبيب</button>
    </div>
  `;

  function updateAvailableSlots() {
    const chosenDate = $("#appointmentDate").value;
    const allBookings = loadBookings();
    const takenTimes = allBookings
      .filter(b => b.doctorId === selectedDoctor.id && b.date === chosenDate && b.status !== "cancelled")
      .map(b => b.time);

    $("#appointmentTime").innerHTML = selectedDoctor.times.map(t => {
      const isTaken = takenTimes.includes(t);
      return `<option value="${t}" ${isTaken ? "disabled" : ""}>${t} ${isTaken ? "(محجوز)" : ""}</option>`;
    }).join("");
  }

  updateAvailableSlots();
  $("#appointmentDate").onchange = updateAvailableSlots;

  selectedPay = "full";
  document.querySelectorAll("[data-pay]").forEach(b => b.onclick = () => {
    selectedPay = b.dataset.pay;
    document.querySelectorAll("[data-pay]").forEach(x => x.classList.toggle("selected", x === b));
    $("#paymentNotice").className = "notice " + (selectedPay === "unpaid" ? "warn" : "");
    $("#paymentNotice").innerHTML = selectedPay === "unpaid"
      ? "تنبيه: الحجوزات المدفوعة بالكامل أو بالعربون تحصل على أولوية متقدمة في قائمة الطبيب."
      : `ممتاز! سيتم تسجيل دفعتك وتثبيت حجزك في قائمة حجوزات <b>${esc(selectedDoctor.name)}</b>.`;
  });

  $("#confirmBooking").onclick = confirmBooking;
  go("booking");
}

function confirmBooking() {
  const name = $("#patientName").value.trim();
  const phone = $("#patientPhone").value.trim();
  const date = $("#appointmentDate").value;
  const timeSelect = $("#appointmentTime");
  const time = timeSelect.value;

  if (!name || !phone || !date) {
    toast("يرجى إدخال اسم المريض ورقم الهاتف والتاريخ");
    return;
  }
  if (!time || timeSelect.options[timeSelect.selectedIndex]?.disabled) {
    toast("هذا الوقت محجوز بالفعل، اختر وقتاً آخر");
    return;
  }

  const docFee = Number(selectedDoctor.fee || selectedClinic.fee || 0);
  const depositFee = Number(selectedDoctor.deposit ?? Math.ceil(docFee * 0.3));
  const amountPaid = selectedPay === "full" ? docFee : selectedPay === "deposit" ? depositFee : 0;

  const all = loadBookings();
  all.push({
    id: Date.now(),
    name,
    phone,
    date,
    time,
    clinicId: selectedClinic.id,
    clinic: selectedClinic.name,
    doctorId: selectedDoctor.id,
    doctor: selectedDoctor.name,
    fee: docFee,
    amountPaid,
    payment: selectedPay,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    paidAt: selectedPay === "unpaid" ? null : new Date().toISOString()
  });

  saveBookings(all);
  toast(`تم تأكيد حجزك وربطه بقائمة حجوزات ${selectedDoctor.name}`);
  go("mybookings");
}

function paymentInfo(p) {
  return p === "full"
    ? ["دفع بالكامل", "green"]
    : p === "deposit"
    ? ["عربون مدفوع", "blue"]
    : ["الدفع عند الوصول", "orange"];
}

function statusBadgeInfo(st) {
  if (st === "completed") return ["تم الحضور", "blue"];
  if (st === "cancelled") return ["ملغي", "red"];
  return ["مؤكد", "green"];
}

function sortedBookings(list = loadBookings()) {
  return [...list].sort((a, b) => {
    const ap = a.payment !== "unpaid";
    const bp = b.payment !== "unpaid";
    if (ap !== bp) return ap ? -1 : 1;
    if (ap && bp) return new Date(a.paidAt) - new Date(b.paidAt);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

function renderBookings() {
  const a = sortedBookings();
  $("#bookingList").innerHTML = a.length ? a.map((b, i) => {
    const [payLabel, payColor] = paymentInfo(b.payment);
    const [stLabel, stColor] = statusBadgeInfo(b.status);
    return `
      <article class="booking-card">
        <div class="booking-top">
          <div>
            <b>${esc(b.clinic)}</b>
            <p class="muted" style="margin:3px 0;">${esc(b.doctor)}</p>
          </div>
          <div style="display:flex; gap:6px;">
            <span class="badge ${stColor}">${stLabel}</span>
            <span class="badge ${payColor}">${payLabel}</span>
          </div>
        </div>
        <p style="margin:6px 0; font-size:14px;">المريض: <b>${esc(b.name)}</b> · 📞 ${esc(b.phone)}</p>
        <p style="margin:4px 0; font-size:14px;">📅 ${esc(b.date)} · ⏰ ${esc(b.time)}</p>
        <div class="queue">
          المبلغ المدفوع: <b>${Number(b.amountPaid || 0).toLocaleString("ar")} ر.ي</b> من أصل ${Number(b.fee || 0).toLocaleString("ar")} ر.ي · ترتيب الأولوية: <b>${i + 1}</b>
        </div>
      </article>
    `;
  }).join("") : `<div class="empty">لا توجد حجوزات حتى الآن.<br><br><button class="btn blue-btn" onclick="go('home')">ابحث عن طبيب واحجز الآن</button></div>`;
}

// ================= 2. حجوزات الأطباء (مطابقة للصورة 2 يمين) =================
function renderDoctorQueueView() {
  const clinics = loadClinics();
  const clinicSel = $("#dqClinicSelect");
  const docSel = $("#dqDoctorSelect");

  const prevClinicId = +clinicSel.value;
  clinicSel.innerHTML = clinics.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
  if (clinics.some(c => c.id === prevClinicId)) clinicSel.value = prevClinicId;

  function populateDoctorsForQueue() {
    const cId = +clinicSel.value;
    const clinic = clinics.find(c => c.id === cId);
    const docs = clinic ? clinic.doctors : [];
    const prevDocId = +docSel.value;
    docSel.innerHTML = docs.length
      ? docs.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join("")
      : `<option value="">لا يوجد أطباء</option>`;
    if (docs.some(d => d.id === prevDocId)) docSel.value = prevDocId;
    renderSelectedDoctorQueue();
  }

  clinicSel.onchange = populateDoctorsForQueue;
  docSel.onchange = renderSelectedDoctorQueue;
  populateDoctorsForQueue();
}

function renderSelectedDoctorQueue() {
  const docId = +$("#dqDoctorSelect").value;
  const all = sortedBookings().filter(b => b.doctorId === docId);

  const activeCount = all.filter(b => b.status !== "cancelled").length;
  const totalCollected = all.filter(b => b.status !== "cancelled").reduce((s, b) => s + Number(b.amountPaid || 0), 0);

  $("#dqStats").innerHTML = `
    <div class="summary-row"><span>إجمالي الحجوزات:</span><b>${activeCount}</b></div>
    <div class="summary-row"><span>المبلغ المحصل:</span><b>${totalCollected.toLocaleString("ar")} ر.ي</b></div>
  `;

  $("#dqBookingsList").innerHTML = all.length ? all.map(b => {
    const [payLabel] = paymentInfo(b.payment);
    const [stLabel, stColor] = statusBadgeInfo(b.status);
    return `
      <div class="doc-booking-item">
        <div class="doc-booking-info">
          <b>${esc(b.name)}</b>
          <small>📞 ${esc(b.phone)}</small>
          <small>📅 ${esc(b.date)} — ⏰ ${esc(b.time)}</small>
          <small style="color:var(--blue-dark); font-weight:700;">${payLabel} (${Number(b.amountPaid || 0).toLocaleString("ar")} ر.ي)</small>
        </div>
        <div class="doc-booking-actions">
          <span class="badge ${stColor}">${stLabel}</span>
          <button class="btn blue-btn" onclick="setBookingStatus(${b.id}, 'completed')">تأكيد الحضور</button>
          <button class="btn soft-red" onclick="setBookingStatus(${b.id}, 'cancelled')">إلغاء الموعد</button>
        </div>
      </div>
    `;
  }).join("") : `<div class="empty">لا توجد حجوزات مسجلة لهذا الطبيب حتى الآن.</div>`;
}

window.setBookingStatus = function(id, status) {
  const all = loadBookings();
  const item = all.find(b => b.id === id);
  if (!item) return;
  item.status = status;
  saveBookings(all);
  renderSelectedDoctorQueue();
  toast(status === "completed" ? "تم تأكيد حضور المريض" : "تم إلغاء الموعد وإتاحة الوقت مجدداً");
};

// ================= 3. لوحة الإدارة (خاص بك) (مطابقة للصورة 2 يسار) =================
function renderAdmin() {
  const pin = getAdminPin();
  $("#pinStatusText").textContent = pin ? "اللوحة محمية برمز PIN" : "غير مقفلة (عيّن رمز PIN لحمايتها)";
  $("#adminLockedScreen").hidden = isAdminUnlocked;
  $("#adminWorkspace").hidden = !isAdminUnlocked;
  if (!isAdminUnlocked) return;

  const clinics = loadClinics();
  $("#newDocClinicId").innerHTML = clinics.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");

  $("#adminClinicsList").innerHTML = clinics.map(c => `
    <div style="border-top:1px solid var(--line); padding:10px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <b>${esc(c.name)}</b> <span class="badge blue">${esc(c.specialty)}</span>
          <div class="muted">${esc(c.area)} · ${c.doctors.length} طبيب</div>
        </div>
        <button class="btn soft-red btn-sm" onclick="deleteClinic(${c.id})">حذف</button>
      </div>
      ${c.doctors.length ? `
        <div style="margin-top:6px; padding-right:10px; border-right:3px solid #cfe2f7;">
          ${c.doctors.map(d => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:13px;">
              <span>👨‍⚕️ <b>${esc(d.name)}</b> — كشف: ${Number(d.fee || c.fee).toLocaleString("ar")} | عربون: ${Number(d.deposit ?? 0).toLocaleString("ar")}</span>
              <button class="btn soft-red" style="padding:3px 8px; font-size:11px;" onclick="deleteDoctor(${c.id}, ${d.id})">حذف</button>
            </div>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `).join("");
}

$("#setPinBtn").onclick = () => {
  const val = $("#adminPinInput").value.trim();
  if (!val) {
    toast("أدخل رمز PIN أولاً");
    return;
  }
  setAdminPin(val);
  isAdminUnlocked = true;
  $("#adminPinInput").value = "";
  renderAdmin();
  toast("تم حفظ رمز PIN الخاص بك");
};

$("#lockAdminBtn").onclick = () => {
  if (!getAdminPin()) {
    toast("قم بتعيين رمز PIN أولاً قبل القفل");
    return;
  }
  isAdminUnlocked = false;
  renderAdmin();
  toast("تم قفل لوحة الإدارة");
};

$("#unlockAdminBtn").onclick = () => {
  const val = $("#unlockPinInput").value.trim();
  if (val === getAdminPin()) {
    isAdminUnlocked = true;
    $("#unlockPinInput").value = "";
    renderAdmin();
    toast("تم فتح لوحة الإدارة");
  } else {
    toast("رمز PIN غير صحيح");
  }
};

$("#createClinicForm").onsubmit = e => {
  e.preventDefault();
  const clinics = loadClinics();
  clinics.push({
    id: Date.now(),
    name: $("#newClinicName").value.trim(),
    specialty: $("#newClinicSpec").value,
    area: $("#newClinicArea").value.trim(),
    phone: $("#newClinicPhone").value.trim(),
    fee: 5000,
    deposit: 1500,
    desc: $("#newClinicDesc").value.trim() || "عيادة طبية متخصصة",
    doctors: []
  });
  saveClinics(clinics);
  e.target.reset();
  renderAdmin();
  toast("تم حفظ العيادة الجديدة بنجاح");
};

$("#createDoctorForm").onsubmit = e => {
  e.preventDefault();
  const clinicId = +$("#newDocClinicId").value;
  const clinics = loadClinics();
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) {
    toast("يرجى إنشاء عيادة أولاً");
    return;
  }
  const times = $("#newDocTimes").value.split(",").map(t => t.trim()).filter(Boolean);
  const feeVal = Number($("#newDocFee").value) || 5000;
  const depVal = Number($("#newDocDeposit").value) || 0;

  clinic.doctors.push({
    id: Date.now(),
    name: $("#newDocName").value.trim(),
    spec: $("#newDocSpec").value.trim(),
    fee: feeVal,
    deposit: depVal,
    days: $("#newDocDays").value.trim(),
    times: times.length ? times : ["09:00", "11:00", "16:00"]
  });
  saveClinics(clinics);
  e.target.reset();
  $("#newDocFee").value = 5000;
  $("#newDocDeposit").value = 1500;
  $("#newDocDays").value = "السبت - الخميس";
  $("#newDocTimes").value = "09:00, 10:00, 11:00, 16:00, 18:00";
  renderAdmin();
  toast("تم إضافة الطبيب وربطه بالعيادة");
};

window.deleteClinic = function(id) {
  if (!confirm("هل تريد حذف هذه العيادة؟")) return;
  saveClinics(loadClinics().filter(c => c.id !== id));
  renderAdmin();
  toast("تم حذف العيادة");
};

window.deleteDoctor = function(clinicId, docId) {
  const clinics = loadClinics();
  const clinic = clinics.find(c => c.id === clinicId);
  if (!clinic) return;
  clinic.doctors = clinic.doctors.filter(d => d.id !== docId);
  saveClinics(clinics);
  renderAdmin();
  toast("تم حذف الطبيب");
};

$("#resetBtn").onclick = () => {
  if (confirm("هل تريد استعادة البيانات الافتراضية؟")) {
    localStorage.removeItem("maw3idi_clinics_v3");
    localStorage.removeItem("maw3idi_bookings_v3");
    renderAdmin();
    toast("تمت استعادة البيانات الافتراضية");
  }
};

$("#exportBtn").onclick = () => {
  const rows = [
    ["الاسم", "الهاتف", "العيادة", "الطبيب", "التاريخ", "الوقت", "حالة الدفع", "المبلغ المدفوع"],
    ...sortedBookings().map(b => [b.name, b.phone, b.clinic, b.doctor, b.date, b.time, paymentInfo(b.payment)[0], b.amountPaid || 0])
  ];
  const csv = "\ufeff" + rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = "maw3idi-bookings.csv";
  a.click();
  URL.revokeObjectURL(a.href);
};

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstall = e;
  $("#installBtn").hidden = false;
});
$("#installBtn").onclick = async () => {
  if (deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
  }
};
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

renderHome();

// ================= إضافات الإصدار 8 (مضافة فوق v4 دون حذف أي شيء) =================
let reschedulingBookingId = null;
function getSbCfgV8() { try { return JSON.parse(localStorage.getItem('maw3idi_sb_cfg_v8') || 'null'); } catch { return null; } }
function saveSbCfgV8(cfg) { if (cfg) localStorage.setItem('maw3idi_sb_cfg_v8', JSON.stringify(cfg)); else localStorage.removeItem('maw3idi_sb_cfg_v8'); updateSyncBadgeV8(); }
function updateSyncBadgeV8() { const cfg = getSbCfgV8(); const el = $('#syncStatusBadge'); if (!el) return; if (cfg && cfg.url && cfg.key) { el.textContent = '☁️ Supabase متصل'; el.className = 'sync-pill cloud'; } else { el.textContent = '💾 محلي'; el.className = 'sync-pill'; } }
function sbHdrV8(cfg) { return { 'apikey': cfg.key, 'Authorization': `Bearer ${cfg.key}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' }; }
async function pushCatalogV8(clinics) { const cfg = getSbCfgV8(); if (!cfg || !cfg.url || !cfg.key) return; const base = cfg.url.replace(/\/+$/, ''); try { await fetch(`${base}/rest/v1/clinics?on_conflict=id`, { method: 'POST', headers: sbHdrV8(cfg), body: JSON.stringify(clinics.map(c => ({ id: String(c.id), name: c.name, specialty: c.specialty || '', area: c.area || '', phone: c.phone || '', fee: Number(c.fee || 0), deposit: Number(c.deposit || 0), description: c.desc || '', active: true }))) }); const docs = []; clinics.forEach(c => (c.doctors || []).forEach(d => docs.push({ id: String(d.id), clinic_id: String(c.id), name: d.name, specialty: d.spec || c.specialty || '', fee: Number(d.fee ?? c.fee ?? 0), deposit: Number(d.deposit ?? c.deposit ?? 0), days: d.days || 'السبت - الخميس', times: Array.isArray(d.times) ? d.times : ['09:00', '11:00', '16:00'], active: d.active !== false }))); if (docs.length) await fetch(`${base}/rest/v1/doctors?on_conflict=id`, { method: 'POST', headers: sbHdrV8(cfg), body: JSON.stringify(docs) }); } catch (_) {} }
async function pullCatalogV8() { const cfg = getSbCfgV8(); if (!cfg || !cfg.url || !cfg.key) return false; const base = cfg.url.replace(/\/+$/, ''); try { const [cRes, dRes] = await Promise.all([fetch(`${base}/rest/v1/clinics?select=*`, { headers: sbHdrV8(cfg) }), fetch(`${base}/rest/v1/doctors?select=*`, { headers: sbHdrV8(cfg) })]); if (!cRes.ok || !dRes.ok) return false; const cRows = await cRes.json(); const dRows = await dRes.json(); if (!Array.isArray(cRows) || !cRows.length) return false; const merged = cRows.map(c => ({ id: Number(c.id) || c.id, name: c.name, specialty: c.specialty || 'الطب العام', area: c.area || '', phone: c.phone || '', fee: Number(c.fee || 5000), deposit: Number(c.deposit || 1500), desc: c.description || c.desc || '', doctors: (Array.isArray(dRows) ? dRows : []).filter(d => String(d.clinic_id) === String(c.id)).map(d => ({ id: Number(d.id) || d.id, name: d.name, spec: d.specialty || '', fee: Number(d.fee ?? c.fee ?? 5000), deposit: Number(d.deposit ?? c.deposit ?? 1500), days: d.days || 'السبت - الخميس', times: Array.isArray(d.times) ? d.times : ['09:00', '11:00', '16:00'], active: d.active !== false })) })); localStorage.setItem('maw3idi_clinics_v3', JSON.stringify(merged)); return true; } catch (_) { return false; } }
async function pushBookingsV8(list) { const cfg = getSbCfgV8(); if (!cfg || !cfg.url || !cfg.key || !Array.isArray(list)) return; const base = cfg.url.replace(/\/+$/, ''); const payload = list.map(b => ({ id: String(b.id), doctor_ref_id: String(b.doctorId || ''), clinic_name: b.clinic || '', doctor_name: b.doctor || '', patient_name: b.name, patient_phone: b.phone, booking_date: b.date, booking_time: b.time, payment_status: b.payment === 'full' ? 'paid' : b.payment, booking_status: b.status || 'confirmed', fee: Number(b.fee || 0), amount_paid: Number(b.amountPaid || 0), created_at: b.createdAt || new Date().toISOString() })); try { const r = await fetch(`${base}/rest/v1/bookings?on_conflict=id`, { method: 'POST', headers: sbHdrV8(cfg), body: JSON.stringify(payload) }); if (!r.ok) await fetch(`${base}/rest/v1/demo_bookings?on_conflict=id`, { method: 'POST', headers: sbHdrV8(cfg), body: JSON.stringify(payload) }); } catch (_) {} }
async function pullBookingsV8() { const cfg = getSbCfgV8(); if (!cfg || !cfg.url || !cfg.key) return false; const base = cfg.url.replace(/\/+$/, ''); try { let r = await fetch(`${base}/rest/v1/bookings?select=*&order=created_at.asc`, { headers: sbHdrV8(cfg) }); if (!r.ok) r = await fetch(`${base}/rest/v1/demo_bookings?select=*&order=created_at.asc`, { headers: sbHdrV8(cfg) }); if (!r.ok) return false; const rows = await r.json(); if (!Array.isArray(rows)) return false; const mapped = rows.map(x => ({ id: Number(x.id) || x.id, doctorId: Number(x.doctor_ref_id) || x.doctor_ref_id, clinic: x.clinic_name, doctor: x.doctor_name, name: x.patient_name, phone: x.patient_phone, date: x.booking_date, time: x.booking_time, payment: x.payment_status === 'paid' ? 'full' : (x.payment_status || 'unpaid'), status: x.booking_status || 'confirmed', fee: Number(x.fee || 0), amountPaid: Number(x.amount_paid || 0), createdAt: x.created_at || new Date().toISOString(), paidAt: x.payment_status === 'unpaid' ? null : (x.created_at || new Date().toISOString()) })); localStorage.setItem('maw3idi_bookings_v3', JSON.stringify(mapped)); return true; } catch (_) { return false; } }
const _origSaveClinicsV8 = saveClinics; saveClinics = function(list) { _origSaveClinicsV8(list); pushCatalogV8(list); };
const _origSaveBookingsV8 = saveBookings; saveBookings = function(list) { _origSaveBookingsV8(list); pushBookingsV8(list); };
const _origRenderBookingsV8 = renderBookings; renderBookings = function() { _origRenderBookingsV8(); const all = loadBookings(); const phoneQ = ($('#myPhoneFilter')?.value || '').trim(); const listEl = $('#bookingList'); if (!listEl || !all.length) return; const filtered = sortedBookings(all).filter(b => !phoneQ || String(b.phone || '').includes(phoneQ)); if (!filtered.length) { listEl.innerHTML = `<div class='empty'>لا توجد حجوزات مطابقة لرقم الهاتف المدخل.</div>`; return; } const cards = listEl.querySelectorAll('.booking-card'); cards.forEach((card, idx) => { const b = filtered[idx]; if (!b) return; const sameDayQueue = sortedBookings(all).filter(x => x.doctorId === b.doctorId && x.date === b.date && x.status !== 'cancelled' && x.status !== 'completed'); const qIdx = sameDayQueue.findIndex(x => x.id === b.id); const qBox = card.querySelector('.queue'); if (qBox && qIdx >= 0 && !qBox.innerHTML.includes('ترتيب طابور الطبيب')) qBox.innerHTML += `<br>ترتيب طابور الطبيب في نفس اليوم: <b>#${qIdx + 1}</b> (أمامك <b>${qIdx}</b> منتظر)`; if (b.status === 'confirmed' && !card.querySelector('.patient-actions-v8')) { const act = document.createElement('div'); act.className = 'patient-actions-v8'; act.style.cssText = 'display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;'; act.innerHTML = `<button type='button' class='btn outline-blue btn-sm' onclick='openRescheduleModalV8(${b.id})'>🔄 إعادة جدولة</button><button type='button' class='btn soft-red btn-sm' onclick='patientCancelBookingV8(${b.id})'>إلغاء الموعد</button>`; card.appendChild(act); } }); };
if ($('#myFilterBtn')) $('#myFilterBtn').onclick = renderBookings;
if ($('#myPhoneFilter')) $('#myPhoneFilter').oninput = renderBookings;
if ($('#myShowAllBtn')) $('#myShowAllBtn').onclick = () => { $('#myPhoneFilter').value = ''; renderBookings(); };
window.patientCancelBookingV8 = function(id) { if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return; const all = loadBookings(); const item = all.find(b => b.id === id); if (!item) return; item.status = 'cancelled'; saveBookings(all); renderBookings(); toast('تم إلغاء الموعد وإتاحة الوقت مجدداً'); };
window.openRescheduleModalV8 = function(id) { const all = loadBookings(); const b = all.find(x => x.id === id); if (!b) return; reschedulingBookingId = id; const minDate = new Date().toISOString().slice(0, 10); $('#rescheduleSubtitle').textContent = `${b.name} — ${b.doctor} (${b.clinic})`; $('#reschedDate').min = minDate; $('#reschedDate').value = b.date >= minDate ? b.date : minDate; const refreshSlots = () => { let slots = ['09:00', '10:00', '11:00', '16:00', '18:00']; for (const c of loadClinics()) { const d = (c.doctors || []).find(x => x.id === b.doctorId); if (d && Array.isArray(d.times) && d.times.length) { slots = d.times; break; } } const chosenDate = $('#reschedDate').value; const taken = loadBookings().filter(x => x.id !== b.id && x.doctorId === b.doctorId && x.date === chosenDate && x.status !== 'cancelled').map(x => x.time); $('#reschedTime').innerHTML = slots.map(t => { const busy = taken.includes(t); return `<option value='${t}' ${busy ? 'disabled' : ''} ${t === b.time && !busy ? 'selected' : ''}>${t} ${busy ? '(محجوز)' : ''}</option>`; }).join(''); }; refreshSlots(); $('#reschedDate').onchange = refreshSlots; $('#rescheduleModal').hidden = false; };
if ($('#closeReschedBtn')) $('#closeReschedBtn').onclick = () => { $('#rescheduleModal').hidden = true; reschedulingBookingId = null; };
if ($('#saveReschedBtn')) $('#saveReschedBtn').onclick = () => { const newDate = $('#reschedDate').value; const sel = $('#reschedTime'); const newTime = sel.value; if (!newDate || !newTime || sel.options[sel.selectedIndex]?.disabled) { toast('يرجى اختيار تاريخ ووقت متاح'); return; } const all = loadBookings(); const item = all.find(b => b.id === reschedulingBookingId); if (!item) return; item.date = newDate; item.time = newTime; saveBookings(all); $('#rescheduleModal').hidden = true; reschedulingBookingId = null; renderBookings(); toast('تم تحديث موعدك بنجاح'); };
const _origRenderSelectedDoctorQueueV8 = renderSelectedDoctorQueue; renderSelectedDoctorQueue = function() { _origRenderSelectedDoctorQueueV8(); const filterDate = $('#dqDateFilter')?.value || ''; if (!filterDate) return; const docId = +$('#dqDoctorSelect').value; const items = $('#dqBookingsList')?.querySelectorAll('.doc-booking-item') || []; const rows = sortedBookings().filter(b => b.doctorId === docId); items.forEach((el, idx) => { const b = rows[idx]; if (b && b.date !== filterDate) el.style.display = 'none'; else el.style.display = ''; }); };
if ($('#dqDateFilter')) $('#dqDateFilter').onchange = renderSelectedDoctorQueue;
if ($('#dqClearDateBtn')) $('#dqClearDateBtn').onclick = () => { $('#dqDateFilter').value = ''; renderSelectedDoctorQueue(); };
const _origRenderAdminV8 = renderAdmin; renderAdmin = function() { _origRenderAdminV8(); if (!isAdminUnlocked) return; const cfg = getSbCfgV8(); if ($('#sbUrlInput')) $('#sbUrlInput').value = cfg?.url || ''; if ($('#sbKeyInput')) $('#sbKeyInput').value = cfg?.key || ''; const clinics = loadClinics(); const container = $('#adminClinicsList'); if (!container) return; const blocks = container.children; clinics.forEach((c, cIdx) => { const block = blocks[cIdx]; if (!block || !c.doctors) return; const docRows = block.querySelectorAll('div[style*="border-right"] > div'); c.doctors.forEach((d, dIdx) => { const row = docRows[dIdx]; if (!row || row.querySelector('.edit-doc-btn-v8')) return; const editBtn = document.createElement('button'); editBtn.type = 'button'; editBtn.className = 'btn outline-blue edit-doc-btn-v8'; editBtn.style.cssText = 'padding:3px 8px; font-size:11px; margin-left:4px;'; editBtn.textContent = 'تعديل'; editBtn.onclick = () => { $('#editDocClinicId').value = c.id; $('#editDocId').value = d.id; $('#editDocName').value = d.name; $('#editDocSpec').value = d.spec || ''; $('#editDocActive').value = String(d.active !== false); $('#editDocFee').value = Number(d.fee ?? c.fee ?? 5000); $('#editDocDeposit').value = Number(d.deposit ?? c.deposit ?? 1500); $('#editDocDays').value = d.days || 'السبت - الخميس'; $('#editDocTimes').value = (d.times || []).join(', '); $('#editDoctorPanel').hidden = false; $('#editDoctorPanel').scrollIntoView({ behavior: 'smooth' }); }; const delBtn = row.querySelector('button'); if (delBtn && delBtn.parentNode) delBtn.parentNode.insertBefore(editBtn, delBtn); }); }); };
if ($('#cancelEditDocBtn')) $('#cancelEditDocBtn').onclick = () => { $('#editDoctorPanel').hidden = true; };
if ($('#editDoctorForm')) $('#editDoctorForm').onsubmit = e => { e.preventDefault(); const clinicId = +$('#editDocClinicId').value; const docId = +$('#editDocId').value; const clinics = loadClinics(); const clinic = clinics.find(c => c.id === clinicId); const doc = clinic?.doctors?.find(d => d.id === docId); if (!doc) return; const times = $('#editDocTimes').value.split(',').map(t => t.trim()).filter(Boolean); doc.name = $('#editDocName').value.trim(); doc.spec = $('#editDocSpec').value.trim(); doc.active = $('#editDocActive').value === 'true'; doc.fee = Number($('#editDocFee').value) || 0; doc.deposit = Number($('#editDocDeposit').value) || 0; doc.days = $('#editDocDays').value.trim(); doc.times = times.length ? times : ['09:00', '11:00', '16:00']; saveClinics(clinics); $('#editDoctorPanel').hidden = true; renderAdmin(); toast('تم حفظ تعديلات الطبيب والمواعيد'); };
if ($('#saveSbBtn')) $('#saveSbBtn').onclick = async () => { const url = $('#sbUrlInput').value.trim(); const key = $('#sbKeyInput').value.trim(); if (!url || !key) { toast('يرجى إدخال رابط Supabase والمفتاح العام'); return; } saveSbCfgV8({ url, key }); await Promise.all([pushCatalogV8(loadClinics()), pushBookingsV8(loadBookings())]); toast('تم حفظ إعدادات Supabase ومزامنة البيانات'); };
if ($('#syncSbBtn')) $('#syncSbBtn').onclick = async () => { const [okCat, okBook] = await Promise.all([pullCatalogV8(), pullBookingsV8()]); if (okCat || okBook) { renderHome(); renderBookings(); renderSelectedDoctorQueue(); renderAdmin(); toast('تمت مزامنة البيانات من Supabase'); } else { toast('تعذر المزامنة؛ تأكد من البيانات وجداول قاعدة البيانات'); } };
if ($('#clearSbBtn')) $('#clearSbBtn').onclick = () => { saveSbCfgV8(null); $('#sbUrlInput').value = ''; $('#sbKeyInput').value = ''; toast('تم فصل الربط السحابي والاعتماد على التخزين المحلي'); };
updateSyncBadgeV8();

// ================= إضافات الإصدار 9: تعديل بيانات العيادة والطبيب للأدمن =================
window.openEditClinicV9 = function(clinicId) {
  const clinics = loadClinics();
  const c = clinics.find(x => x.id === clinicId);
  if (!c) return;
  if ($('#editDoctorPanel')) $('#editDoctorPanel').hidden = true;
  $('#editClinicId').value = c.id;
  $('#editClinicName').value = c.name || '';
  $('#editClinicSpec').value = c.specialty || 'الطب العام';
  $('#editClinicArea').value = c.area || '';
  $('#editClinicPhone').value = c.phone || '';
  $('#editClinicFee').value = Number(c.fee ?? 5000);
  $('#editClinicDeposit').value = Number(c.deposit ?? 1500);
  $('#editClinicDesc').value = c.desc || '';
  const panel = $('#editClinicPanel');
  panel.hidden = false;
  panel.scrollIntoView({ behavior: 'smooth' });
};
if ($('#cancelEditClinicBtn')) {
  $('#cancelEditClinicBtn').onclick = () => { $('#editClinicPanel').hidden = true; };
}
if ($('#editClinicForm')) {
  $('#editClinicForm').onsubmit = e => {
    e.preventDefault();
    const clinicId = +$('#editClinicId').value;
    const clinics = loadClinics();
    const c = clinics.find(x => x.id === clinicId);
    if (!c) return;
    c.name = $('#editClinicName').value.trim();
    c.specialty = $('#editClinicSpec').value;
    c.area = $('#editClinicArea').value.trim();
    c.phone = $('#editClinicPhone').value.trim();
    c.fee = Number($('#editClinicFee').value) || 0;
    c.deposit = Number($('#editClinicDeposit').value) || 0;
    c.desc = $('#editClinicDesc').value.trim() || 'عيادة طبية متخصصة';
    saveClinics(clinics);
    $('#editClinicPanel').hidden = true;
    renderAdmin();
    toast('تم تحديث بيانات العيادة بنجاح');
  };
}
const _origRenderAdminV9 = renderAdmin;
renderAdmin = function() {
  _origRenderAdminV9();
  if (!isAdminUnlocked) return;
  const clinics = loadClinics();
  const container = $('#adminClinicsList');
  if (!container) return;
  const blocks = container.children;
  clinics.forEach((c, cIdx) => {
    const block = blocks[cIdx];
    if (!block) return;
    const topRow = block.firstElementChild;
    if (topRow && !topRow.querySelector('.edit-clinic-btn-v9')) {
      const editClinicBtn = document.createElement('button');
      editClinicBtn.type = 'button';
      editClinicBtn.className = 'btn outline-blue btn-sm edit-clinic-btn-v9';
      editClinicBtn.textContent = 'تعديل';
      editClinicBtn.onclick = () => window.openEditClinicV9(c.id);
      const delClinicBtn = topRow.querySelector('button');
      if (delClinicBtn && delClinicBtn.parentNode) {
        const actionWrap = document.createElement('div');
        actionWrap.style.cssText = 'display:flex; gap:6px; align-items:center;';
        delClinicBtn.parentNode.insertBefore(actionWrap, delClinicBtn);
        actionWrap.appendChild(editClinicBtn);
        actionWrap.appendChild(delClinicBtn);
      }
    }
  });
};
