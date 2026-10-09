"use client";

import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/lib/i18n";
import { imagePath } from "@/lib/ideas";
import { createClient } from "@/lib/supabase/client";

const maxSide = 1600;

async function toWebp(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/webp",
      0.82,
    ),
  );
}

export function PhotoPicker({
  weddingId,
  ideaId,
  path,
  preview,
  onChange,
}: {
  weddingId: string;
  ideaId: string;
  path: string | null;
  preview: string | null;
  onChange: (path: string | null, preview: string | null) => void;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await toWebp(file);
      const next = imagePath(weddingId, ideaId, crypto.randomUUID());
      const { error: uploadError } = await createClient()
        .storage.from("ideias")
        .upload(next, blob, { contentType: "image/webp" });
      if (uploadError) throw uploadError;
      onChange(next, URL.createObjectURL(blob));
    } catch {
      setError(m.ideas.photoFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-footnote font-medium text-muted-foreground">
        {m.ideas.photo}
      </span>
      {preview && (
        // biome-ignore lint/performance/noImgElement: signed and blob URLs from private storage
        <img
          src={preview}
          alt=""
          className="max-h-80 w-full rounded-2xl bg-muted object-cover"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-secondary px-4 text-subhead font-medium has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
        >
          <ImagePlusIcon aria-hidden="true" className="size-4" />
          {busy
            ? m.ideas.uploading
            : path
              ? m.ideas.changePhoto
              : m.ideas.addPhoto}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
        {path && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => onChange(null, null)}
          >
            <Trash2Icon aria-hidden="true" />
            {m.ideas.removePhoto}
          </Button>
        )}
      </div>
      <output className="block min-h-5 text-footnote text-destructive">
        {error}
      </output>
    </div>
  );
}
