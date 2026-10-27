/* 사용 가이드 팝업 — 화면 툴팁과 같은 GLOSSARY·FIELD_HELP 문장을 쓴다 */
const GUIDE_TOC = [
  ['overview', '이 화면으로 하는 일'],
  ['start', '처음 쓰는 순서'],
  ['simulator', '시뮬레이터'],
  ['compare', '시나리오 비교'],
  ['hospital', '병원 기초정보'],
  ['performance', '병원정보'],
  ['kpisetting', '성과 설정'],
  ['fields', '입력 항목 설명'],
  ['glossary', '용어집'],
  ['faq', '자주 묻는 질문'],
];

const GUIDE_STEPS = [
  ['병원 실적 확인', '병원 기초정보 > 기본정보·실적에서 외래·입원·건강검진 인원과 <b>집계 기간</b>을 확인합니다. 12개월이 안 되는 실적은 연환산되어 쓰입니다.', 'hospital.html#info'],
  ['매출 항목 정하기', '병원 기초정보 > 매출 항목에서 쓸 항목을 켜고, 필요한 항목을 추가합니다. 산출 방식에 따라 시뮬레이터 입력 칸이 정해집니다.', 'hospital.html#items'],
  ['재무 상수 확인', '인건비·세율·감가상각·WACC 같은 공통 값을 확인합니다. 바꾸면 모든 시나리오 결과가 함께 달라집니다.', 'hospital.html#profile'],
  ['프리셋 준비', '시나리오 프리셋 탭에서 시작 값 묶음을 확인하고, 필요하면 프리셋을 추가합니다. 하한·상한 프리셋이 EBITDA 밴드를 정합니다.', 'hospital.html#presets'],
  ['시나리오 만들기', '시뮬레이터에서 <b>새 시나리오</b>를 눌러 이름과 설명을 쓰고 시작 프리셋을 고릅니다.', 'simulator.html'],
  ['입력 조정·결과 확인', '왼쪽 입력판의 값을 바꾸면 오른쪽 결과가 바로 다시 계산됩니다. 그래프와 표로 5년 변화를 보고, 그래프나 표의 연도를 누르면 그 연도가 선택됩니다.', 'simulator.html'],
  ['저장·비교', '상단 저장 버튼으로 저장합니다(버전이 1 올라갑니다). 시나리오 옆 <b>비교하기</b>를 누르면 새 창에서 다른 시나리오와 나란히 봅니다.', 'simulator.html'],
];

const GUIDE_SIM_AREAS = [
  ['시나리오 줄', '시나리오 선택, 비교하기, 새 시나리오·복제·삭제, 저장. 값을 바꾸면 "수정됨"이 붙고 저장 버튼이 켜집니다.'],
  ['프리셋', '콤보를 열면 프리셋마다 설명과 Y5 EBITDA가 나옵니다. 고르면 그 프리셋 값으로 입력이 바뀌고, 수정한 값은 되돌리기로 프리셋 값으로 돌립니다. 병원 실적의 집계 기간은 입력판의 환자 기반에 있습니다.'],
  ['입력판', '환자 기반 → 매출 항목 → 비용 → 구독자 누적 → 기타 순서. 매출 항목은 병원 기초정보에서 켠 항목만 나옵니다.'],
  ['핵심 지표', '선택 연도의 매출·EBITDA·세후이익·활성 구독자와 5년 추이선, EBITDA 밴드.'],
  ['추이 그래프 + 표', '5년 손익, 매출 항목별, 비용 항목별 추이. 그래프 바로 아래 표에 같은 숫자와 Y1→Y5 연평균 증가율이 있습니다.'],
  ['EBITDA 구성·기업가치', '선택 연도의 EBITDA가 만들어지는 과정, EV와 민감도 표. 아래에 상세 손익표와 가정·가드레일이 접혀 있습니다.'],
];

