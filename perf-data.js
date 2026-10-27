/* 병원정보·성과 설정 시안 데이터 — 데이터 항목, KPI, 기준·목표, 기간별 값(예시값)
 * docs/09-kpi-definition.md, docs/10-hospital-data-interface.md의 시드를 따른다. 값은 VISTA 예시값이다(실적 아님).
 * shared.js의 readStore/writeStore로 병원별 perf 묶음을 저장한다. */

/* 시안의 오늘 — 입력 기한·누락을 늘 같은 결과로 보여 주려고 고정한다 */
const MOCK_TODAY = '2026-10-07';
const LATEST_MONTH = '202609';

/* ---------- 데이터 항목 사전 ---------- */
const DATA_ITEM_SEED = [
  // key, 이름, 단위, 집계, 수집 주기, 수집 방식, 출처, 기준 날짜, 분모, 연동 시작
  ['STAFFED_BEDS', '가동 병상 수', '병상', 'AVG', 'MONTH', 'INTERFACE', 'HIS(병상관리)', '기간 중 매일 가동 병상 평균', null, '202601'],
  ['ADMISSIONS', '입원 건수', '건', 'SUM', 'MONTH', 'INTERFACE', 'HIS', '입원일', null, '202601'],
  ['DISCHARGES', '퇴원 건수', '건', 'SUM', 'MONTH', 'INTERFACE', 'HIS', '퇴원일', null, '202601'],
  ['PATIENT_DAYS', '재원일수 합계', '일', 'SUM', 'MONTH', 'INTERFACE', 'HIS', '재원일', null, '202601'],
  ['INPATIENT_REVENUE', '입원 진료수익', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '원무·회계', '진료일', null, null],
  ['READMIT_30D', '30일 내 비계획 재입원 건수', '건', 'SUM', 'MONTH', 'INTERFACE', 'HIS', '최초 퇴원월', 'DISCHARGES', '202601'],
  ['READMIT_COST', '재입원 진료비', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '원무', '최초 퇴원월', null, null],
  ['REMOTE_ENROLLED', '원격케어 등록 환자', '명', 'END', 'MONTH', 'MANUAL', '원격케어 플랫폼', '월말', null, null],
  ['REMOTE_ACTIVE', '원격케어 활성 환자', '명', 'END', 'MONTH', 'MANUAL', '원격케어 플랫폼', '월말', 'REMOTE_ENROLLED', null],
  ['REMOTE_REVENUE', '원격케어 매출', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '원무·회계', '진료일', null, null],
  ['REMOTE_DIRECT_COST', '원격케어 직접비', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '회계', '발생월', null, null],
  ['CLAIM_AMOUNT', '청구 금액', 'AMOUNT', 'SUM', 'MONTH', 'UPLOAD', '청구(심사)', '청구월', null, null],
  ['CLAIM_DENIED', '삭감 금액', 'AMOUNT', 'SUM', 'MONTH', 'UPLOAD', '청구(심사)', '청구월 (통보월 아님)', 'CLAIM_AMOUNT', null],
  ['CLAIM_RECOVERED', '이의신청 회수 금액', 'AMOUNT', 'SUM', 'MONTH', 'UPLOAD', '청구(심사)', '청구월', 'CLAIM_DENIED', null],
  ['AR_BALANCE', '미수금 잔액', 'AMOUNT', 'END', 'MONTH', 'MANUAL', '회계', '월말', null, null],
  ['AR_OVER90', '90일 초과 미수금', 'AMOUNT', 'END', 'MONTH', 'MANUAL', '회계', '월말', 'AR_BALANCE', null],
  ['BAD_DEBT', '대손 처리액', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '회계', '처리월', null, null],
  ['PATIENT_REVENUE', '진료수익 합계', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '회계', '진료일', null, null],
  ['OUTPATIENT_VISITS', '외래 방문 건수', '건', 'SUM', 'WEEK', 'INTERFACE', 'HIS(접수)', '접수일', null, '2026-W01'],
  ['OUTPATIENT_NEW', '외래 신환 수', '명', 'SUM', 'WEEK', 'INTERFACE', 'HIS', '접수일', 'OUTPATIENT_VISITS', '2026-W01'],
  ['OUTPATIENT_REVENUE', '외래 진료수익', 'AMOUNT', 'SUM', 'MONTH', 'MANUAL', '원무·회계', '진료일', null, null],
].map(([key, name, unit, aggregation, cycle, collectionMethod, sourceSystem, referenceDateNote, denominatorItemKey, interfaceFrom]) => ({
  key, name, unit, aggregation, cycle, collectionMethod, sourceSystem, referenceDateNote, denominatorItemKey,
  interfaceFrom: collectionMethod === 'INTERFACE' ? interfaceFrom : null,
  deadline: cycle === 'WEEK' ? { weekday: 3 } : { dayOfMonth: 10 }, allowNegative: false, seed: true,
}));

