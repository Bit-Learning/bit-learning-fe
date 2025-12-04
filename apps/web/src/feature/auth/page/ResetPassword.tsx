import PageMeta from '@/shared/components/seo/page-meta'
import ResetPasswordForm from '../component/ResetPasswordForm'
import AuthLayout from '../layout/AuthLayout'

const ResetPasswordPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Đặt Lại Mật Khẩu - Công ty luật Basico"
                description="Đặt Lại Mật Khẩu - Công ty luật Basico"
            />
            <AuthLayout>
                <ResetPasswordForm />
            </AuthLayout>
        </>
    )
}
export default ResetPasswordPage
