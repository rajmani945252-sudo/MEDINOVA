import { useState } from "react";
import { EMOJI, SYMBOL } from "@/utils/ui";

const PATIENTS = [
  { id: "P001", name: "Aarav Mehta", age: 34 },
  { id: "P002", name: "Priya Sharma", age: 28 },
  { id: "P003", name: "Rajan Iyer", age: 52 },
];

const REPORTS_DATA = {
  P001: [
    {
      id: "R1",
      name: "Complete Blood Count",
      date: "2025-03-20",
      type: "Blood Test",
      status: "analyzed",
      aiSummary: "Hemoglobin slightly low at 11.8 g/dL indicating mild anemia. WBC count is normal. Platelets within range. Recommend dietary iron supplementation.",
      parameters: [
        { name: "Hemoglobin", value: 11.8, unit: "g/dL", normal: "13.0–17.0", status: "low" },
        { name: "WBC Count", value: 7200, unit: "/µL", normal: "4000–11000", status: "normal" },
        { name: "Platelets", value: 210000, unit: "/µL", normal: "150000–400000", status: "normal" },
        { name: "RBC Count", value: 4.2, unit: "M/µL", normal: "4.5–5.5", status: "low" },
        { name: "Hematocrit", value: 38, unit: "%", normal: "39–49", status: "low" },
      ],
    },
    {
      id: "R2",
      name: "HbA1c (Glycated Hemoglobin)",
      date: "2025-03-20",
      type: "Diabetes Monitoring",
      status: "analyzed",
      aiSummary: "HbA1c at 7.2% indicates moderately controlled Type 2 Diabetes. Target is <7%. Slight improvement from last reading (7.6%). Current medication regimen appears effective.",
      parameters: [
        { name: "HbA1c", value: 7.2, unit: "%", normal: "<7.0", status: "high" },
        { name: "Fasting Glucose", value: 138, unit: "mg/dL", normal: "70–100", status: "high" },
        { name: "Post-meal Glucose", value: 182, unit: "mg/dL", normal: "<140", status: "high" },
      ],
    },
    {
      id: "R3",
      name: "Lipid Profile",
      date: "2025-01-15",
      type: "Cardiovascular",
      status: "pending",
      aiSummary: null,
      parameters: [
        { name: "Total Cholesterol", value: 210, unit: "mg/dL", normal: "<200", status: "high" },
        { name: "LDL", value: 138, unit: "mg/dL", normal: "<100", status: "high" },
        { name: "HDL", value: 42, unit: "mg/dL", normal: ">40", status: "normal" },
        { name: "Triglycerides", value: 165, unit: "mg/dL", normal: "<150", status: "high" },
      ],
    },
  ],
  P002: [
    {
      id: "R4",
      name: "Spirometry Test",
      date: "2025-04-01",
      type: "Pulmonary Function",
      status: "analyzed",
      aiSummary: "FEV1/FVC ratio of 0.68 confirms obstructive pattern consistent with moderate asthma. Bronchodilator response positive (+18% FEV1). Inhaled corticosteroid therapy recommended.",
      parameters: [
        { name: "FEV1", value: 2.1, unit: "L", normal: "3.0–4.5", status: "low" },
        { name: "FVC", value: 3.08, unit: "L", normal: "3.5–5.0", status: "low" },
        { name: "FEV1/FVC", value: 0.68, unit: "ratio", normal: ">0.70", status: "low" },
        { name: "Peak Flow", value: 320, unit: "L/min", normal: "400–600", status: "low" },
      ],
    },
  ],
  P003: [
    {
      id: "R5",
      name: "Echocardiogram",
      date: "2025-03-28",
      type: "Cardiac Imaging",
      status: "analyzed",
      aiSummary: "Ejection fraction 52% (lower limit of normal). Wall motion normal. Mild mitral regurgitation noted. Post-angioplasty stent patent. Good recovery trajectory.",
      parameters: [
        { name: "Ejection Fraction", value: 52, unit: "%", normal: "55–70", status: "low" },
        { name: "LV End Diastolic Vol.", value: 108, unit: "mL", normal: "95–130", status: "normal" },
        { name: "E/A Ratio", value: 0.9, unit: "", normal: "1.0–2.0", status: "low" },
      ],
    },
    {
      id: "R6",
      name: "Lipid Profile",
      date: "2025-03-28",
      type: "Cardiovascular",
      status: "analyzed",
      aiSummary: "LDL well controlled at 78 mg/dL on Atorvastatin. HDL improved. Triglycerides borderline. Statin therapy effective. Continue current dose.",
      parameters: [
        { name: "Total Cholesterol", value: 165, unit: "mg/dL", normal: "<200", status: "normal" },
        { name: "LDL", value: 78, unit: "mg/dL", normal: "<70 (cardiac)", status: "high" },
        { name: "HDL", value: 48, unit: "mg/dL", normal: ">40", status: "normal" },
        { name: "Triglycerides", value: 155, unit: "mg/dL", normal: "<150", status: "high" },
      ],
    },
  ],
};

