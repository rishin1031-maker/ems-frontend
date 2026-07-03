import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">Page not found</p>
      <Link to="/login">
        <Button theme="admin">Go to Login</Button>
      </Link>
    </div>
  )
}
