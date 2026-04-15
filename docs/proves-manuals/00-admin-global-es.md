# 📋 Documento Global — Administrador (Product Owner)

> **Plataforma:** PsicoAIssist (Beta 0.1.0)
> **Objetivo:** Supervisar, coordinar y validar todas las pruebas manuales antes del lanzamiento.

Hemos simplificado el plan de pruebas en **3 testers principales** para no sobrecargar al equipo. Este documento resume la estrategia global y tus tareas.

---

## 1. Preparación del Entorno

Como administrador, debes preparar el entorno de **Preproducción** para que los testers puedan trabajar sin interrupciones:

- [ ] **Servicios de Pago:** Verifica que Stripe está en **Modo Test** y las claves configuradas. El usuario encargado de probar límites necesitará la tarjeta: `4242 4242 4242 4242` / Caducidad: cualquiera futura / CVC: `123`.
- [ ] **Servicios de IA:** Verifica que las API Keys de Google Gemini y OpenAI tienen saldo/cuota disponible para las pruebas del psicólogo clínico.
- [ ] **Correo (SendGrid/Nodemailer):** Asegúrate de que los correos de registro y verificación llegan correctamente.
- [ ] **Reparto de Guías:** Envía a cada tester su documento PDF correspondiente y si el clínico usa pacientes reales, envíale el **Consentimiento Informado**:
  - 🧠 **Tester 1 (Psicólogo Clínico):** IA, Transcripciones y Simulador.
  - 👤 **Tester 2 (Usuario Límites & UX):** Planes, Pagos, UX de la plataforma.
  - 📱 **Tester 3 (Móvil):** Funcionalidad e interacción en Smartphone.

---

## 2. Resumen de Testers y Horas

| Tester | Perfil y Tarea Principal | Horas estimadas |
|--------|--------------------------|-------|
| 🧠 **Tester 1 (Psicólogo Clínico)** | Casos reales o simulados, IA, Transcripciones, Informes, Simulador (Tiene un plan por defecto que lo permite todo). | 3-4h |
| 👤 **Tester 2 (Límites y UX)** | UX de la Landing, flujos de suscripción, comprobación de bloqueos (Plan Basic) y cambios de idioma/navegación. | 2-3h |
| 📱 **Tester 3 (Móvil)**| Comprobación de toda la plataforma y navegación exclusivamente desde un Smartphone. | 1.5h |

**TOTAL ESTIMADO:** 7 - 8.5 horas

---

## 3. Qué revisar en los resultados (Criterios Go/No-Go)

A medida que recibas los formularios de resultados de los testers, clasifica los errores según su severidad:

- 🔴 **Crítica:** La app no funciona o hay pérdida de datos (Ej: "No puedo hacer login", "La BD borra pacientes").
- 🟠 **Alta:** Funcionalidad importante rota (Ej: "La transcripción IA no funciona", "El pago falla siempre").
- 🟡 **Media:** UX deficiente o bug no bloqueante (Ej: "Mensaje de error en inglés aunque la web esté en español").
- 🟢 **Baja:** Detalles visuales y sugerencias (Ej: "El botón debería ser más grande").

### Criterios para el lanzamiento (GO) ✅
- [ ] **0 bugs 🔴 Críticos** abiertos.
- [ ] **Máximo 2 bugs 🟠 Altos** abiertos (y que tengan un *workaround* o solución temporal).
- [ ] Todos los flujos *core* funcionan perfectamente.
- [ ] Stripe e IA se enlazan perfectamente.

### Criterios para detener el lanzamiento (NO-GO) ❌
- Hay 1 o más bugs 🔴 Críticos.
- Hay cualquier vulnerabilidad de seguridad en datos médicos/clínicos.

---

## 4. Debrief Final

Una vez finalizadas las pruebas:
1. Recopila los 3 formularios y resultados de los PDF.
2. Crea los *issues/tickets* pertinentes en el repositorio de código asignando prioridad (Crítica/Alta/Media).
3. Coordina las soluciones y aplícalas a Producción.