/* 템플릿 KPI가 쓰는 데이터 항목 — 템플릿을 추가할 때 함께 생긴다 (D26) */
const TEMPLATE_ITEMS = {
  MSPB: [['EPISODES', 'MSPB 대상 입원 에피소드 수', '건', 'SUM'], ['EPISODE_SPEND', '에피소드 총 지출', 'AMOUNT', 'SUM'], ['MSPB_BENCHMARK', '기준 1건당 지출 (전국 중앙값)', 'AMOUNT', 'AVG']],
  CMS_INCENTIVE: [['CMS_ADJ_HVBP', 'HVBP 인센티브 조정액', 'AMOUNT', 'SUM'], ['CMS_ADJ_HRRP', 'HRRP 페널티 (음수)', 'AMOUNT', 'SUM'], ['CMS_ADJ_HACRP', 'HACRP 페널티 (음수)', 'AMOUNT', 'SUM'], ['CMS_ADJ_OTHER', '기타 프로그램 조정액', 'AMOUNT', 'SUM']],
};

/* ---------- KPI ---------- */
const kpiDef = (o) => ({ unitLabel: null, decimals: 1, lag: 0, cycle: 'MONTH', subMetrics: [], enabled: true, seed: true, ...o });
const KPI_SEED = [
  kpiDef({ key: 'BED_TURNOVER', name: '병상회전율', category: 'REVENUE', unit: 'TIMES_PER_MONTH', decimals: 2, direction: 'UP',
    formula: { kind: 'EXPRESSION', expression: 'DISCHARGES / STAFFED_BEDS / months' },
    ebitda: { method: 'DELTA_X_BASE', scale: 'STAFFED_BEDS * months', unitValue: 'INPATIENT_REVENUE / DISCHARGES', factor: 35, factorBasis: '입원 공헌이익률 35% — 가정, 병원 재무 확인 필요' },
    subMetrics: [{ name: '평균재원일수', expression: 'PATIENT_DAYS / DISCHARGES', unit: 'DAYS', decimals: 1 }, { name: '병상가동률', expression: 'PATIENT_DAYS / (STAFFED_BEDS * days) * 100', unit: '%', decimals: 1 }] }),
  kpiDef({ key: 'READMISSION_30D', name: '30일 재입원율', category: 'COST', unit: '%', direction: 'DOWN', lag: 1,
    formula: { kind: 'RATIO', numerator: 'READMIT_30D', denominator: 'DISCHARGES', multiplier: 100 },
    ebitda: { method: 'NONE' },
    subMetrics: [{ name: '재입원 건당 진료비', expression: 'READMIT_COST / READMIT_30D', unit: 'AMOUNT', decimals: 0 }] }),
  kpiDef({ key: 'REMOTE_CARE', name: '원격케어 순수익', category: 'REVENUE', unit: 'AMOUNT', decimals: 0, direction: 'UP',
    formula: { kind: 'EXPRESSION', expression: '(REMOTE_REVENUE - REMOTE_DIRECT_COST) / months' },
    ebitda: { method: 'AMOUNT_DELTA' },
    subMetrics: [{ name: '활성 환자', expression: 'REMOTE_ACTIVE', unit: 'PEOPLE', decimals: 0 }, { name: '활성 환자당 월 매출', expression: 'REMOTE_REVENUE / REMOTE_ACTIVE / months', unit: 'AMOUNT', decimals: 0 }] }),
  kpiDef({ key: 'CLAIM_DENIAL', name: '청구삭감율', category: 'LOSS', unit: '%', decimals: 2, direction: 'DOWN', lag: 2,
    formula: { kind: 'RATIO', numerator: 'CLAIM_DENIED', denominator: 'CLAIM_AMOUNT', multiplier: 100 },
    ebitda: { method: 'DELTA_X_BASE', scale: 'CLAIM_AMOUNT', unitValue: '1', factor: 100, factorBasis: '삭감 감소분 전액' },
    subMetrics: [{ name: '이의신청 회수율', expression: 'CLAIM_RECOVERED / CLAIM_DENIED * 100', unit: '%', decimals: 1 }] }),
  kpiDef({ key: 'AR_DAYS', name: '미수채권 회수일수', category: 'CASH', unit: 'DAYS', decimals: 1, direction: 'DOWN',
    formula: { kind: 'EXPRESSION', expression: 'AR_BALANCE / (PATIENT_REVENUE / days)' },
    ebitda: { method: 'CUSTOM', expression: '(base_BAD_DEBT / base_PATIENT_REVENUE - BAD_DEBT / PATIENT_REVENUE) * PATIENT_REVENUE', factor: 100, factorBasis: '대손상각비 감소분',
      cashExpression: '(base - current) * PATIENT_REVENUE / days' },
    subMetrics: [{ name: '90일 초과 비율', expression: 'AR_OVER90 / AR_BALANCE * 100', unit: '%', decimals: 1 }, { name: '대손율', expression: 'BAD_DEBT / PATIENT_REVENUE * 100', unit: '%', decimals: 2 }] }),
  kpiDef({ key: 'OUTPATIENT_VISITS', name: '외래 방문 건수', category: 'REVENUE', unit: 'COUNT_PER_MONTH', decimals: 0, direction: 'UP',
    formula: { kind: 'EXPRESSION', expression: 'OUTPATIENT_VISITS / months' },
    ebitda: { method: 'DELTA_X_BASE', scale: 'months', unitValue: 'OUTPATIENT_REVENUE / OUTPATIENT_VISITS', factor: 40, factorBasis: '외래 공헌이익률 40% — 가정, 병원 재무 확인 필요' },
    subMetrics: [{ name: '신환 비율', expression: 'OUTPATIENT_NEW / OUTPATIENT_VISITS * 100', unit: '%', decimals: 1 }] }),
];
const KPI_TEMPLATES = [
  kpiDef({ key: 'MSPB', name: '진료효율 (MSPB 비율)', category: 'COST', unit: 'RATIO', decimals: 2, direction: 'DOWN', cycle: 'QUARTER', lag: 1, seed: false,
    formula: { kind: 'EXPRESSION', expression: 'EPISODE_SPEND / EPISODES / MSPB_BENCHMARK' },
    ebitda: { method: 'DELTA_X_BASE', scale: 'EPISODES', unitValue: 'MSPB_BENCHMARK', factor: 0, factorBasis: '병원 귀속 비율 — 계약 조건 확인 후 입력' }, templateNote: '미국 Medicare 대상 병원용 (D26)' }),
  kpiDef({ key: 'CMS_INCENTIVE', name: 'CMS 인센티브 순조정액', category: 'REVENUE', unit: 'AMOUNT', decimals: 0, direction: 'UP', cycle: 'QUARTER', lag: 1, seed: false,
    formula: { kind: 'EXPRESSION', expression: '(CMS_ADJ_HVBP + CMS_ADJ_HRRP + CMS_ADJ_HACRP + CMS_ADJ_OTHER) / months' },
    ebitda: { method: 'AMOUNT_DELTA' }, templateNote: '미국 Medicare 대상 병원용 (D26)' }),
  kpiDef({ key: 'REVENUE_ITEM', name: '추가 수익 항목', category: 'REVENUE', unit: 'AMOUNT', decimals: 0, direction: 'UP', seed: false,
    formula: { kind: 'EXPRESSION', expression: '({KEY}_REVENUE - {KEY}_DIRECT_COST) / months' },
    ebitda: { method: 'AMOUNT_DELTA' }, templateNote: '건강검진 패키지·비급여 프로그램 같은 추가 수익. 매출·직접비 데이터 항목 한 쌍이 함께 생긴다' }),
];

