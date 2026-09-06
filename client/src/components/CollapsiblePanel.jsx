import { useId, useState } from "react";

export default function CollapsiblePanel({
  title,
  children,
  defaultOpen = true,
  className = "",
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className={`panel collapsible-panel ${className}`.trim()}>
      <button
        type="button"
        className="panel-h collapsible-trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
        <span className={`collapsible-chevron ${open ? "open" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div className="panel-b collapsible-body" id={contentId}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
