# WIREFRAMES Y PROTOTIPOS - APP ASISTENTE PSICÓLOGOS
*Documento creado en Fase 0 - Diciembre 2025*

## 🎨 GUÍA DE DISEÑO Y PROTOTIPADO

Este documento proporciona las especificaciones detalladas para crear los prototipos en Figma, incluyendo layouts, flujos de usuario y componentes de la interfaz.

---

## 🎯 PRINCIPIOS DE DISEÑO

### Accesibilidad (WCAG 2.1 AA)
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande
- Navegación por teclado completa
- Lectores de pantalla compatibles
- Tamaños de toque mínimo 44px

### Psicología del color para contexto médico
```css
/* Paleta principal */
:root {
  --primary-calm: #2563eb;     /* Azul profesional tranquilo */
  --primary-trust: #1e40af;   /* Azul oscuro de confianza */
  --success-heal: #059669;    /* Verde sanación */
  --warning-attention: #d97706; /* Naranja atención */
  --danger-alert: #dc2626;    /* Rojo alertas */
  --neutral-professional: #64748b; /* Gris profesional */
  --background-soft: #f8fafc; /* Fondo suave */
  --text-primary: #0f172a;    /* Texto principal */
  --text-secondary: #475569;  /* Texto secundario */
}
```

### Tipografía profesional
```css
/* Fuente principal: Inter (legibilidad alta) */
--font-primary: 'Inter', sans-serif;
--font-secondary: 'Source Sans Pro', sans-serif;

/* Escalas tipográficas */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Design */
--screen-sm: 640px;   /* Móvil pequeño */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Desktop pequeño */
--screen-xl: 1280px;  /* Desktop grande */
--screen-2xl: 1536px; /* Pantallas ultra wide */
```

---

## 🏠 1. LANDING PAGE

### Estructura general
```
┌─────────────────────────────────────┐
│ HEADER [Logo] [Nav] [Login] [CTA]   │
├─────────────────────────────────────┤
│ HERO: Valor principal + CTA grande  │
├─────────────────────────────────────┤
│ CARACTERÍSTICAS: 3 columnas valor   │
├─────────────────────────────────────┤
│ PLANES: Comparativa Basic/Pro/Prem  │
├─────────────────────────────────────┤
│ TESTIMONIOS: Cards psicólogos       │
├─────────────────────────────────────┤
│ FAQ: Acordeón preguntas comunes     │
├─────────────────────────────────────┤
│ FOOTER: Links legales + contacto    │
└─────────────────────────────────────┘
```

### Hero Section (1400x600px)
```
┌─────────────────────────────────────┐
│  [Título Principal - h1, 48px]      │
│  "Potencia tu práctica psicológica  │
│   con IA responsable"               │
│                                     │
│  [Subtítulo - p, 20px]              │
│  "Transcripción, sugerencias y      │
│   informes automáticos que respetan │
│   tu criterio profesional"          │
│                                     │
│  [CTA Principal] [Demo Gratuito]    │ 
│  "Comenzar ahora"  "Ver demo"       │
│                                     │
│ ┌─────────────────┐                 │
│ │   [Imagen/Video │                 │
│ │    Dashboard]   │                 │
│ └─────────────────┘                 │
└─────────────────────────────────────┘
```

### Sección características (3 columnas)
```
┌─────────────────────────────────────┐
│ ┌───────────┐ ┌───────────┐ ┌──────┐│
│ │[Icono IA] │ │[Icono Seg]│ │[Icon]││
│ │           │ │           │ │      ││
│ │IA Ética   │ │ Seguridad │ │ Fácil││
│ │• No diag. │ │• GDPR/HIP │ │• Intui││
│ │• Sugiere  │ │• Cifrado  │ │• Rápid││
│ │• Aprende  │ │• Auditor  │ │• Prod ││
│ └───────────┘ └───────────┘ └──────┘│
└─────────────────────────────────────┘
```

