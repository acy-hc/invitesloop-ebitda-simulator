/* 계산엔진 — prototype/vista_v4.html의 계산을 병원 기초정보·시나리오 입력으로 계산한다.
   병원 기초정보 시드 값과 프리셋 입력이면 tests/fixtures/prototype_v4_golden.json과 같은 결과가 나온다. */

/* ---------- 수식 — 사칙연산만 수식으로 두고, 사업 조건(토글·개시 연도)과 누적 반복은 코드에 둔다 ---------- */
const FORMULA_META = [
  ['ramp', '연차별 보간', 'start + (target - start) * (year / 4)', 'Y1 시작값에서 Y5 목표값까지 선형으로 바꾼다. year는 Y1=0, Y5=4.', 'start: 시작값; target: Y5 목표값; year: 연도 인덱스', '전환율·구독료·연계율·진료비·마케팅비율'],
  ['growth', '환자 성장배수', 'pow(1 + growthRate, year)', '환자 기반의 연차별 자연 성장.', 'growthRate: 연 증가율(소수); year: 연도 인덱스', '검진·외래·입원 인원과 파생 매출'],
  ['screenMed', '검진 Medical 전환', 'nonHealthy * app * cmed', '검진 위험군의 Medical 신규 구독 전환.', 'nonHealthy: 위험군 수; app: 앱 접점률; cmed: Medical 전환율(비율은 소수)', 'Medical 신규 유입·누적 구독자'],
  ['screenWell', '검진 Wellness 전환', 'healthy * app * cwell', '건강군의 Wellness 신규 구독 전환.', 'healthy: 건강군 수; app: 앱 접점률; cwell: Wellness 전환율', 'Wellness 구독자·Family 매출'],
  ['outMed', '외래 Medical 전환', 'chronicN * app * cmed', '외래 만성질환자의 Medical 전환.', 'chronicN: 만성질환자 수; app: 앱 접점률; cmed: Medical 전환율', 'Medical 신규 유입·누적 구독자'],
  ['outWell', '외래 Wellness 전환', '(out - chronicN) * app * cwell', '외래 비만성 환자의 Wellness 전환.', 'out: 외래 인원; chronicN: 만성질환자 수; app: 앱 접점률; cwell: Wellness 전환율', 'Wellness 구독자·Family 매출'],
  ['refRev', '외래연계 매출', 'refPatients * visits * visitCost * svcFee', '검진 위험군 중 외래로 연계된 환자의 Service Fee 매출.', 'refPatients: 연계 환자 수; visits: 방문횟수; visitCost: 방문당 진료비; svcFee: 수수료율(소수)', '외래연계 수수료·EBITDA'],
  ['famRev', 'Family 매출', 'subscribers * famSize * riskRatio * refRate * visits * visitCost * svcFee', '그해 신규 구독자의 가족에서 생기는 연계 매출. 누적 구독자는 넣지 않는다.', 'subscribers: 그해 신규 구독자; famSize: 가족 수; riskRatio: 위험군 비율; refRate: 연계율; visits: 방문횟수; visitCost: 방문당 진료비; svcFee: 수수료율', 'Family 구독·EBITDA'],
  ['churn', '유효 이탈률', 'churn0 * (1 - rpmAdopt * rpmDelta)', 'RPM 사용으로 줄어든 연 이탈률. 결과는 0~1이어야 한다.', 'churn0: 기본 이탈률; rpmAdopt: RPM 침투율; rpmDelta: 이탈감소 효과(모두 소수)', '구독자 누적·Medical 구독 매출'],
  ['stock', 'Medical 구독자 누적', 'stock * retention + newMed', '전년 잔류 구독자에 그해 신규 유입을 더한다. 구독자 누적을 켰을 때만 쓴다.', 'stock: 전년 누적; retention: 1 - 유효 이탈률; newMed: 그해 Medical 신규 유입', 'Medical 활성 구독자·커머스'],
  ['subMed', 'Medical 구독 매출', 'medActive * feeMed', '활성 Medical 구독자에 연 구독료를 곱한다.', 'medActive: 활성 Medical 구독자; feeMed: 연 구독료', '구독 매출·매출 합계'],
  ['subWell', 'Wellness 구독 매출', 'wellNew * feeWell', 'Wellness는 그해 신규만 반영한다.', 'wellNew: 신규 Wellness 구독자; feeWell: 연 구독료', '구독 매출·매출 합계'],
  ['corpReach', '기업병원 도달 인원', 'corpPool * penetration * multiplier', '기업병원을 켰을 때 연차별 침투율을 적용한다. 기본 침투율은 Y1~Y2가 0이다.', 'corpPool: 전체 대상 인원; penetration: 연차별 침투율; multiplier: 침투 배율', '기업병원 매출·커머스 직구매'],
  ['corpRev', '기업병원 매출', 'corpReach * 0.95 * 0.10 * 180 + atRisk * 0.20 * visits * visitCost * svcFee', '도달 인원의 검진 매출과 위험군 연계 매출의 합.', 'corpReach: 도달 인원; atRisk: 위험군 수(도달 × 0.46); visits: 방문횟수; visitCost: 방문당 진료비; svcFee: 수수료율', '기업병원 매출·EBITDA'],
  ['commMed', '커머스 의료경로 구매자', 'subscribers * 0.40', '커머스는 Y2부터 시작한다. 활성 구독자 기반.', 'subscribers: Medical 활성 + Wellness 신규', 'P1·P2 구매자'],
  ['commCorp', '커머스 기업 직구매자', 'corpReach * commCorpPen', '기업병원 도달 인원의 직구매 전환. Y2부터 시작한다.', 'corpReach: 기업병원 도달 인원; commCorpPen: 직구매 침투율(소수)', 'P1·P2 구매자'],
  ['p1', 'P1 Invites Pharma 매출', 'commBuyers * 120 * 0.15 * 0.75 + commBuyers * coachFee * 12', 'P1을 켰을 때 제품 수수료와 코칭 매출의 합.', 'commBuyers: 두 경로 구매자 합계; coachFee: 월 코칭료', '커머스 매출·EBITDA'],
  ['p2', 'P2 K-Commerce 매출', 'commBuyers * 200 * 0.20 + commBuyers * coachFee * 12', 'P2를 켰을 때 제품 수수료와 코칭 매출의 합.', 'commBuyers: 두 경로 구매자 합계; coachFee: 월 코칭료', '커머스 매출·EBITDA'],
  ['itemSubscription', '구독형 매출 항목', 'base * conv * fee', '추가한 구독형 매출 항목. 기반 인원 중 전환한 사람에 구독료를 곱한다.', 'base: 기반 인원; conv: 전환율(소수); fee: 구독료', '추가한 매출 항목'],
  ['itemReferral', '연계 수수료형 매출 항목', 'base * rate * visits * cost * fee', '추가한 연계 수수료형 매출 항목.', 'base: 기반 인원; rate: 연계율(소수); visits: 방문횟수; cost: 진료비; fee: 수수료율(소수)', '추가한 매출 항목'],
  ['itemPerCase', '건당형 매출 항목', 'base * ratio * price', '추가한 건당형 매출 항목.', 'base: 기반 인원; ratio: 대상 비율(소수); price: 건당 단가', '추가한 매출 항목'],
  ['labor', '인건비', 'laborUnit * staff', '연도별 인원에 1인 인건비(연 상승률 반영)를 곱한다.', 'laborUnit: 그해 1인 인건비; staff: 그해 인원', '영업비용·EBITDA'],
  ['opex', '운영비', 'rev * opexRate', '매출 대비 운영비.', 'rev: 매출 합계; opexRate: 운영비율(소수)', '영업비용·EBITDA'],
  ['mktg', '마케팅·CAC·간접비', 'rev * mktgRate', 'Y1 비율에서 Y5 목표(기본은 절반)로 줄어드는 비율을 적용한다.', 'rev: 매출 합계; mktgRate: 그해 마케팅비율(소수)', '영업비용·EBITDA'],
  ['bizdev', '사업개발비', 'bizdevK * 1000', 'Y1~Y2에만 생긴다.', 'bizdevK: 입력한 사업개발비(천 단위)', '영업비용·EBITDA'],
  ['royalty', '로열티', 'rev * royaltyRate', '매출에 로열티율을 곱한다.', 'rev: 매출 합계; royaltyRate: 로열티율(소수)', '영업비용·EBITDA'],
  ['om', '유지보수비', 'rev * omRate', '매출 대비 유지보수비.', 'rev: 매출 합계; omRate: 유지보수비 요율(소수)', '영업비용·EBITDA'],
  ['commonCost', '공통 비용 합계', 'labor + opex + mktg + bizdev + royalty + om + hcCost + dep', '영업비용, CAPEX 귀속분, 감가상각의 합.', 'labor·opex·mktg·bizdev·royalty·om: 비용; hcCost: CAPEX 포함을 켰을 때 CAPEX; dep: 감가상각', '부문 비용 배분·EBITDA'],
  ['segmentCost', '부문 비용 배분', 'commonCost * share', '매출 비중으로 공통 비용을 나눈다.', 'commonCost: 공통 비용; share: Medical 또는 Commerce 매출 비중', 'Medical·Commerce 비용'],
  ['segmentEbitda', '부문 EBITDA', 'revenue - (cost - dep * share)', '배분 비용에서 부문 몫의 감가상각을 다시 뺀다.', 'revenue: 부문 매출; cost: 부문 비용; dep: 감가상각; share: 부문 매출 비중', 'Medical·Commerce EBITDA'],
  ['totalEbitda', 'EBITDA', 'rev - (totCost - dep)', '총비용에서 감가상각을 다시 뺀 비용을 매출에서 뺀다.', 'rev: 매출 합계; totCost: 총비용; dep: 감가상각', 'EBITDA·밴드·세금'],
  ['tax', '법인세', 'ebit * taxRate', '과세표준이 양수일 때만 적용한다. 이월결손금 공제 연수가 있으면 공제한 뒤의 금액이 ebit로 들어온다.', 'ebit: 과세표준; taxRate: 법인세율(소수)', '세후이익'],
  ['nopat', '세후이익', 'ebit - tax', 'EBIT에서 법인세를 뺀다.', 'ebit: 영업이익; tax: 법인세', '세후이익·FCF'],
].map(([key, label, expr, meaning, variables, impact]) => ({ key, label, expr, meaning, variables, impact }));
const FORMULA_DEFAULTS = Object.freeze(Object.fromEntries(FORMULA_META.map(m => [m.key, m.expr])));

