# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public-simulator.spec.ts >> Public Simulator (The Hook) >> should load demo page and chat with Marta
- Location: tests/e2e/public-simulator.spec.ts:5:9

# Error details

```
TimeoutError: page.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('text=/(Probar|Provar|Try) Simulador/i')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e4]:
      - link "PsicoAIssist" [ref=e5] [cursor=pointer]:
        - /url: /en
      - navigation [ref=e10]:
        - link "Features" [ref=e11] [cursor=pointer]:
          - /url: /en#features
        - link "Simulator" [ref=e12] [cursor=pointer]:
          - /url: /en/simulator/try
        - link "Pricing" [ref=e13] [cursor=pointer]:
          - /url: /en#pricing
        - link "Documentation" [ref=e14] [cursor=pointer]:
          - /url: /en/docs
        - link "Blog" [ref=e15] [cursor=pointer]:
          - /url: /en/blog
        - link "Legal" [ref=e16] [cursor=pointer]:
          - /url: /en/legal?tab=terms
        - button "Cambiar idioma" [ref=e22] [cursor=pointer]
      - generic [ref=e24]:
        - link "For Clinics" [ref=e25] [cursor=pointer]:
          - /url: /en/clinics
        - link "Log in" [ref=e30] [cursor=pointer]:
          - /url: /en/auth/login
        - link "Try free" [ref=e34] [cursor=pointer]:
          - /url: /en/auth/register
  - main [ref=e38]:
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]: Ethical AI for Psychologists
        - heading "Empower your psychology practice with responsible AI" [level=1] [ref=e49]:
          - generic [ref=e50]: Empower your
          - generic [ref=e51]: psychology practice
          - generic [ref=e52]: with responsible AI
        - paragraph [ref=e53]: Automatic transcription, intelligent analysis, and secure client management. Designed by psychologists, for psychologists. Full GDPR compliance.
        - generic [ref=e54]:
          - generic [ref=e55]: 100% Confidential
          - generic [ref=e59]: Real-time AI
          - generic [ref=e63]: Intelligent Analysis
          - generic [ref=e68]: Easy to Use
        - generic [ref=e72]:
          - link "Start for Free" [ref=e73] [cursor=pointer]:
            - /url: /en/auth/register
          - link "🎮 Try Simulator" [ref=e76] [cursor=pointer]:
            - /url: /en/simulator/try
        - link "Representing an institution? See solutions for clinics" [ref=e78] [cursor=pointer]:
          - /url: /en/clinics
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]: AI Assistant
            - generic [ref=e89]: Live
          - paragraph [ref=e91]: Real-time analysis • 100% Private
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: Live Transcription
            - generic [ref=e98]: "Patient: \"I feel like no one takes me seriously at work.\" Therapist: \"That must be frustrating. Tell me more about that.\" Patient: \"I just shut up and say nothing.\""
          - generic [ref=e100]:
            - heading "Observations" [level=4] [ref=e104]
            - generic [ref=e105]: Feeling of invisibility
          - generic [ref=e110]:
            - heading "Suggested Questions" [level=4] [ref=e114]
            - generic [ref=e116] [cursor=pointer]:
              - paragraph [ref=e117]: What do you fear would happen if you spoke up?
              - generic [ref=e118]: Add to notes
          - generic [ref=e121]:
            - heading "Considerations" [level=4] [ref=e125]
            - paragraph [ref=e128]: Validate underlying emotion
        - paragraph [ref=e130]: AI Assistance © 2025 • PsicoAIssist
    - generic [ref=e134]:
      - generic [ref=e135]:
        - generic [ref=e136]: Features
        - heading "Everything you need for a modern practice" [level=2] [ref=e137]
        - paragraph [ref=e138]: Designed specifically for psychologists, with tools that respect professional ethics.
      - generic [ref=e140]:
        - generic [ref=e147]:
          - heading "Automatic Transcription" [level=3] [ref=e148]
          - paragraph [ref=e149]: Convert your spoken sessions into text with 95% accuracy. Compatible with Spanish, Catalan, and English.
        - generic [ref=e156]:
          - heading "Ethical AI Analysis" [level=3] [ref=e157]
          - paragraph [ref=e158]: Intelligent suggestions based on validated therapeutic techniques. Without replacing your professional judgment.
        - generic [ref=e165]:
          - heading "Automatic Reports" [level=3] [ref=e166]
          - paragraph [ref=e167]: Generate professional reports following psychological standards. Customizable to your practice.
        - generic [ref=e173]:
          - heading "Total Security" [level=3] [ref=e174]
          - paragraph [ref=e175]: AES-256 encryption, GDPR compliance. Your data and your clients' data are protected.
        - generic [ref=e181]:
          - heading "Smart Analytics" [level=3] [ref=e182]
          - paragraph [ref=e183]: Visualize your clients' progress with objective metrics and interactive charts.
        - generic [ref=e192]:
          - heading "Client Management" [level=3] [ref=e193]
          - paragraph [ref=e194]: Organize files, clinical history, and sessions in an intuitive and secure system.
        - generic [ref=e201]:
          - heading "Save Time" [level=3] [ref=e202]
          - paragraph [ref=e203]: Reduce administrative time by 70%. More time for what really matters.
        - generic [ref=e210]:
          - heading "Absolute Privacy" [level=3] [ref=e211]
          - paragraph [ref=e212]: Only you have access to your information. Even we cannot see your clinical data.
      - generic [ref=e214]:
        - generic [ref=e215]: 14-day free trial
        - generic [ref=e217]: No credit card required
        - generic [ref=e219]: Support in Spanish/English
    - generic [ref=e222]:
      - generic [ref=e223]:
        - generic [ref=e224]: Pricing
        - heading "Plans designed for every career stage" [level=2] [ref=e225]
        - paragraph [ref=e226]: Start for free with our Demo Plan. Subscribe when you need more.
      - generic [ref=e228]:
        - button "Monthly" [ref=e229] [cursor=pointer]
        - button "Yearly(2 months free)" [ref=e230] [cursor=pointer]
      - generic [ref=e231]:
        - generic [ref=e232]: PLANES INDIVIDUALES
        - generic [ref=e233]:
          - generic [ref=e235]:
            - generic [ref=e236]:
              - heading "Basic" [level=3] [ref=e237]
              - paragraph [ref=e238]: Perfect for independent psychologists just starting
              - generic [ref=e240]:
                - generic [ref=e241]: €29
                - generic [ref=e242]: /mes
            - list [ref=e244]:
              - listitem [ref=e245]:
                - generic [ref=e249]: Up to 25 active clients
              - listitem [ref=e250]:
                - generic [ref=e254]: 10 Hours Transcription (text only)
              - listitem [ref=e255]:
                - generic [ref=e259]: Basic booking and invoicing
              - listitem [ref=e260]:
                - generic [ref=e264]: Manual clinical notes
              - listitem [ref=e265]:
                - generic [ref=e269]: 5GB Storage
              - listitem [ref=e270]:
                - generic [ref=e275]: No Generative AI (0 min/month)
              - listitem [ref=e276]:
                - generic [ref=e281]: No Clinical Simulator
              - listitem [ref=e282]:
                - generic [ref=e287]: No Google Calendar Synchronization
            - button "Get Basic" [ref=e289] [cursor=pointer]
          - generic [ref=e290]:
            - generic [ref=e291]: Más popular
            - generic [ref=e295]:
              - generic [ref=e296]:
                - heading "Pro" [level=3] [ref=e297]
                - paragraph [ref=e298]: Most popular option for professional practice
                - generic [ref=e300]:
                  - generic [ref=e301]: €59
                  - generic [ref=e302]: /mes
              - list [ref=e304]:
                - listitem [ref=e305]:
                  - generic [ref=e309]: Unlimited patients
                - listitem [ref=e310]:
                  - generic [ref=e314]: 15h (900 min) Transcription + AI
                - listitem [ref=e315]:
                  - generic [ref=e319]: Google Calendar Synchronization
                - listitem [ref=e320]:
                  - generic [ref=e324]: Clinical Simulator (5 cases/month)
                - listitem [ref=e325]:
                  - generic [ref=e329]: 50GB Storage
                - listitem [ref=e330]:
                  - generic [ref=e334]: Priority Support
              - button "Get Pro" [ref=e336] [cursor=pointer]
          - generic [ref=e338]:
            - generic [ref=e339]:
              - heading "Premium" [level=3] [ref=e340]
              - paragraph [ref=e341]: For specialists with high workload
              - generic [ref=e343]:
                - generic [ref=e344]: €99
                - generic [ref=e345]: /mes
            - list [ref=e347]:
              - listitem [ref=e348]:
                - generic [ref=e352]: Everything in Pro
              - listitem [ref=e353]:
                - generic [ref=e357]: 50h (3,000 min) Transcription + AI
              - listitem [ref=e358]:
                - generic [ref=e362]: Unlimited Clinical Simulator
              - listitem [ref=e363]:
                - generic [ref=e367]: 1TB Storage
              - listitem [ref=e368]:
                - generic [ref=e372]: Priority Support + Video Call
              - listitem [ref=e373]:
                - generic [ref=e377]: Custom Branding
            - button "Get Premium" [ref=e379] [cursor=pointer]
      - paragraph [ref=e380]: "* Fair Use Policy applies to unlimited storage."
      - generic [ref=e381]:
        - generic [ref=e382]:
          - generic [ref=e383]:
            - heading [level=3] [ref=e384]
            - generic [ref=e389]:
              - generic [ref=e390]:
                - heading "For Health Centers, Universities, and Hospitals" [level=3] [ref=e391]
                - paragraph [ref=e392]:
                  - generic [ref=e393]: Custom
                - paragraph [ref=e394]: Centers prioritizing training and control
                - list [ref=e395]:
                  - listitem [ref=e396]:
                    - generic [ref=e400]: Unlimited users (custom)
                  - listitem [ref=e401]:
                    - generic [ref=e405]: Corporate AI (5,000+ min/month)
                  - listitem [ref=e406]:
                    - generic [ref=e410]: Clinical Simulator (custom cases/month)
                  - listitem [ref=e411]:
                    - generic [ref=e415]: API Access (HIS integration)
                  - listitem [ref=e416]:
                    - generic [ref=e420]: Advanced Compliance (GDPR Audit) and SSO
                  - listitem [ref=e421]:
                    - generic [ref=e425]: Dedicated Onboarding
                  - listitem [ref=e426]:
                    - generic [ref=e430]: Unified Billing
              - link "Contact Sales" [ref=e432] [cursor=pointer]:
                - /url: mailto:suport@psicoaissist.com
          - generic [ref=e433]:
            - heading "Extras and Additional Services" [level=3] [ref=e434]
            - generic [ref=e435]:
              - generic [ref=e436]:
                - generic [ref=e437]:
                  - generic [ref=e441]:
                    - heading "Agenda Manager" [level=4] [ref=e442]
                    - paragraph [ref=e443]: Solo para planes Pro+
                  - generic [ref=e444]:
                    - generic [ref=e445]: 15€
                    - text: /mes
                - paragraph [ref=e446]: Delegate your appointment management. Add an administrative user.
              - generic [ref=e447]:
                - generic [ref=e448]:
                  - generic [ref=e452]:
                    - heading "AI Minute Pack" [level=4] [ref=e453]
                    - paragraph [ref=e454]: Solo para planes Pro+
                  - generic [ref=e455]:
                    - generic [ref=e456]: 15€
                    - text: /500 min
                - paragraph [ref=e457]: A month with many patients? Add extra minutes to your plan.
              - generic [ref=e458]:
                - generic [ref=e459]:
                  - generic [ref=e466]:
                    - heading "Onboarding Session" [level=4] [ref=e467]
                    - paragraph [ref=e468]: Puesta en marcha
                  - generic [ref=e469]:
                    - generic [ref=e470]: 50€
                    - text: pago único
                - paragraph [ref=e471]: We set up your account with you in 45 min. Operation guarantee.
              - generic [ref=e472]:
                - generic [ref=e473]:
                  - generic [ref=e477]:
                    - heading "Simulator Pack" [level=4] [ref=e478]
                    - paragraph [ref=e479]: Solo para planes Pro+
                  - generic [ref=e480]:
                    - generic [ref=e481]: 15€
                    - text: /10 casos
                - paragraph [ref=e482]: Expand your practical training. Add a pack of 10 clinical cases.
        - generic [ref=e483]:
          - paragraph [ref=e484]:
            - text: Need a custom plan?
            - link "Contáctanos" [ref=e485] [cursor=pointer]:
              - /url: mailto:suport@psicoaissist.com
          - generic [ref=e486]:
            - generic [ref=e487]: Cancel anytime
            - generic [ref=e489]: Data always yours
    - generic [ref=e492]:
      - generic [ref=e493]:
        - generic [ref=e494]: Frequently Asked Questions
        - heading "We have answers" [level=2] [ref=e498]
        - paragraph [ref=e499]: Responses to the most common questions about PsicoAIssist.
      - generic [ref=e500]:
        - generic [ref=e501]:
          - button "Is PsicoAIssist safe for confidential patient data? Security" [ref=e502] [cursor=pointer]:
            - generic [ref=e503]:
              - heading "Is PsicoAIssist safe for confidential patient data?" [level=3] [ref=e504]
              - generic [ref=e505]: Security
          - generic: Absolutely. PsicoAIssist complies with GDPR, LOPD-GDD, and international security standards. We use AES-256 encryption, servers in Europe, and never store unencrypted data. Each session is processed in an isolated and secure manner.
        - generic [ref=e511]:
          - button "How does automatic transcription work? Functionality" [ref=e512] [cursor=pointer]:
            - generic [ref=e513]:
              - heading "How does automatic transcription work?" [level=3] [ref=e514]
              - generic [ref=e515]: Functionality
          - generic: Our AI system listens to the session in real-time and transcribes automatically. It recognizes speech in Spanish (including regional accents), Catalan, and English, identifies speakers (therapist/patient), and formats text professionally. Accuracy is 95%+. Audio is processed in real-time and is NEVER recorded or stored on our servers.
        - generic [ref=e521]:
          - button "Can I customize the generated reports? Customization" [ref=e522] [cursor=pointer]:
            - generic [ref=e523]:
              - heading "Can I customize the generated reports?" [level=3] [ref=e524]
              - generic [ref=e525]: Customization
          - generic: Yes. With the Premium plan, you can configure your "Personal Brand" settings. This allows you to add your logo, clinic name, and corporate colors, which will be automatically applied to all PDF and Word reports generated to maintain your professional image.
        - generic [ref=e531]:
          - button "What happens if I cancel my subscription? Billing" [ref=e532] [cursor=pointer]:
            - generic [ref=e533]:
              - heading "What happens if I cancel my subscription?" [level=3] [ref=e534]
              - generic [ref=e535]: Billing
          - generic: You retain access to all your data for 90 days. You can export all sessions, reports, and notes at any time. If you decide to return during this period, simply log in with your old credentials to reactivate your account automatically.
        - generic [ref=e541]:
          - button "Is there a limit on the number of patients? Plans" [ref=e542] [cursor=pointer]:
            - generic [ref=e543]:
              - heading "Is there a limit on the number of patients?" [level=3] [ref=e544]
              - generic [ref=e545]: Plans
          - generic: It depends on the plan. The Basic plan includes up to 25 patients. Pro and Premium plans allow unlimited patients. Premium adds advanced features like personal branding and higher AI capacity. For clinics and hospitals, we have tailored corporate plans.
        - generic [ref=e551]:
          - button "Do you offer technical support? Support" [ref=e552] [cursor=pointer]:
            - generic [ref=e553]:
              - heading "Do you offer technical support?" [level=3] [ref=e554]
              - generic [ref=e555]: Support
          - generic: Yes, our support team speaks Spanish, Catalan, and English and will assist you via email. Video calls are available for onboarding, higher plans, or if the technical team deems it necessary. We also offer full documentation in these languages.
        - generic [ref=e561]:
          - button "Can I integrate PsicoAIssist with my current system? Integration" [ref=e562] [cursor=pointer]:
            - generic [ref=e563]:
              - heading "Can I integrate PsicoAIssist with my current system?" [level=3] [ref=e564]
              - generic [ref=e565]: Integration
          - generic: We offer APIs and integrations with major clinic management systems. You can also export data to import into your existing system. Our technical team can help you with the integration.
        - generic [ref=e571]:
          - button "What languages does the system support? Functionality" [ref=e572] [cursor=pointer]:
            - generic [ref=e573]:
              - heading "What languages does the system support?" [level=3] [ref=e574]
              - generic [ref=e575]: Functionality
          - generic: Mainly Catalan, Spanish, and English with high accuracy. We will consider adding more languages based on user demand.
        - generic [ref=e581]:
          - button "Is there a free trial period? Billing" [ref=e582] [cursor=pointer]:
            - generic [ref=e583]:
              - heading "Is there a free trial period?" [level=3] [ref=e584]
              - generic [ref=e585]: Billing
          - generic: We have a 14-day Demo Plan to try. You can test key functionalities (with usage limits) at no cost before choosing your professional plan.
      - generic [ref=e592]:
        - heading "¿No encuentras la respuesta que buscas?" [level=3] [ref=e597]
        - paragraph [ref=e598]: Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos en menos de 24 horas.
        - link "Contáctanos" [ref=e599] [cursor=pointer]:
          - /url: mailto:suport@psicoaissist.com
      - link "Ver documentación completa →" [ref=e604] [cursor=pointer]:
        - /url: /docs
        - text: Ver documentación completa
        - generic [ref=e605]: →
    - generic [ref=e613]:
      - generic [ref=e614]: "Limited Offer: 50% discount first month"
      - heading "Ready to transform your psychology practice?" [level=2] [ref=e618]:
        - text: Ready to transform
        - generic [ref=e619]: your psychology practice?
      - paragraph [ref=e620]: Join over 500 psychologists who are already saving 3+ hours daily.
      - generic [ref=e621]:
        - generic [ref=e622]: Instant Setup
        - generic [ref=e626]: 100% Secure
        - generic [ref=e630]: 24/7 Support
        - generic [ref=e634]: No Commitment
      - generic [ref=e638]:
        - link "Start for Free Now" [ref=e639] [cursor=pointer]:
          - /url: /en/auth/register
        - button [ref=e642] [cursor=pointer]
      - paragraph [ref=e647]: No credit card required • Free setup • Support included
      - generic [ref=e650]:
        - generic [ref=e651]:
          - paragraph [ref=e652]: Special Launch Offer
          - paragraph [ref=e653]: Get 50% discount on your first subscription
        - generic [ref=e654]:
          - generic [ref=e655]:
            - generic [ref=e656]: "02"
            - text: Days
          - generic [ref=e657]:
            - generic [ref=e658]: "14"
            - text: Hours
          - generic [ref=e659]:
            - generic [ref=e660]: "35"
            - text: Minutes
  - contentinfo [ref=e661]:
    - generic [ref=e663]:
      - generic [ref=e664]:
        - generic [ref=e665]: PsicoAIssist
        - paragraph [ref=e670]: Transforming psychological practice with artificial intelligence. We help mental health professionals optimize their time and improve patient care.
        - generic [ref=e671]: 100% Secure and Confidential
      - generic [ref=e675]:
        - heading "Links" [level=3] [ref=e676]
        - list [ref=e677]:
          - listitem [ref=e678]:
            - link "Documentation" [ref=e679] [cursor=pointer]:
              - /url: /docs
          - listitem [ref=e684]:
            - link "Privacy Policy" [ref=e685] [cursor=pointer]:
              - /url: /legal?tab=gdpr
          - listitem [ref=e690]:
            - link "Terms and Conditions" [ref=e691] [cursor=pointer]:
              - /url: /legal?tab=terms
          - listitem [ref=e696]:
            - link "Cookie Policy" [ref=e697] [cursor=pointer]:
              - /url: /legal?tab=cookies
      - generic [ref=e702]:
        - heading "Contact" [level=3] [ref=e703]
        - link [ref=e705] [cursor=pointer]:
          - /url: mailto:suport@psicoaissist.com
    - generic [ref=e712]:
      - generic [ref=e713]: © 2026 PsicoAIssist. All rights reserved.
      - generic [ref=e714]:
        - generic [ref=e715]: GDPR Compliant
        - generic [ref=e719]: AES-256 Encryption
  - region "Notifications (F8)":
    - list
  - alert [ref=e723]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Public Simulator (The Hook)', () => {
  4  | 
  5  |     test('should load demo page and chat with Marta', async ({ page }) => {
  6  |         // 1. Navigate to Landing Page
  7  |         await page.goto('/');
  8  | 
  9  |         // 2. Click on "Probar Simulador"
> 10 |         await page.click('text=/(Probar|Provar|Try) Simulador/i');
     |                    ^ TimeoutError: page.click: Timeout 15000ms exceeded.
  11 | 
  12 |         // 3. Verify URL is /simulator/try
  13 |         await expect(page).toHaveURL(/\/simulator\/try/);
  14 | 
  15 |         // 4. Verify "Marta" profile is visible (API success)
  16 |         await expect(page.getByText('Marta R.')).toBeVisible({ timeout: 10000 });
  17 |         await expect(page.getByText('Ansietat Social')).toBeVisible();
  18 | 
  19 |         // 5. Send a message
  20 |         const input = page.getByPlaceholder('Escribe tu mensaje...');
  21 |         await input.fill('Hola Marta, ¿cómo te sientes hoy?');
  22 |         await input.press('Enter');
  23 | 
  24 |         // 6. Verify "Escribiendo..." appears
  25 |         await expect(page.getByText('Escribiendo...')).toBeVisible();
  26 | 
  27 |         // 7. Verify we get a response (Demo mode might be fast, so wait for Any response from model)
  28 |         // The model response usually doesn't have a specific class but we check for a bubble that is NOT the user's.
  29 |         // User message: bg-blue-600
  30 |         // Model message: bg-gray-100
  31 |         // We can just wait for the loading to disappear and check count.
  32 |         await expect(page.getByText('Escribiendo...')).toBeHidden({ timeout: 15000 });
  33 | 
  34 |         // Check if there is a response bubble (gray)
  35 |         const bubbles = page.locator('.bg-gray-100.text-gray-800');
  36 |         // We expect at least 1 model bubble (if welcome msg is not there, then 1 after our chat. The code implies no welcome msg initially unless hardcoded?)
  37 |         // In my code: no initial welcome message in `messages` state. Only after chat.
  38 |         // So expect 1.
  39 |         await expect(bubbles).toHaveCount(1);
  40 |     });
  41 | });
  42 | 
```