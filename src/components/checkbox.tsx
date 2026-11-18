"use client";
import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  labelClassName?: string;
}

/**
 * Native checkbox kept for form semantics and keyboard support; the visible box
 * is a styled sibling so the mark can use the same lucide icon set as Select.
 */
export function Checkbox({
  label,
  className = "",
  labelClassName = "",
  ...props
}: CheckboxProps) {
  return (
    <label className={`checkbox ${className}`.trim()}>
      <span className="checkbox-control">
        <input {...props} type="checkbox" className="checkbox-native" />
        <span className="checkbox-box" aria-hidden="true">
          <Check className="checkbox-mark" size={13} strokeWidth={3.25} />
        </span>
      </span>
      <span className={`checkbox-label ${labelClassName}`.trim()}>{label}</span>
    </label>
  );
}
