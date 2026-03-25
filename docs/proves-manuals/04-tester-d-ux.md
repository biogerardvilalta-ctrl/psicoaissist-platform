# 📋 Guia de Proves: Usuari D (Tester UX / General)

> **Perfil:** Usuari general amb habilitats d'UX (sense coneixements clínics previs necessaris)
> **Entorn:** Preproducció (ordinador de sobretaula / laptop)
> **Temps estimat:** 3-4 hores
> **Objectiu:** Validar l'experiència d'usuari a fons, navegació asíncrona, disseny, accessibilitat i serveis transversals multilingües (sense intervenir profundament sobre contingut mèdic de la sessió avançada).

---

## 1. Landing page
- [ ] Obrir de primeres la pàgina d'aterratge (Landing).
- [ ] Executar una anàlisi a nivell visual (Hero section, característiques destacades, relats/testimonis, taula de preus de plans, Preguntes Freqüents/FAQ i pre-footer). Totes les fonts/seccions s'ajusten de forma fluida i correctament empaquetades sense sobrepassar el marge total.
- [ ] Monitoritzar/Anotar que carrega a cop d'ull amb celeritat (marge assumible per a un usuari genèric d'internet). Les imatges i altres continguts es carreguen eficientment (< 3 segons).
- [ ] Comprovar que tots els enllaços situats dins del peu de web o capçalera apuntin on pertanyen i no saltin cap error de recurs.
- [ ] Interactuar lliurement sobre botons Call to Action. Et duen ràpidament al bloc informatiu requerit pel focus o a accions adients?
- [ ] Comprovar canvis manuals (Toggle Switch options) entre vista per pagaments Mensuals (o) i/o les ofertes de quotes Anuals. S'actualiza degudament en preus la secció implicada? 

## 2. Registre i Accés (Login)
- [ ] Formalitzar un Alta Nova a partir de credencials de correu electrònic convencionals. La interacció transaccional (Confirmació mail) d'alta rutlla?
- [ ] Generar a propòsit errors de validació clàssics d'usuari a dins del procés per avaluar els avisos (ex. camps en blanc, email en format erroni sense ús d'arrova, claus que no exedim mínims, introduir una entrada repetida d'adreça al llarg de dues proves). Apareixen missatges per resoldre amables? 
- [ ] Login introduint el correu prèviament realitzat.
- [ ] Refaccions de recuperació de la contrasenya associada si està disposada de manera nativa per la web en fronted.
- [ ] Autenticar-se de zero fent l'ús d'un compte de 'Login vinculat per Google' o proveïdor enllaçat d'estricta manera sense cap bug detectat en la redirecció i capturat.

## 3. Internacionalització (i18n)
- [ ] Seleccionar idioma referencial a **Català**. Les estructures d'entorn passen al català respectant semàntica? 
- [ ] Posar-lo en **Espanyol**. Correspón tot el directori al mateix criteri per a usuari d'Espanya en qualitat idèntica a l'anterior visió?
- [ ] Esmenar l'eina al llenguatge **Anglès**. Verificar text genèric de seccions, botoneres en idioma natural i coherent. 
- [ ] Registrar activament missatges de la web, frases fetes dels controls per subscripció (Pagaments etc) O bé de lletres soltes amagades dins de processos que s'hagin perdut totalment en traducció a la carpeta i quedin revelats incorrectament sense traduir dins dels canvis, així mateix llistant-los correctament al fitxer on s'ubiquin.
- [ ] Contrastar empíricament la mutació del rastre d'apuntador al canvi sobre variables en la URL base de tipus (exemple subrutes al modificar opció idiomàtica). `/ca/..` o `/es/...`.
- [ ] Modificar una elecció prèvia, navegar una estona passant de finestres entre diferents funcions per veure sí aguanta de forma predeterminada aquesta prèvia modificació (no es reseteja al català solt de cop després d'establir-lo a anglés).
 
## 4. Estructura interna de continguts, UX i Navegació genèrica Dashboard
- [ ] Travessar com es cregui per totes i cadascuna un punt de les visualitzacions que facilita els panells de Dashboard pel cantó lateral/Central un cop dins.
- [ ] Confirma de ple que en els diferents nivells dins de l'estructura jeràrquica en aplicació el desglossat no retornen estats HTML amb errors o pàgines òrfenes perdudes, tampoc pàgines 404 ni cap trencament que restringeixi el viatge de pàgines. 
- [ ] Navega pel traç històric cap enrrere del propi navegador. Això s'aplica correctament com per una acció convencional que ens permet un desfés còmode sobre la darrera imatge guardada respectant sessió activa. 
- [ ] Restringir connexió si es demana manteniment. En cas invers després de tornar transcorreguts dies a la pestanya on no te n'has anat la subscripció a l'app s'exigeix la pass-reintrod.

## 5. Components de text transversals Legals
- [ ] Inspeccionar d'inici en Landing directament cap un document sota Polítiques Legals/Privacitat de contingut.
- [ ] Constatar condicions del subministrament web en els textus Condicions Legals vinculades/Termes de donació Servei. Aquests pregonen a la claredat visual referent d'articles i text llegibles?
- [ ] Verificar una ràpida immersió envers apartats existents de diari Blog on tot l'articulat llueix format estètic d'articles.

## 6. Revisió primària general: Accessibilitats
- [ ] Abandonar les eines físiques en un minut del ratolí extern, provar exclusivament fent saltos del teclat mitjançant la instrucció predefinides 'Tabulador' d'eixos en un formulari i per moure's en enllaços lliurement entre contingències existents de frontpage per comprovar accessibilitat i indicadors. 
- [ ] Executar judicis respecte l'ús general sobre fonts textuals i estètiques on es compaginí informacions i alertes (Excedència contrast). 

## 7. Intercomunicacions / Notificació Local / Push Alerts
- [ ] Generar avisos pel teu flux i contrastar l'advertiment rebut on es destaquen senyals dinàmiques en forma local (La campaneta in-app emet avisos del portal?). Visualitzar-les ràpidament. 
- [ ] Aplicar botó per treure el rastre previ de la targeta a la secció (Abollir d'un cas la ressenya marcada 'com no llegida'). 
- [ ] Abolir el marcador principal global marcat la llista com a llegides prèvia entrada com es descrivi pel programador. 

---

## 5. Formulari de resultats per tester

Cada tester ha d'emplenar per cada prova:

| Camp | Valors |
|------|--------|
| **ID Prova** | Ex: 4.1 |
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
