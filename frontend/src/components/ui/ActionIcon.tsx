"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface ActionIconProps {
  type: "edit" | "delete";
  onClick?: (e?: MouseEvent) => void;
  className?: string;
  buttonClassName?: string;
  label?: string;
  size?: number;
}

export default function ActionIcon({
  type,
  onClick,
  className,
  buttonClassName,
  label,
  size = 16,
}: ActionIconProps) {
  const src = type === "edit" ? "/edit.svg" : "/delete.svg";
  const defaultLabel = type === "edit" ? "Edit" : "Delete";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-[#F2F2F3]",
        buttonClassName
      )}
      aria-label={label || defaultLabel}
    >
      <Image
        src={src}
        alt={label || defaultLabel}
        width={size}
        height={size}
        style={{ width: size, height: "auto" }}
        className={cn("shrink-0", className)}
      />
    </button>
  );
}