const TARGET_SEED = {
  BED_TURNOVER: { baselineFrom: '202501', baselineTo: '202503', baselineValue: null, targetValue: 3.4, targetPeriod: '202612', milestones: [{ period: '202512', value: 3.1 }], toleranceRatio: 0.1 },
  READMISSION_30D: { baselineFrom: '202501', baselineTo: '202503', baselineValue: null, targetValue: 10, targetPeriod: '202612', milestones: [], toleranceRatio: 0.1 },
  REMOTE_CARE: { baselineFrom: '202501', baselineTo: '202503', baselineValue: null, targetValue: 380000, targetPeriod: '202612', milestones: [], toleranceRatio: 0.1 },
  CLAIM_DENIAL: { baselineFrom: '202501', baselineTo: '202503', baselineValue: null, targetValue: 1.5, targetPeriod: '202612', milestones: [], toleranceRatio: 0.1 },
  AR_DAYS: { baselineFrom: '202501', baselineTo: '202503', baselineValue: null, targetValue: 55, targetPeriod: '202612', milestones: [], toleranceRatio: 0.1 },
  OUTPATIENT_VISITS: { baselineFrom: '202501', baselineTo: '202512', baselineValue: null, targetValue: 5900, targetPeriod: '202612', milestones: [], toleranceRatio: 0.1 },
};

