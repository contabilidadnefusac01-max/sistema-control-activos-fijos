# Sistema de Control de Activos Fijos

## Depreciacion Financiera y Tributaria

Aplicacion web desarrollada con **React + Recharts + TailwindCSS** para la gestion integral de activos fijos, calculo de depreciacion financiera y tributaria, y generacion de asientos contables.

### Funcionalidades

- **Dashboard**: Resumen visual con graficos de costo, depreciacion y distribucion por area
- **Activos**: Vista tabular con busqueda, filtros por cuenta/area, ordenamiento y edicion
- **Proyeccion**: Proyeccion a 10 anios con multiples metodos de depreciacion (Linea Recta, Doble Saldo Decreciente, Suma de Anios Digitos)
- **Asientos Contables**: Generacion automatica de asientos por naturaleza y destino (PCGE)
- **Comparativo**: Analisis de diferencias temporales entre depreciacion financiera y tributaria (NIC 12)
- **Revaluacion**: Modulo para revaluar activos segun NIC 16
- **Gestion de Datos**: Agregar activos, exportar CSV, restaurar datos originales

### Metodos de Depreciacion

- Linea Recta (LR)
- Doble Saldo Decreciente (SDD)
- Suma de Anios Digitos (SYD)
- Unidades Producidas (UPR)

### Instalacion

\`\`\`bash
# Clonar repositorio
git clone https://github.com/contabilidadnefusac01-max/sistema-control-activos-fijos.git
cd sistema-control-activos-fijos

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
\`\`\`

### Estructura del Proyecto

\`\`\`
src/
  App.jsx          # Componente principal con todas las paginas
  components.jsx   # Componentes UI reutilizables
  constants.js     # Constantes del sistema (PCGE, areas, cuentas)
  data.js          # Datos de activos fijos
  utils.js         # Utilidades (formateadores, storage, calculo depreciacion)
  index.js         # Punto de entrada React
public/
  index.html       # HTML con TailwindCSS CDN
\`\`\`

### Tecnologias

- React 18
- Recharts (graficos)
- TailwindCSS (estilos)
- LocalStorage (persistencia de datos)

### Normas Contables

- NIC 16: Propiedad, Planta y Equipo
- NIC 12: Impuesto a las Ganancias (diferencias temporales)
- PCGE: Plan Contable General Empresarial
