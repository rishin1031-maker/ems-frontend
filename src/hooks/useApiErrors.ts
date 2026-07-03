import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '@/api/types/common'

export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string | null {
  const apiErr = error as ApiError
  if (apiErr.errors) {
    Object.entries(apiErr.errors).forEach(([field, messages]) => {
      setError(field as Path<T>, { message: messages[0] })
    })
  }
  return apiErr.message ?? 'Something went wrong'
}
