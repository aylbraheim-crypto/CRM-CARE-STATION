import { useState, useEffect } from "react";

const DEPARTMENTS = {
  fuel: { label: "جودة الوقود", icon: "⛽", color: "#F97316" },
  safety: { label: "السلامة والأمن", icon: "🛡️", color: "#EF4444" },
  service: { label: "خدمة العملاء", icon: "🤝", color: "#3B82F6" },
  maintenance: { label: "الصيانة والتشغيل", icon: "🔧", color: "#8B5CF6" },
  billing: { label: "الفوترة والمدفوعات", icon: "💳", color: "#10B981" },
  cleanliness: { label: "النظافة والبيئة", icon: "🧹", color: "#06B6D4" },
};

const STATUS_CONFIG = {
  new: { label: "جديد", color: "#64748B", bg: "#1E293B", icon: "🆕" },
  inprogress: { label: "قيد المعالجة", color: "#F59E0B", bg: "#292000", icon: "⚙️" },
  pending: { label: "في الانتظار", color: "#3B82F6", bg: "#0D1F3C", icon: "⏳" },
  resolved: { label: "تم الحل", color: "#10B981", bg: "#052E16", icon: "✅" },
  closed: { label: "مغلق", color: "#6B7280", bg: "#111827", icon: "🔒" },
};

const SAMPLE_TICKETS = [
  {
    id: "TKT-0001",
    title: "جودة الوقود منخفضة في محطة الرياض شمال",
    description: "لاحظت أن الوقود لم يعمل بكفاءة بعد التزود منذ أسبوع",
    department: "fuel",
    status: "inprogress",
    priority: "high",
    date: "2026-04-20",
    customer: "أحمد الحربي",
    phone: "0501234567",
    station: "محطة الرياض شمال",
    updates: [
      { date: "2026-04-20", text: "تم استلام الشكوى وإحالتها لقسم جودة الوقود", by: "فريق خدمة العملاء" },
      { date: "2026-04-21", text: "جاري أخذ عينات من الوقود وإرسالها للمختبر", by: "قسم جودة الوقود" },
    ],
  },
  {
    id: "TKT-0002",
    title: "طفاية الحريق معطلة في منطقة الضخ",
    description: "وجدت طفاية الحريق الرئيسية في منطقة الضخ دون ضغط",
    department: "safety",
    status: "resolved",
    priority: "critical",
    date: "2026-04-18",
    customer: "محمد العتيبي",
    phone: "0559876543",
    station: "محطة جدة الغربية",
    updates: [
      { date: "2026-04-18", text: "تم استلام البلاغ وإحالته فوراً لقسم السلامة", by: "فريق خدمة العملاء" },
      { date: "2026-04-18", text: "تم توجيه فريق السلامة للمحطة فوراً", by: "قسم السلامة والأمن" },
      { date: "2026-04-19", text: "تم استبدال طفاية الحريق وإعادة الفحص الكامل", by: "قسم السلامة والأمن" },
    ],
  },
  {
    id: "TKT-0003",
    title: "عدم إصدار الفاتورة بشكل صحيح",
    description: "تم خصم مبلغ إضافي من بطاقتي دون ما يقابله من خدمة",
    department: "billing",
    status: "pending",
    priority: "medium",
    date: "2026-04-21",
    customer: "سارة القحطاني",
    phone: "0541112233",
    station: "محطة الدمام المركزية",
    updates: [
      { date: "2026-04-21", text: "تم استلام الشكوى وإحالتها لقسم الفوترة", by: "فريق خدمة العملاء" },
    ],
  },
];

const PRIORITIES = [
  { value: "low", label: "منخفض", color: "#10B981" },
  { value: "medium", label: "متوسط", color: "#F59E0B" },
  { value: "high", label: "عالي", color: "#F97316" },
  { value: "critical", label: "حرج", color: "#EF4444" },
];

const STATIONS = [
  "محطة الرياض شمال", "محطة الرياض جنوب", "محطة الرياض شرق",
  "محطة جدة الغربية", "محطة جدة الشمالية",
  "محطة الدمام المركزية", "محطة الخبر", "محطة القطيف",
];

