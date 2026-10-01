"use client";

import { createClient } from "@/lib/supabase/client";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm"]);
const maxImageBytes = 5 * 1024 * 1024;
const maxVideoBytes = 20 * 1024 * 1024;

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

export async function uploadPublicPageMedia(file: File, businessId: string, folder: string, allowVideo = false) {
  const isVideo = allowedVideoTypes.has(file.type);
  if (!allowedImageTypes.has(file.type) && !(allowVideo && isVideo)) throw new Error(allowVideo ? "Use JPG, PNG, WebP, MP4 ou WebM." : "Use uma imagem JPG, PNG ou WebP.");
  if (isVideo && file.size > maxVideoBytes) throw new Error("O vídeo pode ter no máximo 20 MB.");
  if (!isVideo && file.size > maxImageBytes) throw new Error("A imagem pode ter no máximo 5 MB.");
  const prepared = isVideo ? file : await compressImage(file);
  const extension = prepared.type === "image/webp" ? "webp" : prepared.type === "image/png" ? "png" : prepared.type === "video/webm" ? "webm" : prepared.type === "video/mp4" ? "mp4" : "jpg";
  const path = `${businessId}/${folder}/${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("public-page-media").upload(path, prepared, { contentType: prepared.type, upsert: false, cacheControl: "3600" });
  if (error) throw new Error("Não foi possível enviar o arquivo. Confirme se a migration do Storage foi aplicada.");
  const { data } = supabase.storage.from("public-page-media").getPublicUrl(path);
  return { path, url: data.publicUrl, type: isVideo ? "video" as const : "image" as const };
}

export const uploadPublicPageImage = (file: File, businessId: string, folder: string) => uploadPublicPageMedia(file, businessId, folder, false);

export async function deletePublicPageImage(path: string) {
  if (!path) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from("public-page-media").remove([path]);
  if (error) throw new Error("Não foi possível excluir a imagem.");
}