const GUIDE_COMPARE = [
  ['기준·비교 대상', '기준 시나리오 1개와 비교할 시나리오를 3개까지 고릅니다. 비교하기를 누를 때 시뮬레이터에서 보던 시나리오가 기준이 됩니다.'],
  ['요약 카드', '시나리오마다 프리셋·버전과 선택 연도의 매출·EBITDA, 기업가치(EV)를 보여 줍니다. 기준과의 차이가 함께 붙습니다.'],
  ['추이 그래프 + 표', '지표 탭(매출·EBITDA·EBITDA 마진·세후이익·활성 구독자)을 바꿔 5년 추이를 봅니다. 표에는 기준 대비 차이 행이 있습니다.'],
  ['입력값 차이', '시나리오끼리 다른 입력값만 모아 보여 줍니다. 기준과 다른 칸은 강조됩니다. "모든 입력 보기"를 켜면 같은 값도 나옵니다.'],
];

const GUIDE_HOS_TABS = [
  ['기본정보·실적', '병원 시스템', '병원명·통화·기준연도·운영 거점, 외래·입원·건강검진 실적과 집계 기간. 거점(심천·북경) 실적은 한 병원으로 합산합니다.'],
  ['매출 항목', '이 화면', '매출 항목 추가·편집·순서 변경·사용 여부. 산출 방식(구독형·연계 수수료형·건당형·연도별 직접 입력)이 시뮬레이터 입력 칸을 정합니다.'],
  ['재무 상수', '이 화면', '인건비·인원, 로열티·법인세, 감가상각·CAPEX, WACC·영구성장률·운전자본, 비용 배분 기준. 바꾸면 모든 시나리오 결과가 달라집니다.'],
  ['환자 구분 계수', '이 화면', '외래·입원·건강검진별 만성질환 비율, 위험군 비율, 연계 계수, 환자 증가율.'],
  ['시나리오 프리셋', '이 화면', '프리셋 추가·편집·삭제와 밴드 역할(하한·상한). 프리셋을 삭제해도 그 프리셋으로 만든 시나리오 값은 남습니다.'],
  ['가정', '이 화면', '입력값의 근거, 검증 여부, 적용 시작일. 미검증 가정은 시뮬레이터에 ⚠로 표시됩니다.'],
];

const GUIDE_PERF_AREAS = [
  ['조회 조건', '주기(월·분기)와 기간을 고릅니다. 오른쪽에 최근 연동 수신 시각과 입력 기한이 지난 빈 값(누락) 수가 나오고, 누르면 성과 설정 > 데이터 입력으로 갑니다.'],
  ['EBITDA 개선 여정', '기준 기간 대비 KPI 개선을 EBITDA로 바꾼 누적·연환산 효과와 목표 대비 비율, AR일수 단축으로 풀린 현금흐름 효과, KPI 상태 집계. 그래프는 기간별 효과(KPI별 쌓기)와 누적·계획 누적 선입니다.'],
  ['KPI 현황', 'KPI마다 현재값, 전기 대비 변화, 기준 → 목표와 진척률, 계획 경로와 함께 그린 추이, 최근 EBITDA 효과. 분류·상태로 거를 수 있습니다.'],
  ['KPI 상세', '카드를 누른 KPI의 실적·계획 경로·허용 오차 띠·기준·목표선, 보조 지표, 기간별 데이터 항목 값과 EBITDA 효과, 환산에 쓴 계수.'],
  ['EBITDA 효과 표', 'KPI × 기간 효과를 분류별 소계와 함께 봅니다. 현금흐름 효과는 EBITDA와 따로 둡니다.'],
];

const GUIDE_KPISET_TABS = [
  ['데이터 입력', '주·월·분기마다 데이터 항목 값을 입력합니다. 연동 항목은 잠긴 칸으로 보이고, 빈 칸은 기한이 지나면 누락으로 표시됩니다. 엑셀 양식을 내려받아 채운 뒤 올릴 수도 있습니다.'],
  ['KPI 항목', 'KPI 사용 여부·순서, 계산식(데이터 항목 + 사칙연산), 측정 주기·지연, EBITDA 환산 방식과 계수. 템플릿에서 MSPB·CMS 인센티브·추가 수익 항목 KPI를 추가합니다.'],
  ['기준·목표', 'KPI마다 기준 기간(기준값은 그 기간 평균 하나), 목표값·목표 시점, 중간 목표, 허용 오차. 저장하면 목표 이력이 남습니다.'],
  ['데이터 항목', '병원에서 받는 원자료의 단위·집계 방식·수집 주기·수집 방식(연동·파일 업로드·수기)과 연동 시작 기간.'],
];

