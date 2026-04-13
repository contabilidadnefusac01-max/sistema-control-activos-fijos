// utils.js - Utilidades y helpers de almacenamiento
import { useState, useEffect } from "react";

/* ── Formateadores ── */
export const fmt = v => v == null ? "-" : v.toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2});
export const fmtShort = v => {
  if(v==null) return "-";
  if(Math.abs(v)>=1e6) return (v/1e6).toFixed(1)+"M";
  if(Math.abs(v)>=1e3) return (v/1e3).toFixed(1)+"K";
  return v.toFixed(0);
};

export const metodoLabel = m => {
  const map = {"LR":"Línea Recta","SDD":"Doble Saldo Decreciente","SYD":"Suma Años Dígitos","UPR":"Unidades Producidas"};
  return map[m]||m;
};

/* ── Storage helpers ── */
const ST = {
  get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; }},
  set(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
};

export { ST };

export function useStorage(key, initial){
  const [val,setVal] = useState(()=> ST.get(key, initial));
  useEffect(()=>{ ST.set(key, val); },[key, val]);
  return [val, setVal];
}

/* ── Cálculo de depreciación ── */
export function calcDep(asset, metodo){
  const {costoInicial, valorResidual, vidaUtilAnios, vidaUtilMeses, unidadesTotal, unidadesAnio, fechaAdquisicion} = asset;
  const base = costoInicial - valorResidual;
  const vida = vidaUtilAnios || (vidaUtilMeses ? vidaUtilMeses/12 : 0);
  if(!vida || vida<=0 || base<=0) return {anual:0, mensual:0, tasa:0};

  let anual = 0;
  switch(metodo){
    case "LR": anual = base / vida; break;
    case "SDD": anual = (2/vida) * costoInicial; break;
    case "SYD": {
      const n = Math.ceil(vida);
      const sum = n*(n+1)/2;
      anual = (n/sum)*base;
      break;
    }
    case "UPR": {
      if(unidadesTotal && unidadesAnio) anual = (unidadesAnio/unidadesTotal)*base;
      break;
    }
    default: anual = base / vida;
  }
  const tasa = costoInicial > 0 ? (anual/costoInicial)*100 : 0;
  return {anual: Math.min(anual, base), mensual: anual/12, tasa};
}

/* ── Build base assets desde RAW ── */
export function buildBaseAssets(RAW){
  return RAW.map((r,i)=>{
    const costo = parseFloat(r["COSTO TOTAL"])||0;
    const depAcum = parseFloat(r["DEPRECIACION ACUMULADA"])||0;
    const vidaUtil = parseInt(r["VIDA UTIL"])||10;
    const tasa = parseFloat(r["TASA"])||10;
    const area = r["AREA"]||"";
    const cta = r["CUENTA CONTABLE"]||"33611";
    const fecha = r["FECHA ADQUISICION"]||"2020-01-01";
    const desc = r["DESCRIPCION"]||("Activo "+(i+1));
    const codigo = r["CODIGO"]||("AF-"+(i+1).toString().padStart(4,"0"));

    return {
      id: i+1,
      codigo,
      descripcion: desc,
      cuenta: cta,
      area: area,
      costoInicial: costo,
      valorResidual: 0,
      depAcumulada: depAcum,
      valorNeto: costo - depAcum,
      vidaUtilAnios: vidaUtil,
      vidaUtilMeses: vidaUtil*12,
      tasa,
      fechaAdquisicion: fecha,
      metodoFinanciero: "LR",
      metodoTributario: "LR",
      estado: "Activo",
      unidadesTotal: null,
      unidadesAnio: null
    };
  });
}
