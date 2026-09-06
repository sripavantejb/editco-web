"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, X, Check, Crop } from "lucide-react";
import { toast } from "sonner";
import { Field, osInputClass } from "@/components/os/ui";
import { cn } from "@/lib/utils";

const VIEW = 280;
const EXPORT = 640;

type CropState = {
  zoom: number;
  panX: number;
  panY: number;
};

/**
 * WhatsApp-style circular crop for crew photos.
 * Uniform transform zoom (no stretch) + drag to pan; Apply bakes a square JPEG.
 */
export function CrewPhotoCropField({
  currentSrc,
  urlPlaceholder = "/crew/photo.jpg or https://…",
  defaultUrl = "",
}: {
  currentSrc?: string;
  urlPlaceholder?: string;
  defaultUrl?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    };
  }, [preview, sourceUrl]);

  const openCropper = (url: string) => {
    setSourceUrl((prev) => {
      if (prev?.startsWith("blob:") && prev !== url) URL.revokeObjectURL(prev);
      return url;
    });
    setOpen(true);
  };

  const onPickFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    openCropper(url);
  };

  const applyCropped = async (blob: Blob) => {
    const file = new File([blob], "crew-photo.jpg", { type: "image/jpeg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileRef.current) {
      fileRef.current.files = dt.files;
    }
    const url = URL.createObjectURL(blob);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    setOpen(false);
  };

  const shown = preview || currentSrc;

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-input)]/40 p-3">
      <p className="font-inter text-xs font-medium text-[var(--dash-text)]">
        Photo
        <span className="ml-1 font-normal text-[var(--dash-muted)]">
          — pick an image, then drag to crop like WhatsApp
        </span>
      </p>

      <input ref={fileRef} name="image" type="file" accept="image/*" className="hidden" />
      <input type="hidden" name="imageScale" value="1" />
      <input type="hidden" name="imagePosX" value="50" />
      <input type="hidden" name="imagePosY" value="50" />

      {shown ? (
        <div className="mx-auto flex flex-col items-center gap-2">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-[#f5f5f5] ring-2 ring-[var(--dash-border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shown}
              alt="Crew preview"
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-white px-3 font-inter text-[12px] font-medium text-[var(--dash-text)] hover:border-[#111]">
              <ImagePlus className="h-3.5 w-3.5" />
              Replace
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  onPickFile(e.target.files?.[0] || null);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => openCropper(preview || currentSrc!)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#111] px-3 font-inter text-[12px] font-medium text-white hover:bg-[#222]"
            >
              <Crop className="h-3.5 w-3.5" />
              Adjust crop
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-white px-3 py-8 text-center transition hover:border-[#111111]">
          <ImagePlus className="h-5 w-5 text-[var(--dash-muted)]" strokeWidth={1.75} />
          <span className="font-inter text-xs font-medium text-[var(--dash-text)]">
            Add photo &amp; crop
          </span>
          <span className="font-inter text-[11px] text-[var(--dash-muted)]">
            PNG, JPG, WEBP · max 6MB
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              onPickFile(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
        </label>
      )}

      <Field label="Or image URL / path (skips crop tool)">
        <input
          name="imageUrl"
          defaultValue={defaultUrl}
          placeholder={urlPlaceholder}
          className={osInputClass()}
        />
      </Field>

      {mounted && open && sourceUrl
        ? createPortal(
            <CropModal
              src={sourceUrl}
              onClose={() => setOpen(false)}
              onApply={applyCropped}
            />,
            document.body
          )
        : null}
    </div>
  );
}

function CropModal({
  src,
  onClose,
  onApply,
}: {
  src: string;
  onClose: () => void;
  onApply: (blob: Blob) => void | Promise<void>;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nw, setNw] = useState(0);
  const [nh, setNh] = useState(0);
  const [crop, setCrop] = useState<CropState>({ zoom: 1, panX: 0, panY: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(
    null
  );
  const cropRef = useRef(crop);
  cropRef.current = crop;

  const coverScaleFor = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0) return 1;
    return Math.max(VIEW / w, VIEW / h);
  }, []);

  const clampPan = useCallback(
    (zoom: number, panX: number, panY: number, w: number, h: number) => {
      const s = coverScaleFor(w, h) * zoom;
      const dw = w * s;
      const dh = h * s;
      const maxX = Math.max(0, (dw - VIEW) / 2);
      const maxY = Math.max(0, (dh - VIEW) / 2);
      return {
        zoom: Math.min(3, Math.max(1, zoom)),
        panX: Math.min(maxX, Math.max(-maxX, panX)),
        panY: Math.min(maxY, Math.max(-maxY, panY)),
      };
    },
    [coverScaleFor]
  );

  const onImgLoad = (el: HTMLImageElement) => {
    imgRef.current = el;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    if (!w || !h) {
      toast.error("Could not read this image. Try another file.");
      return;
    }
    setNw(w);
    setNh(h);
    setCrop({ zoom: 1, panX: 0, panY: 0 });
    setReady(true);
  };

  // Cached images may skip onLoad
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth) onImgLoad(el);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const c = cropRef.current;
    drag.current = { x: e.clientX, y: e.clientY, panX: c.panX, panY: c.panY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setCrop(
      clampPan(
        cropRef.current.zoom,
        drag.current.panX + dx,
        drag.current.panY + dy,
        nw,
        nh
      )
    );
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const exportCrop = async () => {
    const img = imgRef.current;
    if (!img || !ready || !nw || !nh) return;
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT;
      canvas.height = EXPORT;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { zoom, panX, panY } = cropRef.current;
      const totalScale = coverScaleFor(nw, nh) * zoom;
      const ratio = EXPORT / VIEW;

      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, EXPORT, EXPORT);
      ctx.save();
      ctx.translate(EXPORT / 2 + panX * ratio, EXPORT / 2 + panY * ratio);
      ctx.scale(totalScale * ratio, totalScale * ratio);
      // Draw at natural size around origin — uniform scale, no stretch
      ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) {
        toast.error("Could not crop this image. Try a different file.");
        return;
      }
      await onApply(blob);
    } catch {
      toast.error("Could not crop this image. Try uploading a local file.");
    } finally {
      setBusy(false);
    }
  };

  const totalScale = ready ? coverScaleFor(nw, nh) * crop.zoom : 1;

  return (
    <div className="admin-theme fixed inset-0 z-[300] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Crop photo"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-[#111] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-archivo text-sm uppercase tracking-wide">Crop photo</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 text-center font-inter text-[11px] text-white/50">
            Drag to move · slider to zoom (keeps face shape)
          </p>
          <div
            className="relative mx-auto touch-none select-none overflow-hidden rounded-full bg-[#222] cursor-grab active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => {
              e.preventDefault();
              const next = crop.zoom + (e.deltaY > 0 ? -0.08 : 0.08);
              setCrop((c) => clampPan(next, c.panX, c.panY, nw, nh));
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => onImgLoad(e.currentTarget)}
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 max-w-none",
                !ready && "opacity-0"
              )}
              style={{
                // Natural pixel size only — zoom via uniform CSS transform (no stretch)
                width: nw || undefined,
                height: nh || undefined,
                transform: `translate(-50%, -50%) translate(${crop.panX}px, ${crop.panY}px) scale(${totalScale})`,
                transformOrigin: "center center",
              }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80 ring-inset" />
          </div>

          <label className="mt-5 flex items-center gap-3">
            <span className="w-12 font-inter text-[11px] text-white/50">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={crop.zoom}
              onChange={(e) => {
                const zoom = Number(e.target.value);
                setCrop((c) => clampPan(zoom, c.panX, c.panY, nw, nh));
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-gaude-orange"
            />
          </label>
        </div>

        <div className="flex gap-2 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border border-white/20 font-inter text-sm font-medium text-white/80 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => void exportCrop()}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gaude-orange font-inter text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {busy ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
