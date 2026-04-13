// components.jsx - Componentes UI reutilizables
import React from "react";

/* ── Card ── */
export function Card({title, children, className=""}){
  return (
    <div className={"bg-white rounded-2xl shadow-sm border border-gray-100 p-5 "+className}>
      {title && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>}
      {children}
    </div>
  );
}

/* ── TabBtn ── */
export function TabBtn({label, active, onClick, icon}){
  return (
    <button
      onClick={onClick}
      className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all "
        +(active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200")}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

/* ── Modal ── */
export function Modal({open, onClose, title, children, wide}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className={"bg-white rounded-2xl shadow-2xl w-full overflow-hidden "+(wide?"max-w-4xl":"max-w-lg")}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ── FieldRow ── */
export function FieldRow({label, children}){
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-gray-600 text-right">{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

/* ── StatCard ── */
export function StatCard({label, value, sub, color="indigo"}){
  const colors = {
    indigo:"from-indigo-500 to-indigo-600",
    emerald:"from-emerald-500 to-emerald-600",
    amber:"from-amber-500 to-amber-600",
    rose:"from-rose-500 to-rose-600",
    blue:"from-blue-500 to-blue-600",
    purple:"from-purple-500 to-purple-600"
  };
  return (
    <div className={"bg-gradient-to-br text-white rounded-2xl p-5 shadow-lg "+(colors[color]||colors.indigo)}>
      <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Input helpers ── */
export function InputField({label, type="text", value, onChange, placeholder, className=""}){
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </div>
  );
}

export function SelectField({label, value, onChange, options, className=""}){
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <select
        value={value}
        onChange={e=>onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}