### Comparativa de planes
```
┌─────────────────────────────────────┐
│           PLANES Y PRECIOS          │
├───────────┬───────────┬─────────────┤
│   BASIC   │    PRO    │  PREMIUM    │
│   €29/mes │  €59/mes  │  €99/mes    │
├───────────┼───────────┼─────────────┤
│ ✓ 25 clie │ ✓ Ilim.   │ ✓ Todo Pro  │
│ ✓ Inform  │ ✓ IA comp │ ✓ Simulador │
│ ❌ IA lim │ ✓ Sesion  │ ✓ API acces │
│ ❌ Sesion │ ✓ Analyt  │ ✓ Support   │
├───────────┼───────────┼─────────────┤
│[Elegir]   │[Popular]  │[Elegir]     │
└───────────┴───────────┴─────────────┘
```

---

## 🔐 2. AUTENTICACIÓN

### Login (400x500px centrado)
```
┌────────────────────────────────────┐
│ ┌───────────────────────────────┐  │
│ │         [Logo + Título]       │  │
│ │    "Acceso Profesionales"     │  │
│ │                               │  │
│ │ Email:    [_______________]   │  │
│ │ Password: [_______________]   │  │
│ │           ☐ Recordarme        │  │
│ │                               │  │
│ │ [Iniciar Sesión - Botón full] │  │
│ │                               │  │
│ │ ¿Olvidaste tu contraseña?     │  │
│ │                               │  │
│ │ ─────────── O ─────────────   │  │
│ │                               │  │
│ │ ¿No tienes cuenta?            │  │
│ │ [Registrarse]                 │  │
│ └───────────────────────────────┘  │
└────────────────────────────────────┘
```

### Registro (500x800px con pasos)
```
┌────────────────────────────────────┐
│ PASO 1/3: Información Personal    │
├────────────────────────────────────┤
│ Nombre:         [_____________]    │
│ Apellidos:      [_____________]    │
│ Email:          [_____________]    │
│ Teléfono:       [_____________]    │
│ País:           [Dropdown_____]    │
│                                    │
│ PASO 2/3: Información Profesional │
├────────────────────────────────────┤
│ Tipo:           ○ Psicólogo       │
│                 ○ Estudiante      │
│                                    │
│ Nº Colegiado:   [_____________]    │
│ Especialidad:   [Dropdown_____]    │
│                                    │
│ PASO 3/3: Plan y Contraseña       │
├────────────────────────────────────┤
│ Plan:           ○ Basic €29       │
│                 ● Pro €59         │
│                 ○ Premium €99     │
│                                    │
│ Contraseña:     [_____________]    │
│ Repetir:        [_____________]    │
│                                    │
│ ☐ Acepto términos y condiciones   │
│ ☐ Acepto política de privacidad   │
│                                    │
│ [Anterior] [Crear Cuenta]         │
└────────────────────────────────────┘
```

---

## 📊 3. DASHBOARD PRINCIPAL

### Layout general (1200px+)
```
┌─────────────────────────────────────────────────┐
│ [Logo] [Search] [Notifications] [User] [Plan]   │ Header 60px
├───┬─────────────────────────────────────────────┤
│   │ ┌─────────────┐ ┌─────────────┐ ┌───────── │ 
│ S │ │ Clientes    │ │ Sesiones    │ │ Informes │ Cards
│ I │ │     24      │ │     12      │ │     8    │ Stats
│ D │ └─────────────┘ └─────────────┘ └───────── │
│ E │                                              │
│ B │ ┌─────────────────────────────────────────┐ │
│ A │ │         ACTIVIDAD RECIENTE              │ │ Main
│ R │ │                                         │ │ Area
│   │ │ • Sesión con Ana García - Hace 2h       │ │
│ 2 │ │ • Informe completado - Hace 4h          │ │
│ 0 │ │ • Nuevo cliente registrado - Ayer       │ │
│ 0 │ └─────────────────────────────────────────┘ │
│   │                                              │
│   │ ┌─────────────────────────────────────────┐ │
│   │ │       SUGERENCIAS DE IA DIARIAS         │ │
│   │ │                                         │ │
│   │ │ 💡 3 clientes podrían beneficiarse de   │ │
│   │ │    técnicas de mindfulness              │ │
│   │ │                                         │ │
│   │ │ 📈 Tus sesiones han mejorado 15% en     │ │
│   │ │    engagement este mes                  │ │
│   │ └─────────────────────────────────────────┘ │
└───┴─────────────────────────────────────────────┘
```

