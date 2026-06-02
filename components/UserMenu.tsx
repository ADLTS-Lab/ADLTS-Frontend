"use client";

import Link from "next/link";
import { LogOut, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

  const avatar = (displayName || "U").trim().charAt(0).toUpperCase();
  const name = displayName || "User";

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const node = menuRef.current;
      if (!node) return;
      if (!node.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
      >
        <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-black">
          {avatar}
          <span className="sr-only">{name}</span>
        </span>
        <span className="text-xs font-bold text-slate-800">{name}</span>
        <ChevronDown size={16} className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            {t("profile") || "Profile"}
          </Link>
          <Link
            href={settingsHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            {t("settings") || "Settings"}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut size={14} />
              {t("logout") || "Logout"}
            </span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="sm:hidden w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center"
      >
        {avatar}
      </button>
    </div>
  );
}
