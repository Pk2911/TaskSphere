"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement;

    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusableElement = focusableElements[0];

    if (firstFocusableElement) {
      firstFocusableElement.focus();
    } else {
      modal.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ×
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}