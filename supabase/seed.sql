-- 샘플 상품과 기본 설정. 마이그레이션(0001_init.sql) 실행 후에 한 번 실행하세요.
-- 샘플 상품은 관리자 화면에서 실제 상품으로 바꾸거나 숨길 수 있어요.

insert into public.shop_settings (key, value)
values ('shipping', '{"fee": 3000, "free_threshold": 50000}'::jsonb)
on conflict (key) do nothing;

insert into public.products
  (id, name, subtitle, category, price, stock, is_active, images, colors, sizes, ingredients, usage_guide, description)
values
  ($q$calm-sleep-serum$q$, $q$캄 슬립 세럼$q$, $q$잠들기 전 10분, 마음을 가라앉히는 의식$q$, $q$슬립 케어$q$, 42000, 18, true,
   array[$q$https://picsum.photos/seed/wellness-serum-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-serum-2/1000/1000$q$, $q$https://picsum.photos/seed/wellness-serum-3/1000/1000$q$]::text[],
   $q$[]$q$::jsonb,
   $q$[]$q$::jsonb,
   $q$카모마일 추출물, 라벤더 오일, 마그네슘 PCA가 긴장된 몸과 마음을 이완시켜 편안한 수면으로 이어줍니다.$q$, $q$취침 30분 전, 손목과 목 뒤에 2~3방울을 덜어 가볍게 문질러 흡수시켜 주세요.$q$, $q$하루의 긴장을 내려놓는 시간을 위해 만들었습니다.
무향의 자극적인 인공 향료 대신, 저용량의 라벤더와 카모마일만으로 은은하게 마음을 가라앉히는 데 집중했습니다.
매일 밤 같은 자리에 발라주는 작은 루틴이, 하루를 정리하는 신호가 되어줄 거예요.$q$),
  ($q$daily-collagen-ampoule$q$, $q$데일리 콜라겐 앰플$q$, $q$매일 아침, 피부에 건네는 짧은 인사$q$, $q$스킨케어$q$, 58000, 6, true,
   array[$q$https://picsum.photos/seed/wellness-ampoule-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-ampoule-2/1000/1000$q$]::text[],
   $q$[]$q$::jsonb,
   $q$[{"name":"30ml"},{"name":"50ml","extra":24000}]$q$::jsonb,
   $q$저분자 콜라겐, 판테놀, 병풀 추출물이 피부 결을 정돈하고 수분 장벽을 채워줍니다.$q$, $q$세안 후 토너 다음 단계에서 2~3펌프를 덜어 얼굴 전체에 부드럽게 펴 발라주세요.$q$, $q$아침에 바르는 5초의 습관이 하루의 피부 컨디션을 바꿉니다.
끈적임 없이 가볍게 스며드는 제형으로, 메이크업 전 단계에서도 부담 없이 사용할 수 있습니다.$q$),
  ($q$balance-magnesium$q$, $q$밸런스 마그네슘$q$, $q$예민한 날에도, 몸의 리듬을 지켜주는$q$, $q$이너뷰티$q$, 36000, 0, true,
   array[$q$https://picsum.photos/seed/wellness-supplement-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-supplement-2/1000/1000$q$]::text[],
   $q$[]$q$::jsonb,
   $q$[]$q$::jsonb,
   $q$마그네슘 비스글리시네이트, 비타민 B6이 신경 안정과 근육 이완을 돕습니다.$q$, $q$1일 1회, 취침 전 1캡슐을 물과 함께 섭취해 주세요.$q$, $q$바쁜 하루 끝, 몸이 스스로 쉬는 법을 잊지 않도록 돕는 미네랄입니다.
흡수율이 높은 비스글리시네이트 형태로 만들어 위 부담 없이 편안하게 섭취할 수 있습니다.$q$),
  ($q$ritual-body-oil$q$, $q$리추얼 바디 오일$q$, $q$샤워 후 3분, 나에게 집중하는 시간$q$, $q$바디케어$q$, 49000, 24, true,
   array[$q$https://picsum.photos/seed/wellness-oil-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-oil-2/1000/1000$q$, $q$https://picsum.photos/seed/wellness-oil-3/1000/1000$q$]::text[],
   $q$[]$q$::jsonb,
   $q$[]$q$::jsonb,
   $q$호호바 오일, 스위트아몬드 오일, 시어버터가 건조한 피부에 깊은 유연감을 더합니다.$q$, $q$샤워 직후 물기가 남아있는 피부에 적당량을 덜어 마사지하듯 흡수시켜 주세요.$q$, $q$바디케어를 하루를 마무리하는 의식으로 바꿔줍니다.
무겁지 않은 텍스처로 산뜻하게 흡수되며, 은은한 우디 향이 오래 남습니다.$q$),
  ($q$linen-sleep-robe$q$, $q$리넨 슬립 로브$q$, $q$샤워 뒤 걸치면 하루가 천천히 풀리는$q$, $q$라운지웨어$q$, 128000, 12, true,
   array[$q$https://picsum.photos/seed/wellness-robe-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-robe-2/1000/1000$q$, $q$https://picsum.photos/seed/wellness-robe-3/1000/1000$q$]::text[],
   $q$[{"name":"아이보리","hex":"#EDE6D8"},{"name":"모카","hex":"#9A8068"},{"name":"차콜","hex":"#4A4743","extra":10000}]$q$::jsonb,
   $q$[{"name":"S"},{"name":"M"},{"name":"L"}]$q$::jsonb,
   $q$프랑스산 린넨 100%. 세탁을 거듭할수록 부드러워지고 통기성이 좋아 사계절 입기 좋습니다.$q$, $q$30도 이하 찬물에 단독 손세탁 또는 울 코스로 세탁하고, 그늘에서 말려 주세요.$q$, $q$무게감 없이 몸을 감싸는 린넨 로브입니다.
여유 있는 핏이라 샤워 직후에도, 이른 아침 스트레칭 때도 편하게 입을 수 있어요.
사이즈는 S가 160cm 전후, M이 165cm 전후, L이 170cm 이상 기준입니다.$q$),
  ($q$silk-eye-mask$q$, $q$실크 아이마스크$q$, $q$빛을 덜어내고, 눈가는 부드럽게$q$, $q$슬립 케어$q$, 32000, 30, true,
   array[$q$https://picsum.photos/seed/wellness-mask-1/1000/1000$q$, $q$https://picsum.photos/seed/wellness-mask-2/1000/1000$q$]::text[],
   $q$[{"name":"크림","hex":"#EFE7DA"},{"name":"브라운","hex":"#7A6855"}]$q$::jsonb,
   $q$[]$q$::jsonb,
   $q$22 momme 뽕나무 실크. 눈가 자극을 줄이고 빛을 효과적으로 차단합니다.$q$, $q$중성세제로 가볍게 손세탁한 뒤 그늘에서 말려 주세요.$q$, $q$머리가 눌리지 않는 얇은 밴드와 부드러운 실크 원단으로 만들었습니다.
여행 중에도, 낮잠을 잘 때도 가볍게 쓸 수 있어요.$q$)
on conflict (id) do nothing;