### Sidebar dinámico según plan
```
┌─────────────────────┐
│ BASIC PLAN          │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 👥 Clientes (25)    │
│ 📋 Informes básicos │
│ ⚙️ Configuración    │
├─────────────────────┤
│ 🎯 MEJORA A PRO     │
│ • IA asistente      │
│ • Sesiones ilimit.  │
│ [Upgrade]           │
└─────────────────────┘

┌─────────────────────┐
│ PRO PLAN            │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 👥 Clientes         │
│ 🎙️ Sesiones en vivo │
│ 🤖 IA Asistente     │
│ 📋 Informes         │
│ 📊 Analytics        │
│ ⚙️ Configuración    │
├─────────────────────┤
│ 🎯 MEJORA A PREMIUM │
│ • Simulador         │
│ • API access        │
│ [Upgrade]           │
└─────────────────────┘
```

---

## 👥 4. GESTIÓN DE CLIENTES

### Vista lista (tabla responsive)
```
┌─────────────────────────────────────────────────────────────┐
│ CLIENTES [+Nuevo] [🔍 Buscar] [📊Filtros] [📤Exportar]     │
├─────────────────────────────────────────────────────────────┤
│ ☐ | Nombre        | Última sesión | Estado    | Acciones   │
├─┬─────────────────────────────────────────────────────────────┤
│☐│ Ana García M.   │ 2 dic 2025   │ 🟢 Activo │[Ver][Edit] │
│☐│ Carlos López R. │ 28 nov 2025  │ 🟡 Pausa  │[Ver][Edit] │
│☐│ María Sánchez   │ 15 nov 2025  │ 🟢 Activo │[Ver][Edit] │
│☐│ Juan Pérez     │ 10 nov 2025  │ 🔴 Alta   │[Ver][Edit] │
├─┴─────────────────────────────────────────────────────────────┤
│ Mostrando 4 de 24 clientes [1][2][3] [Siguiente]           │
└─────────────────────────────────────────────────────────────┘
```

### Panel lateral filtros
```
┌─────────────────────┐
│ FILTROS             │
├─────────────────────┤
│ Estado:             │
│ ☐ Activo            │
│ ☐ En pausa          │
│ ☐ Dado de alta      │
│                     │
│ Fecha última:       │
│ [___] - [___]       │
│                     │
│ Etiquetas:          │
│ #ansiedad   [x]     │
│ #depresión  [x]     │
│ #terapia-pareja [x] │
│                     │
│ Edad:               │
│ [__] - [__] años    │
│                     │
│ [Limpiar] [Aplicar] │
└─────────────────────┘
```