export default function App() {
  const [view, setView] = useState("dashboard");
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", department: "", priority: "medium", customer: "", phone: "", station: "", email: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [newTicketId, setNewTicketId] = useState("");

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === "new").length,
    inprogress: tickets.filter(t => t.status === "inprogress").length,
    resolved: tickets.filter(t => t.status === "resolved" || t.status === "closed").length,
    critical: tickets.filter(t => t.priority === "critical").length,
  };

  const filtered = tickets.filter(t => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchDept = filterDept === "all" || t.department === filterDept;
    const matchSearch = !search || t.title.includes(search) || t.id.includes(search) || t.customer.includes(search);
    return matchStatus && matchDept && matchSearch;
  });

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.department || !form.customer || !form.phone || !form.station) return;
    const id = `TKT-${String(tickets.length + 1).padStart(4, "0")}`;
    const ticket = {
      ...form,
      id,
      status: "new",
      date: new Date().toISOString().split("T")[0],
      updates: [{ date: new Date().toISOString().split("T")[0], text: `تم استلام ${form.title.includes("شكوى") ? "الشكوى" : "الملاحظة"} وإحالتها لـ ${DEPARTMENTS[form.department]?.label}`, by: "فريق خدمة العملاء" }],
    };
    setTickets(prev => [ticket, ...prev]);
    setNewTicketId(id);
    setSubmitted(true);
    setForm({ title: "", description: "", department: "", priority: "medium", customer: "", phone: "", station: "", email: "" });
  };

  const handleUpdate = () => {
    if (!updateText && !newStatus) return;
    setTickets(prev => prev.map(t => {
      if (t.id !== selectedTicket.id) return t;
      const updated = {
        ...t,
        status: newStatus || t.status,
        updates: [...t.updates, { date: new Date().toISOString().split("T")[0], text: updateText || `تم تغيير الحالة إلى: ${STATUS_CONFIG[newStatus]?.label}`, by: "فريق خدمة العملاء" }],
      };
      setSelectedTicket(updated);
      return updated;
    }));
    setUpdateText("");
    setNewStatus("");
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#080C14", fontFamily: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', Tahoma, sans-serif", color: "#E2E8F0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0F172A; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        input, textarea, select { outline: none; }
        .card { background: #0F172A; border: 1px solid #1E293B; border-radius: 12px; }
        .btn-primary { background: linear-gradient(135deg, #F97316, #EA580C); color: white; border: none; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: #94A3B8; border: 1px solid #1E293B; border-radius: 8px; padding: 10px 20px; cursor: pointer; font-family: inherit; font-size: 14px; transition: all 0.2s; }
        .btn-ghost:hover { background: #1E293B; color: #E2E8F0; }
        .nav-item { padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .nav-item:hover { background: #1E293B; }
        .nav-item.active { background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; }
        .stat-card { background: #0F172A; border: 1px solid #1E293B; border-radius: 14px; padding: 20px; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .input-field { background: #0F172A; border: 1px solid #1E293B; border-radius: 8px; padding: 12px 16px; color: #E2E8F0; font-family: inherit; font-size: 14px; width: 100%; transition: border-color 0.2s; }
        .input-field:focus { border-color: #F97316; }
        .input-field::placeholder { color: #475569; }
        select.input-field option { background: #0F172A; }
        .ticket-row { padding: 16px 20px; border-bottom: 1px solid #1E293B; cursor: pointer; transition: background 0.2s; display: grid; grid-template-columns: 90px 1fr 130px 100px 90px 90px; gap: 12px; align-items: center; }
        .ticket-row:hover { background: #111827; }
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: #F97316; flex-shrink: 0; margin-top: 4px; }
        .timeline-line { width: 2px; background: #1E293B; margin: 4px auto; height: 100%; min-height: 20px; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slideIn 0.4s ease forwards; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 2s infinite; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0A0F1A", borderBottom: "1px solid #1E293B", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #F97316, #EA580C)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⛽</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#F1F5F9" }}>فيول كير</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>نظام خدمة العملاء</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[["dashboard", "📊", "لوحة التحكم"], ["new", "➕", "طلب جديد"], ["tickets", "📋", "الطلبات"], ["track", "🔍", "تتبع الطلب"]].map(([v, icon, label]) => (
            <button key={v} className={`nav-item ${view === v ? "active" : ""}`} onClick={() => { setView(v); setSubmitted(false); }}>
              <span>{icon}</span><span style={{ display: window.innerWidth < 640 ? "none" : "inline" }}>{label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {stats.critical > 0 && <div className="badge pulse" style={{ background: "#3F0000", color: "#EF4444" }}>⚠️ {stats.critical} حرج</div>}
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1E293B, #0F172A)", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div className="slide-in">
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F1F5F9" }}>لوحة التحكم</h1>
              <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>نظرة عامة على جميع الطلبات والشكاوى</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "إجمالي الطلبات", value: stats.total, icon: "📋", color: "#3B82F6", gradient: "#1D4ED8" },
                { label: "طلبات جديدة", value: stats.new, icon: "🆕", color: "#64748B", gradient: "#334155" },
                { label: "قيد المعالجة", value: stats.inprogress, icon: "⚙️", color: "#F59E0B", gradient: "#B45309" },
                { label: "تم الحل", value: stats.resolved, icon: "✅", color: "#10B981", gradient: "#047857" },
                { label: "حالات حرجة", value: stats.critical, icon: "⚠️", color: "#EF4444", gradient: "#B91C1C" },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>📊 توزيع الطلبات حسب القسم</h3>
                {Object.entries(DEPARTMENTS).map(([key, dept]) => {
                  const count = tickets.filter(t => t.department === key).length;
                  const pct = tickets.length ? Math.round(count / tickets.length * 100) : 0;
                  return (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                        <span>{dept.icon} {dept.label}</span><span style={{ color: dept.color, fontWeight: 700 }}>{count}</span>
                      </div>
                      <div style={{ background: "#1E293B", borderRadius: 20, height: 6 }}>
                        <div style={{ width: `${pct}%`, background: dept.color, borderRadius: 20, height: "100%", transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>🕐 آخر الطلبات</h3>
                {tickets.slice(0, 4).map(t => (
                  <div key={t.id} onClick={() => { setSelectedTicket(t); setView("tickets"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1E293B", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{t.title.length > 30 ? t.title.slice(0, 30) + "..." : t.title}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{t.id} · {t.customer}</div>
                    </div>
                    <div className="badge" style={{ background: STATUS_CONFIG[t.status].bg, color: STATUS_CONFIG[t.status].color }}>{STATUS_CONFIG[t.status].icon} {STATUS_CONFIG[t.status].label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW TICKET */}
        {view === "new" && !submitted && (
          <div className="slide-in" style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#F1F5F9" }}>تقديم ملاحظة أو شكوى</h1>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>سيتم إحالة طلبك للقسم المختص ومتابعة حالته حتى الإغلاق</p>

            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>الاسم الكامل *</label>
                  <input className="input-field" placeholder="أدخل اسمك الكامل" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>رقم الجوال *</label>
                  <input className="input-field" placeholder="05XXXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>البريد الإلكتروني (اختياري)</label>
                <input className="input-field" placeholder="example@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>المحطة *</label>
                <select className="input-field" value={form.station} onChange={e => setForm(f => ({ ...f, station: e.target.value }))}>
                  <option value="">اختر المحطة</option>
                  {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>القسم المختص *</label>
                  <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    <option value="">اختر القسم</option>
                    {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>الأولوية</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>عنوان الطلب *</label>
                <input className="input-field" placeholder="وصف مختصر للمشكلة أو الملاحظة" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: "#94A3B8", marginBottom: 6, display: "block", fontWeight: 600 }}>تفاصيل الطلب *</label>
                <textarea className="input-field" rows={5} placeholder="اشرح المشكلة أو الملاحظة بالتفصيل..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: "vertical" }} />
              </div>

              {form.department && (
                <div style={{ background: "#0A1628", border: "1px solid #1E3A5F", borderRadius: 8, padding: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ fontSize: 20 }}>{DEPARTMENTS[form.department]?.icon}</span>
                  <span style={{ color: "#93C5FD" }}>سيتم إحالة طلبك إلى <strong>{DEPARTMENTS[form.department]?.label}</strong> ومتابعته فوراً</span>
                </div>
              )}

              <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%", padding: 14, fontSize: 15 }}>
                إرسال الطلب ←
              </button>
            </div>
          </div>
        )}

        {/* SUBMITTED SUCCESS */}
        {view === "new" && submitted && (
          <div className="slide-in" style={{ maxWidth: 500, margin: "60px auto", textAlign: "center" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#10B981", marginBottom: 12 }}>تم إرسال طلبك بنجاح!</h2>
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 8 }}>رقم الطلب</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#F97316", letterSpacing: 2 }}>{newTicketId}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 12 }}>احتفظ بهذا الرقم لمتابعة حالة طلبك</div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn-primary" onClick={() => { setView("track"); setSubmitted(false); }}>تتبع الطلب</button>
              <button className="btn-ghost" onClick={() => setSubmitted(false)}>طلب جديد</button>
            </div>
          </div>
        )}

        {/* TICKETS LIST */}
        {view === "tickets" && !selectedTicket && (
          <div className="slide-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>جميع الطلبات</h1>
                <p style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>{filtered.length} طلب</p>
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center" }}>
                <input className="input-field" placeholder="🔍  بحث بالاسم أو رقم الطلب..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="input-field" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">كل الحالات</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select className="input-field" style={{ width: "auto" }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                  <option value="all">كل الأقسام</option>
                  {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 130px 100px 90px 90px", gap: 12, padding: "12px 20px", borderBottom: "1px solid #1E293B", fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                <span>رقم الطلب</span><span>العنوان</span><span>القسم</span><span>الحالة</span><span>الأولوية</span><span>التاريخ</span>
              </div>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>لا توجد طلبات</div>}
              {filtered.map(t => {
                const dept = DEPARTMENTS[t.department];
                const status = STATUS_CONFIG[t.status];
                const priority = PRIORITIES.find(p => p.value === t.priority);
                return (
                  <div key={t.id} className="ticket-row" onClick={() => setSelectedTicket(t)}>
                    <span style={{ color: "#F97316", fontWeight: 700, fontSize: 13 }}>{t.id}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#E2E8F0" }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{t.customer} · {t.station}</div>
                    </div>
                    <div className="badge" style={{ background: "#0F172A", color: dept?.color, border: `1px solid ${dept?.color}33` }}>{dept?.icon} {dept?.label}</div>
                    <div className="badge" style={{ background: status.bg, color: status.color }}>{status.icon} {status.label}</div>
                    <div className="badge" style={{ color: priority?.color, background: priority?.color + "15" }}>● {priority?.label}</div>
                    <span style={{ fontSize: 12, color: "#64748B" }}>{t.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TICKET DETAIL */}
        {view === "tickets" && selectedTicket && (
          <div className="slide-in">
            <button className="btn-ghost" onClick={() => setSelectedTicket(null)} style={{ marginBottom: 20 }}>← العودة للقائمة</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
              <div>
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <div style={{ color: "#F97316", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{selectedTicket.id}</div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9" }}>{selectedTicket.title}</h2>
                    </div>
                    <div className="badge" style={{ background: STATUS_CONFIG[selectedTicket.status].bg, color: STATUS_CONFIG[selectedTicket.status].color, fontSize: 14, padding: "6px 14px" }}>
                      {STATUS_CONFIG[selectedTicket.status].icon} {STATUS_CONFIG[selectedTicket.status].label}
                    </div>
                  </div>
                  <div style={{ background: "#080C14", borderRadius: 8, padding: 16, fontSize: 14, color: "#CBD5E1", lineHeight: 1.8 }}>{selectedTicket.description}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                    {[["👤 العميل", selectedTicket.customer], ["📱 الجوال", selectedTicket.phone], ["⛽ المحطة", selectedTicket.station]].map(([l, v]) => (
                      <div key={l} style={{ background: "#080C14", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: "#E2E8F0" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#F1F5F9" }}>📍 سجل المتابعة</h3>
                  {selectedTicket.updates.map((u, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div className="timeline-dot" />
                        {i < selectedTicket.updates.length - 1 && <div className="timeline-line" />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 20 }}>
                        <div style={{ background: "#080C14", borderRadius: 8, padding: 14 }}>
                          <div style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{u.text}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748B" }}>
                            <span>بواسطة: {u.by}</span><span>{u.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedTicket.status !== "closed" && (
                    <div style={{ background: "#080C14", borderRadius: 10, padding: 16, marginTop: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#94A3B8" }}>إضافة تحديث</div>
                      <textarea className="input-field" rows={3} placeholder="أدخل ملاحظات التحديث..." value={updateText} onChange={e => setUpdateText(e.target.value)} style={{ marginBottom: 12, resize: "none" }} />
                      <div style={{ display: "flex", gap: 10 }}>
                        <select className="input-field" style={{ flex: 1 }} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                          <option value="">تغيير الحالة (اختياري)</option>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <button className="btn-primary" onClick={handleUpdate}>حفظ التحديث</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#94A3B8" }}>تفاصيل الطلب</h3>
                  {[
                    ["القسم", `${DEPARTMENTS[selectedTicket.department]?.icon} ${DEPARTMENTS[selectedTicket.department]?.label}`],
                    ["الأولوية", PRIORITIES.find(p => p.value === selectedTicket.priority)?.label],
                    ["تاريخ الإنشاء", selectedTicket.date],
                    ["عدد التحديثات", selectedTicket.updates.length],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1E293B", fontSize: 13 }}>
                      <span style={{ color: "#64748B" }}>{l}</span>
                      <span style={{ color: "#E2E8F0", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#94A3B8" }}>إجراءات سريعة</h3>
                  {["inprogress", "pending", "resolved", "closed"].map(s => (
                    <button key={s} className="btn-ghost" style={{ width: "100%", marginBottom: 8, textAlign: "right", color: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color + "44" }}
                      onClick={() => { setNewStatus(s); setUpdateText(`تم تغيير الحالة إلى: ${STATUS_CONFIG[s].label}`); handleUpdate(); }}>
                      {STATUS_CONFIG[s].icon} تحويل إلى "{STATUS_CONFIG[s].label}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRACK */}
        {view === "track" && (
          <div className="slide-in" style={{ maxWidth: 600, margin: "0 auto" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#F1F5F9" }}>تتبع حالة الطلب</h1>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>أدخل رقم الطلب للاطلاع على حالته وآخر التحديثات</p>
            <TrackView tickets={tickets} />
          </div>
        )}
      </div>
    </div>
  );
}

function TrackView({ tickets }) {
  const [trackId, setTrackId] = useState("");
  const [found, setFound] = useState(null);
  const [error, setError] = useState(false);

  const doSearch = () => {
    const t = tickets.find(t => t.id === trackId.trim().toUpperCase());
    if (t) { setFound(t); setError(false); } else { setFound(null); setError(true); }
  };

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <input className="input-field" style={{ flex: 1 }} placeholder="مثال: TKT-0001" value={trackId} onChange={e => setTrackId(e.target.value)} onKeyDown={e => e.key === "Enter" && doSearch()} />
          <button className="btn-primary" onClick={doSearch}>بحث</button>
        </div>
      </div>

      {error && <div style={{ background: "#1F0000", border: "1px solid #EF4444", borderRadius: 10, padding: 16, color: "#EF4444", textAlign: "center" }}>❌ لم يتم العثور على الطلب. تأكد من رقم الطلب وأعد المحاولة</div>}

      {found && (
        <div className="slide-in">
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ color: "#F97316", fontSize: 13, fontWeight: 700 }}>{found.id}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginTop: 4 }}>{found.title}</div>
              </div>
              <div className="badge" style={{ background: STATUS_CONFIG[found.status].bg, color: STATUS_CONFIG[found.status].color, padding: "8px 16px", fontSize: 15 }}>
                {STATUS_CONFIG[found.status].icon} {STATUS_CONFIG[found.status].label}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 16 }}>
              {["new", "inprogress", "pending", "resolved", "closed"].map((s, i) => {
                const steps = ["new", "inprogress", "pending", "resolved", "closed"];
                const currentIdx = steps.indexOf(found.status);
                const active = i <= currentIdx;
                return (
                  <div key={s} style={{ display: "inline-flex", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: active ? STATUS_CONFIG[s].color : "#1E293B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: `2px solid ${active ? STATUS_CONFIG[s].color : "#334155"}`, transition: "all 0.3s" }}>{active ? "✓" : ""}</div>
                      <div style={{ fontSize: 10, color: active ? STATUS_CONFIG[s].color : "#475569", marginTop: 4 }}>{STATUS_CONFIG[s].label}</div>
                    </div>
                    {i < 4 && <div style={{ width: 40, height: 2, background: i < currentIdx ? "#F97316" : "#1E293B", margin: "0 4px 16px" }} />}
                  </div>
                );
              })}
            </div>

            <div style={{ background: "#080C14", borderRadius: 8, padding: 14, fontSize: 14, color: "#94A3B8" }}>{found.description}</div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#F1F5F9" }}>📋 سجل التحديثات</h3>
            {found.updates.map((u, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F97316", flexShrink: 0, marginTop: 4 }} />
                  {i < found.updates.length - 1 && <div style={{ width: 2, background: "#1E293B", flex: 1, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "#080C14", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 6 }}>{u.text}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B" }}>
                      <span>{u.by}</span><span>{u.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
