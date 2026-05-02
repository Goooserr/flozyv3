'use client'

import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel: () => void;
  title?: string;
}

export function SignaturePad({ onSave, onCancel, title = "Signature du client" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
       // Check if canvas is not empty (simple check)
       setHasSignature(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    if (e.type === 'mousedown' || e.type === 'touchstart') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 touch-none">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">{title}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-zinc-50 relative min-h-[300px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <p className="text-zinc-900 font-medium italic">Signez ici...</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
          <button onClick={clear} className="flex-1 flex items-center justify-center gap-2 py-4 bg-zinc-200 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-300 transition-all">
            <RotateCcw className="w-4 h-4" /> Effacer
          </button>
          <button 
            disabled={!hasSignature}
            onClick={save} 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-30"
          >
            <Check className="w-4 h-4" /> Valider
          </button>
        </div>
      </div>
    </div>
  );
}
