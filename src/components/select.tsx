"use client";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Languages } from "lucide-react";

export function Select({
  children,
  className = "",
  id,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const uid = useId();
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const p = child.props as {
        value?: string | number;
        children: ReactNode;
        disabled?: boolean;
      };
      return {
        value: String(p.value ?? p.children),
        label: p.children,
        disabled: p.disabled,
      };
    });
  const [internal, setInternal] = useState(
    String(defaultValue ?? options[0]?.value ?? ""),
  );
  const selected = String(value ?? internal);
  const item = options.find((o) => o.value === selected) ?? options[0];
  const language = id === "locale" || id === "settings-locale";
  const listId = `${uid}-options`;
  useEffect(() => {
    function outside(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [open, active, listId]);
  useEffect(() => {
    const form = native.current?.form;
    function reset() {
      setInternal(String(defaultValue ?? options[0]?.value ?? ""));
      setOpen(false);
    }
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  });
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled || !native.current) return;
    setInternal(option.value);
    native.current.value = option.value;
    native.current.dispatchEvent(new Event("change", { bubbles: true }));
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div
      className={`select-root ${className}`}
      ref={root}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <select
        {...props}
        ref={native}
        value={selected}
        onChange={onChange}
        tabIndex={-1}
        aria-hidden="true"
        className="select-native"
        onInvalid={(e) => {
          e.preventDefault();
          trigger.current?.focus();
          setOpen(true);
        }}
      >
        {children}
      </select>
      <button
        ref={trigger}
        id={id}
        type="button"
        className="select-trigger"
        role="combobox"
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-required={props.required}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={props.disabled}
        onClick={() => {
          setActive(
            Math.max(
              0,
              options.findIndex((o) => o.value === selected),
            ),
          );
          setOpen(!open);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
          } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
            const direction = e.key === "ArrowUp" ? -1 : 1;
            let next =
              e.key === "Home"
                ? 0
                : e.key === "End"
                  ? options.length - 1
                  : open
                    ? active + direction
                    : options.findIndex((o) => o.value === selected);
            next = Math.max(0, Math.min(options.length - 1, next));
            while (
              options[next]?.disabled &&
              next + direction >= 0 &&
              next + direction < options.length
            )
              next += direction;
            setActive(next);
          } else if ((e.key === "Enter" || e.key === " ") && open) {
            e.preventDefault();
            choose(active);
          } else if (e.key.length === 1 && e.key !== " ") {
            const match = options.findIndex(
              (o) =>
                !o.disabled &&
                String(o.label)
                  .toLocaleLowerCase()
                  .startsWith(e.key.toLocaleLowerCase()),
            );
            if (match >= 0) {
              setOpen(true);
              setActive(match);
            }
          }
        }}
      >
        <span className="select-value">
          {language && item && <Languages size={16} aria-hidden="true" />}
          <span>{item?.label}</span>
        </span>
        <ChevronDown size={15} className="select-chevron" />
      </button>
      {open && (
        <div
          className="select-options"
          id={listId}
          role="listbox"
          aria-label={
            props["aria-label"] || (language ? "Language" : undefined)
          }
        >
          {options.map((o, index) => (
            <div
              key={o.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={selected === o.value}
              aria-disabled={o.disabled}
              className={`select-option ${index === active ? "active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
            >
              <span className="select-value">
                {language && <Languages size={16} aria-hidden="true" />}
                <span>{o.label}</span>
              </span>
              {selected === o.value && <Check size={15} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
