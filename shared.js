/* EBITDA 시뮬레이터 시안 공용 스크립트 — 스타일, 병원 데이터, 형식, 차트, 셸, 모달
 * 두 시안(simulator.html, hospital.html)이 같은 병원 데이터를 읽어야 병원 기초정보에서 추가한 프리셋·매출 항목이
 * 시뮬레이터에 그대로 나타난다. <head>에서 Tailwind 스크립트보다 먼저 불러온다. */

/* ---------- 스타일: 호스트 app/globals.css 토큰 + core 컴포넌트 클래스 ---------- */
(() => {
  const tokens = document.createElement('style');
  tokens.textContent = `
  :root {
    --tint-h: 145; --radius: 0.75rem;
    --background: oklch(0.993 0.003 var(--tint-h)); --foreground: oklch(0.18 0.01 var(--tint-h));
    --card: oklch(1 0 0); --card-foreground: oklch(0.18 0.01 var(--tint-h)); --popover: oklch(1 0 0);
    --primary: oklch(0.54 0.1 145); --primary-foreground: oklch(0.99 0 0);
    --secondary: oklch(0.965 0.007 var(--tint-h)); --secondary-foreground: oklch(0.25 0.01 var(--tint-h));
    --muted: oklch(0.965 0.006 var(--tint-h)); --muted-foreground: oklch(0.5 0.01 var(--tint-h));
    --accent: oklch(0.95 0.02 var(--tint-h)); --accent-foreground: oklch(0.34 0.05 var(--tint-h));
    --destructive: oklch(0.55 0.2 25); --destructive-foreground: oklch(0.985 0 0);
    --success: oklch(0.6 0.12 155); --success-foreground: oklch(0.985 0 0);
    --warning: oklch(0.75 0.13 80); --warning-foreground: oklch(0.22 0.02 75);
    --border: oklch(0.925 0.006 var(--tint-h)); --input: oklch(0.925 0.006 var(--tint-h)); --ring: oklch(0.54 0.1 145);
    --chart-1: oklch(0.54 0.1 145); --chart-2: oklch(0.55 0.1 235); --chart-3: oklch(0.55 0.09 195);
    --chart-4: oklch(0.75 0.12 80); --chart-5: oklch(0.5 0.03 260);
    --sidebar: oklch(0.985 0.004 var(--tint-h)); --sidebar-foreground: oklch(0.18 0.01 var(--tint-h));
    --sidebar-accent: oklch(0.93 0.02 var(--tint-h)); --sidebar-border: oklch(0.925 0.006 var(--tint-h));
    --sidebar-primary: oklch(0.47 0.089 145);
  }
  .dark {
    --tint-h: 160;
    --background: oklch(0.168 0.006 var(--tint-h)); --foreground: oklch(0.92 0.005 var(--tint-h));
    --card: oklch(0.205 0.006 var(--tint-h)); --card-foreground: oklch(0.92 0.005 var(--tint-h)); --popover: oklch(0.205 0.006 var(--tint-h));
    --primary: oklch(0.65 0.19 160); --primary-foreground: oklch(0.168 0.006 var(--tint-h));
    --secondary: oklch(0.248 0.008 var(--tint-h)); --secondary-foreground: oklch(0.92 0.005 var(--tint-h));
    --muted: oklch(0.248 0.008 var(--tint-h)); --muted-foreground: oklch(0.68 0.01 var(--tint-h));
    --accent: oklch(0.28 0.03 var(--tint-h)); --accent-foreground: oklch(0.9 0.03 var(--tint-h));
    --destructive: oklch(0.62 0.19 25); --destructive-foreground: oklch(0.92 0.005 var(--tint-h));
    --success: oklch(0.68 0.13 155); --warning: oklch(0.78 0.13 80); --warning-foreground: oklch(0.168 0.006 var(--tint-h));
    --border: oklch(0.269 0.008 var(--tint-h)); --input: oklch(0.269 0.008 var(--tint-h)); --ring: oklch(0.65 0.19 160);
    --chart-1: oklch(0.65 0.19 160); --chart-2: oklch(0.65 0.11 235); --chart-3: oklch(0.72 0.09 195);
    --chart-4: oklch(0.8 0.12 80); --chart-5: oklch(0.65 0.03 260);
    --sidebar: oklch(0.15 0.007 var(--tint-h)); --sidebar-foreground: oklch(0.88 0.005 var(--tint-h));
    --sidebar-accent: oklch(0.24 0.03 var(--tint-h)); --sidebar-border: oklch(0.24 0.008 var(--tint-h));
    --sidebar-primary: oklch(0.65 0.19 160);
  }`;
  const tw = document.createElement('style');
  tw.type = 'text/tailwindcss';
  tw.textContent = `
  @custom-variant dark (&:is(.dark *));
  @theme inline {
    --color-background: var(--background); --color-foreground: var(--foreground);
    --color-card: var(--card); --color-card-foreground: var(--card-foreground); --color-popover: var(--popover);
    --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
    --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);
    --color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar-accent: var(--sidebar-accent); --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-success: var(--success); --color-success-foreground: var(--success-foreground);
    --color-warning: var(--warning); --color-warning-foreground: var(--warning-foreground);
    --radius-sm: calc(var(--radius) - 4px); --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius); --radius-xl: calc(var(--radius) + 4px);
    --font-sans: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  }
  @layer base {
    * { @apply border-border; }
    body { @apply bg-background text-foreground font-sans antialiased; }
    button:not(:disabled) { cursor: pointer; }
  }
  @layer components {
    .card { @apply rounded-xl border bg-card text-card-foreground shadow-sm; }
    .card-header { @apply flex flex-col gap-1.5 p-6; }
    .card-title { @apply font-semibold leading-none tracking-tight; }
    .card-desc { @apply text-sm text-muted-foreground; }
    .card-content { @apply p-6 pt-0; }
    .btn { @apply inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0; }
    .btn-default { @apply bg-primary text-primary-foreground shadow-xs hover:bg-primary/90; }
    .btn-outline { @apply border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input; }
    .btn-ghost { @apply hover:bg-accent hover:text-accent-foreground; }
    .btn-destructive { @apply bg-destructive text-white shadow-xs hover:bg-destructive/90; }
    .btn-sm { @apply h-8 gap-1.5 px-3; }
    .btn-icon { @apply size-8 px-0; }
    .badge { @apply inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap; }
    .badge-secondary { @apply border-transparent bg-secondary text-secondary-foreground; }
    .badge-destructive { @apply border-transparent bg-destructive text-destructive-foreground shadow-sm; }
    .badge-warning { @apply border-transparent bg-warning text-warning-foreground shadow-sm; }
    .badge-outline { @apply text-foreground; }
    .input { @apply h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30; }
    .textarea { @apply w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30; }
    .select { @apply h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 appearance-none pe-8 bg-[length:16px] bg-no-repeat bg-[right_0.6rem_center]; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
    .select option, .select optgroup { @apply bg-popover text-foreground; }
    .tabs-list { @apply inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground; }
    .tabs-trigger { @apply inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground; }
    .tabs-trigger[data-state='active'] { @apply bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30; }
    .switch { @apply inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all bg-input dark:bg-input/80; }
    .switch[data-state='checked'] { @apply bg-primary; }
    .switch > span { @apply pointer-events-none block size-4 rounded-full bg-background transition-transform translate-x-0; }
    .switch[data-state='checked'] > span { @apply translate-x-[calc(100%-2px)]; }
    .th { @apply h-10 px-2 text-start align-middle font-medium whitespace-nowrap text-muted-foreground; }
    .td { @apply px-2 py-2 align-middle whitespace-nowrap; }
    .num { @apply text-end tabular-nums; }
    .label { @apply text-sm font-medium; }
  }
  input[type='range'] { accent-color: var(--primary); }
  input[type='checkbox'], input[type='radio'] { accent-color: var(--primary); }`;
  document.head.append(tokens, tw);
})();

