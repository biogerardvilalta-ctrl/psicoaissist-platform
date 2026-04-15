# 📋 Guía de Pruebas: Tester 1 (Criterio Clínico e IA)

> **Perfil:** Psicólogo / Profesional del sector
> **Tiempo estimado:** 3-4 horas
> **Objetivo principal:** Validar el uso en sesiones, transcripciones, IA (asistencia), y el Simulador de casos.

Este rol pretende evaluar si la plataforma realmente sirve de provecho terapéutico en sesiones clínicas y si la lógica de la IA interpreta correctamente las conversaciones. Debes tener el plan con más funcionalidades asignado (Pídeselo al admin una vez te registres).

---

## 1. Flujo Clínico y Gestión de Pacientes
- [ ] Abre el sistema, regístrate, entra.
- [ ] Crea un paciente (simulado o real) y completa los datos clínicos principales.
- [ ] Búscalo, edítalo, y familiarízate con su ficha (Historial de informes y notas).

## 2. Elaboración de Sesiones
> 📢 **IMPORTANTE:** Este es el corazón de la plataforma. Hay que validarla **hablando en voz alta** creando un archivo de audio que la IA pueda transcribir (nada ficticio escrito a texto, hay que hablar para evaluar el modelo de reconocimiento de voz).
>
> **¿Cómo grabar?** Puedes usar a un **paciente real** (asegúrate de que firme primero el PDF de "Consentimiento de Paciente para Pruebas") para tener la máxima fidelidad, o bien hacer un **role-play guiado** simulando ser terapeuta y paciente tú mismo o con un compañero.

**Escenario A (Sesión, 3 min)**: Realiza una grabación sobre un caso clínico en Español/Catalán.
- [ ] Abre sesión (cambio de estado a "En curso") y graba el audio unos cuantos minutos asíncronamente. Cierra.
- [ ] Evalúa la precisión de la transcripción: ¿Reconoce acentos? ¿Se separan bien los bloques de voz?
- [ ] Prueba exactamente lo mismo creando una Sesión B completamente en ESPAÑOL (o Catalán si el anterior fue en Español) y comprueba la transición de idioma.

## 3. Inteligencia Artificial e Informes Automáticos (IA)
Sobre la Sesión A y Sesión B ya creadas, haz clic en la opción "Análisis / Sugerencias":
- [ ] **VALORAR:** ¿La IA ha captado correctamente el hilo conductor/tema central?
- [ ] **VALORAR:** ¿El tono y las respuestas automáticas dan margen clínico que aporte valor sin parecer un "Google puro"? ¿El aviso legal de "No es un diagnóstico sustitutivo" es visible?
- [ ] Procede y haz clic en "Generar Informe". ¿Cuánta utilidad tiene este texto y plantilla para un historial clínico?

## 4. Simulador Estudiantil de Pacientes IA
Dirígete al menú para poner en práctica el Simulador como herramienta de práctica:
- [ ] Inicia un evento con Dificultad **Media**. Haz 10 intercambios conversacionales intentando poner al bot en su lugar.
- [ ] Cierra el chat virtual y evalúa el resultado: ¿Cómo califica la bot-IA tus características de Empatía, Conducta profesional, Efectividad?
- [ ] Vuelve a hacerlo con Dificultad **Difícil** y observa si el comportamiento del modelo de IA se vuelve menos receptivo y más complejo ante tus enfoques terapéuticos.

---

## 5. Formulario de resultados por tester

Rellena estas columnas cuando encuentres alguna rareza, fallo o tengas un comentario de mejora. Céntrate solo en **Sesión > Transcripción > IA > Simulador**.

| Campo | Valores |
|------|--------|
| **ID Prueba / Paso** | Ej: 2 o 3 |
| **Resultado** | ✅ OK / ❌ KO / ⚠️ Parcial |
| **Severidad** (si KO) | 🔴 Crítica / 🟠 Alta / 🟡 Media / 🟢 Baja |
| **Descripción del problema** | Texto libre |
| **Captura de pantalla** | Adjuntar si es posible |
| **Comentarios adicionales** | Sugerencias de mejora general |

### Definición de severidades
- 🔴 **Crítica:** Funciones rotas, el audio no llega, no transcribe o falla totalmente.
- 🟠 **Alta:** Transcribe con un 30% de errores incomprensibles, el simulador inventa argumentos aleatorios.
- 🟡 **Media:** El informe es poco estético, las sugerencias podrían tener un tono más clínico.
- 🟢 **Baja:** Cambios minúsculos visuales.
