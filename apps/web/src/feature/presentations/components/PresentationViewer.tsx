type ViewerProps = {
    id: string
    mode: 'view' | 'presenter' | 'overview'
}

function PresentationViewer({ id, mode }: ViewerProps) {
    // This URL points DIRECTLY to your Spring Boot gatekeeper controller
    // This is the 'publicUrl' your builder service now sets
    const baseUrl = `http://localhost:4004/api/products/presentations/view/${id}`

    let presentationUrl: string

    if (mode === 'presenter') {
        presentationUrl = `${baseUrl}/presenter/`
    } else if (mode === 'overview') {
        presentationUrl = `${baseUrl}/overview/`
    } else {
        presentationUrl = baseUrl // Default 'view'
    }

    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
            <iframe
                src={presentationUrl}
                title="Presentation Viewer"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
                allowFullScreen
            />
        </div>
    )
}

export default PresentationViewer
