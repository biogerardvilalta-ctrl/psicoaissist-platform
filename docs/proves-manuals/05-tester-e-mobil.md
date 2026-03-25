# 📋 Guia de Proves: Usuari E (Tester Mòbil / PWA)

> **Perfil:** Usuari expert en entorn mòbil i Responsive Web Design
> **Entorn:** Preproducció en dispositius Reals (idealment barreja de iOS & Android / o simuladors per diverses referències viewport com de diferents talles/ratios panells i tablets petites)
> **Temps estimat:** 2 hores
> **Objectiu:** Validar estrictament en dispositius mòbils (Smartphone, Tablet vertical).

> **Anota de forma acurada el sistema iOS / Android provat i quina mida i navegador empraves en cadascuna. Qualsevol qüestió estranya del rendiment documentar-la sempre per les seves singularitats específiques dins l'ecosistema del Mobile-First.**

---

## 1. Landing page (mòbil)
- [ ] Accedir amb un smartphone d'aspecte rellevant per internet cap a Landing en ruta principal.
- [ ] Ús ràpid i precís exclusivament del menú plegable tradicional conegut "Hamburger".  Obre totes i cadascuna de les línies, els marges al clic s'excusen del model de navegació habituals? Ens bloca visualitzacions subjacents correctament?
- [ ] Navegar completament el cos per scroll d'un touc superior fins on es limiten visualment els darrers peu de pàgines inferiors en dispositiu. Súmmant que ni talls sobtats de secció o un comportament atípic d'overflow desordenat entre columnes ens bloquegen dades (E.g elements de caixa de text amagats cap l'extrem).  
- [ ] Controls o botoneres i elements CTA assoleixen àmpliament un marc espacial pràctic per on colpejar dits corrents "Touch Target Area" a pantalla (Com a mesura de 44x44 en mida com a rati base).
- [ ] Valida ràpidament formats dels plans mostrats reduïts. Resulta un tauler entenedor respectant un salt amigable pel consumidor.

## 2. Accés & Controls Bàsic Formularis
- [ ] Formalitzar de ple l'alta/registre d'ús sobre el teu component del teclat virtual mòbil.  
- [ ] Iniciar accés tradicional des d'altres subseccions de targetes. Entra sota credencials sense majors complicacions d'àrea visible entorpint llançament a dins de flux. 
- [ ] Autenticar fent ús nativament facilitats Google OAuth quan sigui pre-ofert localment des d'una capa ràpida del propi OS pel mòbil.
- [ ] L'UX d'activació sobre components com 'Teclats desplegats' oculta en un moment problemàtic missives d'ajuda, de correcció de fallides previes formularis, botons enviament final? (Cal que si l'screen pugi i engrandeixi pel telèfon el zoom, tinguis prou àrea on continuar el format).

## 3. Disposicions Dashboard Mòbil (El Cor App)
- [ ] Certificar l'adaptabilitat mòbil dins de tot l'estructura principal del sistema ja registrat i autenticat al "Dashboard general". El contenidor està tancat adequadament ajustant-se en pantalles reduïdes? 
- [ ] El menú intern Lateral amagat té accions predeterminades que permeten fàcil ús d'obertures cap a capítols diferents mentre operes de forma fluïda al panell de l'aplicació sota ús dels paràmetres com dits, swipes etc.?  
- [ ] Gràfiques menys grans emmotllen el contorn complet en les referències o hi falta visualització?

## 4. Gestor llistat general i Pacients (Mòbil) 
- [ ] Procedir envers subsecció Gestió i obrir de zero creació pacients per smartphone.  
- [ ] Avaluar comportament de files i detalls agrupats sota els dispositius limitants per pantalla dels pacients ja fets.  Llegibilitat garantida?  
- [ ] Canviar certàmens prèviament creat de detalls del pacient i editar algun valor com noms via telèfon mòbil.

## 5. Administrador de Sessions Programades en via Mòbil 
- [ ] Confirmar eficient navegació adaptant Calendaris interns sota petites mides del tàctil per interaccions on podem cercar properes fites.  
- [ ] Establir i conformar una cita completa o de petita sessió per telèfon mòbil.
- [ ] Rebre permís explícits d'accessibilitats a micro local via sol·licituds "nativa i pop ups OS mòbils" cap a enregistraments quan la funció de Sessions exigeixi captació d'àudio. Captació funcional correctament del so des d'en mòbil del micròfon encastat.

## 6. Funcions Addicionals Tele-Mòbil WebRTC i Multimodal (SIM/Càmeres)
- [ ] Intentar participar actíva cap trucada prèviament establerta obrint vincles Videollamades externes del navegador Chrome i/o iOS Safari sobre el mòbil local de proves. Transcrpció Multimodal. 
- [ ] Validar accessibilitat envers controls web de permís atorgats. Àudio emissió - vídeo frontal encarregada enviant flux al destinatari? Mides completes i de control per finalitzacions tancats clarament visibles.  

## 7. App per IA Simulada Estudiants dins Mòbils
- [ ] Desplegar la prova d'usuari estudiantil utilitzant-ne la finestra xateig per IA o similar format simulat del mòbil per un breu moment. 
- [ ] Verificació pràctica tàctica respecte comportaments conversacionals interactius de l'UX/UI on puguem verificar un interacció asíncrona sense pèrdua de cap escenari per les contestes en boles d'avatars IA simulat. 

---

## 5. Formulari de resultats per tester

Cada tester ha d'emplenar per cada prova:

| Camp | Valors |
|------|--------|
| **ID Prova** | Ex: 3.1 |
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