const GUIDE_FAQ = [
  ['병원정보의 EBITDA 효과는 시뮬레이터 EBITDA와 같은 숫자인가요?', '다릅니다. 시뮬레이터는 새 사업의 5년 계획 EBITDA이고, 병원정보는 병원 운영 KPI가 기준 기간보다 좋아진 만큼을 금액으로 바꾼 실적 효과입니다. 두 화면은 연결하지 않습니다.'],
  ['재입원율은 왜 EBITDA 효과가 없나요?', '지불 방식에 따라 재입원 감소가 EBITDA를 올리기도(묶음·DRG/DIP) 내리기도(행위별 수가) 해서 하나의 계수로 정할 수 없습니다. 상태(달성·경로상·지연)만 봅니다.'],
  ['연동 값과 입력한 값이 다르게 표시돼요.', '연동으로 바꾸기 전 기간에 병원 시스템 값이 들어온 경우입니다. 입력한 값을 그대로 쓰고, 관리자가 데이터 입력 칸 메뉴에서 연동 값으로 바꿀지 정합니다.'],
  ['KPI 계산식을 바꾸면 지난달 숫자도 바뀌나요?', '바뀝니다. 기준값과 현재값을 같은 식으로 계산해야 진척률이 맞기 때문에 전 기간을 새 정의로 다시 계산하고, 변경 이력과 그래프 표시를 남깁니다.'],
  ['프리셋을 고친 뒤 기존 시나리오도 바뀌나요?', '바뀌지 않습니다. 프리셋은 시나리오를 만들 때의 시작 값입니다. 기존 시나리오에 새 프리셋 값을 쓰려면 시뮬레이터에서 프리셋을 다시 고르거나 "프리셋 값으로 되돌리기"를 누릅니다.'],
  ['비교 창에 저장하지 않은 수정값도 나오나요?', '나오지 않습니다. 비교 창은 저장된 시나리오로 계산합니다. 시뮬레이터에서 저장하거나 시나리오를 만들고 지우면 열려 있는 비교 창이 바로 다시 그려집니다.'],
  ['실적이 12개월이 안 되면 어떻게 계산하나요?', '실적 인원 × 12 ÷ 개월 수로 연환산해 씁니다. 시뮬레이터 상단과 입력판에 "연환산" 표시가 붙습니다.'],
  ['매출 항목을 끄면 입력한 값이 지워지나요?', '지워지지 않습니다. 시뮬레이터에서 보이지 않고 계산에서 빠질 뿐이며, 다시 켜면 이전 값으로 돌아옵니다.'],
  ['EBITDA 밴드가 보이지 않아요.', '하한(보수)과 상한(공격) 프리셋이 모두 있어야 보입니다. 병원 기초정보 > 시나리오 프리셋에서 밴드 역할을 지정하세요.'],
  ['잔존가치 경고는 무엇인가요?', '기업가치의 70% 이상이 Y5 이후 가치에서 나온다는 뜻입니다. WACC·영구성장률을 조금만 바꿔도 EV가 크게 변하므로 민감도 표를 함께 보세요.'],
];

