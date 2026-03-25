# 📋 Guia de Proves: Psicòleg C (Rol Estudiant)

> **Perfil:** Estudiant avançat / Professional en formació
> **Entorn:** Preproducció
> **Temps estimat:** 1.5-2 hores
> **Objectiu:** Validar el simulador de casos clínics de IA i el seu flux per estudiants

---

## 1. Registre i setup de prova
- [ ] Registrar-se normalment com a psicòleg amb algun pla base.
- [ ] **Acció requerida:** Avisar a l'Administrador perquè t'activi un pla que permeti fer servir el Simulador. **El teu rol a l'aplicació seguirà sent PSYCHOLOGIST normal**.
- [ ] Un cop l'admin t'avisi que tens accés, refrescar la pàgina.
- [ ] Et limitaràs exclusivament a testejar l'apartat del Simulador ignorant la gestió de pacients (pots ignorar les funcionalitats on l'aplicació no et bloquegi a propòsit).

## 2. Simulador de casos clínics
> Entrar a la secció de Simulador de la plataforma per practicar enfrontant-se a pacients virtuals generats per IA.

- [ ] Iniciar una sessió de simulació amb **dificultat baixa**.
- [ ] Mantenir una conversa amb el pacient virtual (fer-li mínim 10 missatges enfocats en recavació de dades, empatia i derivació/assessorament terapèutic).
- [ ] **VALORAR:** El pacient virtual respon de manera realista? (1-5)
- [ ] **VALORAR:** Les respostes són coherents amb la patologia descrita a l'escenari virtual? (1-5)
- [ ] Finalitzar la sessió manualment.
- [ ] Revisar l'avaluació de l'informe final del simulador.
- [ ] **VALORAR:** Les puntuacions assignades automàticament per l'algorisme (empatia, efectivitat, professionalitat) són justes basant-nos en el feedback que dona? (1-5)
- [ ] **VALORAR:** El feedback general ofert al final de la sessió del pacient simulat és útil per reflexionar i de cara a un aprenentatge? (1-5)

## 3. Escalabilitat i Dificultat del Simulador
- [ ] Iniciar una nova sessió virtual seleccionant dificultat **mitjana**.
- [ ] Realitzar una interacció breu (5 missatges mínims) i tancar-la.
- [ ] Iniciar una tercera sessió de simulació amb dificultat **alta**.
- [ ] Afrontar el desafiament d'un pacient virtual menys cooperatiu i tancar-la.
- [ ] **VALORAR:** És rellevant i es fa evident una modificació del comportament del pacient segons els nivells de dificultat introduïts? La diferència es percep clarament en el to i en les actituds del pacient? (Sí/No)

## 4. Historial de simulacions
- [ ] Confirmar que totes les simulacions prèvies finalitzades estan agrupades visiblement en una secció d'historial.
- [ ] Reactivar o inspeccionar el detall d'un informe anterior. Re-validar que tot el contingut guardat (puntuacions, conversa i valoració final) quedi emmagatzemat correctament.
- [ ] Comprovar si resulta visible i entenedor l'evolució entre puntuacions atorgades per sessions de diferent nivell de dificultat.

## 5. Restriccions de Quota (Simulador)

El teu compte de prova tindrà una quota limitada de simulacions i interaccions segons els crèdits del teu pla.
- [ ] Iniciar i tancar ràpidament varis casos virtuals fins que les alertes per consum del total de "quota de simulador permès pel pla" s'introdueixin.
- [ ] Certificar l'aparició d'aquest topall i la claredat en el panell on es comuniqui que s'han esgotat aquests crèdits associats.

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
