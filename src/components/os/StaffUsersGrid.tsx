"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteStaffUser, updateStaffUser } from "@/actions/os/staff";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsPasswordInput } from "@/components/os/OsPasswordInput";
import { SalesModalContext } from "@/components/sales/SalesModal";
import { STAFF_ROLES, STAFF_ROLE_LABELS, type StaffRole } from "@/lib/os/constants";
import { cn } from "@/lib/utils";

export type StaffUserCard = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  projectCount: number;
  taskCount: number;
  lastLoginLabel: string;
};

export function StaffUsersGrid({ users }: { users: StaffUserCard[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete] = useTransition();
  const selected = users.find((u) => u.id === selectedId) || null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selectedId]);

  const close = () => setSelectedId(null);

  function onDelete(user: StaffUserCard) {
    if (user.role === "super_admin") {
      toast.error("Super admin accounts cannot be deleted here");
      return;
    }
    if (!user.isActive) {
      toast.message("Already removed — they cannot sign in");
      return;
    }
    if (
      !window.confirm(
        `Delete login for ${user.name || user.email}? Their password will be cleared and they cannot sign in to OS, Sales Admin, or Employee portals.`
      )
    ) {
      return;
    }
    setDeletingId(user.id);
    startDelete(async () => {
      const fd = new FormData();
      fd.set("id", user.id);
      const result = await deleteStaffUser({}, fd);
      setDeletingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success || "Credentials deleted");
      if (selectedId === user.id) close();
      router.refresh();
    });
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((u) => {
          const initial = (u.name || u.email || "?").charAt(0).toUpperCase();
          const busy = deletingId === u.id;
          return (
            <div
              key={u.id}
              className={cn(
                "relative flex min-h-[88px] flex-col items-start gap-2 rounded-xl border border-[var(--dash-border)] bg-white p-4 text-left transition",
                "hover:border-[#111111] hover:shadow-sm",
                !u.isActive && "opacity-60"
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedId(u.id)}
                className="flex w-full flex-col items-start gap-2 text-left"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111] font-inter text-sm font-semibold text-white">
                  {initial}
                </span>
                <span className="min-w-0 pr-8">
                  <span className="block truncate font-inter text-sm font-semibold text-[#111111]">
                    {u.name || "Unnamed"}
                  </span>
                  <span className="mt-0.5 block truncate font-inter text-xs text-[#6b7280]">
                    {STAFF_ROLE_LABELS[u.role] || u.role}
                    {!u.isActive ? " · Inactive" : ""}
                  </span>
                </span>
              </button>
              {u.role !== "super_admin" ? (
                <button
                  type="button"
                  aria-label={`Delete ${u.name || u.email}`}
                  title="Delete login credentials"
                  disabled={busy || !u.isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(u);
                  }}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {selected ? (
                <div
                  key={selected.id}
                  className="admin-theme fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto px-4 py-[8vh]"
                >
                  <motion.button
                    type="button"
                    aria-label="Close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                    onClick={close}
                  />
                  <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={selected.name || selected.email}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl"
                  >
                    <header className="flex items-start justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4">
                      <div className="min-w-0">
                        <h2 className="truncate font-inter text-base font-semibold tracking-[-0.02em] text-[#111111]">
                          {selected.name || "User"}
                        </h2>
                        <p className="mt-0.5 truncate font-inter text-sm text-[#6b7280]">
                          {selected.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Close"
                        onClick={close}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </header>

                    <div className="max-h-[min(72vh,640px)] overflow-y-auto px-5 py-5">
                      <p className="mb-4 font-inter text-xs text-[#6b7280]">
                        Projects: {selected.projectCount} · Open tasks: {selected.taskCount} ·{" "}
                        {selected.lastLoginLabel}
                      </p>
                      <SalesModalContext.Provider value={{ close }}>
                        <OsActionForm
                          key={selected.id}
                          action={updateStaffUser}
                          submitLabel="Save"
                          className="grid gap-3"
                        >
                          <input type="hidden" name="id" value={selected.id} />
                          <Field label="Name">
                            <input
                              name="name"
                              defaultValue={selected.name}
                              className={osInputClass()}
                            />
                          </Field>
                          <Field label="Role">
                            <OsSelect
                              name="role"
                              defaultValue={selected.role}
                              options={STAFF_ROLES.map((r) => ({
                                value: r,
                                label: STAFF_ROLE_LABELS[r],
                              }))}
                            />
                          </Field>
                          <Field label="New password (optional)">
                            <OsPasswordInput name="password" />
                          </Field>
                          <Field label="Active">
                            <OsSelect
                              name="isActive"
                              defaultValue={selected.isActive ? "true" : "false"}
                              options={[
                                { value: "true", label: "Active" },
                                { value: "false", label: "Inactive" },
                              ]}
                            />
                          </Field>
                        </OsActionForm>
                      </SalesModalContext.Provider>

                      {selected.role !== "super_admin" ? (
                        <div className="mt-6 border-t border-[#e5e7eb] pt-4">
                          <button
                            type="button"
                            disabled={deletingId === selected.id || !selected.isActive}
                            onClick={() => onDelete(selected)}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 font-inter text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingId === selected.id
                              ? "Deleting…"
                              : selected.isActive
                                ? "Delete credentials"
                                : "Already inactive"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
