# Plan de Mejoras Frontend - AMAROT Perú

## Resumen
Este documento describe las mejoras planificadas para elevar la calidad visual y UX del sitio web de AMAROT Perú.

---

## Fase 1: Tipografía
**Estado:** Completado
**Prioridad:** Alta
**Fecha:** 2025-12-27

### Cambios:
- [x] Reemplazar Montserrat por **Barlow Condensed** para títulos (más industrial/robusta)
- [x] Mantener Open Sans para cuerpo de texto
- [x] Ajustar pesos y tamaños para mejor jerarquía visual
- [x] Tamaños tipográficos responsive con `clamp()`
- [x] Texto en mayúsculas con letter-spacing para títulos

### Archivos modificados:
- `src/app/layout.tsx` (importar nuevas fuentes)
- `src/app/globals.css` (actualizar variables de fuente)

---

## Fase 2: Hero Section
**Estado:** Completado
**Prioridad:** Alta
**Fecha:** 2025-12-27

### Cambios:
- [x] Headline más corto y potente ("PERFORACIÓN DE PRECISIÓN")
- [x] Agregar subtítulo con propuesta de valor
- [x] Implementar animaciones escalonadas (staggered) con delays
- [x] Agregar indicador de scroll animado ("EXPLORAR")
- [x] Mejorar transiciones del carrusel (Ken Burns effect)
- [x] Badge con "+20 años de experiencia" y punto pulsante
- [x] Dos CTAs: Solicitar Cotización + Descargar Brochure
- [x] Indicadores de slide verticales en desktop
- [x] Hero fullscreen con `100svh`

### Archivos modificados:
- `src/components/HeroCarousel.tsx`
- `src/app/globals.css`

---

## Fase 3: Animaciones Scroll-Triggered
**Estado:** Completado
**Prioridad:** Media
**Fecha:** 2025-12-27

### Cambios:
- [x] Crear hook personalizado `useScrollAnimation`
- [x] Implementar Intersection Observer
- [x] Animar secciones al entrar en viewport
- [x] Efecto de fade-up con stagger para elementos en grid
- [x] Componente `AnimatedSection` reutilizable
- [x] Componente `AnimatedGrid` para elementos con stagger
- [x] Animaciones: fade-up, fade-in, fade-left, fade-right, scale

### Archivos creados/modificados:
- `src/hooks/useScrollAnimation.ts` (nuevo)
- `src/components/AnimatedSection.tsx` (nuevo)
- `src/app/(public)/page.tsx`

---

## Fase 4: Tarjetas de Servicios
**Estado:** Completado
**Prioridad:** Media
**Fecha:** 2025-12-27

### Cambios:
- [x] Agregar íconos SVG personalizados para cada servicio
- [x] Mejorar efecto hover (revelar botón, zoom en imagen)
- [x] Agregar línea decorativa animada
- [x] Implementar animación de entrada (ya incluida en Fase 3)
- [x] Ícono aparece en círculo blanco al hacer hover
- [x] Overlay oscuro en la imagen al hacer hover
- [x] Botón "Ver más" que se revela al hacer hover

### Archivos modificados:
- `src/app/(public)/page.tsx`
- `public/icons/perforacion.svg` (nuevo)
- `public/icons/cortafuegos.svg` (nuevo)
- `public/icons/anclajes.svg` (nuevo)
- `public/icons/deteccion.svg` (nuevo)

---

## Fase 5: Sección de Estadísticas
**Estado:** Completado
**Prioridad:** Media
**Fecha:** 2025-12-27

### Cambios:
- [x] Crear nueva sección con números destacados
- [x] Implementar animación de contador (se activa al hacer scroll)
- [x] Diseño con fondo distintivo (gradiente azul con patrón geométrico)
- [x] Líneas decorativas rojas en hover
- [x] Título "NUESTRA TRAYECTORIA" con subtítulo

### Datos mostrados:
- 20+ Años de Experiencia
- 500+ Proyectos Completados
- 50+ Clientes Satisfechos
- 100% Equipos Hilti

### Archivos creados/modificados:
- `src/components/StatsSection.tsx` (nuevo)
- `src/app/(public)/page.tsx`

---

## Fase 6: Carrusel de Clientes
**Estado:** Completado
**Prioridad:** Baja
**Fecha:** 2025-12-27

### Cambios:
- [x] Nuevos logos (10): Alicorp, Cissac, Hilti, Alsud, Horoton, JJC, V&V Bravo, Mega Estructuras, Pentatech, Ransa
- [x] Convertir logos a escala de grises por defecto
- [x] Efecto hover para mostrar logo a color + escala
- [x] Agregar fade en los bordes del carrusel
- [x] Ajustar velocidad de animación (35s, más lenta)
- [x] Logos más grandes (h-20 w-36)

### Archivos modificados:
- `src/app/(public)/page.tsx`
- `src/app/globals.css`
- `public/images/clients/` (10 logos nuevos)

---

## Fase 7: Footer Rediseñado
**Estado:** Completado
**Prioridad:** Baja
**Fecha:** 2025-12-28

### Cambios:
- [x] Fondo oscuro (#0f172a) con gradiente sutil
- [x] Línea decorativa roja superior
- [x] Ubicación general (Pueblo Libre, Lima) - sin dirección exacta por seguridad
- [x] Sin mapa de ubicación (decisión del cliente)
- [x] Sin redes sociales (cliente no tiene por ahora)
- [x] Año de copyright dinámico
- [x] Iconos con fondo en cuadros rojos semitransparentes
- [x] Badge de "+20 años de experiencia"
- [x] Logo Hilti en el pie de página
- [x] Mejor espaciado y organización

### Archivos modificados:
- `src/components/Footer.tsx`

---

## Notas Técnicas

### Dependencias sugeridas:
```bash
# Para animaciones avanzadas (opcional)
npm install framer-motion

# Para íconos
npm install lucide-react
```

### Colores de marca:
```css
--amarot-red: #DC2626;
--amarot-red-dark: #B91C1C;
--amarot-blue: #1E3A8A;
--amarot-blue-light: #3B82F6;
```

---

## Progreso

| Fase | Estado | Fecha Completado |
|------|--------|------------------|
| 1. Tipografía | ✅ Completado | 2025-12-27 |
| 2. Hero Section | ✅ Completado | 2025-12-27 |
| 3. Animaciones | ✅ Completado | 2025-12-27 |
| 4. Servicios | ✅ Completado | 2025-12-27 |
| 5. Estadísticas | ✅ Completado | 2025-12-27 |
| 6. Clientes | ✅ Completado | 2025-12-27 |
| 7. Footer | ✅ Completado | 2025-12-28 |