// ── Colour tokens ──────────────────────────────────────────────────────────────
const C = {
  teal:       "#0d9488",
  tealDark:   "#0f766e",
  tealDeep:   "#134e4a",
  tealLight:  "#ccfbf1",
  tealXLight: "#f0fdf9",
  mint:       "#a7f3d0",
  mintMid:    "#6ee7b7",
  mintDeep:   "#059669",
  bg:         "#f0fdf9",
  bgDeep:     "#e0faf3",
  white:      "#ffffff",
  border:     "#99f6e4",
  textMain:   "#134e4a",
  textSub:    "#4d7c72",
  textMuted:  "#7fb3aa",
};

function avatarColor(name) {
  const colors = [C.teal, C.mintDeep, "#0891b2", "#0369a1", "#047857"];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatusBadge({ status }) {
  const cfg = {
    normal:   { bg: "#dcfce7", color: "#166534", label: "Normal" },
    high:     { bg: "#fff7ed", color: "#c2410c", label: "High" },
    low:      { bg: "#fefce8", color: "#a16207", label: "Low" },
    critical: { bg: "#fef2f2", color: "#b91c1c", label: "Critical" },
  };
  const c = cfg[status] || cfg.normal;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: "6px", padding: "2px 9px", fontSize: "11px", fontWeight: "700" }}>
      {c.label}
    </span>
  );
}

