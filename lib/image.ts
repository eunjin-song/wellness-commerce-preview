/**
 * 사진을 줄여서 data URL로 바꿉니다. (미리보기 단계에서는 브라우저에 저장하므로 용량을 줄여야 해요.
 * 서버를 연결하면 Storage에 올리는 방식으로 바뀝니다.)
 */
export async function compressImage(file: File, maxSide = 900, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("이미지를 처리할 수 없어요.")
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL("image/jpeg", quality)
}
