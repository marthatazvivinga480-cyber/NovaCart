import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { SortOrder } from "../types.ts";

const options: { value: SortOrder; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "rated", label: "Top rated" },
];

export default function SortDropdown({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    buttons.current[active]?.focus();
  }, [open, active]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const show = () => {
    setActive(options.findIndex((option) => option.value === value));
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <div
      className="custom-sort"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span id={`${id}-label`}>Sort by</span>
      <button
        className="sort-trigger"
        ref={trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-label={`Sort by: ${options.find((option) => option.value === value)?.label}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            show();
          }
        }}
      >
        {options.find((option) => option.value === value)?.label}
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="sort-options"
          id={`${id}-menu`}
          role="menu"
          aria-labelledby={`${id}-label`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setActive(
                (index) =>
                  (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    options.length) %
                  options.length,
              );
            }
            if (event.key === "Home") {
              event.preventDefault();
              setActive(0);
            }
            if (event.key === "End") {
              event.preventDefault();
              setActive(options.length - 1);
            }
          }}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              role="menuitemradio"
              aria-checked={value === option.value}
              tabIndex={active === index ? 0 : -1}
              onClick={() => {
                onChange(option.value);
                close();
              }}
            >
              {option.label}
              {value === option.value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