const MATH_FN = { min: Math.min, max: Math.max, abs: Math.abs, round: Math.round, floor: Math.floor, ceil: Math.ceil, pow: Math.pow };
const ownKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* 숫자·변수·사칙연산·괄호·허용 함수만 읽는 파서. eval을 쓰지 않는다 */
function parseFormula(expression, allowed) {
  if (typeof expression !== 'string' || !expression.trim()) throw Error('빈 수식입니다.');
  if (expression.length > 1200) throw Error('수식은 1200자 이내로 입력하세요.');
  const tokens = []; let pos = 0;
  while (pos < expression.length) {
    if (/\s/.test(expression[pos])) { pos++; continue; }
    const m = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|^[A-Za-z_][A-Za-z0-9_]*|^[+*/%(),-]/.exec(expression.slice(pos));
    if (!m) throw Error('허용되지 않는 문자입니다.');
    tokens.push(m[0]); pos += m[0].length;
  }
  let i = 0;
  function atom() {
    const t = tokens[i++];
    if (t === '+' || t === '-') { const n = atom(); return v => (t === '-' ? -n(v) : n(v)); }
    if (t === '(') { const n = sum(); if (tokens[i++] !== ')') throw Error('괄호를 확인하세요.'); return n; }
    if (t && /^(?:\d|\.)/.test(t)) { const n = Number(t); if (!Number.isFinite(n)) throw Error('유효하지 않은 숫자입니다.'); return () => n; }
    if (t && /^[A-Za-z_]/.test(t)) {
      if (tokens[i] === '(') {
        if (!ownKey(MATH_FN, t)) throw Error('허용되지 않는 함수: ' + t);
        i++; const args = [];
        if (tokens[i] !== ')') { args.push(sum()); while (tokens[i] === ',') { i++; args.push(sum()); } }
        if (tokens[i++] !== ')') throw Error('함수 괄호를 확인하세요.');
        const arity = t === 'pow' ? 2 : ['min', 'max'].includes(t) ? null : 1;
        if (!args.length || (arity !== null && args.length !== arity)) throw Error('함수 인자 수를 확인하세요.');
        return v => MATH_FN[t](...args.map(a => a(v)));
      }
      if (!allowed.has(t)) throw Error('알 수 없는 변수: ' + t);
      return v => v[t];
    }
    throw Error('수식 문법을 확인하세요.');
  }
  function product() { let n = atom(); while (['*', '/', '%'].includes(tokens[i])) { const op = tokens[i++], a = n, b = atom(); n = v => { const x = a(v), y = b(v); return op === '*' ? x * y : op === '/' ? x / y : x % y; }; } return n; }
  function sum() { let n = product(); while (['+', '-'].includes(tokens[i])) { const op = tokens[i++], a = n, b = product(); n = v => (op === '+' ? a(v) + b(v) : a(v) - b(v)); } return n; }
  const result = sum();
  if (i !== tokens.length) throw Error('수식 끝의 문법을 확인하세요.');
  return result;
}

