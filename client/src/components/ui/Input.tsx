import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-discord-dark-500 border border-discord-dark-500 rounded-md px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-discord-primary focus:border-transparent",
            "transition-colors",
            error && "border-discord-red focus:ring-discord-red",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-discord-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
