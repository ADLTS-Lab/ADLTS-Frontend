"use client";

import Link from "next/link";
import { LogOut, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/i18n/useI18n";

type UserMenuProps = {
  displayName: string;
  profileHref: string;
  settingsHref: string;
  onSignOut: () => void | Promise<void>;
};

export default function UserMenu({ displayName, profileHref, settingsHref, onSignOut }: UserMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const avatar = (displayName || "U").trim().charAt(0).toUpperCase();
  const name = displayName || "User";

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const node = menuRef.current;
      if (!node) return;
      if (!node.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    closeMenu();
    await onSignOut();
  };

  const closeAndFocus = () => {
    closeMenu();
    buttonRef.current?.focus();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="user-account-menu"
        className="hidden sm:inline-flex items-center gap-2.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
      >
        <span className="grid h-7 w-7 place-items-center rounded-[50%] bg-[var(--accent)] text-xs font-semibold text-[var(--surface)]">
          {avatar}
        </span>
        <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
        <ChevronDown size={16} className="text-[var(--text-secondary)]" />
      </button>

      {open ? (
        <div id="user-account-menu" role="menu" aria-label={t("profile") || "Profile menu"} className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-popover py-2">
          <Link
            href={profileHref}
            onClick={closeAndFocus}
            role="menuitem"
            className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
          >
            {t("profile") || "Profile"}
          </Link>
          <Link
            href={settingsHref}
            onClick={closeAndFocus}
            role="menuitem"
            className="block px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
          >
            {t("settings") || "Settings"}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className="w-full text-left px-4 py-2 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-subtle)]"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut size={14} />
              {t("logout") || "Logout"}
            </span>
          </button>
        </div>
      ) : null}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls="user-account-menu"
          ref={buttonRef}
          className="sm:hidden h-10 w-10 rounded-[6px] bg-[var(--accent)] text-sm font-semibold text-[var(--surface)]"
          aria-label={`Open account menu for ${name}`}
        >
        {avatar}
      </button>
    </div>
  );
}