### Perfil cliente (modal/página)
```
┌─────────────────────────────────────────────────────────────┐
│ [← Volver] ANA GARCÍA MARTÍNEZ [Editar] [⚠️Eliminar]       │
├─────────────────────────────────────────────────────────────┤
│ INFORMACIÓN PERSONAL    │ HISTORIAL CLÍNICO               │
│ Edad: 34 años          │ Primera consulta: 15 sep 2025   │
│ Teléfono: +34 xxx      │ Motivo: Ansiedad generalizada   │
│ Email: ana@email.com   │ Objetivo: Manejo emocional      │
│ Ocupación: Profesora   │                                 │
│                        │ ETIQUETAS                       │
│ CONSENTIMIENTOS        │ #ansiedad #trabajo #mindfulness │
│ ✅ Grabación sesiones  │                                 │
│ ✅ Procesamiento IA    │ NOTAS PRIVADAS                  │
│ ✅ Datos básicos       │ [Área de texto libre...]        │
├─────────────────────────────────────────────────────────────┤
│ SESIONES RECIENTES                                          │
│ • 2 dic 2025 - Sesión #8 (45 min) - IA: Progreso positivo │
│ • 28 nov 2025 - Sesión #7 (50 min) - Técnicas respiración │
│ • 21 nov 2025 - Sesión #6 (45 min) - Homework revisión    │
│ [Ver todas las sesiones] [Nueva sesión]                    │
├─────────────────────────────────────────────────────────────┤
│ INFORMES GENERADOS                                          │
│ • Informe de progreso - 30 nov 2025 [PDF]                  │
│ • Evaluación inicial - 15 sep 2025 [PDF]                   │
│ [Generar nuevo informe]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎙️ 5. SESIONES EN VIVO

### Pre-sesión (configuración)
```
┌─────────────────────────────────────────────────────────────┐
│ NUEVA SESIÓN CON ANA GARCÍA                                 │
├─────────────────────────────────────────────────────────────┤
│ CONFIGURACIÓN DE SESIÓN                                     │
│                                                             │
│ Cliente: [Ana García ▼] [Cambiar]                          │
│ Tipo: ○ Individual ● Pareja ○ Familiar ○ Grupal          │
│ Duración estimada: [45] minutos                            │
│                                                             │
│ CONFIGURACIÓN DE AUDIO                                      │
│ Micrófono: [Micrófono predeterminado ▼]                   │
│ Calidad: ● Alta (mejor IA) ○ Media ○ Básica               │
│                                                             │
│ 🎤 [Test micrófono] Nivel: ████████░░ 80%                  │
│                                                             │
│ CONFIGURACIÓN DE IA                                         │
│ ✅ Transcripción en tiempo real                             │
│ ✅ Sugerencias automáticas                                  │
│ ✅ Detección de emociones                                   │
│ ✅ Resumen al finalizar                                     │
│                                                             │
│ CONSENTIMIENTO                                              │
│ ✅ Cliente ha dado consentimiento verbal para grabación     │
│ ✅ Cliente informado sobre procesamiento IA                 │
│                                                             │
│ [Cancelar] [Iniciar Sesión]                                │
└─────────────────────────────────────────────────────────────┘
```

### Durante la sesión
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 SESIÓN ACTIVA │ Ana García │ ⏱️ 23:45 │ [⏸️][⏹️]        │
├─────────────────────────────────────────────────────────────┤
│ TRANSCRIPCIÓN EN TIEMPO REAL                   │ IA ASISTENTE│
│                                                │             │
│ Psicólogo: ¿Cómo te has sentido esta          │ 💡 SUGERENCIA│
│ semana con las técnicas de respiración?        │             │
│                                                │ Considera   │
│ Ana: Bueno, he notado que cuando me           │ preguntar   │
│ siento ansiosa en el trabajo, uso las         │ sobre:      │
│ técnicas y me ayuda un poco...                │             │
│                                                │ • Frecuencia│
│ [📝 Nota rápida]                              │ • Contextos │
│ [🔖 Marcar momento importante]                 │ • Barreras  │
│                                                │             │
│ NOTAS DE SESIÓN                                │ 😊 EMOCIÓN  │
│ [Área de texto para escribir...]              │ Detectada:  │
│                                                │ Optimismo   │
│                                                │ moderado    │
│                                                │             │
│                                                │ ⚠️ ALERTA   │
│                                                │ Ninguna     │
└─────────────────────────────────────────────────────────────┘
```