/* 수식 실행기 — 수정한 수식이 틀리면 기본식으로 계산하고 오류를 남긴다. traces는 대입값 보기에 쓴다 */
function formulaContext(expressions = {}) {
  const traces = new Map(), errors = new Map(), compiled = new Map();
  return {
    traces, errors,
    eval(key, vars, label) {
      const source = expressions[key] ?? FORMULA_DEFAULTS[key];
      const run = expr => {
        const ck = key + '|' + expr;
        if (!compiled.has(ck)) compiled.set(ck, parseFormula(expr, new Set(Object.keys(vars))));
        const n = compiled.get(ck)(vars);
        if (!Number.isFinite(n)) throw Error('계산 결과가 유한한 숫자가 아닙니다.');
        if (key === 'churn' && (n < 0 || n > 1)) throw Error('유효 이탈률은 0~1이어야 합니다.');
        return n;
      };
      let value, error = '';
      try { value = run(source); } catch (e) { error = e.message; errors.set(key, error); value = run(FORMULA_DEFAULTS[key]); }
      traces.set(key + '|' + label, { key, label, vars: { ...vars }, value, error });
      return value;
    },
  };
}

/* ---------- 입력 해석 ---------- */
const HORIZON = 5;

/* 병원 입력 항목 정의 — 매출 항목 필드에서 찾는다 */
function fieldOf(h, key) {
  for (const it of h.revenueItems) { const f = it.fields.find(x => x.key === key); if (f) return f; }
  return null;
}
/* 시나리오 입력값. 실적값 사용(key@actual)을 켰으면 병원 실적값을 쓴다 */
function driverValue(h, d, key) {
  if (d[key + '@actual']) { const f = fieldOf(h, key); if (f?.actual != null) return f.actual; }
  return d[key] ?? h.defaults[key];
}
/* Y5 목표 — 입력하지 않으면 항목의 기본 목표. 마케팅비율은 Y1의 절반 */
function rampTarget(h, d, key, start) {
  if (d[key + '@5'] != null && d[key + '@5'] !== '') return +d[key + '@5'];
  if (key === 'mktgRate') return start * 0.5;
  const f = fieldOf(h, key);
  return typeof f?.ramp === 'number' ? f.ramp : start;
}
/* 연간 인원 — 직접 입력(vol.KEY)이 있으면 그 값, 없으면 실적을 연환산 */
function volumeTotal(h, d, key) {
  if (d['vol.' + key] != null) return +d['vol.' + key];
  const v = h.volumes.find(x => x.key === key);
  return v ? v.count * 12 / v.months : 0;
}
function siteShare(h, key, site) {
  const v = h.volumes.find(x => x.key === key);
  if (!v?.bySite) return 1 / h.sites.length;
  const sum = Object.values(v.bySite).reduce((a, b) => a + b, 0);
  return sum ? v.bySite[site.key] / sum : 0;
}
const effectiveChurn = (h, d, ctx = formulaContext()) => ctx.eval('churn', { churn0: driverValue(h, d, 'churn0') / 100, rpmAdopt: driverValue(h, d, 'rpmAdopt') / 100, rpmDelta: driverValue(h, d, 'rpmDelta') / 100 }, '구독자 누적');

