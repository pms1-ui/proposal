# 프레젠테이션 제작 가이드

HTML 기반 인터랙티브 슬라이드 → PPTX 변환 파이프라인

---

## 폴더 구조

```
3 (제안서)/
├── index.html                          ← 제안서 목록 (링크 허브)
├── scripts/
│   ├── html2pptx.js                    ← PPTX 변환 스크립트
│   └── preview.js                      ← 시각 검수용 PNG 생성
├── images/
│   └── 260525_히로푸마키즈/            ← 프로젝트별 이미지
├── resources/
│   └── HIRO 브랜드 소개서.pdf          ← 참고 자료
├── output/
│   └── 260525_히로푸마키즈/            ← 프로젝트별 결과물
│       ├── index.html                  ← 슬라이드 뷰어
│       ├── *.pptx                      ← PPTX 파일
│       └── preview_slide_*.png         ← 시각 검수 프리뷰
├── package.json
└── PRESENTATION_GUIDE.md               ← 이 파일
```

---

## 네이밍 규칙

새 제안서를 만들 때는 항상 아래 규칙을 따릅니다:

```
폴더명: YYMMDD_제안명
예시: 260525_히로푸마키즈, 260610_나이키콜라보
```

- `images/YYMMDD_제안명/` — 해당 제안서에 사용되는 이미지
- `output/YYMMDD_제안명/` — 해당 제안서의 결과물 (HTML, PPTX, 프리뷰)
- 루트 `index.html`에 새 제안서 링크 추가

---

## 파이프라인

```
output/YYMMDD_제안명/index.html (편집) → 브라우저 프리뷰 → scripts로 변환 → PPTX
```

| 단계 | 작업 | 도구 |
|------|------|------|
| 1 | 콘텐츠 작성 | output/YYMMDD_제안명/index.html 편집 |
| 2 | 디자인 확인 | 브라우저에서 열기 (방향키로 탐색) |
| 3 | 시각 검수 | `node scripts/preview.js` → PNG 확인 |
| 4 | PPTX 변환 | `node scripts/html2pptx.js` |

---

## 실행 방법

### 프리뷰 (브라우저)
`output/YYMMDD_제안명/index.html`을 브라우저에서 열면 프리젠테이션 모드.

**조작:**
- `→` `↓` `Space` : 다음 슬라이드
- `←` `↑` : 이전 슬라이드
- 화면 우측 클릭 : 다음 / 좌측 클릭 : 이전
- 모바일 스와이프 지원

### 시각 검수
```bash
node scripts/preview.js
```

### PPTX 생성
```bash
node scripts/html2pptx.js
```

### 최초 설치
```bash
npm install
npx playwright install chromium
```

---

## 배포

루트 `index.html`이 제안서 목록 허브 역할을 합니다.
배포 시 전체 폴더를 그대로 올리면 `index.html` → 각 제안서 링크 → 슬라이드 뷰어로 동작합니다.

이미지 경로는 상대경로(`../../images/YYMMDD_제안명/`)로 참조합니다.

---

## 디자인 시스템

### 색상
- 포인트: `#EF383A` (빨간색)
- 다크: `#1a1a1a`
- 배경: `#ffffff` (라이트 모드 전용)
- 카드: `#f5f5f3`

### 타이포그래피
| 용도 | 크기 | 웨이트 |
|------|------|--------|
| 커버 타이틀 | 72px | 900 |
| 슬라이드 헤드라인 | 32px | 800 |
| 소타이틀 | 18px | 400 |
| 본문/불릿 | 20~22px | 500~600 |
| 카드 제목 | 28px | 700 |
| 라벨 | 14~16px | 700 |

### 슬라이드 패딩
- 전체: 90px (상하좌우 균일)

---

## 시각 검수 기준

| 항목 | 기준 |
|------|------|
| 세로 넘침 | 하단 엣지 = 배경색 (overflow 없음) |
| 폰트 최소 크기 | 본문 18px+, 라벨 12px+ |
| 숫자 강조 | 40px+ |
| 이미지 크롭 | object-position으로 핵심 부분 노출 |
