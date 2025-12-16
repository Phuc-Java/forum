"use client";
import React, { useEffect, useRef, useImperativeHandle } from "react";

interface IsolatedInputProps {
  placeholder?: string;
  defaultValue?: string;
  onValue?: (v: string) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// Minimal client-only input that avoids re-rendering parent on every keystroke.
// - uncontrolled input (ref) so typing doesn't trigger parent renders
// - stops keyboard event propagation to avoid triggering global handlers
const IsolatedInput = React.forwardRef(function IsolatedInput(
  {
    placeholder,
    defaultValue,
    onValue,
    onPaste,
    className,
    disabled,
    autoFocus,
  }: IsolatedInputProps,
  ref: any
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    getValue: () => inputRef.current?.value,
    setValue: (v: string) => {
      if (inputRef.current) inputRef.current.value = v;
    },
  }));

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleInput = () => {
    // batch notifications to next animation frame to reduce churn
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (onValue) onValue(inputRef.current?.value || "");
    });
  };

  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const handlePasteLocal = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // allow parent to handle paste but stop propagation to global handlers
    e.stopPropagation();
    if (onPaste) onPaste(e);
  };

  return (
    <input
      ref={inputRef}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onKeyDown={stop}
      onKeyUp={stop}
      onKeyPress={stop}
      onInput={handleInput}
      onPaste={handlePasteLocal}
      className={className}
      autoComplete="off"
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
});

export default IsolatedInput;