/* ---------- VISTA 프로토타입 기준값 (tests/fixtures/prototype_v4_golden.json) ---------- */
const GOLDEN_KEYS = ['sub','ref','fam','corpRev','commRev','labor','opex','mktg','bizdev','royalty','om','dep','tax','subscribers','medActive','totEbitda','ebit','nopat'];
const GOLDEN = {
  kpmg: [[411041,146561,51145,0,0,140620,133924,231324,550000,60875,30437,210000,0,4239,1798,-538433,-748433,-748433],[1166620,421219,381103,0,0,168744,433167,654673,550000,196894,98447,210000,0,9200,5698,-132984,-342984,-342984],[2537008,737996,1037766,1356800,0,421860,1247306,1615828,0,566957,283479,330000,180621,16102,11451,1534142,1204142,1023521],[4665263,1099945,2099283,2787200,0,478108,2343372,2529777,0,1065169,532585,330000,505902,24768,18876,3702681,3372681,2866779],[7684212,1510286,3653427,4291200,0,562480,3770608,3256434,0,1713913,856956,330000,997310,35074,27845,6978735,6648735,5651425]],
  base: [[576044,244268,117417,0,0,140620,187546,187546,519000,93773,46886,210000,0,5817,2766,-237642,-447642,-447642],[1438043,500472,499314,0,0,168744,487566,426620,519000,243783,121891,210000,39034,11191,7212,470225,260225,221191],[2883014,795008,1170361,3392000,0,421860,1648077,1236058,0,824038,412019,330000,505250,18143,13160,3698332,3368332,2863082],[5031637,1130640,2196921,6968000,0,478108,3065440,1915900,0,1532720,766360,330000,1085801,26550,20485,7568671,7238671,6152870],[7998178,1510286,3653427,10728000,0,562480,4777978,2388989,0,2388989,1194495,330000,1837044,36330,29101,12576960,12246960,10409916]],
  aggr: [[806462,341976,230138,0,0,140620,248144,206786,350000,137858,41357,210000,6572,8144,3873,253811,43811,37239],[1783036,579725,669172,0,1362659,168744,791027,576790,350000,439459,131838,210000,259010,13876,8941,1936735,1726735,1467724],[3304077,852020,1350413,4748800,8912618,421860,3450227,2156392,0,1916793,575038,330000,1547643,20760,15113,10647618,10317618,8769975],[5464460,1161336,2325792,9755200,16569760,478108,6349779,3307176,0,3527655,1058296,330000,3033830,28735,22324,20555534,20225534,17191704],[8356997,1510286,3653427,15019200,24330577,562480,9516688,3965287,0,5287049,1586115,330000,4743430,37766,30536,31952870,31622870,26879439]],
  reg: [[411041,146561,51145,0,0,140620,133924,243499,550000,60875,30437,210000,0,4239,1798,-550608,-760608,-760608],[1166620,421219,381103,0,500488,168744,543275,864301,550000,246943,123472,210000,0,9200,5698,-27304,-237304,-237304],[2537008,737996,1037766,1017600,1691937,421860,1544908,2106692,0,702231,351115,330000,234825,16102,11451,1895501,1565501,1330676],[4665263,1099945,2099283,2090400,2979357,478108,2845535,3233562,0,1293425,646712,330000,616036,24768,18876,4436906,4106906,3490870],[7684212,1510286,3653427,3218400,4356048,562480,4492922,4084475,0,2042237,1021119,330000,1183371,35074,27845,8219140,7889140,6705769]],
  feecut: [[411041,87937,30687,0,0,140620,116526,201272,550000,52966,26483,210000,0,4239,1798,-558204,-768204,-768204],[1166620,252732,228662,0,0,168744,362563,547965,550000,164801,82401,210000,0,9200,5698,-228460,-438460,-438460],[2537008,442798,622660,1032960,0,421860,1019794,1321096,0,463543,231771,330000,127104,16102,11451,1177362,847362,720258],[4665263,659967,1259570,2110080,0,478108,1912874,2065034,0,869488,434744,330000,390695,24768,18876,2934632,2604632,2213938],[7684212,906172,2192056,3231360,0,562480,3083036,2662622,0,1401380,700690,330000,791039,35074,27845,5603592,5273592,4482553]],
};

/* ---------- 공통 상수 ---------- */
const COST_ITEMS = [
  { key: 'labor', label: '인건비' },
  { key: 'opex', label: '운영비' },
  { key: 'mktg', label: '마케팅·CAC·간접비' },
  { key: 'bizdev', label: '사업개발비' },
  { key: 'royalty', label: '로열티' },
  { key: 'om', label: '유지보수비' },
];
const VOLUME_TYPES = [
  { key: 'OUT', label: '외래' },
  { key: 'IN', label: '입원' },
  { key: 'CHK', label: '건강검진' },
];
const BASE_LABEL = { OUT: '외래 인원', IN: '입원 인원', CHK: '건강검진 인원', SUBS: '활성 구독자', CORP: '기업 대상 인원' };
const BAND_LABEL = { LOW: '하한 · 보수', HIGH: '상한 · 공격' };
const ALLOCATION_LABEL = { REVENUE_SHARE: '매출비중', SEGMENT_REVENUE: '부문 매출 기준', MEDICAL_ONLY: 'Medical에만', COMMERCE_ONLY: 'Commerce에만' };

