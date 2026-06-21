import { useEffect, useRef, useState } from "react"
import type { CodeGeneratorType } from "../codegen/types"

export interface CodeMenuProps {
  onGenerate: (generatorType: CodeGeneratorType) => void
}

export const CodeMenu = (props: CodeMenuProps) => {
  const { onGenerate } = props
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [isOpen])

  const handleSelect = (generatorType: CodeGeneratorType) => {
    setIsOpen(false)
    onGenerate(generatorType)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="px-2 py-1 text-sm hover:bg-slate-300/70 dark:hover:bg-mist-800"
        onClick={() => setIsOpen((open) => !open)}
      >
        Code
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 min-w-36 border border-slate-300 bg-white py-1 shadow-lg
            dark:border-mist-600 dark:bg-mist-900"
        >
          <button
            type="button"
            className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-mist-800"
            onClick={() => handleSelect("terraform")}
          >
            Terraform
          </button>
          <button
            type="button"
            className="block w-full px-4 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-mist-800"
            onClick={() => handleSelect("aws-cdk")}
          >
            AWS-CDK
          </button>
        </div>
      )}
    </div>
  )
}
