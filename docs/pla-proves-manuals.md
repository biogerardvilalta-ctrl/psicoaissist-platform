# 📋 Pla de Proves Manuals — PsicoAIssist Platform

> **Data:** Març 2026  
> **Versió:** 0.1.0 (Beta)  
> **Objectiu:** Validar totes les funcionalitats de la plataforma abans del llançament

---

## 1. Quants testers cal?

### Recomanació: 3 Psicòlegs + 2 Usuaris generals

| Perfil | Quants | Per què |
|--------|--------|---------|
| 🧠 **Psicòleg A** — Experimentat (perfil Pro/Premium) | 1 | Prova les funcionalitats avançades: IA, transcripció, informes, videollamades |
| 🧠 **Psicòleg B** — Novell (perfil Basic) | 1 | Prova el flux bàsic: alta de pacients, sessions, informes manuals, limitacions del pla |
| 🧠 **Psicòleg C** — Estudiant | 1 | Prova el simulador de casos clínics i el flux d'estudiant |
| 👤 **Usuari D** — Tester general (no psicòleg) | 1 | Prova UX, navegació, responsive, landing, registre, i18n |
| 👤 **Usuari E** — Tester mòbil | 1 | Prova tota l'app des del mòbil (Android/iOS), responsive, videollamades mòbil |

> [!TIP]
> Si no podeu trobar 5 persones, el mínim indispensable són **2 psicòlegs + 1 tester UX**. Un psicòleg ha de provar el flux complet (Pro/Premium) i l'altre el bàsic + simulador.

---

## 2. Divisió de proves

### 🧠 Proves que han de fer PSICÒLEGS (requereixen coneixement clínic)

Aquestes proves requereixen criteris professionals per valorar si la IA, els informes i els fluxos clínics tenen sentit:

- Qualitat de les transcripcions d'àudio
- Rellevància de les sugerències de la IA
- Qualitat dels informes generats automàticament
- Realisme del simulador de casos clínics
- Puntuacions del simulador (empatia, efectivitat, professionalisme)
- Fluix de sessió terapèutica complet (crear → gravar → transcriure → informe)
- Gestió de pacients amb dades clíniques reals (test)
- Exportació d'informes (PDF/Word) — valorar format professional

### 👤 Proves que poden fer QUALSEVOL USUARI (no cal ser psicòleg)

Aquestes proves validen funcionalitat tècnica i UX:

- Landing page i navegació
- Registre i login (email + Google)
- Responsive i mòbil
- Internacionalització (CA/ES/EN)
- Pagament amb Stripe (mode test)
- Notificacions
- Videollamades
- Panel d'administració (si tenen rol admin)
- Accessibilitat i rendiment
- Pàgines legals i blog

---

## 3. Llista de proves per tester

---

### 🧠 PSICÒLEG A — Perfil Pro/Premium (Flux avançat)

**Entorn:** Preprod  
**Temps estimat:** 4-5 hores  
**Objectiu:** Validar totes les funcionalitats avançades amb sessions reals

> [!IMPORTANT]
> **Sessions reals obligatòries.** Aquest tester ha de fer sessions parlant en veu alta (no escrivint al xat). L'objectiu és generar àudio real per validar la transcripció i la IA. Pot fer-ho sol (parlant com si fes teràpia) o amb una altra persona fent de pacient.

#### A1. Autenticació i perfil
- [ ] Registrar-se amb email i contrasenya
- [ ] Verificar email (si aplica)
- [ ] Login amb Google OAuth
- [ ] Completar perfil professional (núm. col·legiat, especialitat, etc.)
- [ ] Canviar contrasenya
- [ ] Canviar idioma preferit (CA → ES → EN)
- [ ] Tancar sessió i tornar a entrar

#### A2. Dashboard principal
- [ ] Visualitzar mètriques resum (pacients, sessions, etc.)
- [ ] Comprovar que les targetes del dashboard mostren dades correctes
- [ ] Verificar que el sidebar mostra opcions segons el pla (Pro/Premium)
- [ ] Provar les notificacions (campana)
- [ ] Verificar activitat recent