/* 산출 방식 — 매출 항목을 추가하면 산출 방식이 시뮬레이터 입력 항목을 정한다 */
const CALC_TYPES = {
  SUBSCRIPTION: { label: '구독형', formula: '기반 인원 × 전환율 × 구독료', fields: [
    { s: 'conv', label: '전환율', unit: '%', min: 0, max: 60, step: 0.5, def: 5 },
    { s: 'fee', label: '구독료', unit: '/년', number: true, money: true, def: 0 },
  ] },
  REFERRAL_FEE: { label: '연계 수수료형', formula: '기반 인원 × 연계율 × 방문횟수 × 진료비 × 수수료율', fields: [
    { s: 'rate', label: '연계율', unit: '%', min: 0, max: 80, step: 1, def: 10 },
    { s: 'visits', label: '연간 방문횟수', unit: '회', min: 1, max: 12, step: 1, def: 3 },
    { s: 'cost', label: '방문당 진료비', unit: '', number: true, money: true, def: 0 },
    { s: 'fee', label: '수수료율', unit: '%', min: 0, max: 40, step: 1, def: 15 },
  ] },
  PER_CASE: { label: '건당형', formula: '기반 인원 × 대상 비율 × 건당 단가', fields: [
    { s: 'ratio', label: '대상 비율', unit: '%', min: 0, max: 60, step: 0.5, def: 10 },
    { s: 'price', label: '건당 단가', unit: '', number: true, money: true, def: 0 },
  ] },
  MANUAL: { label: '연도별 직접 입력', formula: 'Y1~Y5 금액을 그대로 매출로 사용', fields: [
    { s: 'amount', label: '연도별 금액', yearly: true, money: true },
  ] },
};
const makeFields = (itemKey, type) => CALC_TYPES[type].fields.map(({ s, ...f }) => ({ key: `${itemKey}.${s}`, ...f }));

/* ---------- 병원 ---------- */
const HOSPITAL_SEED = [
  {
    id: 'vista', name: 'VISTA 헬스케어', code: 'H-0001', country: '중국', currency: 'CNY', report: 'USD',
    fx: '1 USD = 7.10 CNY (2025 평균)', baseYear: 2025, locations: ['심천', '북경'], receivedAt: '2026.01.15',
    volumes: [
      { key: 'OUT', count: 66689, from: '2025.01', to: '2025.12', months: 12 },
      { key: 'IN', count: 3912, from: '2025.04', to: '2025.12', months: 9, note: '입원 시스템 2025.04 개통' },
      { key: 'CHK', count: 12102, from: '2025.01', to: '2025.12', months: 12 },
    ],
    revenueItems: [
      { key: 'sub', name: '구독 (Medical·Wellness)', segment: 'Medical', type: 'SUBSCRIPTION', base: 'CHK', enabled: true, fields: [
        { key: 'convMed', label: 'Medical 전환율', unit: '%', min: 0, max: 60, step: 1, ramp: 80 },
        { key: 'convWell', label: 'Wellness 전환율', unit: '%', min: 0, max: 30, step: 1, ramp: 10 },
        { key: 'appRate', label: '앱 접점률', unit: '%', min: 50, max: 100, step: 1, ramp: 100 },
        { key: 'feeMed', label: 'Medical 구독료', unit: '/년', number: true, money: true },
        { key: 'feeWell', label: 'Wellness 구독료', unit: '/년', number: true, money: true },
      ] },
      { key: 'ref', name: '외래연계 수수료', segment: 'Medical', type: 'REFERRAL_FEE', base: 'OUT', enabled: true, fields: [
        { key: 'refRate', label: '외래연계율', unit: '%', min: 0, max: 80, step: 1, ramp: 80 },
        { key: 'visits', label: '연간 방문횟수', unit: '회', min: 1, max: 8, step: 1, warn: '만성질환 평균 방문 가정 — 실적 대조 전', actual: 3.6 },
        { key: 'visitCost', label: '방문당 진료비', unit: '', number: true, money: true, warn: 'VISTA 제공 평균 진료비 미확인 — 2024 샘플 기준', actual: 262 },
        { key: 'svcFee', label: 'Service Fee 요율', unit: '%', min: 10, max: 40, step: 1, note: '미서명' },
      ] },
      { key: 'fam', name: 'Family 구독', segment: 'Medical', type: 'SUBSCRIPTION', base: 'SUBS', enabled: true, fields: [
        { key: 'famSize', label: '구독자당 가족 수', unit: '명', min: 0, max: 3, step: 0.1, note: '중국통계국' },
      ] },
      { key: 'corpRev', name: '기업병원', segment: 'Medical', type: 'SUBSCRIPTION', base: 'CORP', enabled: true, toggle: 'corp', fields: [
        { key: 'corpPen', label: '기업병원 침투 배율', unit: '×', min: 0.2, max: 2, step: 0.1 },
      ] },
      { key: 'commRev', name: '커머스 (P1·P2)', segment: 'Commerce', type: 'PER_CASE', base: 'SUBS', enabled: true, fields: [
        { key: 'p1', label: 'P1 Invites Pharma', toggle: true },
        { key: 'p2', label: 'P2 K-Commerce', toggle: true },
        { key: 'coachFee', label: 'JITAI 코칭료', unit: '/월', min: 0, max: 30, step: 1, money: true, whenAny: ['p1', 'p2'] },
      ] },
    ],
    defaults: { convMed: 13, convWell: 4, refRate: 12, appRate: 95, feeMed: 120, feeWell: 80, visitCost: 250, visits: 4, svcFee: 25, famSize: 1.62, opexRate: 22, mktgRate: 38, bizdevK: 550, omRate: 5, reservoir: true, churn0: 25, rpmAdopt: 35, rpmDelta: 35, corp: true, corpPen: 0.4, p1: false, p2: false, coachFee: 8, hcAttr: false },
    reservoir: true,
    presets: [
      { key: 'kpmg', name: 'KPMG정합', band: 'LOW', desc: 'KPMG Base(EV $15.8M)에 맞춘 보수 가정', set: { convMed: 13, convWell: 4, refRate: 12, svcFee: 25, opexRate: 22, mktgRate: 38, corpPen: 0.4, bizdevK: 550, omRate: 5, p1: false, p2: false }, updatedBy: '홍길동', updatedAt: '2026.10.02' },
      { key: 'base', name: 'BP기준', band: null, desc: 'BP 원안 — 마케팅비를 낮게 잡은 낙관 가정', set: { convMed: 20, convWell: 5, refRate: 20, svcFee: 25, opexRate: 20, mktgRate: 20, corpPen: 1.0, bizdevK: 519, omRate: 5, p1: false, p2: false }, updatedBy: '홍길동', updatedAt: '2026.10.02' },
      { key: 'aggr', name: '공격', band: 'HIGH', desc: '전환·침투를 높이고 커머스(P1·P2)를 켠 상단 가정', set: { convMed: 28, convWell: 7, refRate: 28, svcFee: 25, opexRate: 18, mktgRate: 15, corpPen: 1.4, bizdevK: 350, omRate: 3, p1: true, p2: true }, updatedBy: '홍길동', updatedAt: '2026.10.02' },
      { key: 'reg', name: '규제강화', band: null, desc: '처방 커머스 불가, 확산 둔화', set: { convMed: 13, convWell: 4, refRate: 12, svcFee: 25, opexRate: 22, mktgRate: 40, corpPen: 0.3, bizdevK: 550, omRate: 5, p1: false, p2: true }, updatedBy: '김분석', updatedAt: '2026.10.11' },
      { key: 'feecut', name: '요율인하', band: null, desc: 'Service Fee 요율 25% → 15% 요구 반영', set: { convMed: 13, convWell: 4, refRate: 12, svcFee: 15, opexRate: 22, mktgRate: 38, corpPen: 0.4, bizdevK: 550, omRate: 5, p1: false, p2: false }, updatedBy: '김분석', updatedAt: '2026.10.14' },
    ],
    profile: { laborUnitCost: 46800, laborInflation: 5, laborInflationBasis: '심천·북경 최저임금 인상률 평균', staff: [3, 4, 9, 10, 12], royaltyRate: 8, taxRate: 15, taxLossYears: 5, depreciation: [210000, 210000, 330000, 330000, 330000], capex: [210000, 210000, 330000, 330000, 330000], wacc: 20, growth: 3, nwcRate: 0, version: 4, updatedAt: '2026.10.20 15:02', updatedBy: '홍길동' },
    allocation: { labor: 'REVENUE_SHARE', opex: 'SEGMENT_REVENUE', mktg: 'MEDICAL_ONLY', bizdev: 'REVENUE_SHARE', royalty: 'SEGMENT_REVENUE', om: 'SEGMENT_REVENUE', capexAttr: 'REVENUE_SHARE', dep: 'REVENUE_SHARE' },
    params: [
      { key: 'OUT', chronic: 10, risk: null, referral: 1.0, growth: 3 },
      { key: 'IN', chronic: 18, risk: null, referral: 0.6, growth: 2 },
      { key: 'CHK', chronic: null, risk: 46.2, referral: 1.0, growth: 3 },
    ],
    assumptions: [
      { label: '방문당 진료비', value: '250', unit: '$', basis: '2024 샘플 기준 — VISTA 평균 진료비 미확인', verified: false, validFrom: '2026.01.01', scope: '병원' },
      { label: '연간 방문횟수', value: '4', unit: '회', basis: '만성질환 평균 방문 가정 — 실적 대조 전', verified: false, validFrom: '2026.01.01', scope: '병원' },
      { label: 'RPM 이탈감소 효과 δ', value: '35', unit: '%', basis: '국내 RPM 연구 인용값', verified: false, validFrom: '2026.01.01', scope: '시스템' },
      { label: '구독자당 가족 수', value: '1.62', unit: '명', basis: '중국통계국 2023 평균 가구원 수 기준', verified: true, validFrom: '2026.01.01', scope: '병원' },
      { label: 'Service Fee 요율', value: '25', unit: '%', basis: '계약 협상안 (미서명)', verified: false, validFrom: '2026.01.01', scope: '병원' },
    ],
  },
];

