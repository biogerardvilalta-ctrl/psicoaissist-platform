import { Link } from '@/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

// Basic markdown-like renderer if we don't have a library installed, 
// or just display line breaks. For simplicity in this step without installing deps,
// I will just map newlines to paragraphs.

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);
    if (!post) return { title: 'Post no encontrado' };

    return {
        title: `${post.title} | PsicoAIssist Blog`,
        description: post.excerpt,
    };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    // Simple parser for the content to render paragraphs/headers roughly
    const contentElements = post.content.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
        if (line.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{line.replace('## ', '')}</h2>;
        if (line.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
        if (line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc text-gray-700 mb-2">{line.replace('- ', '')}</li>;
        if (line.match(/^\d+\./)) return <li key={idx} className="ml-4 list-decimal text-gray-700 mb-2">{line.replace(/^\d+\.\s*/, '')}</li>;
        return <p key={idx} className="text-gray-700 leading-relaxed mb-4">{line}</p>;
    });

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <article className="pt-24 pb-16">
                {/* Header */}
                <header className="max-w-3xl mx-auto px-4 sm:px-6 mb-12 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Volver al Blog
                        </Link>
                        <span className="text-gray-300">|</span>
                        <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
                            {post.category}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} min lectura</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="prose prose-indigo prose-lg mx-auto">
                        <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                            {post.excerpt}
                        </p>

                        <div className="space-y-2">
                            {contentElements}
                        </div>
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-gray-100">
                    <div className="bg-indigo-50 rounded-2xl p-8 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Te ha parecido útil?</h3>
                        <p className="text-gray-600 mb-6">Únete a PsicoAIssist y empieza a aplicar estos consejos hoy mismo.</p>
                        <div className="flex justify-center gap-4">
                            <Link href="/auth/register" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                                Probar Gratis
                            </Link>
                            <button className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-2 px-6 py-3">
                                <Share2 className="w-4 h-4" /> Compartir Artículo
                            </button>
                        </div>
                    </div>
                </div>
            </article>
            <Footer />
        </div>
    );
}
