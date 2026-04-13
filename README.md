# Sistema de Control de Activos Fijos

## Depreciación Financiera y Tributaria

Aplicación web desarrollada con **React + Vite + Recharts + TailwindCSS** para la gestión integral de activos fijos, cálculo de depreciación financiera y tributaria, y generación de asientos contables.

## Funcionalidades

- **Panel de control**: Resumen visual con gráficos de costo, depreciación y distribución por área.
- **Activos**: Vista tabular con búsqueda, filtros por cuenta/área, ordenamiento y edición.
- **Proyección**: Proyección a 10 años con múltiples métodos de depreciación (Línea Recta, Doble Saldo Decreciente, Suma de Años Dígitos).
- **Asientos Contables**: Generación automática de asientos por naturaleza y destino (PCGE).
- **Comparativo**: Análisis de diferencias temporales entre depreciación financiera y tributaria (NIC 12).
- **Revaluación**: Módulo para revaluar activos según NIC 16.
- **Gestión de Datos**: Agregar activos, exportar CSV, restaurar datos originales.

## Métodos de Depreciación

- Línea Recta (LR)
- Doble Saldo Decreciente (DSD)
- Suma de Años Dígitos (SYD)
- Unidades Producidas (UPR)

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/contabilidadnefusac01-max/sistema-control-activos-fijos.git
cd sistema-control-activos-fijos

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## Estructura del Proyecto

```
App.jsx                 # Componente principal (1,622 activos fijos)
index.html              # Punto de entrada HTML (Vite)
vite.config.js          # Configuración de Vite
tailwind.config.js      # Configuración de TailwindCSS
postcss.config.js       # Configuración de PostCSS
package.json            # Dependencias y scripts
src/
  main.jsx              # Punto de entrada de React
  index.css             # Estilos con Tailwind
```

## Tecnologías

- React 18
- Vite 5
- Recharts
- TailwindCSS 3

## Normas Contables

- NIC 16 - Propiedades, Planta y Equipo
- NIC 12 - Impuesto a las Ganancias
- Plan Contable General Empresarial (PCGE)
