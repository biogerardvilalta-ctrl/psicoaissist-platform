export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    readTime: string;
    category: string;
    content: string; // Markdown supported
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'etica-ia-psicologia',
        title: 'Ética en la IA para Psicología: Lo que debes saber',
        excerpt: 'Cómo utilizar herramientas de inteligencia artificial en terapia cumpliendo estrictamente con el GDPR y el código deontológico.',
        date: '2024-12-26',
        author: 'Dra. Elena Miralles',
        readTime: '5 min',
        category: 'Ética y Compliance',
        content: `
## La revolución silenciosa en la consulta

La inteligencia artificial ha llegado a la psicología clínica, no para reemplazar al terapeuta, sino para liberarlo de la carga administrativa. Sin embargo, su uso plantea dudas éticas fundamentales.

### Principios Básicos de Seguridad

1. **Privacidad por diseño**: Nunca introduzcas nombres reales ni datos identificativos en herramientas públicas como ChatGPT.
2. **Supervisión Humana**: La IA sugiere, el profesional decide. Nunca delegues el juicio clínico.
3. **Transparencia**: Es recomendable informar al paciente si utilizas herramientas de soporte para la gestión de sus notas.

### ¿Cómo lo hacemos en PsicoAIssist?

Nuestra plataforma utiliza una capa de anonimización automática y procesa los datos en servidores seguros en Europa, garantizando que la información sensible nunca se utilice para entrenar modelos públicos.
        `
    },
    {
        slug: 'automatizar-notas-clinicas',
        title: 'Cómo automatizar notas clínicas legalmente',
        excerpt: 'Dejar de escribir notas a mano es posible. Descubre cómo ganar 5 horas a la semana automatizando la burocracia.',
        date: '2024-12-20',
        author: 'Marc Soler',
        readTime: '4 min',
        category: 'Productividad',
        content: `
## El problema de las notas infinitas

Se estima que un psicólogo dedica el 20% de su tiempo a tareas administrativas. Si ves a 20 pacientes a la semana, eso son entre 4 y 5 horas redactando informes y notas de evolución.

### La solución tecnológica

Las herramientas de transcripción y resumen automático permiten:
- Grabar la sesión (con consentimiento explícito).
- Transcribir a texto plano.
- Generar un resumen estructurado (SOAP o BIRP).

Con **PsicoAIssist**, este proceso es automático y seguro, permitiéndote centrarte en el paciente, no en el teclado.
        `
    }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
    return BLOG_POSTS;
}
