// App.jsx - Sistema de Control de Activos Fijos
// Depreciación Financiera y Tributaria - React + Recharts
import React, { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { RAW } from "./data";
import { MESES, MESES_FULL, PCGE, AREA_DEST, CTA_OPTIONS, AREA_OPTIONS, COLORS } from "./constants";
import { fmt, fmtShort, metodoLabel, useStorage, calcDep, buildBaseAssets } from "./utils";
import { Card, TabBtn, Modal, FieldRow, StatCard, SelectField } from "./components";

/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */
function Dashboard({ assets, anioSel }) {
  const stats = useMemo(() => {
    const total = assets.length;
    const costoTotal = assets.reduce((s, a) => s + a.costoInicial, 0);
    const depTotal = assets.reduce((s, a) => s + a.depAcumulada, 0);
    const netoTotal = costoTotal - depTotal;
    const activos = assets.filter(a => a.estado === "Activo").length;
    return { total, costoTotal, depTotal, netoTotal, activos };
  }, [assets]);

  const porCuenta = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const key = a.cuenta?.substring(0, 3) || "336";
      const label = PCGE[a.cuenta] || ("Cuenta " + a.cuenta);
      if (!map[key]) map[key] = { name: label.replace("Costo - ", ""), costo: 0, dep: 0, neto: 0, count: 0 };
      map[key].costo += a.costoInicial;
      map[key].dep += a.depAcumulada;
      map[key].neto += a.costoInicial - a.depAcumulada;
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.costo - a.costo);
  }, [assets]);

  const porArea = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      const key = a.area || "92";
      const label = AREA_DEST[key] || ("Área " + key);
      if (!map[key]) map[key] = { name: label, value: 0, count: 0 };
      map[key].value += a.costoInicial;
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [assets]);

  const depMensual = useMemo(() => {
    return MESES.map((m, i) => {
      const depFinanciera = assets.reduce((s, a) => {
        const d = calcDep(a, a.metodoFinanciero || "LR");
        return s + d.mensual;
      }, 0);
      const depTributaria = assets.reduce((s, a) => {
        const d = calcDep(a, a.metodoTributario || "LR");
        return s + d.mensual;
      }, 0);
      return { mes: m, financiera: depFinanciera, tributaria: depTributaria, diferencia: Math.abs(depFinanciera - depTributaria) };
    });
  }, [assets]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Activos" value={stats.total} color="indigo" />
        <StatCard label="Activos Vigentes" value={stats.activos} color="emerald" />
        <StatCard label="Costo Total" value={fmtShort(stats.costoTotal)} color="blue" />
        <StatCard label="Dep. Acumulada" value={fmtShort(stats.depTotal)} color="amber" />
        <StatCard label="Valor Neto" value={fmtShort(stats.netoTotal)} color="purple" />
        <StatCard label="% Depreciado" value={((stats.depTotal / (stats.costoTotal || 1)) * 100).toFixed(1) + "%"} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Costo vs Depreciación por Categoría">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porCuenta}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="costo" name="Costo" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dep" name="Dep. Acum." fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="neto" name="Valor Neto" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribución por Área">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={porArea} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => name.substring(0, 15) + " " + (percent * 100).toFixed(0) + "%"}>
                {porArea.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Depreciación Mensual - Financiera vs Tributaria">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={depMensual}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Area type="monotone" dataKey="financiera" name="Dep. Financiera" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            <Area type="monotone" dataKey="tributaria" name="Dep. Tributaria" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            <Area type="monotone" dataKey="diferencia" name="Diferencia Temporal" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ASSETS VIEW - Vista de activos con tabla y filtros
   ═══════════════════════════════════════════════════ */
function AssetsView({ assets, setAssets }) {
  const [search, setSearch] = useState("");
  const [filterCta, setFilterCta] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [sortField, setSortField] = useState("codigo");
  const [sortDir, setSortDir] = useState("asc");
  const [editModal, setEditModal] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = useMemo(() => {
    let list = [...assets];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.descripcion.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q));
    }
    if (filterCta) list = list.filter(a => a.cuenta === filterCta);
    if (filterArea) list = list.filter(a => a.area === filterArea);
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [assets, search, filterCta, filterArea, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortHeader = ({ field, label }) => (
    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600" onClick={() => toggleSort(field)}>
      {label} {sortField === field ? (sortDir === "asc" ? "\u2191" : "\u2193") : ""}
    </th>
  );

  const handleEdit = (asset) => setEditModal({ ...asset });

  const saveEdit = () => {
    if (!editModal) return;
    setAssets(prev => prev.map(a => a.id === editModal.id ? { ...editModal, valorNeto: editModal.costoInicial - editModal.depAcumulada } : a));
    setEditModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <input type="text" placeholder="Buscar por codigo o descripcion..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
        </div>
        <select value={filterCta} onChange={e => { setFilterCta(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
          <option value="">Todas las cuentas</option>
          {CTA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
          <option value="">Todas las areas</option>
          {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} activos</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <SortHeader field="codigo" label="Codigo" />
                <SortHeader field="descripcion" label="Descripcion" />
                <SortHeader field="cuenta" label="Cuenta" />
                <SortHeader field="costoInicial" label="Costo" />
                <SortHeader field="depAcumulada" label="Dep. Acum." />
                <SortHeader field="valorNeto" label="Valor Neto" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metodo</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-indigo-600">{a.codigo}</td>
                  <td className="px-3 py-2 max-w-[250px] truncate">{a.descripcion}</td>
                  <td className="px-3 py-2 text-xs">{PCGE[a.cuenta]?.replace("Costo - ","") || a.cuenta}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(a.costoInicial)}</td>
                  <td className="px-3 py-2 text-right font-mono text-amber-600">{fmt(a.depAcumulada)}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600">{fmt(a.valorNeto)}</td>
                  <td className="px-3 py-2 text-xs">{metodoLabel(a.metodoFinanciero)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleEdit(a)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:opacity-50">Anterior</button>
            <span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-sm rounded-lg border border-gray-300 disabled:opacity-50">Siguiente</button>
          </div>
        )}
      </Card>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Editar Activo" wide>
        {editModal && (
          <div className="space-y-3">
            <FieldRow label="Codigo"><input className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.codigo} onChange={e => setEditModal({...editModal, codigo: e.target.value})} /></FieldRow>
            <FieldRow label="Descripcion"><input className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.descripcion} onChange={e => setEditModal({...editModal, descripcion: e.target.value})} /></FieldRow>
            <FieldRow label="Costo Inicial"><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.costoInicial} onChange={e => setEditModal({...editModal, costoInicial: parseFloat(e.target.value)||0})} /></FieldRow>
            <FieldRow label="Dep. Acumulada"><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.depAcumulada} onChange={e => setEditModal({...editModal, depAcumulada: parseFloat(e.target.value)||0})} /></FieldRow>
            <FieldRow label="Vida Util"><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.vidaUtilAnios} onChange={e => setEditModal({...editModal, vidaUtilAnios: parseInt(e.target.value)||0})} /></FieldRow>
            <FieldRow label="Metodo Financiero">
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.metodoFinanciero} onChange={e => setEditModal({...editModal, metodoFinanciero: e.target.value})}>
                <option value="LR">Linea Recta</option><option value="SDD">Doble Saldo Decreciente</option>
                <option value="SYD">Suma Anios Digitos</option><option value="UPR">Unidades Producidas</option>
              </select>
            </FieldRow>
            <FieldRow label="Metodo Tributario">
              <select className="w-full px-3 py-2 border rounded-lg text-sm" value={editModal.metodoTributario} onChange={e => setEditModal({...editModal, metodoTributario: e.target.value})}>
                <option value="LR">Linea Recta</option><option value="SDD">Doble Saldo Decreciente</option>
                <option value="SYD">Suma Anios Digitos</option><option value="UPR">Unidades Producidas</option>
              </select>
            </FieldRow>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={saveEdit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Guardar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROJECTION - Proyeccion de depreciacion
   ═══════════════════════════════════════════════════ */
function Projection({ assets, anioSel }) {
  const [metodoSel, setMetodoSel] = useState("LR");
  const [viewMode, setViewMode] = useState("chart");

  const proyeccion = useMemo(() => {
    const anios = [];
    for (let y = 0; y < 10; y++) {
      const anio = anioSel + y;
      let depAnual = 0;
      let costoAcum = 0;
      let depAcum = 0;

      assets.forEach(a => {
        const dep = calcDep(a, metodoSel);
        const aniosTranscurridos = anio - new Date(a.fechaAdquisicion).getFullYear();
        if (aniosTranscurridos >= 0 && aniosTranscurridos < (a.vidaUtilAnios || 10)) {
          depAnual += dep.anual;
        }
        costoAcum += a.costoInicial;
        const depHasta = Math.min(dep.anual * Math.max(0, aniosTranscurridos + 1), a.costoInicial - a.valorResidual);
        depAcum += depHasta;
      });

      anios.push({
        anio: anio.toString(),
        depAnual,
        depAcumulada: depAcum,
        valorNeto: costoAcum - depAcum,
        costoTotal: costoAcum
      });
    }
    return anios;
  }, [assets, anioSel, metodoSel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Metodo:</span>
        {["LR","SDD","SYD"].map(m => (
          <TabBtn key={m} label={metodoLabel(m)} active={metodoSel===m} onClick={()=>setMetodoSel(m)} />
        ))}
        <div className="flex-1" />
        <TabBtn label="Grafico" active={viewMode==="chart"} onClick={()=>setViewMode("chart")} icon="\ud83d\udcca" />
        <TabBtn label="Tabla" active={viewMode==="table"} onClick={()=>setViewMode("table")} icon="\ud83d\udccb" />
      </div>

      {viewMode === "chart" ? (
        <Card title={"Proyeccion 10 anios - " + metodoLabel(metodoSel)}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={proyeccion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="anio" tick={{fontSize:11}} />
              <YAxis tickFormatter={fmtShort} tick={{fontSize:11}} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="depAnual" name="Dep. Anual" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="valorNeto" name="Valor Neto" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Anio</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Dep. Anual</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Dep. Acumulada</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor Neto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proyeccion.map(p => (
                <tr key={p.anio} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{p.anio}</td>
                  <td className="px-4 py-2 text-right font-mono">{fmt(p.depAnual)}</td>
                  <td className="px-4 py-2 text-right font-mono text-amber-600">{fmt(p.depAcumulada)}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-600">{fmt(p.valorNeto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   JOURNAL ENTRIES - Asientos contables
   ═══════════════════════════════════════════════════ */
function JournalEntries({ assets, anioSel }) {
  const [mesSel, setMesSel] = useState(0);
  const [tipoDep, setTipoDep] = useState("financiera");

  const asientos = useMemo(() => {
    const entries = [];
    const agrupado = {};

    assets.forEach(a => {
      const metodo = tipoDep === "financiera" ? a.metodoFinanciero : a.metodoTributario;
      const dep = calcDep(a, metodo || "LR");
      if (dep.mensual <= 0) return;

      const ctaGasto = a.cuenta?.replace("33","681").replace("11","4") || "68145";
      const ctaAcum = a.cuenta?.replace("33","391").replace("11","3") || "39135";
      const areaKey = a.area || "92";

      const key = ctaGasto + "|" + ctaAcum + "|" + areaKey;
      if (!agrupado[key]) agrupado[key] = { ctaGasto, ctaAcum, area: areaKey, debe: 0, haber: 0, items: [] };
      agrupado[key].debe += dep.mensual;
      agrupado[key].haber += dep.mensual;
      agrupado[key].items.push({ codigo: a.codigo, desc: a.descripcion, monto: dep.mensual });
    });

    Object.values(agrupado).forEach(g => {
      entries.push({
        tipo: "gasto",
        cuenta: g.ctaGasto,
        descripcion: PCGE[g.ctaGasto] || ("Gasto dep. " + g.ctaGasto),
        debe: g.debe,
        haber: 0,
        area: g.area,
        items: g.items
      });
      entries.push({
        tipo: "acumulada",
        cuenta: g.ctaAcum,
        descripcion: PCGE[g.ctaAcum] || ("Dep. acum. " + g.ctaAcum),
        debe: 0,
        haber: g.haber,
        area: g.area,
        items: g.items
      });
    });

    // Asiento de destino
    const porArea = {};
    entries.filter(e => e.tipo === "gasto").forEach(e => {
      if (!porArea[e.area]) porArea[e.area] = 0;
      porArea[e.area] += e.debe;
    });

    const destEntries = [];
    let totalDest = 0;
    Object.entries(porArea).forEach(([area, monto]) => {
      destEntries.push({
        tipo: "destino",
        cuenta: area,
        descripcion: AREA_DEST[area] || ("Area " + area),
        debe: monto,
        haber: 0,
        area
      });
      totalDest += monto;
    });
    destEntries.push({
      tipo: "destino_cr",
      cuenta: "79",
      descripcion: AREA_DEST["79"] || "Cargas imputables",
      debe: 0,
      haber: totalDest,
      area: "79"
    });

    return { asientoNat: entries, asientoDest: destEntries, totalDebe: entries.filter(e=>e.tipo==="gasto").reduce((s,e)=>s+e.debe,0) };
  }, [assets, tipoDep]);

  const mesLabel = MESES_FULL ? MESES_FULL[mesSel] : MESES[mesSel];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Mes:</span>
        <select value={mesSel} onChange={e => setMesSel(+e.target.value)} className="px-3 py-2 border rounded-xl text-sm">
          {MESES.map((m, i) => <option key={i} value={i}>{m} {anioSel}</option>)}
        </select>
        <TabBtn label="Financiera" active={tipoDep==="financiera"} onClick={()=>setTipoDep("financiera")} />
        <TabBtn label="Tributaria" active={tipoDep==="tributaria"} onClick={()=>setTipoDep("tributaria")} />
      </div>

      <Card title={"Asiento por Naturaleza - " + mesLabel + " " + anioSel}>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cuenta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debe</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Haber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {asientos.asientoNat.map((e, i) => (
              <tr key={i} className={e.tipo === "acumulada" ? "bg-gray-50" : ""}>
                <td className="px-4 py-2 font-mono text-xs">{e.cuenta}</td>
                <td className="px-4 py-2">{e.descripcion}</td>
                <td className="px-4 py-2 text-right font-mono">{e.debe > 0 ? fmt(e.debe) : ""}</td>
                <td className="px-4 py-2 text-right font-mono">{e.haber > 0 ? fmt(e.haber) : ""}</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-gray-300">
              <td colSpan={2} className="px-4 py-2">TOTAL</td>
              <td className="px-4 py-2 text-right font-mono">{fmt(asientos.totalDebe)}</td>
              <td className="px-4 py-2 text-right font-mono">{fmt(asientos.totalDebe)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Card title={"Asiento por Destino - " + mesLabel + " " + anioSel}>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cuenta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Debe</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Haber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {asientos.asientoDest.map((e, i) => (
              <tr key={i} className={e.tipo === "destino_cr" ? "bg-gray-50" : ""}>
                <td className="px-4 py-2 font-mono text-xs">{e.cuenta}</td>
                <td className="px-4 py-2">{e.descripcion}</td>
                <td className="px-4 py-2 text-right font-mono">{e.debe > 0 ? fmt(e.debe) : ""}</td>
                <td className="px-4 py-2 text-right font-mono">{e.haber > 0 ? fmt(e.haber) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPARATIVE - Comparativo Financiero vs Tributario
   ═══════════════════════════════════════════════════ */
function Comparative({ assets }) {
  const data = useMemo(() => {
    return assets.slice(0, 20).map(a => {
      const depFin = calcDep(a, a.metodoFinanciero || "LR");
      const depTrib = calcDep(a, a.metodoTributario || "LR");
      return {
        codigo: a.codigo,
        descripcion: a.descripcion.substring(0, 30),
        depFinanciera: depFin.anual,
        depTributaria: depTrib.anual,
        diferencia: depFin.anual - depTrib.anual,
        tipoPartida: depFin.anual > depTrib.anual ? "Imponible" : depFin.anual < depTrib.anual ? "Deducible" : "Sin diferencia"
      };
    });
  }, [assets]);

  const totales = useMemo(() => {
    const totalFin = assets.reduce((s, a) => s + calcDep(a, a.metodoFinanciero || "LR").anual, 0);
    const totalTrib = assets.reduce((s, a) => s + calcDep(a, a.metodoTributario || "LR").anual, 0);
    return { financiera: totalFin, tributaria: totalTrib, diferencia: totalFin - totalTrib };
  }, [assets]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Dep. Financiera Anual" value={fmtShort(totales.financiera)} color="indigo" />
        <StatCard label="Dep. Tributaria Anual" value={fmtShort(totales.tributaria)} color="amber" />
        <StatCard label="Diferencia Temporal" value={fmtShort(totales.diferencia)} sub={totales.diferencia > 0 ? "Partida Temporal Imponible" : "Partida Temporal Deducible"} color="rose" />
      </div>

      <Card title="Comparativo por Activo (primeros 20)">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tickFormatter={fmtShort} tick={{fontSize:11}} />
            <YAxis dataKey="codigo" type="category" tick={{fontSize:10}} width={80} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Bar dataKey="depFinanciera" name="Financiera" fill="#6366f1" radius={[0,4,4,0]} />
            <Bar dataKey="depTributaria" name="Tributaria" fill="#f59e0b" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Codigo</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Dep. Financiera</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Dep. Tributaria</th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Diferencia</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo Partida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(d => (
              <tr key={d.codigo} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-indigo-600">{d.codigo}</td>
                <td className="px-3 py-2">{d.descripcion}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt(d.depFinanciera)}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt(d.depTributaria)}</td>
                <td className={"px-3 py-2 text-right font-mono " + (d.diferencia > 0 ? "text-rose-600" : d.diferencia < 0 ? "text-emerald-600" : "")}>{fmt(d.diferencia)}</td>
                <td className="px-3 py-2 text-xs">
                  <span className={"px-2 py-1 rounded-full text-xs " + (d.tipoPartida === "Imponible" ? "bg-rose-100 text-rose-700" : d.tipoPartida === "Deducible" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700")}>{d.tipoPartida}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REVALUATION - Revaluacion de activos
   ═══════════════════════════════════════════════════ */
function Revaluation({ assets, setAssets }) {
  const [selAsset, setSelAsset] = useState(null);
  const [nuevoValor, setNuevoValor] = useState("");
  const [motivo, setMotivo] = useState("");

  const handleRevalue = () => {
    if (!selAsset || !nuevoValor) return;
    const nv = parseFloat(nuevoValor);
    if (isNaN(nv) || nv <= 0) return;

    setAssets(prev => prev.map(a => {
      if (a.id !== selAsset.id) return a;
      const excedente = nv - a.costoInicial;
      return {
        ...a,
        costoInicial: nv,
        valorNeto: nv - a.depAcumulada,
        revaluacion: { fecha: new Date().toISOString().split("T")[0], valorAnterior: a.costoInicial, valorNuevo: nv, excedente, motivo }
      };
    }));
    setSelAsset(null);
    setNuevoValor("");
    setMotivo("");
  };

  const revaluados = assets.filter(a => a.revaluacion);

  return (
    <div className="space-y-4">
      <Card title="Revaluar Activo">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Seleccionar Activo</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={selAsset?.id || ""} onChange={e => {
              const a = assets.find(x => x.id === +e.target.value);
              setSelAsset(a || null);
              if (a) setNuevoValor(a.costoInicial.toString());
            }}>
              <option value="">-- Seleccionar --</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.codigo} - {a.descripcion}</option>)}
            </select>
          </div>
          {selAsset && (
            <>
              <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 rounded-lg p-3">
                <div><span className="text-gray-500">Costo actual:</span><br/><strong>{fmt(selAsset.costoInicial)}</strong></div>
                <div><span className="text-gray-500">Dep. acumulada:</span><br/><strong>{fmt(selAsset.depAcumulada)}</strong></div>
                <div><span className="text-gray-500">Valor neto:</span><br/><strong>{fmt(selAsset.valorNeto)}</strong></div>
              </div>
              <FieldRow label="Nuevo Valor">
                <input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={nuevoValor} onChange={e => setNuevoValor(e.target.value)} />
              </FieldRow>
              <FieldRow label="Motivo">
                <input className="w-full px-3 py-2 border rounded-lg text-sm" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Tasacion, ajuste por inflacion, etc." />
              </FieldRow>
              {nuevoValor && (
                <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                  <strong>Excedente de revaluacion:</strong> {fmt(parseFloat(nuevoValor) - selAsset.costoInicial)}
                </div>
              )}
              <button onClick={handleRevalue} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Aplicar Revaluacion</button>
            </>
          )}
        </div>
      </Card>

      {revaluados.length > 0 && (
        <Card title="Historial de Revaluaciones">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Codigo</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descripcion</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor Anterior</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor Nuevo</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Excedente</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {revaluados.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-indigo-600">{a.codigo}</td>
                  <td className="px-3 py-2">{a.descripcion.substring(0,30)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(a.revaluacion.valorAnterior)}</td>
                  <td className="px-3 py-2 text-right font-mono text-indigo-600">{fmt(a.revaluacion.valorNuevo)}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600">{fmt(a.revaluacion.excedente)}</td>
                  <td className="px-3 py-2 text-xs">{a.revaluacion.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MANAGE DATA - Gestion de datos
   ═══════════════════════════════════════════════════ */
function ManageData({ assets, setAssets, resetData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newAsset, setNewAsset] = useState({
    codigo: "", descripcion: "", cuenta: "33611", area: "92",
    costoInicial: 0, valorResidual: 0, depAcumulada: 0, vidaUtilAnios: 10,
    tasa: 10, fechaAdquisicion: "2024-01-01", metodoFinanciero: "LR", metodoTributario: "LR"
  });

  const handleAdd = () => {
    const id = Math.max(0, ...assets.map(a => a.id)) + 1;
    const asset = {
      ...newAsset,
      id,
      codigo: newAsset.codigo || ("AF-" + id.toString().padStart(4, "0")),
      vidaUtilMeses: newAsset.vidaUtilAnios * 12,
      valorNeto: newAsset.costoInicial - newAsset.depAcumulada,
      estado: "Activo",
      unidadesTotal: null,
      unidadesAnio: null
    };
    setAssets(prev => [...prev, asset]);
    setShowAdd(false);
    setNewAsset({
      codigo: "", descripcion: "", cuenta: "33611", area: "92",
      costoInicial: 0, valorResidual: 0, depAcumulada: 0, vidaUtilAnios: 10,
      tasa: 10, fechaAdquisicion: "2024-01-01", metodoFinanciero: "LR", metodoTributario: "LR"
    });
  };

  const handleExport = () => {
    const csv = [
      ["CODIGO","DESCRIPCION","CUENTA CONTABLE","AREA","COSTO TOTAL","DEPRECIACION ACUMULADA","VIDA UTIL","TASA","FECHA ADQUISICION"].join(","),
      ...assets.map(a => [a.codigo, '"'+a.descripcion+'"', a.cuenta, a.area, a.costoInicial, a.depAcumulada, a.vidaUtilAnios, a.tasa, a.fechaAdquisicion].join(","))
    ].join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "activos_fijos.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">+ Agregar Activo</button>
        <button onClick={handleExport} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-200">Exportar CSV</button>
        <button onClick={resetData} className="px-4 py-2 bg-gray-600 text-white rounded-xl text-sm hover:bg-gray-700">Restaurar Datos Originales</button>
      </div>

      <Card title={"Resumen: " + assets.length + " activos registrados"}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-indigo-50 rounded-lg p-3">
            <span className="text-gray-500">Costo Total</span><br/>
            <strong className="text-lg">{fmtShort(assets.reduce((s,a) => s + a.costoInicial, 0))}</strong>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <span className="text-gray-500">Dep. Total</span><br/>
            <strong className="text-lg">{fmtShort(assets.reduce((s,a) => s + a.depAcumulada, 0))}</strong>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <span className="text-gray-500">Valor Neto Total</span><br/>
            <strong className="text-lg">{fmtShort(assets.reduce((s,a) => s + a.valorNeto, 0))}</strong>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <span className="text-gray-500">Activos Activos</span><br/>
            <strong className="text-lg">{assets.filter(a => a.estado === "Activo").length}</strong>
          </div>
        </div>
      </Card>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar Nuevo Activo" wide>
        <div className="space-y-3">
          <FieldRow label="Codigo"><input className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.codigo} onChange={e => setNewAsset({...newAsset, codigo: e.target.value})} placeholder="AF-0000" /></FieldRow>
          <FieldRow label="Descripcion"><input className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.descripcion} onChange={e => setNewAsset({...newAsset, descripcion: e.target.value})} /></FieldRow>
          <FieldRow label="Cuenta Contable">
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.cuenta} onChange={e => setNewAsset({...newAsset, cuenta: e.target.value})}>
              {CTA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Area">
            <select className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.area} onChange={e => setNewAsset({...newAsset, area: e.target.value})}>
              {AREA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FieldRow>
          <FieldRow label="Costo Inicial"><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.costoInicial} onChange={e => setNewAsset({...newAsset, costoInicial: parseFloat(e.target.value)||0})} /></FieldRow>
          <FieldRow label="Vida Util (anios)"><input type="number" className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.vidaUtilAnios} onChange={e => setNewAsset({...newAsset, vidaUtilAnios: parseInt(e.target.value)||0})} /></FieldRow>
          <FieldRow label="Fecha Adquisicion"><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={newAsset.fechaAdquisicion} onChange={e => setNewAsset({...newAsset, fechaAdquisicion: e.target.value})} /></FieldRow>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Agregar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   APP - Componente principal
   ═══════════════════════════════════════════════════ */
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "\ud83d\udcca" },
  { id: "assets", label: "Activos", icon: "\ud83c\udfe2" },
  { id: "projection", label: "Proyeccion", icon: "\ud83d\udcc8" },
  { id: "journal", label: "Asientos", icon: "\ud83d\udcd2" },
  { id: "comparative", label: "Comparativo", icon: "\u2696\ufe0f" },
  { id: "revaluation", label: "Revaluacion", icon: "\ud83d\udcb0" },
  { id: "manage", label: "Gestion", icon: "\u2699\ufe0f" }
];

export default function App() {
  const [tab, setTab] = useStorage("app_tab", "dashboard");
  const [anioSel, setAnioSel] = useStorage("app_anio", new Date().getFullYear());

  const baseAssets = useMemo(() => buildBaseAssets(RAW), []);
  const [assets, setAssets] = useStorage("app_assets", baseAssets);

  const resetData = useCallback(() => {
    const fresh = buildBaseAssets(RAW);
    setAssets(fresh);
  }, [setAssets]);

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return <Dashboard assets={assets} anioSel={anioSel} />;
      case "assets": return <AssetsView assets={assets} setAssets={setAssets} />;
      case "projection": return <Projection assets={assets} anioSel={anioSel} />;
      case "journal": return <JournalEntries assets={assets} anioSel={anioSel} />;
      case "comparative": return <Comparative assets={assets} />;
      case "revaluation": return <Revaluation assets={assets} setAssets={setAssets} />;
      case "manage": return <ManageData assets={assets} setAssets={setAssets} resetData={resetData} />;
      default: return <Dashboard assets={assets} anioSel={anioSel} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sistema de Control de Activos Fijos</h1>
              <p className="text-xs text-gray-500">Depreciacion Financiera y Tributaria</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Anio:</label>
              <select value={anioSel} onChange={e => setAnioSel(+e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                {Array.from({length:10}, (_,i) => 2020+i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <TabBtn key={t.id} label={t.label} icon={t.icon} active={tab === t.id} onClick={() => setTab(t.id)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderTab()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          Sistema de Control de Activos Fijos &copy; {new Date().getFullYear()} | React + Recharts + TailwindCSS
        </div>
      </footer>
    </div>
  );
}