### Post-sesión (resumen)
```
┌─────────────────────────────────────────────────────────────┐
│ SESIÓN FINALIZADA ✅ │ Duración: 47 min │ [Guardar] [PDF]   │
├─────────────────────────────────────────────────────────────┤
│ RESUMEN AUTOMÁTICO POR IA                                   │
│                                                             │
│ 📊 MÉTRICAS DE LA SESIÓN                                    │
│ • Tiempo de habla: Cliente 70% / Psicólogo 30%             │
│ • Emociones detectadas: Optimismo (60%), Ansiedad (20%)    │
│ • Palabras clave: "trabajo", "técnicas", "respiración"     │
│                                                             │
│ 🎯 PUNTOS DESTACADOS                                        │
│ • Cliente reporta mejora en manejo de ansiedad laboral     │
│ • Técnicas de respiración siendo efectivas                 │
│ • Posible área de trabajo: situaciones sociales            │
│                                                             │
│ 💡 SUGERENCIAS PARA PRÓXIMA SESIÓN                          │
│ • Explorar técnicas para situaciones sociales              │
│ • Revisar homework de mindfulness                          │
│ • Considerar técnicas de grounding                         │
│                                                             │
│ 📝 NOTAS PERSONALES                                         │
│ [Área editable con notas del psicólogo...]                 │
│                                                             │
│ 📅 PRÓXIMA CITA: [9 dic 2025] [16:00] [Programar]          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 6. GENERACIÓN DE INFORMES

### Selector de plantillas
```
┌─────────────────────────────────────────────────────────────┐
│ NUEVO INFORME PARA ANA GARCÍA                               │
├─────────────────────────────────────────────────────────────┤
│ TIPO DE INFORME                                             │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ EVALUACIÓN INICIAL  │ │ SEGUIMIENTO         │             │
│ │ • Primera consulta  │ │ • Progreso actual   │             │
│ │ • Historia clínica  │ │ • Objetivos         │             │
│ │ • Plan tratamiento  │ │ • Ajustes           │             │
│ │ [Seleccionar]       │ │ [Seleccionar]       │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ ALTA MÉDICA         │ │ DERIVACIÓN          │             │
│ │ • Resumen completo  │ │ • Para especialista │             │
│ │ • Logros alcanzados │ │ • Motivo derivación │             │
│ │ • Recomendaciones   │ │ • Información clave │             │
│ │ [Seleccionar]       │ │ [Seleccionar]       │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ INFORME LEGAL       │ │ PERSONALIZADO       │             │
│ │ • Para tribunales   │ │ • Plantilla libre   │             │
│ │ • Formato oficial   │ │ • Campos variables  │             │
│ │ [Pro/Premium]       │ │ [Seleccionar]       │             │
│ └─────────────────────┘ └─────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Editor de informes (TipTap)
```
┌─────────────────────────────────────────────────────────────┐
│ INFORME DE SEGUIMIENTO - Ana García [Autoguardar: ✅]      │
├─────────────────────────────────────────────────────────────┤
│ [B][I][U] [H1][H2][H3] [•][1.][→] [📎][🔗] [💡IA]        │ Toolbar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ # INFORME DE SEGUIMIENTO PSICOLÓGICO                        │
│                                                             │
│ **Paciente:** Ana García Martínez                          │
│ **Fecha:** 2 de diciembre de 2025                          │
│ **Psicólogo:** Dr. [Tu nombre]                             │
│ **Número colegiado:** 12345                                │
│                                                             │
│ ## EVOLUCIÓN DEL TRATAMIENTO                                │
│                                                             │
│ La paciente ha mostrado una evolución positiva en el       │
│ manejo de los síntomas de ansiedad generalizada. Durante    │
│ las últimas 4 sesiones...                                  │
│                                                             │ Editor
│ ### Objetivos alcanzados:                                  │ Principal
│ - Implementación exitosa de técnicas de respiración        │
│ - Reducción de episodios de ansiedad en contexto laboral   │
│ - Mayor autoconciencia emocional                           │
│                                                             │
│ ### Áreas pendientes:                                      │
│ - Manejo de ansiedad en situaciones sociales               │
│ - Fortalecimiento de técnicas de grounding                 │
│                                                             │
│ [💡 IA sugiere: Añadir sección sobre técnicas específicas] │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Vista previa PDF] [Guardar borrador] [Finalizar informe]  │
└─────────────────────────────────────────────────────────────┘
```

