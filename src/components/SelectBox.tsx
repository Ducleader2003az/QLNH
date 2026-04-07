'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'

interface Props {
    options: any[]
    optionValue?: string
    optionLabel?: string
    value: any
    onChange: (value: any) => void
    placeholder?: string
    label?: string
    disabled?: boolean
    isSingleOption?: boolean
}

export function SelectBox({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    disabled = false,
    optionLabel,
    optionValue,
    isSingleOption = false,
}: Props) {
    const [open, setOpen] = useState(false)
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
    const ref = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Tính toán vị trí dropdown theo button
    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            })
        }
    }

    const handleToggle = () => {
        if (disabled) return
        if (!open) updatePosition()
        setOpen(o => !o)
    }

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            // Kiểm tra cả wrapper lẫn dropdown portal
            const dropdownEl = document.getElementById('selectbox-portal')
            if (
                ref.current && !ref.current.contains(target) &&
                dropdownEl && !dropdownEl.contains(target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Cập nhật vị trí khi scroll hoặc resize
    useEffect(() => {
        if (!open) return
        const handler = () => updatePosition()
        window.addEventListener('scroll', handler, true)
        window.addEventListener('resize', handler)
        return () => {
            window.removeEventListener('scroll', handler, true)
            window.removeEventListener('resize', handler)
        }
    }, [open])

    const onSelect = (val: any) => {
        onChange(val)
        setOpen(false)
    }

    const selectedOption = options.find(o => value?.includes(o[optionValue as keyof typeof o]))
    const selectedNames = isSingleOption
        ? value
        : selectedOption
            ? selectedOption[optionLabel as keyof typeof selectedOption]
            : undefined

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
            {/* Trigger button */}
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                onClick={handleToggle}
                style={{
                    width: '100%',
                    minHeight: 42,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '6px 36px 6px 12px',
                    background: disabled ? '#f1f5f9' : '#f8fafc',
                    border: `1.5px solid ${open ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: 10,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s',
                    position: 'relative',
                    boxShadow: open ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                }}
            >
                {selectedNames == undefined ? (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{placeholder}</span>
                ) : (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 8px 2px 10px',
                        borderRadius: 999,
                    }}>
                        {selectedNames}
                    </span>
                )}
                <ChevronDown
                    size={16}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
                        color: '#94a3b8',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                    }}
                />
            </button>

            {/* Dropdown portal — mount vào body, thoát khỏi overflow/z-index của card */}
            {open && createPortal(
                <div
                    id="selectbox-portal"
                    style={{
                        position: 'absolute',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        background: 'white',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 12,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        zIndex: 9999,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {options.length === 0 ? (
                            <p style={{ padding: '12px 14px', fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
                                Không có dữ liệu
                            </p>
                        ) : (
                            options.map((opt, index) => {
                                const checked = value?.includes(opt.id)
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => onSelect(isSingleOption ? opt : opt[optionValue as keyof typeof opt])}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '9px 14px',
                                            background: checked ? '#eff6ff' : 'white',
                                            border: 'none',
                                            borderBottom: '1px solid #f8fafc',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => {
                                            if (!checked) (e.currentTarget as HTMLElement).style.background = '#f8fafc'
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = checked ? '#eff6ff' : 'white'
                                        }}
                                    >
                                        <span style={{
                                            fontSize: 13,
                                            fontWeight: checked ? 600 : 400,
                                            color: checked ? '#1d4ed8' : '#374151',
                                        }}>
                                            {isSingleOption ? opt : opt[optionLabel as keyof typeof opt]}
                                        </span>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}