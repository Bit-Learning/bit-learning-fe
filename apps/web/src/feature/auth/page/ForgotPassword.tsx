import PageMeta from '@/components/seo/page-meta'
import ForgotPasswordForm from '../component/ForgotPasswordForm'
import AuthLayout from '../layout/AuthLayout'

const ForgotPasswordPage: React.FC = () => {
    return (
        <>
            <PageMeta title="Quên Mật Khẩu - Công ty Bithub" description="Quên Mật Khẩu - Công ty Bithub" />
            <AuthLayout>
                <ForgotPasswordForm />
            </AuthLayout>
        </>
    )
}
export default ForgotPasswordPage
