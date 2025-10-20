import { PresentationHeader } from '@/shared/layouts/Header'
import React, { memo } from 'react'

interface Props {
    children?: React.ReactNode
}

const PresentationLayoutInner: React.FC<Props> = ({ children }) => {
    return (
        <div className="mx-auto">
            <PresentationHeader />
            {children}
        </div>
    )
}

const PresentationLayout = memo(PresentationLayoutInner)

export default PresentationLayout
