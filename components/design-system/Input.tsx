"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-5 py-3 bg-input-background border border-border rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "placeholder:text-muted-foreground",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-5 py-3 bg-input-background border border-border rounded-3xl",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "placeholder:text-muted-foreground",
          "transition-all duration-200",
          "min-h-[120px] resize-y",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