#### A3. Gestió de pacients (Clients)
- [ ] Crear un pacient nou amb totes les dades
- [ ] Verificar que les dades es guarden correctament (es mostren bé)
- [ ] Editar dades d'un pacient existent
- [ ] Cercar pacients per nom
- [ ] Filtrar pacients per nivell de risc
- [ ] Veure el detall complet d'un pacient
- [ ] Desactivar un pacient
- [ ] Crear un mínim de 5 pacients de prova

#### A4. Sessions terapèutiques REALS (amb àudio parlat)

> 📢 **Com fer-ho:** Has de parlar en veu alta simulant una sessió de teràpia real. Pots fer servir un dels escenaris suggerits a la secció 7 o inventar-ne un. L'important és que l'àudio sigui real i tingui contingut clínic per poder valorar la transcripció i la IA.

**Escenari recomanat:** Simula una sessió d'ansietat generalitzada. Parla com si fossis el terapeuta i el pacient (o demana a una altra persona que faci de pacient). Mínim 3-5 minuts d'àudio.

- [ ] Crear una sessió programada (tipus: Individual)
- [ ] Crear sessions de tipus: Grup, Parella, Família
- [ ] Verificar que la sessió apareix al calendari
- [ ] Iniciar una sessió (canvi d'estat a "En curs")
- [ ] **🎙️ SESSIÓ REAL 1:** Gravar àudio parlant en veu alta (mínim 3 minuts) simulant una sessió d'ansietat. Parla en català.
- [ ] Aturar la gravació i verificar que l'àudio s'ha pujat correctament
- [ ] Esperar la transcripció automàtica i revisar-la
- [ ] **VALORAR:** La transcripció és precisa en **català**? (Anotar % estimat)
- [ ] **VALORAR:** Reconeix bé els noms propis? (Sí/No)
- [ ] **VALORAR:** Diferència bé les veus de terapeuta i pacient? (Sí/No, si aplica)
- [ ] Afegir notes manuals a la sessió
- [ ] Finalitzar la sessió
- [ ] **🎙️ SESSIÓ REAL 2:** Repetir el procés parlant en **espanyol** (mínim 2 minuts) — verificar que transcriu bé en un altre idioma
- [ ] **🎙️ SESSIÓ REAL 3 (opcional):** Repetir en **anglès** si el tester se sent còmode
- [ ] Crear una sessió i cancel·lar-la (estat "Cancel·lada")
- [ ] **VALORAR:** Temps entre pujar l'àudio i rebre la transcripció (anotar segons/minuts)

#### A5. Intel·ligència Artificial (sobre les sessions reals gravades)

> 📢 **Important:** Aquestes proves s'han de fer SOBRE les sessions reals gravades al pas A4, no sobre text inventat. Així es pot valorar si la IA entén el context clínic real.

- [ ] Sol·licitar anàlisi IA de la sessió real transcrita (sessió d'ansietat)
- [ ] **VALORAR:** La IA ha identificat correctament el tema principal (ansietat)? (Sí/No)
- [ ] **VALORAR:** Les sugerències de la IA són rellevants per al cas? (1-5)
- [ ] **VALORAR:** El to és adequat (sugerència, no diagnòstic)? (Sí/No)
- [ ] **VALORAR:** La IA detecta patrons emocionals en el discurs? (Sí/No)
- [ ] Sol·licitar sugerències terapèutiques per a un pacient amb ansietat
- [ ] **VALORAR:** Les sugerències afegeixen valor real al professional? (1-5)
- [ ] **VALORAR:** Seria perillós seguir alguna sugerència sense criteri professional? (Sí/No — si sí, detallar)
- [ ] Verificar que el disclaimer "No és un diagnòstic" és visible
- [ ] Comparar l'anàlisi de sessions en català vs espanyol — hi ha diferència de qualitat?

#### A6. Informes clínics
- [ ] Generar un informe automàtic amb IA a partir d'una sessió
- [ ] **VALORAR:** La qualitat de l'informe generat (1-5)
- [ ] **VALORAR:** L'estructura de l'informe és professional? (Sí/No)
- [ ] Editar l'informe generat manualment
- [ ] Crear un informe des de zero (manual)
- [ ] Exportar a PDF — verificar format i contingut
- [ ] Exportar a Word (.docx) — verificar format i contingut
- [ ] Confirmar l'informe com a revisat (`humanReviewConfirmed`)
- [ ] Canviar estat: Esborrany → En revisió → Completat → Arxivat

#### A7. Videollamades
- [ ] Crear una sessió amb videollamada
- [ ] Obrir l'enllaç de videollamada en un altre navegador/dispositiu
- [ ] Verificar connexió de vídeo i àudio
- [ ] Verificar que funciona en Chrome, Firefox, Safari
- [ ] Provar compartir pantalla (si disponible)
- [ ] Finalitzar la videollamada

#### A8. Pagaments i suscripció
- [ ] Veure els plans disponibles
- [ ] Simular una suscripció (Stripe mode test: `4242 4242 4242 4242`)
- [ ] Verificar que el pla s'activa i el rol canvia
- [ ] Verificar que les funcionalitats del pla estan habilitades
- [ ] Cancel·lar suscripció i verificar efectes

#### A9. Google Calendar
- [ ] Connectar compte Google Calendar
- [ ] Crear una sessió i verificar que apareix al Google Calendar
- [ ] Editar una sessió i verificar sincronització
- [ ] Cancel·lar una sessió i verificar que s'elimina del calendari

#### A10. Configuració
- [ ] Editar perfil (nom, telèfon, especialitat)
- [ ] Canviar horari laboral i durada per defecte
- [ ] Configurar buffer time entre sessions
- [ ] Veure facturació / billing

---

### 🧠 PSICÒLEG B — Perfil Basic (Flux bàsic + limitacions)

**Entorn:** Preprod  
**Temps estimat:** 2-3 hores  
**Objectiu:** Validar el flux bàsic i les limitacions del pla Basic

#### B1. Registre i onboarding
- [ ] Registrar-se amb email nou
- [ ] Completar el perfil professional
- [ ] Navegar pel dashboard per primera vegada
- [ ] **VALORAR:** L'onboarding és clar? L'usuari sap què fer? (Sí/No, comentaris)

#### B2. Limitacions del pla Basic — Validació detallada de límits

> 📢 **Com validar els límits:** Per provar el límit de 25 clients sense crear-ne 25 a mà, l'admin pot ajustar temporalment el límit a 3 a la configuració, o bé crear clients ràpidament amb dades mínimes.

**Límit de clients (25):**
- [ ] Crear pacients fins arribar al límit del pla
- [ ] Intent de crear un pacient per sobre del límit → ha d'aparèixer un missatge d'error clar
- [ ] Verificar que el missatge d'error suggereix fer upgrade
- [ ] Verificar que el comptador de clients es mostra al dashboard o configuració
- [ ] Desactivar un pacient → es pot crear un de nou? (verificar si el límit compta actius o totals)

**Funcionalitats bloquejades:**
- [ ] Intentar accedir a l'anàlisi IA → ha d'aparèixer bloqueig + CTA upgrade
- [ ] Intentar gravar àudio en una sessió → permès o bloquejat? (documentar)
- [ ] Intentar generar un informe amb IA → ha d'estar bloquejat
- [ ] Intentar crear una sessió amb videollamada → ha d'estar bloquejat
- [ ] Intentar accedir al simulador → ha d'estar bloquejat (només disponible per Premium/Estudiant)

**UX dels bloquejos:**
- [ ] Cada funcionalitat bloquejada mostra un missatge clar del per què? (Sí/No)
- [ ] Cada bloqueig té un botó/link per fer upgrade? (Sí/No)
- [ ] El botó d'upgrade porta al flux de pagament correctament? (Sí/No)
- [ ] **VALORAR:** Els missatges de bloqueig són amables i no frustrants? (1-5)

#### B3. Gestió de pacients (bàsic)
- [ ] Crear 5 pacients amb dades bàsiques
- [ ] Editar un pacient
- [ ] Cercar un pacient
- [ ] Veure el detall d'un pacient

#### B4. Sessions (bàsiques)
- [ ] Crear una sessió individual
- [ ] Afegir notes manuals (sense IA ni gravació)
- [ ] Finalitzar una sessió
- [ ] Veure l'historial de sessions d'un pacient

#### B5. Informes (bàsics)
- [ ] Crear un informe manual
- [ ] Exportar a PDF
- [ ] Verificar que la generació automàtica amb IA NO es pot fer (pla Basic)

#### B6. Upgrade de pla
- [ ] Clicar a "Millorar pla" / "Upgrade"
- [ ] Verificar que el flux de pagament funciona
- [ ] Verificar que després de l'upgrade, les funcionalitats es desbloquegen

---

### 🧠 PSICÒLEG C — Estudiant (Simulador)

**Entorn:** Preprod  
**Temps estimat:** 1.5-2 hores  
**Objectiu:** Validar el simulador de casos clínics

#### C1. Registre com a estudiant
- [ ] Registrar-se amb rol d'estudiant
- [ ] Verificar que el dashboard mostra funcionalitats d'estudiant
- [ ] Verificar que NO té accés a clients, sessions, informes reals

#### C2. Simulador de casos clínics
- [ ] Iniciar una sessió de simulació (dificultat baixa)
- [ ] Mantenir una conversa amb el pacient virtual (mínim 10 missatges)
- [ ] **VALORAR:** El pacient virtual respon de manera realista? (1-5)
- [ ] **VALORAR:** Les respostes són coherents amb la patologia? (1-5)
- [ ] Finalitzar la sessió i obtenir avaluació
- [ ] **VALORAR:** Els scores (empatia, efectivitat, professionalisme) són justos? (1-5)
- [ ] **VALORAR:** El feedback és útil per a l'aprenentatge? (1-5)
- [ ] Iniciar una sessió amb dificultat mitjana
- [ ] Iniciar una sessió amb dificultat alta
- [ ] **VALORAR:** La diferència de dificultat es nota? (Sí/No)

#### C3. Historial de simulacions
- [ ] Verificar que les simulacions anteriors apareixen a l'historial
- [ ] Obrir un informe anterior i verificar contingut
- [ ] Comparar resultats entre sessions de diferent dificultat

#### C4. Limitacions d'estudiant
- [ ] Verificar que NO pot accedir a gestió de clients
- [ ] Verificar que NO pot crear sessions reals
- [ ] Verificar que NO pot generar informes clínics
- [ ] Verificar accés limitat al simulador (segons minuts/casos del pla)

---

### 👤 USUARI D — Tester general (UX, navegació, i18n)

**Entorn:** Preprod  
**Temps estimat:** 2-3 hores  
**Objectiu:** Validar l'experiència d'usuari, navegació i funcionalitats transversals

#### D1. Landing page
- [ ] Obrir la landing page
- [ ] Verificar que carrega en menys de 3 segons
- [ ] Verificar hero section, features, testimonials, pricing, FAQ, footer
- [ ] Clicar tots els botons de CTA (Call to Action)
- [ ] Verificar que els plans/pricing es mostren correctament
- [ ] Comprovar que funcionen els links del footer
- [ ] Verificar el toggle mensual/anual de preus

#### D2. Registre i login
- [ ] Registrar-se amb email
- [ ] Provar registre amb email ja existent → error clar?
- [ ] Provar login amb credencials incorrectes → error clar?
- [ ] Provar login amb Google
- [ ] Verificar flux de recuperació de contrasenya (si disponible)
- [ ] Verificar que els formularis validen correctament (camps buits, email invàlid, etc.)

#### D3. Internacionalització (i18n)
- [ ] Canviar a **Català** → tots els textos en català?
- [ ] Canviar a **Espanyol** → tots els textos en espanyol?
- [ ] Canviar a **Anglès** → tots els textos en anglès?
- [ ] Anotar qualsevol text que NO estigui traduït
- [ ] Verificar que la URL canvia correctament (`/ca/`, `/es/`, `/en/`)
- [ ] Verificar que el canvi d'idioma es manté després de navegar

#### D4. Navegació i UX
- [ ] Navegar per TOTES les pàgines del menú/sidebar
- [ ] Verificar que no hi ha pàgines 404 trencades
- [ ] Verificar que el breadcrumb / navegació és coherent
- [ ] Comprovar que el botó "enrere" del navegador funciona bé
- [ ] Verificar que la sessió es manté al navegar (no et deslogueja)
- [ ] **VALORAR:** La navegació és intuïtiva? (1-5)
- [ ] **VALORAR:** El disseny visual és professional? (1-5)

#### D5. Pàgines legals i blog
- [ ] Obrir la pàgina de política de privacitat
- [ ] Obrir els termes d'ús
- [ ] Verificar que el contingut legal és complet
- [ ] Obrir la secció de blog (si hi ha articles)

#### D6. Accessibilitat bàsica
- [ ] Navegar amb teclat (Tab per moure's entre elements)
- [ ] Verificar contrast de colors (text llegible sobre fons)
- [ ] Verificar que els formularis tenen labels
- [ ] Verificar que les imatges tenen alt text (si aplica)

#### D7. Notificacions
- [ ] Verificar que arriben notificacions in-app
- [ ] Marcar una notificació com a llegida
- [ ] Marcar totes com a llegides
- [ ] Verificar que els emails de benvinguda/verificació arriben

#### D8. Rendiment
- [ ] Obrir DevTools → Network → carrega de la pàgina principal < 3s?
- [ ] Navegar entre pàgines → la transició és fluida?
- [ ] Obrir el dashboard amb dades → carrega en temps raonable?

---

### 👤 USUARI E — Tester mòbil (responsive + mobile UX)

**Entorn:** Preprod (des de mòbil real)  
**Temps estimat:** 2 hores  
**Objectiu:** Validar que tota l'app funciona correctament en mòbil

#### E1. Landing page (mòbil)
- [ ] Obrir la landing page al mòbil
- [ ] Verificar que el menú hamburguesa funciona
- [ ] Verificar que les seccions es veuen bé (no hi ha overflow horitzontal)
- [ ] Verificar que els botons són prou grans per tocar (mínim 44px)
- [ ] Scroll suau sense problemes
- [ ] Plans/pricing llegibles al mòbil

#### E2. Auth (mòbil)
- [ ] Registrar-se des del mòbil
- [ ] Login des del mòbil
- [ ] Login amb Google des del mòbil
- [ ] Els formularis són usables al mòbil? (teclat no tapa camps?)

#### E3. Dashboard (mòbil)
- [ ] El dashboard es veu bé al mòbil?
- [ ] El sidebar es pot obrir/tancar al mòbil?
- [ ] Les targetes de mètriques es veuen bé?
- [ ] Es pot navegar per totes les seccions?

#### E4. Gestió de pacients (mòbil)
- [ ] Es pot crear un pacient des del mòbil?
- [ ] La llista de pacients és llegible?
- [ ] Es pot editar un pacient?

#### E5. Sessions (mòbil)
- [ ] El calendari de sessions funciona al mòbil?
- [ ] Es pot crear una sessió des del mòbil?
- [ ] La gravació d'àudio funciona al mòbil?

#### E6. Videollamada (mòbil)
- [ ] Obrir una videollamada des del mòbil
- [ ] El vídeo i àudio funcionen?
- [ ] Es pot finalitzar correctament?

#### E7. Simulador (mòbil)
- [ ] El simulador funciona bé al mòbil?
- [ ] El chat és usable al mòbil?
- [ ] Les respostes es mostren correctament?

#### E8. Captures de problemes
- [ ] Fer captura de pantalla de qualsevol element que es vegi malament
- [ ] Anotar el model de dispositiu i sistema operatiu
- [ ] Anotar el navegador utilitzat

---

## 4. Planning de validació

### Calendari proposat (1 setmana)

| Dia | Activitat | Qui | Durada |
|-----|-----------|-----|--------|
| **Dilluns** | Preparació: crear comptes de prova, configurar entorn preprod | Tu (Admin) | 1-2h |
| **Dilluns** | Distribució de documents de proves als testers | Tu (Admin) | 30 min |
| **Dimarts** | 🧠 Psicòleg A: Proves A1-A5 (Auth, Dashboard, Clients, Sessions, IA) | Psicòleg A | 3h |
| **Dimarts** | 👤 Usuari D: Proves D1-D4 (Landing, Registre, i18n, Navegació) | Usuari D | 2h |
| **Dimecres** | 🧠 Psicòleg A: Proves A6-A10 (Informes, Video, Pagaments, Calendar, Config) | Psicòleg A | 2h |
| **Dimecres** | 🧠 Psicòleg B: Proves B1-B6 (Flux Basic + Limitacions) | Psicòleg B | 2h |
| **Dimecres** | 👤 Usuari D: Proves D5-D8 (Legal, Accessibilitat, Notificacions, Rendiment) | Usuari D | 1.5h |
| **Dijous** | 🧠 Psicòleg C: Proves C1-C4 (Simulador complet) | Psicòleg C | 2h |
| **Dijous** | 👤 Usuari E: Proves E1-E8 (Tot en mòbil) | Usuari E | 2h |
| **Divendres** | Recull de resultats i classificació de bugs | Tu (Admin) | 2h |
| **Divendres** | Reunió de debrief amb testers (opcional) | Tots | 1h |

### Setmana 2 (si cal)
| Dia | Activitat |
|-----|-----------|
| Dilluns-Dimecres | Correcció de bugs crítics i alts |
| Dijous | Re-test de bugs corregits (testers afectats) |
| Divendres | Validació final i sign-off |

---

## 5. Formulari de resultats per tester

Cada tester ha d'emplenar per cada prova:

| Camp | Valors |
|------|--------|
| **ID Prova** | Ex: A4.3 |
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

---

## 6. Criteris d'acceptació (Go/No-Go)

### ✅ Go (es pot llançar)
- Zero bugs 🔴 Crítics oberts
- Màxim 2 bugs 🟠 Alts oberts (amb workaround documentat)
- Tots els fluxos principals funcionen (registre → sessió → informe)
- Pagaments funcionen correctament
- Funciona en Chrome, Firefox i Safari (desktop + mòbil)
- Els 3 idiomes (CA/ES/EN) funcionen sense textos sense traduir en pantalles principals

### ❌ No-Go (cal corregir abans)
- Qualsevol bug 🔴 Crític obert
- Més de 2 bugs 🟠 Alts sense workaround
- El flux principal de sessió terapèutica no funciona
- Problemes de seguretat (dades clíniques visibles sense autorització)
- Stripe no processa pagaments correctament

---

## 7. Dades de prova recomanades

### Targeta Stripe de test
```
Número: 4242 4242 4242 4242
Caducitat: Qualsevol data futura (ex: 12/30)
CVC: Qualsevol 3 dígits (ex: 123)
```

### Pacients de prova suggerits
```
1. Maria Garcia — Ansietat generalitzada — Risc BAIX
2. Joan Martínez — Depressió major — Risc MITJÀ
3. Anna López — Trastorn alimentari — Risc ALT
4. Pere Fernández — Adiccions — Risc MITJÀ
5. Laura Sánchez — TEPT — Risc ALT
```

> [!CAUTION]
> Mai utilitzeu dades reals de pacients per les proves! Utilitzeu sempre dades fictícies.

---

## 8. Guia per sessions reals (escenaris de role-play)

Els psicòlegs han de parlar en veu alta per generar àudio real. Aquí tens escenaris preparats:

### Escenari 1: Ansietat Generalitzada (3-5 min)
**Context:** Primera sessió amb un pacient de 32 anys que ve per ansietat laboral.
- **Terapeuta:** Explora símptomes, freqüència, impacte en la vida diària
- **Pacient (si hi ha 2 persones):** Descriu nerviosisme constant, insomni, preocupació pel futur
- **Parla sobre:** Tècniques de relaxació, patrons de pensament, objectius terapèutics

### Escenari 2: Depressió (3-5 min)
**Context:** Seguiment amb un pacient de 45 anys amb depressió.
- **Terapeuta:** Revisa l'estat d'ànim, activitat, medicació
- **Pacient:** Descriu apatia, aïllament social, millora parcial amb medicació
- **Parla sobre:** Activació conductual, xarxa de suport, registre d'activitats

### Escenari 3: Parella (5 min, ideal amb 2 persones)
**Context:** Sessió de parella amb conflictes de comunicació.
- **Terapeuta:** Media entre les dues parts
- **Parla sobre:** Escolta activa, comunicació no violenta, expectatives

> [!TIP]
> Si el psicòleg fa les proves sol, pot parlar com si fes un monòleg terapèutic ("Avui em trobo amb el Joan, que ve per ansietat..."). L'important és generar àudio de veu real, no cal que sigui perfecte.

---

## 9. Validació de límits d'ús per pla

Aquesta secció detalla COM validar que els límits funcionen correctament.

### Mètode ràpid per l'admin

Per no haver de crear 25 clients a mà, l'admin pot fer servir una d'aquestes opcions:

1. **Opció A — Modificar temporalment el límit:** Canviar el límit del pla Basic a 3 clients per provar ràpidament que el bloqueig funciona, i després tornar-lo a 25.
2. **Opció B — Crear clients via API/Prisma:** Utilitzar Prisma Studio o l'API per crear clients en bloc.
3. **Opció C — Crear clients mínims:** Crear clients amb només nom i cognom (dades mínimes) per arribar ràpidament al límit.

### Matriu de límits a validar

| Funcionalitat | Basic | Pro | Premium | Estudiant | Com validar |
|--------------|-------|-----|---------|-----------|-------------|
| Clients màxims | 25 | Il·limitats | Il·limitats | 0 | Crear clients fins al límit + 1 |
| Transcripció IA | ❌ | ✅ | ✅ | ❌ | Intentar transcriure → bloqueig? |
| Minuts transcripció | — | Segons pla | Segons pla | — | Transcriure fins esgotar minuts |
| Anàlisi IA | ❌ | ✅ | ✅ | ❌ | Intentar analitzar sessió → bloqueig? |
| Informes IA | ❌ | ✅ | ✅ | ❌ | Intentar generar informe IA |
| Videollamades | ❌ | ✅ | ✅ | ❌ | Intentar crear sessió amb video |
| Simulador | ❌ | ❌ | ✅ | ✅ (limitat) | Intentar accedir al simulador |
| Casos simulador | — | — | Segons pla | Segons pla | Fer casos fins esgotar quota |
| Google Calendar | ❌ | ✅ | ✅ | ❌ | Intentar connectar Google Calendar |
| White label | ❌ | ❌ | ✅ | ❌ | Intentar personalitzar branding |

### Checklist de validació de límits

- [ ] **Límit clients Basic (25):** Crear fins al límit, verificar bloqueig del 26è
- [ ] **Minuts transcripció:** Verificar que el comptador de minuts es mostra i es decrementa
- [ ] **Quota simulador (Estudiant):** Fer sessions fins esgotar la quota, verificar bloqueig
- [ ] **Packs extra:** Comprar un pack de minuts/casos i verificar que s'afegeixen al comptador
- [ ] **Upgrade de pla:** Verificar que els límits canvien immediatament després de l'upgrade
- [ ] **Downgrade de pla:** Verificar què passa amb les dades si es fa downgrade (ex: 50 clients → límit 25)
- [ ] **Cancel·lació:** Verificar què passa amb les funcionalitats quan es cancel·la la suscripció
- [ ] **Expiració:** Verificar què passa quan el període de suscripció caduca

---

## 10. Resum d'hores estimades

| Tester | Hores estimades | Sessions |
|--------|----------------|----------|
| Psicòleg A (Pro/Premium) | 5-6h | 2 sessions |
| Psicòleg B (Basic) | 3-4h | 1-2 sessions |
| Psicòleg C (Estudiant) | 1.5-2h | 1 sessió |
| Usuari D (UX General) | 3-4h | 2 sessions |
| Usuari E (Mòbil) | 2h | 1 sessió |
| **TOTAL** | **14.5-18h** | **7-8 sessions** |

---

*Document generat: Març 2026*  
*Actualitzat: 24 Març 2026 — Afegides sessions reals i validació de límits*
