import { useLayout } from '@/context/layout-context'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/Card'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PaymentSucceeded() {
    const navigate = useNavigate()
    const { setLayoutConfig } = useLayout()
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval)
                    navigate({ to: '/' })
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
            clearInterval(countdownInterval)
        }
    }, [setLayoutConfig, navigate])

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Thanh toán thành công
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Giao dịch của bạn đã được xác nhận.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Bạn sẽ được chuyển về trang chủ sau {countdown} giây...
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
                                <Link to="/">Về trang chủ</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
