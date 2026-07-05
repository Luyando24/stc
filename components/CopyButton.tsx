"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({
  text,
  label = "Copy",
  variant = "button"
}: {
  text: string;
  label?: string;
  variant?: "button" | "inline";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleCopy}
        className="text-brand-600 hover:text-brand-700 font-semibold text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-brand-50 border border-transparent hover:border-brand-100"
        type="button"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600 font-medium">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      id="copy-warehouse-code"
      onClick={handleCopy}
      className="btn-secondary min-w-[120px] justify-center gap-2 flex items-center"
      type="button"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
