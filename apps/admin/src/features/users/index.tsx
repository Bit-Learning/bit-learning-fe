import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { GetPagedUsers } from './api/UserService'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  // Extract pagination from search params
  const page = (search.page || 1) - 1 // API uses 0-based indexing
  const pageSize = search.pageSize || 10

  // Fetch users from API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => GetPagedUsers({ page, size: pageSize }),
  })

  const users = data?.data?.content || []
  const totalElements = data?.data?.totalElements || 0

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
              {!isLoading && ` (${totalElements} total users)`}
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        {isLoading && (
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-muted-foreground'>Loading users...</div>
          </div>
        )}

        {isError && (
          <div className='flex h-[400px] items-center justify-center'>
            <div className='text-destructive'>
              Error loading users:{' '}
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <UsersTable data={users} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
