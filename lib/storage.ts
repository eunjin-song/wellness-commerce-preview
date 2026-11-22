import { requireClient } from "@/lib/supabase/client"
import { IR_BUCKET, PUBLIC_BUCKET, QUESTION_BUCKET } from "@/lib/supabase/config"
import { uid } from "@/lib/format"

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

/**
 * 저장소의 사진을 지웁니다. (글을 지울 때 함께 정리. 실패해도 글 삭제는 막지 않아요.)
 * - 공개 저장소는 사진 주소(http...), 비공개(Q&A)는 저장소 안의 경로를 받아요.
 */
export async function removeImages(bucket: typeof PUBLIC_BUCKET | typeof QUESTION_BUCKET, images: string[]): Promise<void> {
  const marker = `/${bucket}/`
  const paths = images
    .map((image) => (image.startsWith("http") ? (image.includes(marker) ? image.slice(image.indexOf(marker) + marker.length) : "") : image))
    .filter(Boolean)
  if (paths.length === 0) return
  try {
    await requireClient().storage.from(bucket).remove(paths)
  } catch {
    // 사진 정리는 베스트 에포트: 못 지워도 괜찮아요.
  }
}

/**
 * 화면에서 고른 사진(data URL)을 저장소에 올리고, 저장할 값을 돌려줍니다.
 * - 이미 올라간 주소(http...)는 그대로 둡니다. (상품 수정 때 기존 사진 유지)
 * - 공개 저장소는 "누구나 볼 수 있는 주소", 비공개(Q&A)는 "저장소 안의 경로"를 돌려줘요.
 */
export async function uploadImages(
  bucket: typeof PUBLIC_BUCKET | typeof QUESTION_BUCKET,
  folder: string,
  images: string[]
): Promise<string[]> {
  const supabase = requireClient()
  const result: string[] = []

  for (const image of images) {
    if (!image.startsWith("data:")) {
      result.push(image)
      continue
    }
    const blob = await dataUrlToBlob(image)
    const path = `${folder}/${uid()}.jpg`
    const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg", upsert: false })
    if (error) throw error

    result.push(bucket === PUBLIC_BUCKET ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path)
  }
  return result
}

/** IR 첨부파일 올리기 (관리자 전용). 저장소 안 경로와 원래 파일 이름을 돌려줘요. */
export async function uploadIrFile(file: File): Promise<{ path: string; name: string }> {
  const supabase = requireClient()
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin"
  // 한글 파일 이름은 주소에 쓰기 어려워서, 저장 이름은 무작위로 만들고 원래 이름은 따로 보관해요.
  const path = `ir/${uid()}.${ext}`
  const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false })
  if (error) throw error
  return { path, name: file.name }
}

/** IR 첨부파일 지우기 (실패해도 글 저장·삭제는 막지 않아요) */
export async function removeIrFile(path: string | null | undefined): Promise<void> {
  if (!path) return
  try {
    await requireClient().storage.from(IR_BUCKET).remove([path])
  } catch {
    // 파일 정리는 베스트 에포트예요.
  }
}
