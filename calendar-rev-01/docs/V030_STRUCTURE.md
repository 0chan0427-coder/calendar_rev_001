# V030 구조와 에셋 추가

실제 앱 폴더의 구조를 유지했다. 기존 이미지·소스 경로를 대규모로 옮기지 않아
GitHub 웹 덮어쓰기에서 삭제 작업이나 Vercel Root Directory 변경이 필요하지 않다.
다운로드 압축에서만 기존의 이중 바깥 폴더를 없앴다.

| 위치 | 용도 |
|---|---|
| src/pages/WorldPage.tsx | 월드 화면과 데이터 연결 |
| src/components/world/CharacterAvatar.tsx | 확정 미니미 원본·눈 깜빡임 |
| src/components/world/AppearanceArt.tsx | 원본 색상 표시와 장식 레이어 합성 |
| src/components/world/WardrobePanel.tsx | 부위별 미리보기·구매·착용 저장 |
| src/components/world/CompanionAvatar.tsx | 동물 실물 표시 |
| src/data/wardrobe.ts | 미니미/고양이 아이템 정의·가격·부위·레이어 위치 |
| src/data/companions.ts | 동물 체형별 원본과 기준 캔버스 정의 |
| public/world/characters/base | 기존 확정 미니미, 원본 유지 |
| public/world/characters/overlays | 남녀 눈 깜빡임 전용 투명 이미지 |
| public/world/wearables/shared | 공용 장식 이미지 |
| public/world/animals/cats | 기존 고양이와 새 투명 기본 고양이 |
| supabase/013_world_appearance.sql | 구매·착용·방/정원 배치 저장과 검증 |

## 새 착용 이미지 추가

1. 투명 PNG/WebP를 해당 에셋 폴더에 추가한다. 이름은 영문 소문자/숫자/하이픈을 사용한다.
2. wardrobe.ts의 WEARABLES에 고유 ID, 이름, target, slot, price, mode:'image', image를 등록한다.
3. region은 원본 전체 캔버스의 백분율 [왼쪽,위,너비,높이]다.
   남녀 위치가 다르면 regionByGender, 전용 원본이 다르면 imageByGender를 사용한다.
4. z가 10보다 작으면 몸 뒤, 10 이상이면 몸 앞에 표시한다.
   날개는 뒤, 모자/리본은 앞에 두는 식으로 설정한다.
5. 새 SQL에서 world_wearable_catalog에 같은 ID/target/slot/price를 등록한다.
   서버의 가격과 소유권 검증을 유지하기 위해 프런트 목록만 추가해서 판매하지 않는다.
6. 남녀, 프로필, 방, 모바일 미리보기에서 위치를 확인한다.

원본 남성 128×273, 여성 157×276. 같은 전체 캔버스 크기로 레이어를 만들면
region 없이 [0,0,100,100]으로 정렬할 수 있다. 얼굴·체형을 바꾸지 않는다.
상의/하의 이미지 교체는 기존 잠옷을 가릴 수 있도록 전체 실루엣을 맞춰 제작한다.
현재 제공되는 잠옷은 기존 그림의 부위별 색상 변형이다.

## 동물 확장

다른 체형/품종은 companions.ts에 실제 카탈로그 item_id와 별도 body를 등록한다.
각 체형에서 장식의 기준 위치를 맞춰야 한다. 색상만 다른 같은 체형은 기본 원본을 공유할 수 있다.
현재 고양이 첫 구성은 같은 체형의 3색과 리본이며, 새 품종/다른 동물은 추가 원본이 필요하다.
현재 SQL의 고양이 착용 허용 판정은 item_id에 cat 또는 고양이 포함 여부를 사용한다.
다른 동물 계열로 확장할 때 프런트와 SQL의 대상/호환성 검증도 함께 확장한다.

## 기존 기능

기존 친구 동기화, 기본 아이템 지급, 비밀글/답글의 서버 마스킹,
출석·채팅·방문 포인트, 랭킹 금액은 기존 구현을 유지했다.
새로운 연속 출석 보너스나 주간 보너스 금액 변경은 이번에 추가하지 않았다.
기존 동물의 원본도 삭제하지 않았다. 고양이 외 동물은 기존 이미지 또는 카탈로그 image_url을 사용한다.

## 이미지 제작

리본과 투명 고양이는 내장 이미지 생성으로 제작했다.
리본 프롬프트: 앞을 향한 대칭 빨간 새틴 리본 단품, 귀여운 SD 미니홈피 스타일,
몸체·얼굴·배경·문자 없이 투명 배경, 사람과 고양이가 공유하는 장식.
고양이 프롬프트: 아이보리색 고양이 전신 앉은 정면, 큰 머리와 보이는 몸,
부드러운 도트풍 SD, 분홍 볼과 작은 코, 오른쪽 꼬리, 목걸이/의상/장식 없이 투명 배경.
저장 경로는 위 public/world 내 경로를 사용한다.
