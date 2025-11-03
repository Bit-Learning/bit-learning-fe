export function formatDateTime(isoString: string) {
    if (!isoString) return ''

    const date = new Date(isoString)

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date)
}
