# 📋 Guía de Pruebas: Tester 2 (Límites de Plan, Pagos y UX General)

> **Perfil:** Cualquiera (usuario ordinario donde no son relevantes pruebas médicas IA)
> **Tiempo estimado:** 2-3 horas
> **Objetivo principal:** Estresar los límites de suscripción (bloqueos y upselling), validar pagos de prueba, fluidez total e internacionalización.

---

## 1. Landing, Idiomas y UX de Aterrizaje
- [ ] Explora la sección pública pre-registro visualmente en distintas pestañas de idiomas (**Catalán, Castellano, Inglés**). Pon a prueba que los botones llevan a los lugares esperados sin romperse (`/ca/`, `/es/`).
- [ ] Confirma el estado de las FAQs y componentes como Toggles de precios y enlaces de Aviso Legal/Privacidad en el pie de página.

## 2. Formulario de Registro
- [ ] Abre el registro por correo. Intenta fallar a propósito dejando campos en blanco o contraseñas cortas. ¿Aparecen instrucciones amigables de corrección?
- [ ] Entra por Login, recupera el password manualmente para ver si llega el correo.
- [ ] Si es posible, simula el registro conectando por Google OAuth.

## 3. Búsqueda de Límites de Suscripción (Plan Basic)
Todo usuario gratuito nace bajo el plan Basic limitado. Explora dónde están las fronteras.
- [ ] El sistema limita **volumen de Pacientes (ej. capado a 25)**. Pídele de palabra al Admin si puede recortar la cuota a "solo 3 pacientes". Crea pacientes para saltar este límite. ¿La ventana de bloqueo tiene sentido y te invita a hacer *Upgrade*?
- [ ] **Servicios bloqueados:** Intenta forzar el uso de IA como pedir Respuestas, o acceder al Simulador. ¿Avisan de que debes suscribirte?

## 4. Simulación de Pagos Stripe
Ve a *Pricing* o la página para *Mejorar Plan*:
- [ ] Haz el Checkout saltando al entorno de pagos con los datos virtuales de Stripe Test: `4242 4242 4242 4242` / Caducidad: 12/28 / CVC: `123`.
- [ ] ¿Es validada la tarjeta y la transacción vuelve a la plataforma desbloqueando las herramientas Pro de la IA?
- [ ] ¿Puedes visualizar el registro de alta en el Perfil general y cancelarla si quieres?

## 5. Componentes Horarios
- [ ] Revisa que el panel Calendario funcione de manera genérica para programar sesiones sin errores visuales de solapamiento.

---

## 6. Formulario de resultados por tester

Cuando encuentres bugs, clasifícalos aquí. Ignora errores de contenido médico y céntrate en el modelo de negocio / navegación SAAS:

| Campo | Valores |
|------|--------|
| **ID Prueba / Paso** | Ej: 3 o 4 |
| **Resultado** | ✅ OK / ❌ KO / ⚠️ Parcial |
| **Severidad** (si KO) | 🔴 Crítica / 🟠 Alta / 🟡 Media / 🟢 Baja |
| **Descripción del problema** | Texto libre |
| **Captura de pantalla** | Adjuntar si es posible |
| **Navegador/Dispositivo** | Ej: Chrome 120 Desktop |
| **Comentarios adicionales** | Sugerencias de UX |

### Definición de severidades
- 🔴 **Crítica:** La app o suscripción no funciona, registra el pago pero no habilita el acceso.
- 🟠 **Alta:** Bloqueo roto: las herramientas Basic incluyen funciones Premium por error.
- 🟡 **Media:** Traducciones en inglés mal procesadas, saltos HTML rotos.
- 🟢 **Baja:** UX de pulido menor.
