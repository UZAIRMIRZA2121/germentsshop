"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Image as ImageIcon, Link as LinkIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploadField({
  label = "Product Image",
  value,
  onChange,
  className,
}: ImageUploadFieldProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file (JPG, PNG, WEBP, GIF, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange(data.url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Reset file input so same file can be selected again if needed
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-ink-700">
          {label}
        </label>
        <div className="flex rounded-lg border border-ink-200 bg-ink-50 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition",
              tab === "upload"
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-600 hover:text-ink-900",
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition",
              tab === "url"
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-600 hover:text-ink-900",
            )}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Image URL
          </button>
        </div>
      </div>

      {tab === "upload" ? (
        <div className="space-y-3">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {/* Upload Dropzone */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition",
              dragOver
                ? "border-brand-500 bg-brand-50/50"
                : "border-ink-200 bg-ink-50/60 hover:border-brand-400 hover:bg-brand-50/20",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <p className="text-sm font-semibold text-ink-800">Uploading image to server…</p>
                <p className="text-xs text-ink-500">Please wait a moment</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm transition group-hover:scale-105">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    <span className="text-brand-600 underline decoration-brand-300 underline-offset-2">
                      Click to choose an image
                    </span>{" "}
                    or drag &amp; drop
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    PNG, JPG, WEBP, GIF, SVG up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or /uploads/..."
            className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Current Image Preview Card */}
      {value && (
        <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-2.5 shadow-sm">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
            <SafeImage
              src={value}
              alt="Uploaded product preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-ink-900">Current Image</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] font-mono text-ink-500">{value}</p>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Change Image
              </button>
              <span className="text-ink-300">·</span>
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

