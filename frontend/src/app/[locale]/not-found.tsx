'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full text-center'>
        <div className='mb-8 flex justify-center'>
          <div className='w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl'>
            <Heart className='w-10 h-10 text-white' />
          </div>
        </div>
        <h1 className='text-8xl font-black text-violet-600 mb-4'>404</h1>
        <h2 className='text-2xl font-bold text-gray-900 mb-3'>Pàgina no trobada</h2>
        <p className='text-gray-500 mb-8'>La pàgina que busques no existeix o ha estat moguda.</p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button asChild className='bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'>
            <Link href='/'>Tornar a l\'inici</Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/dashboard'>Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
