// constants.js - Sistema de Control de Activos Fijos

export const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export const MESES_FULL = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export const PCGE = {
  "33111":"Costo - Terrenos",
  "33211":"Costo - Edificaciones",
  "33311":"Costo - Maq. y equipo de explotación",
  "33411":"Costo - Equipo de transporte",
  "33511":"Costo - Muebles y enseres",
  "33611":"Costo - Equipos diversos",
  "33711":"Costo - Herramientas y unidades de reemplazo",
  "33911":"Costo - Obras en curso",
  "39131":"Dep. acum. - Edificaciones",
  "39132":"Dep. acum. - Maq. y equipo de explotación",
  "39133":"Dep. acum. - Equipo de transporte",
  "39134":"Dep. acum. - Muebles y enseres",
  "39135":"Dep. acum. - Equipos diversos",
  "39136":"Dep. acum. - Herramientas",
  "68141":"Gasto dep. - Edificaciones",
  "68142":"Gasto dep. - Maq. y equipo de explotación",
  "68143":"Gasto dep. - Equipo de transporte",
  "68144":"Gasto dep. - Muebles y enseres",
  "68145":"Gasto dep. - Equipos diversos",
  "68146":"Gasto dep. - Herramientas"
};

export const AREA_DEST = {
  "90":"Costo de producción",
  "91":"Gastos de manufactura",
  "92":"Gastos de administración",
  "93":"Gastos de ventas",
  "94":"Gastos financieros",
  "95":"Gastos de servicios",
  "79":"Cargas imp. cta costos y gastos (CR)"
};

export const CTA_OPTIONS = Object.entries({
  "33111":"Terrenos","33211":"Edificaciones","33311":"Maq. y equipo",
  "33411":"Eq. transporte","33511":"Muebles y enseres","33611":"Equipos diversos",
  "33711":"Herramientas","33911":"Obras en curso"
}).map(([v,l])=>({value:v,label:v+" - "+l}));

export const AREA_OPTIONS = Object.entries({
  "90":"Costo producción","91":"Gastos manufactura","92":"Gastos administración",
  "93":"Gastos ventas","94":"Gastos financieros","95":"Gastos servicios"
}).map(([v,l])=>({value:v,label:v+" - "+l}));

export const COLORS = [
  "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4",
  "#84cc16","#e11d48","#7c3aed","#0ea5e9","#d946ef"
];
