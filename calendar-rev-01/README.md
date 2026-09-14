# 씩씩이들의 공유캘린더

React + TypeScript + Vite + Supabase 기반의 공유 캘린더입니다.

## 이번 구조개편

기존 기능과 `public`의 아이콘/이미지를 유지하면서, 거대한 `App.tsx`에 몰려 있던 인프라/DB 접근 코드를 분리했습니다.

```text
src/
├─ App.tsx                 # 앱 진입점
├─ pages/
│  └─ CalendarPage.tsx     # 기존 캘린더 화면/기능
├─ components/             # 다음 단계에서 화면 단위로 분리할 영역
├─ constants/
│  └─ calendar.ts
├─ hooks/                  # 기능별 상태 훅을 추가할 영역
├─ lib/
│  └─ supabase.ts
├─ services/
│  ├─ auth.ts
│  ├─ rooms.ts
│  ├─ events.ts
│  ├─ chat.ts
│  ├─ votes.ts
│  ├─ settlements.ts
│  └─ profiles.ts
└─ types/
   └─ database.ts

supabase/
└─ 001_room_security.sql
```

## 적용 순서

1. 현재 GitHub 프로젝트를 백업합니다.
2. 이 ZIP을 압축 해제합니다.
3. 압축 해제된 **내용물 전체**를 GitHub 저장소의 기존 프로젝트 루트(`calendar-rev-01`)에 업로드합니다.
4. 기존 파일이 모두 수정본과 동일하게 교체되었는지 확인한 뒤 Commit합니다.
5. Supabase SQL Editor에서 `supabase/001_schema_compatibility.sql → supabase/002_security_rls.sql`을 검토 후 실행합니다.
6. GitHub에 push하면 연결된 Vercel 배포가 새 버전을 빌드합니다.

## 환경변수

Vercel/로컬 환경에 다음 값이 필요합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`service_role` 키나 DB 비밀번호는 프론트엔드 코드에 넣지 않습니다.

## Supabase 마이그레이션 주의

`001_room_security.sql`은 기존 승인 사용자를 기존 방의 멤버로 연결하고, 새 승인 사용자/새 방에도 멤버십을 자동 생성합니다. 또한 기존에 방 정보가 없던 투표/메시지는 첫 번째 방에 연결하여 기존 데이터가 갑자기 화면에서 사라지는 것을 방지합니다.

실행 전 Supabase 백업 또는 SQL 변경 이력을 확인하는 것을 권장합니다.

## 검증

이 작업 환경에서는 npm 패키지 다운로드가 제한되어 `npm run build`의 실제 Vite 빌드 완료까지 확인하지 못했습니다. 따라서 GitHub에 반영한 뒤 Vercel Build 로그에서 첫 배포 결과를 반드시 확인하세요.


## 0.3.0 step 3
- Extracted the free chat UI into `src/components/chat/ChatView.tsx` without changing chat service behavior or room-selection logic.


## Integrated enhancement build (2026-09)
This build keeps the existing Supabase schema/RLS migration and adds incremental UI/UX improvements without changing the existing icon assets:
- Calendar event title/content search
- Vote title search and status filter
- Automatic client-side closing of expired votes when vote data is refreshed
- Settlement title search
- Safer vote creation guard requiring a selected room
- Calendar right-side date details follow the active event search filter
- Existing calendar/chat/vote/settlement services and room-scoped queries are retained

No additional Supabase SQL is required for these UI/logic changes.
