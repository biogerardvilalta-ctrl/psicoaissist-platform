import Link from 'next/link';
import { getAllPosts } from '@/lib/blog-data';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useTranslations } from 'next-intl';

export const metadata = {
    title: 'Blog para Psicólogos Digitales | PsicoAIssist',
    description: 'Artículos sobre tecnología, ética y gestión clínica para psicólogos modernos.',
};

export default function BlogIndex() {
    const t = useTranslations('Blog');
    const posts = getAllPosts();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                            {t('title')}
                        </h1>
                        <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <article key={post.slug} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
                                            {post.category}
                                        </span>
                                    </div>
                                    <Link href={`/blog/${post.slug}`} className="block group">
                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 line-clamp-3 mb-4">
                                            {post.excerpt}
                                        </p>
                                    </Link>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                    <Link href={`/blog/${post.slug}`} className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 group">
                                        {t('readMore')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
