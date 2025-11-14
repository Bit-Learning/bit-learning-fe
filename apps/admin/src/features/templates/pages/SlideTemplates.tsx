import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { getTemplates } from '../api/templates-api'
import { TemplateFormDialog } from '../components/template-form-dialog'
import { TemplatesTable } from '../components/templates-table'

const route = getRouteApi('/_authenticated/templates/')

export function SlideTemplates() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Extract pagination from search params
  const page = (search.page || 1) - 1 // API uses 0-based indexing
  const pageSize = search.pageSize || 10

  // Fetch templates from API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['slide-templates', page, pageSize],
    queryFn: () => getTemplates({ page, size: pageSize }),
  })

  const templates = data?.content || []
  const totalElements = data?.totalElements || 0

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h3 className='text-xl font-semibold'>Quản lý mẫu slide</h3>
          <p className='text-muted-foreground'>
            Quản lý tất cả mẫu slide trong hệ thống
            {!isLoading && ` (${totalElements} mẫu)`}
          </p>
        </div>
        <TemplateFormDialog />
      </div>

      {isLoading && (
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-muted-foreground'>Đang tải mẫu...</div>
        </div>
      )}

      {isError && (
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-destructive'>
            Lỗi khi tải mẫu:{' '}
            {error instanceof Error ? error.message : 'Lỗi không xác định'}
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <TemplatesTable data={templates} search={search} navigate={navigate} />
      )}
    </div>
  )
}