/* ---------- 기간별 값 (예시) ---------- */
function buildValueSeed() {
  const V = {}, H = {};
  const nz = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
  const months = periodsBetween('MONTH', '202501', LATEST_MONTH);
  const put = (key, cycle, period, value, extra = {}) => {
    const item = DATA_ITEM_SEED.find(i => i.key === key);
    const iface = item.interfaceFrom && (cycle === 'WEEK' ? isoWeekStart(period) >= isoWeekStart(item.interfaceFrom) : period >= item.interfaceFrom);
    V[valueKey(key, cycle, period)] = { value, status: 'FINAL', source: iface ? 'INTERFACE' : item.collectionMethod === 'INTERFACE' ? 'MANUAL' : item.collectionMethod,
      updatedAt: iface ? stampOf(period, cycle, 2) : stampOf(period, cycle, 6), updatedBy: iface ? '연동' : item.collectionMethod === 'UPLOAD' ? '김심사' : '이원무', ...extra };
  };
  // 주 단위 외래 — 춘절 주간은 줄고, 1년에 약 7.5%씩 는다
  const weeks = periodsBetween('WEEK', '2025-W01', '2026-W40');
  const weekly = {};
  weeks.forEach((w, i) => {
    const t = (isoWeekStart(w) - Date.UTC(2025, 0, 1)) / (365 * 864e5);
    const festival = w === '2025-W05' || w === '2026-W08' ? 0.68 : w === '2025-W06' || w === '2026-W07' || w === '2026-W09' ? 0.86 : 1;
    const v = Math.round(1246 * (1 + 0.075 * t) * festival * (1 + 0.03 * nz(i, 1)));
    weekly[w] = v;
    put('OUTPATIENT_VISITS', 'WEEK', w, v);
    put('OUTPATIENT_NEW', 'WEEK', w, Math.round(v * (0.18 + 0.01 * nz(i, 2))));
  });
  months.forEach((m, i) => {
    const g = Math.min(Math.max((i - 2) / 18, 0), 1) ** 0.9;
    const beds = Math.round(260 + 3 * nz(i, 3));
    const turnover = 2.8 + 0.45 * g + 0.04 * nz(i, 4);
    const dis = Math.round(turnover * beds);
    put('STAFFED_BEDS', 'MONTH', m, beds);
    put('DISCHARGES', 'MONTH', m, dis);
    put('ADMISSIONS', 'MONTH', m, Math.round(dis * (1.01 + 0.01 * nz(i, 5))));
    put('PATIENT_DAYS', 'MONTH', m, Math.round(dis * (8.5 - 0.9 * g + 0.1 * nz(i, 6))));
    const inRev = Math.round(dis * 22000 * (1 + 0.01 * nz(i, 7)));
    put('INPATIENT_REVENUE', 'MONTH', m, inRev);
    const readmit = Math.round(dis * (13.5 - 1.9 * g + 0.25 * nz(i, 8)) / 100);
    put('READMIT_30D', 'MONTH', m, readmit);
    put('READMIT_COST', 'MONTH', m, readmit * 18000);
    const active = Math.round(1500 + 1800 * g + 30 * nz(i, 9));
    put('REMOTE_ACTIVE', 'MONTH', m, active);
    put('REMOTE_ENROLLED', 'MONTH', m, Math.round(active * 1.25));
    const rRev = Math.round(active * 166.7 * (1 + 0.02 * nz(i, 10)));
    put('REMOTE_REVENUE', 'MONTH', m, rRev);
    put('REMOTE_DIRECT_COST', 'MONTH', m, Math.round(rRev * (0.4 + 0.01 * nz(i, 11))));
    const outV = Math.round(periodsBetween('WEEK', isoWeekKey(new Date(Date.UTC(+m.slice(0, 4), +m.slice(4) - 1, 1))), isoWeekKey(new Date(Date.UTC(+m.slice(0, 4), +m.slice(4), 0))))
      .reduce((a, w) => a + weekly[w] * (weekMonthDays(w)[m] || 0) / 7, 0));
    const outRev = Math.round(outV * 650 * (1 + 0.01 * nz(i, 12)));
    put('OUTPATIENT_REVENUE', 'MONTH', m, outRev);
    const patRev = inRev + outRev + rRev + Math.round(900000 * (1 + 0.05 * nz(i, 13)));
    put('PATIENT_REVENUE', 'MONTH', m, patRev);
    const claim = Math.round(patRev * 0.7);
    const late = i >= months.length - 2;  // 최근 2개월은 심사 결과 전 — 잠정
    put('CLAIM_AMOUNT', 'MONTH', m, claim);
    put('CLAIM_DENIED', 'MONTH', m, Math.round(claim * (3.0 - 1.3 * g + 0.08 * nz(i, 14)) / 100 * (late ? 0.7 : 1)), late ? { status: 'PROVISIONAL' } : {});
    put('CLAIM_RECOVERED', 'MONTH', m, Math.round(claim * 0.006 * (1 + 0.1 * nz(i, 15))));
    const arDays = 75 - 9 * g + 0.8 * nz(i, 16);
    const bal = Math.round(arDays * patRev / daysInMonth(m));
    put('AR_BALANCE', 'MONTH', m, bal);
    put('AR_OVER90', 'MONTH', m, Math.round(bal * (0.22 - 0.05 * g)));
    put('BAD_DEBT', 'MONTH', m, Math.round(patRev * (1.2 - 0.25 * g + 0.04 * nz(i, 17)) / 100));
  });
  // 누락 — 기한(9/10)이 지난 8월 원격케어 직접비, 기한 임박한 9월 90일 초과 미수금
  delete V[valueKey('REMOTE_DIRECT_COST', 'MONTH', '202608')];
  delete V[valueKey('AR_OVER90', 'MONTH', '202609')];
  // 연동 값 차이 — 연동 전환(2026.01) 전 기간에 병원 시스템이 다시 보낸 값 (D25)
  [['DISCHARGES', '202511', 12], ['DISCHARGES', '202512', -8], ['PATIENT_DAYS', '202512', 40]].forEach(([k, p, d]) => {
    const v = V[valueKey(k, 'MONTH', p)]; v.interfaceValue = v.value + d;
  });
  // 보정 — 접수 시스템 장애 주간
  const ov = V[valueKey('OUTPATIENT_VISITS', 'WEEK', '2026-W12')];
  H[valueKey('OUTPATIENT_VISITS', 'WEEK', '2026-W12')] = [{ value: ov.value - 190, status: 'FINAL', source: 'INTERFACE', updatedAt: '2026-03-23 02:00', updatedBy: '연동' }];
  Object.assign(ov, { interfaceValue: ov.value - 190, source: 'OVERRIDE', overrideReason: '접수 시스템 장애로 3/18 하루 누락 — 원무과 수기 집계로 보정', updatedAt: '2026-03-24 10:12', updatedBy: '홍길동' });
  H[valueKey('DISCHARGES', 'MONTH', '202511')] = [{ value: V[valueKey('DISCHARGES', 'MONTH', '202511')].value - 4, status: 'FINAL', source: 'MANUAL', updatedAt: '2025-12-04 09:10', updatedBy: '이원무' }];
  return { values: V, history: H };
}
/* 입력 시각 예시 — 기간 끝 다음 날짜 */
function stampOf(period, cycle, day) {
  if (cycle === 'WEEK') { const d = new Date(isoWeekStart(period).getTime() + (7 + day % 3) * 864e5); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} 0${day % 3 + 2}:00`; }
  const n = mIndex(period) + 1, k = mKey(n);
  return `${k.slice(0, 4)}-${k.slice(4)}-${String(day).padStart(2, '0')} ${day < 5 ? '02:00' : '17:40'}`;
}

/* ---------- 저장 ---------- */
function perfSeed() {
  const { values, history } = buildValueSeed();
  const targets = Object.fromEntries(Object.entries(TARGET_SEED).map(([k, t]) => [k, { ...t, updatedAt: '2025-04-10 14:20', updatedBy: '홍길동' }]));
  return {
    items: structuredClone(DATA_ITEM_SEED), kpis: structuredClone(KPI_SEED), targets, values, history,
    kpiHistory: { BED_TURNOVER: [{ changedAt: '2025-06-02 11:05', changedBy: '홍길동', changes: [{ field: '입원 공헌이익률', before: '30%', after: '35%' }] }] },
    targetHistory: { BED_TURNOVER: [{ ...TARGET_SEED.BED_TURNOVER, milestones: [], updatedAt: '2025-04-10 14:20', updatedBy: '홍길동' }] },
    version: 1,
  };
}
function loadPerf(hid) {
  const s = readStore();
  return s[hid]?.perf ? s[hid].perf : perfSeed();
}
function savePerf(hid, perf) {
  const s = readStore();
  s[hid] = { ...s[hid], perf };
  writeStore(s);
}

/* ---------- 표시 ---------- */
const KPI_CATEGORY = { REVENUE: '수익 증대', COST: '비용 절감', LOSS: '손실 방지', CASH: '현금흐름' };
const KPI_STATUS = {
  ACHIEVED: { label: '달성', cls: 'badge-default' }, ON_TRACK: { label: '경로상', cls: 'badge-secondary' }, BEHIND: { label: '지연', cls: 'badge-destructive' },
  NO_DATA: { label: '데이터 없음', cls: 'badge-outline' }, NO_TARGET: { label: '목표 없음', cls: 'badge-outline' },
};
const KPI_UNIT = { '%': { label: '%', decimals: 1 }, TIMES_PER_MONTH: { label: '회/월', decimals: 2 }, DAYS: { label: '일', decimals: 1 }, COUNT_PER_MONTH: { label: '건/월', decimals: 0 },
  COUNT: { label: '건', decimals: 0 }, PEOPLE: { label: '명', decimals: 0 }, RATIO: { label: '배', decimals: 2 }, AMOUNT: { label: '금액', decimals: 0 }, CUSTOM: { label: '직접 입력', decimals: 1 } };
const EBITDA_METHOD = { DELTA_X_BASE: '변화량 × 규모 × 단가', AMOUNT_DELTA: '금액 변화', CUSTOM: '직접 계산식', NONE: '환산하지 않음 (모니터링)' };
const AGGREGATION = { SUM: '합계', END: '기말 값', AVG: '평균' };
const COLLECTION = { INTERFACE: { label: '연동', icon: 'plug' }, UPLOAD: { label: '파일 업로드', icon: 'file-up' }, MANUAL: { label: '수기 입력', icon: 'pencil' } };
const CYCLE_LABEL = { WEEK: '주', MONTH: '월', QUARTER: '분기', YEAR: '연' };

/* KPI 값 표시 — 금액은 보고 통화로 바꿔 보인다 */
function fmtKpi(kpi, v, fx = 1) {
  if (v == null) return '-';
  if (kpi.unit === 'AMOUNT') return F.short(v / fx);
  const u = KPI_UNIT[kpi.unit] || KPI_UNIT.CUSTOM, d = kpi.decimals ?? u.decimals;
  const n = v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  return kpi.unit === '%' ? n + '%' : `${n}${kpi.unit === 'CUSTOM' ? (kpi.unitLabel ? ' ' + kpi.unitLabel : '') : ' ' + u.label}`;
}
function fmtUnitValue(unit, decimals, v, fx = 1) {
  if (v == null) return '-';
  if (unit === 'AMOUNT') return F.money(v / fx);
  const u = KPI_UNIT[unit] || { label: unit, decimals: 1 };
  return v.toLocaleString('en-US', { minimumFractionDigits: decimals ?? u.decimals, maximumFractionDigits: decimals ?? u.decimals }) + (unit === '%' ? '%' : ' ' + u.label);
}

/* ---------- 입력 기한·누락 ---------- */
/* 기간의 입력 기한 — 주는 다음 주 요일, 월은 다음 달 일 */
function deadlineOf(item, cycle, period) {
  if (cycle === 'WEEK') { const d = new Date(isoWeekStart(period).getTime() + (7 + (item.deadline?.weekday ?? 3) - 1) * 864e5); return d.toISOString().slice(0, 10); }
  const last = monthsOf(cycle, period).slice(-1)[0], n = mKey(mIndex(last) + 1);
  return `${n.slice(0, 4)}-${n.slice(4)}-${String(item.deadline?.dayOfMonth ?? 10).padStart(2, '0')}`;
}
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
/* 사용 중인 KPI가 쓰는 항목 */
function usedItemKeys(perf) {
  const keys = new Set();
  perf.kpis.filter(k => k.enabled).forEach(k => [...kpiItemKeys(k), ...subItemKeys(k)].forEach(x => keys.add(x)));
  return keys;
}
/* 입력 기한이 지난 빈 값 — 기준 기간 시작부터 최근 기간까지 */
function missingCells(perf, today = MOCK_TODAY) {
  const used = usedItemKeys(perf), out = [];
  perf.items.filter(i => used.has(i.key)).forEach(item => {
    const to = item.cycle === 'WEEK' ? isoWeekKey(new Date(Date.parse(today) - 7 * 864e5)) : mKey(mIndex(today.slice(0, 4) + today.slice(5, 7)) - 1);
    periodsBetween(item.cycle, item.cycle === 'WEEK' ? '2025-W01' : '202501', to).forEach(p => {
      if (perf.values[valueKey(item.key, item.cycle, p)]) return;
      const dl = deadlineOf(item, item.cycle, p), left = daysBetween(today, dl);
      if (left < 0) out.push({ item, period: p, deadline: dl, overdue: true });
      else if (left <= 3) out.push({ item, period: p, deadline: dl, overdue: false });
    });
  });
  return out;
}
/* 최근 연동 수신 */
const lastReceived = perf => Object.values(perf.values).filter(v => v.source === 'INTERFACE').map(v => v.updatedAt).sort().pop() || null;
