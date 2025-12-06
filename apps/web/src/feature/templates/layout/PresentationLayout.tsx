import Header from '@/layouts/header'
import React, { memo } from 'react'

interface Props {
    children?: React.ReactNode
}

const PresentationLayoutInner: React.FC<Props> = ({ children }) => {
    return (
        <div className="mx-auto">
            <Header />
            {children}
        </div>
    )
}

const PresentationLayout = memo(PresentationLayoutInner)

export default PresentationLayout
