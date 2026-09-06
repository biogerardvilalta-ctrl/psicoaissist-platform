import { Metadata } from 'next'
import { Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contacte | PsicoAIssist',
  description: 'Posa\'t en contacte amb l\'equip de PsicoAIssist'
}

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 py-20 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contacte</h1>
          <p className='text-lg text-gray-600'>El nostre equip estarà encantat d\'ajudar-te</p>
        </div>
        <div className='grid gap-6'>
          <Card className='shadow-lg border-0 rounded-2xl'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center'>
                  <Mail className='w-5 h-5 text-violet-600' />
                </div>
                Suport Tècnic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600 mb-4'>Per a qualsevol consulta tècnica o de la plataforma:</p>
              <Button asChild className='bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700'>
                <a href='mailto:suport@psicoaissist.com'>suport@psicoaissist.com</a>
              </Button>
            </CardContent>
          </Card>
          <Card className='shadow-lg border-0 rounded-2xl'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center'>
                  <MessageSquare className='w-5 h-5 text-indigo-600' />
                </div>
                Vendes i Clíniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600 mb-4'>Per a plans corporatius, clíniques i grups:</p>
              <Button asChild variant='outline'>
                <a href='mailto:vendes@psicoaissist.com'>vendes@psicoaissist.com</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
