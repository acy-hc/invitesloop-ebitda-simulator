/* 성과 KPI 계산 모듈 — 데이터 항목 값으로 KPI·계획 경로·상태·EBITDA 효과를 계산한다 (docs/09-kpi-definition.md).
 * 화면·브라우저 API에 의존하지 않는다. 서버 계산으로 바꾸면 같은 모듈을 서버에서 돌린다 (D27).
 * 계산식은 engine.js의 parseFormula(시뮬레이터 수식과 같은 문법)로 읽는다. */

/* ---------- 기간 ---------- */
const PERIODS_PER_YEAR = { WEEK: 52, MONTH: 12, QUARTER: 4, YEAR: 1 };
const CYCLE_ORDER = { WEEK: 0, MONTH: 1, QUARTER: 2, YEAR: 3 };

const mIndex = key => +key.slice(0, 4) * 12 + (+key.slice(4, 6) - 1);
const mKey = i => `${Math.floor(i / 12)}${String((i % 12) + 1).padStart(2, '0')}`;
const daysInMonth = key => new Date(Date.UTC(+key.slice(0, 4), +key.slice(4, 6), 0)).getUTCDate();

/* ISO 주 — 월요일 시작, 1월 4일이 들어 있는 주가 1주 */
function isoWeekStart(key) {
  const [y, w] = key.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4)), dow = jan4.getUTCDay() || 7;
  return new Date(jan4.getTime() + ((w - 1) * 7 - (dow - 1)) * 864e5);
}
function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  const y = d.getUTCFullYear(), w = Math.ceil(((d - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
const nextWeek = key => isoWeekKey(new Date(isoWeekStart(key).getTime() + 7 * 864e5));

/* 기간 키 → 그 기간에 속한 달 목록 */
function monthsOf(cycle, key) {
  if (cycle === 'MONTH') return [key];
  if (cycle === 'QUARTER') { const y = key.slice(0, 4), q = +key.slice(5); return [0, 1, 2].map(k => `${y}${String((q - 1) * 3 + k + 1).padStart(2, '0')}`); }
  if (cycle === 'YEAR') return Array.from({ length: 12 }, (_, k) => `${key}${String(k + 1).padStart(2, '0')}`);
  return null;
}
const periodOfMonth = (cycle, m) => cycle === 'MONTH' ? m : cycle === 'QUARTER' ? `${m.slice(0, 4)}Q${Math.floor((+m.slice(4) - 1) / 3) + 1}` : m.slice(0, 4);
function periodsBetween(cycle, from, to) {
  const out = [];
  if (cycle === 'WEEK') { for (let k = from; out.length < 600; k = nextWeek(k)) { out.push(k); if (k === to) break; } return out; }
  for (let i = mIndex(monthsOf(cycle, from)[0]); i <= mIndex(monthsOf(cycle, to).slice(-1)[0]); i++) {
    const p = periodOfMonth(cycle, mKey(i));
    if (out[out.length - 1] !== p) out.push(p);
  }
  return out;
}
function periodLabel(cycle, key) {
  if (cycle === 'MONTH') return `${key.slice(0, 4)}.${key.slice(4)}`;
  if (cycle === 'QUARTER') return `${key.slice(0, 4)} ${key.slice(4)}`;
  if (cycle === 'WEEK') {
    const s = isoWeekStart(key), e = new Date(s.getTime() + 6 * 864e5);
    return `${key.slice(2, 4)}년 ${+key.slice(6)}주 (${s.getUTCMonth() + 1}/${s.getUTCDate()}~${e.getUTCMonth() + 1}/${e.getUTCDate()})`;
  }
  return key;
}
/* 주가 각 달에 속한 날 수 — 두 달에 걸친 주를 일수 비례로 나눈다 (D24) */
function weekMonthDays(week) {
  const s = isoWeekStart(week), out = {};
  for (let d = 0; d < 7; d++) { const t = new Date(s.getTime() + d * 864e5), k = `${t.getUTCFullYear()}${String(t.getUTCMonth() + 1).padStart(2, '0')}`; out[k] = (out[k] || 0) + 1; }
  return out;
}

/* ---------- 데이터 값 ---------- */
const valueKey = (itemKey, cycle, period) => `${itemKey}|${cycle}|${period}`;

/* 한 달의 항목 값 — 주 단위 항목은 그 달에 걸친 주를 모아 집계 방식대로 만든다 */
function monthValue(item, values, m) {
  if (item.cycle === 'MONTH') { const v = values[valueKey(item.key, 'MONTH', m)]; return v ? { value: v.value, status: v.status } : null; }
  if (item.cycle !== 'WEEK') return null;
  const first = isoWeekKey(new Date(Date.UTC(+m.slice(0, 4), +m.slice(4) - 1, 1)));
  const lastDay = new Date(Date.UTC(+m.slice(0, 4), +m.slice(4), 0));
  const weeks = periodsBetween('WEEK', first, isoWeekKey(lastDay));
  let sum = 0, wsum = 0, status = 'FINAL', endVal = null;
  for (const w of weeks) {
    const v = values[valueKey(item.key, 'WEEK', w)];
    if (!v || v.value == null) return null;
    const days = weekMonthDays(w)[m] || 0;
    if (v.status === 'PROVISIONAL') status = 'PROVISIONAL';
    if (item.aggregation === 'SUM') sum += v.value * days / 7;
    else if (item.aggregation === 'AVG') { sum += v.value * days; wsum += days; }
    endVal = v.value;
  }
  return { value: item.aggregation === 'SUM' ? sum : item.aggregation === 'AVG' ? sum / wsum : endVal, status, derived: true };
}

/* 여러 달을 하나로 — SUM은 더하고, END는 마지막 달, AVG는 일수 가중 평균 */
function aggregate(item, values, months) {
  let sum = 0, wsum = 0, status = 'FINAL', last = null;
  for (const m of months) {
    const v = monthValue(item, values, m);
    if (!v || v.value == null) return null;
    if (v.status === 'PROVISIONAL') status = 'PROVISIONAL';
    const d = daysInMonth(m);
    if (item.aggregation === 'SUM') sum += v.value;
    else if (item.aggregation === 'AVG') { sum += v.value * d; wsum += d; }
    last = v.value;
  }
  return { value: item.aggregation === 'SUM' ? sum : item.aggregation === 'AVG' ? sum / wsum : last, status };
}

/* ---------- 계산식 ---------- */
const exprCache = new Map();
function evalExpr(expr, vars) {
  const ck = expr + '|' + Object.keys(vars).sort().join(',');
  if (!exprCache.has(ck)) exprCache.set(ck, parseFormula(expr, new Set(Object.keys(vars))));
  const v = exprCache.get(ck)(vars);
  return Number.isFinite(v) ? v : null;
}
const itemKeysOf = expr => (String(expr).match(/[A-Za-z_][A-Za-z0-9_]*/g) || []).filter(t => /^[A-Z][A-Z0-9_]*$/.test(t) && !t.startsWith('base_'));
/* KPI 값·EBITDA 효과에 꼭 필요한 항목 — 보조 지표 항목은 빠져도 KPI는 계산한다 */
function kpiItemKeys(kpi) {
  const f = kpi.formula, e = kpi.ebitda;
  const exprs = [f.expression, f.numerator, f.denominator, e.method === 'NONE' ? null : e.scale, e.method === 'NONE' ? null : e.unitValue, e.method === 'CUSTOM' ? e.expression : null, e.cashExpression];
  return [...new Set(exprs.filter(Boolean).flatMap(itemKeysOf))];
}
const subItemKeys = kpi => [...new Set((kpi.subMetrics || []).flatMap(s => itemKeysOf(s.expression)))];
const formulaItemKeys = kpi => [...new Set([kpi.formula.expression, kpi.formula.numerator, kpi.formula.denominator].filter(Boolean).flatMap(itemKeysOf))];
/* 계산식을 데이터 항목 이름으로 풀어 쓴다 */
function describeFormula(kpi, items) {
  const name = k => items.find(i => i.key === k)?.name ?? k;
  const sub = e => String(e).replace(/[A-Z][A-Z0-9_]*/g, k => (k === 'months' || k === 'days') ? k : name(k)).replace(/\bmonths\b/g, '개월 수').replace(/\bdays\b/g, '일수').replace(/\*/g, '×').replace(/\//g, '÷');
  return kpi.formula.kind === 'RATIO' ? `${sub(kpi.formula.numerator)} ÷ ${sub(kpi.formula.denominator)}${kpi.formula.multiplier === 100 ? ' × 100' : ''}` : sub(kpi.formula.expression);
}

/* 달 목록에 대한 변수 — 데이터 항목 값, months, days, base_항목(기준 기간 월평균·기말값) */
function varsFor(ctx, months, need) {
  const vars = { months: months.length, days: months.reduce((a, m) => a + daysInMonth(m), 0) };
  let status = 'FINAL';
  for (const k of need) {
    const item = ctx.items.find(i => i.key === k);
    const v = item ? aggregate(item, ctx.values, months) : null;
    if (!v) return { vars: null, missing: k };
    vars[k] = v.value;
    if (v.status === 'PROVISIONAL') status = 'PROVISIONAL';
  }
  return { vars, status };
}
function kpiValueOf(kpi, vars) {
  const f = kpi.formula;
  if (f.kind === 'RATIO') { const n = evalExpr(f.numerator, vars), d = evalExpr(f.denominator, vars); return n == null || !d ? null : n / d * (f.multiplier ?? 1); }
  return evalExpr(f.expression, vars);
}

/* ---------- 여정 ---------- */
/* 계획 경로 — 기준 기간 끝 다음 달부터 목표 시점까지 같은 폭, 중간 목표가 있으면 구간마다 직선 */
function planAt(target, base, monthIdx) {
  const pts = [{ i: mIndex(target.baselineTo), v: base }, ...(target.milestones || []).map(m => ({ i: mIndex(m.period), v: m.value })), { i: mIndex(target.targetPeriod), v: target.targetValue }].sort((a, b) => a.i - b.i);
  if (monthIdx <= pts[0].i) return null;
  if (monthIdx >= pts[pts.length - 1].i) return target.targetValue;
  for (let k = 1; k < pts.length; k++) if (monthIdx <= pts[k].i) { const a = pts[k - 1], b = pts[k]; return a.v + (b.v - a.v) * (monthIdx - a.i) / (b.i - a.i); }
  return target.targetValue;
}

/* EBITDA 효과 (병원 통화) — 환산 방식별 (09 §4) */
function ebitdaEffect(kpi, current, base, vars) {
  const e = kpi.ebitda, dir = kpi.direction === 'DOWN' ? -1 : 1;
  if (current == null || base == null) return null;
  if (e.method === 'NONE') return null;
  if (e.method === 'AMOUNT_DELTA') return (current - base) * dir * vars.months;
  const v = { ...vars, current, base, factor: (e.factor ?? 100) / 100 };
  if (e.method === 'CUSTOM') return evalExpr(e.expression, v);
  // 비율 KPI의 변화량은 배수(×100)를 뺀 값으로 쓴다
  const delta = (current - base) * dir / (kpi.formula.kind === 'RATIO' ? (kpi.formula.multiplier ?? 1) : 1);
  const scale = evalExpr(e.scale || '1', v), unit = evalExpr(e.unitValue || '1', v);
  return scale == null || unit == null ? null : delta * scale * unit * (e.factor ?? 100) / 100;
}
const cashEffect = (kpi, current, base, vars) => (kpi.ebitda.cashExpression && current != null && base != null ? evalExpr(kpi.ebitda.cashExpression, { ...vars, current, base }) : null);

/* 상태 — 가장 최근 확정 기간 기준 */
function statusOf(kpi, target, base, last) {
  if (!target) return 'NO_TARGET';
  if (!last) return 'NO_DATA';
  const dir = kpi.direction === 'DOWN' ? -1 : 1;
  if ((last.value - target.targetValue) * dir >= 0) return 'ACHIEVED';
  const tol = (target.toleranceRatio ?? 0.1) * Math.abs(target.targetValue - base);
  return last.plan == null || (last.value - last.plan) * dir >= -tol ? 'ON_TRACK' : 'BEHIND';
}

/* ---------- 계산 ---------- */
/* ctx: { hospital, kpis, targets, items, values, cycle, from, to, latestMonth, fx(year) → 환율 } */
function computeKpis(ctx) {
  const cycle = ctx.cycle, keys = periodsBetween(cycle, ctx.from, ctx.to), latestIdx = mIndex(ctx.latestMonth);
  const ppy = PERIODS_PER_YEAR[cycle];
  const results = ctx.kpis.filter(k => k.enabled).map(kpi => {
    const target = ctx.targets[kpi.key] || null, need = kpiItemKeys(kpi);
    // 기준값 — 기준 기간 전체를 한 기간으로 합쳐 계산한다 (D28)
    let base = null, baseVars = {};
    if (target) {
      const bm = periodsBetween('MONTH', target.baselineFrom, target.baselineTo);
      const b = varsFor(ctx, bm, need);
      if (b.vars) {
        need.forEach(k => { const it = ctx.items.find(i => i.key === k); baseVars['base_' + k] = it.aggregation === 'SUM' ? b.vars[k] / bm.length : b.vars[k]; });
        base = target.baselineValue ?? kpiValueOf(kpi, b.vars);
      } else base = target.baselineValue ?? null;
    }
    const baseEnd = target ? mIndex(target.baselineTo) : Infinity;
    const periods = keys.map(p => {
      const months = monthsOf(cycle, p), endIdx = mIndex(months[months.length - 1]);
      const out = { period: p, value: null, status: 'MISSING', plan: null, baseline: base, ebitdaEffect: null, planEffect: null, cashEffect: null, subMetrics: [], future: endIdx > latestIdx };
      if (out.future) { out.status = 'FUTURE'; out.plan = target && base != null ? planAt(target, base, endIdx) : null; return out; }
      const r = varsFor(ctx, months, need);
      out.plan = target && base != null ? planAt(target, base, endIdx) : null;
      if (!r.vars) { out.missingItem = r.missing; return out; }
      const vars = { ...r.vars, ...baseVars };
      out.value = kpiValueOf(kpi, vars);
      if (out.value == null) return out;
      // 측정 지연 안의 기간은 잠정 (확정 전)
      out.status = r.status === 'PROVISIONAL' || endIdx > latestIdx - (kpi.lag || 0) ? 'PROVISIONAL' : 'FINAL';
      out.subMetrics = (kpi.subMetrics || []).map(s => {
        const sv = varsFor(ctx, months, itemKeysOf(s.expression));
        return sv.vars ? evalExpr(s.expression, { ...vars, ...sv.vars }) : null;
      });
      if (endIdx > baseEnd && base != null) {
        const fx = ctx.fx(+months[months.length - 1].slice(0, 4));
        const eff = ebitdaEffect(kpi, out.value, base, vars), cash = cashEffect(kpi, out.value, base, vars);
        out.ebitdaEffect = eff == null ? null : eff / fx;
        out.cashEffect = cash == null ? null : cash / fx;
        if (out.plan != null) { const pe = ebitdaEffect(kpi, out.plan, base, vars); out.planEffect = pe == null ? null : pe / fx; }
        out.vars = vars; out.fx = fx;
      }
      return out;
    });
    const finals = periods.filter(p => p.status === 'FINAL' && p.value != null);
    const last = finals[finals.length - 1] || null;
    const lastAny = [...periods].reverse().find(p => p.value != null) || null;
    const progress = target && base != null && last ? (last.value - base) / (target.targetValue - base) : null;
    const effFinals = finals.filter(p => p.ebitdaEffect != null);
    const recent = effFinals.slice(-3);
    const annualized = recent.length ? recent.reduce((a, p) => a + p.ebitdaEffect, 0) / recent.length * ppy : 0;
    const lastVars = [...periods].reverse().find(p => p.vars);
    let targetAnnualized = null;
    if (target && base != null && lastVars && kpi.ebitda.method !== 'NONE') {
      const te = ebitdaEffect(kpi, target.targetValue, base, lastVars.vars);
      targetAnnualized = te == null ? null : te / lastVars.fx * ppy;
    }
    return {
      kpiKey: kpi.key, kpi, target, base, periods, current: last, latest: lastAny, progress,
      status: statusOf(kpi, target, base, last), annualized, targetAnnualized,
      cumulative: effFinals.reduce((a, p) => a + p.ebitdaEffect, 0),
      cash: [...finals].reverse().find(p => p.cashEffect != null)?.cashEffect ?? null,
      missingCount: periods.filter(p => p.status === 'MISSING').length,
    };
  });
  const statusCounts = { ACHIEVED: 0, ON_TRACK: 0, BEHIND: 0, NO_DATA: 0, NO_TARGET: 0 };
  results.forEach(r => { statusCounts[r.status]++; });
  const withTarget = results.filter(r => r.targetAnnualized != null);
  const summary = {
    cumulativeEffect: results.reduce((a, r) => a + r.cumulative, 0),
    annualizedEffect: results.reduce((a, r) => a + r.annualized, 0),
    targetAnnualizedEffect: withTarget.length ? withTarget.reduce((a, r) => a + r.targetAnnualized, 0) : null,
    cashEffect: results.reduce((a, r) => a + (r.cash || 0), 0),
    periodsCounted: keys.filter((p, i) => results.some(r => r.periods[i].status === 'FINAL')).length,
    periodsMissing: results.reduce((a, r) => a + r.missingCount, 0),
    statusCounts,
  };
  return { keys, results, summary };
}