### Panel IA para informes
```
┌─────────────────────┐
│ IA ASISTENTE        │
├─────────────────────┤
│ 📊 DATOS DEL CLIENTE│
│ • 8 sesiones        │
│ • 47 min promedio   │
│ • Palabras clave:   │
│   "ansiedad",       │
│   "trabajo",        │
│   "técnicas"        │
│                     │
│ 💡 SUGERENCIAS      │
│ • Incluir métricas  │
│   de progreso       │
│ • Mencionar         │
│   técnicas usadas   │
│ • Agregar objetivos │
│   futuros           │
│                     │
│ 📝 GENERAR SECCIÓN  │
│ [Resumen ejecutivo] │
│ [Recomendaciones]   │
│ [Plan seguimiento]  │
│                     │
│ 🎯 PLANTILLAS RÁPID │
│ [Conclusiones tipo] │
│ [Objetivos estándar]│
│ [Referencias biblio]│
└─────────────────────┘
```

---

## 🎮 7. SIMULADOR DE CONSULTAS (Estudiantes)

### Selector de casos
```
┌─────────────────────────────────────────────────────────────┐
│ SIMULADOR DE CONSULTAS - Casos Disponibles                 │
├─────────────────────────────────────────────────────────────┤
│ NIVEL: ○ Principiante ● Intermedio ○ Avanzado             │
│ ESPECIALIDAD: [Todos ▼] DURACIÓN: [15-30 min]             │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ CASO #1: ANSIEDAD   │ │ CASO #2: DEPRESIÓN  │             │
│ │ 👤 María, 28 años   │ │ 👤 Carlos, 35 años  │             │
│ │ 🎯 Nivel: ⭐⭐⭐     │ │ 🎯 Nivel: ⭐⭐⭐⭐    │             │
│ │ ⏱️ 20-25 minutos    │ │ ⏱️ 25-30 minutos    │             │
│ │ 📚 Objetivos:       │ │ 📚 Objetivos:       │             │
│ │ • Rapport inicial   │ │ • Evaluación estado │             │
│ │ • Explorar síntomas │ │ • Historia depresiva│             │
│ │ • Técnicas calmado  │ │ • Plan tratamiento  │             │
│ │ [Iniciar Caso]      │ │ [Iniciar Caso]      │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ CASO #3: PAREJA     │ │ CASO #4: TRAUMA     │             │
│ │ 👫 Ana & Luis       │ │ 👤 Sofía, 42 años   │             │
│ │ 🎯 Nivel: ⭐⭐⭐⭐⭐   │ │ 🎯 Nivel: ⭐⭐⭐⭐⭐   │             │
│ │ ⏱️ 30-40 minutos    │ │ ⏱️ 35-45 minutos    │             │
│ │ 📚 Objetivos:       │ │ 📚 Objetivos:       │             │
│ │ • Comunicación      │ │ • Rapport sensible  │             │
│ │ • Conflictos        │ │ • PTSD assessment   │             │
│ │ • Medianción        │ │ • Safety planning   │             │
│ │ [Iniciar Caso]      │ │ [Iniciar Caso]      │             │
│ └─────────────────────┘ └─────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### Simulación activa
```
┌─────────────────────────────────────────────────────────────┐
│ 🎭 SIMULACIÓN: Ansiedad - María │ ⏱️ 12:30 │ [Pausa][Fin]  │
├─────────────────────────────────────────────────────────────┤
│ PACIENTE VIRTUAL                               │ TU RESPUESTA│
│                                                │             │
│ ┌─────────────────────────────────────────────┐│ [🎤 Hablar] │
│ │ 👤 María (aparenta nerviosa):               ││ O escribir: │
│ │ "Hola... eh... no sé muy bien por          ││             │
│ │ dónde empezar. He estado sintiendo          ││ [___________│
│ │ mucha ansiedad últimamente y mi             ││ ____________│
│ │ médico me dijo que viniera a               ││ ____________│
│ │ hablar con alguien..."                      ││ ___________]│
│ │                                             ││             │
│ │ 🎵 [Audio sintetizado] ▶️ [2.3s]            ││ [Enviar]    │
│ └─────────────────────────────────────────────┘│             │
├─────────────────────────────────────────────────────────────┤
│ FEEDBACK EN TIEMPO REAL                                     │
│ ✅ Buen contacto visual                                     │
│ 💡 Sugerencia: Validar su valentía por buscar ayuda        │
│ 📚 Recuerda: Establecer rapport antes de explorar síntomas │
└─────────────────────────────────────────────────────────────┘
```

### Evaluación post-simulación
```
┌─────────────────────────────────────────────────────────────┐
│ EVALUACIÓN DE DESEMPEÑO - Caso #1: Ansiedad                │
├─────────────────────────────────────────────────────────────┤
│ PUNTUACIÓN GLOBAL: 78/100 🌟🌟🌟⭐⭐                         │
│                                                             │
│ DESGLOSE POR COMPETENCIAS:                                  │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ RAPPORT             │ │ ESCUCHA ACTIVA      │             │
│ │ ████████░░ 85%      │ │ ███████░░░ 72%      │             │
│ │ ✅ Contacto visual   │ │ ✅ Parafraseo        │             │
│ │ ✅ Tono empático     │ │ ⚠️ Interrupciones    │             │
│ │ ⚠️ Validación        │ │ ❌ Reflejo emocional │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐             │
│ │ TÉCNICAS            │ │ ESTRUCTURA          │             │
│ │ ██████░░░░ 65%      │ │ ████████░░ 89%      │             │
│ │ ✅ Preguntas abiert  │ │ ✅ Intro clara       │             │
│ │ ❌ Técnicas calma    │ │ ✅ Exploración       │             │
│ │ ⚠️ Psychoeducación   │ │ ✅ Cierre adecuado   │             │
│ └─────────────────────┘ └─────────────────────┘             │
│                                                             │
│ 📝 RETROALIMENTACIÓN DETALLADA:                             │
│                                                             │
│ FORTALEZAS:                                                 │
│ • Excelente estructura de sesión                           │
│ • Preguntas abiertas apropiadas                            │
│ • Tono de voz empático y profesional                       │
│                                                             │
│ ÁREAS DE MEJORA:                                            │
│ • Incorporar más validación emocional                      │
│ • Enseñar técnicas de relajación in-situ                   │
│ • Evitar interrumpir el relato del paciente                │
│                                                             │
│ 🎯 EJERCICIOS RECOMENDADOS:                                 │
│ • Módulo: "Reflejo y validación emocional"                 │
│ • Vídeo: "Técnicas de respiración en consulta"             │
│ • Práctica: "Casos de ansiedad avanzados"                  │
│                                                             │
│ [Repetir caso] [Nuevo caso] [Ver desglose completo]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 8. RESPONSIVE DESIGN

### Mobile-first breakpoints
```
/* Mobile (320px-640px) */
┌──────────────────┐
│ ☰ [Logo] [User]  │ Header compacto
├──────────────────┤
│ 📊 Resumen       │ Cards apiladas
│ ┌──────────────┐ │ verticalmente
│ │ 24 Clientes  │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ 12 Sesiones  │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ 8 Informes   │ │
│ └──────────────┘ │
├──────────────────┤
│ [Bottom Nav Bar] │ Navegación tabs
└──────────────────┘

/* Tablet (640px-1024px) */
┌─────────────────────────┐
│ ☰ [Logo] [Search] [User]│ Header expandido
├─────────────────────────┤
│ ┌─────────┐ ┌─────────┐ │ Cards 2 columnas
│ │Clientes │ │Sesiones │ │
│ │   24    │ │   12    │ │
│ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ │
│ │Informes │ │Analytics│ │
│ │   8     │ │   📊    │ │
│ └─────────┘ └─────────┘ │
├─────────────────────────┤
│ Actividad reciente...   │ Lista expandida
└─────────────────────────┘

/* Desktop (1024px+) */
┌───┬─────────────────────────────────────────┐
│ S │ Dashboard completo con sidebar         │
│ I │ Cards horizontales y gráficos         │
│ D │ Panel IA lateral opcional             │
│ E │                                       │
│ B │                                       │
│ A │                                       │
│ R │                                       │
└───┴─────────────────────────────────────────┘
```

---

## 🎨 SISTEMA DE COMPONENTES

### Botones
```css
/* Botón principal */
.btn-primary {
  @apply bg-primary-calm hover:bg-primary-trust 
         text-white px-6 py-3 rounded-lg 
         font-medium transition-colors
         focus:ring-2 focus:ring-primary-calm focus:ring-offset-2;
}

/* Botón secundario */
.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 
         text-gray-900 px-6 py-3 rounded-lg 
         font-medium transition-colors;
}

/* Botón peligro */
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 
         text-white px-6 py-3 rounded-lg 
         font-medium transition-colors;
}
```

### Cards
```css
.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200
         p-6 transition-shadow hover:shadow-md;
}

.card-stat {
  @apply card text-center;
}

.card-stat-value {
  @apply text-3xl font-bold text-gray-900;
}

.card-stat-label {
  @apply text-sm text-gray-600 mt-2;
}
```

### Forms
```css
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 
         rounded-md shadow-sm focus:outline-none 
         focus:ring-primary-calm focus:border-primary-calm;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-error {
  @apply text-sm text-red-600 mt-1;
}
```

---

## ✅ CHECKLIST DE PROTOTIPOS

### Entregables en Figma
- [ ] **Sistema de componentes** (botones, forms, cards, navigation)
- [ ] **Paleta de colores** profesional para contexto médico
- [ ] **Tipografía** escalable y accesible
- [ ] **Iconografía** consistente (Lucide React compatible)
- [ ] **Layout grid** responsive (12 columnas)

### Páginas principales
- [ ] **Landing page** completa con hero, features, pricing
- [ ] **Registro/Login** con validaciones visuales
- [ ] **Dashboard** con sidebar dinámico según plan
- [ ] **Gestión clientes** (lista, filtros, perfil detallado)
- [ ] **Sesiones en vivo** (pre, durante, post sesión)
- [ ] **Editor informes** con panel IA lateral
- [ ] **Simulador** (selector casos, simulación, evaluación)
- [ ] **Configuración** de cuenta y preferencias

### Flujos de usuario
- [ ] **Onboarding** completo para nuevos usuarios
- [ ] **Upgrade de plan** desde cualquier módulo
- [ ] **Gestión consentimientos** para datos sensibles
- [ ] **Proceso de cancelación** de cuenta
- [ ] **Recuperación de contraseña** paso a paso

### Estados y componentes
- [ ] **Estados vacíos** (sin clientes, sin sesiones, etc.)
- [ ] **Estados de carga** (skeleton screens)
- [ ] **Estados de error** con acciones de recuperación
- [ ] **Notificaciones** toast y alertas
- [ ] **Modals** de confirmación y formularios
- [ ] **Tooltips** explicativos para funciones de IA

### Responsive design
- [ ] **Mobile** (320px-640px) con navegación bottom tabs
- [ ] **Tablet** (640px-1024px) adaptación sidebar
- [ ] **Desktop** (1024px+) layout completo
- [ ] **Interacciones** touch-friendly para móvil
- [ ] **Navigation patterns** consistentes entre dispositivos

---

*Documento actualizado en Fase 0 - Diciembre 2025*  
*Versión: 1.0*  
*Estado: ✅ Completado*

**Próximo paso:** Crear prototipos navegables en Figma usando estas especificaciones como guía base.