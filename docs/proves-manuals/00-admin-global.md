# 📋 Document Global — Administrador (Product Owner)

> **Plataforma:** PsicoAIssist (Beta 0.1.0)
> **Objectiu:** Supervisar, coordinar i validar totes les proves manuals abans del llançament.

Aquest document resumeix l'estratègia global de proves i les tasques de l'administrador per garantir que la validació es duu a terme de manera reeixida.

---

## 1. Preparació de l'Entorn (Abans de les Proves)

Com a administrador, has de preparar l'entorn de **Preproducció** perquè els testers puguin treballar sense interrupcions:

- [ ] **Configuració de Límits:** Assegurat que els límits dels plans (Basic, Estudiant) estan configurats correctament a la base de dades.
  - *Consell:* Per no haver de crear 25 clients a mà per validar el límit del pla Basic, pots canviar temporalment el límit a 3 clients, demanar al Tester B que ho provi, i tornar-lo a 25.
- [ ] **Assignar Pla pel Simulador:** El **Tester C** iniciarà sessió normalment com a `PSYCHOLOGIST`. Hauràs d'assegurar-te des del teu panell, la BD o Stripe Test que el seu usuari té un pla que habiliti el Simulador (p.ex. Premium o plan amb crèdits) i demanar-li que se centri exclusivament en provar aquest mòdul.
- [ ] **Serveis Paginats:** Verifica que Stripe està en **Mode Test** i les claus configurades.
  - *Targeta de prova:* `4242 4242 4242 4242` / Caducitat: qualsevol futura / CVC: `123`
- [ ] **Serveis IA:** Verifica que les API Keys de Google Gemini i OpenAI tenen saldo/quota disponible per a les proves.
- [ ] **Servidor de Correu:** Assegurat que els correus electrònics (SendGrid/Nodemailer) funcionen per rebre els emails de registre i verificació.
- [ ] **Repartiment de Guies:** Envia a cada tester el seu document PDF corresponent i assigna els terminis.

---

## 2. Resum de Testers i Hores

| Tester | Perfil i Tasca Principal | Hores | Sessions Reals |
|--------|--------------------------|-------|----------------|
| **Psicòleg A** | Pro/Premium (IA, transcripcions, etc.) | 5-6h | 2 |
| **Psicòleg B** | Basic (Flux bàsic, límits del pla) | 3-4h | 1-2 |
| **Psicòleg C** | Estudiant (Simulador de casos) | 1.5-2h | 1 |
| **Usuari D** | UX Global, navegació, i18n, legal | 3-4h | 2 |
| **Usuari E** | Tester mòbil (responsive total) | 2h | 1 |

**TOTAL ESTIMAT:** 14.5 - 18 hores

---

## 3. Què revisar en els resultats (Criteris Go/No-Go)

A mesura que rebis els formularis de resultats dels testers, classifica els errors segons la seva severitat:

- 🔴 **Crítica:** L'app no funciona o hi ha pèrdua de dades (Ex: "No puc fer login", "Es guarden pacients però desapareixen").
- 🟠 **Alta:** Funcionalitat important trencada (Ex: "La transcripció falla sempre", "No es pot iniciar la videollamada").
- 🟡 **Mitjana:** UX deficient o bug no bloquejant (Ex: "Textos en un altre idioma", "Botó difícil de clicar").
- 🟢 **Baixa:** Detalls visuals i suggeriments.

### Criteris per al llançament (GO) ✅
- [ ] **0 bugs 🔴 Crítics** oberts.
- [ ] **Màxim 2 bugs 🟠 Alts** oberts (i que tinguin un *workaround* o solució temporal clara).
- [ ] Tots els fluxos *core* funcionen perfectament: Registre → Activar Pla → Crear Pacient → Crear Sessió → Gravar/Transcriure → Iniciar Videollamada → Generar Informe.
- [ ] Strip (Pagaments) i facturació funcionen al 100%.

### Criteris per aturar el llançament (NO-GO) ❌
- Hi ha 1 o més bugs 🔴 Crítics.
- Més de 2 bugs 🟠 Alts sense workaround.
- Hi ha qualsevol vulnerabilitat de seguretat en dades mèdiques/clíniques.

---

## 4. Debrief Final

Un cop finalitzades les proves:
1. Recopila tots els PDFs/formularis que t'enviïn.
2. Crea els *issues/tickets* pertinents al repositori de codi assignant-hi la prioritat adequada.
3. Convoca una breu reunió (opcional) amb els testers si cal aclarir bugs complexes.
