# 📋 Guia de Proves: Psicòleg A (Perfil Pro/Premium)

> **Perfil:** Professional experimentat
> **Entorn:** Preproducció
> **Temps estimat:** 4-5 hores
> **Objectiu:** Validar totes les funcionalitats avançades amb sessions reals

> [!IMPORTANT]
> **Sessions reals obligatòries.** Aquest tester ha de fer sessions parlant en veu alta (no escrivint al xat). L'objectiu és generar àudio real per validar la transcripció i la IA. Pots fer-ho sol (parlant com si fessis teràpia) o amb una altra persona fent de pacient.

---

## 1. Autenticació i perfil
- [ ] Registrar-se amb email i contrasenya
- [ ] Verificar email (si aplica)
- [ ] Login amb Google OAuth
- [ ] Completar perfil professional (núm. col·legiat, especialitat, etc.)
- [ ] Canviar contrasenya
- [ ] Canviar idioma preferit (CA → ES → EN)
- [ ] Tancar sessió i tornar a entrar

## 2. Dashboard principal
- [ ] Visualitzar mètriques resum (pacients, sessions, etc.)
- [ ] Comprovar que les targetes del dashboard mostren dades correctes
- [ ] Verificar que el sidebar mostra opcions segons el pla (Pro/Premium)
- [ ] Provar les notificacions (campana)
- [ ] Verificar activitat recent

## 3. Gestió de pacients (Clients)
- [ ] Crear un pacient nou amb totes les dades
- [ ] Verificar que les dades es guarden correctament (es mostren bé)
- [ ] Editar dades d'un pacient existent
- [ ] Cercar pacients per nom
- [ ] Filtrar pacients per nivell de risc
- [ ] Veure el detall complet d'un pacient
- [ ] Desactivar un pacient
- [ ] Crear un mínim de 5 pacients de prova

## 4. Sessions terapèutiques REALS (amb àudio parlat)

> 📢 **Com fer-ho:** Has de parlar en veu alta simulant una sessió de teràpia real. Mínim 3-5 minuts d'àudio per poder valorar la transcripció i la IA.

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
- [ ] **🎙️ SESSIÓ REAL 3 (opcional):** Repetir en **anglès** si et sents còmode
- [ ] Crear una sessió i cancel·lar-la (estat "Cancel·lada")
- [ ] **VALORAR:** Temps entre pujar l'àudio i rebre la transcripció (anotar segons/minuts)

## 5. Intel·ligència Artificial (sobre sessions reals)

> 📢 **Important:** Aquestes proves s'han de fer SOBRE les sessions reals gravades al pas anterior.

- [ ] Sol·licitar anàlisi IA de la sessió real transcrita
- [ ] **VALORAR:** La IA ha identificat correctament el tema principal? (Sí/No)
- [ ] **VALORAR:** Les suggerències de la IA són rellevants per al cas? (1-5)
- [ ] **VALORAR:** El to és adequat (suggerència, no diagnòstic)? (Sí/No)
- [ ] **VALORAR:** La IA detecta patrons emocionals en el discurs? (Sí/No)
- [ ] Sol·licitar suggerències terapèutiques per al pacient
- [ ] **VALORAR:** Les suggerències afegeixen valor real al professional? (1-5)
- [ ] **VALORAR:** Seria perillós seguir alguna suggerència sense criteri professional? (Sí/No — si sí, detallar)
- [ ] Verificar que el disclaimer "No és un diagnòstic" és visible
- [ ] Comparar l'anàlisi de sessions en català vs espanyol — hi ha diferència de qualitat?

## 6. Informes clínics
- [ ] Generar un informe automàtic amb IA a partir d'una sessió
- [ ] **VALORAR:** La qualitat de l'informe generat (1-5)
- [ ] **VALORAR:** L'estructura de l'informe és professional? (Sí/No)
- [ ] Editar l'informe generat manualment
- [ ] Crear un informe des de zero (manual)
- [ ] Exportar a PDF — verificar format i contingut
- [ ] Exportar a Word (.docx) — verificar format i contingut
- [ ] Confirmar l'informe com a revisat (`humanReviewConfirmed`)
- [ ] Canviar estat: Esborrany → En revisió → Completat → Arxivat

## 7. Videollamades
- [ ] Crear una sessió amb videollamada
- [ ] Obrir l'enllaç de videollamada en un altre navegador/dispositiu
- [ ] Verificar connexió de vídeo i àudio
- [ ] Verificar que funciona en Chrome, Firefox, Safari
- [ ] Provar compartir pantalla (si disponible)
- [ ] Finalitzar la videollamada

## 8. Pagaments i subscripció
- [ ] Veure els plans disponibles
- [ ] Simular una subscripció (Stripe mode test: `4242 4242 4242 4242`, Qualsevol data i CVC `123`)
- [ ] Verificar que el pla s'activa i el rol canvia
- [ ] Verificar que les funcionalitats del pla estan habilitades
- [ ] Cancel·lar subscripció i verificar efectes

## 9. Google Calendar
- [ ] Connectar compte Google Calendar
- [ ] Crear una sessió i verificar que apareix al Google Calendar
- [ ] Editar una sessió i verificar sincronització
- [ ] Cancel·lar una sessió i verificar que s'elimina del calendari

## 10. Configuració
- [ ] Editar perfil (nom, telèfon, especialitat)
- [ ] Canviar horari laboral i durada per defecte
- [ ] Configurar buffer time entre sessions
- [ ] Veure facturació / billing

---

### Escenaris de role-play (Per generar àudio real)

**Escenari 1: Ansietat Generalitzada (3-5 min)**
- **Terapeuta:** Explora símptomes, freqüència, impacte en la vida diària.
- **Pacient:** Descriu nerviosisme constant, insomni, preocupació pel futur.
- **Parla sobre:** Tècniques de relaxació, patrons de pensament.

**Escenari 2: Depressió (3-5 min)**
- **Terapeuta:** Revisa l'estat d'ànim, activitat, medicació.
- **Pacient:** Descriu apatia, aïllament social, millora parcial amb medicació.
- **Parla sobre:** Activació conductual, xarxa de suport.

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