const SCENARIO_SEED = {
  vista: [
    { id: 's1', name: 'VISTA 투자자 제시안', desc: '투자자 미팅용 보수 시나리오', preset: 'kpmg', version: 3, updatedAt: '2026-10-24 14:30' },
    { id: 's2', name: 'BP 원안', desc: '', preset: 'base', version: 2, updatedAt: '2026-10-21 09:12' },
    { id: 's3', name: '상단 시나리오', desc: '', preset: 'aggr', version: 1, updatedAt: '2026-10-20 17:45' },
    { id: 's4', name: '규제 대응', desc: '', preset: 'reg', version: 1, updatedAt: '2026-10-18 11:03' },
    { id: 's5', name: '요율 15% 협상안', desc: '', preset: 'feecut', version: 4, updatedAt: '2026-10-16 16:20' },
  ],
};

/* ---------- 시안 저장 — 병원 기초정보에서 바꾼 프리셋·매출 항목을 시뮬레이터가 읽게 한다 ---------- */
const STORE_KEY = 'ebitda-mockup';
function readStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; } }
function writeStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* 저장소를 쓸 수 없으면 화면 안에서만 유지 */ } }
function resetStore() { try { localStorage.removeItem(STORE_KEY); } catch { /* 무시 */ } }
function loadHospitals() {
  const s = readStore();
  return HOSPITAL_SEED.map(h => {
    const c = structuredClone(h);
    if (s[h.id]?.presets) c.presets = s[h.id].presets;
    if (s[h.id]?.revenueItems) c.revenueItems = s[h.id].revenueItems;
    return c;
  });
}
function saveHospital(h) {
  const s = readStore();
  s[h.id] = { presets: h.presets, revenueItems: h.revenueItems };
  writeStore(s);
}

/* ---------- 결과 데이터 ---------- */
function finishYear(y) {
  y.revTotal = Object.values(y.rev).reduce((a, b) => a + b, 0);
  y.costTotal = Object.values(y.cost).reduce((a, b) => a + b, 0);
  if (y.ebitda == null) y.ebitda = y.revTotal - y.costTotal;
  y.capex = y.dep;
  y.fcf = y.nopat;
  return y;
}

function vistaYears(key) {
  return GOLDEN[key].map(row => {
    const g = Object.fromEntries(GOLDEN_KEYS.map((k, i) => [k, row[i]]));
    // EBITDA·EBIT·세후이익은 기준값을 그대로 쓴다 — 항목 합계와 반올림 차이(1~2달러)가 날 수 있다
    return finishYear({
      rev: { sub: g.sub, ref: g.ref, fam: g.fam, corpRev: g.corpRev, commRev: g.commRev },
      cost: { labor: g.labor, opex: g.opex, mktg: g.mktg, bizdev: g.bizdev, royalty: g.royalty, om: g.om },
      ebitda: g.totEbitda, dep: g.dep, ebit: g.ebit, tax: g.tax, nopat: g.nopat,
      subscribers: g.subscribers, medActive: g.medActive,
    });
  });
}

function yearsFor(h, presetKey) {
  const p = h.presets.find(x => x.key === presetKey) || h.presets[0];
  const base = p ? (p.basedOn || p.key) : null;
  return vistaYears(GOLDEN[base] ? base : 'kpmg');
}

function valuation(years, wacc, growth) {
  const w = wacc / 100, g = growth / 100;
  if (w <= g) return null;
  const pv = years.reduce((s, y, i) => s + y.fcf / Math.pow(1 + w, i + 1), 0);
  const tv = years[years.length - 1].fcf * (1 + g) / (w - g) / Math.pow(1 + w, years.length);
  return { pv, tv, ev: pv + tv };
}

const annualized = v => Math.round(v.count * 12 / v.months);
const periodText = v => `${v.from} ~ ${v.to}`;

