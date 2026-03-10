import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Pipette, X } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
  isDarkMode: boolean;
}

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#f59e0b", "#10b981", 
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#64748b", "#475569"
];

export default function ColorPicker({ color, onChange, label, isDarkMode }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popover = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popover.current && !popover.current.contains(event.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2 relative">
      <label className={`text-sm font-medium block ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
        {label}
      </label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors uppercase font-mono text-sm ${
              isDarkMode 
                ? "bg-slate-800/80 border-slate-700 text-white" 
                : "bg-white border-slate-300 text-slate-900"
            }`}
          />
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded border border-black/10 shadow-sm"
            style={{ backgroundColor: color }}
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-2.5 border rounded-lg transition-colors flex items-center justify-center ${
            isDarkMode 
              ? "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600" 
              : "bg-white border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400"
          }`}
        >
          <Pipette size={18} />
        </button>
      </div>

      {isOpen && (
        <div 
          ref={popover}
          className={`absolute z-50 top-full mt-2 p-4 rounded-xl shadow-2xl border animate-in zoom-in-95 duration-150 ${
            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
          }`}
          style={{ width: "240px" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              Custom Color
            </span>
            <button onClick={close} className="text-slate-500 hover:text-slate-700">
              <X size={14} />
            </button>
          </div>

          <div className="custom-color-picker mb-4">
            <HexColorPicker color={color} onChange={onChange} style={{ width: "100%", height: "160px" }} />
          </div>

          <div className="space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
              Presets
            </span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChange(c);
                    // close(); // Keep open for quick selection
                  }}
                  className={`w-full aspect-square rounded-md border border-black/5 transition-transform hover:scale-110 ${
                    color.toLowerCase() === c.toLowerCase() ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
