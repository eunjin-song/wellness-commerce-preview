/** 서버(Supabase)에 연결되지 않았거나 상품을 불러오지 못했을 때 보여주는 안내 */
export default function ServerNotice({ configured }: { configured: boolean }) {
  return (
    <div role="status" className="rounded-2xl border border-brown/30 bg-paper p-6 text-sm leading-relaxed">
      <p className="font-medium">{configured ? "상품을 불러오지 못했어요." : "서버가 아직 연결되지 않았어요."}</p>
      <p className="mt-2">
        {configured
          ? "잠시 후 다시 시도해 주세요. 계속 안 되면 관리자에게 알려주세요."
          : "Supabase 연결 정보(.env.local 또는 Vercel 환경 변수)를 넣으면 상품이 나타나요. supabase/README.md 를 참고하세요."}
      </p>
    </div>
  )
}
