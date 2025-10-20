import { Button } from '@workspace/ui/components/Button'
import { cn } from '@workspace/ui/lib/utils'
import { Check, Copy, Download } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-java'
// Import languages - only the ones that exist
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-yaml'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
// Import plugins
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
// Import Prism core styles and themes
import 'prismjs/themes/prism-tomorrow.css'
import { useEffect, useRef, useState } from 'react'

interface PrismCodeBlockProps {
    code: string
    language: string
    showLineNumbers?: boolean
    fileName?: string
    className?: string
}

const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    yml: 'yaml',
}

export const PrismCodeBlock = ({
    code,
    language,
    showLineNumbers = true,
    fileName,
    className,
}: PrismCodeBlockProps) => {
    const [copied, setCopied] = useState(false)
    const codeRef = useRef<HTMLElement>(null)

    const normalizedLanguage = languageMap[language] || language || 'text'

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current)
        }
    }, [code, normalizedLanguage])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName || `code.${normalizedLanguage}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className={cn('group relative my-4 overflow-hidden rounded-lg border bg-zinc-950', className)}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    {fileName && <span className="text-xs font-medium text-zinc-400">{fileName}</span>}
                    {!fileName && (
                        <span className="text-xs font-medium text-zinc-400">{normalizedLanguage.toUpperCase()}</span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 gap-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        {copied ? (
                            <>
                                <Check size={14} />
                                Đã sao chép
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                Sao chép
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        className="h-7 gap-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <Download size={14} />
                        Tải xuống
                    </Button>
                </div>
            </div>

            {/* Code Content */}
            <div className="overflow-x-auto">
                <pre className={cn('!m-0 !bg-zinc-950 p-4', showLineNumbers && 'line-numbers')}>
                    <code ref={codeRef} className={`language-${normalizedLanguage} !text-sm`}>
                        {code}
                    </code>
                </pre>
            </div>
        </div>
    )
}
