// Nandanam Expense Manager v25.0 — Gokul's Nandanam Welfare Association
// Built: 2026-03-19

import { useState, useEffect, useRef } from "react";

// ── Responsive breakpoints ───────────────────────────────────────────
function useWindowSize(){
  const [size,setSize]=useState({w:window.innerWidth,h:window.innerHeight});
  useEffect(()=>{
    const fn=()=>setSize({w:window.innerWidth,h:window.innerHeight});
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);
  return size;
}
// bp.mob = <640  bp.tab = 640–1023  bp.desk = ≥1024
function useBP(){
  const {w}=useWindowSize();
  return {mob:w<640, tab:w>=640&&w<1024, desk:w>=1024, w};
}

/* ═══════════════════════════════════════════════════════════
   COMMUNITY CONFIG
═══════════════════════════════════════════════════════════ */
const COMMUNITY = {
  name: "Gokul's Nandanam",
  shortName: "GN",
  email: "nandanamwelfare@gmail.com",
  tagline: "Cultural Association · Welfare & Expense Management",
};

const LOGO_SRC = "/icons/logo-main.png?v=2";

const CATEGORIES = [
  {
    label: "Electrical",
    code: "GNEL", color: "#f59e0b", icon: "⚡",
    examples: "Fan, wiring, switches, MCB, lights, motor repairs",
    vendor: "",
    policy: "Obtain quote before work. Bills above ₹1000 need treasurer approval.",
  },
  {
    label: "Electrical Procurable",
    code: "GNELP", color: "#f97316", icon: "🔌",
    examples: "Cables, switches, bulbs, MCBs, conduit pipes, sockets",
    vendor: "Choudary Traders",
    policy: "Purchase only from approved vendor. Keep itemised bill.",
  },
  {
    label: "Plumbing",
    code: "GNPB", color: "#3b82f6", icon: "🔧",
    examples: "Pipe leakage, tap repair, motor service, drainage blockage",
    vendor: "Naresh Plumbing and Electricals",
    policy: "Contact Naresh first. Emergency repairs can proceed without prior approval.",
  },
  {
    label: "Plumbing Procurable",
    code: "GNPLP", color: "#06b6d4", icon: "🪠",
    examples: "PVC pipes, taps, valves, fittings, water tank parts",
    vendor: "Choudary Traders",
    policy: "Purchase only from approved vendor. Keep itemised bill.",
  },
  {
    label: "Miscellaneous",
    code: "GNMI", color: "#8b5cf6", icon: "📦",
    examples: "Stationery, printing, postage, small tools, sundry items",
    vendor: "",
    policy: "For items not covered by other categories. Attach receipt.",
  },
  {
    label: "Civil Works",
    code: "GNCW", color: "#10b981", icon: "🏗️",
    examples: "Wall plastering, flooring, painting, tiling, waterproofing",
    vendor: "MASON Works",
    policy: "Requires committee approval before work begins. Get written estimate.",
  },
  {
    label: "Gardening",
    code: "GNGG", color: "#22c55e", icon: "🌿",
    examples: "Plants, soil, fertiliser, garden tools, lawn maintenance",
    vendor: "",
    policy: "Monthly maintenance included. Extra purchases need prior approval.",
  },
  {
    label: "Security",
    code: "GNSC", color: "#ef4444", icon: "🛡️",
    examples: "Guard payments, CCTV repair, intercom, access cards",
    vendor: "",
    policy: "Security payments must be pre-approved by secretary.",
  },
  {
    label: "Community Events",
    code: "GNCEV", color: "#d946ef", icon: "🎉",
    examples: "Festival supplies, decorations, food, pooja items, sound system",
    vendor: "",
    policy: "All event expenses must be tagged to a specific event. Stay within approved budget.",
  },
  {
    label: "Recurring Expenses",
    code: "GNREC", color: "#a78bfa", icon: "🔁",
    examples: "Staff salaries, electricity bill, water tanker, lift AMC, internet, insurance premiums",
    vendor: "",
    policy: "Use this category for all predictable, repeating expenses. Month-over-month comparison is tracked automatically.",
  },
];

const DEFAULT_MEMBERS = [
  "Arjun Sharma","Priya Mehta","Ravi Kumar","Sunita Patel",
  "Deepak Nair","Kavitha Reddy","Mohan Das","Anita Singh",
  "Suresh Rao","Lakshmi Iyer","Venkat Reddy","Meena Krishnan",
];

const DEFAULT_VENDORS = [
  "Choudary Traders","Naresh Plumbing and Electricals","MASON Works",
  "Star Electricals","Hyderabad Hardware","Green Leaf Nursery",
];

const EVENT_SUBCATS = [
  "Decorations","Food & Catering","Pooja Items","Sound & Lighting",
  "Printing & Banners","Gifts & Prizes","Transport","Venue","Miscellaneous",
];

const RECURRING_SUBCATS = [
  "Electricity Bills - Block A",
  "Electricity Bills - Block B",
  "Electricity Bills - Block C",
  "HWMS WATER Bill",
  "Salaries",
  "AMC",
  "Fuel",
  "Consumables",
];

/* ── Recurring expense definitions ── */
const RECURRING_TYPES = [
  { id:"salary",      label:"Salaries",            icon:"👷",  color:"#f59e0b", keywords:["salary","salaries","wage","staff payment","guard pay","security pay","watchman"] },
  { id:"electricity", label:"Electricity Bills",   icon:"⚡",  color:"#f97316", keywords:["electricity bill","electricity bills","eb bill","mseb","bescom","power bill","current bill","electricity bills - block a","electricity bills - block b","electricity bills - block c"] },
  { id:"water",       label:"HWMS WATER Bill",     icon:"💧",  color:"#3b82f6", keywords:["hwms water bill","water bill","tanker","borewell","water charges","municipality water"] },
  { id:"fuel",        label:"Fuel",                icon:"⛽",  color:"#ef4444", keywords:["fuel","diesel","petrol","generator fuel"] },
  { id:"consumables", label:"Consumables",         icon:"🧴",  color:"#10b981", keywords:["consumables","consumable","cleaning material","housekeeping material","consumable items"] },
  { id:"window",      label:"Window / Glass Cleaning",icon:"🪟",color:"#06b6d4", keywords:["window clean","glass clean","window wash","facade clean"] },
  { id:"amc",         label:"AMC / Service Contract",icon:"🔧",  color:"#8b5cf6", keywords:["amc","annual maintenance","service contract","maintenance contract"] },
  { id:"internet",    label:"Internet / Cable",     icon:"📡",  color:"#10b981", keywords:["internet","broadband","wifi","cable tv","dth","dish tv"] },
  { id:"lift",        label:"Lift Maintenance",     icon:"🛗",  color:"#d946ef", keywords:["lift","elevator","maintenance charge","lift amc"] },
  { id:"insurance",   label:"Insurance Premium",    icon:"🛡️",  color:"#ef4444", keywords:["insurance","premium","policy renewal"] },
];

const recurringMatchText = (purpose="",notes="",subCategory="") => `${purpose} ${notes} ${subCategory}`.toLowerCase();

const detectRecurring = (purpose="",notes="",subCategory="") => {
  const text = recurringMatchText(purpose,notes,subCategory);
  return RECURRING_TYPES.find(r => r.keywords.some(k => text.includes(k))) || null;
};

/* ═══════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════ */
const todayStr  = () => new Date().toISOString().split("T")[0];
const fmt       = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pad5      = (n) => String(n).padStart(5,"0");
const genId     = () => `E${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
const evTag    = (name) => name.replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,8);
const catByCode  = (code)  => CATEGORIES.find(c=>c.code===code)  || CATEGORIES[4];
const catByLabel = (label) => CATEGORIES.find(c=>c.label===label) || CATEGORIES[4];
const SUBMIT_DRAFT_KEY = "nandanam_submit_draft_v1";
const INSTALL_BANNER_KEY = "nandanam_install_banner_hidden_v1";

/* ═══════════════════════════════════════════════════════════
   SAMPLE DATA
═══════════════════════════════════════════════════════════ */
const INIT_EVENTS = [
  { id:"EVT001", name:"Ganesh Chaturthi 2025", tag:"GNCHTH25", budget:50000, status:"open",   year:2025, createdAt:"2025-08-01" },
  { id:"EVT002", name:"Onam 2025",             tag:"ONAM25",   budget:25000, status:"closed",  year:2025, createdAt:"2025-08-20" },
];

const INIT_ENTRIES = [
  { id:"E00001", txnId:"GNEL00001",            date:"2025-02-10", member:"Arjun Sharma",  categoryCode:"GNEL",  category:"Electrical",       amount:1200, purpose:"Lift motor repair",       upiId:"tech@upi",    status:"Reimbursed", notes:"",         eventId:null, subCategory:null },
  { id:"E00002", txnId:"GNPB00001",            date:"2025-02-18", member:"Priya Mehta",   categoryCode:"GNPB",  category:"Plumbing",          amount:3500, purpose:"Water pipe leakage fix",  upiId:"plumb@paytm", status:"Pending",    notes:"",         eventId:null, subCategory:null },
  { id:"E00003", txnId:"GNGG00001",            date:"2025-03-01", member:"Ravi Kumar",    categoryCode:"GNGG",  category:"Gardening",         amount:800,  purpose:"Garden maintenance Mar",  upiId:"garden@gpay", status:"Reimbursed", notes:"Monthly",  eventId:null, subCategory:null },
  { id:"E00004", txnId:"GNCEV-GNCHTH25-00001", date:"2025-08-15", member:"Sunita Patel",  categoryCode:"GNCEV", category:"Community Events",  amount:8500, purpose:"Ganesh idol procurement", upiId:"vendor@upi",  status:"Reimbursed", notes:"Main idol",eventId:"EVT001", subCategory:"Pooja Items" },
  { id:"E00005", txnId:"GNCEV-GNCHTH25-00002", date:"2025-08-20", member:"Mohan Das",     categoryCode:"GNCEV", category:"Community Events",  amount:6200, purpose:"Decoration materials",    upiId:"dec@phonepe", status:"Pending",    notes:"",         eventId:"EVT001", subCategory:"Decorations" },
  { id:"E00006", txnId:"GNCEV-ONAM25-00001",   date:"2025-08-28", member:"Kavitha Reddy", categoryCode:"GNCEV", category:"Community Events",  amount:4500, purpose:"Pookalam flowers",        upiId:"flow@gpay",   status:"Reimbursed", notes:"",         eventId:"EVT002", subCategory:"Decorations" },
  { id:"E00007", txnId:"GNMI00001",            date:"2025-03-05", member:"Deepak Nair",   categoryCode:"GNMI",  category:"Miscellaneous",      amount:560,  purpose:"Electricity advance",      upiId:"elec@phonep", status:"Pending",    notes:"",         eventId:null, subCategory:null },
  { id:"E00008", txnId:"GNREC00001",           date:"2025-09-01", member:"Arjun Sharma",  categoryCode:"GNREC", category:"Recurring Expenses",  amount:18000,purpose:"Security guard salary Sep", upiId:"guard@upi",  status:"Reimbursed", notes:"Monthly",  eventId:null, subCategory:"Salaries" },
  { id:"E00009", txnId:"GNREC00002",           date:"2025-09-03", member:"Priya Mehta",   categoryCode:"GNREC", category:"Recurring Expenses",  amount:4200, purpose:"Electricity bill Sep",      upiId:"ebill@upi",  status:"Reimbursed", notes:"",         eventId:null, subCategory:"Electricity Bills - Block A" },
  { id:"E00010", txnId:"GNREC00003",           date:"2025-09-05", member:"Ravi Kumar",    categoryCode:"GNREC", category:"Recurring Expenses",  amount:1800, purpose:"Lift AMC quarterly charge",  upiId:"lift@upi",   status:"Reimbursed", notes:"AMC Q3",  eventId:null, subCategory:null },
  { id:"E00011", txnId:"GNREC00004",           date:"2025-09-10", member:"Sunita Patel",  categoryCode:"GNREC", category:"Recurring Expenses",  amount:2400, purpose:"Water tanker charges Sep",   upiId:"water@upi",  status:"Pending",    notes:"",         eventId:null, subCategory:"HWMS WATER Bill" },
  { id:"E00012", txnId:"GNREC00005",           date:"2025-08-01", member:"Arjun Sharma",  categoryCode:"GNREC", category:"Recurring Expenses",  amount:17500,purpose:"Security guard salary Aug",  upiId:"guard@upi",  status:"Reimbursed", notes:"Monthly",  eventId:null, subCategory:"Salaries" },
  { id:"E00013", txnId:"GNREC00006",           date:"2025-08-04", member:"Priya Mehta",   categoryCode:"GNREC", category:"Recurring Expenses",  amount:3950, purpose:"Electricity bill Aug",       upiId:"ebill@upi",  status:"Reimbursed", notes:"",         eventId:null, subCategory:"Electricity Bills - Block B" },
  { id:"E00014", txnId:"GNREC00007",           date:"2025-08-12", member:"Ravi Kumar",    categoryCode:"GNREC", category:"Recurring Expenses",  amount:2200, purpose:"Water tanker charges Aug",   upiId:"water@upi",  status:"Reimbursed", notes:"",         eventId:null, subCategory:"HWMS WATER Bill" },
];

const INIT_COUNTERS = {
  GNEL:1,GNELP:0,GNPB:1,GNPLP:0,GNMI:1,GNCW:0,GNGG:1,GNSC:0,GNREC:7,
  "GNCEV-GNCHTH25":2,"GNCEV-ONAM25":1,
};



/* ═══════════════════════════════════════════════════════════
   GOOGLE SHEETS
═══════════════════════════════════════════════════════════ */
async function appendToSheet(cfg, row) {
  if (!cfg.apiKey || !cfg.sheetId) return {success:false,error:"Not configured"};
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cfg.sheetId}/values/Expenses!A:K:append?valueInputOption=USER_ENTERED&key=${cfg.apiKey}`;
    const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({values:[row]})});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return {success:true};
  } catch(e) { return {success:false,error:e.message}; }
}

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
function Icon({n,s=18}) {
  const P = {
    plus:   <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    dl:     <><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></>,
    flt:    <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    ref:    <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    wall:   <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    bar:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    scan:   <><path d="M3 9V5a2 2 0 0 1 2-2h4"/><path d="M21 9V5a2 2 0 0 0-2-2h-4"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M21 15v4a2 2 0 0 1-2 2h-4"/><line x1="7" y1="12" x2="17" y2="12"/></>,
    clk:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    star:   <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    x:      <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    chk:    <><polyline points="20 6 9 12 4 10"/></>,
    trd:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    eye:    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    sht:    <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></>,
    save:   <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    info:   <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    store:  <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    trash:  <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {P[n]}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════════════════ */
function Toast({msg,type,onClose}) {
  const bg={success:"#10b981",error:"#ef4444",warning:"#f59e0b",info:"#3b82f6"}[type]||"#8b5cf6";
  return (
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:bg,color:"#fff",padding:"13px 18px",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",gap:10,fontFamily:"'DM Sans',sans-serif",animation:"slideUp 0.3s ease",fontSize:14,fontWeight:500,maxWidth:380}}>
      {msg}
      <button onClick={onClose} style={{background:"none",border:"none",color:"#fff",cursor:"pointer",padding:0,marginLeft:4}}><Icon n="x" s={14}/></button>
    </div>
  );
}

function EmptyStateCard({icon,title,body,actionLabel,onAction,tone="gold"}) {
  const palette = {
    gold: {bg:"rgba(251,191,36,0.08)", border:"rgba(251,191,36,0.22)", color:"#fbbf24"},
    green:{bg:"rgba(16,185,129,0.08)", border:"rgba(16,185,129,0.22)", color:"#10b981"},
    blue: {bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.22)", color:"#60a5fa"},
    purple:{bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.22)", color:"#a78bfa"},
  }[tone] || {bg:"rgba(251,191,36,0.08)", border:"rgba(251,191,36,0.22)", color:"#fbbf24"};
  return (
    <div style={{textAlign:"center",padding:"46px 24px",background:palette.bg,border:`1px solid ${palette.border}`,borderRadius:18}}>
      <div style={{fontSize:42,marginBottom:12}}>{icon}</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:palette.color,marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.48)",maxWidth:460,margin:"0 auto",lineHeight:1.6}}>{body}</div>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{marginTop:16,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:10,padding:"10px 16px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13}}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function InstallHintBanner({mode,onInstall,onClose}) {
  const info = mode==="prompt"
    ? {
        tone:"#60a5fa",
        bg:"rgba(59,130,246,0.08)",
        border:"rgba(59,130,246,0.22)",
        title:"Install Nandanam on this device",
        body:"Use the app like a native experience with faster access from your home screen or apps list.",
        action:"Install App"
      }
    : mode==="secure"
      ? {
          tone:"#f87171",
          bg:"rgba(239,68,68,0.08)",
          border:"rgba(239,68,68,0.22)",
          title:"Install is blocked on this connection",
          body:"Mobile install needs a secure origin. If you're opening the app from another device over http://192.168... the service worker may not register. Use HTTPS or test on the same device with localhost.",
          action:null
        }
    : mode==="ios"
      ? {
          tone:"#fbbf24",
          bg:"rgba(251,191,36,0.08)",
          border:"rgba(251,191,36,0.22)",
          title:"Add Nandanam to Home Screen",
          body:"On iPhone or iPad, open Safari's Share menu and choose Add to Home Screen. iOS usually does not show an automatic install prompt.",
          action:null
        }
      : {
          tone:"#10b981",
          bg:"rgba(16,185,129,0.08)",
          border:"rgba(16,185,129,0.22)",
          title:"Install from your browser menu",
          body:"Some mobile browsers don't show an automatic app suggestion. Open the browser menu and choose Install app or Add to Home Screen.",
          action:null
        };
  return (
    <div style={{maxWidth:1100,margin:"14px auto 0",padding:"0 24px"}}>
      <div style={{background:info.bg,border:`1px solid ${info.border}`,borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:260}}>
          <div style={{fontSize:12,fontWeight:800,color:info.tone,textTransform:"uppercase",letterSpacing:"0.06em"}}>{info.title}</div>
          <div style={{fontSize:12.5,color:"rgba(255,255,255,0.72)",marginTop:5,lineHeight:1.5}}>{info.body}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {info.action && onInstall && (
            <button onClick={onInstall} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",color:"#fff",borderRadius:10,padding:"10px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>
              {info.action}
            </button>
          )}
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({status,onClick}) {
  const S={
    Pending:    {bg:"#fef3c7",color:"#92400e",border:"#fde68a"},
    Reimbursed: {bg:"#d1fae5",color:"#065f46",border:"#6ee7b7"},
    open:       {bg:"#dbeafe",color:"#1e40af",border:"#93c5fd"},
    closed:     {bg:"#fee2e2",color:"#991b1b",border:"#fca5a5"},
  };
  const c=S[status]||S.Pending;
  return (
    <button onClick={onClick} style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:700,cursor:onClick?"pointer":"default",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",textTransform:"uppercase",letterSpacing:"0.04em"}}>
      {status}
    </button>
  );
}

function StatCard({label,value,sub,icon,accent}) {
  return (
    <div style={{background:"linear-gradient(135deg,#0a1628,#0f2040)",borderRadius:16,padding:"18px 20px",border:`1px solid ${accent}35`,boxShadow:`0 4px 20px ${accent}18`,display:"flex",alignItems:"center",gap:14}}>
      <div style={{width:44,height:44,borderRadius:12,background:`${accent}20`,color:accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Icon n={icon} s={21}/>
      </div>
      <div>
        <div style={{fontSize:21,fontWeight:800,color:"#fff",fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{value}</div>
        {sub && <div style={{fontSize:11,color:accent,fontWeight:600,marginTop:2}}>{sub}</div>}
        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3}}>{label}</div>
      </div>
    </div>
  );
}

function Spin() {
  return <div style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>;
}

/* Category Info Tooltip */
function CatInfo({cat}) {
  const [show,setShow] = useState(false);
  return (
    <div style={{position:"relative",display:"inline-block"}}>
      <button onClick={()=>setShow(s=>!s)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",padding:"0 4px",display:"flex",alignItems:"center"}}>
        <Icon n="info" s={13}/>
      </button>
      {show && (
        <div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",background:"#1e3a5f",border:`1px solid ${cat.color}40`,borderRadius:12,padding:"12px 14px",width:240,zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
          <div style={{fontSize:12,fontWeight:700,color:cat.color,marginBottom:6}}>{cat.icon} {cat.label} ({cat.code})</div>
          {cat.examples && (
            <div style={{marginBottom:6}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Examples: </span>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>{cat.examples}</span>
            </div>
          )}
          {cat.vendor && (
            <div style={{marginBottom:6}}>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Vendor: </span>
              <span style={{fontSize:12,color:"#f59e0b",fontWeight:600}}>{cat.vendor}</span>
            </div>
          )}
          {cat.policy && (
            <div>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Policy: </span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontStyle:"italic"}}>{cat.policy}</span>
            </div>
          )}
          <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:10,height:10,background:"#1e3a5f",border:`1px solid ${cat.color}40`,borderTop:"none",borderLeft:"none",rotate:"45deg"}}/>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════ */
function ScriptModal({current, onSave, onClose}) {
  const [url,setUrl]       = useState(current||"");
  const [testing,setTesting]=useState(false);
  const [testResult,setTestResult]=useState(null);
  const inp={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:12,fontFamily:"monospace",outline:"none",boxSizing:"border-box"};

  const testConnection=async()=>{
    if(!url){setTestResult({ok:false,msg:"Paste your script URL first"});return;}
    setTesting(true);setTestResult(null);
    try{
      const r=await fetch(url,{redirect:"follow"});
      const d=await r.json();
      if(d.success)setTestResult({ok:true,msg:`✅ Connected! Found ${d.entries?.length||0} entries, ${d.events?.length||0} events.`});
      else setTestResult({ok:false,msg:"Script responded but returned an error: "+d.error});
    }catch(e){setTestResult({ok:false,msg:"❌ Could not reach script. Check the URL and deployment settings."});}
    setTesting(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.80)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(251,191,36,0.3)",borderRadius:20,padding:32,width:"100%",maxWidth:560,boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#fbbf24",margin:0}}>🔗 Connect Google Sheets Database</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer"}}><Icon n="x"/></button>
        </div>

        <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:14,marginBottom:18}}>
          <div style={{fontSize:12,color:"#10b981",fontWeight:700,marginBottom:6}}>📋 Follow the setup guide — then paste your URL below</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>
            Your Apps Script URL looks like:<br/>
            <span style={{fontFamily:"monospace",color:"rgba(255,255,255,0.7)",fontSize:10}}>https://script.google.com/macros/s/AKfycb.../exec</span>
          </div>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Apps Script Web App URL</label>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" style={inp}/>
        </div>

        {testResult&&(
          <div style={{background:testResult.ok?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${testResult.ok?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:testResult.ok?"#10b981":"#ef4444"}}>
            {testResult.msg}
          </div>
        )}

        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button onClick={testConnection} disabled={testing} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.7)",borderRadius:12,padding:"11px 18px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:7,opacity:testing?0.6:1}}>
            {testing?<><Spin/>Testing...</>:"🔍 Test Connection"}
          </button>
          <button onClick={()=>{if(!url)return;onSave(url);}} style={{flex:1,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#1a1a00",border:"none",borderRadius:12,padding:"11px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Icon n="save" s={16}/>Save & Connect
          </button>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:12,padding:"11px 16px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CreateEventModal({onSave,onClose}) {
  const [ev,setEv]=useState({name:"",budget:"",year:new Date().getFullYear()});
  const tag=ev.name?evTag(ev.name):"???";
  const inp={width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(217,70,239,0.35)",borderRadius:20,padding:32,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#d946ef",margin:0}}>🎉 Create New Event</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer"}}><Icon n="x"/></button>
        </div>
        {[{k:"name",l:"Event Name",p:"e.g. Ganesh Chaturthi 2025"},{k:"budget",l:"Total Budget (₹)",p:"e.g. 50000",t:"number"},{k:"year",l:"Year",p:"2025",t:"number"}].map(({k,l,p,t="text"})=>(
          <div key={k} style={{marginBottom:15}}>
            <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</label>
            <input type={t} value={ev[k]} onChange={e=>setEv(v=>({...v,[k]:e.target.value}))} placeholder={p} style={inp}/>
          </div>
        ))}
        <div style={{background:"rgba(217,70,239,0.08)",border:"1px solid rgba(217,70,239,0.25)",borderRadius:10,padding:"12px 16px",marginBottom:20}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Transaction ID format:</div>
          <div style={{fontFamily:"monospace",fontSize:14,color:"#d946ef",fontWeight:700}}>GNCEV-{tag}-00001 · GNCEV-{tag}-00002 ...</div>
        </div>
        <button onClick={()=>{if(!ev.name||!ev.budget)return;onSave({...ev,id:`EVT${Date.now()}`,tag:evTag(ev.name),status:"open",createdAt:todayStr(),budget:Number(ev.budget)});}} style={{width:"100%",background:"linear-gradient(135deg,#d946ef,#a21caf)",color:"#fff",border:"none",borderRadius:12,padding:"13px",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          🎉 Create Event
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BULK IMPORT MODAL
═══════════════════════════════════════════════════════════ */
function BulkImportModal({members, events, entries: existingEntries, verifiedMember, onImport, onClose}) {
  const {mob} = useBP();
  const [member,    setMember]    = useState(verifiedMember || "");
  const [rows,      setRows]      = useState([]);
  const [vendor,    setVendor]    = useState("");
  const [defCat,    setDefCat]    = useState("GNMI");
  const [rowCount,  setRowCount]  = useState(3);
  const [dupChecked,setDupChecked]= useState(false);
  const openEvents = events.filter(e=>e.status==="open");

  const INP={width:"100%",padding:"9px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.12)",
    background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:13,
    fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};

  /* ── Duplicate Detection ─────────────────────────────────────────────── */
  const EXACT_DAYS  = 0;   // same date + amount + vendor = exact dup
  const SOFT_DAYS   = 3;   // within 3 days + same amount + same cat = probable dup
  const SUSPICIOUS  = 7;   // within 7 days + same amount = suspicious

  const checkDup = (row, rowIndex) => {
    if (!row.amount || !row.date) return null;
    const amt   = Number(row.amount);
    const rowDt = new Date(row.date).getTime();

    // 1. Check against existing saved entries
    for (const e of (existingEntries||[])) {
      if (Number(e.amount) !== amt) continue;
      const eDt   = new Date(e.date).getTime();
      const days  = Math.abs(rowDt - eDt) * (1 * 0.000011574074);
      const sameVendor = vendor && e.upiId && e.upiId.toLowerCase().includes(vendor.toLowerCase());

      if (days <= EXACT_DAYS && sameVendor && e.categoryCode === row.categoryCode)
        return { level:"hard", msg:`Exact duplicate of ${e.txnId} (${e.date})` };
      if (days <= SOFT_DAYS && e.categoryCode === row.categoryCode)
        return { level:"soft", msg:`Probable dup of ${e.txnId} (${fmt(amt)} · ${e.date})` };
      if (days <= SUSPICIOUS && sameVendor)
        return { level:"warn", msg:`Same vendor+amount within 7 days (${e.txnId})` };
    }

    // 2. Check against other rows in THIS batch (e.g. same screenshot added twice)
    for (let i = 0; i < rows.length; i++) {
      if (i === rowIndex) continue;
      const other = rows[i];
      if (!other.amount || !other.date) continue;
      if (Number(other.amount) !== amt) continue;
      const otherDt = new Date(other.date).getTime();
      const days    = Math.abs(rowDt - otherDt) * (1 * 0.000011574074);
      if (days <= EXACT_DAYS && other.categoryCode === row.categoryCode)
        return { level:"hard", msg:`Same as Row ${i+1} in this batch — possible duplicate!` };
      if (days <= SOFT_DAYS && other.categoryCode === row.categoryCode)
        return { level:"soft", msg:`Similar to Row ${i+1} (same amount within 3 days)` };
    }
    return null;
  };

  /* ── Row helpers ─────────────────────────────────────────────────────── */
  const blankRow = (id) => ({
    _id: id, checked: true,
    date: todayStr(), amount: "", upiId: vendor || "",
    purpose: vendor ? `${vendor} payment` : "",
    categoryCode: defCat, eventId: "", subCategory: "",
    receiptDataUrl: null, invoiceDataUrl: null,
    overrideDup: false,
  });

  const initRows = (n, cat, v) =>
    Array.from({length: n}, (_, i) => ({
      ...blankRow(Date.now() + i),
      upiId: v || "",
      purpose: v ? `${v} payment` : "",
      categoryCode: cat,
    }));

  // When user clicks "Create Template"
  const handleCreateTemplate = () => {
    setRows(initRows(rowCount, defCat, vendor));
    setDupChecked(false);
  };

  const updateRow = (id, key, val) =>
    setRows(r => r.map(x => x._id === id ? {...x, [key]: val, overrideDup: key==="overrideDup"?val:x.overrideDup} : x));

  const cloneRow = (row) => {
    const newRow = {...row, _id: Date.now(), amount: "", date: todayStr(),
      receiptDataUrl: null, invoiceDataUrl: null, overrideDup: false};
    setRows(prev => {
      const idx = prev.findIndex(r => r._id === row._id);
      const next = [...prev];
      next.splice(idx + 1, 0, newRow);
      return next;
    });
  };

  const removeRow = (id) => setRows(r => r.filter(x => x._id !== id));

  const addBlankRow = () =>
    setRows(prev => [...prev, blankRow(Date.now())]);

  const toBase64File = (file) => new Promise((res,rej)=>{
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const attachFile = async (rowId, field, file) => {
    if (!file) return;
    const dataUrl = await toBase64File(file);
    updateRow(rowId, field, dataUrl);
  };

  /* ── Apply vendor / category to all rows ─────────────────────────────── */
  const applyVendorToAll = () => {
    setRows(r => r.map(row => ({
      ...row,
      upiId: vendor || row.upiId,
      purpose: vendor ? `${vendor} payment` : row.purpose,
      categoryCode: defCat,
    })));
  };

  /* ── Import ──────────────────────────────────────────────────────────── */
  const handleImport = () => {
    if (!member) { alert("Select a member first."); return; }
    // Block hard duplicates unless overridden
    const hardBlocked = rows.filter(r => {
      if (!r.checked || !r.amount) return false;
      const d = checkDup(r, rows.indexOf(r));
      return d?.level === "hard" && !r.overrideDup;
    });
    if (hardBlocked.length > 0) {
      alert(`${hardBlocked.length} row(s) have exact duplicates. Review the red warnings and tick "Override" if intentional.`);
      return;
    }
    const valid = rows.filter(r => r.checked && r.amount && Number(r.amount) > 0 && r.categoryCode);
    if (!valid.length) { alert("No valid rows to import."); return; }
    onImport(valid, member);
    onClose();
  };

  const checkedCount = rows.filter(r => r.checked && r.amount && Number(r.amount) > 0).length;
  const totalAmt     = rows.filter(r => r.checked && r.amount).reduce((s,r)=>s+Number(r.amount||0),0);

  const hasRows = rows.length > 0;

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1100,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(99,102,241,0.4)",borderRadius:22,
        width:"100%",maxWidth:hasRows?1100:560,boxShadow:"0 24px 80px rgba(0,0,0,0.7)",
        maxHeight:"92vh",display:"flex",flexDirection:"column",transition:"max-width 0.3s ease"}}>

        {/* ── Header ── */}
        <div style={{padding:"20px 26px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#818cf8",margin:"0 0 3px"}}>
                📥 Bulk Entry
              </h3>
              <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:0}}>
                Template · Clone rows · Duplicate detection — no AI needed
              </p>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",padding:4}}>
              <Icon n="x" s={18}/>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{overflowY:"auto",flex:1,padding:"20px 26px"}}>

          {/* ── SETUP PANEL ── */}
          <div style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.2)",
            borderRadius:14,padding:"16px 18px",marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:800,color:"rgba(129,140,248,0.7)",textTransform:"uppercase",
              letterSpacing:"0.09em",marginBottom:14}}>
              ① Setup Template
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,alignItems:"flex-end"}}>

              {/* Member */}
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",display:"block",
                  marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Member *</label>
                {verifiedMember ? (
                  <div style={{...INP,background:"rgba(16,185,129,0.08)",border:"1.5px solid rgba(16,185,129,0.35)",
                    color:"#10b981",fontWeight:700,display:"flex",alignItems:"center",gap:6,cursor:"default"}}>
                    ✓ {verifiedMember}
                  </div>
                ) : (
                  <select value={member} onChange={e=>setMember(e.target.value)} style={INP}>
                    <option value="">Select member</option>
                    {members.map(m=><option key={m}>{m}</option>)}
                  </select>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",display:"block",
                  marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Vendor / Payee</label>
                <input value={vendor} onChange={e=>setVendor(e.target.value)}
                  placeholder="e.g. Choudary Traders"
                  style={INP}/>
              </div>

              {/* Category */}
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",display:"block",
                  marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Default Category</label>
                <select value={defCat} onChange={e=>setDefCat(e.target.value)} style={INP}>
                  {CATEGORIES.map(c=><option key={c.code} value={c.code}>{c.icon} {c.label}</option>)}
                </select>
              </div>

              {/* Row count */}
              <div>
                <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)",display:"block",
                  marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Rows</label>
                <select value={rowCount} onChange={e=>setRowCount(Number(e.target.value))}
                  style={{...INP,width:72}}>
                  {[1,2,3,4,5,6,8,10].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Create / Apply buttons */}
              <div style={{display:"flex",flexDirection:"column",gap:6,gridColumn:mob?"span 2":undefined}}>
                <button onClick={handleCreateTemplate}
                  style={{background:"linear-gradient(135deg,#4f46e5,#818cf8)",color:"#fff",border:"none",
                    borderRadius:10,padding:"9px 16px",fontWeight:800,fontSize:13,cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",boxShadow:"0 4px 14px rgba(99,102,241,0.4)"}}>
                  {hasRows ? "↺ Rebuild" : "➕ Create Template"}
                </button>
                {hasRows && (
                  <button onClick={applyVendorToAll}
                    style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",
                      color:"#818cf8",borderRadius:10,padding:"7px 14px",fontWeight:700,fontSize:12,
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
                    Apply to All
                  </button>
                )}
              </div>
            </div>

            {/* Info strip */}
            <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
              {[
                {col:"#818cf8", icon:"📋", txt:"Fill amounts & dates per row"},
                {col:"#10b981", icon:"📋", txt:"Clone any row for same vendor different date"},
                {col:"#f59e0b", icon:"⚠",  txt:"Duplicate detection runs on every row"},
              ].map(({col,icon,txt})=>(
                <div key={txt} style={{display:"flex",alignItems:"center",gap:5,
                  background:`${col}10`,border:`1px solid ${col}25`,borderRadius:8,
                  padding:"5px 11px",fontSize:11,color:`${col}`,fontWeight:600}}>
                  {icon} {txt}
                </div>
              ))}
            </div>
          </div>

          {/* ── TABLE ── */}
          {hasRows && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600}}>
                  {rows.length} rows · {checkedCount} selected · <span style={{color:"#fbbf24",fontWeight:800}}>{fmt(totalAmt)}</span>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>setRows(r=>r.map(x=>({...x,checked:true})))}
                    style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.25)",
                      color:"#10b981",borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:700,
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✓ All</button>
                  <button onClick={()=>setRows(r=>r.map(x=>({...x,checked:false})))}
                    style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",
                      color:"#ef4444",borderRadius:8,padding:"5px 11px",fontSize:11,fontWeight:700,
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✗ None</button>
                  <button onClick={addBlankRow}
                    style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",
                      color:"#818cf8",borderRadius:8,padding:"5px 13px",fontSize:11,fontWeight:700,
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
                    <Icon n="plus" s={11}/> Row
                  </button>
                </div>
              </div>

              {/* Mobile: card per row. Desktop: table. Breakpoint at 640px via window check */}
              {mob ? (
                /* ── MOBILE CARD LAYOUT ── */
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {rows.map((row, rowIdx) => {
                    const dup = checkDup(row, rowIdx);
                    const cat = catByCode(row.categoryCode);
                    const cardBorder = (dup && dup.level)==="hard"&&!row.overrideDup
                      ? "1.5px solid rgba(239,68,68,0.5)"
                      : (dup && dup.level)==="soft"&&!row.overrideDup
                        ? "1.5px solid rgba(245,158,11,0.4)"
                        : "1px solid rgba(99,102,241,0.2)";
                    return (
                      <div key={row._id} style={{background:dup&&!row.overrideDup?"rgba(239,68,68,0.04)":"rgba(99,102,241,0.04)",
                        border:cardBorder,borderRadius:14,padding:"14px 14px 10px",
                        opacity:row.checked?1:0.5,transition:"all 0.15s"}}>

                        {/* Card header: # + checkbox + actions */}
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                          <input type="checkbox" checked={row.checked}
                            onChange={e=>updateRow(row._id,"checked",e.target.checked)}
                            style={{width:16,height:16,accentColor:"#818cf8",cursor:"pointer",flexShrink:0}}/>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontWeight:700}}>Row {rowIdx+1}</span>
                          <div style={{flex:1}}/>
                          <button type="button" onClick={()=>cloneRow(row)}
                            style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",
                              color:"#818cf8",borderRadius:7,padding:"5px 10px",cursor:"pointer",
                              fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>⧉ Clone</button>
                          <button type="button" onClick={()=>removeRow(row._id)}
                            style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",
                              color:"#ef4444",borderRadius:7,padding:"5px 8px",cursor:"pointer",
                              fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                        </div>

                        {/* Date + Amount row */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                          <div>
                            <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Date</label>
                            <input type="date" value={row.date}
                              onChange={e=>updateRow(row._id,"date",e.target.value)}
                              style={{...INP,width:"100%",padding:"8px 10px",fontSize:13,boxSizing:"border-box"}}/>
                          </div>
                          <div>
                            <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Amount (₹)</label>
                            <input type="number" value={row.amount} placeholder="0"
                              onChange={e=>updateRow(row._id,"amount",e.target.value)}
                              style={{...INP,width:"100%",padding:"8px 10px",fontSize:15,fontWeight:800,
                                color:"#fbbf24",boxSizing:"border-box",
                                borderColor:!row.amount?"rgba(239,68,68,0.5)":undefined}}/>
                          </div>
                        </div>

                        {/* Vendor */}
                        <div style={{marginBottom:8}}>
                          <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Vendor / UPI</label>
                          <input value={row.upiId} onChange={e=>updateRow(row._id,"upiId",e.target.value)}
                            placeholder="Vendor / UPI ID"
                            style={{...INP,width:"100%",padding:"8px 10px",fontSize:13,boxSizing:"border-box"}}/>
                        </div>

                        {/* Purpose */}
                        <div style={{marginBottom:8}}>
                          <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Purpose</label>
                          <input value={row.purpose} onChange={e=>updateRow(row._id,"purpose",e.target.value)}
                            placeholder="What was this for?"
                            style={{...INP,width:"100%",padding:"8px 10px",fontSize:13,boxSizing:"border-box"}}/>
                        </div>

                        {/* Category */}
                        <div style={{marginBottom:10}}>
                          <label style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>Category</label>
                          <select value={row.categoryCode} onChange={e=>updateRow(row._id,"categoryCode",e.target.value)}
                            style={{...INP,width:"100%",padding:"8px 10px",fontSize:13,
                              color:cat.color,borderColor:`${cat.color}40`,boxSizing:"border-box"}}>
                            {CATEGORIES.map(c=><option key={c.code} value={c.code}>{c.icon} {c.label}</option>)}
                          </select>
                        </div>

                        {/* Attachments row */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                          <label style={{cursor:"pointer"}}>
                            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>📸 UPI Screenshot</div>
                            {row.receiptDataUrl ? (
                              <div style={{position:"relative",display:"inline-block"}}>
                                <img src={row.receiptDataUrl} alt="upi"
                                  style={{width:"100%",maxHeight:70,objectFit:"cover",borderRadius:8,
                                    border:"1.5px solid rgba(16,185,129,0.5)"}}/>
                                <button type="button" onClick={e=>{e.preventDefault();updateRow(row._id,"receiptDataUrl",null);}}
                                  style={{position:"absolute",top:-6,right:-6,background:"#ef4444",border:"none",
                                    color:"#fff",borderRadius:"50%",width:18,height:18,cursor:"pointer",
                                    fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
                              </div>
                            ) : (
                              <div style={{background:"rgba(16,185,129,0.07)",border:"1.5px dashed rgba(16,185,129,0.3)",
                                borderRadius:9,padding:"12px 8px",textAlign:"center",
                                fontSize:22,color:"rgba(16,185,129,0.6)"}}>📸</div>
                            )}
                            <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                              onChange={e=>e.target.files[0]&&attachFile(row._id,"receiptDataUrl",e.target.files[0])}/>
                          </label>
                          <label style={{cursor:"pointer"}}>
                            <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>🧾 Bill / Invoice</div>
                            {row.invoiceDataUrl ? (
                              <div style={{position:"relative",display:"inline-block"}}>
                                <img src={row.invoiceDataUrl} alt="bill"
                                  style={{width:"100%",maxHeight:70,objectFit:"cover",borderRadius:8,
                                    border:"1.5px solid rgba(139,92,246,0.5)"}}/>
                                <button type="button" onClick={e=>{e.preventDefault();updateRow(row._id,"invoiceDataUrl",null);}}
                                  style={{position:"absolute",top:-6,right:-6,background:"#ef4444",border:"none",
                                    color:"#fff",borderRadius:"50%",width:18,height:18,cursor:"pointer",
                                    fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
                              </div>
                            ) : (
                              <div style={{background:"rgba(139,92,246,0.07)",border:"1.5px dashed rgba(139,92,246,0.3)",
                                borderRadius:9,padding:"12px 8px",textAlign:"center",
                                fontSize:22,color:"rgba(139,92,246,0.6)"}}>🧾</div>
                            )}
                            <input type="file" accept="image/*,application/pdf" style={{display:"none"}}
                              onChange={e=>e.target.files[0]&&attachFile(row._id,"invoiceDataUrl",e.target.files[0])}/>
                          </label>
                        </div>

                        {/* Dup warning on card */}
                        {dup&&(
                          <div style={{background:dup.level==="hard"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.08)",
                            border:`1px solid ${dup.level==="hard"?"rgba(239,68,68,0.4)":"rgba(245,158,11,0.3)"}`,
                            borderRadius:8,padding:"8px 11px"}}>
                            <div style={{fontSize:11,fontWeight:700,
                              color:dup.level==="hard"?"#ef4444":dup.level==="soft"?"#f59e0b":"#fbbf24",
                              marginBottom:dup.level!=="warn"?5:0}}>
                              {dup.level==="hard"?"🔴":dup.level==="soft"?"🟡":"🟠"} {dup.msg}
                            </div>
                            {(dup.level==="hard"||dup.level==="soft")&&(
                              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
                                <input type="checkbox" checked={row.overrideDup||false}
                                  onChange={e=>updateRow(row._id,"overrideDup",e.target.checked)}
                                  style={{accentColor:"#f59e0b",width:13,height:13}}/>
                                <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:600}}>
                                  Override — this is intentional
                                </span>
                              </label>
                            )}
                          </div>
                        )}
                        {!dup&&row.amount&&(
                          <div style={{fontSize:10,color:"rgba(16,185,129,0.6)",fontWeight:700}}>✓ No duplicates found</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── DESKTOP TABLE LAYOUT ── */
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}>
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(99,102,241,0.25)"}}>
                        {["","#","Date","Amount (₹)","Vendor / UPI","Purpose","Category","📸 UPI","🧾 Bill","⚠ Dup","Actions"].map(h=>(
                          <th key={h} style={{padding:"8px 8px",textAlign:"left",fontSize:9,fontWeight:800,
                            color:"rgba(129,140,248,0.55)",textTransform:"uppercase",letterSpacing:"0.08em",
                            whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIdx) => {
                        const dup  = checkDup(row, rowIdx);
                        const cat  = catByCode(row.categoryCode);
                        const rowBg = (dup && dup.level)==="hard" && !row.overrideDup
                          ? "rgba(239,68,68,0.07)"
                          : (dup && dup.level)==="soft" && !row.overrideDup
                            ? "rgba(245,158,11,0.05)"
                            : "transparent";
                        const rowBorder = (dup && dup.level)==="hard" && !row.overrideDup
                          ? "2px solid rgba(239,68,68,0.5)"
                          : "2px solid transparent";

                        return (
                          <tr key={row._id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",
                            background:rowBg,borderLeft:rowBorder,
                            opacity:row.checked?1:0.4,transition:"all 0.15s"}}>
                            <td style={{padding:"7px 8px",width:24}}>
                              <input type="checkbox" checked={row.checked}
                                onChange={e=>updateRow(row._id,"checked",e.target.checked)}
                                style={{width:14,height:14,accentColor:"#818cf8",cursor:"pointer"}}/>
                            </td>
                            <td style={{padding:"7px 6px",fontSize:11,color:"rgba(255,255,255,0.2)",fontWeight:700,width:24,textAlign:"center"}}>{rowIdx+1}</td>
                            <td style={{padding:"7px 5px"}}>
                              <input type="date" value={row.date} onChange={e=>updateRow(row._id,"date",e.target.value)}
                                style={{...INP,padding:"5px 7px",fontSize:12,width:130}}/>
                            </td>
                            <td style={{padding:"7px 5px"}}>
                              <input type="number" value={row.amount} placeholder="0"
                                onChange={e=>updateRow(row._id,"amount",e.target.value)}
                                style={{...INP,padding:"5px 7px",fontSize:13,width:88,fontWeight:800,color:"#fbbf24",
                                  borderColor:!row.amount?"rgba(239,68,68,0.4)":undefined}}/>
                            </td>
                            <td style={{padding:"7px 5px"}}>
                              <input value={row.upiId} onChange={e=>updateRow(row._id,"upiId",e.target.value)}
                                placeholder="Vendor / UPI ID"
                                style={{...INP,padding:"5px 7px",fontSize:12,width:140}}/>
                            </td>
                            <td style={{padding:"7px 5px"}}>
                              <input value={row.purpose} onChange={e=>updateRow(row._id,"purpose",e.target.value)}
                                placeholder="Purpose"
                                style={{...INP,padding:"5px 7px",fontSize:12,width:155}}/>
                            </td>
                            <td style={{padding:"7px 5px"}}>
                              <select value={row.categoryCode} onChange={e=>updateRow(row._id,"categoryCode",e.target.value)}
                                style={{...INP,padding:"5px 7px",fontSize:11,width:130,color:cat.color,borderColor:`${cat.color}40`}}>
                                {CATEGORIES.map(c=><option key={c.code} value={c.code}>{c.icon} {c.label}</option>)}
                              </select>
                            </td>
                            <td style={{padding:"7px 5px",width:60}}>
                              <label style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {row.receiptDataUrl ? (
                                  <div style={{position:"relative"}}>
                                    <img src={row.receiptDataUrl} alt="upi" style={{width:34,height:34,objectFit:"cover",borderRadius:5,border:"1.5px solid rgba(16,185,129,0.5)"}}/>
                                    <button type="button" onClick={e=>{e.preventDefault();updateRow(row._id,"receiptDataUrl",null);}}
                                      style={{position:"absolute",top:-5,right:-5,background:"#ef4444",border:"none",color:"#fff",borderRadius:"50%",width:14,height:14,cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0}}>✕</button>
                                  </div>
                                ) : (
                                  <div style={{background:"rgba(16,185,129,0.07)",border:"1.5px dashed rgba(16,185,129,0.3)",borderRadius:7,padding:"5px",fontSize:16,color:"rgba(16,185,129,0.6)"}}>📸</div>
                                )}
                                <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>e.target.files[0]&&attachFile(row._id,"receiptDataUrl",e.target.files[0])}/>
                              </label>
                            </td>
                            <td style={{padding:"7px 5px",width:60}}>
                              <label style={{cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {row.invoiceDataUrl ? (
                                  <div style={{position:"relative"}}>
                                    <img src={row.invoiceDataUrl} alt="bill" style={{width:34,height:34,objectFit:"cover",borderRadius:5,border:"1.5px solid rgba(139,92,246,0.5)"}}/>
                                    <button type="button" onClick={e=>{e.preventDefault();updateRow(row._id,"invoiceDataUrl",null);}}
                                      style={{position:"absolute",top:-5,right:-5,background:"#ef4444",border:"none",color:"#fff",borderRadius:"50%",width:14,height:14,cursor:"pointer",fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0}}>✕</button>
                                  </div>
                                ) : (
                                  <div style={{background:"rgba(139,92,246,0.07)",border:"1.5px dashed rgba(139,92,246,0.3)",borderRadius:7,padding:"5px",fontSize:16,color:"rgba(139,92,246,0.6)"}}>🧾</div>
                                )}
                                <input type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={e=>e.target.files[0]&&attachFile(row._id,"invoiceDataUrl",e.target.files[0])}/>
                              </label>
                            </td>
                            <td style={{padding:"7px 5px",width:80}}>
                              {dup ? (
                                <div>
                                  <div style={{fontSize:10,fontWeight:700,color:dup.level==="hard"?"#ef4444":dup.level==="soft"?"#f59e0b":"#fbbf24",lineHeight:1.4,maxWidth:90,whiteSpace:"normal"}}>
                                    {dup.level==="hard"?"🔴":dup.level==="soft"?"🟡":"🟠"} {dup.msg}
                                  </div>
                                  {(dup.level==="hard"||dup.level==="soft")&&(
                                    <label style={{display:"flex",alignItems:"center",gap:3,marginTop:4,cursor:"pointer"}}>
                                      <input type="checkbox" checked={row.overrideDup||false}
                                        onChange={e=>updateRow(row._id,"overrideDup",e.target.checked)}
                                        style={{accentColor:"#f59e0b",width:11,height:11}}/>
                                      <span style={{fontSize:9,color:"rgba(255,255,255,0.4)",fontWeight:600}}>Override</span>
                                    </label>
                                  )}
                                </div>
                              ) : (
                                row.amount ? <span style={{fontSize:11,color:"rgba(16,185,129,0.6)",fontWeight:700}}>✓ Clear</span>
                                           : <span style={{fontSize:11,color:"rgba(255,255,255,0.15)"}}>—</span>
                              )}
                            </td>
                            <td style={{padding:"7px 6px",whiteSpace:"nowrap"}}>
                              <div style={{display:"flex",gap:4}}>
                                <button type="button" onClick={()=>cloneRow(row)}
                                  style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",color:"#818cf8",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>⧉</button>
                                <button type="button" onClick={()=>removeRow(row._id)}
                                  style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✕</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Dup legend */}
              <div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}>
                {[
                  {col:"#ef4444",icon:"🔴",txt:"Exact duplicate — blocked until you override"},
                  {col:"#f59e0b",icon:"🟡",txt:"Probable dup (same amount ±3 days, same category)"},
                  {col:"#fbbf24",icon:"🟠",txt:"Suspicious (same vendor+amount within 7 days)"},
                  {col:"#10b981",icon:"✓", txt:"Clear — no duplicates found"},
                ].map(({col,icon,txt})=>(
                  <div key={txt} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,
                    color:`${col}`,fontWeight:600}}>{icon} {txt}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!hasRows && (
            <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(255,255,255,0.2)"}}>
              <div style={{fontSize:44,marginBottom:12}}>📋</div>
              <div style={{fontSize:14,fontWeight:600}}>Fill in the setup above and click Create Template</div>
              <div style={{fontSize:12,marginTop:6,lineHeight:1.7}}>
                Pick your vendor, default category, and how many rows you need.<br/>
                Each row gets a Clone button — perfect for 3 bills from the same vendor.
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {hasRows && (
          <div style={{padding:"14px 26px",borderTop:"1px solid rgba(255,255,255,0.07)",flexShrink:0,
            display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>
              Importing <strong style={{color:"#818cf8"}}>{checkedCount}</strong> rows
              {" · "}<strong style={{color:"#fbbf24"}}>{fmt(totalAmt)}</strong>
              {" for "}<strong style={{color:"#10b981"}}>{member||"(no member)"}</strong>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onClose}
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                  color:"rgba(255,255,255,0.5)",borderRadius:10,padding:"10px 20px",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14}}>Cancel</button>
              <button onClick={handleImport}
                disabled={!member||checkedCount===0}
                style={{background:(!member||checkedCount===0)
                  ?"rgba(99,102,241,0.3)"
                  :"linear-gradient(135deg,#4f46e5,#6366f1)",
                  color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",
                  cursor:(!member||checkedCount===0)?"not-allowed":"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:14,
                  boxShadow:"0 4px 18px rgba(99,102,241,0.35)",
                  display:"flex",alignItems:"center",gap:8}}>
                <Icon n="dl" s={15}/>Import {checkedCount} Expense{checkedCount!==1?"s":""}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



const MAX_PIN_ATTEMPTS = 5;

function MemberPinModal({members, memberPinStatus, dbReady, onSuccess, onVerify, onSavePin, onClose}) {
  const [selectedMember, setSelectedMember] = useState("");
  const [mode,     setMode]     = useState("verify");   // "verify" | "setpin"
  const [digits,   setDigits]   = useState(["","","","",""]);
  const [confirm,  setConfirm]  = useState(["","","","",""]);  // confirm digits for set-PIN
  const [error,    setError]    = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedOut,setLockedOut]= useState(false);
  const [saving,   setSaving]   = useState(false);
  const [checking, setChecking] = useState(false);
  const entryRefs   = [useRef(),useRef(),useRef(),useRef(),useRef()];
  const confirmRefs = [useRef(),useRef(),useRef(),useRef(),useRef()];
  const INP={width:"100%",padding:"9px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};

  const makeKeyHandler = (arr, setArr, refs, i, onComplete) => (val) => {
    if(!/^\d?$/.test(val)) return;
    const next=[...arr]; next[i]=val; setArr(next); setError("");
    if(val && i<4) refs[i+1].current?.focus();
    if(i===4 && val && next.join("").length===5) onComplete(next.join(""));
  };

  const makeKeyDownHandler = (arr, refs, i, onComplete) => (e) => {
    if(e.key==="Backspace" && !arr[i] && i>0) refs[i-1].current?.focus();
    if(e.key==="Enter"){ const pin=arr.join(""); if(pin.length===5) onComplete(pin); }
  };

  // ── VERIFY mode ─────────────────────────────────────────────────────
  const verify = async (pin) => {
    if(lockedOut) return;
    if(!selectedMember){ setError("Please select your name first."); return; }
    if(!memberPinStatus[selectedMember]){
      // No PIN set yet — switch to set-PIN flow
      setMode("setpin");
      setDigits(["","","","",""]);
      setConfirm(["","","","",""]);
      setError("");
      setTimeout(()=>entryRefs[0].current?.focus(), 80);
      return;
    }
    setChecking(true);
    const result = await onVerify(selectedMember, pin);
    setChecking(false);
    if(result?.success){
      setAttempts(0);
      setLockedOut(false);
      onSuccess(result.member || selectedMember);
      return;
    }
    const attemptsUsed = Number.isFinite(result?.attemptsUsed)
      ? result.attemptsUsed
      : Number.isFinite(result?.attemptsRemaining)
        ? Math.max(0, MAX_PIN_ATTEMPTS - result.attemptsRemaining)
        : attempts + 1;
    setAttempts(attemptsUsed);
    setDigits(["","","","",""]);
    if(result?.lockedOut || attemptsUsed >= MAX_PIN_ATTEMPTS){
      setLockedOut(true);
      setError(result?.error || `Account locked after ${MAX_PIN_ATTEMPTS} failed attempts. Contact the Treasurer to reset your PIN.`);
    } else {
      const remaining = Number.isFinite(result?.attemptsRemaining)
        ? result.attemptsRemaining
        : Math.max(0, MAX_PIN_ATTEMPTS - attemptsUsed);
      setError(result?.error || `Incorrect PIN — ${remaining} attempt${remaining===1?"":"s"} remaining before lockout.`);
      setTimeout(()=>entryRefs[0].current?.focus(), 50);
    }
  };

  // ── SET-PIN mode — step 1: enter new PIN ────────────────────────────
  const handleNewPinComplete = (pin) => {
    // Move focus to confirm row
    setTimeout(()=>confirmRefs[0].current?.focus(), 80);
  };

  // ── SET-PIN mode — step 2: confirm PIN ──────────────────────────────
  const handleConfirmComplete = async (pin) => {
    const newPin = digits.join("");
    if(newPin.length < 5){ setError("Enter all 5 digits of your new PIN first."); return; }
    if(pin !== newPin){ setError("PINs don't match — please try again."); setConfirm(["","","","",""]); setTimeout(()=>confirmRefs[0].current?.focus(),50); return; }
    setSaving(true);
    const result = await onSavePin(selectedMember, pin);
    setSaving(false);
    if(!result?.success){
      setError(result?.error || "Could not save your PIN right now.");
      return;
    }
    setAttempts(0);
    setLockedOut(false);
    onSuccess(result.member || selectedMember);
  };

  const handleMemberChange = (name) => {
    setSelectedMember(name); setMode("verify");
    setDigits(["","","","",""]); setConfirm(["","","","",""]);
    setError(""); setAttempts(0); setLockedOut(false);
    setTimeout(()=>entryRefs[0].current?.focus(), 50);
  };

  const isVerifyReady   = !lockedOut && selectedMember && digits.join("").length===5 && !checking;
  const isSetPinReady   = digits.join("").length===5 && confirm.join("").length===5 && !saving;

  const accentColor = lockedOut ? "#ef4444" : mode==="setpin" ? "#10b981" : "#fbbf24";
  const icon        = lockedOut ? "🔒" : mode==="setpin" ? "🔐" : "🔑";
  const title       = lockedOut ? "Access Locked" : mode==="setpin" ? "Set Your PIN" : "Member Verification";
  const subtitle    = lockedOut
    ? "Too many incorrect attempts. Please contact the Treasurer."
    : mode==="setpin"
      ? `Hi ${selectedMember}! Choose a private 5-digit PIN. You'll use this every time you submit expenses.`
      : "Select your name and enter your PIN to submit expenses";
  const selectedMemberHasPin = selectedMember ? !!memberPinStatus[selectedMember] : false;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"linear-gradient(135deg,#0a1628,#0f2040)",border:`1px solid ${accentColor}50`,borderRadius:24,padding:"40px 36px",width:"100%",maxWidth:420,boxShadow:"0 24px 80px rgba(0,0,0,0.8)",textAlign:"center"}}>

        <div style={{width:62,height:62,borderRadius:"50%",background:`${accentColor}15`,border:`2px solid ${accentColor}45`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:28}}>
          {icon}
        </div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:accentColor,margin:"0 0 6px"}}>{title}</h3>
        <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:"0 0 24px",lineHeight:1.6}}>{subtitle}</p>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:dbReady?"rgba(16,185,129,0.08)":"rgba(251,191,36,0.08)",border:`1px solid ${dbReady?"rgba(16,185,129,0.25)":"rgba(251,191,36,0.25)"}`,borderRadius:999,padding:"7px 12px",margin:"0 auto 18px",fontSize:11,fontWeight:700,color:dbReady?"#10b981":"#fbbf24"}}>
          <span>{dbReady?"●":"○"}</span>
          <span>{members.length} member{members.length===1?"":"s"} loaded {dbReady?"from Sheets":"from fallback list"}</span>
        </div>

        {!lockedOut && (
          <>
            {/* Member selector — only shown in verify mode */}
            {mode==="verify" && (
              <div style={{marginBottom:20,textAlign:"left"}}>
                <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>Your Name</label>
                <select value={selectedMember} onChange={e=>handleMemberChange(e.target.value)} style={INP}>
                  <option value="">Select your name</option>
                  {members.map(m=><option key={m}>{m}</option>)}
                </select>
                {selectedMember && (
                  <div style={{marginTop:8,fontSize:11,color:selectedMemberHasPin?"#10b981":"#fbbf24",fontWeight:700}}>
                    {selectedMemberHasPin ? "PIN already set — enter it below to continue." : "First-time setup — choose your new 5-digit PIN after selecting your name."}
                  </div>
                )}
              </div>
            )}

            {/* PIN entry row — "Enter PIN" in verify mode, "New PIN" in setpin mode */}
            <div style={{marginBottom:mode==="setpin"?16:8,textAlign:"left"}}>
              <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {mode==="setpin" ? "Choose New PIN" : "Your PIN"}
              </label>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                {digits.map((d,i)=>(
                  <input key={i} ref={entryRefs[i]}
                    type="password" inputMode="numeric" maxLength={1} value={d}
                    onChange={e=>makeKeyHandler(digits,setDigits,entryRefs,i,mode==="setpin"?handleNewPinComplete:verify)(e.target.value)}
                    onKeyDown={e=>makeKeyDownHandler(digits,entryRefs,i,mode==="setpin"?handleNewPinComplete:verify)(e)}
                    style={{width:48,height:56,textAlign:"center",fontSize:22,fontWeight:800,
                      background:"rgba(255,255,255,0.07)",
                      border:`2px solid ${error&&mode==="verify"?"rgba(239,68,68,0.6)":d?`${accentColor}90`:"rgba(255,255,255,0.15)"}`,
                      borderRadius:12,color:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s"}}
                  />
                ))}
              </div>
              {attempts>0 && mode==="verify" && (
                <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:10}}>
                  {Array.from({length:MAX_PIN_ATTEMPTS}).map((_,i)=>(
                    <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<attempts?"#ef4444":"rgba(255,255,255,0.15)",transition:"background 0.2s"}}/>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm PIN row — only in setpin mode */}
            {mode==="setpin" && (
              <div style={{marginBottom:8,textAlign:"left"}}>
                <label style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>Confirm PIN</label>
                <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                  {confirm.map((d,i)=>(
                    <input key={i} ref={confirmRefs[i]}
                      type="password" inputMode="numeric" maxLength={1} value={d}
                      onChange={e=>makeKeyHandler(confirm,setConfirm,confirmRefs,i,handleConfirmComplete)(e.target.value)}
                      onKeyDown={e=>makeKeyDownHandler(confirm,confirmRefs,i,handleConfirmComplete)(e)}
                      style={{width:48,height:56,textAlign:"center",fontSize:22,fontWeight:800,
                        background:"rgba(255,255,255,0.07)",
                        border:`2px solid ${error&&mode==="setpin"?"rgba(239,68,68,0.6)":d?"rgba(16,185,129,0.7)":"rgba(255,255,255,0.15)"}`,
                        borderRadius:12,color:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s"}}
                    />
                  ))}
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",textAlign:"center",marginTop:8}}>
                  Re-enter the same PIN to confirm
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{background:lockedOut?"rgba(239,68,68,0.12)":"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#ef4444",textAlign:"left",lineHeight:1.5}}>
            {lockedOut?"🔒":"⚠"} {error}
          </div>
        )}

        {/* Action button */}
        {!lockedOut && (
          <button
            disabled={mode==="setpin" ? !isSetPinReady : !isVerifyReady}
            onClick={()=>{
              if(mode==="setpin"){
                const p1=digits.join(""), p2=confirm.join("");
                if(p1.length<5){setError("Enter all 5 digits of your new PIN.");return;}
                if(p2.length<5){setError("Re-enter your PIN to confirm.");return;}
                handleConfirmComplete(p2);
              } else {
                const pin=digits.join("");
                if(!selectedMember){setError("Please select your name first.");return;}
                if(pin.length===5) verify(pin); else setError("Enter all 5 digits of your PIN.");
              }
            }}
            style={{width:"100%",
              background:(mode==="setpin"?isSetPinReady:isVerifyReady)
                ?mode==="setpin"?"linear-gradient(135deg,#059669,#10b981)":"linear-gradient(135deg,#f59e0b,#fbbf24)"
                :"rgba(255,255,255,0.07)",
              color:(mode==="setpin"?isSetPinReady:isVerifyReady)?"#fff":"rgba(255,255,255,0.3)",
              border:"none",borderRadius:12,padding:"13px",fontWeight:800,fontSize:15,
              cursor:(mode==="setpin"?isSetPinReady:isVerifyReady)?"pointer":"default",
              fontFamily:"'DM Sans',sans-serif",marginBottom:12,transition:"all 0.2s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
          >
            {saving ? <><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Saving PIN...</>
              : checking ? <><div style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Verifying...</>
              : mode==="setpin" ? "🔐 Set PIN & Continue"
              : "Verify & Continue"}
          </button>
        )}

        {/* Back link in setpin mode */}
        {mode==="setpin" && !saving && (
          <button onClick={()=>{setMode("verify");setDigits(["","","","",""]);setConfirm(["","","","",""]);setError("");}}
            style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>
            ← Back
          </button>
        )}

        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",display:"block",margin:"0 auto"}}>
          {lockedOut?"Close":"Cancel"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PIN LOCK MODAL
═══════════════════════════════════════════════════════════ */
function PinModal({onVerify,onClose}) {
  const [digits,setDigits] = useState(["","","","",""]);
  const [error,setError]   = useState("");
  const [checking,setChecking] = useState(false);
  const [attempts,setAttempts] = useState(0);
  const [lockedOut,setLockedOut] = useState(false);
  const refs = [useRef(),useRef(),useRef(),useRef(),useRef()];

  const handleKey=(i,val)=>{
    if(lockedOut)return;
    if(!/^\d?$/.test(val))return;
    const next=[...digits]; next[i]=val; setDigits(next); setError("");
    if(val&&i<4)refs[i+1].current?.focus();
    if(i===4&&val){
      const pin=next.join("");
      if(pin.length===5)submit(pin,next);
    }
  };
  const handleKeyDown=(i,e)=>{
    if(lockedOut)return;
    if(e.key==="Backspace"&&!digits[i]&&i>0){refs[i-1].current?.focus();}
    if(e.key==="Enter"){const pin=digits.join(""); if(pin.length===5)submit(pin,digits);}
  };
  const submit=async(pin)=>{
    setChecking(true);
    const result = await onVerify(pin);
    setChecking(false);
    if(result?.success)return;
    const attemptsUsed = Number.isFinite(result?.attemptsUsed)
      ? result.attemptsUsed
      : Number.isFinite(result?.attemptsRemaining)
        ? Math.max(0, MAX_PIN_ATTEMPTS - result.attemptsRemaining)
        : attempts + 1;
    setAttempts(attemptsUsed);
    setDigits(["","","","",""]);
    if(result?.lockedOut || attemptsUsed >= MAX_PIN_ATTEMPTS){
      setLockedOut(true);
      setError(result?.error || `Account locked after ${MAX_PIN_ATTEMPTS} failed attempts.`);
    }else{
      const remaining = Number.isFinite(result?.attemptsRemaining)
        ? result.attemptsRemaining
        : Math.max(0, MAX_PIN_ATTEMPTS - attemptsUsed);
      setError(result?.error || `Incorrect PIN — ${remaining} attempt${remaining===1?"":"s"} remaining.`);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"linear-gradient(135deg,#0a1628,#0f2040)",border:"1px solid rgba(251,191,36,0.3)",borderRadius:24,padding:"40px 36px",width:"100%",maxWidth:380,boxShadow:"0 24px 80px rgba(0,0,0,0.7)",textAlign:"center"}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(251,191,36,0.1)",border:"2px solid rgba(251,191,36,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:26}}>🔐</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"#fbbf24",margin:"0 0 6px"}}>Treasurer Access</h3>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"0 0 28px"}}>{lockedOut?"Access is temporarily locked.":"Enter your 5-digit secret PIN"}</p>

        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
          {digits.map((d,i)=>(
            <input
              key={i} ref={refs[i]}
              type="password" inputMode="numeric" maxLength={1}
              value={d}
              onChange={e=>handleKey(i,e.target.value)}
              onKeyDown={e=>handleKeyDown(i,e)}
              disabled={lockedOut}
              style={{width:48,height:56,textAlign:"center",fontSize:22,fontWeight:800,background:"rgba(255,255,255,0.07)",border:`2px solid ${error?"rgba(239,68,68,0.6)":d?"rgba(251,191,36,0.6)":"rgba(255,255,255,0.15)"}`,borderRadius:12,color:"#fff",outline:"none",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s",opacity:lockedOut?0.55:1}}
            />
          ))}
        </div>

        {attempts>0 && !lockedOut && (
          <div style={{display:"flex",gap:5,justifyContent:"center",margin:"-8px 0 16px"}}>
            {Array.from({length:MAX_PIN_ATTEMPTS}).map((_,i)=>(
              <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<attempts?"#ef4444":"rgba(255,255,255,0.15)",transition:"background 0.2s"}}/>
            ))}
          </div>
        )}

        {error&&<div style={{color:"#ef4444",fontSize:13,marginBottom:14,fontWeight:600}}>{error}</div>}

        <button
          onClick={()=>{const pin=digits.join(""); if(pin.length===5)submit(pin); else setError("Enter all 5 digits");}}
          disabled={checking||lockedOut||digits.join("").length<5}
          style={{width:"100%",background:(!lockedOut&&digits.join("").length===5)?"linear-gradient(135deg,#f59e0b,#fbbf24)":"rgba(255,255,255,0.07)",color:(!lockedOut&&digits.join("").length===5)?"#1a1a00":"rgba(255,255,255,0.3)",border:"none",borderRadius:12,padding:"13px",fontWeight:800,fontSize:15,cursor:(!lockedOut&&digits.join("").length===5)?"pointer":"default",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s",marginBottom:12}}
        >
          {checking?<><div style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTopColor:"#1a1a00",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Verifying...</>:"Unlock Dashboard"}
        </button>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>{lockedOut?"Close":"Cancel"}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEMBER MANAGEMENT PANEL
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   MEMBER MANAGEMENT PANEL
═══════════════════════════════════════════════════════════ */
function MemberPanel({members, memberPinStatus, onAdd, onRemove, onResetPin, onClose}) {
  const [newName,   setNewName]   = useState("");
  const [removing,  setRemoving]  = useState(null);
  const [resetting, setResetting] = useState(null);  // member name being reset
  const [resetDone, setResetDone] = useState(null);  // member name just reset
  const INP={width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};

  const handleResetPin = async (name) => {
    setResetting(name);
    await onResetPin(name);
    setResetting(null);
    setResetDone(name);
    setTimeout(()=>setResetDone(null), 3000);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.80)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(16,185,129,0.3)",borderRadius:22,padding:32,width:"100%",maxWidth:520,boxShadow:"0 24px 80px rgba(0,0,0,0.7)",maxHeight:"85vh",display:"flex",flexDirection:"column",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexShrink:0}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#10b981",margin:0}}>👥 Member Management</h3>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"4px 0 0"}}>{members.length} active members · Reset PIN clears it so member sets a new one on next login</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer"}}><Icon n="x" s={18}/></button>
        </div>

        {/* Add new member */}
        <div style={{background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:16,marginBottom:20,flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(16,185,129,0.8)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Add New Member</div>
          <div style={{display:"flex",gap:8}}>
            <input value={newName} onChange={e=>setNewName(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newName.trim()){onAdd(newName.trim());setNewName("");}}}
              placeholder="Full name (e.g. Rajesh Kumar)" style={{...INP,flex:1,padding:"9px 13px",fontSize:13}}/>
            <button onClick={()=>{if(newName.trim()){onAdd(newName.trim());setNewName("");}}}
              disabled={!newName.trim()}
              style={{background:newName.trim()?"linear-gradient(135deg,#059669,#10b981)":"rgba(255,255,255,0.06)",color:newName.trim()?"#fff":"rgba(255,255,255,0.3)",border:"none",borderRadius:10,padding:"9px 18px",cursor:newName.trim()?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>
              <Icon n="plus" s={14}/>Add
            </button>
          </div>
        </div>

        {/* Members list */}
        <div style={{overflowY:"auto",flex:1}}>
          {members.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(255,255,255,0.2)"}}>No members yet. Add one above.</div>
          ):members.map((m,i)=>{
            const hasPin   = !!(memberPinStatus&&memberPinStatus[m]);
            const isReset  = resetting===m;
            const justDone = resetDone===m;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 4px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {/* Avatar */}
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>
                  {m.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                {/* Name */}
                <span style={{flex:1,fontSize:14,color:"rgba(255,255,255,0.85)",fontWeight:500}}>{m}</span>
                {/* PIN status badge */}
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,
                  background:hasPin?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.1)",
                  color:hasPin?"#10b981":"#f59e0b",
                  border:`1px solid ${hasPin?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,
                  whiteSpace:"nowrap"}}>
                  {hasPin?"🔐 PIN set":"⚠ No PIN"}
                </span>
                {/* Reset PIN button */}
                {hasPin&&(
                  <button onClick={()=>handleResetPin(m)} disabled={isReset}
                    style={{background:justDone?"rgba(16,185,129,0.15)":"rgba(245,158,11,0.08)",
                      border:`1px solid ${justDone?"rgba(16,185,129,0.35)":"rgba(245,158,11,0.25)"}`,
                      color:justDone?"#10b981":"#f59e0b",borderRadius:8,
                      padding:"5px 10px",cursor:isReset?"default":"pointer",
                      fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,
                      whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,
                      opacity:isReset?0.6:1}}>
                    {isReset?<><div style={{width:10,height:10,border:"1.5px solid rgba(245,158,11,0.3)",borderTopColor:"#f59e0b",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>...</>
                      :justDone?"✓ Reset":"🔑 Reset PIN"}
                  </button>
                )}
                {/* Remove button */}
                <button onClick={()=>setRemoving(m)}
                  style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  <Icon n="x" s={12}/>Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Confirm remove overlay */}
        {removing&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",padding:30}}>
            <div style={{background:"#0f2040",border:"1px solid rgba(239,68,68,0.4)",borderRadius:16,padding:28,textAlign:"center",maxWidth:300}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
              <div style={{fontWeight:700,color:"#fff",fontSize:15,marginBottom:6}}>Remove member?</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:20}}>
                <strong style={{color:"#fbbf24"}}>{removing}</strong> will no longer appear in the member dropdown. Their past expenses are unaffected.
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setRemoving(null)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:10,padding:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13}}>Cancel</button>
                <button onClick={()=>{onRemove(removing);setRemoving(null);}} style={{flex:1,background:"linear-gradient(135deg,#dc2626,#ef4444)",color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13}}>Yes, Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VENDOR PANEL
═══════════════════════════════════════════════════════════ */
function VendorPanel({vendors,onAdd,onRemove,onClose}) {
  const [newName,setNewName] = useState("");
  const [removing,setRemoving] = useState(null);
  const INP={width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.80)",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(251,191,36,0.3)",borderRadius:22,padding:32,width:"100%",maxWidth:480,boxShadow:"0 24px 80px rgba(0,0,0,0.7)",maxHeight:"85vh",display:"flex",flexDirection:"column",position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexShrink:0}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#fbbf24",margin:0}}>🏪 Vendor Management</h3>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:"4px 0 0"}}>{vendors.length} registered vendors</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer"}}><Icon n="x" s={18}/></button>
        </div>

        {/* Add new vendor */}
        <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:12,padding:16,marginBottom:20,flexShrink:0}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(251,191,36,0.8)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Add New Vendor</div>
          <div style={{display:"flex",gap:8}}>
            <input
              value={newName} onChange={e=>setNewName(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&newName.trim()){onAdd(newName.trim());setNewName("");}}}
              placeholder="Vendor / shop name (e.g. Kiran Electricals)" style={{...INP,flex:1,padding:"9px 13px",fontSize:13}}
            />
            <button
              onClick={()=>{if(newName.trim()){onAdd(newName.trim());setNewName("");}}}
              disabled={!newName.trim()}
              style={{background:newName.trim()?"linear-gradient(135deg,#d97706,#fbbf24)":"rgba(255,255,255,0.06)",color:newName.trim()?"#1a1a00":"rgba(255,255,255,0.3)",border:"none",borderRadius:10,padding:"9px 18px",cursor:newName.trim()?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}
            >
              <Icon n="plus" s={14}/>Add
            </button>
          </div>
        </div>

        {/* Vendors list */}
        <div style={{overflowY:"auto",flex:1}}>
          {vendors.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(255,255,255,0.2)"}}>No vendors yet. Add one above.</div>
          ):vendors.map((v,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 4px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#92400e,#d97706)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🏪</div>
              <span style={{flex:1,fontSize:14,color:"rgba(255,255,255,0.85)",fontWeight:500}}>{v}</span>
              <button
                onClick={()=>setRemoving(v)}
                style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:4}}
              >
                <Icon n="x" s={12}/>Remove
              </button>
            </div>
          ))}
        </div>

        {/* Confirm remove */}
        {removing&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",borderRadius:22,display:"flex",alignItems:"center",justifyContent:"center",padding:30}}>
            <div style={{background:"#0f2040",border:"1px solid rgba(239,68,68,0.4)",borderRadius:16,padding:28,textAlign:"center",maxWidth:300}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
              <div style={{fontWeight:700,color:"#fff",fontSize:15,marginBottom:6}}>Remove vendor?</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:20}}>
                <strong style={{color:"#fbbf24"}}>{removing}</strong> will no longer appear in vendor suggestions. Past records are unaffected.
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setRemoving(null)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:10,padding:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13}}>Cancel</button>
                <button onClick={()=>{onRemove(removing);setRemoving(null);}} style={{flex:1,background:"linear-gradient(135deg,#dc2626,#ef4444)",color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13}}>Yes, Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENT CARD — extracted to isolate division ops from esbuild JSX scanner
═══════════════════════════════════════════════════════════ */
function EventCard({ev, evSpend, entries, isTreasurer, fmt, onViewTxns, onDelete, onToggle}) {
  var spent      = evSpend(ev.id);
  var budget     = ev.budget || 0;
  var ratio      = budget > 0 ? spent / budget : 0;
  var budgetPct  = Math.min(100, Math.round(ratio * 100));
  var over       = spent > budget;
  var evEntries  = entries.filter(function(e){ return e.eventId === ev.id; });
  var pending    = evEntries.filter(function(e){ return e.status === "Pending"; })
                            .reduce(function(s,e){ return s + e.amount; }, 0);
  var remaining  = Math.max(0, budget - spent);
  var barColor   = over ? "linear-gradient(90deg,#ef4444,#dc2626)" : "linear-gradient(90deg,#d946ef,#a855f7)";
  var cardBorder = over ? "rgba(239,68,68,0.4)" : "rgba(217,70,239,0.25)";
  var boxShadow  = over ? "0 8px 30px rgba(239,68,68,0.12)" : "0 8px 30px rgba(217,70,239,0.08)";

  // Sub-category breakdown
  var subCatMap = {};
  evEntries.forEach(function(e){
    var k = e.subCategory || "Other";
    subCatMap[k] = (subCatMap[k] || 0) + e.amount;
  });
  var subCats = Object.entries(subCatMap);

  return (
    <div style={{background:"linear-gradient(135deg,#071428,#0c1e38)",border:"1px solid "+cardBorder,borderRadius:18,padding:22,boxShadow:boxShadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{fontSize:17,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:"#fff"}}>{ev.name}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:3}}>
            Tag: <span style={{color:"#d946ef",fontFamily:"monospace",fontWeight:700}}>{ev.tag}</span> · {ev.year}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <Badge status={ev.status} onClick={onToggle}/>
          {over && <span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>⚠ OVER BUDGET</span>}
          {!over && budgetPct>=80 && <span style={{fontSize:10,color:"#f59e0b",fontWeight:700}}>⚠ 80% USED</span>}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
          <span style={{color:"rgba(255,255,255,0.4)"}}>Budget utilization</span>
          <span style={{color:over?"#ef4444":"#d946ef",fontWeight:700}}>{budgetPct}%</span>
        </div>
        <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:4}}>
          <div style={{height:"100%",background:barColor,borderRadius:4,width:budgetPct+"%",transition:"width 0.5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginTop:5}}>
          <span style={{color:"rgba(255,255,255,0.35)"}}>Spent: <strong style={{color:"#fff"}}>{fmt(spent)}</strong></span>
          <span style={{color:"rgba(255,255,255,0.35)"}}>Budget: <strong style={{color:"#d946ef"}}>{fmt(budget)}</strong></span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
        {[
          {l:"Entries",   v:evEntries.length, c:null},
          {l:"Pending",   v:fmt(pending),     c:"#f59e0b"},
          {l:"Remaining", v:fmt(remaining),   c:"#10b981"},
        ].map(function(item){
          return (
            <div key={item.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:9,padding:"9px 10px",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:800,color:item.c||"#fff"}}>{item.v}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:2}}>{item.l}</div>
            </div>
          );
        })}
      </div>
      {subCats.length>0 && (
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>Sub-category breakdown</div>
          {subCats.map(function(pair){
            return (
              <div key={pair[0]} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:4}}>
                <span>{pair[0]}</span>
                <span style={{color:"#d946ef",fontWeight:700}}>{fmt(pair[1])}</span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{display:"flex",gap:8}}>
        <button onClick={onViewTxns} style={{flex:1,background:"rgba(217,70,239,0.08)",border:"1px solid rgba(217,70,239,0.22)",color:"#d946ef",borderRadius:10,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Icon n="eye" s={13}/>View Transactions
        </button>
        {isTreasurer && (
          <button onClick={onDelete} title="Delete event" style={{flexShrink:0,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.25)",color:"#ef4444",borderRadius:10,padding:"9px 13px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon n="trash" s={14}/>
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRANSACTIONS VIEW — read-only for all verified members
═══════════════════════════════════════════════════════════ */
function TxnsView({entries, events, verifiedMember, isTreasurer, isTreasurerMember, onViewReceipt}) {
  const {mob} = useBP();
  const [searchQ,  setSearchQ]  = useState("");
  const [fCat,     setFCat]     = useState("all");
  const [fMonth,   setFMonth]   = useState("all");
  const [fYear,    setFYear]    = useState(String(new Date().getFullYear()));
  const [fStatus,  setFStatus]  = useState("all");
  const [highlight,setHighlight]= useState(true); // highlight own entries

  const allYears = [...new Set(entries.map(e=>new Date(e.date).getFullYear()))].sort((a,b)=>b-a);

  const filtered = entries.filter(e=>{
    const dt = new Date(e.date);
    if(fYear!=="all"   && dt.getFullYear()!==Number(fYear))   return false;
    if(fMonth!=="all"  && dt.getMonth()!==Number(fMonth))     return false;
    if(fCat!=="all"    && e.categoryCode!==fCat)              return false;
    if(fStatus!=="all" && e.status!==fStatus)                 return false;
    if(searchQ.trim()){
      const q = searchQ.toLowerCase();
      if(!`${e.txnId} ${e.purpose} ${e.member} ${e.amount} ${(e.category||catByCode(e.categoryCode).label||e.categoryCode||"Unknown")}`.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b)=>new Date(b.date)-new Date(a.date));

  const totalAmt   = filtered.reduce((s,e)=>s+e.amount,0);
  const myEntries  = filtered.filter(e=>e.member===verifiedMember);
  const myTotal    = myEntries.reduce((s,e)=>s+e.amount,0);
  const myPending  = myEntries.filter(e=>e.status==="Pending").reduce((s,e)=>s+e.amount,0);

  const INP={padding:"8px 12px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none"};

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#fbbf24",margin:"0 0 4px"}}>
              Community Transactions
            </h2>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:0}}>
              Read-only view for all members · All amounts in ₹
            </p>
          </div>
          {/* Highlight toggle */}
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
            background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
            borderRadius:10,padding:"8px 14px"}}>
            <input type="checkbox" checked={highlight} onChange={e=>setHighlight(e.target.checked)}
              style={{accentColor:"#fbbf24",width:14,height:14,cursor:"pointer"}}/>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:600}}>
              Highlight my entries
            </span>
          </label>
        </div>
      </div>

      {/* My summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Community Total",   val:fmt(totalAmt),  sub:`${filtered.length} transactions`, col:"#fbbf24"},
          {label:"My Submissions",    val:fmt(myTotal),   sub:`${myEntries.length} entries`,      col:"#818cf8"},
          {label:"My Pending",        val:fmt(myPending), sub:"awaiting reimbursement",           col:"#f59e0b"},
        ].map(({label,val,sub,col})=>(
          <div key={label} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${col}25`,
            borderRadius:14,padding:"14px 18px",borderTop:`3px solid ${col}60`}}>
            <div style={{fontSize:10,fontWeight:700,color:`${col}90`,textTransform:"uppercase",
              letterSpacing:"0.08em",marginBottom:6}}>{label}</div>
            <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{val}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:4}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:13,padding:"12px 16px",marginBottom:14}}>
        {/* Search — always full width */}
        <div style={{position:"relative",marginBottom:8}}>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            placeholder="🔍 Search purpose, member, ID..."
            style={{...INP,width:"100%",boxSizing:"border-box",paddingRight:searchQ?28:12}}/>
          {searchQ&&(
            <button onClick={()=>setSearchQ("")}
              style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",padding:0,lineHeight:1}}>
              ✕
            </button>
          )}
        </div>
        {/* Filters — 2-col on mobile, single row on desktop */}
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr) auto auto",gap:6,alignItems:"center"}}>
          {[
            {val:fYear,   set:setFYear,   opts:[["all","All Years"],   ...allYears.map(y=>[String(y),String(y)])]},
            {val:fMonth,  set:setFMonth,  opts:[["all","All Months"],  ...MONTHS.map((m,i)=>[String(i),m])]},
            {val:fCat,    set:setFCat,    opts:[["all","All Cat"],      ...CATEGORIES.map(c=>[c.code,`${c.icon} ${c.label}`])]},
            {val:fStatus, set:setFStatus, opts:[["all","All Status"],   ["Pending","⏳ Pending"],["Reimbursed","✅ Reimbursed"]]},
          ].map(({val,set,opts},i)=>(
            <select key={i} value={val} onChange={e=>set(e.target.value)}
              style={{...INP,width:"100%",boxSizing:"border-box",fontSize:mob?11:12}}>
              {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          <button onClick={()=>{setSearchQ("");setFYear(String(new Date().getFullYear()));setFMonth("all");setFCat("all");setFStatus("all");}}
            style={{...INP,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,
              background:"rgba(255,255,255,0.04)",gridColumn:mob?"span 2":undefined}}>
            <Icon n="ref" s={11}/>{mob?" Reset":"Reset"}
          </button>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginTop:6,textAlign:"right"}}>
          {filtered.length} entries · {fmt(totalAmt)}
        </div>
      </div>

      {/* Table */}
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:14,
        border:"1px solid rgba(255,255,255,0.06)",overflowX:"auto",
        WebkitOverflowScrolling:"touch"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
            <thead>
              <tr style={{borderBottom:"1px solid rgba(251,191,36,0.12)"}}>
                {["Txn ID","Date","Member","Category","Purpose","Amount","Status","📎"].map(h=>(
                  <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10,
                    fontWeight:700,color:"rgba(251,191,36,0.5)",textTransform:"uppercase",
                    letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={8} style={{padding:"44px",textAlign:"center",
                  color:"rgba(255,255,255,0.2)",fontSize:14}}>
                  No transactions match the current filters
                </td></tr>
              ) : filtered.map(e=>{
                const cat    = catByCode(e.categoryCode||"GNMI");
                const ev     = events.find(ev=>ev.id===e.eventId);
                const isMe   = e.member===verifiedMember;
                const rowBg  = highlight && isMe
                  ? "rgba(251,191,36,0.05)" : "transparent";
                const rowBorderLeft = highlight && isMe
                  ? "3px solid rgba(251,191,36,0.5)" : "3px solid transparent";

                return (
                  <tr key={e.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",
                    background:rowBg,borderLeft:rowBorderLeft,transition:"background 0.15s"}}>

                    {/* Txn ID */}
                    <td style={{padding:"11px 14px"}}>
                      <div style={{fontFamily:"monospace",fontSize:11,color:isMe?"#fbbf24":"rgba(255,255,255,0.45)",fontWeight:700}}>
                        {e.txnId}
                      </div>
                      {ev&&<div style={{fontSize:10,color:"#d946ef",marginTop:2}}>🎉 {ev.name}</div>}
                      {isMe&&highlight&&(
                        <div style={{fontSize:9,color:"rgba(251,191,36,0.5)",fontWeight:700,
                          textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>★ mine</div>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{padding:"11px 14px",fontSize:12,
                      color:"rgba(255,255,255,0.45)",whiteSpace:"nowrap"}}>
                      {new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"})}
                    </td>

                    {/* Member */}
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,
                          background:isMe?"linear-gradient(135deg,#92400e,#f59e0b)":"linear-gradient(135deg,#1d4ed8,#3b82f6)",
                          color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:9,fontWeight:800}}>
                          {e.member.split(" ").map(w=>w[0]).slice(0,2).join("")}
                        </div>
                        <span style={{fontSize:12,fontWeight:isMe?700:500,
                          color:isTreasurerMember(e.member)?"#fbbf24":isMe?"#fbbf24":"rgba(255,255,255,0.7)"}}>
                          {e.member.split(" ")[0]}
                          {isTreasurerMember(e.member)&&<span style={{fontSize:9,opacity:0.7}}> ★</span>}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{padding:"11px 14px"}}>
                      <span style={{background:`${cat.color}18`,color:cat.color,
                        border:`1px solid ${cat.color}35`,borderRadius:7,
                        padding:"3px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>
                        {cat.icon} {e.categoryCode}
                      </span>
                    </td>

                    {/* Purpose */}
                    <td style={{padding:"11px 14px",fontSize:12,
                      color:"rgba(255,255,255,0.6)",maxWidth:200}}>
                      <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {e.purpose}
                      </div>
                      {e.notes&&(
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginTop:1,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {e.notes}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td style={{padding:"11px 14px",fontWeight:800,fontSize:14,
                      color:isMe?"#fbbf24":"rgba(255,255,255,0.85)",whiteSpace:"nowrap"}}>
                      {fmt(e.amount)}
                    </td>

                    {/* Status — read-only badge (no onClick) */}
                    <td style={{padding:"8px 10px"}}>
                      <Badge status={e.status}/>
                    </td>

                    {/* Receipt link */}
                    <td style={{padding:"8px 10px"}}>
                      {(e.receiptUrl||e.receiptDataUrl) ? (
                        <button onClick={()=>onViewReceipt(e)}
                          style={{background:e.receiptUrl?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)",
                            border:`1px solid ${e.receiptUrl?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,
                            color:e.receiptUrl?"#10b981":"#f59e0b",
                            borderRadius:7,padding:"4px 8px",cursor:"pointer",fontSize:12,lineHeight:1}}>
                          📎
                        </button>
                      ):(
                        <span style={{fontSize:11,color:"rgba(255,255,255,0.15)"}}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>

      {/* Footer note */}
      <div style={{marginTop:12,fontSize:11,color:"rgba(255,255,255,0.2)",textAlign:"center"}}>
        Read-only view · Contact the Treasurer for corrections
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   BREAKDOWN PANEL — Category + Member totals
   Extracted as component to avoid esbuild regex misparse
═══════════════════════════════════════════════════════════ */
function BreakdownPanel({catItems, memberItems, totalAmt, fmt}) {
  var invTotal = totalAmt > 0 ? 100 / totalAmt : 0;
  const panels = [
    {title:"By Category", items:catItems},
    {title:"By Member",   items:memberItems},
  ];
  return (
    <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {panels.map(function(panel){
        return (
          <div key={panel.title} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:18}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#fbbf24",margin:"0 0 14px"}}>{panel.title}</h3>
            {panel.items.map(function(row){
              var name = row[0];
              var amt  = row[1];
              var cat  = CATEGORIES.find(function(c){return c.label===name;});
              var icon = cat ? cat.icon : "👤";
              var pct = Math.round(amt * invTotal);
              var barW = pct + "%";
              return (
                <div key={name} style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                  <span style={{fontSize:15,width:22,textAlign:"center"}}>{icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                      <span style={{color:"rgba(255,255,255,0.65)",fontWeight:600}}>{name}</span>
                      <span style={{color:"#fbbf24",fontWeight:800}}>{fmt(amt)}</span>
                    </div>
                    <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,marginTop:4}}>
                      <div style={{height:"100%",background:"linear-gradient(90deg,#1d4ed8,#3b82f6)",borderRadius:2,width:barW,transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BANK BALANCE TRACKER
   Shows opening/closing balance per month for the year.
   Treasurer can edit; members view only.
   Closing = Opening − total expenses for that month.
═══════════════════════════════════════════════════════════ */
function BankTracker({entries, bankBalances, bankYear, setBankYear, bankAccount, isTreasurer, onSave, fmt}) {
  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [editingCell, setEditingCell] = useState(null); // {month, field}
  const [editVal, setEditVal]         = useState("");

  // Compute total expenses per month for the selected year
  function monthExpenses(mIdx) {
    return entries
      .filter(function(e){
        var d = new Date(e.date);
        return d.getFullYear() === bankYear && d.getMonth() === mIdx;
      })
      .reduce(function(s,e){ return s + e.amount; }, 0);
  }

  function getBalance(mIdx, field) {
    var yData = bankBalances[String(bankYear)];
    if (!yData) return null;
    var mData = yData[String(mIdx)];
    if (!mData) return null;
    return mData[field] != null ? mData[field] : null;
  }

  function startEdit(mIdx, field, currentVal) {
    if (!isTreasurer) return;
    setEditingCell({month:mIdx, field});
    setEditVal(currentVal != null ? String(currentVal) : "");
  }

  function commitEdit() {
    if (!editingCell) return;
    onSave(bankYear, editingCell.month, editingCell.field, editVal);
    setEditingCell(null);
    setEditVal("");
  }

  function handleKey(e) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") { setEditingCell(null); setEditVal(""); }
  }

  // Year totals
  var yearExpenses = 0;
  for (var mi = 0; mi < 12; mi++) { yearExpenses += monthExpenses(mi); }
  var yearOpen  = getBalance(0,  "open");
  var yearClose = getBalance(11, "close");
  var missingOpenCount = 0;
  var missingCloseCount = 0;
  for (var bi = 0; bi < 12; bi++) {
    if (getBalance(bi, "open") == null) missingOpenCount++;
    if (getBalance(bi, "close") == null) missingCloseCount++;
  }

  function BalanceCell(props) {
    var mIdx  = props.mIdx;
    var field = props.field;
    var color = props.color;
    var val   = getBalance(mIdx, field);
    var isEditing = editingCell && editingCell.month === mIdx && editingCell.field === field;
    if (isEditing) {
      return (
        <td style={{padding:"8px 12px",textAlign:"right"}}>
          <input
            autoFocus
            type="number"
            value={editVal}
            onChange={function(e){ setEditVal(e.target.value); }}
            onBlur={commitEdit}
            onKeyDown={handleKey}
            style={{width:110,background:"rgba(251,191,36,0.1)",border:"1.5px solid rgba(251,191,36,0.5)",borderRadius:7,padding:"5px 8px",color:"#fbbf24",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,textAlign:"right",outline:"none"}}
          />
        </td>
      );
    }
    return (
      <td
        onClick={function(){ startEdit(mIdx, field, val); }}
        style={{padding:"8px 12px",textAlign:"right",cursor:isTreasurer?"text":"default",borderRadius:6,transition:"background 0.15s",background:editingCell && editingCell.month === mIdx && editingCell.field === field ? "rgba(251,191,36,0.07)" : "transparent"}}
        title={isTreasurer ? "Click to edit" : ""}
      >
        {val != null ? (
          <span style={{fontSize:13,fontWeight:800,color:color,fontFamily:"'DM Sans',sans-serif"}}>
            {fmt(val)}
            {isTreasurer && <span style={{fontSize:9,opacity:0.4,marginLeft:4}}>✏</span>}
          </span>
        ) : (
          <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>
            {isTreasurer ? "— click to set" : "—"}
          </span>
        )}
      </td>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#10b981",margin:0}}>🏦 Bank Balance Tracker</h2>
          <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"4px 0 0"}}>{bankAccount} · Monthly opening & closing balance</p>
        </div>
        {/* Year selector */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={function(){setBankYear(bankYear-1);}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14,fontWeight:700}}>‹</button>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:800,color:"#fff",minWidth:50,textAlign:"center"}}>{bankYear}</span>
          <button onClick={function(){setBankYear(bankYear+1);}} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:14,fontWeight:700}}>›</button>
        </div>
      </div>

      {/* Year summary strip */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:22}}>
        <div style={{background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:14,padding:"14px 18px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(16,185,129,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Year Opening Balance</div>
          <div style={{fontSize:22,fontWeight:800,color:"#10b981",fontFamily:"'DM Sans',sans-serif"}}>{yearOpen != null ? fmt(yearOpen) : "—"}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>Jan {bankYear}</div>
        </div>
        <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:14,padding:"14px 18px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(239,68,68,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Total Expenses {bankYear}</div>
          <div style={{fontSize:22,fontWeight:800,color:"#f87171",fontFamily:"'DM Sans',sans-serif"}}>{fmt(yearExpenses)}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>All recorded expenses</div>
        </div>
        <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:14,padding:"14px 18px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(251,191,36,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Year Closing Balance</div>
          <div style={{fontSize:22,fontWeight:800,color:"#fbbf24",fontFamily:"'DM Sans',sans-serif"}}>{yearClose != null ? fmt(yearClose) : "—"}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>Dec {bankYear}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"12px 16px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Missing Entries</div>
          <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>{missingOpenCount + missingCloseCount}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>
            {missingOpenCount} opening missing · {missingCloseCount} closing missing
          </div>
        </div>
        <div style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.22)",borderRadius:14,padding:"12px 16px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"rgba(96,165,250,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Recommended Flow</div>
          <div style={{fontSize:12.5,color:"rgba(255,255,255,0.7)",lineHeight:1.5}}>
            Set each month’s opening balance, review recorded expenses, then enter the actual closing balance from the bank statement.
          </div>
        </div>
      </div>

      {/* Treasurer hint */}
      {isTreasurer && (
        <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:10,padding:"9px 16px",marginBottom:18,fontSize:12,color:"rgba(251,191,36,0.7)",display:"flex",alignItems:"center",gap:8}}>
          ✏️ Click any <strong>Opening</strong> or <strong>Closing</strong> cell to enter the balance. Expenses are auto-calculated from submitted entries.
        </div>
      )}

      {/* Monthly table */}
      <div style={{background:"rgba(255,255,255,0.02)",borderRadius:16,border:"1px solid rgba(255,255,255,0.06)",overflowX:"auto"}} className="tbl-wrap">
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
          <thead>
            <tr style={{borderBottom:"1px solid rgba(16,185,129,0.2)"}}>
              {["Month","Opening Balance","Expenses (recorded)","Closing Balance","Variance"].map(function(h){
                return <th key={h} style={{padding:"11px 14px",textAlign:h==="Month"?"left":"right",fontSize:10,fontWeight:700,color:"rgba(16,185,129,0.6)",textTransform:"uppercase",letterSpacing:"0.07em",whiteSpace:"nowrap"}}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {MONTHS_FULL.map(function(monthName, mIdx){
              var expenses = monthExpenses(mIdx);
              var opening  = getBalance(mIdx, "open");
              var closing  = getBalance(mIdx, "close");
              var isCurrentMonth = mIdx === new Date().getMonth() && bankYear === new Date().getFullYear();
              var isFuture = bankYear > new Date().getFullYear() ||
                             (bankYear === new Date().getFullYear() && mIdx > new Date().getMonth());
              // Variance: closing - (opening - expenses) = how much closing differs from expected
              var expectedClose = opening != null ? opening - expenses : null;
              var variance = (closing != null && expectedClose != null) ? closing - expectedClose : null;
              return (
                <tr key={mIdx} style={{
                  borderBottom:"1px solid rgba(255,255,255,0.04)",
                  background:isCurrentMonth?"rgba(16,185,129,0.05)":"transparent",
                  opacity: isFuture ? 0.45 : 1,
                }}>
                  <td style={{padding:"10px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:isCurrentMonth?"#10b981":isFuture?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.2)",flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:isCurrentMonth?800:500,color:isCurrentMonth?"#10b981":"rgba(255,255,255,0.7)"}}>
                        {MONTHS_SHORT[mIdx]} {bankYear}
                      </span>
                      {isCurrentMonth && <span style={{fontSize:9,fontWeight:700,color:"#10b981",background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:4,padding:"1px 5px",textTransform:"uppercase"}}>Current</span>}
                      {(opening == null || closing == null) && !isFuture && <span style={{fontSize:9,fontWeight:700,color:"#f59e0b",background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:4,padding:"1px 5px",textTransform:"uppercase"}}>Needs input</span>}
                    </div>
                  </td>
                  <BalanceCell mIdx={mIdx} field="open"  color="#10b981" />
                  <td style={{padding:"8px 12px",textAlign:"right"}}>
                    {expenses > 0 ? (
                      <span style={{fontSize:13,fontWeight:700,color:"#f87171",fontFamily:"'DM Sans',sans-serif"}}>− {fmt(expenses)}</span>
                    ) : (
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>—</span>
                    )}
                  </td>
                  <BalanceCell mIdx={mIdx} field="close" color="#fbbf24" />
                  <td style={{padding:"8px 12px",textAlign:"right"}}>
                    {variance != null ? (
                      <span style={{
                        fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",
                        color: Math.abs(variance) < 1 ? "#10b981" : variance > 0 ? "#34d399" : "#f87171",
                        background: Math.abs(variance) < 1 ? "rgba(16,185,129,0.1)" : variance > 0 ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                        border: Math.abs(variance) < 1 ? "1px solid rgba(16,185,129,0.25)" : variance > 0 ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(248,113,113,0.25)",
                        borderRadius:6,padding:"2px 8px",
                      }}>
                        {Math.abs(variance) < 1 ? "✓ Balanced" : (variance > 0 ? "+" : "") + fmt(variance)}
                      </span>
                    ) : (
                      <span style={{fontSize:11,color:"rgba(255,255,255,0.15)"}}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{marginTop:14,display:"flex",gap:20,flexWrap:"wrap",fontSize:11,color:"rgba(255,255,255,0.3)"}}>
        <span>🟢 <strong style={{color:"rgba(16,185,129,0.7)"}}>Opening</strong> = balance at start of month</span>
        <span>🔴 <strong style={{color:"rgba(248,113,113,0.7)"}}>Expenses</strong> = auto-summed from submitted entries</span>
        <span>🟡 <strong style={{color:"rgba(251,191,36,0.7)"}}>Closing</strong> = balance at end of month (actual bank)</span>
        <span>📊 <strong style={{color:"rgba(255,255,255,0.4)"}}>Variance</strong> = Closing − (Opening − Expenses)</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   MEMBER BALANCE SHEET
═══════════════════════════════════════════════════════════ */
function MemberBalanceSheet({entries, members, treasurerMembers=[], onBatchReimburse, onViewReceipt}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedIds, setSelectedIds]       = useState([]);
  const [payRef, setPayRef]                 = useState("");
  const [confirming, setConfirming]         = useState(false);

  // Build per-member summary from all entries
  const memberData = members.map(name=>{
    const mine = entries.filter(e=>e.member===name);
    const pending   = mine.filter(e=>e.status==="Pending");
    const reimbursed= mine.filter(e=>e.status==="Reimbursed");
    return {
      name,
      totalAmt:   mine.reduce((s,e)=>s+e.amount,0),
      pendingAmt: pending.reduce((s,e)=>s+e.amount,0),
      reimAmt:    reimbursed.reduce((s,e)=>s+e.amount,0),
      pendingEntries: pending.sort((a,b)=>new Date(b.date)-new Date(a.date)),
      reimEntries:    reimbursed.sort((a,b)=>new Date(b.date)-new Date(a.date)),
      count: mine.length,
    };
  }).filter(m=>m.count>0).sort((a,b)=>b.pendingAmt-a.pendingAmt);

  const sel = selectedMember ? memberData.find(m=>m.name===selectedMember) : null;

  const toggleId=(id)=>setSelectedIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const selectAll=()=>sel&&setSelectedIds(sel.pendingEntries.map(e=>e.id));
  const clearSel=()=>setSelectedIds([]);

  const totalPendingAll = memberData.reduce((s,m)=>s+m.pendingAmt,0);

  const INP={width:"100%",padding:"9px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:22}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#10b981",margin:"0 0 4px"}}>👥 Member Balance Sheet</h2>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:0}}>
          Pending reimbursements across all members · Total outstanding: <strong style={{color:"#f59e0b"}}>{`₹${totalPendingAll.toLocaleString("en-IN")}`}</strong>
        </p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:selectedMember?"320px 1fr":"1fr",gap:20,alignItems:"start"}}>

        {/* Member list */}
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>
            Members ({memberData.length})
          </div>
          {memberData.length===0?(
            <div style={{padding:"40px 20px",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13}}>No expense data yet</div>
          ):memberData.map(m=>{
            const isSelected = selectedMember===m.name;
            return (
              <div key={m.name} onClick={()=>{setSelectedMember(isSelected?null:m.name);setSelectedIds([]);setPayRef("");setConfirming(false);}}
                style={{padding:"13px 16px",cursor:"pointer",background:isSelected?"rgba(16,185,129,0.08)":"transparent",borderLeft:`3px solid ${isSelected?"#10b981":"transparent"}`,borderBottom:"1px solid rgba(255,255,255,0.04)",transition:"all 0.15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>
                    {m.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:treasurerMembers.includes(m.name)?"#fbbf24":"#fff"}}>{m.name}{treasurerMembers.includes(m.name)&&<span style={{fontSize:9,marginLeft:4,opacity:0.8}}>★ Treasurer</span>}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:1}}>{m.count} entr{m.count===1?"y":"ies"}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    {m.pendingAmt>0&&(
                      <div style={{fontSize:13,fontWeight:800,color:"#f59e0b"}}>{`₹${m.pendingAmt.toLocaleString("en-IN")}`}</div>
                    )}
                    {m.pendingAmt===0&&m.reimAmt>0&&(
                      <div style={{fontSize:11,color:"#10b981",fontWeight:700}}>✓ Clear</div>
                    )}
                    {m.pendingEntries.length>0&&(
                      <div style={{fontSize:10,color:"rgba(239,68,68,0.7)",marginTop:1}}>{m.pendingEntries.length} pending</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {sel&&(
          <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:16,overflow:"hidden"}}>

            {/* Member header */}
            <div style={{padding:"18px 22px",background:"rgba(16,185,129,0.06)",borderBottom:"1px solid rgba(16,185,129,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800}}>
                  {sel.name.split(" ").map(w=>w[0]).slice(0,2).join("")}
                </div>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:treasurerMembers.includes(sel.name)?"#fbbf24":"#fff",fontWeight:700}}>{sel.name}{treasurerMembers.includes(sel.name)&&<span style={{fontSize:12,marginLeft:6,opacity:0.8}}>★ Treasurer</span>}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{sel.count} total entries</div>
                </div>
              </div>
              <div style={{display:"flex",gap:14}}>
                {[
                  {label:"Total Submitted",val:sel.totalAmt,color:"#fbbf24"},
                  {label:"Pending",val:sel.pendingAmt,color:"#f59e0b"},
                  {label:"Reimbursed",val:sel.reimAmt,color:"#10b981"},
                ].map(({label,val,color})=>(
                  <div key={label} style={{textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:800,color}}>{`₹${val.toLocaleString("en-IN")}`}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:1}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending entries */}
            {sel.pendingEntries.length>0&&(
              <div style={{padding:"16px 22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",textTransform:"uppercase",letterSpacing:"0.07em"}}>
                    ⏳ Pending Reimbursement ({sel.pendingEntries.length})
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={selectAll} style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",color:"#f59e0b",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Select All</button>
                    {selectedIds.length>0&&<button onClick={clearSel} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)",borderRadius:7,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Clear</button>}
                  </div>
                </div>

                {sel.pendingEntries.map(e=>(
                  <div key={e.id} onClick={()=>toggleId(e.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,cursor:"pointer",background:selectedIds.includes(e.id)?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${selectedIds.includes(e.id)?"rgba(245,158,11,0.35)":"rgba(255,255,255,0.05)"}`,marginBottom:7,transition:"all 0.15s"}}>
                    <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${selectedIds.includes(e.id)?"#f59e0b":"rgba(255,255,255,0.2)"}`,background:selectedIds.includes(e.id)?"#f59e0b":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {selectedIds.includes(e.id)&&<span style={{fontSize:10,color:"#000",fontWeight:900}}>✓</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                        <div style={{fontFamily:"monospace",fontSize:11,color:"#fbbf24",fontWeight:700}}>{e.txnId}</div>
                        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{`₹${e.amount.toLocaleString("en-IN")}`}</div>
                      </div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.purpose}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1}}>{new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} · {e.upiId}</div>
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                    {(e.receiptUrl||e.receiptDataUrl)&&(
                      <button onClick={ev=>{ev.stopPropagation();onViewReceipt(e);}} title={e.receiptUrl?"View Receipt (Google Drive)":"View Receipt (local)"} style={{background:e.receiptUrl?"rgba(16,185,129,0.12)":"rgba(245,158,11,0.12)",border:`1px solid ${e.receiptUrl?"rgba(16,185,129,0.3)":"rgba(245,158,11,0.3)"}`,color:e.receiptUrl?"#10b981":"#f59e0b",borderRadius:7,padding:"4px 7px",cursor:"pointer",fontSize:13,flexShrink:0,display:"inline-flex",alignItems:"center",gap:3}}>
                        📎<span style={{fontSize:9}}>{e.receiptUrl?"Drive":"local"}</span>
                      </button>
                    )}
                    {(e.invoiceUrl||e.invoiceDataUrl)&&(
                      <button onClick={ev=>{ev.stopPropagation();onViewReceipt({...e,receiptUrl:e.invoiceUrl,receiptDataUrl:e.invoiceDataUrl});}} title={e.invoiceUrl?"View Invoice (Google Drive)":"View Invoice (local)"} style={{background:e.invoiceUrl?"rgba(139,92,246,0.12)":"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.35)",color:"#a78bfa",borderRadius:7,padding:"4px 7px",cursor:"pointer",fontSize:13,flexShrink:0,display:"inline-flex",alignItems:"center",gap:3}}>
                        📄<span style={{fontSize:9}}>{e.invoiceUrl?"Inv":"inv"}</span>
                      </button>
                    )}
                    </div>
                  </div>
                ))}

                {/* Batch reimburse panel */}
                {selectedIds.length>0&&(
                  <div style={{marginTop:14,background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#10b981",marginBottom:10}}>
                      Mark {selectedIds.length} entr{selectedIds.length===1?"y":"ies"} as Reimbursed
                      {" · "}
                      <span style={{color:"#fff"}}>
                        {`₹${sel.pendingEntries.filter(e=>selectedIds.includes(e.id)).reduce((s,e)=>s+e.amount,0).toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    {!confirming?(
                      <button onClick={()=>setConfirming(true)} style={{width:"100%",background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none",borderRadius:10,padding:"10px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                        ✅ Mark as Reimbursed
                      </button>
                    ):(
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <div>
                          <label style={{fontSize:10,fontWeight:700,color:"rgba(16,185,129,0.7)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"}}>Payment Reference (UTR / cheque no. / note)</label>
                          <input value={payRef} onChange={e=>setPayRef(e.target.value)} placeholder="e.g. NEFT UTR 2025090145 or Cash on 07-Mar" style={INP}/>
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:4}}>
                          <button onClick={()=>setConfirming(false)} style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",borderRadius:10,padding:"9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13}}>Cancel</button>
                          <button onClick={async()=>{await onBatchReimburse(selectedIds,payRef);setSelectedIds([]);setPayRef("");setConfirming(false);}} style={{flex:2,background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none",borderRadius:10,padding:"9px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:13}}>
                            Confirm Reimbursement
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {sel.pendingEntries.length===0&&(
              <div style={{padding:"30px 22px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>✅</div>
                <div style={{color:"#10b981",fontWeight:700,fontSize:14}}>All clear — no pending reimbursements</div>
                <div style={{color:"rgba(255,255,255,0.3)",fontSize:12,marginTop:4}}>All {sel.reimEntries.length} reimbursed</div>
              </div>
            )}

            {/* Reimbursed history (collapsed) */}
            {sel.reimEntries.length>0&&(
              <details style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <summary style={{padding:"12px 22px",cursor:"pointer",fontSize:12,fontWeight:700,color:"rgba(16,185,129,0.6)",textTransform:"uppercase",letterSpacing:"0.07em",listStyle:"none",display:"flex",alignItems:"center",gap:6}}>
                  ▸ Reimbursed History ({sel.reimEntries.length} entries · {`₹${sel.reimAmt.toLocaleString("en-IN")}`})
                </summary>
                <div style={{padding:"0 22px 16px"}}>
                  {sel.reimEntries.map(e=>(
                    <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{fontSize:12,color:"rgba(16,185,129,0.7)"}}>✓</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <span style={{fontFamily:"monospace",fontSize:11,color:"rgba(255,255,255,0.4)"}}>{e.txnId}</span>
                          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{`₹${e.amount.toLocaleString("en-IN")}`}</span>
                        </div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:1}}>{e.purpose} · {new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
                        {e.notes&&<div style={{fontSize:10,color:"rgba(16,185,129,0.5)",marginTop:1}}>{e.notes}</div>}
                      </div>
                      {(e.receiptUrl||e.receiptDataUrl)&&(
                        <button onClick={()=>onViewReceipt(e)} title={e.receiptUrl?"View Receipt (Google Drive)":"View Receipt (local)"} style={{background:e.receiptUrl?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${e.receiptUrl?"rgba(16,185,129,0.25)":"rgba(245,158,11,0.25)"}`,color:e.receiptUrl?"#10b981":"#f59e0b",borderRadius:6,padding:"3px 6px",cursor:"pointer",fontSize:12,flexShrink:0,display:"inline-flex",alignItems:"center",gap:2}}>
                          📎<span style={{fontSize:9}}>{e.receiptUrl?"Drive":""}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* No member selected hint */}
        {!selectedMember&&memberData.length>0&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 20px",color:"rgba(255,255,255,0.2)",fontSize:14,flexDirection:"column",gap:8}}>
            <div style={{fontSize:36}}>👈</div>
            <div>Select a member to view their balance and reimburse</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT ENTRY MODAL
═══════════════════════════════════════════════════════════ */
function EditEntryModal({entry,members,events,categories,onSave,onClose}) {
  const [form,setForm] = useState({...entry});
  const INP={width:"100%",padding:"9px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box"};
  const LBL={fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.45)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.06em"};
  const openEvents=events.filter(e=>e.status==="open");
  const handleSave=()=>{
    if(!form.member||!form.amount||!form.purpose){return;}
    const amt=Number(form.amount);
    if(isNaN(amt)||amt<=0)return;
    onSave({...form,amount:amt});
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <div style={{background:"#0a1628",border:"1px solid rgba(251,191,36,0.3)",borderRadius:22,padding:28,width:"100%",maxWidth:540,boxShadow:"0 24px 80px rgba(0,0,0,0.7)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#fbbf24",margin:0}}>✏️ Edit Entry</h3>
            <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:3}}>{entry.txnId}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer"}}><Icon n="x" s={18}/></button>
        </div>
        <div style={{display:"grid",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={LBL}>Paid by Member</label>
              <select value={form.member} onChange={e=>setForm(f=>({...f,member:e.target.value}))} style={INP}>
                {members.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>Date</label>
              <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={LBL}>Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} style={INP}/>
            </div>
            <div>
              <label style={LBL}>Category</label>
              <select value={form.categoryCode} onChange={e=>{const c=categories.find(x=>x.code===e.target.value);setForm(f=>({...f,categoryCode:e.target.value,category:(c&&c.label)||"",eventId:e.target.value==="GNCEV"?f.eventId:"",subCategory:""}));}} style={INP}>
                {categories.map(c=><option key={c.code} value={c.code}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={LBL}>Purpose</label>
            <textarea value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))} rows={2} style={{...INP,resize:"vertical"}}/>
          </div>
          <div>
            <label style={LBL}>Payment Reference / UPI ID</label>
            <input value={form.upiId||""} onChange={e=>setForm(f=>({...f,upiId:e.target.value}))} style={INP}/>
          </div>
          {form.categoryCode==="GNCEV"&&(
            <div>
              <label style={LBL}>Event</label>
              <select value={form.eventId||""} onChange={e=>setForm(f=>({...f,eventId:e.target.value}))} style={INP}>
                <option value="">No event</option>
                {[...openEvents,...events.filter(e=>e.status!=="open")].map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
            </div>
          )}
          {form.categoryCode==="GNREC"&&(
            <div>
              <label style={LBL}>Recurring Sub-Category</label>
              <select value={form.subCategory||""} onChange={e=>setForm(f=>({...f,subCategory:e.target.value}))} style={INP}>
                <option value="">Select recurring sub-category</option>
                {RECURRING_SUBCATS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={LBL}>Notes</label>
            <input value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Optional notes" style={INP}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14}}>Cancel</button>
            <button onClick={handleSave} style={{background:"linear-gradient(135deg,#d97706,#fbbf24)",color:"#1a1a00",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:14}}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const bp = useBP();
  const readStoredAuth = () => {
    try{
      const raw = sessionStorage.getItem("nandanam_auth");
      if(!raw)return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    }catch{
      return null;
    }
  };
  const readSubmitDraft = () => {
    try{
      const raw = localStorage.getItem(SUBMIT_DRAFT_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    }catch{
      return null;
    }
  };
  const initialAuth = readStoredAuth();
  const initialDraft = readSubmitDraft();
  const [view,setView]         = useState("submit");
  const [entries,setEntries]   = useState([]);
  const [events,setEvents]     = useState([]);
  const [counters,setCounters] = useState({});
  const [members,setMembers]   = useState(DEFAULT_MEMBERS);
  const [vendors,setVendors]   = useState(DEFAULT_VENDORS);
  const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzX9p5g7y_tVXHS8vP3Jmnghtwd81-pac2aTIcdU5bv3xndg0kizHVf3W2UWleZlu--4w/exec";
  const [scriptUrl,setScriptUrl] = useState(()=>{try{return localStorage.getItem("nandanam_script_url")||DEFAULT_SCRIPT_URL;}catch{return DEFAULT_SCRIPT_URL;}});
  const [showSheets,setShowSheets]     = useState(false);
  const [showCreateEv,setShowCreateEv] = useState(false);
  const [confirmDeleteEv,setConfirmDeleteEv] = useState(null); // event object to delete
  const [loading,setLoading]   = useState(false);
  const [dbReady,setDbReady]   = useState(false);
  const [syncStatus,setSyncStatus] = useState(null);
  const [installPromptEvent,setInstallPromptEvent] = useState(null);
  const [installMode,setInstallMode] = useState(null);
  const [installBannerHidden,setInstallBannerHidden] = useState(()=>{try{return localStorage.getItem(INSTALL_BANNER_KEY)==="1";}catch{return false;}});

  // PIN + access control
  const [authSession,setAuthSession] = useState(initialAuth);
  const [isTreasurer,setIsTreasurer] = useState(initialAuth?.role==="Treasurer");
  const [showPin,setShowPin]         = useState(false);
  const [pendingView,setPendingView]  = useState(null);
  // Member PIN auth
  const [memberPinStatus,setMemberPinStatus] = useState({}); // {name: true|false}
  const [treasurerMembers,setTreasurerMembers] = useState([]); // names with role=Treasurer in Sheets
  const [verifiedMember,setVerifiedMember] = useState(initialAuth?.member || null);
  const [dupWarning,setDupWarning]         = useState(null);
  const [dupOverride,setDupOverride]       = useState(false);
  const [showMemberPanel,setShowMemberPanel] = useState(false);
  const [showVendorPanel,setShowVendorPanel] = useState(false);
  const [groupedView,setGroupedView] = useState(false);
  const [bankBalances,setBankBalances] = useState({}); // {"2026":{"0":{open:X,close:Y},...}}
  const [bankYear,setBankYear]         = useState(new Date().getFullYear());
  const [bankAccount]                  = useState("Nandanam Welfare Association"); // single account

  // Payment method: "upi" | "cash" | "cheque" | "netbanking"
  const [payType,setPayType] = useState(initialDraft?.payType || "upi");

  const [form,setForm] = useState(()=>{
    const base = {member:"",amount:"",categoryCode:"",purpose:"",date:todayStr(),upiId:"",notes:"",eventId:"",subCategory:"",txnRef:"",chequeNo:"",payeeDetails:""};
    if(!initialDraft?.form) return base;
    return {...base, ...initialDraft.form, date: initialDraft.form.date || todayStr()};
  });
  const [submitting,setSubmitting] = useState(false);
  const [toast,setToast]           = useState(null);

  const [fYear,setFYear]     = useState("all");
  const [fMonth,setFMonth]   = useState("all");
  const [fStatus,setFStatus] = useState("all");
  const [fCat,setFCat]       = useState("all");
  const [fEvent,setFEvent]   = useState("all");
  const [fPayType,setFPayType] = useState("all");
  const [fMember,setFMember] = useState("all");

  const [showBulk,setShowBulk]           = useState(false);
  const [bulkRows,setBulkRows]           = useState([]);
  const [bulkExtracting,setBulkExtracting] = useState(false);
  const [bulkMember,setBulkMember]       = useState("");

  // Search & edit
  const [searchQ,setSearchQ]             = useState("");
  const [editEntry,setEditEntry]         = useState(null);
  const [deleteEntry,setDeleteEntry]     = useState(null);

  // Receipt attachment — key forces input remount on remove so re-selecting works
  const [receiptKey,setReceiptKey] = useState(0);
  const resetReceiptInput = ()=>setReceiptKey(k=>k+1);
  const [receiptDataUrl,setReceiptDataUrl] = useState(null); // staged receipt for current form
  const [viewingReceipt,setViewingReceipt] = useState(null); // full entry object for dual-panel viewer

  // Field-level validation errors
  const [fieldErrors,setFieldErrors] = useState({});
  const clearFieldError=(k)=>setFieldErrors(p=>{const n={...p};delete n[k];return n;});

  const receiptRef = useRef();
  const [invoiceKey,setInvoiceKey]     = useState(0);
  const resetInvoiceInput = ()=>setInvoiceKey(k=>k+1);
  const [invoiceDataUrl,setInvoiceDataUrl] = useState(null);
  const invoiceRef = useRef();

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3800);};

  /* ── Debug Log ── */
  const [debugLog,setDebugLog]   = useState([]);
  const [showDebug,setShowDebug] = useState(false);
  const addLog=(msg,level="info")=>{
    const ts=new Date().toLocaleTimeString("en-IN",{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});
    setDebugLog(p=>[{ts,msg,level,id:Date.now()},...p].slice(0,200));
  };
  const persistAuthSession=(nextSession)=>{
    setAuthSession(nextSession||null);
    setIsTreasurer(nextSession?.role==="Treasurer");
    if(nextSession?.member)setVerifiedMember(nextSession.member);
    try{
      if(nextSession)sessionStorage.setItem("nandanam_auth",JSON.stringify(nextSession));
      else sessionStorage.removeItem("nandanam_auth");
    }catch{}
  };
  const clearAuthSession=()=>{
    setAuthSession(null);
    setIsTreasurer(false);
    try{sessionStorage.removeItem("nandanam_auth");}catch{}
  };
  const callScript=async(action,data={})=>{
    if(!scriptUrl){addLog(`callScript(${action}) — no URL`,"warn");return{success:false,error:"Not configured"};}
    addLog(`→ ${action}...`,"info");
    try{
      const r=await fetch(scriptUrl,{
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify({
          action,
          auth: authSession?.token ? {token:authSession.token,role:authSession.role,member:authSession.member} : null,
          ...data
        }),
        redirect:"follow",
      });
      const json=await r.json();
      if(json.success){addLog(`✓ ${action} OK`,"ok");}
      else{addLog(`✗ ${action}: ${json.error}`,"error");}
      return json;
    }catch(e){addLog(`✗ ${action} network: ${e.message}`,"error");return{success:false,error:e.message};}
  };

  const loadFromSheet=async(url, sessionOverride)=>{
    const u=url||scriptUrl;
    if(!u){addLog("loadFromSheet — no URL","warn");return;}
    const session = sessionOverride===undefined ? authSession : sessionOverride;
    const hasSession = !!session?.token;
    const action = hasSession ? "getData" : "getBootstrap";
    const fetchRemote = async(requestAction, requestSession)=> {
      const r = await fetch(u,{
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body:JSON.stringify({
          action:requestAction,
          auth: requestSession?.token ? {token:requestSession.token,role:requestSession.role,member:requestSession.member} : null
        }),
        redirect:"follow",
      });
      return r.json();
    };
    const fetchLegacyData = async() => {
      const r = await fetch(u,{redirect:"follow"});
      return r.json();
    };
    addLog(`→ loadFromSheet (${action})...`,"info");
    setLoading(true);
    try{
      let d=await fetchRemote(action, session);
      if(!d.success && !hasSession && d.error==="Unknown action: getBootstrap"){
        addLog("Backend does not support getBootstrap — falling back to legacy getData","warn");
        d = await fetchLegacyData();
      }
      if(!d.success && hasSession && /Session expired/i.test(d.error||"")){
        addLog("Session expired during getData — clearing session and retrying bootstrap","warn");
        clearAuthSession();
        setVerifiedMember(null);
        setForm(f=>({...f,member:""}));
        setEntries([]);
        setEvents([]);
        setCounters({});
        setBankBalances({});
        d = await fetchRemote("getBootstrap", null);
        if(!d.success && d.error==="Unknown action: getBootstrap"){
          addLog("Backend still does not support getBootstrap after session reset — falling back to legacy getData","warn");
          d = await fetchLegacyData();
        }
      }
      if(d.success){
        const bootstrapOnly = !Array.isArray(d.entries);
        if(bootstrapOnly){
          setEntries([]);
          setEvents([]);
          setCounters({});
          setBankBalances({});
        }else{
          setEntries((d.entries||[]).map(function(e){
            return {...e, category: e.category || (catByCode(e.categoryCode) && catByCode(e.categoryCode).label) || e.categoryCode || "Unknown"};
          }));
          setEvents(d.events||[]);
          setCounters(d.counters||{});
          setBankBalances(d.bankBalances||{});
        }
        if(d.members&&d.members.length>0)setMembers(d.members);
        if(d.memberPinStatus)setMemberPinStatus(d.memberPinStatus);
        else if(d.memberPins){
          setMemberPinStatus(Object.fromEntries(Object.keys(d.memberPins).map(name=>[name, !!d.memberPins[name]])));
        }
        if(d.treasurerMembers)setTreasurerMembers(d.treasurerMembers);
        setDbReady(true);
        if(bootstrapOnly){
          addLog(`✓ Loaded ${d.members?.length||0} members for sign-in`, "ok");
        }else{
          addLog(`✓ Loaded ${d.entries?.length||0} entries, ${d.events?.length||0} events, ${d.members?.length||0} members`, "ok");
        }
      }else{
        addLog(`✗ loadFromSheet: ${d.error}`,"error");
        showToast("Failed to load data: "+d.error,"error");
      }
    }catch(e){
      addLog(`✗ loadFromSheet network: ${e.message}`,"error");
      showToast("Cannot reach database: "+e.message,"error");
    }
    setLoading(false);
  };

  useEffect(()=>{
    addLog(`App loaded. DB URL: ${scriptUrl?"set":"not set"}`,"info");
    if(scriptUrl)loadFromSheet(scriptUrl);
  },[]);  // eslint-disable-line

  useEffect(()=>{
    const ua = navigator.userAgent || "";
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if(isStandalone){
      setInstallMode(null);
      return;
    }
    if(!window.isSecureContext){
      setInstallMode("secure");
      return;
    }
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if(isIOS && isSafari){
      setInstallMode("ios");
    }else if(isAndroid){
      setInstallMode("menu");
    }
    const onBeforeInstallPrompt = (e)=>{
      e.preventDefault();
      setInstallPromptEvent(e);
      setInstallMode("prompt");
    };
    const onInstalled = ()=>{
      setInstallMode(null);
      setInstallPromptEvent(null);
      try{localStorage.removeItem(INSTALL_BANNER_KEY);}catch{}
      setInstallBannerHidden(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return ()=>{
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  },[]);

  const dismissInstallBanner=()=>{
    setInstallBannerHidden(true);
    try{localStorage.setItem(INSTALL_BANNER_KEY,"1");}catch{}
  };

  const triggerInstallPrompt=async()=>{
    if(!installPromptEvent) return;
    installPromptEvent.prompt();
    try{await installPromptEvent.userChoice;}catch{}
    setInstallPromptEvent(null);
    setInstallMode(null);
    dismissInstallBanner();
  };

  useEffect(()=>{
    try{
      const hasMeaningfulDraft = !!(form.amount || form.categoryCode || form.purpose || form.upiId || form.notes || form.eventId || form.subCategory || form.txnRef || form.chequeNo || form.payeeDetails || receiptDataUrl || invoiceDataUrl);
      if(!hasMeaningfulDraft){
        localStorage.removeItem(SUBMIT_DRAFT_KEY);
        return;
      }
      localStorage.setItem(SUBMIT_DRAFT_KEY, JSON.stringify({
        payType,
        form,
        savedAt: new Date().toISOString(),
        hasReceipt: !!receiptDataUrl,
        hasInvoice: !!invoiceDataUrl
      }));
    }catch{}
  },[form,payType,receiptDataUrl,invoiceDataUrl]);

  const clearSubmitDraft=()=>{
    try{localStorage.removeItem(SUBMIT_DRAFT_KEY);}catch{}
  };

  useEffect(()=>{
  const activeMember = isTreasurer ? form.member : (verifiedMember || form.member);
    const parsedAmt = Number(form.amount);
    if(!activeMember || !form.categoryCode || !form.date || !form.amount || isNaN(parsedAmt) || parsedAmt<=0){
      setDupWarning(null);
      setDupOverride(false);
      return;
    }
    const normalizedPurpose = String(form.purpose||"").trim().toLowerCase();
    const match = entries.find(e=>{
      const sameMember = String(e.member||"").trim() === String(activeMember).trim();
      const sameCategory = String(e.categoryCode||"") === String(form.categoryCode||"");
      const sameDate = String(e.date||"").slice(0,10) === String(form.date||"").slice(0,10);
      const sameAmount = Number(e.amount||0) === parsedAmt;
      return sameMember && sameCategory && sameDate && sameAmount;
    });
    if(!match){
      setDupWarning(null);
      setDupOverride(false);
      return;
    }
    const purposeMatch = normalizedPurpose && String(match.purpose||"").trim().toLowerCase() === normalizedPurpose;
    setDupWarning({
      level: purposeMatch ? "hard" : "soft",
      entry: match,
      message: purposeMatch
        ? `Exact-looking duplicate of ${match.txnId} for ${fmt(match.amount)} on ${String(match.date||"").slice(0,10)}.`
        : `Possible duplicate of ${match.txnId}: same member, date, category and amount.`
    });
  },[entries,form.member,verifiedMember,form.categoryCode,form.date,form.amount,form.purpose]);

  const verifyMemberPinWithServer = async(name, pin) => {
    const result = await callScript("verifyMemberPin",{name,pin});
    if(result.success){
      const nextSession = {
        token: result.token || null,
        role: result.role || "Member",
        member: result.member || name,
      };
      persistAuthSession(nextSession);
      if(scriptUrl) await loadFromSheet(scriptUrl, nextSession);
      return result;
    }
    if(result.error==="Unknown action: verifyMemberPin"){
      return {success:false,error:"Backend update needed: add verifyMemberPin to Apps Script."};
    }
    return result;
  };

  const verifyTreasurerPinWithServer = async(pin) => {
    const result = await callScript("verifyTreasurerPin",{pin});
    if(result.success){
      const nextSession = {
        token: result.token || null,
        role: result.role || "Treasurer",
        member: result.member || verifiedMember || null,
      };
      persistAuthSession(nextSession);
      if(scriptUrl) await loadFromSheet(scriptUrl, nextSession);
      setView(pendingView||"dashboard");
      setShowPin(false);
      showToast("🔓 Treasurer view unlocked","success");
      addLog("PIN auth success — treasurer unlocked","ok");
      return result;
    }
    if(result.error==="Unknown action: verifyTreasurerPin"){
      return {success:false,error:"Backend update needed: add verifyTreasurerPin to Apps Script."};
    }
    addLog(`PIN auth failed — ${result.error||"wrong PIN"}`,"warn");
    return result;
  };

  const isEventCat = form.categoryCode === "GNCEV";
  const isRecurringCat = form.categoryCode === "GNREC";
  const openEvents = events.filter(e=>e.status==="open");
  const selCat     = catByCode(form.categoryCode);

  const handleSubmit=async()=>{
    // Per-field validation
    const errs={};
    if(!form.member)    errs.member="Select a member";
    if(!form.amount)    errs.amount="Enter amount";
    if(!form.categoryCode) errs.categoryCode="Select a category";
    if(!form.purpose)   errs.purpose="Enter purpose / description";
    if(isEventCat&&!form.eventId) errs.eventId="Select an event";
    if(payType==="cheque"&&!form.chequeNo.trim())     errs.chequeNo="Enter Cheque Number";
    if(payType==="cheque"&&!form.payeeDetails.trim()) errs.payeeDetails="Enter Payee Details";
    if(payType==="netbanking"&&!form.txnRef.trim())   errs.txnRef="Enter NEFT / RTGS / IMPS reference";
    if(Object.keys(errs).length>0){
      setFieldErrors(errs);
      const missing=Object.values(errs).join(" · ");
      showToast(`Missing: ${missing}`,"error");
      addLog(`Submit blocked — missing: ${Object.keys(errs).join(", ")}`,"warn");
      return;
    }
    setFieldErrors({});
    const parsedAmt = Number(form.amount);
    if(isNaN(parsedAmt)||parsedAmt<=0){
      setFieldErrors({amount:"Must be a positive number"});
      showToast("Amount must be a positive number","error");
      addLog("Submit blocked — invalid amount: "+form.amount,"warn");
      return;
    }
    if(dupWarning && !dupOverride){
      showToast(dupWarning.level==="hard"?"Possible duplicate blocked — tick override to continue.":"Possible duplicate found — review and tick override if this is intentional.","warning");
      addLog(`Submit paused — duplicate warning for ${dupWarning.entry?.txnId||"existing entry"}`,"warn");
      return;
    }
    if(form.date>todayStr()){showToast("⚠ Date is in the future — please check","warning");addLog("Warning: future date "+form.date,"warn");}
    // 30-day backdating restriction
    const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
    if(new Date(form.date)<cutoff){showToast("❌ Date is more than 30 days in the past. Contact the Treasurer for older entries.","error");addLog("Submit blocked — date too old: "+form.date,"warn");return;}
    setSubmitting(true);
    try {
    addLog(`→ Submitting expense: ${form.categoryCode} ₹${parsedAmt} by ${form.member}`,"info");
    const evObj=events.find(e=>e.id===form.eventId);
    const cKey=isEventCat&&evObj?`GNCEV-${evObj.tag}`:form.categoryCode;
    const n=(counters[cKey]||0)+1;
    const payTag = payType==="cash"?"CASH":payType==="cheque"?"CHQ":payType==="netbanking"?"NB":"";
    const txnId = payTag
      ?(isEventCat&&evObj?`GNCEV-${evObj.tag}-${payTag}-${pad5(n)}`:`${form.categoryCode}-${payTag}-${pad5(n)}`)
      :(isEventCat&&evObj?`GNCEV-${evObj.tag}-${pad5(n)}`:`${form.categoryCode}${pad5(n)}`);
    const payLabel = payType==="cash"
      ? `Cash – ${form.upiId||"direct payment"}`
      : payType==="cheque"
        ? `Cheque #${form.chequeNo||"—"} | ${form.payeeDetails||"—"}`
        : payType==="netbanking"
          ? `Net Banking – ${form.txnRef||""}`
          : form.upiId;
    const entry={
      id:genId(),txnId,date:form.date,member:form.member,
      categoryCode:form.categoryCode,category:selCat.label,
      amount:parsedAmt,purpose:form.purpose,
      upiId:payLabel,
      status:"Pending",notes:form.notes,
      eventId:form.eventId||null,subCategory:form.subCategory||null,
      payType,txnRef:form.txnRef||null,
      receiptDataUrl: receiptDataUrl||null, // local preview until Drive upload completes
      receiptUrl: null, // will be set after Drive upload
      invoiceDataUrl: invoiceDataUrl||null, // local preview until Drive upload completes
      invoiceUrl: null, // will be set after Drive upload
    };
    setEntries(p=>[entry,...p]);
    setCounters(p=>({...p,[cKey]:n}));
    const savedReceipt = receiptDataUrl; // capture before clearing
    const savedReceiptMime = receiptDataUrl ? receiptDataUrl.split(";")[0].replace("data:","") : null;
    const savedInvoice = invoiceDataUrl; // capture before clearing
    const savedInvoiceMime = invoiceDataUrl ? invoiceDataUrl.split(";")[0].replace("data:","") : null;
    setForm(f=>({member:isTreasurer?f.member:(verifiedMember||f.member),amount:"",categoryCode:"",purpose:"",date:todayStr(),upiId:"",notes:"",eventId:"",subCategory:"",txnRef:"",chequeNo:"",payeeDetails:""}));
    setFieldErrors({});
    setDupWarning(null);setDupOverride(false);
    setReceiptDataUrl(null);resetReceiptInput();setInvoiceDataUrl(null);resetInvoiceInput();
    clearSubmitDraft();
    setSubmitting(false);
    showToast(`✅ Expense submitted! ID: ${txnId}`);
    addLog(`✓ Entry created: ${txnId} ₹${parsedAmt}`,"ok");
    if(scriptUrl){
      setSyncStatus("syncing");
      const r=await callScript("addEntry",{entry});
      setSyncStatus(r.success?"ok":"fail");
      if(!r.success)showToast(`Sheet sync failed: ${r.error}`,"warning");
      await callScript("updateCounter",{key:cKey,value:n});
      // Upload receipt to Google Drive if one was attached
      if(savedReceipt && r.success){
        addLog(`→ Uploading receipt to Google Drive...`,"info");
        const base64 = savedReceipt.split(",")[1];
        const dr = await callScript("saveReceipt",{
          txnId,
          base64,
          mimeType: savedReceiptMime||"image/jpeg",
          date: entry.date,
          member: entry.member,
          fileType: "receipt"
        });
        if(dr.success){
          addLog(`✓ Receipt saved to Drive: ${dr.folder}/${dr.fileName}`,"ok");
          setEntries(p=>p.map(e=>e.id===entry.id?{...e,receiptUrl:dr.viewUrl,receiptFileId:dr.fileId}:e));
          showToast(`📎 Receipt saved to Drive — ${dr.folder}`,"success");
        }else{
          addLog(`⚠ Receipt Drive upload failed: ${dr.error} — kept locally`,"warn");
          showToast(`Receipt kept locally (Drive upload failed: ${dr.error})`,"warning");
        }
      }
      // Upload invoice to Google Drive if one was attached
      if(savedInvoice && r.success){
        addLog(`→ Uploading invoice to Google Drive...`,"info");
        const base64inv = savedInvoice.split(",")[1];
        const dinv = await callScript("saveReceipt",{
          txnId,
          base64: base64inv,
          mimeType: savedInvoiceMime||"image/jpeg",
          date: entry.date,
          member: entry.member,
          fileType: "invoice"
        });
        if(dinv.success){
          addLog(`✓ Invoice saved to Drive: ${dinv.folder}/${dinv.fileName}`,"ok");
          setEntries(p=>p.map(e=>e.id===entry.id?{...e,invoiceUrl:dinv.viewUrl,invoiceFileId:dinv.fileId}:e));
          showToast(`📄 Invoice saved to Drive — ${dinv.folder}`,"success");
        }else{
          addLog(`⚠ Invoice Drive upload failed: ${dinv.error} — kept locally`,"warn");
          showToast(`Invoice kept locally (Drive upload failed: ${dinv.error})`,"warning");
        }
      }
      setTimeout(()=>setSyncStatus(null),3000);
    }else{addLog("No DB connected — entry saved locally only","warn");}
    } catch(err) {
      addLog("Submit error: "+err.message,"error");
      showToast("Error: "+err.message,"error");
    } finally {
      setSubmitting(false);
    }
  };

  // Gold highlight for treasurer member names
  const isTreasurerMember=(name)=>treasurerMembers.includes(name);
  const MemberName=({name,style={}})=>isTreasurerMember(name)
    ?<span style={{color:"#fbbf24",fontWeight:700,...style}}>{name} <span style={{fontSize:"0.75em",opacity:0.8}}>★</span></span>
    :<span style={style}>{name}</span>;

  const allYears=[...new Set(entries.map(e=>new Date(e.date).getFullYear()))].sort((a,b)=>b-a);
  const filtered=entries.filter(e=>{
    const dt=new Date(e.date);
    if(fYear!=="all"&&dt.getFullYear()!==Number(fYear))return false;
    if(fMonth!=="all"&&dt.getMonth()!==Number(fMonth))return false;
    if(fStatus!=="all"&&e.status!==fStatus)return false;
    if(fCat!=="all"&&e.categoryCode!==fCat)return false;
    if(fEvent!=="all"&&e.eventId!==fEvent)return false;
    if(fPayType!=="all"&&(e.payType||"upi")!==fPayType)return false;
    if(fMember!=="all"&&e.member!==fMember)return false;
    if(searchQ.trim()){
      const q=searchQ.trim().toLowerCase();
      const haystack=`${e.txnId} ${e.purpose} ${e.member} ${e.amount} ${e.upiId||""} ${e.notes||""} ${e.category}`.toLowerCase();
      if(!haystack.includes(q))return false;
    }
    return true;
  });
  const totalAmt   = filtered.reduce((s,e)=>s+e.amount,0);
  const pendingAmt = filtered.filter(e=>e.status==="Pending").reduce((s,e)=>s+e.amount,0);
  const reimAmt    = filtered.filter(e=>e.status==="Reimbursed").reduce((s,e)=>s+e.amount,0);
  const catBreakdownItems = Object.entries(
    filtered.reduce(function(a,e){
      var cl = e.category || (catByCode(e.categoryCode) && catByCode(e.categoryCode).label) || e.categoryCode || "Unknown";
      a[cl] = (a[cl]||0) + e.amount; return a;
    }, {})
  ).sort(function(a,b){return b[1]-a[1];});
  const memberBreakdownItems = Object.entries(
    filtered.reduce(function(a,e){a[e.member]=(a[e.member]||0)+e.amount;return a;},{})
  ).sort(function(a,b){return b[1]-a[1];}).slice(0,7);
  // When a member filter is active, show their pending total prominently
  const memberFilterActive = fMember!=="all";
  const memberPendingAmt   = memberFilterActive ? pendingAmt : null;

  // Month-over-month variance: compare current month vs previous month
  const now = new Date();
  const curMonth = now.getMonth(); const curYear = now.getFullYear();
  const prevDate = new Date(curYear, curMonth - 1, 1);
  const prevMonth = prevDate.getMonth(); const prevYear = prevDate.getFullYear();
  const curMonthEntries  = entries.filter(e=>{ const d=new Date(e.date); return d.getMonth()===curMonth&&d.getFullYear()===curYear; });
  const prevMonthEntries = entries.filter(e=>{ const d=new Date(e.date); return d.getMonth()===prevMonth&&d.getFullYear()===prevYear; });
  const curMonthTotal  = curMonthEntries.reduce((s,e)=>s+e.amount,0);
  const prevMonthTotal = prevMonthEntries.reduce((s,e)=>s+e.amount,0);
  const momDiff = curMonthTotal - prevMonthTotal;
  const momPct  = prevMonthTotal>0 ? Math.round((momDiff/prevMonthTotal)*100) : null;

  // Recurring vs one-time split from filtered
  // An entry is recurring if it's in GNREC category OR matches keyword detection
  const isRecurringEntry = (e) => e.categoryCode==="GNREC" || !!detectRecurring(e.purpose,e.notes||"",e.subCategory||"");
  const filteredRecurring  = filtered.filter(e=>isRecurringEntry(e));
  const filteredOneTime    = filtered.filter(e=>!isRecurringEntry(e));
  const recurringTotal     = filteredRecurring.reduce((s,e)=>s+e.amount,0);
  const oneTimeTotal       = filteredOneTime.reduce((s,e)=>s+e.amount,0);

  // Per-recurring-type MoM comparison (uses all entries, not just filtered, for accurate prev/cur month)
  const recurringMoM = RECURRING_TYPES.map(rt => {
    const matchFn = e => rt.keywords.some(k=>recurringMatchText(e.purpose,e.notes||"",e.subCategory||"").includes(k));
    const curAmt  = entries.filter(e=>{ const d=new Date(e.date); return d.getMonth()===curMonth&&d.getFullYear()===curYear&&matchFn(e); }).reduce((s,e)=>s+e.amount,0);
    const prevAmt = entries.filter(e=>{ const d=new Date(e.date); return d.getMonth()===prevMonth&&d.getFullYear()===prevYear&&matchFn(e); }).reduce((s,e)=>s+e.amount,0);
    const diff = curAmt - prevAmt;
    const pct  = prevAmt>0 ? Math.round((diff/prevAmt)*100) : null;
    return { ...rt, curAmt, prevAmt, diff, pct, hasData: curAmt>0||prevAmt>0 };
  });

  // Group filteredRecurring by recurring type for grouped view
  const recurringByType = RECURRING_TYPES.map(rt => {
    const matchFn = e => rt.keywords.some(k=>recurringMatchText(e.purpose,e.notes||"",e.subCategory||"").includes(k));
    const items = filteredRecurring.filter(e=>matchFn(e));
    const total = items.reduce((s,e)=>s+e.amount,0);
    const mom   = recurringMoM.find(r=>r.id===rt.id);
    return { ...rt, items, total, mom };
  }).filter(g=>g.items.length>0);
  // Entries in GNREC that didn't match any type keyword
  const recurringUncategorized = filteredRecurring.filter(e=>!detectRecurring(e.purpose,e.notes||"",e.subCategory||""));

  const toggleStatus=async(id)=>{
    const entry=entries.find(e=>e.id===id);
    if(!entry)return;
    const newStatus=entry.status==="Pending"?"Reimbursed":"Pending";
    setEntries(p=>p.map(e=>e.id===id?{...e,status:newStatus}:e));
    if(scriptUrl){
      setSyncStatus("syncing");
      const r=await callScript("updateStatus",{id,status:newStatus});
      setSyncStatus(r.success?"ok":"fail");
      setTimeout(()=>setSyncStatus(null),2500);
    }
  };
  const toggleEvent=async(id)=>{
    const ev=events.find(e=>e.id===id);
    if(!ev)return;
    const newStatus=ev.status==="open"?"closed":"open";
    setEvents(p=>p.map(e=>e.id===id?{...e,status:newStatus}:e));
    if(scriptUrl)await callScript("toggleEvent",{id,status:newStatus});
  };
  const deleteEvent=async(ev)=>{
    setEvents(p=>p.filter(e=>e.id!==ev.id));
    setConfirmDeleteEv(null);
    showToast(`🗑 "${ev.name}" removed`,"info");
    if(scriptUrl)await callScript("deleteEvent",{id:ev.id});
  };
  const evSpend=(id)=>entries.filter(e=>e.eventId===id).reduce((s,e)=>s+e.amount,0);

  const handleAddMember=async(name)=>{
    if(members.includes(name)){showToast("Member already exists","warning");return;}
    const updated=[...members,name].sort();
    setMembers(updated);
    showToast(`✅ ${name} added!`);
    if(scriptUrl)await callScript("addMember",{name,addedAt:todayStr()});
  };
  const handleRemoveMember=async(name)=>{
    setMembers(p=>p.filter(m=>m!==name));
    showToast(`Removed ${name}`,"info");
    if(scriptUrl)await callScript("removeMember",{name});
  };

  const saveBankBalance=async(year, monthIdx, field, value)=>{
    const y = String(year);
    const m = String(monthIdx);
    const num = parseFloat(value.replace(/,/g,""))||0;
    setBankBalances(prev=>{
      const next = {...prev, [y]:{...prev[y], [m]:{...(prev[y]&&prev[y][m])||{}, [field]:num}}};
      // Save to Sheets via callScript if connected
      if(scriptUrl) callScript("setBankBalance",{year:y,month:m,field,value:num}).catch(()=>{});
      return next;
    });
  };
  const handleSaveMemberPin=async(name, pin)=>{
    if(!scriptUrl)return{success:false,error:"Connect the database before setting a PIN."};
    const r=await callScript("setMemberPin",{name,pin:String(pin)});
    if(r.success){
      setMemberPinStatus(p=>({...p,[name]:true}));
      persistAuthSession({
        token: r.token || authSession?.token || null,
        role: r.role || "Member",
        member: r.member || name,
      });
      return r;
    }
    if(r.error==="Unknown action: setMemberPin"){
      return {success:false,error:"Backend update needed: add setMemberPin support for secure PIN setup."};
    }
    addLog("PIN save failed: "+r.error,"warn");
    return r;
  };
  const handleResetMemberPin=async(name)=>{
    setMemberPinStatus(p=>({...p,[name]:false}));
    showToast("PIN cleared for "+name+" — they will set a new one on next login","info");
    if(scriptUrl)await callScript("setMemberPin",{name,pin:""});
  };
  const handleAddVendor=(name)=>{
    if(vendors.includes(name)){showToast("Vendor already exists","warning");return;}
    setVendors(p=>[...p,name].sort());
    showToast(`✅ ${name} added!`);
  };
  const handleRemoveVendor=(name)=>{
    setVendors(p=>p.filter(v=>v!==name));
    showToast(`Removed ${name}`,"info");
  };

  const txnPreview=()=>{
    if(!form.categoryCode)return null;
    const evObj=events.find(e=>e.id===form.eventId);
    const cKey=isEventCat&&evObj?`GNCEV-${evObj.tag}`:form.categoryCode;
    const n=(counters[cKey]||0)+1;
    return isEventCat&&evObj?`GNCEV-${evObj.tag}-${pad5(n)}`:`${form.categoryCode}${pad5(n)}`;
  };

  const INP={width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"};
  const LBL={fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.06em"};
  // Error-highlighted input style
  const inpStyle=(key)=>({...INP,border:`1.5px solid ${fieldErrors[key]?"#ef4444":"rgba(255,255,255,0.12)"}`});
  const FieldErr=({k})=>fieldErrors[k]?<div style={{color:"#ef4444",fontSize:11,marginTop:3,fontWeight:600}}>⚠ {fieldErrors[k]}</div>:null;
  const BLUE_BTN={background:"linear-gradient(135deg,#1d4ed8,#2563eb)",color:"#fff",border:"none",borderRadius:12,padding:"11px 22px",fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 18px rgba(37,99,235,0.35)",transition:"all 0.2s"};

  const exportCSV=()=>{
    const H=["Txn ID","Date","Member","Category","Amount","Purpose","UPI ID","Status","Notes","Event","Sub-Category"];
    const R=filtered.map(e=>[e.txnId,e.date,e.member,e.category,e.amount,`"${e.purpose}"`,e.upiId,e.status,`"${e.notes||""}"`,events.find(ev=>ev.id===e.eventId)?.name||"",e.subCategory||""]);
    const csv=[H,...R].map(r=>r.join(",")).join("\n");
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:`nandanam-${todayStr()}.csv`});
    a.click();
  };

  const generatePDF=()=>{
    const esc=(value)=>String(value ?? "").replace(/[&<>"']/g,(char)=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;",
    }[char]));
    const money=(value)=>fmt(Number(value)||0);
    const formatDate=(value)=>{
      const d=new Date(value);
      return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
    };
    const generatedAt=new Date();
    const generatedAtLabel=generatedAt.toLocaleString("en-IN",{dateStyle:"long",timeStyle:"short"});
    const reportId=`GKN-${generatedAt.toISOString().slice(0,10).replace(/-/g,"")}-${String(filtered.length).padStart(3,"0")}`;
    const generatedBy=authSession?.member || verifiedMember || (isTreasurer ? "Treasurer" : "System");
    const reportLogoUrl=new URL(LOGO_SRC, window.location.origin).href;
    const sortedDates=filtered.map(e=>new Date(e.date)).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>a-b);
    const dateRangeLabel=sortedDates.length
      ? `${sortedDates[0].toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} - ${sortedDates[sortedDates.length-1].toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}`
      : "No dated records";
    const pendingCount=filtered.filter(e=>e.status==="Pending").length;
    const reimbursedCount=filtered.filter(e=>e.status==="Reimbursed").length;
    const attachmentCount=filtered.filter(e=>e.receiptUrl || e.receiptDataUrl || e.invoiceUrl || e.invoiceDataUrl).length;
    const attachmentPct=filtered.length ? Math.round((attachmentCount/filtered.length)*100) : 0;
    const avgAmount=filtered.length ? totalAmt/filtered.length : 0;
    const largestExpense=filtered.reduce((max,e)=>!max || Number(e.amount)>Number(max.amount) ? e : max, null);
    const topExpenses=[...filtered].sort((a,b)=>(Number(b.amount)||0)-(Number(a.amount)||0)).slice(0,5);
    const catBreakdown=Object.entries(filtered.reduce((acc,entry)=>{
      acc[entry.category]=(acc[entry.category]||0)+Number(entry.amount||0);
      return acc;
    },{})).sort((a,b)=>b[1]-a[1]);
    const memberBreakdown=Object.entries(filtered.reduce((acc,entry)=>{
      acc[entry.member]=(acc[entry.member]||0)+Number(entry.amount||0);
      return acc;
    },{})).sort((a,b)=>b[1]-a[1]);
    const filterDesc=[
      fYear!=="all"?`Year: ${fYear}`:"",
      fMonth!=="all"?`Month: ${MONTHS[Number(fMonth)]}`:"",
      fStatus!=="all"?`Status: ${fStatus}`:"",
      fCat!=="all"?`Category: ${fCat}`:"",
      fEvent!=="all"?`Event: ${events.find(e=>e.id===fEvent)?.name||fEvent}`:"",
      fPayType!=="all"?`Pay type: ${String(fPayType).toUpperCase()}`:"",
      fMember!=="all"?`Member: ${fMember}`:"",
    ].filter(Boolean).join(" · ")||"All Records";

    const rows=filtered.map(e=>{
      const ev=events.find(event=>event.id===e.eventId);
      const txnRef=esc(e.txnRef || e.upiId || e.chequeNo || "Not captured");
      const proofText=[
        (e.receiptUrl || e.receiptDataUrl) ? "Payment proof" : "",
        (e.invoiceUrl || e.invoiceDataUrl) ? "Invoice" : "",
      ].filter(Boolean).join(" + ") || "Missing";
      const statusClass=e.status==="Reimbursed"?"reimbursed":"pending";
      return `<tr>
        <td>
          <div class="txn-id">${esc(e.txnId || "—")}</div>
          <div class="txn-ref">${txnRef}</div>
        </td>
        <td class="date-cell">${formatDate(e.date)}</td>
        <td>
          <div class="main-text">${esc(e.member || "—")}</div>
          ${ev ? `<div class="sub-text">${esc(ev.name)}</div>` : ""}
        </td>
        <td>${esc(e.category || "Uncategorised")}</td>
        <td>
          <div class="main-text">${esc(e.purpose || "—")}</div>
          ${e.notes ? `<div class="sub-text">${esc(e.notes)}</div>` : ""}
        </td>
        <td class="amount-cell">${money(e.amount)}</td>
        <td><span class="status-pill ${statusClass}">${esc(e.status || "Pending")}</span></td>
        <td>${esc(proofText)}</td>
      </tr>`;
    }).join("");

    const catRows=catBreakdown.map(([name,amt])=>{
      const pct=totalAmt?((amt/totalAmt)*100).toFixed(1):0;
      return `<tr>
        <td>${esc(name)}</td>
        <td class="amount-cell">${money(amt)}</td>
        <td class="right">${pct}%</td>
      </tr>`;
    }).join("");

    const memberRows=memberBreakdown.map(([name,amt])=>{
      const pct=totalAmt?((amt/totalAmt)*100).toFixed(1):0;
      return `<tr>
        <td>${esc(name)}</td>
        <td class="amount-cell">${money(amt)}</td>
        <td class="right">${pct}%</td>
      </tr>`;
    }).join("");

    const topExpenseRows=topExpenses.map((entry,idx)=>`<tr>
      <td class="right">#${idx+1}</td>
      <td>
        <div class="main-text">${esc(entry.purpose || "Untitled expense")}</div>
        <div class="sub-text">${esc(entry.member || "Unknown")} · ${formatDate(entry.date)}</div>
      </td>
      <td class="amount-cell">${money(entry.amount)}</td>
    </tr>`).join("");
    const executiveSummary=`Period: ${dateRangeLabel} · Entries: ${filtered.length} · Total: ${money(totalAmt)} · Pending: ${money(pendingAmt)}`;

    const html=`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Expense Report – ${esc(COMMUNITY.name)}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    body{font-family:Arial,'Segoe UI',Helvetica,sans-serif;background:#ffffff;color:#111827;font-size:13.5px;line-height:1.55;padding:14px;max-width:860px;margin:0 auto;}
    .sheet{display:flex;flex-direction:column;gap:14px;}
    .block{background:#fff;border:1px solid #d7dee8;border-radius:10px;padding:16px 18px;}
    .header{border-top:4px solid #0f2b52;padding-top:14px;}
    .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
    .brand{display:flex;align-items:flex-start;gap:14px;}
    .logo{width:54px;height:54px;object-fit:contain;border-radius:10px;border:1px solid #d7dee8;background:#fff;}
    .title{font-size:23px;font-weight:800;line-height:1.1;color:#0f172a;}
    .subtitle{font-size:13px;color:#4b5563;margin-top:4px;}
    .report-tag{font-size:12px;font-weight:700;color:#0f2b52;border:1px solid #bfd0e3;background:#f7fafc;padding:7px 10px;border-radius:999px;white-space:nowrap;}
    .summary-line{margin-top:12px;padding:10px 12px;border:1px solid #dbe3ec;border-radius:8px;background:#f8fafc;font-size:13px;font-weight:600;color:#334155;line-height:1.5;}
    .meta-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px;}
    .meta-item{padding:10px 12px;border:1px solid #e3e8ef;border-radius:8px;background:#fafbfd;}
    .label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:4px;}
    .value{font-size:16px;font-weight:700;color:#0f172a;line-height:1.35;}
    .small{font-size:12px;color:#4b5563;line-height:1.45;}
    .section-title{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:12px;}
    .grid-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
    .grid-3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
    .stat{border:1px solid #dde5ee;border-radius:10px;padding:14px;background:#fff;}
    .stat .value{font-size:18px;}
    table{width:100%;border-collapse:collapse;}
    th{padding:10px 9px;border-bottom:1px solid #dbe3ec;background:#f8fafc;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.03em;text-align:left;}
    td{padding:11px 9px;border-bottom:1px solid #e8edf3;font-size:13px;color:#111827;vertical-align:top;}
    tr:last-child td{border-bottom:none;}
    .txn-id{font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:#1d4ed8;}
    .txn-ref,.sub-text{font-size:12px;color:#4b5563;line-height:1.45;margin-top:3px;}
    .main-text{font-size:13px;font-weight:700;color:#111827;line-height:1.45;}
    .date-cell{white-space:nowrap;}
    .amount-cell{white-space:nowrap;text-align:right;font-weight:800;}
    .right{text-align:right;}
    .status-pill{display:inline-block;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid transparent;}
    .status-pill.pending{background:#fef2f2;border-color:#fecaca;color:#b91c1c;}
    .status-pill.reimbursed{background:#ecfdf5;border-color:#a7f3d0;color:#047857;}
    .footer{display:flex;justify-content:space-between;gap:14px;font-size:12px;color:#4b5563;}
    .signoff-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
    .signoff-box{padding-top:18px;min-height:76px;display:flex;flex-direction:column;justify-content:flex-end;}
    .sign-line{border-top:1px solid #94a3b8;margin-bottom:8px;}
    .sign-name{font-size:13px;font-weight:700;color:#111827;}
    .sign-role{font-size:12px;color:#4b5563;line-height:1.45;}
    @media print{
      html,body,*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      body{padding:8px;max-width:none;}
      .sheet{gap:12px;}
      .block{break-inside:avoid;page-break-inside:avoid;}
      @page{margin:8mm;size:A4;}
    }
  </style>
</head>
<body>
  <div class="sheet">
    <section class="block header">
      <div class="header-top">
        <div class="brand">
          <img class="logo" src="${reportLogoUrl}" alt="${esc(COMMUNITY.name)} logo"/>
          <div>
            <div class="title">${esc(COMMUNITY.name)}</div>
            <div class="subtitle">${esc(COMMUNITY.tagline)}</div>
          </div>
        </div>
        <div class="report-tag">Expense Report</div>
      </div>
      <div class="summary-line">${esc(executiveSummary)}</div>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="label">Report ID</div>
          <div class="small">${esc(reportId)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Generated</div>
          <div class="small">${esc(generatedAtLabel)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Generated By</div>
          <div class="small">${esc(generatedBy)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Coverage Window</div>
          <div class="small">${esc(dateRangeLabel)}</div>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="section-title">Report Snapshot</div>
      <div class="grid-2">
        <div class="meta-item">
          <div class="label">Filters Applied</div>
          <div class="small">${esc(filterDesc)}</div>
        </div>
        <div class="meta-item">
          <div class="label">Attachment Coverage</div>
          <div class="small">${attachmentCount} of ${filtered.length} entries have payment proof or invoice (${attachmentPct}%).</div>
        </div>
      </div>
    </section>

    <section class="grid-3">
      <div class="stat">
        <div class="label">Total Expenses</div>
        <div class="value">${money(totalAmt)}</div>
        <div class="small">${filtered.length} transaction${filtered.length!==1?"s":""}</div>
      </div>
      <div class="stat">
        <div class="label">Pending Reimbursement</div>
        <div class="value">${money(pendingAmt)}</div>
        <div class="small">${pendingCount} pending entry${pendingCount!==1?"ies":"y"}</div>
      </div>
      <div class="stat">
        <div class="label">Reimbursed</div>
        <div class="value">${money(reimAmt)}</div>
        <div class="small">${reimbursedCount} reimbursed entry${reimbursedCount!==1?"ies":"y"}</div>
      </div>
    </section>

    <section class="grid-2">
      <div class="block">
        <div class="section-title">Key Signals</div>
        <div class="grid-2">
          <div class="meta-item">
            <div class="label">Average Ticket</div>
            <div class="value">${money(avgAmount)}</div>
          </div>
          <div class="meta-item">
            <div class="label">Largest Expense</div>
            <div class="value">${largestExpense ? money(largestExpense.amount) : "—"}</div>
            <div class="small">${largestExpense ? `${esc(largestExpense.member)} · ${esc(largestExpense.purpose || "Untitled expense")}` : "No entries in scope."}</div>
          </div>
        </div>
      </div>
      <div class="block">
        <div class="section-title">Top Expenses</div>
        <table>
          <thead>
            <tr>
              <th class="right" style="width:44px">Rank</th>
              <th>Expense</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>${topExpenseRows || '<tr><td colspan="3" class="small">No expenses available</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <section class="block">
      <div class="section-title">Transaction Register</div>
      <table>
        <thead>
          <tr>
            <th>Txn ID / Ref</th>
            <th>Date</th>
            <th>Member</th>
            <th>Category</th>
            <th>Purpose / Notes</th>
            <th class="right">Amount</th>
            <th>Status</th>
            <th>Proof</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="8" class="small">No records match the selected filters</td></tr>'}</tbody>
      </table>
    </section>

    <section class="grid-2">
      <div class="block">
        <div class="section-title">Breakdown by Category</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th class="right">Amount</th>
              <th class="right">Share</th>
            </tr>
          </thead>
          <tbody>${catRows || '<tr><td colspan="3" class="small">No category data available</td></tr>'}</tbody>
        </table>
      </div>
      <div class="block">
        <div class="section-title">Breakdown by Member</div>
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th class="right">Amount</th>
              <th class="right">Share</th>
            </tr>
          </thead>
          <tbody>${memberRows || '<tr><td colspan="3" class="small">No member data available</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <section class="block">
      <div class="section-title">Approval</div>
      <div class="signoff-grid">
        <div class="signoff-box">
          <div class="sign-line"></div>
          <div class="sign-name">${esc(generatedBy)}</div>
          <div class="sign-role">Prepared by · ${esc(generatedAtLabel)}</div>
        </div>
        <div class="signoff-box">
          <div class="sign-line"></div>
          <div class="sign-name">Treasurer / Reviewer</div>
          <div class="sign-role">Verified and approved</div>
        </div>
      </div>
    </section>

    <footer class="block footer">
      <div><strong>${esc(COMMUNITY.name)}</strong> · Welfare &amp; Expense Management System</div>
      <div>Report Ref: <strong>${esc(reportId)}</strong> · Generated ${esc(generatedAtLabel)}</div>
      <div>${esc(COMMUNITY.email)}</div>
    </footer>
  </div>
  <script>window.onload=()=>{window.print();}</script>
</body>
</html>`;

    const w=window.open("","_blank","width=920,height=760");
    w.document.write(html);
    w.document.close();
  };
  const handleBulkImport=async(rows,member)=>{
    let newEntries=[];
    let newCounters={...counters};
    rows.forEach(row=>{
      const cat=catByCode(row.categoryCode);
      const evObj=events.find(e=>e.id===row.eventId);
      const cKey=row.categoryCode==="GNCEV"&&evObj?`GNCEV-${evObj.tag}`:row.categoryCode;
      const n=(newCounters[cKey]||0)+1;
      newCounters[cKey]=n;
      const txnId=row.categoryCode==="GNCEV"&&evObj?`GNCEV-${evObj.tag}-${pad5(n)}`:`${row.categoryCode}${pad5(n)}`;
      newEntries.push({
        id:genId(),
        txnId,date:row.date,member,
        categoryCode:row.categoryCode,category:cat.label,
        amount:Number(row.amount),purpose:row.purpose,
        upiId:row.upiId,status:"Pending",
        notes:row.txnRef?`Ref: ${row.txnRef}`:"",
        eventId:row.eventId||null,subCategory:row.subCategory||null,
      });
    });
    setEntries(p=>[...newEntries,...p]);
    setCounters(newCounters);
    showToast(`✅ Imported ${newEntries.length} expense${newEntries.length!==1?"s":""}!`);
    if(scriptUrl){
      setSyncStatus("syncing");
      const r=await callScript("bulkAddEntries",{entries:newEntries});
      for(const [key,value] of Object.entries(newCounters)){
        await callScript("updateCounter",{key,value});
      }
      setSyncStatus(r.success?"ok":"fail");
      // Upload per-row receipt (UPI screenshot) and invoice (bill) to Drive
      if(r.success){
        for(let i=0;i<rows.length;i++){
          const row=rows[i];
          const entry=newEntries[i];
          if(!entry)continue;
          // Receipt / UPI screenshot
          if(row.receiptDataUrl){
            const base64=row.receiptDataUrl.split(",")[1];
            const mimeType=row.receiptDataUrl.split(";")[0].replace("data:","");
            const dr=await callScript("saveReceipt",{txnId:entry.txnId,base64,mimeType,date:entry.date,member:entry.member,fileType:"receipt"});
            if(dr.success)setEntries(p=>p.map(e=>e.id===entry.id?{...e,receiptUrl:dr.viewUrl,receiptFileId:dr.fileId}:e));
          }
          // Invoice / Bill
          if(row.invoiceDataUrl){
            const base64=row.invoiceDataUrl.split(",")[1];
            const mimeType=row.invoiceDataUrl.split(";")[0].replace("data:","");
            const dinv=await callScript("saveReceipt",{txnId:entry.txnId,base64,mimeType,date:entry.date,member:entry.member,fileType:"invoice"});
            if(dinv.success)setEntries(p=>p.map(e=>e.id===entry.id?{...e,invoiceUrl:dinv.viewUrl,invoiceFileId:dinv.fileId}:e));
          }
        }
        const attachCount=rows.filter(r=>r.receiptDataUrl||r.invoiceDataUrl).length;
        if(attachCount>0)showToast(`📎 ${attachCount} attachment${attachCount!==1?"s":""} uploaded to Drive`,"success");
      }
      setTimeout(()=>setSyncStatus(null),3000);
    }
  };

  const handleEditEntry=async(updated)=>{
    setEntries(p=>p.map(e=>e.id===updated.id?updated:e));
    setEditEntry(null);
    showToast("✅ Entry updated");
    if(scriptUrl){
      setSyncStatus("syncing");
      const r=await callScript("updateEntry",{entry:updated});
      setSyncStatus(r.success?"ok":"fail");
      setTimeout(()=>setSyncStatus(null),3000);
    }
  };

  const handleDeleteEntry=async(id)=>{
    setEntries(p=>p.filter(e=>e.id!==id));
    setDeleteEntry(null);
    showToast("🗑️ Entry deleted","info");
    if(scriptUrl){
      setSyncStatus("syncing");
      const r=await callScript("deleteEntry",{id});
      setSyncStatus(r.success?"ok":"fail");
      setTimeout(()=>setSyncStatus(null),3000);
    }
  };

  // Pending reimbursement count for badge
  const pendingCount = entries.filter(e=>e.status==="Pending").length;

  // Annual totals (current year vs last year)
  const thisYear   = new Date().getFullYear();
  const ytdTotal   = entries.filter(e=>new Date(e.date).getFullYear()===thisYear).reduce((s,e)=>s+e.amount,0);
  const lastYrTotal= entries.filter(e=>new Date(e.date).getFullYear()===thisYear-1).reduce((s,e)=>s+e.amount,0);
  const ytdDiff    = ytdTotal - lastYrTotal;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:"#060d1a",color:"#fff"}}>
      {loading&&(
        <div style={{position:"fixed",inset:0,background:"rgba(6,13,26,0.92)",zIndex:9000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18}}>
          <div style={{width:52,height:52,border:"3px solid rgba(251,191,36,0.2)",borderTopColor:"#fbbf24",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#fbbf24"}}>Loading from Google Sheets…</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.35)"}}>Fetching your expense data</div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        body,html{margin:0;padding:0;overflow-x:hidden;}
        input:focus,select:focus,textarea:focus{border-color:#fbbf24!important;}
        @keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .rh:hover{background:rgba(251,191,36,0.04)!important;}
        .nt{transition:all 0.2s;}
        select option{background:#0a1628;color:#fff;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03);}
        ::-webkit-scrollbar-thumb{background:rgba(251,191,36,0.35);border-radius:3px;}
        /* ── Table scroll ── */
        .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .tbl-wrap table{min-width:680px;}

        /* ══ MOBILE XS: 320–389px (small Android, iPhone SE) ══ */
        @media(max-width:389px){
          .nav-label{display:none!important;}
          .nav-btn{padding:6px 6px!important;font-size:10px!important;}
          .hdr-inner{padding:0 6px!important;height:52px!important;}
          .hdr-title{font-size:12px!important;}
          .hdr-tagline{display:none!important;}
          .hdr-logo{width:30px!important;height:30px!important;}
          .content-wrap{padding:8px!important;}
          .form-grid{grid-template-columns:1fr!important;}
          .cat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ev-grid{grid-template-columns:1fr!important;}
          .debug-drawer{width:100vw!important;right:0!important;height:52vh!important;}
          .hdr-extra-btns{display:none!important;}
          .pay-toggle button{font-size:9px!important;padding:7px 2px!important;}
          .hdr-conn-btn{font-size:10px!important;padding:5px 7px!important;}
          .hdr-actions{gap:4px!important;}
        }

        /* ══ MOBILE XS-PLUS: 360–389px (OnePlus 12R, many mid-range Android) ══ */
        @media(min-width:360px) and (max-width:389px){
          .hdr-title{font-size:13px!important;}
          .hdr-inner{padding:0 8px!important;}
          .hdr-conn-btn{font-size:11px!important;padding:5px 9px!important;}
        }

        /* ══ MOBILE S: 390–479px (iPhone 14/15, Pixel 6a) ══ */
        /* 390-419px: iPhone 14/15 base, OnePlus 12R (412px), iQOO Neo 10R (412px) */
        @media(min-width:390px) and (max-width:419px){
          .nav-label{display:none!important;}
          .nav-btn{padding:6px 6px!important;font-size:10px!important;}
          .hdr-inner{padding:0 8px!important;height:52px!important;}
          .hdr-title{font-size:13px!important;}
          .hdr-tagline{display:none!important;}
          .hdr-logo{width:32px!important;height:32px!important;}
          .content-wrap{padding:9px!important;}
          .form-grid{grid-template-columns:1fr!important;}
          .cat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ev-grid{grid-template-columns:1fr!important;}
          .debug-drawer{width:100vw!important;right:0!important;}
          .hdr-extra-btns{display:none!important;}
          .pay-toggle button{font-size:10px!important;padding:5px 5px!important;}
          .hdr-conn-btn{font-size:10px!important;padding:5px 7px!important;}
        }

        /* 420-479px: Pixel 6a, Samsung A-series */
        @media(min-width:420px) and (max-width:479px){
          .nav-label{display:none!important;}
          .nav-btn{padding:7px 8px!important;font-size:11px!important;}
          .hdr-inner{padding:0 10px!important;height:54px!important;}
          .hdr-title{font-size:14px!important;}
          .hdr-tagline{display:none!important;}
          .hdr-logo{width:34px!important;height:34px!important;}
          .content-wrap{padding:10px!important;}
          .form-grid{grid-template-columns:1fr!important;}
          .cat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ev-grid{grid-template-columns:1fr!important;}
          .debug-drawer{width:100vw!important;right:0!important;}
          .hdr-extra-btns{display:none!important;}
          .pay-toggle button{font-size:10px!important;}
        }

        /* ══ MOBILE L: 480–639px (6.5–6.7″ Android, iPhone Plus/Max) ══ */
        @media(min-width:480px) and (max-width:639px){
          .nav-label{display:none!important;}
          .nav-btn{padding:8px 10px!important;font-size:11px!important;}
          .hdr-inner{padding:0 14px!important;height:56px!important;}
          .hdr-title{font-size:15px!important;}
          .hdr-tagline{display:none!important;}
          .hdr-logo{width:36px!important;height:36px!important;}
          .content-wrap{padding:12px!important;}
          .form-grid{grid-template-columns:1fr!important;}
          .cat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(2,1fr)!important;}
          .ev-grid{grid-template-columns:1fr!important;}
          .debug-drawer{width:100vw!important;right:0!important;}
          .hdr-extra-btns{display:none!important;}
        }

        /* ══ TABLET: 640–1023px (iPad, Android tablet, landscape phone) ══ */
        @media(min-width:640px) and (max-width:1023px){
          .nav-label{font-size:11px!important;}
          .hdr-inner{padding:0 18px!important;}
          .content-wrap{padding:18px!important;}
          .form-grid{grid-template-columns:1fr!important;}
          .cat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .ev-grid{grid-template-columns:repeat(2,1fr)!important;}
          .debug-drawer{width:460px!important;}
        }

        /* ══ LAPTOP / DESKTOP: 1024px+ ══ */
        @media(min-width:1024px){
          .form-grid{grid-template-columns:1fr 1fr!important;}
          .cat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .stat-grid{grid-template-columns:repeat(3,1fr)!important;}
          .ev-grid{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))!important;}
        }

        /* ══ WIDE MONITOR: 1440px+ ══ */
        @media(min-width:1440px){
          .stat-grid{grid-template-columns:repeat(4,1fr)!important;}
        }

        @media print{
      .page-shell{gap:14px;}
      .hero{border-radius:18px;}
      .hero-grid{grid-template-columns:1fr !important;}
      .hero-right{border-left:none;border-top:1px solid rgba(255,255,255,0.12);}
      .audit-grid,.signal-grid,.insight-grid,.breakdowns{grid-template-columns:1fr 1fr !important;}
      .stats{grid-template-columns:repeat(3,1fr) !important;}
      .panel-title-row{flex-wrap:wrap;}body{padding:18px;}@page{margin:15mm;size:A4;}}
      `}</style>

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,#071020 0%,#060d1a 100%)",borderBottom:"1px solid rgba(251,191,36,0.2)",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 30px rgba(0,0,0,0.5)"}}>
        <div style={{height:3,background:"linear-gradient(90deg,#1d4ed8,#f59e0b,#10b981,#f59e0b,#1d4ed8)"}}/>
        <div className="hdr-inner" style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <img className="hdr-logo" src={LOGO_SRC} alt="Gokul's Nandanam" style={{width:52,height:52,objectFit:"contain",borderRadius:10}}/>
            <div>
              <div className="hdr-title" style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:800,fontSize:20,color:"#fbbf24",lineHeight:1}}>{COMMUNITY.name}</div>
              <div className="hdr-tagline" style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2,letterSpacing:"0.04em"}}>{COMMUNITY.tagline}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:2,alignItems:"center"}}>
            {[["submit","Submit","wall"],["dashboard","Treasurer","bar"],["events","Events","star"],["members","Members","user"],["bank","Bank","trd"]].map(([v,l,i])=>(
              <button key={v} className="nt nav-btn" onClick={()=>{
                if((v==="dashboard"||v==="events"||v==="members"||v==="bank")&&!isTreasurer){setPendingView(v);setShowPin(true);}
                else setView(v);
              }} style={{background:"none",border:"none",borderBottom:`2px solid ${view===v?"#fbbf24":"transparent"}`,color:view===v?"#fbbf24":"rgba(255,255,255,0.45)",padding:"8px 15px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:view===v?700:500,fontSize:13,display:"flex",alignItems:"center",gap:6,position:"relative"}}>
                <Icon n={i} s={14}/><span className="nav-label">{l}</span>
                {v==="dashboard"&&pendingCount>0&&(
                  <span style={{background:"#ef4444",color:"#fff",borderRadius:20,fontSize:10,fontWeight:800,padding:"1px 6px",minWidth:18,textAlign:"center",lineHeight:"16px"}}>{pendingCount}</span>
                )}
                {(v==="dashboard"||v==="events"||v==="members")&&<span style={{fontSize:9,opacity:0.5}}>{isTreasurer?"🔓":"🔒"}</span>}
              </button>
            ))}
            {isTreasurer&&(
              <span className="hdr-extra-btns" style={{display:"contents"}}>
              <button onClick={()=>setShowMemberPanel(true)} style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",color:"#10b981",borderRadius:10,padding:"7px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:5,marginLeft:4}}>
                <Icon n="user" s={13}/>Members
              </button>
              </span>
            )}
            {isTreasurer&&(
              <span className="hdr-extra-btns" style={{display:"contents"}}>
              <button onClick={()=>setShowVendorPanel(true)} style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.25)",color:"#fbbf24",borderRadius:10,padding:"7px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:5,marginLeft:4}}>
                🏪 Vendors
              </button>
              </span>
            )}
            {(verifiedMember || isTreasurer) && (
              <div style={{marginLeft:8,display:"inline-flex",alignItems:"center",gap:6,background:isTreasurer?"rgba(251,191,36,0.12)":"rgba(16,185,129,0.1)",border:`1px solid ${isTreasurer?"rgba(251,191,36,0.3)":"rgba(16,185,129,0.28)"}`,color:isTreasurer?"#fbbf24":"#10b981",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800,letterSpacing:"0.02em"}}>
                <span>{isTreasurer?"🔓":"✓"}</span>
                <span>{isTreasurer ? "Treasurer Mode" : verifiedMember}</span>
              </div>
            )}
            {isTreasurer&&(
              <button onClick={()=>{clearAuthSession();setVerifiedMember(null);setForm(f=>({...f,member:""}));setView("submit");showToast("Locked — back to member view","info");}} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:10,padding:"7px 11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:5}}>
                🔒 Lock
              </button>
            )}
            {isTreasurer&&<button onClick={()=>setShowSheets(true)} style={{marginLeft:6,background:dbReady?"rgba(16,185,129,0.1)":"rgba(251,191,36,0.08)",border:`1px solid ${dbReady?"rgba(16,185,129,0.3)":"rgba(251,191,36,0.25)"}`,color:dbReady?"#10b981":"#fbbf24",borderRadius:10,padding:"7px 13px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
              <Icon n="sht" s={13}/>
              {syncStatus==="syncing"?<><Spin/>Syncing</>:syncStatus==="ok"?"✓ Saved":syncStatus==="fail"?"⚠ Sync fail":dbReady?"● DB Live":"Connect DB"}
            </button>}
            <button onClick={()=>setShowDebug(v=>!v)} title="Debug Log" style={{marginLeft:4,background:debugLog.some(l=>l.level==="error")?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.05)",border:`1px solid ${debugLog.some(l=>l.level==="error")?"rgba(239,68,68,0.4)":"rgba(255,255,255,0.1)"}`,color:debugLog.some(l=>l.level==="error")?"#ef4444":"rgba(255,255,255,0.4)",borderRadius:10,padding:"7px 10px",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:5,position:"relative"}}>
              🪲
              {debugLog.filter(l=>l.level==="error").length>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:10,fontSize:9,fontWeight:800,padding:"1px 5px"}}>{debugLog.filter(l=>l.level==="error").length}</span>}
            </button>
          </div>
        </div>
      </div>

      {syncStatus==="fail" && (
        <div style={{maxWidth:1100,margin:"14px auto 0",padding:"0 24px"}}>
          <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:"#f87171",textTransform:"uppercase",letterSpacing:"0.06em"}}>Sync attention needed</div>
              <div style={{fontSize:12.5,color:"rgba(255,255,255,0.68)",marginTop:4}}>The last save did not fully reach Google Sheets. Open the debug log or retry the action after reconnecting.</div>
            </div>
            <button onClick={()=>setShowDebug(true)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",color:"#fff",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:12}}>
              Open Debug Log
            </button>
          </div>
        </div>
      )}

      {!installBannerHidden && installMode && (
        <InstallHintBanner
          mode={installMode}
          onInstall={installMode==="prompt" ? triggerInstallPrompt : null}
          onClose={dismissInstallBanner}
        />
      )}

      <div className="content-wrap" style={{maxWidth:1100,margin:"0 auto",padding:"30px 24px"}}>

        {/* ════ SUBMIT ════ */}
        {view==="submit" && !verifiedMember && (
          <MemberPinModal
            members={members}
            memberPinStatus={memberPinStatus}
            dbReady={dbReady}
            onVerify={verifyMemberPinWithServer}
            onSavePin={handleSaveMemberPin}
            onSuccess={name=>{setVerifiedMember(name);setForm(f=>({...f,member:name}));}}
            onClose={()=>setView("submit")}
          />
        )}
        {view==="submit" && verifiedMember && (
          <>
          <div className="form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:26,alignItems:"start"}}>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div>
                  <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:27,color:"#fbbf24",margin:"0 0 4px"}}>Submit Expense</h2>
                  <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,margin:0}}>Attach a receipt or screenshot for your records</p>
                  {verifiedMember&&<div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:6,background:isTreasurerMember(verifiedMember)?"rgba(251,191,36,0.1)":"rgba(16,185,129,0.1)",border:`1px solid ${isTreasurerMember(verifiedMember)?"rgba(251,191,36,0.4)":"rgba(16,185,129,0.3)"}`,borderRadius:8,padding:"4px 10px",fontSize:12,color:isTreasurerMember(verifiedMember)?"#fbbf24":"#10b981",fontWeight:700}}>✓ Verified: {verifiedMember}{isTreasurerMember(verifiedMember)&&<span style={{fontSize:10,opacity:0.8}}> ★ Treasurer</span>} <button onClick={()=>{setVerifiedMember(null);setForm(f=>({...f,member:""}));if(authSession?.role==="Member"&&authSession?.member===verifiedMember)clearAuthSession();}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:11,padding:0,marginLeft:2}}>switch</button></div>}
                  {isTreasurer&&<div style={{marginTop:8,fontSize:12,color:"rgba(251,191,36,0.72)",fontWeight:600}}>Treasurer mode is active. You can submit or update expenses on behalf of any member.</div>}
                </div>
                <button onClick={()=>setShowBulk(true)} style={{flexShrink:0,background:"linear-gradient(135deg,#3730a3,#4f46e5)",color:"#fff",border:"none",borderRadius:11,padding:"9px 15px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:7,boxShadow:"0 4px 16px rgba(99,102,241,0.4)",whiteSpace:"nowrap"}}>
                  <span style={{fontSize:15}}>📥</span> Bulk Import
                </button>
              </div>

              <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0",color:"rgba(255,255,255,0.18)",fontSize:12}}>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
                <span>{payType==="upi"?"enter UPI details below":payType==="cash"?"cash payment":payType==="cheque"?"cheque — enter details below":"net banking — enter reference below"}</span>
                <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
              </div>

              {(form.amount || form.categoryCode || form.purpose || form.upiId || form.notes || receiptDataUrl || invoiceDataUrl) && (
                <div style={{marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.22)",borderRadius:12,padding:"10px 12px"}}>
                  <div style={{fontSize:12,color:"#93c5fd",fontWeight:700}}>
                    Draft auto-saved on this device
                  </div>
                  <button type="button" onClick={()=>{setForm({member:isTreasurer?(form.member||""):(verifiedMember||""),amount:"",categoryCode:"",purpose:"",date:todayStr(),upiId:"",notes:"",eventId:"",subCategory:"",txnRef:"",chequeNo:"",payeeDetails:""});setPayType("upi");setReceiptDataUrl(null);resetReceiptInput();setInvoiceDataUrl(null);resetInvoiceInput();setDupWarning(null);setDupOverride(false);clearSubmitDraft();}} style={{background:"none",border:"1px solid rgba(255,255,255,0.14)",color:"rgba(255,255,255,0.72)",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    Clear Draft
                  </button>
                </div>
              )}

              {/* Payment Method toggle */}
              <div className="pay-toggle" style={{display:"flex",gap:0,marginBottom:16,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4,border:"1px solid rgba(255,255,255,0.08)"}}>
                {[["upi","📱 UPI","#fbbf24"],["cash","💵 Cash","#10b981"],["cheque","🧾 Cheque","#3b82f6"],["netbanking","🏦 Net Banking","#8b5cf6"]].map(([type,label,col])=>(
                  <button key={type} onClick={()=>setPayType(type)} style={{flex:1,background:payType===type?`${col}18`:"transparent",border:payType===type?`1.5px solid ${col}50`:"1.5px solid transparent",borderRadius:9,padding:"9px 0",color:payType===type?col:"rgba(255,255,255,0.35)",fontWeight:payType===type?800:500,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Receipt / Bill attachment — same for all payment types */}
              {(()=>{
                const colors={upi:"#fbbf24",cash:"#10b981",cheque:"#3b82f6",netbanking:"#8b5cf6"};
                const icons={upi:"📱",cash:"💵",cheque:"🧾",netbanking:"🏦"};
                const labels={upi:"Attach UPI Screenshot (optional)",cash:"Attach Bill / Receipt (optional)",cheque:"Attach Cheque Image (optional)",netbanking:"Attach Transfer Screenshot (optional)"};
                const col = colors[payType];
                return (
                  <div style={{border:`2px dashed ${col}30`,borderRadius:14,padding:"16px 18px",background:`${col}05`,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                    {receiptDataUrl?(
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"100%"}}>
                        <img src={receiptDataUrl} alt="receipt" style={{maxHeight:120,maxWidth:"100%",borderRadius:8,border:`1px solid ${col}40`,objectFit:"contain"}}/>
                        <button onClick={()=>{setReceiptDataUrl(null);resetReceiptInput();}} style={{background:"none",border:"1px solid rgba(239,68,68,0.4)",color:"#ef4444",borderRadius:7,padding:"3px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Remove</button>
                      </div>
                    ):(
                      <button onClick={()=>receiptRef.current?.click()} style={{background:`${col}12`,border:`1px solid ${col}35`,color:col,borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8}}>
                        {icons[payType]} {labels[payType]}
                      </button>
                    )}
                    <input key={receiptKey} ref={receiptRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={e=>{
                      const f=e.target.files[0]; if(!f)return;
                      const r=new FileReader(); r.onload=ev=>setReceiptDataUrl(ev.target.result); r.readAsDataURL(f);
                    }}/>
                  </div>
                );
              })()}

              {/* Invoice / Vendor Bill attachment */}
              <div style={{border:"2px dashed rgba(139,92,246,0.3)",borderRadius:14,padding:"16px 18px",background:"rgba(139,92,246,0.04)",display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginTop:4}}>
                {invoiceDataUrl?(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,width:"100%"}}>
                    <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:2}}>📄 Invoice / Bill Attached</div>
                    {invoiceDataUrl.startsWith("data:image")?(
                      <img src={invoiceDataUrl} alt="invoice" style={{maxHeight:120,maxWidth:"100%",borderRadius:8,border:"1px solid rgba(139,92,246,0.4)",objectFit:"contain"}}/>
                    ):(
                      <div style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.3)",borderRadius:8,padding:"10px 18px",color:"#a78bfa",fontSize:12,fontWeight:700}}>📄 PDF Invoice Attached</div>
                    )}
                    <button onClick={()=>{setInvoiceDataUrl(null);resetInvoiceInput();}} style={{background:"none",border:"1px solid rgba(239,68,68,0.4)",color:"#ef4444",borderRadius:7,padding:"3px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Remove</button>
                  </div>
                ):(
                  <button onClick={()=>invoiceRef.current?.click()} style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.3)",color:"#a78bfa",borderRadius:10,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8}}>
                    📄 Attach Invoice / Vendor Bill (optional)
                  </button>
                )}
                <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",textAlign:"center"}}>Vendor invoice, purchase bill, or any supporting document</div>
                <input key={invoiceKey} ref={invoiceRef} type="file" accept="image/*,application/pdf" style={{display:"none"}} onChange={e=>{
                  const f=e.target.files[0]; if(!f)return;
                  const r=new FileReader(); r.onload=ev=>setInvoiceDataUrl(ev.target.result); r.readAsDataURL(f);
                }}/>
              </div>

              {(receiptDataUrl || invoiceDataUrl) && (
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                  {receiptDataUrl && <div style={{background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.28)",color:"#fbbf24",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800}}>📱 Payment proof attached</div>}
                  {invoiceDataUrl && <div style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.28)",color:"#a78bfa",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800}}>📄 Invoice attached</div>}
                </div>
              )}

              {/* Category picker with info */}
              <div style={{marginTop:22}}>
                <div style={{...LBL,marginBottom:10}}>Select Category <span style={{color:"rgba(255,255,255,0.25)",fontWeight:400,textTransform:"none",letterSpacing:0}}>— tap ℹ for details</span></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
                  {CATEGORIES.map(cat=>(
                    <div key={cat.code} style={{position:"relative"}}>
                      <button onClick={()=>setForm(f=>({...f,categoryCode:cat.code,eventId:"",subCategory:""}))} style={{width:"100%",background:form.categoryCode===cat.code?`${cat.color}22`:"rgba(255,255,255,0.04)",border:`1px solid ${form.categoryCode===cat.code?cat.color:"rgba(255,255,255,0.09)"}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",textAlign:"center",transition:"all 0.18s",fontFamily:"'DM Sans',sans-serif"}}>
                        <div style={{fontSize:20,marginBottom:5}}>{cat.icon}</div>
                        <div style={{fontSize:10,fontWeight:800,lineHeight:1.25,color:form.categoryCode===cat.code?cat.color:"rgba(255,255,255,0.7)",background:form.categoryCode===cat.code?`${cat.color}28`:"rgba(255,255,255,0.06)",border:`1px solid ${form.categoryCode===cat.code?cat.color+"60":"rgba(255,255,255,0.08)"}`,borderRadius:6,padding:"3px 5px",display:"inline-block",letterSpacing:"0.01em"}}>{cat.label}</div>
                      </button>
                      <div style={{position:"absolute",top:4,right:4}}>
                        <CatInfo cat={cat}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{background:"linear-gradient(135deg,#071428,#0c1e38)",borderRadius:20,padding:26,border:"1px solid rgba(251,191,36,0.15)",boxShadow:"0 8px 40px rgba(0,0,0,0.4)"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:23,color:"#fbbf24",margin:"0 0 18px"}}>Payment Details</h2>

              {/* Selected category info bar */}
              {form.categoryCode && selCat && (
                <div style={{background:`${selCat.color}12`,border:`1px solid ${selCat.color}30`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:selCat.color}}>{selCat.icon} {selCat.label}</div>
                      {selCat.examples&&<div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:3}}>e.g. {selCat.examples}</div>}
                      {selCat.vendor&&<div style={{fontSize:11,color:"#fbbf24",marginTop:2}}>🏪 Vendor: {selCat.vendor}</div>}
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:12,color:"#fbbf24",fontWeight:700,textAlign:"right"}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:2}}>TXN ID</div>
                      {txnPreview()||"—"}
                    </div>
                  </div>
                  {selCat.policy&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:6,paddingTop:6,borderTop:"1px solid rgba(255,255,255,0.06)",fontStyle:"italic"}}>📋 {selCat.policy}</div>}
                </div>
              )}

              <div style={{display:"grid",gap:13}}>
                {/* Category not selected error */}
                {fieldErrors.categoryCode&&(
                  <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:10,padding:"10px 14px",color:"#ef4444",fontSize:13,fontWeight:600}}>
                    ⚠ {fieldErrors.categoryCode} — choose one from the left panel
                  </div>
                )}
                <div>
                  <label style={{...LBL,color:fieldErrors.member?"#ef4444":undefined}}>{isTreasurer ? "Paid by Member *" : "Member Name *"}</label>
                  {isTreasurer ? (
                    <>
                      <select value={form.member} onChange={e=>{setForm(f=>({...f,member:e.target.value}));clearFieldError("member");}} style={inpStyle("member")}>
                        <option value="">Select paid by member</option>
                        {members.map(m=><option key={m}>{m}</option>)}
                      </select>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.42)",marginTop:5}}>
                        Treasurer mode: record or update an expense on behalf of the member who actually paid.
                      </div>
                    </>
                  ) : verifiedMember ? (
                    <div style={{...INP,display:"flex",alignItems:"center",gap:10,background:"rgba(16,185,129,0.07)",border:"1.5px solid rgba(16,185,129,0.35)",cursor:"default",paddingTop:9,paddingBottom:9}}>
                      <span style={{fontSize:16}}>✓</span>
                      <span style={{flex:1,fontWeight:700,color:isTreasurerMember(verifiedMember)?"#fbbf24":"#10b981"}}>{verifiedMember}</span>
                      <button type="button" onClick={()=>{setVerifiedMember(null);setForm(f=>({...f,member:""}));}} style={{background:"none",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif",padding:"2px 6px",borderRadius:5}}>switch</button>
                    </div>
                  ) : (
                    <select value={form.member} onChange={e=>{setForm(f=>({...f,member:e.target.value}));clearFieldError("member");}} style={inpStyle("member")}>
                      <option value="">Select your name</option>
                      {members.map(m=><option key={m}>{m}</option>)}
                    </select>
                  )}
                  <FieldErr k="member"/>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                  <div>
                    <label style={{...LBL,color:fieldErrors.amount?"#ef4444":undefined}}>Amount (₹) *</label>
                    <input type="number" placeholder="0" value={form.amount} onChange={e=>{setForm(f=>({...f,amount:e.target.value}));clearFieldError("amount");}} style={inpStyle("amount")}/>
                    <FieldErr k="amount"/>
                  </div>
                  <div>
                    <label style={LBL}>Date *</label>
                    <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INP}/>
                  </div>
                </div>

                {isEventCat&&(
                  <>
                    <div>
                      <label style={{...LBL,color:fieldErrors.eventId?"#ef4444":undefined}}>Event *</label>
                      <select value={form.eventId} onChange={e=>{setForm(f=>({...f,eventId:e.target.value}));clearFieldError("eventId");}} style={inpStyle("eventId")}>
                        <option value="">Select event</option>
                        {openEvents.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}
                      </select>
                      <FieldErr k="eventId"/>
                      {openEvents.length===0&&<div style={{fontSize:11,color:"#f59e0b",marginTop:4}}>⚠ No open events. Ask treasurer to create one.</div>}
                    </div>
                    <div>
                      <label style={LBL}>Sub-Category</label>
                      <select value={form.subCategory} onChange={e=>setForm(f=>({...f,subCategory:e.target.value}))} style={INP}>
                        <option value="">Select sub-category</option>
                        {EVENT_SUBCATS.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {isRecurringCat&&(
                  <div>
                    <label style={LBL}>Recurring Sub-Category</label>
                    <select value={form.subCategory} onChange={e=>setForm(f=>({...f,subCategory:e.target.value}))} style={INP}>
                      <option value="">Select recurring sub-category</option>
                      {RECURRING_SUBCATS.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:5}}>
                      Use this for electricity blocks, HWMS water, salaries, fuel, or consumables.
                    </div>
                  </div>
                )}

                <div>
                  <label style={{...LBL,color:fieldErrors.purpose?"#ef4444":undefined}}>Purpose / Description *</label>
                  <textarea value={form.purpose} onChange={e=>{setForm(f=>({...f,purpose:e.target.value}));clearFieldError("purpose");}} placeholder="Describe the payment purpose" rows={2} style={{...inpStyle("purpose"),resize:"vertical"}}/>
                  <FieldErr k="purpose"/>
                </div>

                {/* Payment-type-specific fields */}
                {/* Vendor selector — shown for all payment types */}
                <div>
                  <label style={LBL}>Vendor / Payee</label>
                  <div style={{display:"flex",gap:8}}>
                    <select
                      value={form.upiId && vendors.includes(form.upiId) ? form.upiId : "__custom__"}
                      onChange={e=>{
                        if(e.target.value!=="__custom__") setForm(f=>({...f,upiId:e.target.value}));
                        else setForm(f=>({...f,upiId:""}));
                      }}
                      style={{...INP,flex:1}}
                    >
                      <option value="__custom__">— Select vendor or type below —</option>
                      {vendors.map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  {/* Manual override input — always visible so user can type a new/custom vendor */}
                  <input
                    value={form.upiId}
                    onChange={e=>setForm(f=>({...f,upiId:e.target.value}))}
                    placeholder={payType==="upi"?"UPI ID or vendor name (auto-extracted from screenshot)":payType==="cash"?"Vendor / shop name":"Vendor / payee name"}
                    style={{...INP,marginTop:6,fontSize:12,opacity:0.85}}
                  />
                </div>

                {payType==="upi"&&(
                  <div style={{display:"none"}}>{/* UPI field now merged with vendor above */}</div>
                )}

                {payType==="cash"&&(
                  <div style={{display:"none"}}>{/* cash paid-to now merged with vendor above */}</div>
                )}

                {payType==="cheque"&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                    <div>
                      <label style={{...LBL,color:fieldErrors.chequeNo?"#ef4444":undefined}}>Cheque No. *</label>
                      <input value={form.chequeNo} onChange={e=>{setForm(f=>({...f,chequeNo:e.target.value}));clearFieldError("chequeNo");}} placeholder="e.g. 004521" style={inpStyle("chequeNo")}/>
                      <FieldErr k="chequeNo"/>
                    </div>
                    <div>
                      <label style={{...LBL,color:fieldErrors.payeeDetails?"#ef4444":undefined}}>Payee Details *</label>
                      <input value={form.payeeDetails} onChange={e=>{setForm(f=>({...f,payeeDetails:e.target.value}));clearFieldError("payeeDetails");}} placeholder="Name / account details" style={inpStyle("payeeDetails")}/>
                      <FieldErr k="payeeDetails"/>
                    </div>
                  </div>
                )}

                {payType==="netbanking"&&(
                  <div>
                    <label style={{...LBL,color:fieldErrors.txnRef?"#ef4444":undefined}}>NEFT / RTGS / IMPS Reference No. *</label>
                    <input value={form.txnRef} onChange={e=>{setForm(f=>({...f,txnRef:e.target.value}));clearFieldError("txnRef");}} placeholder="e.g. NEFT2025090112345" style={inpStyle("txnRef")}/>
                    <FieldErr k="txnRef"/>
                  </div>
                )}

                <div>
                  <label style={LBL}>Notes (optional)</label>
                  <input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional context" style={INP}/>
                </div>

                {dupWarning && (
                  <div style={{background:dupWarning.level==="hard"?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.12)",border:`1px solid ${dupWarning.level==="hard"?"rgba(239,68,68,0.35)":"rgba(245,158,11,0.28)"}`,borderRadius:12,padding:"12px 14px"}}>
                    <div style={{fontSize:12,fontWeight:800,color:dupWarning.level==="hard"?"#f87171":"#fbbf24",marginBottom:5}}>
                      {dupWarning.level==="hard"?"Possible exact duplicate":"Possible duplicate detected"}
                    </div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.76)",lineHeight:1.5}}>
                      {dupWarning.message}
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:4}}>
                      Existing entry: {dupWarning.entry?.txnId || "Unknown"}
                    </div>
                    <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,fontSize:12,color:"rgba(255,255,255,0.82)",fontWeight:700,cursor:"pointer"}}>
                      <input type="checkbox" checked={dupOverride} onChange={e=>setDupOverride(e.target.checked)} />
                      I reviewed this and still want to submit it
                    </label>
                  </div>
                )}

                <button onClick={handleSubmit} disabled={submitting} style={{...BLUE_BTN,width:"100%",justifyContent:"center",marginTop:4,opacity:submitting?0.7:1}}>
                  {submitting?<><Spin/>Submitting...</>:<><Icon n="plus" s={17}/>Submit Expense</>}
                </button>
              </div>
            </div>
          </div>
          {/* Community Transactions */}
          <div style={{marginTop:36}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",letterSpacing:"0.09em"}}>Community Transactions</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
            </div>
            <TxnsView
              entries={entries}
              events={events}
              verifiedMember={verifiedMember}
              isTreasurer={isTreasurer}
              isTreasurerMember={isTreasurerMember}
              onViewReceipt={(entry)=>{
                setViewingReceipt(entry);
              }}
            />
          </div>
          </>
        )}

        {/* ════ DASHBOARD ════ */}
        {view==="dashboard" && (
          <div>
            {!dbReady&&(
              <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div style={{fontSize:22}}>⚠️</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:"#fbbf24",fontSize:14}}>Not connected to database</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginTop:2}}>Data shown is local only and will reset on refresh. Connect Google Sheets to persist all records.</div>
                </div>
                <button onClick={()=>setShowSheets(true)} style={{background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#1a1a00",border:"none",borderRadius:10,padding:"9px 18px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>🔗 Connect DB</button>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#fbbf24",margin:0}}>Treasurer Dashboard</h2>
                <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"4px 0 0"}}>{filtered.length} entries · Click status badge to toggle reimbursement</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={exportCSV} style={BLUE_BTN}><Icon n="dl" s={15}/>Export CSV</button>
                <button onClick={generatePDF} style={{...BLUE_BTN,background:"linear-gradient(135deg,#dc2626,#ef4444)",boxShadow:"0 4px 18px rgba(220,38,38,0.35)"}}>
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  PDF Report
                </button>
              </div>
            </div>

            {/* Member pending banner — shown when a member filter is active */}
            {memberFilterActive&&(
              <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.13),rgba(245,158,11,0.06))",border:"1.5px solid rgba(245,158,11,0.45)",borderRadius:14,padding:"14px 20px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#b45309,#f59e0b)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0}}>
                    {fMember.split(" ").map(w=>w[0]).slice(0,2).join("")}
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"rgba(251,191,36,0.6)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Filtered: {fMember}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{filtered.length} entries · all time</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Total Spent</div>
                    <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"'DM Sans',sans-serif",lineHeight:1.2}}>{fmt(totalAmt)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(245,158,11,0.7)",textTransform:"uppercase",letterSpacing:"0.08em"}}>⏳ To Reimburse</div>
                    <div style={{fontSize:22,fontWeight:800,color:memberPendingAmt>0?"#f59e0b":"#10b981",fontFamily:"'DM Sans',sans-serif",lineHeight:1.2}}>{fmt(memberPendingAmt||0)}</div>
                    {memberPendingAmt>0&&<div style={{fontSize:10,color:"rgba(245,158,11,0.55)",marginTop:1}}>{filtered.filter(e=>e.status==="Pending").length} pending entries</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(16,185,129,0.7)",textTransform:"uppercase",letterSpacing:"0.08em"}}>✅ Reimbursed</div>
                    <div style={{fontSize:22,fontWeight:800,color:"#10b981",fontFamily:"'DM Sans',sans-serif",lineHeight:1.2}}>{fmt(reimAmt)}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
              <StatCard label="Total Expenses"        value={fmt(totalAmt)}   sub={`${filtered.length} transactions`}                            icon="trd" accent="#fbbf24"/>
              <StatCard label="Pending Reimbursement" value={fmt(pendingAmt)} sub={`${filtered.filter(e=>e.status==="Pending").length} entries`}  icon="clk" accent="#f59e0b"/>
              <StatCard label="Reimbursed"            value={fmt(reimAmt)}    sub={`${filtered.filter(e=>e.status==="Reimbursed").length} entries`} icon="chk" accent="#10b981"/>
            </div>

            {/* Annual YTD summary */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>📅</span>
                <div>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Year to Date {thisYear}</span>
                  <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"'DM Sans',sans-serif",lineHeight:1.2}}>{fmt(ytdTotal)}</div>
                </div>
              </div>
              {lastYrTotal>0&&(
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>vs {thisYear-1}: {fmt(lastYrTotal)}</div>
                  <div style={{fontSize:15,fontWeight:800,color:ytdDiff>0?"#f87171":ytdDiff<0?"#34d399":"#fbbf24",marginTop:2}}>
                    {ytdDiff===0?"—":(ytdDiff>0?"↑ ":"↓ ")+fmt(Math.abs(ytdDiff))}{ytdDiff!==0&&lastYrTotal>0&&(" ("+(ytdDiff>0?"+":"")+Math.round(ytdDiff/lastYrTotal*100)+"%)") }
                  </div>
                </div>
              )}
            </div>

            {/* MoM Variance + Recurring vs One-Time strip */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:22}}>
              {/* Month-over-Month */}
              <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${momDiff>0?"rgba(239,68,68,0.35)":momDiff<0?"rgba(16,185,129,0.35)":"rgba(255,255,255,0.08)"}`,borderRadius:14,padding:"14px 18px",display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>Month-over-Month</div>
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <span style={{fontSize:22,fontWeight:800,color:momDiff>0?"#ef4444":momDiff<0?"#10b981":"#fbbf24",fontFamily:"'DM Sans',sans-serif"}}>
                    {momDiff===0?fmt(0):(momDiff>0?"↑ ":"↓ ")+fmt(Math.abs(momDiff))}
                  </span>
                  {momPct!==null&&<span style={{fontSize:12,fontWeight:700,color:momDiff>0?"rgba(239,68,68,0.7)":"rgba(16,185,129,0.7)"}}>{momPct>0?"+":""}{momPct}%</span>}
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>
                  {MONTHS[curMonth]}: {fmt(curMonthTotal)} vs {MONTHS[prevMonth]}: {fmt(prevMonthTotal)}
                </div>
              </div>

              {/* Recurring */}
              <div style={{background:"rgba(139,92,246,0.06)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:14,padding:"14px 18px",display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(139,92,246,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>🔁 Recurring</div>
                <div style={{fontSize:22,fontWeight:800,color:"#a78bfa",fontFamily:"'DM Sans',sans-serif"}}>{fmt(recurringTotal)}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{filteredRecurring.length} entries · salaries, bills, AMC</div>
              </div>

              {/* One-time */}
              <div style={{background:"rgba(6,182,212,0.06)",border:"1px solid rgba(6,182,212,0.22)",borderRadius:14,padding:"14px 18px",display:"flex",flexDirection:"column",gap:4}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(6,182,212,0.7)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>⚡ One-Time / Ad hoc</div>
                <div style={{fontSize:22,fontWeight:800,color:"#67e8f9",fontFamily:"'DM Sans',sans-serif"}}>{fmt(oneTimeTotal)}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{filteredOneTime.length} entries · repairs, events, misc</div>
              </div>
            </div>

            {/* Recurring MoM Comparison Panel */}
            {recurringMoM.filter(r=>r.hasData).length>0&&(
              <div style={{background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:22}}>
                <div style={{fontSize:10,fontWeight:800,color:"rgba(196,181,253,0.6)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>
                  🔁 Recurring Expenses — Month-over-Month Breakdown ({MONTHS[prevMonth]} → {MONTHS[curMonth]})
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                  {recurringMoM.filter(r=>r.hasData).map(r=>(
                    <div key={r.id} style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 13px",borderLeft:`3px solid ${r.color}80`,display:"flex",flexDirection:"column",gap:4}}>
                      <div style={{fontSize:11,fontWeight:700,color:r.color,display:"flex",alignItems:"center",gap:5}}>{r.icon} {r.label}</div>
                      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{fmt(r.curAmt)}</div>
                          {r.prevAmt>0&&<div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>prev: {fmt(r.prevAmt)}</div>}
                        </div>
                        {r.prevAmt>0&&(
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:12,fontWeight:800,color:r.diff>0?"#f87171":r.diff<0?"#34d399":"#fbbf24"}}>
                              {r.diff===0?"—":(r.diff>0?"↑ ":"↓ ")+fmt(Math.abs(r.diff))}
                            </div>
                            {r.pct!==null&&<div style={{fontSize:10,color:r.diff>0?"rgba(248,113,113,0.65)":"rgba(52,211,153,0.65)",fontWeight:700}}>{r.diff>0?"+":""}{r.pct}%</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search bar */}
            <div style={{marginBottom:12,position:"relative"}}>
              <input
                value={searchQ}
                onChange={e=>setSearchQ(e.target.value)}
                placeholder="🔍  Search by purpose, member, txn ID, amount..."
                style={{width:"100%",padding:"10px 16px 10px 14px",borderRadius:11,border:"1.5px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s"}}
              />
              {searchQ&&(
                <button onClick={()=>setSearchQ("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",padding:4,display:"flex",alignItems:"center"}}>
                  <Icon n="x" s={13}/>
                </button>
              )}
            </div>

            {/* Filters */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,padding:"13px 16px",marginBottom:18,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{color:"rgba(255,255,255,0.35)",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><Icon n="flt" s={12}/>FILTER:</span>
              {[
                {v:fYear,  s:setFYear,  o:[["all","All Years"],  ...allYears.map(y=>[String(y),String(y)])]},
                {v:fMonth, s:setFMonth, o:[["all","All Months"], ...MONTHS.map((m,i)=>[String(i),m])]},
                {v:fStatus,s:setFStatus,o:[["all","All Status"],  ["Pending","Pending"],["Reimbursed","Reimbursed"]]},
                {v:fCat,   s:setFCat,   o:[["all","All Categories"],...CATEGORIES.map(c=>[c.code,`${c.icon} ${c.code}`])]},
                {v:fEvent,    s:setFEvent,   o:[["all","All Events"],  ...events.map(e=>[e.id,e.name])]},
                {v:fPayType,  s:setFPayType, o:[["all","All Types"],["upi","📱 UPI / Online"],["cash","💵 Cash"],["cheque","🧾 Cheque"],["netbanking","🏦 Net Banking"]]},
              ].map(({v,s,o},i)=>(
                <select key={i} value={v} onChange={e=>s(e.target.value)} style={{...INP,width:"auto",padding:"7px 11px",fontSize:12}}>
                  {o.map(([val,lbl])=><option key={val} value={val}>{lbl}</option>)}
                </select>
              ))}
              {/* Member filter — treasurer-only quick filter */}
              <select value={fMember} onChange={e=>setFMember(e.target.value)}
                style={{...INP,width:"auto",padding:"7px 11px",fontSize:12,
                  borderColor:fMember!=="all"?"rgba(245,158,11,0.6)":undefined,
                  background:fMember!=="all"?"rgba(245,158,11,0.08)":undefined,
                  color:fMember!=="all"?"#fbbf24":undefined}}>
                <option value="all">👤 All Members</option>
                {members.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
              <button onClick={()=>{setFYear("all");setFMonth("all");setFStatus("all");setFCat("all");setFEvent("all");setFPayType("all");setFMember("all");}} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(255,255,255,0.45)",borderRadius:8,padding:"7px 12px",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                <Icon n="ref" s={11}/>Reset
              </button>
            </div>

            {/* Table header + Grouped toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.3)",fontWeight:600}}>
                {groupedView
                  ? `${filteredRecurring.length} recurring · ${filteredOneTime.length} one-time`
                  : `${filtered.length} entries`}
              </span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button
                  onClick={()=>setGroupedView(false)}
                  style={{background:!groupedView?"rgba(251,191,36,0.15)":"transparent",border:`1px solid ${!groupedView?"rgba(251,191,36,0.5)":"rgba(255,255,255,0.1)"}`,color:!groupedView?"#fbbf24":"rgba(255,255,255,0.35)",borderRadius:8,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  All Entries
                </button>
                <button
                  onClick={()=>setGroupedView(true)}
                  style={{background:groupedView?"rgba(139,92,246,0.15)":"transparent",border:`1px solid ${groupedView?"rgba(139,92,246,0.5)":"rgba(255,255,255,0.1)"}`,color:groupedView?"#a78bfa":"rgba(255,255,255,0.35)",borderRadius:8,padding:"6px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                  🔁 Grouped Statement
                </button>
              </div>
            </div>

            {/* Entries Table */}
            <div style={{background:"rgba(255,255,255,0.02)",borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="tbl-wrap" style={{overflowX:"auto"}}>
                {(()=>{
                  const EntryRow = ({e, isRecurring, recurType})=>{
                    const cat=catByCode(e.categoryCode||"GNMI");
                    const ev=events.find(ev=>ev.id===e.eventId);
                    const [copied,setCopied] = useState(false);
                    const copyTxn=()=>{
                      try{navigator.clipboard.writeText(e.txnId).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1500);});}catch{}
                    };
                    return (
                      <tr key={e.id} className="rh" style={{
                        borderBottom:"1px solid rgba(255,255,255,0.04)",
                        transition:"background 0.15s",
                        background: isRecurring ? "rgba(139,92,246,0.04)" : "transparent",
                        borderLeft: isRecurring ? `3px solid ${recurType?.color||"#a78bfa"}` : "3px solid transparent",
                      }}>
                        <td style={{padding:"12px 15px"}}>
                          <div onClick={copyTxn} title="Click to copy" style={{fontFamily:"monospace",fontSize:12,color:copied?"#10b981":"#fbbf24",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                            {e.txnId}
                            <span style={{fontSize:9,opacity:0.5}}>{copied?"✓":"⎘"}</span>
                          </div>
                          {isRecurring && recurType && (
                            <div style={{display:"inline-flex",alignItems:"center",gap:4,background:`${recurType.color}18`,color:recurType.color,border:`1px solid ${recurType.color}35`,borderRadius:5,fontSize:10,fontWeight:700,padding:"1px 6px",marginTop:3}}>
                              🔁 {recurType.label}
                            </div>
                          )}
                          {e.payType==="cash"&&<div style={{display:"inline-block",background:"rgba(16,185,129,0.15)",color:"#10b981",border:"1px solid rgba(16,185,129,0.3)",borderRadius:5,fontSize:10,fontWeight:700,padding:"1px 6px",marginTop:3}}>💵 CASH</div>}
                          {ev&&<div style={{fontSize:10,color:"#d946ef",marginTop:2}}>🎉 {ev.name}</div>}
                          {e.subCategory&&<div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{e.subCategory}</div>}
                        </td>
                        <td style={{padding:"12px 15px",fontSize:12,color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap"}}>
                          {new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"})}
                        </td>
                        <td style={{padding:"12px 15px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0}}>
                              {e.member.split(" ").map(w=>w[0]).slice(0,2).join("")}
                            </div>
                            <MemberName name={e.member.split(" ")[0]} style={{fontSize:13,fontWeight:600}} />
                          </div>
                        </td>
                        <td style={{padding:"12px 15px"}}>
                          <span style={{background:`${cat.color}18`,color:cat.color,border:`1px solid ${cat.color}35`,borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:700}}>
                            {cat.icon} {e.categoryCode||cat.code}
                          </span>
                        </td>
                        <td style={{padding:"12px 15px",fontSize:13,color:"rgba(255,255,255,0.65)",maxWidth:190}}>
                          <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.purpose}</div>
                          {e.notes&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1}}>{e.notes}</div>}
                        </td>
                        <td style={{padding:"12px 15px",fontSize:15,fontWeight:800,color:isRecurring?"#c4b5fd":"#fff",whiteSpace:"nowrap"}}>{fmt(e.amount)}</td>
                        <td style={{padding:"8px 10px",textAlign:"center"}}>
                          {(e.receiptUrl||e.receiptDataUrl||e.invoiceUrl||e.invoiceDataUrl) ? (
                            <button
                              onClick={()=>setViewingReceipt(e)}
                              title="View receipts"
                              style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:12,lineHeight:1,display:"inline-flex",alignItems:"center",gap:4,fontWeight:700}}>
                              📎
                              {(e.receiptUrl||e.receiptDataUrl)&&<span style={{fontSize:9,opacity:0.8}}>Pay</span>}
                              {(e.invoiceUrl||e.invoiceDataUrl)&&<span style={{fontSize:9,opacity:0.8,color:"#a78bfa"}}>Bill</span>}
                            </button>
                          ):(
                            <span style={{fontSize:11,color:"rgba(255,255,255,0.15)"}}>—</span>
                          )}
                        </td>
                        <td style={{padding:"12px 15px"}}><Badge status={e.status} onClick={()=>toggleStatus(e.id)}/></td>
                        {isTreasurer&&(
                          <td style={{padding:"8px 10px",whiteSpace:"nowrap"}}>
                            <div style={{display:"flex",gap:5}}>
                              <button onClick={()=>setEditEntry(e)} title="Edit" style={{background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.25)",color:"#fbbf24",borderRadius:7,padding:"4px 8px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✏️</button>
                              <button onClick={()=>setDeleteEntry(e)} title="Delete" style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:7,padding:"4px 8px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>🗑️</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  };

                  const TH = ()=>(
                    <thead>
                      <tr style={{borderBottom:"1px solid rgba(251,191,36,0.15)"}}>
                        {["Txn ID","Date","Member","Category","Purpose","Amount","📎","Status",...(isTreasurer?["Actions"]:[])].map(h=>(
                          <th key={h} style={{padding:"11px 15px",textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(251,191,36,0.55)",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                  );

                  if(!groupedView){
                    return (
                      <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
                        <TH/>
                        <tbody>
                          {filtered.length===0
                            ? <tr><td colSpan={7} style={{padding:"44px",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:14}}>No entries match current filters</td></tr>
                            : filtered.map(e=>{
                                const rt=detectRecurring(e.purpose,e.notes||"",e.subCategory||"");
                                return <EntryRow key={e.id} e={e} isRecurring={!!rt} recurType={rt}/>;
                              })
                          }
                        </tbody>
                      </table>
                    );
                  }

                  // Grouped view
                  return (
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
                      <TH/>
                      <tbody>
                        {/* Recurring section header */}
                        {filteredRecurring.length>0&&(
                          <tr>
                            <td colSpan={7} style={{padding:"12px 15px",background:"rgba(139,92,246,0.15)",borderTop:"2px solid rgba(139,92,246,0.5)",borderBottom:"1px solid rgba(139,92,246,0.2)"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontSize:12,fontWeight:800,color:"#c4b5fd",textTransform:"uppercase",letterSpacing:"0.1em"}}>🔁 Recurring Expenses</span>
                                <div style={{display:"flex",alignItems:"center",gap:16}}>
                                  <span style={{fontSize:11,color:"rgba(196,181,253,0.6)"}}>{filteredRecurring.length} entries</span>
                                  <span style={{fontSize:14,fontWeight:800,color:"#c4b5fd"}}>{fmt(recurringTotal)}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Sub-groups by recurring type */}
                        {recurringByType.map(group=>{
                          const mom = group.mom;
                          const hasMom = mom && (mom.curAmt>0||mom.prevAmt>0);
                          return [
                            <tr key={`hdr-${group.id}`}>
                              <td colSpan={7} style={{padding:"8px 15px 8px 28px",background:`${group.color}10`,borderBottom:`1px solid ${group.color}25`,borderLeft:`3px solid ${group.color}60`}}>
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                                  <span style={{fontSize:11,fontWeight:700,color:group.color,display:"flex",alignItems:"center",gap:6}}>
                                    {group.icon} {group.label}
                                    <span style={{fontSize:10,fontWeight:600,color:`${group.color}80`,marginLeft:4}}>{group.items.length} {group.items.length===1?"entry":"entries"}</span>
                                  </span>
                                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                                    {hasMom&&(
                                      <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,0.25)",borderRadius:8,padding:"3px 10px"}}>
                                        <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:600}}>MoM:</span>
                                        {mom.prevAmt===0
                                          ? <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>No prev data</span>
                                          : <>
                                              <span style={{fontSize:11,fontWeight:800,color:mom.diff>0?"#f87171":mom.diff<0?"#34d399":"#fbbf24"}}>
                                                {mom.diff===0?"—":(mom.diff>0?"↑ ":"↓ ")+fmt(Math.abs(mom.diff))}
                                              </span>
                                              {mom.pct!==null&&<span style={{fontSize:10,fontWeight:700,color:mom.diff>0?"rgba(248,113,113,0.7)":"rgba(52,211,153,0.7)"}}>({mom.diff>0?"+":""}{mom.pct}%)</span>}
                                              <span style={{fontSize:10,color:"rgba(255,255,255,0.25)"}}>{MONTHS[prevMonth]}→{MONTHS[curMonth]}</span>
                                            </>
                                        }
                                      </div>
                                    )}
                                    <span style={{fontSize:13,fontWeight:800,color:group.color}}>{fmt(group.total)}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>,
                            ...group.items.map(e=><EntryRow key={e.id} e={e} isRecurring={true} recurType={group}/>)
                          ];
                        })}

                        {/* Uncategorized recurring (GNREC but no keyword match) */}
                        {recurringUncategorized.length>0&&[
                          <tr key="hdr-uncat-rec">
                            <td colSpan={7} style={{padding:"8px 15px 8px 28px",background:"rgba(139,92,246,0.07)",borderBottom:"1px solid rgba(139,92,246,0.15)",borderLeft:"3px solid rgba(139,92,246,0.4)"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontSize:11,fontWeight:700,color:"#a78bfa"}}>🔁 Other Recurring · {recurringUncategorized.length} entries</span>
                                <span style={{fontSize:13,fontWeight:800,color:"#a78bfa"}}>{fmt(recurringUncategorized.reduce((s,e)=>s+e.amount,0))}</span>
                              </div>
                            </td>
                          </tr>,
                          ...recurringUncategorized.map(e=><EntryRow key={e.id} e={e} isRecurring={true} recurType={null}/>)
                        ]}

                        {/* One-time group header */}
                        {filteredOneTime.length>0&&(
                          <tr>
                            <td colSpan={7} style={{padding:"12px 15px",background:"rgba(6,182,212,0.08)",borderTop:"2px solid rgba(6,182,212,0.4)",borderBottom:"1px solid rgba(6,182,212,0.2)"}}>
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontSize:12,fontWeight:800,color:"#67e8f9",textTransform:"uppercase",letterSpacing:"0.1em"}}>⚡ One-Time / Ad-hoc Expenses</span>
                                <div style={{display:"flex",alignItems:"center",gap:16}}>
                                  <span style={{fontSize:11,color:"rgba(103,232,249,0.6)"}}>{filteredOneTime.length} entries</span>
                                  <span style={{fontSize:14,fontWeight:800,color:"#67e8f9"}}>{fmt(oneTimeTotal)}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {filteredOneTime.map(e=>(
                          <EntryRow key={e.id} e={e} isRecurring={false} recurType={null}/>
                        ))}

                        {filtered.length===0&&(
                          <tr>
                            <td colSpan={7} style={{padding:"26px"}}>
                              <EmptyStateCard
                                icon="🧾"
                                title="No entries match these filters"
                                body="Try resetting one or two filters, or add a new expense if this month has not been recorded yet."
                                actionLabel="Reset Filters"
                                onAction={()=>{setFYear("all");setFMonth("all");setFStatus("all");setFCat("all");setFEvent("all");setFPayType("all");setFMember("all");setSearchQ("");}}
                                tone="blue"
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>

            {/* Breakdowns */}
            <BreakdownPanel
              catItems={catBreakdownItems}
              memberItems={memberBreakdownItems}
              totalAmt={totalAmt}
              fmt={fmt}
            />
          </div>
        )}

        {/* ════ EVENTS ════ */}
        {view==="events" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#d946ef",margin:0}}>Events & Festivals</h2>
                <p style={{color:"rgba(255,255,255,0.35)",fontSize:13,margin:"4px 0 0"}}>Track all community celebrations — budget, spend & reimbursements</p>
              </div>
              <button onClick={()=>setShowCreateEv(true)} style={{...BLUE_BTN,background:"linear-gradient(135deg,#d946ef,#a21caf)",boxShadow:"0 4px 18px rgba(217,70,239,0.3)"}}>
                <Icon n="plus" s={15}/>New Event
              </button>
            </div>

            {events.length===0?(
              <EmptyStateCard
                icon="🎉"
                title="No events yet"
                body="Create your first event to track celebration budgets, festival spend, and reimbursements in one place."
                actionLabel="Create Event"
                onAction={()=>setShowCreateEv(true)}
                tone="purple"
              />
            ):(
              <div className="ev-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))",gap:18}}>
                {events.map(ev=>(
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    evSpend={evSpend}
                    entries={entries}
                    isTreasurer={isTreasurer}
                    fmt={fmt}
                    onViewTxns={()=>{setFEvent(ev.id);setView("dashboard");}}
                    onDelete={()=>setConfirmDeleteEv(ev)}
                    onToggle={()=>toggleEvent(ev.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {/* ════ BANK BALANCE TRACKER ════ */}
        {view==="bank" && (
          <BankTracker
            entries={entries}
            bankBalances={bankBalances}
            bankYear={bankYear}
            setBankYear={setBankYear}
            bankAccount={bankAccount}
            isTreasurer={isTreasurer}
            onSave={saveBankBalance}
            fmt={fmt}
          />
        )}

                {/* ════ MEMBERS BALANCE SHEET ════ */}
        {view==="members" && (
          <MemberBalanceSheet
            entries={entries}
            members={members}
            treasurerMembers={treasurerMembers}
            onBatchReimburse={async(ids, payRef)=>{
              setEntries(p=>p.map(e=>ids.includes(e.id)?{...e,status:"Reimbursed",notes:(e.notes?e.notes+"\n":"")+`Reimbursed via ${payRef||"payment"} on ${todayStr()}`}:e));
              showToast(`✅ ${ids.length} entr${ids.length===1?"y":"ies"} marked Reimbursed`);
              if(scriptUrl){
                setSyncStatus("syncing");
                const r=await callScript("batchReimburse",{ids,payRef,date:todayStr()});
                setSyncStatus(r.success?"ok":"fail");
                setTimeout(()=>setSyncStatus(null),3000);
              }
            }}
            onViewReceipt={(entry)=>setViewingReceipt(entry)}
          />
        )}
      </div>

        {/* Receipt Lightbox — Drive-aware: works with GKN-Receipts Drive URLs and local previews */}
      {viewingReceipt&&(()=>{
        const vr = viewingReceipt;
        // vr is the full entry object — has receiptUrl, receiptDataUrl, invoiceUrl, invoiceDataUrl, payType
        const hasPayment = !!(vr.receiptUrl || vr.receiptDataUrl);
        const hasInvoice  = !!(vr.invoiceUrl  || vr.invoiceDataUrl);
        const isCash      = vr.payType === "cash";
        const payLabel    = vr.payType === "cheque" ? "Cheque Image" : vr.payType === "netbanking" ? "Transfer Screenshot" : "UPI Screenshot";
        const showBoth    = hasPayment && hasInvoice;
        const paymentSource = vr.receiptUrl ? "Drive" : vr.receiptDataUrl ? "Local" : "Missing";
        const invoiceSource = vr.invoiceUrl ? "Drive" : vr.invoiceDataUrl ? "Local" : "Missing";
        return (
          <div onClick={()=>setViewingReceipt(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:2000,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px",cursor:"zoom-out",overflowY:"auto"}}>
            <div onClick={e=>e.stopPropagation()} style={{background:"#080f1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:20,width:"100%",maxWidth:showBoth?1100:600,boxShadow:"0 30px 80px rgba(0,0,0,0.9)",cursor:"default"}}>

              {/* Header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
                <div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#fbbf24",fontWeight:700}}>
                    🔍 Verify & Reimburse
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3}}>
                    {vr.txnId} · {vr.member} · {fmt(vr.amount)}
                    {vr.payType && <span style={{marginLeft:8,background:"rgba(255,255,255,0.07)",borderRadius:5,padding:"1px 7px",fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase"}}>{vr.payType}</span>}
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                    <span style={{background:paymentSource==="Drive"?"rgba(16,185,129,0.12)":paymentSource==="Local"?"rgba(245,158,11,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${paymentSource==="Drive"?"rgba(16,185,129,0.3)":paymentSource==="Local"?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.12)"}`,color:paymentSource==="Drive"?"#10b981":paymentSource==="Local"?"#fbbf24":"rgba(255,255,255,0.45)",borderRadius:999,padding:"5px 10px",fontSize:10,fontWeight:800}}>Payment proof: {paymentSource}</span>
                    <span style={{background:invoiceSource==="Drive"?"rgba(139,92,246,0.12)":invoiceSource==="Local"?"rgba(96,165,250,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${invoiceSource==="Drive"?"rgba(139,92,246,0.3)":invoiceSource==="Local"?"rgba(96,165,250,0.3)":"rgba(255,255,255,0.12)"}`,color:invoiceSource==="Drive"?"#a78bfa":invoiceSource==="Local"?"#93c5fd":"rgba(255,255,255,0.45)",borderRadius:999,padding:"5px 10px",fontSize:10,fontWeight:800}}>Invoice: {invoiceSource}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {vr.status==="Pending" && (
                    <button onClick={()=>{toggleStatus(vr.id);setViewingReceipt(null);}} style={{background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                      ✅ Mark Reimbursed
                    </button>
                  )}
                  <button onClick={()=>setViewingReceipt(null)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:9,padding:"8px 11px",cursor:"pointer"}}>
                    <Icon n="x" s={15}/>
                  </button>
                </div>
              </div>

              {/* Dual panel grid */}
              <div style={{display:"grid",gridTemplateColumns:showBoth?"1fr 1fr":"1fr",gap:16}}>

                {/* Panel 1: Payment proof (UPI/Cheque/Transfer) — hidden for Cash */}
                {!isCash && (
                  <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:14,overflow:"hidden"}}>
                    <div style={{padding:"10px 14px",background:"rgba(16,185,129,0.1)",borderBottom:"1px solid rgba(16,185,129,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#10b981",textTransform:"uppercase",letterSpacing:"0.06em"}}>💳 {payLabel}</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:10,fontWeight:800,color:paymentSource==="Drive"?"#9ee7c4":paymentSource==="Local"?"#fbbf24":"rgba(255,255,255,0.35)"}}>{paymentSource}</span>
                        {vr.receiptUrl && (
                          <a href={vr.receiptUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#10b981",textDecoration:"none",fontWeight:700,opacity:0.8}}>🔗 Drive</a>
                        )}
                      </div>
                    </div>
                    <div style={{padding:12,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {vr.receiptUrl && !vr.receiptDataUrl ? (
                        <div style={{textAlign:"center",padding:"20px 10px"}}>
                          <div style={{fontSize:36,marginBottom:10}}>🗂️</div>
                          <div style={{color:"#10b981",fontWeight:700,fontSize:13,marginBottom:6}}>Stored in GKN-Receipts</div>
                          <a href={vr.receiptUrl} target="_blank" rel="noopener noreferrer" style={{background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:"#10b981",borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:700,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5}}>
                            🔗 Open in Drive
                          </a>
                        </div>
                      ) : vr.receiptDataUrl ? (
                        <img src={vr.receiptDataUrl} alt="payment proof" style={{width:"100%",maxHeight:"60vh",objectFit:"contain",borderRadius:8}}/>
                      ) : (
                        <div style={{color:"rgba(255,255,255,0.2)",fontSize:13,textAlign:"center",padding:20}}>No payment screenshot attached</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Panel 2: Invoice / Vendor Bill */}
                {(hasInvoice || !isCash) && (
                  <div style={{background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:14,overflow:"hidden"}}>
                    <div style={{padding:"10px 14px",background:"rgba(139,92,246,0.1)",borderBottom:"1px solid rgba(139,92,246,0.15)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#a78bfa",textTransform:"uppercase",letterSpacing:"0.06em"}}>📄 Invoice / Vendor Bill</span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:10,fontWeight:800,color:invoiceSource==="Drive"?"#ddd6fe":invoiceSource==="Local"?"#93c5fd":"rgba(255,255,255,0.35)"}}>{invoiceSource}</span>
                        {vr.invoiceUrl && (
                          <a href={vr.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#a78bfa",textDecoration:"none",fontWeight:700,opacity:0.8}}>🔗 Drive</a>
                        )}
                      </div>
                    </div>
                    <div style={{padding:12,minHeight:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {vr.invoiceUrl && !vr.invoiceDataUrl ? (
                        <div style={{textAlign:"center",padding:"20px 10px"}}>
                          <div style={{fontSize:36,marginBottom:10}}>📁</div>
                          <div style={{color:"#a78bfa",fontWeight:700,fontSize:13,marginBottom:6}}>Stored in GKN-Receipts</div>
                          <a href={vr.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",color:"#a78bfa",borderRadius:9,padding:"8px 16px",fontSize:12,fontWeight:700,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5}}>
                            🔗 Open in Drive
                          </a>
                        </div>
                      ) : vr.invoiceDataUrl ? (
                        <img src={vr.invoiceDataUrl} alt="invoice" style={{width:"100%",maxHeight:"60vh",objectFit:"contain",borderRadius:8}}/>
                      ) : (
                        <div style={{color:"rgba(255,255,255,0.2)",fontSize:13,textAlign:"center",padding:20}}>No invoice / vendor bill attached</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cash-only panel (no payment screenshot) */}
              {isCash && !hasInvoice && (
                <div style={{textAlign:"center",padding:"30px 20px",color:"rgba(255,255,255,0.2)",fontSize:13}}>
                  No attachments for this cash entry
                </div>
              )}

              <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.15)",marginTop:14}}>Click outside or × to close</div>
            </div>
          </div>
        );
      })()}
      {showSheets&&<ScriptModal current={scriptUrl} onSave={url=>{
        setScriptUrl(url);
        try{localStorage.setItem("nandanam_script_url",url);}catch{}
        setShowSheets(false);
        showToast("🔗 Connecting to database...");
        addLog(`DB URL saved`,"info");
        loadFromSheet(url);
      }} onClose={()=>setShowSheets(false)}/>}
      {showCreateEv&&<CreateEventModal onSave={async ev=>{setEvents(p=>[ev,...p]);setShowCreateEv(false);showToast(`🎉 "${ev.name}" created!`);if(scriptUrl)await callScript("addEvent",{event:ev});}} onClose={()=>setShowCreateEv(false)}/>}

      {/* ── Confirm Delete Event Modal ── */}
      {confirmDeleteEv&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#0a1628",border:"1px solid rgba(239,68,68,0.4)",borderRadius:20,padding:"28px 28px 24px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.7)",textAlign:"center"}}>
            <div style={{fontSize:42,marginBottom:12}}>🗑</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:"#ef4444",marginBottom:8}}>Delete Event?</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginBottom:6}}>
              <strong style={{color:"#fff"}}>{confirmDeleteEv.name}</strong>
            </div>
            {(()=>{
              const linked=entries.filter(e=>e.eventId===confirmDeleteEv.id).length;
              return linked>0?(
                <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 14px",marginBottom:18,fontSize:12,color:"#ef4444"}}>
                  ⚠ {linked} transaction{linked>1?"s":""} linked to this event — they will remain but lose the event tag.
                </div>
              ):(
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginBottom:18}}>No transactions linked. Safe to remove.</div>
              );
            })()}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>setConfirmDeleteEv(null)} style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",borderRadius:11,padding:"11px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                Cancel
              </button>
              <button onClick={()=>deleteEvent(confirmDeleteEv)} style={{flex:1,background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",border:"none",borderRadius:11,padding:"11px",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(239,68,68,0.35)"}}>
                🗑 Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showBulk&&<BulkImportModal members={members} events={events} entries={entries} verifiedMember={verifiedMember} onImport={handleBulkImport} onClose={()=>setShowBulk(false)}/>}
      {showPin&&<PinModal onVerify={verifyTreasurerPinWithServer} onClose={()=>setShowPin(false)}/>}
      {showMemberPanel&&<MemberPanel members={members} memberPinStatus={memberPinStatus} onAdd={handleAddMember} onRemove={handleRemoveMember} onResetPin={handleResetMemberPin} onClose={()=>setShowMemberPanel(false)}/>}
      {showVendorPanel&&<VendorPanel vendors={vendors} onAdd={handleAddVendor} onRemove={handleRemoveVendor} onClose={()=>setShowVendorPanel(false)}/>}
      {editEntry&&<EditEntryModal entry={editEntry} members={members} events={events} categories={CATEGORIES} onSave={handleEditEntry} onClose={()=>setEditEntry(null)}/>}
      {deleteEntry&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#0a1628",border:"1px solid rgba(239,68,68,0.4)",borderRadius:20,padding:32,maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.6)",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:"#ef4444",marginBottom:8}}>Delete Entry?</div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:6}}>This will permanently remove:</div>
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"10px 16px",marginBottom:20}}>
              <div style={{fontFamily:"monospace",color:"#fbbf24",fontWeight:700,fontSize:14}}>{deleteEntry.txnId}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>{deleteEntry.purpose} · {fmt(deleteEntry.amount)}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDeleteEntry(null)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",color:"#fff",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14}}>Cancel</button>
              <button onClick={()=>handleDeleteEntry(deleteEntry.id)} style={{flex:1,background:"linear-gradient(135deg,#dc2626,#ef4444)",color:"#fff",border:"none",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── Debug Log Drawer ── */}
      {showDebug&&(
        <div className="debug-drawer" style={{position:"fixed",bottom:0,right:0,width:420,maxWidth:"100vw",height:"55vh",background:"#060d1a",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none",borderRight:"none",borderRadius:"16px 0 0 0",zIndex:3000,display:"flex",flexDirection:"column",boxShadow:"-8px -8px 40px rgba(0,0,0,0.6)",fontFamily:"monospace"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.03)",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)"}}>🪲 Debug Log</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{debugLog.length} events</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{
                const txt=debugLog.map(l=>`[${l.ts}] [${l.level.toUpperCase()}] ${l.msg}`).join("\n");
                const a=document.createElement("a");
                a.href=URL.createObjectURL(new Blob([txt],{type:"text/plain"}));
                a.download=`nandanam-debug-${todayStr()}.txt`;
                a.click();
              }} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
                ⬇ Export
              </button>
              <button onClick={()=>setDebugLog([])} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",color:"#ef4444",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
                Clear
              </button>
              <button onClick={()=>setShowDebug(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:16,lineHeight:1,padding:"4px 6px"}}>×</button>
            </div>
          </div>
          <div style={{overflowY:"auto",flex:1,padding:"8px 0"}}>
            {debugLog.length===0&&(
              <div style={{padding:"30px 16px",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:12}}>No events yet — actions will appear here</div>
            )}
            {debugLog.map(l=>{
              const col=l.level==="error"?"#f87171":l.level==="warn"?"#fbbf24":l.level==="ok"?"#34d399":"rgba(255,255,255,0.5)";
              return (
                <div key={l.id} style={{display:"flex",gap:10,padding:"5px 14px",borderBottom:"1px solid rgba(255,255,255,0.03)",alignItems:"flex-start"}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",whiteSpace:"nowrap",marginTop:1,flexShrink:0}}>{l.ts}</span>
                  <span style={{fontSize:10,fontWeight:700,color:col,minWidth:36,flexShrink:0,textTransform:"uppercase"}}>{l.level}</span>
                  <span style={{fontSize:11,color:col,wordBreak:"break-word",lineHeight:1.5}}>{l.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}








