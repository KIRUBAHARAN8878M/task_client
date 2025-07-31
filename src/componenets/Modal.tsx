import { type ReactNode, useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Optional: override panel classes */
  className?: string;
  /** Optional: override overlay classes */
  overlayClassName?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
  overlayClassName = "",
}: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  const titleId = "modal-title";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={[
          "absolute inset-0 transition-opacity",
          "bg-black/40 dark:bg-black/60", // dark-friendly overlay
          overlayClassName,
        ].join(" ")}
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={[
          "relative w-full max-w-lg rounded-lg shadow-lg",
          "bg-white text-gray-900 border border-gray-200",
          "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800",
          className,
        ].join(" ")}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-lg">
          {title ? (
            <h3 id={titleId} className="text-base font-semibold">
              {title}
            </h3>
          ) : (
            <span aria-hidden />
          )}
          <button
            className="text-sm underline decoration-1 underline-offset-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded dark:text-gray-300 dark:hover:text-gray-100 dark:focus:ring-blue-400"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
