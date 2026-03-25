# 📋 Guia de Proves: Psicòleg B (Perfil Basic)

> **Perfil:** Psicòleg amb subscripció Basic
> **Entorn:** Preproducció
> **Temps estimat:** 2-3 hores
> **Objectiu:** Validar el flux bàsic i les limitacions del pla Basic

Aquest pla és gratuït i té les funcionalitats més bàsiques, a més d'una limitació a 25 clients màxims.

---

## 1. Registre i onboarding
- [ ] Registrar-se amb email nou
- [ ] Completar el perfil professional
- [ ] Navegar pel dashboard per primera vegada
- [ ] **VALORAR:** L'onboarding és clar? L'usuari sap què fer? (Sí/No, comentaris)

## 2. Limitacions del pla Basic (Validació detallada)

> 📢 **Com validar els límits:** Podeu demanar a l'admin que redueixi temporalment el límit de 25 clients a 3 per fer-ho més ràpid, o bé crear pacients ràpidament només omplint els camps obligatoris.

**Límit de clients (25):**
- [ ] Crear pacients fins arribar al límit del pla
- [ ] Intent de crear un pacient per sobre del límit → ha d'aparèixer un missatge d'error clar
- [ ] Verificar que el missatge d'error suggereix fer upgrade
- [ ] Verificar que el comptador de clients es mostra al dashboard o configuració
- [ ] Desactivar un pacient → es pot crear un de nou? (verificar si el límit compta actius o totals)

**Funcionalitats bloquejades:**
- [ ] Intentar accedir a l'anàlisi IA → ha d'aparèixer bloqueig + CTA upgrade
- [ ] Intentar gravar àudio en una sessió → permès o bloquejat? (documentar què diu el sistema)
- [ ] Intentar generar un informe amb IA → ha d'estar bloquejat
- [ ] Intentar crear una sessió amb videollamada → ha d'estar bloquejat
- [ ] Intentar accedir al simulador → ha d'estar bloquejat (només disponible per Premium/Estudiant)

**UX dels bloquejos:**
- [ ] Cada funcionalitat bloquejada mostra un missatge clar del per què? (Sí/No)
- [ ] Cada bloqueig té un botó/link per fer upgrade? (Sí/No)
- [ ] El botó d'upgrade porta al flux de pagament correctament? (Sí/No)
- [ ] **VALORAR:** Els missatges de bloqueig són amables i no frustrants? (1-5)

## 3. Gestió de pacients (bàsic)
- [ ] Crear 5 pacients amb dades bàsiques
- [ ] Editar un pacient
- [ ] Cercar un pacient
- [ ] Veure el detall d'un pacient

## 4. Sessions (bàsiques)
- [ ] Crear una sessió individual
- [ ] Afegir notes manuals (sense IA ni gravació)
- [ ] Finalitzar una sessió
- [ ] Veure l'historial de sessions d'un pacient

## 5. Informes (bàsics)
- [ ] Crear un informe manual
- [ ] Exportar a PDF
- [ ] Verificar que la generació automàtica amb IA NO es pot fer (pla Basic)

## 6. Upgrade de pla
- [ ] Clicar a "Millorar pla" / "Upgrade"
- [ ] Verificar que el flux de pagament funciona (Mode de prova targeta: `4242 4242 4242 4242`, Qualsevol data i CVC `123`)
- [ ] Verificar que després de l'upgrade, les funcionalitats Pro/Premium es desbloquegen

---

## 5. Formulari de resultats per tester

Cada tester ha d'emplenar per cada prova:

| Camp | Valors |
|------|--------|
| **ID Prova** | Ex: 2.1 |
| **Resultat** | ✅ OK / ❌ KO / ⚠️ Parcial |
| **Severitat** (si KO) | 🔴 Crítica / 🟠 Alta / 🟡 Mitjana / 🟢 Baixa |
| **Descripció del problema** | Text lliure |
| **Captura de pantalla** | Adjuntar si possible |
| **Navegador/Dispositiu** | Ex: Chrome 120 / iPhone 15 Safari |
| **Comentaris addicionals** | Suggeriments de millora |

### Definició de severitats

| Severitat | Descripció | Exemple |
|-----------|------------|---------|
| 🔴 **Crítica** | L'app no funciona o perd dades | Login no funciona, dades de pacient es perden |
| 🟠 **Alta** | Funcionalitat important trencada | No es pot crear un pacient, la transcripció falla |
| 🟡 **Mitjana** | Funcionalitat menor afectada o UX dolenta | Un botó no fa res, text no traduït |
| 🟢 **Baixa** | Cosmètic o suggeriment | Color incorrecte, marge massa gran |
