import { useEffect, useRef, useState } from 'react'
import { paragraphs } from '../data/paragraphs'
import '../styles/gamewpm.css'

const MAX_TIME = 60

type CharStatus = 'correct' | 'incorrect' | 'active' | ''

const GameWPMTestingPage = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const [text, setText] = useState<string[]>([])
    const [charIndex, setCharIndex] = useState(0)
    const [mistakes, setMistakes] = useState(0)
    const [timeLeft, setTimeLeft] = useState(MAX_TIME)
    const [isTyping, setIsTyping] = useState(false)
    const [input, setInput] = useState('')

    // loadParagraph()
    useEffect(() => {
        loadParagraph()
    }, [])

    const loadParagraph = () => {
        const ranIndex = Math.floor(Math.random() * paragraphs.length)
        const paragraph = paragraphs[ranIndex]
        if (paragraph) {
            setText(paragraph.split(''))
        }
        resetStats()
        inputRef.current?.focus()
    }

    const resetStats = () => {
        clearInterval(timerRef.current!)
        setCharIndex(0)
        setMistakes(0)
        setTimeLeft(MAX_TIME)
        setIsTyping(false)
        setInput('')
    }

    // initTimer()
    useEffect(() => {
        if (!isTyping) return

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerRef.current!)
    }, [isTyping])

    // initTyping()
    const handleTyping = (value: string) => {
        if (timeLeft === 0) return

        if (!isTyping) setIsTyping(true)

        const currentChar = value[value.length - 1]
        const expectedChar = text[charIndex]

        if (currentChar == null) {
            // backspace
            if (charIndex > 0) {
                setCharIndex(i => i - 1)
            }
            return
        }

        if (currentChar === expectedChar) {
            setCharIndex(i => i + 1)
        } else {
            setCharIndex(i => i + 1)
            setMistakes(m => m + 1)
        }

        setInput(value)
    }

    const wpm = Math.round(((charIndex - mistakes) / 5 / (MAX_TIME - timeLeft)) * 60) || 0

    const cpm = charIndex - mistakes

    return (
        <div className="wrapper">
            <input
                ref={inputRef}
                type="text"
                className="input-field"
                value={input}
                onChange={e => handleTyping(e.target.value)}
            />

            <div className="content-box">
                <div className="typing-text">
                    <p>
                        {text.map((char, idx) => {
                            let className = ''
                            if (idx === charIndex) className = 'active'
                            if (idx < charIndex) {
                                className = input[idx] === char ? 'correct' : 'incorrect'
                            }
                            return (
                                <span key={idx} className={className}>
                                    {char}
                                </span>
                            )
                        })}
                    </p>
                </div>

                <div className="content">
                    <ul className="result-details">
                        <li className="time">
                            <p>Time Left:</p>
                            <span>
                                <b>{timeLeft}</b>s
                            </span>
                        </li>
                        <li className="mistake">
                            <p>Mistakes:</p>
                            <span>{mistakes}</span>
                        </li>
                        <li className="wpm">
                            <p>WPM:</p>
                            <span>{wpm}</span>
                        </li>
                        <li className="cpm">
                            <p>CPM:</p>
                            <span>{cpm}</span>
                        </li>
                    </ul>

                    <button onClick={loadParagraph}>Try Again</button>
                </div>
            </div>
        </div>
    )
}

export default GameWPMTestingPage
