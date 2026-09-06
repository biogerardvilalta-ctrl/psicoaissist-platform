import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='flex flex-col items-center gap-4'>
        <div className='w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
          <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
            <path d='M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z'/>
          </svg>
        </div>
        <Spinner size='lg' />
        <p className='text-sm text-gray-500 animate-pulse'>PsicoAIssist</p>
      </div>
    </div>
  )
}
