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
        label: 'Home',
        to: '/',
    },
    {
        label: 'About',
        to: '/about',
    },
    {
        label: 'Products',
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
                title: 'On Sale',
                to: '/products/sale',
                description: 'Grab the best deals while they last!',
            },
        ],
    },
    {
        label: 'Blog',
        to: '/blog',
    },
    {
        label: 'Contact',
        to: '/contact',
    },
]
