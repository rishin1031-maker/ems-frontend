import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description ?? 'Coming in a future phase.'} />
      <Card>
        <p className="text-sm text-gray-500">
          This module is scaffolded and will be implemented in the next development phase.
        </p>
      </Card>
    </div>
  )
}
