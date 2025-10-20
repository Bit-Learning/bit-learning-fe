import { LucideIcon, CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react'

export type NavLink = {
    title: string
    to: string
    description?: string
    icon?: LucideIcon
}

export type NavDropdown = {
    label: string
    type: 'dropdown'
    items: NavLink[]
}

export type NavSingle = {
    label: string
    to: string
    type?: 'link'
}

export type NavItem = NavSingle | NavDropdown

export const NAV_ITEMS: NavItem[] = [
    {
        label: 'Trang chủ',
        to: '/',
    },
    {
        label: 'Về chúng tôi',
        to: '/about',
    },
    {
        label: 'Các sản phẩm',
        type: 'dropdown',
        items: [
            {
                title: 'All Products',
                to: '/products',
                description: 'Browse our full product catalog.',
            },
            {
                title: 'New Arrivals',
                to: '/products/new',
                description: 'Check out the latest additions.',
            },
            {
                title: 'Presentations',
                to: '/presentations',
                description: 'Explore our range of presentation products.',
            },
            {
                title: 'AI Powered Slide Generator',
                to: '/chat',
                description: 'Create slides quickly with AI assistance.',
            },
        ],
    },
    {
        label: 'Bài viết',
        to: '/blog',
    },
    {
        label: 'Liên hệ',
        to: '/contact',
    },
]