/* ---------- 계산 ---------- */
/* h: 병원(기초정보), d: 시나리오 입력, formulas: 수정한 수식 { key: expr } */
function runModel(h, d, formulas = {}) {
  const ctx = formulaContext(formulas);
  const p = h.profile, m = h.model;
  const prm = Object.fromEntries(h.params.map(x => [x.key, x]));
  const val = k => driverValue(h, d, k);
  const enabled = Object.fromEntries(h.revenueItems.map(it => [it.key, it.enabled]));
  const item = k => h.revenueItems.find(it => it.key === k);
  const ramp = (key, y, label, start = val(key)) => ctx.eval('ramp', { start, target: rampTarget(h, d, key, start), year: y }, `${label} ${fieldOf(h, key)?.label ?? key}`);
  const growth = (type, y, label) => ctx.eval('growth', { growthRate: (prm[type]?.growth ?? 0) / 100, year: y }, `${label} ${VOLUME_TYPES.find(t => t.key === type).label}`);
  const riskRatio = (prm.CHK?.risk ?? 0) / 100;

  /* 거점별 매출 — 거점마다 만성질환 비율과 연계 계수가 다르다 */
  function siteRev(site, y) {
    const label = `${site.name} Y${y + 1}`;
    const f = (key, vars) => ctx.eval(key, vars, label);
    const screen = volumeTotal(h, d, 'CHK') * siteShare(h, 'CHK', site) * growth('CHK', y, label);
    const out = volumeTotal(h, d, 'OUT') * siteShare(h, 'OUT', site) * growth('OUT', y, label);
    const app = ramp('appRate', y, label) / 100, cmed = ramp('convMed', y, label) / 100, cwell = ramp('convWell', y, label) / 100;
    const nonHealthy = screen * riskRatio, healthy = screen * (1 - riskRatio);
    const screenMed = f('screenMed', { nonHealthy, app, cmed }), screenWell = f('screenWell', { healthy, app, cwell });
    const chronicN = out * site.chronic / 100;
    const outMed = f('outMed', { chronicN, app, cmed }), outWell = f('outWell', { out, chronicN, app, cwell });
    const refRate = ramp('refRate', y, label, val('refRate') * site.referral) / 100;
    const visitCost = ramp('visitCost', y, label), visits = val('visits'), svcFee = val('svcFee') / 100;
    const refRev = f('refRev', { refPatients: nonHealthy * refRate, visits, visitCost, svcFee });
    const subscribers = screenMed + screenWell + outMed + outWell;
    const famRev = f('famRev', { subscribers, famSize: val('famSize'), riskRatio, refRate, visits, visitCost, svcFee });
    return { refRev, famRev, medNew: screenMed + outMed, wellNew: screenWell + outWell };
  }
  const siteRuns = Array.from({ length: HORIZON }, (_, y) => h.sites.map(s => siteRev(s, y)));

  /* 구독자 누적 — 전년 잔류분에 신규 Medical 유입을 더한다 */
  const retention = 1 - effectiveChurn(h, d, ctx);
  const stocks = []; let stock = 0;
  for (let y = 0; y < HORIZON; y++) {
    const newMed = siteRuns[y].reduce((a, s) => a + s.medNew, 0);
    stock = ctx.eval('stock', { stock, retention, newMed }, `합산 Y${y + 1}`);
    stocks.push(stock);
  }

  const corpOn = enabled.corpRev && val('corp');
  const lossYears = p.taxLossYears || 0, losses = [];
  let prevRev = 0;
  return {
    ctx,
    years: Array.from({ length: HORIZON }, (_, y) => {
      const label = `합산 Y${y + 1}`;
      const f = (key, vars, suffix = '') => ctx.eval(key, vars, label + suffix);
      const sites = siteRuns[y];
      const feeMed = ramp('feeMed', y, label), feeWell = ramp('feeWell', y, label);
      const medNew = sites.reduce((a, s) => a + s.medNew, 0), wellNew = sites.reduce((a, s) => a + s.wellNew, 0);
      const medActive = val('reservoir') ? stocks[y] : medNew;
      const subscribers = medActive + wellNew;
      const visits = val('visits'), svcFee = val('svcFee') / 100;

      let corpReach = 0, corpRev = 0;
      if (corpOn) {
        corpReach = f('corpReach', { corpPool: m.corpPool, penetration: m.corpPenBase[y], multiplier: val('corpPen') });
        corpRev = f('corpRev', { corpReach, atRisk: corpReach * 0.46, visits, visitCost: ramp('visitCost', y, label + ' 기업병원'), svcFee });
      }
      /* 커머스는 Y2부터 — Y1은 진료 서비스 준비에 집중한다 */
      let commRev = 0, commBuyers = 0;
      if (enabled.commRev && y >= 1) {
        commBuyers = f('commMed', { subscribers }) + f('commCorp', { corpReach, commCorpPen: m.commCorpPen / 100 });
        if (val('p1')) commRev += f('p1', { commBuyers, coachFee: val('coachFee') });
        if (val('p2')) commRev += f('p2', { commBuyers, coachFee: val('coachFee') });
      }

      const rev = {
        sub: enabled.sub ? f('subMed', { medActive, feeMed }) + f('subWell', { wellNew, feeWell }) : 0,
        ref: enabled.ref ? sites.reduce((a, s) => a + s.refRev, 0) : 0,
        fam: enabled.fam ? sites.reduce((a, s) => a + s.famRev, 0) : 0,
        corpRev: enabled.corpRev ? corpRev : 0,
        commRev,
      };
      /* 병원 기초정보에서 추가한 매출 항목 — 산출 방식에 따라 계산한다 */
      const base = {
        OUT: volumeTotal(h, d, 'OUT') * growth('OUT', y, label), IN: volumeTotal(h, d, 'IN') * growth('IN', y, label),
        CHK: volumeTotal(h, d, 'CHK') * growth('CHK', y, label), SUBS: subscribers, CORP: corpReach,
      };
      h.revenueItems.filter(it => it.custom && it.enabled).forEach(it => {
        const fv = s => +(d[`${it.key}.${s}`] ?? it.fields.find(x => x.key === `${it.key}.${s}`)?.def ?? 0);
        const b = base[it.base] ?? 0, sfx = ` ${it.name}`;
        rev[it.key] = it.type === 'SUBSCRIPTION' ? f('itemSubscription', { base: b, conv: fv('conv') / 100, fee: fv('fee') }, sfx)
          : it.type === 'REFERRAL_FEE' ? f('itemReferral', { base: b, rate: fv('rate') / 100, visits: fv('visits'), cost: fv('cost'), fee: fv('fee') / 100 }, sfx)
          : it.type === 'PER_CASE' ? f('itemPerCase', { base: b, ratio: fv('ratio') / 100, price: fv('price') }, sfx)
          : +(d[`${it.key}.amount.${y + 1}`] || 0);
      });
      const segRev = seg => h.revenueItems.filter(it => it.segment === seg).reduce((a, it) => a + (rev[it.key] || 0), 0);
      const medRev = segRev('Medical'), commSegRev = segRev('Commerce'), revTotal = medRev + commSegRev;

      const laborUnit = p.laborUnitCost * Math.pow(1 + (p.laborInflation || 0) / 100, y);
      const mktgStart = val('mktgRate');
      const cost = {
        labor: f('labor', { laborUnit, staff: p.staff[y] }),
        opex: f('opex', { rev: revTotal, opexRate: val('opexRate') / 100 }),
        mktg: f('mktg', { rev: revTotal, mktgRate: ramp('mktgRate', y, label, mktgStart) / 100 }),
        bizdev: y < 2 ? f('bizdev', { bizdevK: val('bizdevK') }) : 0,
        royalty: f('royalty', { rev: revTotal, royaltyRate: p.royaltyRate / 100 }),
        om: f('om', { rev: revTotal, omRate: val('omRate') / 100 }),
        hc: val('hcAttr') ? p.capex[y] : 0,
      };
      const dep = p.depreciation[y];
      const commonCost = f('commonCost', { labor: cost.labor, opex: cost.opex, mktg: cost.mktg, bizdev: cost.bizdev, royalty: cost.royalty, om: cost.om, hcCost: cost.hc, dep });
      const medShare = revTotal > 0 ? medRev / revTotal : 1, commShare = revTotal > 0 ? commSegRev / revTotal : 0;
      const medCost = f('segmentCost', { commonCost, share: medShare }, ' Medical'), commCost = f('segmentCost', { commonCost, share: commShare }, ' Commerce');
      const medEbitda = f('segmentEbitda', { revenue: medRev, cost: medCost, dep, share: medShare }, ' Medical');
      const commEbitda = f('segmentEbitda', { revenue: commSegRev, cost: commCost, dep, share: commShare }, ' Commerce');
      const ebitda = f('totalEbitda', { rev: revTotal, totCost: medCost + commCost, dep });
      const ebit = ebitda - dep;

      /* 이월결손금 — 공제 연수가 0이면 그해 EBIT에만 과세한다 */
      let taxable = ebit;
      if (lossYears > 0) {
        while (losses.length && y - losses[0].year > lossYears) losses.shift();
        if (ebit < 0) losses.push({ year: y, amount: -ebit });
        else for (const l of losses) { const use = Math.min(l.amount, taxable); l.amount -= use; taxable -= use; }
        while (losses.length && losses[0].amount <= 0) losses.shift();
      }
      const tax = taxable > 0 ? f('tax', { ebit: taxable, taxRate: p.taxRate / 100 }) : 0;
      const nopat = f('nopat', { ebit, tax });

      /* FCF — CAPEX를 EBITDA 비용에 넣었으면 다시 빼지 않는다 */
      const capex = val('hcAttr') ? 0 : p.capex[y];
      const nwc = (p.nwcRate || 0) / 100 * (revTotal - prevRev);
      prevRev = revTotal;
      const costTotal = Object.values(cost).reduce((a, b) => a + b, 0);
      return {
        rev, cost, revTotal, costTotal, ebitda, dep, ebit, tax, nopat, capex, nwc, fcf: nopat + dep - capex - nwc,
        medRev, commRev: commSegRev, medEbitda, commEbitda, subscribers, medActive, corpReach, commBuyers,
      };
    }),
  };
}

/* 시나리오 입력 — 저장된 입력이 없으면 병원 기본값 + 프리셋 */
function presetDrivers(h, presetKey) {
  const p = h.presets.find(x => x.key === presetKey);
  return { ...structuredClone(h.defaults), ...(p ? structuredClone(p.set) : {}) };
}
const scenarioDrivers = (h, s) => (s.drivers ? { ...structuredClone(h.defaults), ...structuredClone(s.drivers) } : presetDrivers(h, s.preset));
const scenarioYears = (h, s, formulas) => runModel(h, scenarioDrivers(h, s), formulas).years;