/* ---------- 형식 ---------- */
let CUR = { code: 'USD', sym: '$', unit: 'USD' };
function useCurrency(h) {
  CUR = h.report === 'KRW' ? { code: 'KRW', sym: '₩', unit: '백만원' } : { code: 'USD', sym: '$', unit: 'USD' };
}
const F = {
  money: v => (v < 0 ? '-' : '') + CUR.sym + Math.abs(Math.round(v)).toLocaleString('en-US'),
  table: v => CUR.code === 'KRW' ? Math.round(v / 1e6).toLocaleString('en-US') : F.money(v),
  short: v => {
    const a = Math.abs(v), s = v < 0 ? '-' : '';
    if (CUR.code === 'KRW') return a >= 1e8 ? `${s}${(a / 1e8).toFixed(1)}억` : a >= 1e6 ? `${s}${Math.round(a / 1e6)}백만` : `${s}${Math.round(a).toLocaleString()}`;
    return a >= 1e6 ? `${s}$${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}$${Math.round(a / 1e3)}K` : `${s}$${Math.round(a)}`;
  },
  pct: (v, d = 1) => (v * 100).toFixed(d) + '%',
  int: v => Math.round(v).toLocaleString('en-US'),
};
const neg = v => (v < 0 ? 'text-destructive' : '');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tone = i => `var(--chart-${(i % 5) + 1})`;
const toneOpacity = i => (i >= 5 ? 0.55 : 1);
const YEARS = [1, 2, 3, 4, 5];

/* ---------- 차트 (recharts 자리 — 색은 --chart-N 토큰만) ---------- */
function niceScale(min, max) {
  const span = max - min || 1, raw = span / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step, step];
}

/* bars: 막대 시리즈(mode 'stack' | 'group'), lines: 선 시리즈. 연도 영역을 누르면 data-year로 연도를 고른다 */
function chart({ bars = [], lines = [], mode = 'stack', selected = null, height = 260, baseYear = 2025, fmt = F.short }) {
  const n = 5, W = 680, H = height, P = { l: 64, r: 16, t: 16, b: 40 };
  const vals = [0];
  for (let i = 0; i < n; i++) {
    if (mode === 'stack') {
      let p = 0, q = 0;
      bars.forEach(b => { const v = b.values[i] || 0; if (v >= 0) p += v; else q += v; });
      vals.push(p, q);
    } else bars.forEach(b => vals.push(b.values[i] || 0));
    lines.forEach(l => vals.push(l.values[i]));
  }
  const [min, max, step] = niceScale(Math.min(...vals), Math.max(...vals));
  const ih = H - P.t - P.b, y = v => P.t + (max - v) / (max - min) * ih;
  const bw = (W - P.l - P.r) / n, cx = i => P.l + bw * i + bw / 2;
  let grid = '';
  for (let v = min; v <= max + step / 2; v += step) {
    grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" ${Math.abs(v) < step / 2 ? 'stroke="var(--muted-foreground)" stroke-opacity=".5"' : 'stroke="var(--border)" stroke-dasharray="3 3"'}/>
      <text x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted-foreground)">${fmt(Math.abs(v) < step / 2 ? 0 : v)}</text>`;
  }
  let body = '';
  for (let i = 0; i < n; i++) {
    if (selected === i + 1) body += `<rect x="${P.l + bw * i + 2}" y="${P.t}" width="${bw - 4}" height="${ih}" rx="8" fill="var(--accent)" opacity=".7"/>`;
    if (mode === 'stack') {
      const w = Math.min(bw * 0.46, 56); let p = 0, q = 0;
      bars.forEach((b, k) => {
        const v = b.values[i] || 0; if (!v) return;
        const from = v >= 0 ? p : q, to = from + v;
        if (v >= 0) p = to; else q = to;
        body += `<rect x="${cx(i) - w / 2}" y="${y(Math.max(from, to))}" width="${w}" height="${Math.max(Math.abs(y(from) - y(to)), 1)}" fill="${b.color || tone(k)}" fill-opacity="${b.opacity ?? 1}"/>`;
      });
    } else {
      const total = Math.min(bw * 0.7, 96), w = total / bars.length;
      bars.forEach((b, k) => {
        const v = b.values[i] || 0, x = cx(i) - total / 2 + w * k + 1;
        body += `<rect x="${x}" y="${y(Math.max(v, 0))}" width="${w - 2}" height="${Math.max(Math.abs(y(v) - y(0)), 1)}" rx="3" fill="${b.color || tone(k)}" fill-opacity="${b.opacity ?? 1}"/>`;
      });
    }
    body += `<text x="${cx(i)}" y="${H - 22}" text-anchor="middle" font-size="12" fill="${selected === i + 1 ? 'var(--foreground)' : 'var(--muted-foreground)'}" font-weight="${selected === i + 1 ? 600 : 400}">Y${i + 1}</text>
      <text x="${cx(i)}" y="${H - 7}" text-anchor="middle" font-size="10" fill="var(--muted-foreground)">${baseYear + i + 1}</text>`;
  }
  lines.forEach((l, k) => {
    body += `<polyline points="${l.values.map((v, i) => `${cx(i)},${y(v)}`).join(' ')}" fill="none" stroke="${l.color || tone(k)}" stroke-width="2.5" stroke-linejoin="round" ${l.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    body += l.values.map((v, i) => `<circle cx="${cx(i)}" cy="${y(v)}" r="3.5" fill="var(--card)" stroke="${l.color || tone(k)}" stroke-width="2"/>`).join('');
    if (l.labels) body += l.values.map((v, i) => `<text x="${cx(i)}" y="${y(v) - 9}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--foreground)" stroke="var(--card)" stroke-width="3" paint-order="stroke">${fmt(v)}</text>`).join('');
  });
  const hit = YEARS.map((n1, i) => {
    const tip = [...bars, ...lines].map(s => `${s.name} ${fmt(s.values[i] || 0)}`).join('\n');
    return `<rect data-year="${n1}" class="cursor-pointer" x="${P.l + bw * i}" y="0" width="${bw}" height="${H}" fill="transparent"><title>Y${n1} (${baseYear + n1})\n${tip}</title></rect>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="h-auto w-full select-none" role="img">${grid}${body}${hit}</svg>`;
}

function legend(items) {
  return `<div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">${items.map(it => `<span class="flex items-center gap-1.5">${it.line
    ? `<span class="h-0.5 w-3.5 rounded" style="background:${it.color}"></span>`
    : `<span class="size-2.5 rounded-sm" style="background:${it.color};opacity:${it.opacity ?? 1}"></span>`}${esc(it.name)}</span>`).join('')}</div>`;
}

