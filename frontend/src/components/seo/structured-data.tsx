export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PsycoAI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Asistente IA para psicólogos que proporciona transcripción automática, análisis inteligente e informes profesionales para mejorar la práctica psicológica.",
    "url": "https://psycoai.com",
    "author": {
      "@type": "Organization",
      "name": "PsycoAI",
      "url": "https://psycoai.com"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Plan Básico",
        "price": "29",
        "priceCurrency": "EUR",
        "billingIncrement": "P1M",
        "description": "Perfecto para psicólogos independientes que comienzan"
      },
      {
        "@type": "Offer",
        "name": "Plan Pro",
        "price": "59", 
        "priceCurrency": "EUR",
        "billingIncrement": "P1M",
        "description": "Para profesionales establecidos que buscan escalar"
      },
      {
        "@type": "Offer", 
        "name": "Plan Premium",
        "price": "99",
        "priceCurrency": "EUR",
        "billingIncrement": "P1M",
        "description": "Solución empresarial para clínicas y centros"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "500"
    },
    "featureList": [
      "Transcripción automática de sesiones",
      "Análisis inteligente con IA",
      "Informes profesionales automatizados",
      "Gestión segura de clientes",
      "Analytics avanzados",
      "Cumplimiento GDPR"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}