function guideHtml(H) {
  const sec = (id, title, desc, body) => `<section id="g-${id}" data-gsec="${id}" class="space-y-4 border-b pb-8 last:border-0">
    <div class="space-y-1"><h3 class="text-lg font-semibold">${title}</h3>${desc ? `<p class="text-sm text-muted-foreground">${desc}</p>` : ''}</div>${body}</section>`;
  const go = (href, text) => `<a href="${href}" data-go class="text-sm text-primary underline-offset-4 hover:underline">${text}</a>`;
  const num = (n, solid) => `<span class="flex size-6 shrink-0 items-center justify-center rounded-full ${solid ? 'bg-primary text-primary-foreground' : 'border'} text-xs font-semibold">${n}</span>`;
  const areaList = list => `<ol class="space-y-3">${list.map(([t, d], i) => `<li class="flex gap-3">${num(i + 1)}<div><div class="text-sm font-medium">${t}</div><p class="text-sm text-muted-foreground">${d}</p></div></li>`).join('')}</ol>`;
  const box = (n, text, cls = '') => `<div class="flex items-center gap-2 rounded-md border bg-card p-2 ${cls}"><b class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">${n}</b>${text}</div>`;

  const overview = `<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    ${[['hospital', '병원 기초정보', '병원 실적과 매출 항목·재무 상수·프리셋처럼 시나리오가 함께 쓰는 고정 정보를 관리합니다.'],
       ['calculator', '시뮬레이터', '프리셋에서 시작한 시나리오의 입력값을 바꿔 5개년 매출·EBITDA·기업가치를 계산하고 저장합니다.'],
       ['git-compare', '시나리오 비교', '시뮬레이터의 비교하기로 새 창을 열어 여러 시나리오의 결과와 입력값 차이를 나란히 봅니다.'],
       ['activity', '병원정보', '병원에서 받은 성과 데이터로 KPI와 EBITDA 개선 효과를 주·월마다 재고, 목표 KPI까지의 여정을 봅니다.'],
       ['settings-2', '성과 설정', 'KPI·기준·목표·데이터 항목을 정하고, 연동이 안 되는 데이터를 주·월 단위로 입력합니다.']]
      .map(([icon, t, d]) => `<div class="space-y-2 rounded-lg border p-4"><span class="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"><i data-lucide="${icon}" class="size-5"></i></span><div class="font-medium">${t}</div><p class="text-sm text-muted-foreground">${d}</p></div>`).join('')}
    </div>
    <div class="flex items-start gap-2 rounded-lg bg-muted/60 px-4 py-3 text-sm"><i data-lucide="circle-help" class="mt-0.5 size-4 shrink-0 text-primary"></i><span>화면 곳곳의 <b>물음표 아이콘</b>에 마우스를 올리면(터치 화면은 누르면) 그 항목의 설명이 바로 뜹니다. 이 가이드는 시뮬레이터·병원정보 제목 옆 <b>사용 가이드</b> 버튼이나 <kbd class="rounded border px-1 text-xs">?</kbd> 키로 엽니다.</span></div>`;

  const steps = `<ol class="grid gap-3 md:grid-cols-2">${GUIDE_STEPS.map(([t, d, href], i) => `<li class="flex gap-3 rounded-lg border p-4">${num(i + 1, true)}
    <div class="space-y-1.5"><div class="font-medium">${t}</div><p class="text-sm text-muted-foreground">${d}</p>${go(href, '바로 가기 →')}</div></li>`).join('')}</ol>`;

  const simWire = `<div class="grid h-fit gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
    ${box(1, '시나리오 · <u>비교하기</u> · 새 시나리오 · 복제 · 삭제 <span class="ms-auto">저장</span>')}
    ${box(2, '프리셋 선택 · 설명')}
    <div class="grid grid-cols-[1fr_2fr] gap-2">
      <div class="flex min-h-36 items-start gap-2 rounded-md border bg-card p-2"><b class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">3</b>입력판</div>
      <div class="grid gap-2">${box(4, '핵심 지표')}${box(5, '그래프 → 표 (×3)')}${box(6, 'EBITDA 구성 · EV')}</div>
    </div>
  </div>`;
  const simBody = `<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">${simWire}${areaList(GUIDE_SIM_AREAS)}</div>
    <div class="grid gap-3 md:grid-cols-3">
      ${[['mouse-pointer-click', '연도 고르기', '상단 Y1~Y5 탭, 그래프의 연도 영역, 표의 연도 머리글 어느 것을 눌러도 같은 연도가 선택됩니다.'],
        ['triangle-alert', '⚠ 표시', '병원 실적이나 계약으로 확인되지 않은 가정입니다. 가정·가드레일에 모아 보여 줍니다.'],
        ['history', '저장과 버전', '저장할 때마다 버전이 올라갑니다. 저장하지 않고 다른 시나리오로 바꾸면 수정한 값은 사라집니다.']]
        .map(([icon, t, d]) => `<div class="space-y-1.5 rounded-lg bg-muted/60 p-4"><div class="flex items-center gap-2 text-sm font-medium"><i data-lucide="${icon}" class="size-4 text-primary"></i>${t}</div><p class="text-sm text-muted-foreground">${d}</p></div>`).join('')}
    </div>`;

  const cmpWire = `<div class="grid h-fit gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
    <div class="flex items-center gap-2 rounded-md border bg-card p-2"><i data-lucide="app-window" class="size-4 text-muted-foreground"></i>새 창 <span class="ms-auto">창 닫기</span></div>
    ${box(1, '기준 시나리오 · 비교 대상 (최대 3개) · 연도')}
    <div class="grid grid-cols-4 gap-2">${[0, 1, 2, 3].map(i => `<div class="flex items-center gap-1.5 rounded-md border bg-card p-2">${i === 0 ? '<b class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">2</b>' : ''}요약</div>`).join('')}</div>
    ${box(3, '지표 탭 · 그래프 → 표')}
    ${box(4, '입력값 차이')}
  </div>`;
  const cmpBody = `<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">${cmpWire}${areaList(GUIDE_COMPARE)}</div>`;

  const hosBody = `<div class="overflow-x-auto"><table class="w-full min-w-[640px] text-sm"><thead><tr class="border-b"><th class="th">탭</th><th class="th">관리</th><th class="th">내용</th></tr></thead>
    <tbody>${GUIDE_HOS_TABS.map(([t, who, d]) => `<tr class="border-b last:border-0 align-top"><td class="td font-medium">${t}</td><td class="td">${who === '병원 시스템' ? '<span class="badge badge-secondary"><i data-lucide="lock" class="size-3"></i>병원 시스템 제공</span>' : '<span class="badge badge-outline"><i data-lucide="pencil" class="size-3"></i>이 화면에서 관리</span>'}</td><td class="td whitespace-normal text-muted-foreground">${d}</td></tr>`).join('')}</tbody></table></div>`;

  const perfWire = `<div class="grid h-fit gap-2 rounded-lg border bg-muted/40 p-3 text-xs">
    ${box(1, '주기 · 기간 <span class="ms-auto">누락 → 데이터 입력</span>')}
    ${box(2, 'EBITDA 개선 여정 — 누적 · 연환산/목표 · 현금 · 상태 · 그래프')}
    <div class="grid grid-cols-3 gap-2">${[0, 1, 2].map(i => `<div class="flex items-center gap-1.5 rounded-md border bg-card p-2">${i === 0 ? '<b class="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">3</b>' : ''}KPI 카드</div>`).join('')}</div>
    ${box(4, 'KPI 상세 — 추이 · 보조 지표 · 기간별 표')}
    ${box(5, 'EBITDA 효과 표 (접힘)')}
  </div>`;
  const perfBody = `<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">${perfWire}${areaList(GUIDE_PERF_AREAS)}</div>
    <div class="grid gap-3 md:grid-cols-3">
      ${[['flag', '상태', '최근 확정 기간 값이 목표에 닿으면 달성, 계획 경로와 허용 오차 안이면 경로상, 더 뒤처지면 지연입니다.'],
        ['hourglass', '잠정 값', '측정 지연 기간 안의 값(재입원율 1개월, 청구삭감율 2개월)은 흐리게·기울임으로 보이고 상태 판정에 쓰지 않습니다.'],
        ['coins', '금액 환산', '병원 통화로 받은 값을 연도별 고정 환율로 보고 통화로 바꿔 보여 줍니다. 환율은 병원 기초정보 > 재무 상수에 있습니다.']]
        .map(([icon, t, d]) => `<div class="space-y-1.5 rounded-lg bg-muted/60 p-4"><div class="flex items-center gap-2 text-sm font-medium"><i data-lucide="${icon}" class="size-4 text-primary"></i>${t}</div><p class="text-sm text-muted-foreground">${d}</p></div>`).join('')}
    </div>`;
  const kpisetBody = `<div class="overflow-x-auto"><table class="w-full min-w-[640px] text-sm"><thead><tr class="border-b"><th class="th">탭</th><th class="th">내용</th></tr></thead>
    <tbody>${GUIDE_KPISET_TABS.map(([t, d]) => `<tr class="border-b last:border-0 align-top"><td class="td font-medium">${t}</td><td class="td whitespace-normal text-muted-foreground">${d}</td></tr>`).join('')}</tbody></table></div>
    <div class="flex items-start gap-2 rounded-lg bg-muted/60 px-4 py-3 text-sm"><i data-lucide="user-cog" class="mt-0.5 size-4 shrink-0 text-primary"></i><span>데이터 입력은 모든 역할이 할 수 있습니다. KPI 항목·기준·목표·데이터 항목 편집과 연동 값 보정은 고객 관리자 이상만 할 수 있습니다.</span></div>`;

  const fieldGroups = [
    ...H.revenueItems.filter(i => i.enabled).map(i => [i.name, [...(i.toggle ? [{ key: i.toggle, label: `${i.name} 사용` }] : []), ...i.fields]]),
    ['비용', [['opexRate', '운영비율'], ['mktgRate', '마케팅·CAC·간접비'], ['bizdevK', '초기사업개발비'], ['omRate', '유지보수비']].map(([key, label]) => ({ key, label }))],
    ['구독자 누적 (Reservoir)', [['reservoir', '구독자 누적 사용'], ['churn0', '기본 이탈률'], ['rpmAdopt', 'RPM 침투율'], ['rpmDelta', 'RPM 이탈감소 효과 δ']].map(([key, label]) => ({ key, label }))],
    ['기타', [{ key: 'hcAttr', label: 'CAPEX를 EBITDA 비용에 포함' }]],
  ];
  const fieldsBody = `<div class="overflow-x-auto"><table class="w-full min-w-[640px] text-sm"><thead><tr class="border-b"><th class="th">묶음</th><th class="th">입력</th><th class="th">설명</th></tr></thead><tbody>
    ${fieldGroups.map(([g, fs]) => fs.map((f, i) => `<tr class="border-b align-top">${i === 0 ? `<td class="td font-medium" rowspan="${fs.length}">${esc(g)}</td>` : ''}<td class="td">${f.label}${f.warn ? ' <span class="badge badge-destructive px-1.5 py-0">⚠</span>' : ''}</td><td class="td whitespace-normal text-muted-foreground">${fieldHelp(f)}</td></tr>`).join('')).join('')}
    </tbody></table></div>`;

  const glossaryBody = `<label class="relative block max-w-sm"><i data-lucide="search" class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"></i><input id="glossarySearch" class="input ps-9" placeholder="용어 검색 (예: EBITDA, 연환산)" /></label>
    <dl class="grid gap-3 md:grid-cols-2">${Object.entries(GLOSSARY).map(([k, v]) => `<div class="rounded-lg border p-4" data-term="${esc(k + ' ' + v)}"><dt class="font-medium">${k}</dt><dd class="mt-1 text-sm text-muted-foreground">${v}</dd></div>`).join('')}</dl>
    <p id="glossaryEmpty" class="hidden text-sm text-muted-foreground">찾는 용어가 없습니다.</p>`;

  const faqBody = `<div class="divide-y rounded-lg border">${GUIDE_FAQ.map(([q, a]) => `<details class="group p-4"><summary class="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">${q}<i data-lucide="chevron-down" class="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"></i></summary><p class="mt-2 text-sm text-muted-foreground">${a}</p></details>`).join('')}</div>`;

  return `<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
    <nav aria-label="가이드 목차" class="top-0 z-10 bg-card pb-2 md:sticky"><ul class="flex flex-wrap gap-1 md:flex-col">${GUIDE_TOC.map(([id, t]) => `<li><a href="#g-${id}" data-gtoc="${id}" class="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">${t}</a></li>`).join('')}</ul></nav>
    <div class="min-w-0 space-y-8 pb-4">
      ${sec('overview', '이 화면으로 하는 일', `${esc(H.name)}의 EBITDA를 계획(시뮬레이터)하고 추적(병원정보)합니다.`, overview)}
      ${sec('start', '처음 쓰는 순서', '병원 기초정보를 먼저 확인하고 시뮬레이터에서 시나리오를 만듭니다.', steps)}
      ${sec('simulator', '시뮬레이터', '화면은 위에서 아래로 시나리오 → 입력 → 결과 순서입니다.', simBody)}
      ${sec('compare', '시나리오 비교', '시뮬레이터의 시나리오 선택 옆 <b>비교하기</b>를 누르면 새 창으로 열립니다. 시뮬레이터와 나란히 두고 볼 수 있습니다.', cmpBody)}
      ${sec('hospital', '병원 기초정보', '시나리오가 함께 쓰는 고정 정보입니다. 병원 시스템이 주는 정보는 읽기만 할 수 있습니다.', hosBody)}
      ${sec('performance', '병원정보', '병원 운영 KPI가 기준 기간에서 목표까지 얼마나 왔는지, 그 개선이 EBITDA를 얼마나 바꿨는지 봅니다. 조회만 하는 화면입니다.', perfBody)}
      ${sec('kpisetting', '성과 설정', '병원정보가 쓰는 KPI·목표·데이터를 관리합니다.', kpisetBody)}
      ${sec('fields', '입력 항목 설명', '시뮬레이터 입력판의 각 항목입니다. 입력판의 물음표 아이콘에도 같은 설명이 나옵니다.', fieldsBody)}
      ${sec('glossary', '용어집', '', glossaryBody)}
      ${sec('faq', '자주 묻는 질문', '', faqBody)}
    </div></div>`;
}

