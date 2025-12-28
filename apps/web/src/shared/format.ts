export const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
}

export const formatNumber = (value: number): string => {
    return value.toLocaleString('vi-VN')
}

export const formatPercentage = (value: number): string => {
    return `${value}%`
}
