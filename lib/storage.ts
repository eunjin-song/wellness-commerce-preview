import { requireClient } from "@/lib/supabase/client"
import { PUBLIC_BUCKET, QUESTION_BUCKET } from "@/lib/supabase/config"
import { uid } from "@/lib/format"

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
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