/* 바로 가기 — 비교 창에서는 시뮬레이터 창(opener)을 옮기고, 같은 화면이면 팝업만 닫는다 */
function guideGo(href, close) {
  const [file, hash] = href.split('#');
  const here = location.pathname.split('/').pop() || 'simulator.html';
  close();
  if (here === 'compare.html') {
    if (window.opener && !window.opener.closed) { window.opener.location.href = href; window.opener.focus(); }
    else window.open(href, '_blank');
  } else if (file === here) { if (hash) location.hash = hash; }
  else location.href = href;
}

function openGuide(section) {
  if (document.querySelector('[data-guide-modal]')) return;
  const H = loadHospitals()[0];
  const start = GUIDE_TOC.some(([id]) => id === section) ? section : 'overview';
  openModal({
    title: '사용 가이드',
    desc: '화면 구성, 처음 쓰는 순서, 입력 항목과 용어 설명입니다.',
    size: 'max-w-6xl', height: 'h-[88vh]', autofocus: false,
    body: guideHtml(H),
    footer: `<span class="me-auto hidden items-center text-xs text-muted-foreground sm:flex"><kbd class="me-1 rounded border px-1">?</kbd> 열기 · <kbd class="mx-1 rounded border px-1">Esc</kbd> 닫기</span><button type="button" class="btn btn-outline" data-close>닫기</button>`,
    onMount: (el, close) => {
      el.querySelector('[role="dialog"]').dataset.guideModal = '';
      const scroller = el.querySelector('.overflow-y-auto');
      const links = [...el.querySelectorAll('[data-gtoc]')];
      const mark = id => links.forEach(a => { const on = a.dataset.gtoc === id; a.classList.toggle('bg-accent', on); a.classList.toggle('text-foreground', on); });
      const jump = id => { scroller.scrollTop += el.querySelector(`#g-${id}`).getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8; mark(id); };
      const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && mark(e.target.dataset.gsec)),
        { root: scroller, rootMargin: '0px 0px -75% 0px' });
      el.querySelectorAll('[data-gsec]').forEach(s => observer.observe(s));
      el.addEventListener('click', e => {
        const toc = e.target.closest('[data-gtoc]');
        if (toc) { e.preventDefault(); jump(toc.dataset.gtoc); return; }
        const a = e.target.closest('[data-go]');
        if (a) { e.preventDefault(); guideGo(a.getAttribute('href'), close); }
      });
      el.querySelector('#glossarySearch').addEventListener('input', e => {
        const q = e.target.value.trim().toLowerCase();
        let shown = 0;
        el.querySelectorAll('[data-term]').forEach(d => { const on = !q || d.dataset.term.toLowerCase().includes(q); d.classList.toggle('hidden', !on); shown += on; });
        el.querySelector('#glossaryEmpty').classList.toggle('hidden', shown > 0);
      });
      requestAnimationFrame(() => jump(start));
    },
  });
}
