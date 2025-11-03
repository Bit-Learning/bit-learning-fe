import { Spinner } from '../Spinner'

const SpinnerLoader = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
            {' '}
            <Spinner />
        </div>
    )
}

export default SpinnerLoader