function BarIndicator({ status }) {
  const config = {
    normal:   { color: C.teal,    pct: 50 },
    high:     { color: "#f97316", pct: 82 },
    low:      { color: "#eab308", pct: 18 },
    critical: { color: "#ef4444", pct: 95 },
  };
  const c = config[status] || config.normal;
  return (
    <div style={{ width: "80px", height: "6px", background: C.tealLight, borderRadius: "3px", overflow: "hidden" }}>
      <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: "3px", transition: "width 0.4s" }} />
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────────────
function PatientRecordModal({ patient, report, onClose }) {
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(onClose, 1500); };
  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <div>
            <div style={S.modalTitle}>{EMOJI.clipboard} Add to Patient Record</div>
            <div style={S.modalSub}>{patient.name} {SYMBOL.bullet} {report.name}</div>
          </div>
          <button onClick={onClose} style={S.closeBtn}>{SYMBOL.cross}</button>
        </div>
        <div style={S.modalBody}>
          <div style={S.infoBox}>
            <div style={S.infoRow}><span style={S.infoLabel}>Report</span><span>{report.name}</span></div>
            <div style={S.infoRow}><span style={S.infoLabel}>Type</span><span>{report.type}</span></div>
            <div style={S.infoRow}><span style={S.infoLabel}>Date</span><span>{report.date}</span></div>
            <div style={S.infoRow}><span style={S.infoLabel}>Status</span>
              <span style={{ color: report.status === "analyzed" ? C.mintDeep : "#a16207", fontWeight: "600" }}>
                {report.status === "analyzed" ? `${SYMBOL.check} Analyzed` : `${SYMBOL.hourglass} Pending`}
              </span>
            </div>
          </div>
          {report.aiSummary && (
            <div style={S.aiPreview}>
              <div style={S.aiPreviewLabel}>{EMOJI.robot} AI Summary</div>
              <p style={S.aiPreviewText}>{report.aiSummary}</p>
            </div>
          )}
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Doctor's Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add clinical observations, follow-up actions..."
              style={S.textarea} rows={4} />
          </div>
        </div>
        <div style={S.modalFooter}>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={S.saveBtn} disabled={saved}>
            {saved ? `${SYMBOL.check} Saved!` : "Save to Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrescriptionModal({ patient, report, onClose }) {
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const addMed = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "" }]);
  const removeMed = i => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i, field, val) => { const u = [...medicines]; u[i][field] = val; setMedicines(u); };
  const handleSave = () => { setSaved(true); setTimeout(onClose, 1500); };
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: "620px" }}>
        <div style={S.modalHeader}>
          <div>
            <div style={S.modalTitle}>{EMOJI.medicine} Create Prescription</div>
            <div style={S.modalSub}>{patient.name} {SYMBOL.bullet} {report.type}</div>
          </div>
          <button onClick={onClose} style={S.closeBtn}>{SYMBOL.cross}</button>
        </div>
        <div style={{ ...S.modalBody, maxHeight: "60vh", overflowY: "auto" }}>
            <div style={S.infoBox}>
              <div style={S.infoRow}><span style={S.infoLabel}>Patient</span><span>{patient.name}</span></div>
              <div style={S.infoRow}><span style={S.infoLabel}>Age</span><span>{patient.age} yrs</span></div>
              <div style={S.infoRow}><span style={S.infoLabel}>Based on</span><span>{report.name} {SYMBOL.bullet} {report.date}</span></div>
            </div>
          <div style={S.fieldGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label style={S.fieldLabel}>Medicines</label>
              <button onClick={addMed} style={S.addMedBtn}>+ Add Medicine</button>
            </div>
            {medicines.map((med, i) => (
              <div key={i} style={S.medRow}>
                <input placeholder="Medicine name" value={med.name} onChange={e => updateMed(i, "name", e.target.value)} style={{ ...S.input, flex: 2 }} />
                <input placeholder="Dosage" value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)} style={{ ...S.input, flex: 1 }} />
                <select value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)} style={{ ...S.input, flex: 1 }}>
                  <option value="">Frequency</option>
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Thrice daily</option>
                  <option>Every 8 hrs</option>
                  <option>As needed</option>
                </select>
                <input placeholder="Duration" value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)} style={{ ...S.input, flex: 1 }} />
                {medicines.length > 1 && <button onClick={() => removeMed(i)} style={S.removeMedBtn}>{SYMBOL.cross}</button>}
              </div>
            ))}
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Additional Instructions</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Dietary advice, lifestyle changes, follow-up instructions..."
              style={S.textarea} rows={3} />
          </div>
        </div>
        <div style={S.modalFooter}>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
          <button onClick={handleSave} style={S.saveBtn} disabled={saved}>
            {saved ? `${SYMBOL.check} Prescription Created!` : "Create Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ patient, report, onClose }) {
  const [method, setMethod] = useState("email");
  const [sent, setSent] = useState(false);
  const handleSend = () => { setSent(true); setTimeout(onClose, 1500); };
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: "440px" }}>
        <div style={S.modalHeader}>
          <div>
            <div style={S.modalTitle}>Share with Patient</div>
            <div style={S.modalSub}>{report.name}</div>
          </div>
          <button onClick={onClose} style={S.closeBtn}>{SYMBOL.cross}</button>
        </div>
        <div style={S.modalBody}>
          <div style={S.infoBox}>
            <div style={S.infoRow}><span style={S.infoLabel}>Patient</span><span>{patient.name}</span></div>
            <div style={S.infoRow}><span style={S.infoLabel}>Report</span><span>{report.name} {SYMBOL.bullet} {report.date}</span></div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Share via</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              {["email", "sms", "app"].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  style={{ ...S.methodBtn, ...(method === m ? S.methodBtnActive : {}) }}>
                  {m === "email" ? "Email" : m === "sms" ? "SMS" : "App"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={S.modalFooter}>
          <button onClick={onClose} style={S.cancelBtn}>Cancel</button>
          <button onClick={handleSend} style={S.saveBtn} disabled={sent}>
            {sent ? `${SYMBOL.check} Sent!` : "Send Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PatientReportAnalysis() {
  const [selectedPatient, setSelectedPatient] = useState(PATIENTS[0]);
  const [selectedReport, setSelectedReport] = useState(REPORTS_DATA["P001"][0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const reports = REPORTS_DATA[selectedPatient.id] || [];
  const handlePatientChange = (p) => { setSelectedPatient(p); setSelectedReport(REPORTS_DATA[p.id]?.[0] || null); };
  const handleAnalyze = () => { setAnalyzing(true); setTimeout(() => setAnalyzing(false), 2000); };
  const abnormalCount = selectedReport?.parameters.filter(p => p.status !== "normal").length || 0;
  const totalCount = selectedReport?.parameters.length || 0;

  return (
    <div style={S.page}>
      {showRecordModal && <PatientRecordModal patient={selectedPatient} report={selectedReport} onClose={() => setShowRecordModal(false)} />}
      {showPrescriptionModal && <PrescriptionModal patient={selectedPatient} report={selectedReport} onClose={() => setShowPrescriptionModal(false)} />}
      {showShareModal && <ShareModal patient={selectedPatient} report={selectedReport} onClose={() => setShowShareModal(false)} />}

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.breadcrumb}>Doctor Dashboard / Report Analysis</div>
          <h1 style={S.title}>Patient Report Analysis</h1>
          <p style={S.subtitle}>AI-assisted interpretation of diagnostic reports</p>
        </div>
        <div style={S.aiBadge}>
          <span style={{ fontSize: "28px" }}>{EMOJI.robot}</span>
          <div>
            <div style={S.aiTitle}>AI Analysis Active</div>
            <div style={S.aiSub}>Powered by clinical intelligence</div>
          </div>
        </div>
      </div>

      <div style={S.layout}>
        {/* Left sidebar */}
        <div style={S.leftCol}>
          <div style={S.card}>
            <div style={S.sectionLabel}>Select Patient</div>
            {PATIENTS.map(p => (
              <div key={p.id} onClick={() => handlePatientChange(p)}
                style={{ ...S.patientItem, ...(selectedPatient.id === p.id ? S.patientActive : {}) }}>
                <div style={{ ...S.avatar, background: avatarColor(p.name) }}>
                  {p.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div style={S.patientName}>{p.name}</div>
                  <div style={S.patientMeta}>{p.age} yrs · {p.id}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionLabel}>Reports ({reports.length})</div>
            {reports.map(r => (
              <div key={r.id} onClick={() => setSelectedReport(r)}
                style={{ ...S.reportItem, ...(selectedReport?.id === r.id ? S.reportActive : {}) }}>
                <div style={S.reportItemTop}>
                  <div style={S.reportName}>{r.name}</div>
                  <span style={{ ...S.reportBadge, ...(r.status === "analyzed" ? S.statusAnalyzed : S.statusPending) }}>
                    {r.status === "analyzed" ? SYMBOL.check : SYMBOL.hourglass}
                  </span>
                </div>
                <div style={S.reportMeta}>{r.type} {SYMBOL.bullet} {r.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        {selectedReport ? (
          <div style={S.analysisArea}>
            {/* Report info card */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={S.reportTitle}>{selectedReport.name}</h2>
                  <div style={S.reportSubHead}>
                    <span style={S.typeBadge}>{selectedReport.type}</span>
                    <span style={S.metaChip}>{EMOJI.calendar} {selectedReport.date}</span>
                    <span style={S.metaChip}>{EMOJI.person} {selectedPatient.name}</span>
                  </div>
                </div>
                <div style={S.abnormalBox}>
                  <div style={S.abnormalNum}>{abnormalCount}/{totalCount}</div>
                  <div style={S.abnormalLabel}>Abnormal</div>
                </div>
              </div>
            </div>

            {/* AI interpretation card — teal gradient */}
            <div style={S.aiCard}>
              <div style={S.aiCardHead}>
                <span style={{ fontSize: "20px" }}>{EMOJI.robot}</span>
                <span style={S.aiCardTitle}>AI Clinical Interpretation</span>
                {selectedReport.status === "pending" && (
                  <button onClick={handleAnalyze} style={S.analyzeBtn} disabled={analyzing}>
                    {analyzing ? `Analyzing${SYMBOL.ellipsis}` : "Run Analysis"}
                  </button>
                )}
              </div>
              {selectedReport.aiSummary
                ? <p style={S.aiText}>{selectedReport.aiSummary}</p>
                : <div style={S.noAnalysis}>
                    {analyzing ? <span>{SYMBOL.hourglass} Running AI analysis on {totalCount} parameters{SYMBOL.ellipsis}</span>
                               : <span>Click "Run Analysis" to generate AI interpretation.</span>}
                  </div>}
            </div>

            {/* Parameters table — white card */}
            <div style={S.card}>
              <div style={S.cardTitle}>Parameter Results</div>
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHead}>
                    {["Parameter","Value","Unit","Normal Range","Status","Visual"].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedReport.parameters.map((p, i) => (
                    <tr key={i} style={{ ...S.tableRow, ...(p.status !== "normal" ? S.tableRowAbnormal : {}) }}>
                      <td style={S.td}><strong>{p.name}</strong></td>
                      <td style={{ ...S.td, fontWeight: "700", fontSize: "15px", color: p.status !== "normal" ? "#c2410c" : C.tealDeep }}>
                        {p.value}
                      </td>
                      <td style={{ ...S.td, color: C.textMuted, fontSize: "12px" }}>{p.unit}</td>
                      <td style={{ ...S.td, color: C.textSub, fontSize: "12px" }}>{p.normal}</td>
                      <td style={S.td}><StatusBadge status={p.status} /></td>
                      <td style={S.td}><BarIndicator status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div style={S.actions}>
              <button style={S.actionBtn} onClick={() => setShowRecordModal(true)}>{EMOJI.clipboard} Add to Patient Record</button>
              <button style={S.actionBtn} onClick={() => setShowPrescriptionModal(true)}>{EMOJI.medicine} Create Prescription</button>
              <button style={S.actionBtnPrimary} onClick={() => setShowShareModal(true)}>Share with Patient</button>
            </div>
          </div>
        ) : (
          <div style={S.empty}>Select a report to view analysis</div>
        )}
      </div>
    </div>
  );
}

// ── Style sheet ────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${C.bg} 0%, ${C.bgDeep} 100%)`,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "32px",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  breadcrumb: { fontSize: "12px", color: C.textSub, marginBottom: "6px" },
  title: { fontSize: "28px", fontWeight: "800", color: C.tealDeep, margin: 0 },
  subtitle: { fontSize: "14px", color: C.textSub, margin: "6px 0 0" },
  aiBadge: {
    display: "flex", gap: "12px", alignItems: "center",
    background: `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`,
    color: "#fff", borderRadius: "14px", padding: "14px 20px",
    boxShadow: `0 4px 20px ${C.teal}55`,
  },
  aiTitle: { fontSize: "14px", fontWeight: "700" },
  aiSub: { fontSize: "11px", color: C.tealLight, marginTop: "2px" },
  layout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  leftCol: { width: "260px", minWidth: "260px", display: "flex", flexDirection: "column", gap: "16px" },
  analysisArea: { flex: 1, display: "flex", flexDirection: "column", gap: "16px" },

  // White card
  card: {
    background: C.white,
    borderRadius: "16px",
    padding: "18px 20px",
    boxShadow: "0 2px 16px rgba(13,148,136,0.09)",
    border: `1px solid ${C.tealLight}`,
  },
  cardTitle: { fontSize: "14px", fontWeight: "700", color: C.tealDeep, marginBottom: "16px" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" },

  patientItem: {
    display: "flex", gap: "10px", alignItems: "center",
    padding: "10px", borderRadius: "10px", cursor: "pointer",
    border: "1.5px solid transparent", marginBottom: "4px", transition: "all 0.15s",
  },
  patientActive: { background: C.tealXLight, border: `1.5px solid ${C.teal}` },
  avatar: {
    width: "36px", height: "36px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "700", fontSize: "13px", flexShrink: 0,
  },
  patientName: { fontSize: "13px", fontWeight: "600", color: C.tealDeep },
  patientMeta: { fontSize: "11px", color: C.textMuted, marginTop: "1px" },

  reportItem: {
    padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
    border: "1.5px solid transparent", marginBottom: "6px",
    background: C.tealXLight, transition: "all 0.15s",
  },
  reportActive: { background: C.tealLight, border: `1.5px solid ${C.teal}` },
  reportItemTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  reportName: { fontSize: "12px", fontWeight: "600", color: C.tealDeep },
  reportBadge: { fontSize: "10px", fontWeight: "700", borderRadius: "5px", padding: "2px 7px" },
  statusAnalyzed: { background: "#dcfce7", color: "#166534" },
  statusPending: { background: "#fefce8", color: "#a16207" },
  reportMeta: { fontSize: "11px", color: C.textMuted },

  reportTitle: { fontSize: "20px", fontWeight: "800", color: C.tealDeep, margin: "0 0 10px" },
  reportSubHead: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" },
  typeBadge: { background: C.tealLight, color: C.tealDark, borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: "600" },
  metaChip: { fontSize: "12px", color: C.textSub },
  abnormalBox: { textAlign: "center" },
  abnormalNum: { fontSize: "28px", fontWeight: "800", color: C.teal },
  abnormalLabel: { fontSize: "11px", color: C.textMuted, marginTop: "2px" },

  // Teal gradient AI card
  aiCard: {
    background: `linear-gradient(135deg, ${C.tealDark} 0%, ${C.teal} 100%)`,
    borderRadius: "16px", padding: "20px 24px",
    boxShadow: `0 4px 24px ${C.teal}44`,
  },
  aiCardHead: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  aiCardTitle: { fontSize: "14px", fontWeight: "700", color: C.tealLight, flex: 1 },
  analyzeBtn: {
    background: C.white, color: C.tealDark,
    border: "none", borderRadius: "8px",
    padding: "7px 16px", fontSize: "12px", fontWeight: "700", cursor: "pointer",
  },
  aiText: { color: C.tealLight, fontSize: "14px", lineHeight: "1.7", margin: 0 },
  noAnalysis: { color: C.mint, fontSize: "13px", fontStyle: "italic" },

  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: C.tealXLight },
  th: {
    padding: "10px 12px", textAlign: "left",
    fontSize: "11px", color: C.textMuted, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: `1.5px solid ${C.tealLight}`,
  },
  tableRow: { borderBottom: `1px solid ${C.tealXLight}` },
  tableRowAbnormal: { background: "#fffbeb" },
  td: { padding: "12px 12px", fontSize: "14px", color: C.tealDeep, verticalAlign: "middle" },

  actions: { display: "flex", gap: "12px", flexWrap: "wrap" },
  actionBtn: {
    padding: "11px 20px", borderRadius: "10px",
    border: `1.5px solid ${C.teal}`, background: C.white,
    color: C.tealDark, fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  actionBtnPrimary: {
    padding: "11px 20px", borderRadius: "10px", border: "none",
    background: `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`,
    color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer",
    boxShadow: `0 4px 14px ${C.teal}55`,
  },
  empty: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    color: C.textMuted, fontSize: "16px", minHeight: "300px",
  },

  // Modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(13,60,54,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: "20px",
  },
  modal: {
    background: C.white, borderRadius: "20px", width: "100%", maxWidth: "520px",
    boxShadow: `0 20px 60px ${C.teal}33`, display: "flex", flexDirection: "column",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "20px 24px 16px", borderBottom: `1px solid ${C.tealLight}`,
  },
  modalTitle: { fontSize: "17px", fontWeight: "800", color: C.tealDeep },
  modalSub: { fontSize: "12px", color: C.textMuted, marginTop: "3px" },
  closeBtn: {
    background: C.tealXLight, border: "none", borderRadius: "8px",
    width: "30px", height: "30px", cursor: "pointer",
    fontSize: "13px", color: C.tealDark, fontWeight: "700",
  },
  modalBody: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  modalFooter: {
    padding: "16px 24px", borderTop: `1px solid ${C.tealLight}`,
    display: "flex", justifyContent: "flex-end", gap: "10px",
  },
  infoBox: {
    background: C.tealXLight, borderRadius: "12px", padding: "14px 16px",
    border: `1px solid ${C.tealLight}`, display: "flex", flexDirection: "column", gap: "8px",
  },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: C.tealDeep },
  infoLabel: { color: C.textMuted, fontWeight: "600" },
  aiPreview: {
    background: `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`,
    borderRadius: "12px", padding: "14px 16px",
  },
  aiPreviewLabel: { fontSize: "11px", color: C.mint, fontWeight: "700", marginBottom: "6px" },
  aiPreviewText: { fontSize: "13px", color: C.tealLight, lineHeight: "1.6", margin: 0 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  fieldLabel: { fontSize: "11px", fontWeight: "700", color: C.textSub, textTransform: "uppercase", letterSpacing: "0.05em" },
  textarea: {
    border: `1.5px solid ${C.border}`, borderRadius: "10px", padding: "10px 14px",
    fontSize: "13px", color: C.tealDeep, resize: "vertical", fontFamily: "inherit",
    outline: "none", background: C.white,
  },
  input: {
    border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "8px 10px",
    fontSize: "13px", color: C.tealDeep, fontFamily: "inherit",
    outline: "none", background: C.white, minWidth: 0,
  },
  medRow: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" },
  addMedBtn: {
    background: C.tealXLight, border: "none", borderRadius: "8px",
    padding: "5px 12px", fontSize: "12px", fontWeight: "600", color: C.tealDark, cursor: "pointer",
  },
  removeMedBtn: {
    background: "#fee2e2", border: "none", borderRadius: "6px",
    width: "26px", height: "26px", color: "#b91c1c",
    cursor: "pointer", fontWeight: "700", fontSize: "12px", flexShrink: 0,
  },
  cancelBtn: {
    padding: "9px 20px", borderRadius: "10px",
    border: `1.5px solid ${C.border}`, background: C.white,
    color: C.textSub, fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  saveBtn: {
    padding: "9px 20px", borderRadius: "10px", border: "none",
    background: `linear-gradient(135deg, ${C.tealDark}, ${C.teal})`,
    color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  methodBtn: {
    padding: "8px 18px", borderRadius: "8px", border: `1.5px solid ${C.border}`,
    background: C.white, color: C.textSub, fontSize: "13px", fontWeight: "600", cursor: "pointer",
  },
  methodBtnActive: {
    background: C.tealXLight, border: `1.5px solid ${C.teal}`, color: C.tealDark,
  },
};
