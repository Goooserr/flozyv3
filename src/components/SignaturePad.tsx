'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Eraser, CheckCircle2, X } from 'lucide-react'

export function SignaturePad({ onSave, onCancel }: { onSave: (data: string) => void, onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.beginPath()
    }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const save = () => {
    const canvas = canvasRef.current
    if (canvas) {
      onSave(canvas.toDataURL())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-black">Signature du Client</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Acceptation du devis</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl overflow-hidden relative">
          <canvas 
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full h-[300px] cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">
            Signez ici
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={clear}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
          >
            <Eraser className="w-4 h-4" /> Effacer
          </button>
          <button 
            onClick={save}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl"
          >
            <CheckCircle2 className="w-4 h-4" /> Valider
          </button>
        </div>
      </div>
    </div>
  )
}
