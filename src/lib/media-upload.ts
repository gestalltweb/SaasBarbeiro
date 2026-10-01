"use client";

import { createClient } from "@/lib/supabase/client";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

async function compressImage(file: File) {
  if (file.type === "image/webp" && file.size < 1_500_000) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", .84));
  if (!blob) throw new Error("Não foi possível comprimir a imagem.");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

export async function uploadPublicPageImage(file: File, businessId: string, folder: string) {
  if (!allowedTypes.has(file.type)) throw new Error("Use uma imagem JPG, PNG ou WebP.");
  if (file.size > maxBytes) throw new Error("A imagem pode ter no máximo 5 MB.");
  const prepared = await compressImage(file);
  const extension = prepared.type === "image/webp" ? "webp" : prepared.type === "image/png" ? "png" : "jpg";
  const path = `${businessId}/${folder}/${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("public-page-media").upload(path, prepared, { contentType: prepared.type, upsert: false, cacheControl: "3600" });
  if (error) throw new Error("Não foi possível enviar a imagem. Confirme se a migration do Storage foi aplicada.");
  const { data } = supabase.storage.from("public-page-media").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deletePublicPageImage(path: string) {
  if (!path) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from("public-page-media").remove([path]);
  if (error) throw new Error("Não foi possível excluir a imagem.");
}