function spark(values, color = 'var(--chart-1)', w = 96, h = 28) {
  const min = Math.min(...values, 0), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * (w - 4) + 2},${h - 3 - (v - min) / span * (h - 6)}`).join(' ');
  const zero = h - 3 - (0 - min) / span * (h - 6);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><line x1="0" x2="${w}" y1="${zero}" y2="${zero}" stroke="var(--border)"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

function sparkBars(values, slots = 12, w = 120, h = 28) {
  const max = Math.max(...values, 1), bw = w / slots;
  const offset = slots - values.length;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${Array.from({ length: slots }, (_, i) => {
    const v = values[i - offset];
    if (v == null) return `<rect x="${i * bw + 1}" y="${h - 2}" width="${bw - 2}" height="2" rx="1" fill="var(--border)"/>`;
    const bh = Math.max(v / max * (h - 2), 2);
    return `<rect x="${i * bw + 1}" y="${h - bh}" width="${bw - 2}" height="${bh}" rx="1.5" fill="var(--chart-1)"/>`;
  }).join('')}</svg>`;
}

/* 차트 아래 연도별 데이터 표 — rows: { label, values, kind: 'total'|'key'|'pct'|'sub', swatch, badge, fmt } */
function yearTable({ rows, selected, baseYear = 2025, change = true }) {
  const changeCell = r => {
    const a = r.values[0], b = r.values[4];
    if (r.kind === 'pct') return `${b - a >= 0 ? '+' : ''}${((b - a) * 100).toFixed(1)}%p`;
    if (a > 0 && b > 0) return `연 ${(Math.pow(b / a, 1 / 4) - 1) * 100 >= 0 ? '+' : ''}${((Math.pow(b / a, 1 / 4) - 1) * 100).toFixed(0)}%`;
    if (a === 0 && b === 0) return '-';
    return `${b - a >= 0 ? '+' : ''}${F.short(b - a)}`;
  };
  const head = `<tr class="border-b"><th class="th sticky start-0 bg-card">항목</th>${YEARS.map(n => `<th class="th num"><button type="button" data-year="${n}" class="inline-flex flex-col items-end leading-tight ${selected === n ? 'text-foreground' : ''}"><span>Y${n}</span><span class="text-[10px] font-normal">${baseYear + n}</span></button></th>`).join('')}${change ? '<th class="th num">Y1 → Y5</th>' : ''}</tr>`;
  const body = rows.map(r => {
    if (r.kind === 'header') return `<tr class="bg-muted/50"><td class="td text-xs font-semibold text-muted-foreground" colspan="${change ? 7 : 6}">${r.label}</td></tr>`;
    const fmt = r.fmt || (r.kind === 'pct' ? v => F.pct(v) : F.table);
    const cls = r.kind === 'total' ? 'font-semibold' : r.kind === 'key' ? 'font-bold bg-muted/30' : '';
    const label = `${r.swatch ? `<span class="size-2.5 shrink-0 rounded-sm" style="background:${r.swatch};opacity:${r.opacity ?? 1}"></span>` : ''}<span class="truncate">${r.label}</span>${r.badge || ''}`;
    return `<tr class="border-b last:border-0 ${cls}">
      <td class="td sticky start-0 bg-card ${r.kind === 'sub' ? 'ps-5 text-muted-foreground' : ''}"><span class="flex max-w-[220px] items-center gap-2">${label}</span></td>
      ${r.values.map((v, i) => `<td class="td num ${neg(v)} ${selected === i + 1 ? 'bg-accent/60' : ''}">${v == null ? '-' : fmt(v)}</td>`).join('')}
      ${change ? `<td class="td num text-xs text-muted-foreground">${changeCell(r)}</td>` : ''}
    </tr>`;
  }).join('');
  return `<div class="overflow-x-auto"><table class="w-full min-w-[620px] text-sm"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

/* ---------- 셸: 사이드바·헤더·페이지 제목 (features/shell) ---------- */
function mountShell({ active, title, footer }) {
  const nav = [
    { key: 'simulator', label: '시뮬레이터', icon: 'calculator', href: 'simulator.html' },
    { key: 'hospital', label: '병원 기초정보', icon: 'hospital', href: 'hospital.html' },
    { key: 'guide', label: '사용 가이드', icon: 'book-open', href: 'guide.html' },
  ];
  document.body.innerHTML = `
  <div class="min-h-screen bg-background">
    <aside class="fixed start-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-e border-sidebar-border bg-sidebar lg:flex">
      <div class="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-white"><i data-lucide="sparkles" class="size-4"></i></div>
        <span class="truncate text-sm font-bold tracking-tight text-sidebar-foreground">VISTA invitesLoop</span>
      </div>
      <nav aria-label="주 메뉴" class="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <div>
          <div class="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/70"><span class="flex-1">EBITDA 시뮬레이터</span><i data-lucide="chevron-down" class="size-3"></i></div>
          <div class="mt-1 space-y-0.5">${nav.map(n => n.key === active
            ? `<a href="${n.href}" aria-current="page" class="relative flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"><i data-lucide="${n.icon}" class="size-[18px] shrink-0 text-sidebar-primary"></i><span class="flex-1">${n.label}</span></a>`
            : `<a href="${n.href}" class="relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"><i data-lucide="${n.icon}" class="size-[18px] shrink-0 text-sidebar-foreground/50"></i><span class="flex-1">${n.label}</span></a>`).join('')}
          </div>
        </div>
      </nav>
    </aside>
    <div class="flex min-h-screen flex-col lg:ms-[260px]">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <button type="button" aria-label="메뉴 열기" class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"><i data-lucide="menu" class="size-5"></i></button>
          <span class="truncate text-sm font-semibold">VISTA 헬스케어</span>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" id="themeToggle" aria-label="다크 모드 전환" class="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <i data-lucide="moon" class="size-[18px] dark:hidden"></i><i data-lucide="sun" class="hidden size-[18px] dark:block"></i>
          </button>
          <button type="button" class="flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-end hover:bg-accent">
            <div class="whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5 text-sm font-bold">홍길동 <i data-lucide="chevron-down" class="size-4 text-muted-foreground"></i></div>
              <div class="text-xs text-muted-foreground">고객 관리자</div>
            </div>
          </button>
        </div>
      </header>
      <main id="main-content" class="min-w-0 flex-1 p-4 sm:p-6">
        <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-3"><h1 class="text-2xl font-bold tracking-tight">${title}</h1>${active === 'guide' ? '' : `<a href="guide.html#${active}" class="btn btn-outline btn-sm"><i data-lucide="book-open"></i>사용 가이드</a>`}</div>
          <nav aria-label="breadcrumb" class="flex items-center gap-1.5 text-sm text-muted-foreground"><span>EBITDA 시뮬레이터</span><i data-lucide="chevron-right" class="size-3.5"></i><span class="text-foreground">${title}</span></nav>
        </div>
        <div id="page" class="space-y-6"></div>
      </main>
      <footer class="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground">
        <span>${footer}</span>
        <button type="button" id="resetMockup" class="underline-offset-4 hover:underline">시안 데이터 초기화</button>
      </footer>
    </div>
  </div>`;
  initTooltip();
  document.getElementById('themeToggle').addEventListener('click', () => document.documentElement.classList.toggle('dark'));
  document.getElementById('resetMockup').addEventListener('click', () => { resetStore(); location.reload(); });
  return document.getElementById('page');
}

/* ---------- 모달 (features/common/components/Modal) ---------- */
function openModal({ title, desc = '', body, footer, size = 'max-w-lg', onMount }) {
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  wrap.innerHTML = `<div role="dialog" aria-modal="true" aria-label="${esc(title)}" class="flex max-h-[90vh] w-full ${size} flex-col rounded-xl border bg-card text-card-foreground shadow-lg">
    <div class="flex items-start justify-between gap-4 p-6 pb-4"><div class="space-y-1.5"><h2 class="text-lg leading-none font-semibold">${title}</h2>${desc ? `<p class="text-sm text-muted-foreground">${desc}</p>` : ''}</div>
      <button type="button" data-close class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="닫기"><i data-lucide="x" class="size-4"></i></button></div>
    <div class="min-h-0 flex-1 overflow-y-auto px-6 pb-2">${body}</div>
    <div class="flex justify-end gap-2 p-6 pt-4">${footer}</div></div>`;
  const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(wrap);
  lucide.createIcons();
  wrap.querySelector('input,textarea,select')?.focus();
  onMount?.(wrap, close);
  return { el: wrap, close };
}

function confirmModal(message, onOk, { okLabel = '확인', destructive = false, title = '확인' } = {}) {
  openModal({
    title, size: 'max-w-md',
    body: `<p class="text-sm">${message}</p>`,
    footer: `<button type="button" class="btn btn-outline" data-close>취소</button><button type="button" class="btn ${destructive ? 'btn-destructive' : 'btn-default'}" data-ok>${okLabel}</button>`,
    onMount: (el, close) => el.querySelector('[data-ok]').addEventListener('click', () => { close(); onOk(); }),
  });
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'fixed bottom-6 end-6 z-[60] flex items-center gap-2 rounded-lg border bg-popover px-4 py-3 text-sm shadow-lg';
  el.innerHTML = `<i data-lucide="circle-check" class="size-4 text-success"></i>${msg}`;
  document.body.append(el); lucide.createIcons(); setTimeout(() => el.remove(), 2200);
}

const switchHtml = (on, attrs = '') => `<button type="button" role="switch" aria-checked="${!!on}" class="switch" data-state="${on ? 'checked' : 'unchecked'}" ${attrs}><span></span></button>`;
const bandBadge = band => band ? `<span class="badge badge-secondary">${BAND_LABEL[band]}</span>` : '';
const segBadge = seg => `<span class="badge ${seg === 'Commerce' ? 'badge-outline' : 'badge-secondary'}">${seg}</span>`;

/* ---------- 도움말: 툴팁 문구와 사용 가이드 용어집이 같은 문장을 쓴다 ---------- */
const FIELD_HELP = {
  convMed: '건강검진 위험군 중 앱에 접속한 사람이 Medical 구독으로 넘어오는 비율입니다. Y1 값에서 Y5 목표까지 매년 같은 폭으로 오릅니다.',
  convWell: '건강검진 정상군 중 앱에 접속한 사람이 Wellness 구독으로 넘어오는 비율입니다.',
  appRate: '건강검진 수검자 중 앱을 설치·접속하는 비율입니다. 전환율은 이 인원을 기준으로 계산합니다.',
  feeMed: 'Medical 구독자 1명이 1년에 내는 구독료입니다.',
  feeWell: 'Wellness 구독자 1명이 1년에 내는 구독료입니다.',
  refRate: '외래 환자 중 연계 진료로 이어지는 비율입니다.',
  visits: '연계 환자 1명이 1년에 방문하는 횟수입니다. "실적값 사용"을 켜면 병원 실적 평균으로 바꿉니다.',
  visitCost: '연계 환자의 1회 방문당 평균 진료비입니다. 수수료는 이 금액에 요율을 곱해 계산합니다.',
  svcFee: '연계 진료비 중 수수료로 받는 비율입니다. 계약 서명 전이라 협상안 값입니다.',
  famSize: '구독자 1명당 함께 가입하는 가족 수입니다. Family 구독 매출 = 활성 구독자 × 가족 수 × 구독료.',
  corp: '기업병원 매출을 계산에 넣을지 정합니다. 끄면 기업병원 매출이 0이 됩니다.',
  corpPen: '기업병원 기본 침투율 곡선에 곱하는 배율입니다. 1.0이면 기본 곡선 그대로입니다.',
  p1: '처방 연계 의약품 커머스(Invites Pharma)를 켭니다. 커머스 매출은 Y2부터 생깁니다.',
  p2: '한국 화장품·건강식품 커머스(K-Commerce)를 켭니다. 커머스 매출은 Y2부터 생깁니다.',
  coachFee: 'JITAI 맞춤 코칭을 쓰는 구독자의 월 이용료입니다.',
  opexRate: '매출 대비 운영비 비율입니다.',
  mktgRate: '매출 대비 마케팅·고객획득비용(CAC)·간접비 비율입니다. Y1은 이 값의 50%에서 시작합니다.',
  bizdevK: '사업 초기(Y1~Y2)에만 드는 사업개발비입니다. 단위는 천 달러입니다.',
  omRate: '매출 대비 시스템 유지보수비 비율입니다.',
  reservoir: '구독자를 해마다 누적하고 이탈률만큼 빼는 계산입니다. 끄면 그해 신규 전환자만 매출에 반영합니다.',
  churn0: 'RPM을 쓰지 않는 구독자가 1년 안에 해지하는 비율입니다.',
  rpmAdopt: '구독자 중 원격 모니터링(RPM) 기기를 쓰는 비율입니다.',
  rpmDelta: 'RPM 사용자의 해지율이 줄어드는 정도입니다. 유효 이탈률 = 기본 이탈률 × (1 − RPM 침투율 × 효과).',
  hcAttr: '켜면 CAPEX를 EBITDA 비용으로 넣어 계산하고, 지표 이름이 "CAPEX 포함 EBITDA"로 바뀝니다.',
  conv: '기반 인원 중 이 항목의 구독으로 넘어오는 비율입니다.',
  fee: '이 항목의 구독료 또는 수수료율입니다.',
  rate: '기반 인원 중 연계로 이어지는 비율입니다.',
  cost: '연계 1회당 평균 진료비입니다.',
  ratio: '기반 인원 중 이 항목을 이용하는 비율입니다.',
  price: '1건당 단가입니다.',
  amount: '연도별 매출 금액을 직접 입력합니다.',
};
const fieldHelp = f => f.help || FIELD_HELP[f.key] || FIELD_HELP[f.key.split('.').pop()] || '';

/* 용어집 — 화면 툴팁과 사용 가이드가 함께 쓴다 */
const GLOSSARY = {
  시나리오: '병원의 5개년 계획 한 벌입니다. 입력값 전체를 이름을 붙여 저장하고, 저장할 때마다 버전이 올라갑니다.',
  프리셋: '시나리오를 만들 때 고르는 시작 값 묶음입니다. 병원 기초정보에서 추가·수정합니다. 프리셋을 바꿔도 이미 만든 시나리오 값은 바뀌지 않습니다.',
  'EBITDA 밴드': '하한(보수) 프리셋과 상한(공격) 프리셋으로 계산한 EBITDA 범위입니다. 현재 시나리오가 범위 안 어디쯤인지 봅니다.',
  매출: '사용 중인 매출 항목을 모두 더한 금액입니다.',
  영업비용: '인건비·운영비·마케팅·사업개발비·로열티·유지보수비의 합입니다. 감가상각은 빠집니다.',
  EBITDA: '매출에서 영업비용을 뺀 이익입니다. 감가상각·이자·세금을 빼기 전 금액이라 사업 자체의 현금 창출력을 봅니다.',
  'EBITDA 마진': 'EBITDA를 매출로 나눈 비율입니다.',
  EBIT: 'EBITDA에서 감가상각을 뺀 영업이익입니다.',
  세후이익: 'EBIT에서 법인세를 뺀 금액입니다. 이월결손금이 있으면 세금이 줄어듭니다.',
  FCF: '잉여현금흐름. 세후이익에 감가상각을 더하고 CAPEX와 운전자본 증가를 뺀 금액입니다. 기업가치 계산의 기초입니다.',
  EV: '기업가치. 5년 FCF의 현재가치와 잔존가치의 현재가치를 더한 값입니다.',
  WACC: '가중평균자본비용. 미래 현금을 현재가치로 바꿀 때 쓰는 할인율입니다. 높을수록 EV가 낮아집니다.',
  영구성장률: 'Y5 이후 FCF가 매년 늘어난다고 보는 비율입니다. WACC보다 작아야 합니다.',
  잔존가치: 'Y5 이후 영원히 이어지는 FCF를 Y5 시점 가치로 모은 값입니다. EV의 70%를 넘으면 가정에 민감하다는 경고가 나옵니다.',
  민감도: 'WACC와 영구성장률을 조금씩 바꿨을 때 EV가 어떻게 달라지는지 보여 주는 표입니다. 가운데 칸이 현재 값입니다.',
  '활성 구독자': '해당 연도 말 기준으로 구독을 유지하고 있는 사람 수입니다.',
  '집계 기간': '병원 시스템이 보낸 실적이 어느 달부터 어느 달까지인지 나타냅니다.',
  연환산: '집계 기간이 12개월보다 짧을 때 실적 인원 × 12 ÷ 개월 수로 1년 치를 추정한 값입니다.',
  '기반 인원': '매출 항목을 계산할 때 출발점이 되는 인원입니다. 외래·입원·건강검진 인원, 활성 구독자, 기업 대상 인원 중 하나입니다.',
  '산출 방식': '매출 항목의 계산 방식입니다. 방식에 따라 시뮬레이터에 나오는 입력 항목이 정해집니다.',
  부문: 'Medical(진료·구독)과 Commerce(커머스)로 매출과 비용을 나눠 봅니다.',
  'Y5 목표': '값이 Y1에서 시작해 Y5에 이 목표에 닿도록 매년 같은 폭으로 바뀝니다. 비워 두면 5년 동안 같은 값을 씁니다.',
  '미검증 가정': '병원 실적이나 계약으로 확인되지 않은 입력입니다. ⚠로 표시하고 가정·가드레일에 모아 보여 줍니다.',
  '실적값 사용': '켜면 가정값 대신 병원 실적으로 계산한 값을 씁니다.',
  '직접 입력': '켜면 병원 실적 대신 직접 입력한 인원으로 계산합니다.',
  '수식 세트': '계산에 쓰는 수식 묶음입니다. 초안으로 저장한 뒤 승인해야 시나리오 계산에 반영됩니다.',
  '비용 배분': 'Medical·Commerce 부문 손익을 볼 때 비용을 어느 부문에 얼마나 나눌지 정하는 기준입니다.',
  이월결손금: '앞선 해의 손실을 이후 이익에서 빼 주는 제도입니다. 공제 연수 동안만 쓸 수 있습니다.',
  CAPEX: '설비·시스템 등 자산에 쓰는 투자 금액입니다.',
  감가상각: '자산 투자 금액을 사용 기간에 나눠 비용으로 잡는 금액입니다.',
  운전자본: '매출채권·재고처럼 영업에 묶이는 돈입니다. 늘어나면 FCF가 줄어듭니다.',
};

/* 도움말 아이콘 — 마우스를 올리거나 포커스하면 툴팁이 뜬다. <summary> 안에서도 쓸 수 있게 button 대신 span을 쓴다 */
const tip = (text, label = '') => text
  ? `<span role="button" tabindex="0" data-tip="${esc(text)}" aria-label="${esc(label ? `${label} 도움말` : '도움말')}" class="inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full align-middle text-muted-foreground/70 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"><i data-lucide="circle-help" class="size-3.5"></i></span>`
  : '';
const term = name => tip(GLOSSARY[name], name);

function initTooltip() {
  const box = document.createElement('div');
  box.id = 'tooltip';
  box.setAttribute('role', 'tooltip');
  box.className = 'pointer-events-none fixed z-[70] hidden max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs leading-relaxed text-background shadow-md';
  document.body.append(box);
  let cur = null;
  const show = el => {
    cur = el; box.textContent = el.dataset.tip; box.classList.remove('hidden');
    const r = el.getBoundingClientRect(), b = box.getBoundingClientRect();
    let top = r.top - b.height - 8; if (top < 8) top = r.bottom + 8;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), window.innerWidth - b.width - 8);
    box.style.top = `${top}px`; box.style.left = `${left}px`;
  };
  const hide = () => { cur = null; box.classList.add('hidden'); };
  document.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (el && el !== cur) show(el); else if (!el && cur) hide(); });
  document.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) show(el); });
  document.addEventListener('focusout', hide);
  document.addEventListener('scroll', hide, true);
  // 터치 화면에서는 눌러서 연다. <summary> 안의 아이콘을 눌러도 접힘이 바뀌지 않게 막는다
  document.addEventListener('click', e => { const el = e.target.closest('[data-tip]'); if (el) { e.preventDefault(); e.stopPropagation(); show(el); } }, true);
}
