# 📋 Guía de Pruebas: Tester 3 (Responsive Móvil Total)

> **Perfil:** Tester Móvil / PWA Experiencia.
> **Tiempo estimado:** 1.5 horas
> **Objetivo principal:** Validar la adaptabilidad en pantallas móviles, chats de IA, grabación de órdenes de audio en un Smartphone vertical.

---

## 1. Landing y Adaptabilidad General
- [ ] Conecta al dominio de landing page usando Safari móvil (iOS) o Chrome (Android).
- [ ] Navega de arriba a abajo sin cortes anómalos horizontales (*overflow*). ¿La legibilidad es buena en las partes inferiores y los bloques laterales se adaptan bien?

## 2. Plegamientos y Táctil (TouchTargets)
- [ ] Verifica el correcto funcionamiento expansivo del menú hamburguesa y de todo submenú oculto.
- [ ] La UX móvil requiere botones amplios. ¿Resulta fácil hacer "tap" con el dedo en enlaces complejos (edición de pacientes, listas) sin pulsar otra cosa accidentalmente?

## 3. Uso del Micrófono en Móvil (HTML5 / WebRTC)
- [ ] **Acceso a micro Táctil**: Va a una sesión terapéutica o interacción de audio IA. Fuerza la solicitud activa del micrófono, verificando que el SO pida el permiso.
- [ ] Confirma que la grabación no se corta en iOS/Android cuando cambias el tamaño de la pantalla o sale un teclado. ¿Se guarda el audio en el servidor de pruebas al enviar?
- [ ] Abre un diálogo de chat de IA y revisa si el teclado virtual del teléfono oculta botones clave (como el de Enviar).

---

## 4. Formulario de resultados por tester

Rellena las posibles afectaciones exclusivamente sobre la gestión móvil.

| Campo | Valores |
|------|--------|
| **ID Prueba / Paso** | Ej: 2.2 |
| **Resultado** | ✅ OK / ❌ KO / ⚠️ Parcial |
| **Severidad** (si KO) | 🔴 Crítica / 🟠 Alta / 🟡 Media / 🟢 Baja |
| **Descripción del problema** | Describir solo lo que afecta al uso móvil |
| **Navegador/Dispositivo Exacto** | Ej: Safari iOS 17 - iPhone 14 Pro Max |
| **Comentarios adicionales** | Sugerencias claras para UI móvil |

### Definición de severidades
- 🔴 **Crítica:** La app no permite hacer login o el teclado bloquea totalmente un envío esencial. El micrófono no se activa nunca.
- 🟠 **Alta:** Capas CSS se salen fuera del móvil tapando botones principales.
- 🟡 **Media:** Interfaces apretadas, textos superpuestos o redundancias de la versión Desktop que molestan en el móvil.
- 🟢 **Baja:** Colores de botones que no responden bien al tacto.
