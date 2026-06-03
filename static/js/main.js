// ════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════
const S = { answers:{}, curQ:0, results:null, reportId:null };
let pdfDataUrl = null;

// ════════════════════════════════════════════════════
// QUESTIONS  — richer emoji options
// ════════════════════════════════════════════════════
const QS = [
  {
    key:'exercise', cat:'🏃 Lifestyle', lbl:'Exercise',
    txt:'How often do you exercise or move your body each week?',
    hint:'Includes walking, gym, sports, yoga, cycling',
    opts:[
      {em:'🛋️',lbl:'Never',sub:'Mostly sedentary all day',val:0},
      {em:'🚶',lbl:'1–2 days / week',sub:'Light occasional activity',val:1},
      {em:'🏃',lbl:'3–4 days / week',sub:'Regular moderate exercise',val:2},
      {em:'🏋️',lbl:'5+ days / week',sub:'Very active — gym, sports, yoga',val:3},
    ]
  },
  {
    key:'diet', cat:'🍽️ Nutrition', lbl:'Diet',
    txt:'How would you describe your typical daily diet?',
    hint:'Think about what you eat on an average day',
    opts:[
      {em:'🍔',lbl:'Mostly junk / fast food',sub:'Fried, processed, sugary items',val:0},
      {em:'🍱',lbl:'Mixed diet',sub:'Some healthy choices, some not',val:1},
      {em:'🥘',lbl:'Mostly home-cooked',sub:'Balanced, fresh ingredients',val:2},
      {em:'🥗',lbl:'Very healthy',sub:'Whole foods, plant-based, minimal sugar',val:3},
    ]
  },
  {
    key:'smoke', cat:'🚬 Lifestyle', lbl:'Smoking',
    txt:'Do you smoke or use tobacco products?',
    hint:'Includes cigarettes, cigars, beedis, vaping',
    opts:[
      {em:'🚬',lbl:'Daily smoker',sub:'Every day — 5 or more per day',val:0},
      {em:'💨',lbl:'Occasionally',sub:'Social / on-and-off smoker',val:1},
      {em:'🕊️',lbl:'Ex-smoker',sub:'Quit in the past',val:2},
      {em:'🚭',lbl:'Never smoked',sub:'No tobacco use ever',val:3},
    ]
  },
  {
    key:'sleep', cat:'😴 Sleep', lbl:'Sleep',
    txt:'How many hours do you typically sleep per night?',
    hint:'Both too little and too much affects disease risk',
    opts:[
      {em:'😫',lbl:'Less than 5 hours',sub:'Severely sleep-deprived, always tired',val:0},
      {em:'😔',lbl:'5–6 hours',sub:'Below the recommended amount',val:1},
      {em:'😊',lbl:'7–8 hours',sub:'Optimal — well rested',val:2},
      {em:'😴',lbl:'More than 8 hours',sub:'Excessive sleep, often groggy',val:3},
    ]
  },
  {
    key:'stress', cat:'🧠 Wellbeing', lbl:'Stress',
    txt:'How stressed do you feel on most days?',
    hint:'Chronic stress significantly raises disease risk',
    opts:[
      {em:'😰',lbl:'Constantly stressed',sub:'Overwhelming daily pressure',val:0},
      {em:'😟',lbl:'Often stressed',sub:'Anxious or tense most of the time',val:1},
      {em:'😐',lbl:'Sometimes stressed',sub:'Manageable, occasional tension',val:2},
      {em:'😌',lbl:'Rarely stressed',sub:'Generally calm and relaxed',val:3},
    ]
  },
  {
    key:'water', cat:'💧 Hydration', lbl:'Water Intake',
    txt:'How much water do you drink daily?',
    hint:'Includes plain water — not sugary drinks or tea/coffee',
    opts:[
      {em:'🏜️',lbl:'Less than 1 litre',sub:'Under-hydrated, rarely drink water',val:0},
      {em:'🥤',lbl:'1–2 litres',sub:'Average hydration',val:1},
      {em:'🌊',lbl:'More than 2 litres',sub:'Well hydrated every day',val:2},
    ]
  },
  {
    key:'fam_dm', cat:'🧬 Family History', lbl:'Diabetes family',
    txt:'Does anyone in your immediate family have diabetes?',
    hint:'Parents, siblings — first-degree relatives',
    opts:[
      {em:'✅',lbl:'No',sub:'No family history of diabetes',val:0},
      {em:'⚠️',lbl:'Yes',sub:'Parent or sibling has diabetes',val:1},
      {em:'🤷',lbl:'Not sure',sub:'Unknown family history',val:-1},
    ]
  },
  {
    key:'fam_cvd', cat:'🧬 Family History', lbl:'Heart / BP family',
    txt:'Does anyone in your family have heart disease or high blood pressure?',
    hint:'Parents, siblings — heart attack, stroke, hypertension',
    opts:[
      {em:'✅',lbl:'No',sub:'No heart or BP family history',val:0},
      {em:'❤️‍🩹',lbl:'Yes',sub:'Family member has heart disease or HTN',val:1},
      {em:'🤷',lbl:'Not sure',sub:'Unknown family history',val:-1},
    ]
  },
  {
    key:'bp', cat:'🩺 Medical (Optional)', lbl:'Blood Pressure',
    txt:'Do you know your blood pressure reading?',
    hint:'Skip if unsure — last reading from a doctor or pharmacy',
    opts:[
      {em:'🟢',lbl:'Normal (below 120/80)',sub:'Healthy blood pressure',val:2},
      {em:'🟡',lbl:'Slightly elevated (120–139/80–89)',sub:'Pre-hypertension range',val:1},
      {em:'🔴',lbl:'High (140+ / 90+)',sub:'Clinically high blood pressure',val:0},
      {em:'❓',lbl:'Skip / Not sure',sub:'Haven\'t measured recently',val:-1},
    ]
  },
  {
    key:'sugar', cat:'🩺 Medical (Optional)', lbl:'Blood Sugar',
    txt:'Do you know your fasting blood sugar level?',
    hint:'From a recent blood test — HbA1c or fasting glucose',
    opts:[
      {em:'🟢',lbl:'Normal (below 100 mg/dL)',sub:'Healthy glucose levels',val:2},
      {em:'🟡',lbl:'Pre-diabetic (100–125 mg/dL)',sub:'Elevated, needs monitoring',val:1},
      {em:'🔴',lbl:'High (126+ mg/dL)',sub:'Diabetic range — confirmed or suspected',val:0},
      {em:'❓',lbl:'Skip / Not sure',sub:'No recent blood test',val:-1},
    ]
  },
  {
    key:'chol', cat:'🩺 Medical (Optional)', lbl:'Cholesterol',
    txt:'Have you ever been told you have high cholesterol?',
    hint:'LDL or total cholesterol — diagnosed by a doctor',
    opts:[
      {em:'✅',lbl:'No',sub:'Normal or good cholesterol levels',val:0},
      {em:'⚠️',lbl:'Yes',sub:'Diagnosed with high cholesterol (dyslipidaemia)',val:1},
      {em:'❓',lbl:'Skip / Not sure',sub:'Never tested or unknown',val:-1},
    ]
  },
];

// ════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════
function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ════════════════════════════════════════════════════
// QUESTIONNAIRE
// ════════════════════════════════════════════════════
function renderQ(i){
  const q = QS[i];
  const pct = Math.round((i/QS.length)*100);
  document.getElementById('prog-fill').style.width = pct+'%';
  document.getElementById('q-counter').textContent = `Question ${i+1} of ${QS.length}`;
  document.getElementById('q-cat-lbl').textContent  = q.lbl;
  document.getElementById('q-cat').textContent = q.cat;
  document.getElementById('q-txt').textContent = q.txt;
  document.getElementById('q-hint').textContent = q.hint;
  document.getElementById('btn-bk').style.visibility = i===0?'hidden':'visible';

  const saved = S.answers[q.key];
  const cont  = document.getElementById('q-opts');
  cont.innerHTML = '';
  const colCount = q.opts.length === 3 ? 3 : 2;
  cont.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
  q.opts.forEach(o=>{
    const b = document.createElement('button');
    b.className = 'opt opt-card'+(saved===o.val?' sel':'');
    b.innerHTML = `<span class="opt-em">${o.em}</span><span class="opt-lbl">${o.lbl}</span>${o.sub?`<span class="opt-sub">${o.sub}</span>`:''}`;
    b.onclick = ()=>pickOpt(q.key,o.val,b);
    cont.appendChild(b);
  });

  const nx = document.getElementById('btn-nx');
  const isLast = i===QS.length-1;
  nx.textContent = isLast?'See Results 🎯':'Next →';
  saved!==undefined ? nx.classList.add('on') : nx.classList.remove('on');

  const card = document.getElementById('q-card');
  card.style.animation='none';
  requestAnimationFrame(()=>{ card.style.animation='slideIn .32s ease'; });
}

function pickOpt(key,val,btn){
  S.answers[key]=val;
  document.querySelectorAll('.opt').forEach(b=>b.classList.remove('sel'));
  btn.classList.add('sel');
  const nx=document.getElementById('btn-nx');
  nx.classList.add('on');
  nx.textContent = S.curQ===QS.length-1?'See Results 🎯':'Next →';
  setTimeout(()=>nextQ(),320);
}

function nextQ(){
  if(S.answers[QS[S.curQ].key]===undefined)return;
  if(S.curQ<QS.length-1){ S.curQ++; renderQ(S.curQ); }
  else submitAnswers();
}
function prevQ(){
  if(S.curQ>0){ S.curQ--; renderQ(S.curQ); }
}

// ════════════════════════════════════════════════════
// SUBMIT
// ════════════════════════════════════════════════════
async function submitAnswers(){
  goTo('sl');
  S.reportId = 'CDP-'+Date.now().toString(36).toUpperCase();
  const payload = { ...S.answers, height_cm:165, weight_kg:70, age:35, sex:0 };
  try{
    const res  = await fetch('/api/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data = await res.json();
    data.reportId = S.reportId;
    S.results = data;
    setTimeout(()=>{ buildDash(data); goTo('sd'); },700);
  }catch(e){
    const demo = buildDemo(payload);
    demo.reportId = S.reportId;
    S.results = demo;
    setTimeout(()=>{ buildDash(demo); goTo('sd'); },1200);
  }
}

function buildDemo(p){
  const dm  = Math.min(95,Math.max(5,20+(p.fam_dm===1?18:0)+(p.exercise<2?10:0)+(p.sugar===0?25:0)));
  const htn = Math.min(95,Math.max(5,18+(p.stress<1?15:0)+(p.smoke<2?10:0)+(p.bp===0?25:0)));
  const cvd = Math.min(95,Math.max(5,15+(p.chol===1?20:0)+(p.smoke<1?15:0)+(p.fam_cvd===1?12:0)));
  const risks={
    "Diabetes Mellitus":{current:dm,improved:Math.max(dm-22,5),worsened:Math.min(dm+20,95)},
    "Hypertension":{current:htn,improved:Math.max(htn-20,5),worsened:Math.min(htn+22,95)},
    "Cardiovascular Disease":{current:cvd,improved:Math.max(cvd-18,5),worsened:Math.min(cvd+20,95)},
  };
  const highest=Object.keys(risks).reduce((a,b)=>risks[a].current>risks[b].current?a:b);
  return{risks,highest,bmi:25,generated_at:new Date().toLocaleString(),
    disease_info:DI[highest],all_info:DI};
}

// ════════════════════════════════════════════════════
// DISEASE INFO
// ════════════════════════════════════════════════════
const DI = {
  "Diabetes Mellitus":{
    icon:"🩸",color:"#f59e0b",
    description:"Diabetes is a chronic condition affecting blood sugar regulation. Type 2 is largely preventable through lifestyle.",
    key_factors:["High blood sugar","BMI over 25","Family history","Sedentary lifestyle","Poor diet"],
    exercise:[{icon:"🚶",title:"Daily Walks",desc:"30 min brisk walking improves insulin sensitivity by 35%"},{icon:"🏊",title:"Swimming",desc:"Low-impact cardio 3×/week — ideal for blood sugar"},{icon:"🏋️",title:"Resistance Training",desc:"Weights 2×/week — muscle absorbs glucose naturally"}],
    diet:[{icon:"🥦",title:"Low-GI Foods",desc:"Whole grains & legumes over refined carbs"},{icon:"🚫",title:"Avoid Sugar",desc:"Cut sugary drinks — #1 preventable factor"},{icon:"🫐",title:"Antioxidants",desc:"Berries, nuts reduce insulin resistance"}],
    lifestyle:[{icon:"⚖️",title:"Lose 5–7% Weight",desc:"Reduces diabetes risk by 58%"},{icon:"😴",title:"Sleep 7–8 hrs",desc:"Poor sleep raises blood sugar"},{icon:"🧘",title:"Manage Stress",desc:"Cortisol spikes blood sugar"}],
    sources:[{name:"American Diabetes Association",url:"https://diabetes.org"},{name:"WHO — Diabetes",url:"https://www.who.int/health-topics/diabetes"},{name:"CDC Prevention",url:"https://www.cdc.gov/diabetes/prevention"}]
  },
  "Hypertension":{
    icon:"💓",color:"#ef4444",
    description:"Hypertension — the silent killer — rarely has symptoms but greatly raises stroke and heart attack risk.",
    key_factors:["High sodium","Stress","Obesity","Sedentary lifestyle","Smoking"],
    exercise:[{icon:"🚴",title:"Cycling",desc:"5×/week lowers systolic BP by 4–9 mmHg"},{icon:"🏃",title:"Aerobic Cardio",desc:"20–30 min most days"},{icon:"🧘",title:"Yoga",desc:"Reduces both BP values"}],
    diet:[{icon:"🧂",title:"Reduce Sodium",desc:"Under 1500mg/day — avoid packaged foods"},{icon:"🍌",title:"DASH Diet",desc:"Fruits, veggies, low-fat dairy"},{icon:"🫀",title:"Omega-3",desc:"Fatty fish & walnuts reduce stiffness"}],
    lifestyle:[{icon:"🚬",title:"Quit Smoking",desc:"Effects visible within 48 hours"},{icon:"🍷",title:"Limit Alcohol",desc:"Max 1–2 drinks/day"},{icon:"🎵",title:"Relaxation",desc:"Deep breathing lowers BP"}],
    sources:[{name:"American Heart Association",url:"https://www.heart.org"},{name:"WHO — Hypertension",url:"https://www.who.int/health-topics/hypertension"},{name:"Mayo Clinic",url:"https://www.mayoclinic.org/diseases-conditions/high-blood-pressure"}]
  },
  "Cardiovascular Disease":{
    icon:"❤️",color:"#ec4899",
    description:"CVD is the #1 global cause of death — yet largely preventable through lifestyle changes.",
    key_factors:["High cholesterol","Hypertension","Smoking","Diabetes Mellitus","Family history"],
    exercise:[{icon:"🏃",title:"Cardio 150 min/wk",desc:"Reduces CVD risk by 35%"},{icon:"🚵",title:"HIIT",desc:"Short bursts improve heart efficiency"},{icon:"🤸",title:"Flexibility",desc:"Improves blood vessel health"}],
    diet:[{icon:"🫒",title:"Mediterranean Diet",desc:"Gold standard for heart health"},{icon:"🥑",title:"Healthy Fats",desc:"Avocados, nuts, seeds"},{icon:"🍓",title:"Plant Foods",desc:"5+ servings/day cuts risk 20%"}],
    lifestyle:[{icon:"🚭",title:"Stop Smoking",desc:"Halves CVD risk in 1 year"},{icon:"🏥",title:"Annual Checkups",desc:"Monitor cholesterol & BP"},{icon:"😊",title:"Social Bonds",desc:"Reduces mortality by 29%"}],
    sources:[{name:"American Heart Association",url:"https://www.heart.org"},{name:"WHO — CVD",url:"https://www.who.int/health-topics/cardiovascular-diseases"},{name:"European Heart Journal",url:"https://academic.oup.com/eurheartj"}]
  }
};

// ════════════════════════════════════════════════════
// BUILD DASHBOARD
// ════════════════════════════════════════════════════
const COLORS={'Diabetes Mellitus':'#f59e0b','Hypertension':'#ef4444','Cardiovascular Disease':'#ec4899'};
function lvl(p){return p<30?'Low Risk':p<60?'Moderate':'High Risk';}
function bc(p){return p<30?'b-low':p<60?'b-mod':'b-high';}

let donutChart=null, barChart=null;

// Slider label maps
const SL_LABELS = {
  exercise: ['🛋️ Never','🚶 1–2 days/wk','🏃 3–4 days/wk','🏋️ 5+ days/wk'],
  smoke:    ['🚬 Daily','💨 Occasionally','🕊️ Ex-smoker','🚭 Never'],
  sleep:    ['😫 <5 hrs','😔 5–6 hrs','😊 7–8 hrs','😴 >8 hrs'],
  diet:     ['🍔 Junk food','🍱 Mixed','🥘 Home-cooked','🥗 Very healthy'],
  stress:   ['😰 Constant','😟 Often','😐 Sometimes','😌 Rarely'],
};
function slLabel(key,val){
  const labels=SL_LABELS[key]; if(!labels)return val;
  return labels[Math.round(Math.max(0,Math.min(val,labels.length-1)))]||val;
}

// Update slider gradient fill
function updateSliderFill(el){
  const min=parseFloat(el.min)||0, max=parseFloat(el.max)||3;
  const pct=((el.value-min)/(max-min))*100;
  el.style.background=`linear-gradient(to right, var(--green) ${pct}%, var(--green-mid) ${pct}%)`;
}

function buildDash(d){
  const dash=document.getElementById('dash');
  const hi=d.highest, hiR=d.risks[hi];
  const info=d.all_info?d.all_info[hi]:DI[hi];
  const bmi=parseFloat(d.bmi||25);
  const bmiLbl=bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
  S.simAnswers = { ...S.answers };

  // ── ID Strip
  let html=`
  <div class="id-strip ani">
    <div class="id-left">
      <h2>Assessment Complete ✓</h2>
      <p>Report ID: <strong>${d.reportId||S.reportId}</strong> · ${d.generated_at}</p>
    </div>
    <div class="id-right">
      <div><div class="id-stat-v">${bmi.toFixed(1)}</div><div class="id-stat-l">BMI · ${bmiLbl}</div></div>
      <div><div class="id-stat-v">${hi.split(' ')[0]}</div><div class="id-stat-l">Highest Risk</div></div>
    </div>
  </div>

  <!-- Risk overview cards -->
  <div class="sec">📊 Risk Overview</div>
  <div class="risk-row ani">`;

  Object.entries(d.risks).forEach(([disease,r])=>{
    const col=COLORS[disease];
    const isHi=disease===hi;
    html+=`<div class="rc${isHi?' highest':''}">
      <div class="rc-accent" style="background:${col}"></div>
      <div class="rc-icon">${DI[disease]?.icon||'🧬'}</div>
      <div class="rc-name">${disease}</div>
      <div class="rc-pct" style="color:${col}">${r.current}%</div>
      <span class="rc-badge ${bc(r.current)}">${lvl(r.current)}</span>
      ${isHi?'<div style="margin-top:.5rem;font-size:.68rem;color:var(--green);font-weight:600">⚡ Highest — see advice below</div>':''}
    </div>`;
  });

  html+=`</div>

  <!-- ── DONUT — big, centred ── -->
  <div class="sec">🍩 Risk Profile</div>
  <div class="donut-card ani">
    <div class="donut-card-title">Disease risk breakdown</div>
    <div class="donut-inner">
      <div class="donut-wrap">
        <canvas id="donut-cv" width="340" height="340"></canvas>
      </div>
      <div class="donut-legend">`;

  Object.entries(d.risks).forEach(([disease,r])=>{
    html+=`<div class="dl-item">
      <div class="dl-left"><div class="dl-dot" style="background:${COLORS[disease]}"></div>${disease}</div>
      <div class="dl-val" style="color:${COLORS[disease]}">${r.current}%</div>
    </div>`;
  });

  html+=`</div>
    </div>
  </div>

  <!-- ── BAR CHART SCENARIOS — immediately after donut ── -->
  <div class="sec">📊 Risk Scenarios</div>
  <div class="scenarios-card ani">
    <div class="scenarios-title">Your Risk — 3 Scenarios Compared</div>
    <div class="scenarios-sub">Each disease is shown with 3 bars: <strong style="color:#00956A">■ Current Risk</strong> — your score based on the answers you gave today &nbsp;|&nbsp; <strong style="color:#00956A">■ If Improved</strong> — projected score if you adopt healthier habits (more exercise, better diet, less stress) &nbsp;|&nbsp; <strong style="color:#D94040">■ If Worsened</strong> — projected score if current habits decline. All values are ML model predictions (0–100%).</div>
    <div class="bar-canvas-wrap"><canvas id="bar-cv"></canvas></div>
  </div>

  <!-- ── LIFESTYLE SIMULATION — follows scenarios ── -->
  <div class="sec">🎯 Lifestyle Adjustments</div>
  <div class="sim-card ani">
    <div class="sim-header">
      <h4>Lifestyle Impact Simulator</h4>
      <p>Drag the sliders to see how changes affect your <strong>${hi}</strong> risk in real time.</p>
    </div>
    <div class="sim-body">
      <div class="sim-sliders">`;

  // Slider builder helper
  const sliders = [
    {id:'ex', key:'exercise', emoji:'🏃', title:'Physical Activity', ticks:['Never','1–2/wk','3–4/wk','5+/wk'], max:3},
    {id:'sm', key:'smoke',    emoji:'🚬', title:'Smoking',          ticks:['Daily','Occas.','Ex','Never'], max:3},
    {id:'sl', key:'sleep',    emoji:'😴', title:'Sleep Quality',    ticks:['<5 hrs','5–6 hrs','7–8 hrs','>8 hrs'], max:3},
    {id:'dt', key:'diet',     emoji:'🍽️', title:'Diet Quality',     ticks:['Junk','Mixed','Home-cooked','Healthy'], max:3},
    {id:'st', key:'stress',   emoji:'🧘', title:'Stress Level',     ticks:['High','Often','Sometimes','Low'], max:3},
  ];

  sliders.forEach(sl=>{
    const defaultVal = S.simAnswers[sl.key]??1;
    html+=`
      <div class="sl-group">
        <div class="sl-header">
          <span class="sl-emoji">${sl.emoji}</span>
          <span class="sl-title">${sl.title}</span>
          <div class="sl-value-badge"><span id="sv-${sl.id}">${slLabel(sl.key,defaultVal)}</span></div>
        </div>
        <input type="range" min="0" max="${sl.max}" step="1" value="${defaultVal}" id="sl-${sl.id}" oninput="updateSim();updateSliderFill(this)"/>
        <div class="sl-ticks">
          ${sl.ticks.map(t=>`<span class="sl-tick">${t}</span>`).join('')}
        </div>
      </div>`;
  });

  html+=`</div>

      <!-- Projected risk bars -->
      <div class="sim-result" id="sim-result">
        <div class="sr-title">Projected Risk with Current Slider Settings</div>
        <div class="sr-bars">`;

  Object.entries(d.risks).forEach(([disease,r])=>{
    html+=`<div class="sr-bar-row">
      <div class="sr-bar-lbl" style="color:${COLORS[disease]}">${disease.replace('Cardiovascular Disease','CVD')}</div>
      <div class="sr-bar-track"><div class="sr-bar-fill" id="sim-bar-${disease.replace(/\s/g,'-')}" style="background:${COLORS[disease]};width:0%"></div></div>
      <div class="sr-bar-pct" id="sim-pct-${disease.replace(/\s/g,'-')}" style="color:${COLORS[disease]}">—</div>
    </div>`;
  });

  html+=`</div>
        <div class="sim-msg" id="sim-msg">💡 Adjust the sliders above to simulate your future risk.</div>
      </div>
    </div>
  </div>

  <!-- Advice -->
  <div class="sec">💡 Advice for ${hi}</div>
  <div class="advice-grid ani">
    <div class="adv-card"><div class="adv-sec-title">🏃 Exercise Plan</div>`;
  (info?.exercise||[]).forEach(e=>{
    html+=`<div class="adv-item"><div class="adv-em">${e.icon}</div><div><div class="adv-title">${e.title}</div><div class="adv-desc">${e.desc}</div></div></div>`;
  });
  html+=`</div><div class="adv-card"><div class="adv-sec-title">🍽️ Diet Tips</div>`;
  (info?.diet||[]).forEach(e=>{
    html+=`<div class="adv-item"><div class="adv-em">${e.icon}</div><div><div class="adv-title">${e.title}</div><div class="adv-desc">${e.desc}</div></div></div>`;
  });
  html+=`</div><div class="adv-card"><div class="adv-sec-title">🌿 Lifestyle</div>`;
  (info?.lifestyle||[]).forEach(e=>{
    html+=`<div class="adv-item"><div class="adv-em">${e.icon}</div><div><div class="adv-title">${e.title}</div><div class="adv-desc">${e.desc}</div></div></div>`;
  });
  html+=`</div></div>

  <!-- Sources -->
  <div class="sec">📚 Trusted Sources</div>
  <div class="sources-grid ani">`;
  (info?.sources||[]).forEach(s=>{
    html+=`<a class="src-card" href="${s.url}" target="_blank">
      <div class="src-ico">🔗</div>
      <div><div class="src-name">${s.name}</div><div class="src-url">${s.url.replace('https://','')}</div></div>
    </a>`;
  });
  html+=`</div>

  <!-- Care Compass -->
  <div class="sec">🧭 Care Compass</div>
  <div class="compass-grid ani">
    <div class="compass-card">
      <div class="compass-ico" style="background:rgba(217,64,64,.1)">🗺️</div>
      <div><div class="compass-name">Hospitals Near You</div><div class="compass-type">Search hospitals, clinics &amp; specialists</div><a class="compass-link" href="https://www.google.com/maps/search/hospital+near+me" target="_blank">Open Maps →</a></div>
    </div>
    <div class="compass-card">
      <div class="compass-ico" style="background:rgba(46,118,196,.1)">🩺</div>
      <div><div class="compass-name">Book a Doctor</div><div class="compass-type">Specialist for ${hi.split(' ')[0]}</div><a class="compass-link" href="https://www.practo.com" target="_blank">Practo →</a></div>
    </div>
    <div class="compass-card">
      <div class="compass-ico" style="background:rgba(196,127,0,.1)">🧪</div>
      <div><div class="compass-name">Lab Tests</div><div class="compass-type">HbA1c · Lipid Panel · BP Monitoring</div><a class="compass-link" href="https://www.thyrocare.com" target="_blank">Thyrocare →</a></div>
    </div>
    <div class="compass-card">
      <div class="compass-ico" style="background:rgba(0,149,106,.1)">📱</div>
      <div><div class="compass-name">Health Tracker</div><div class="compass-type">Track vitals, diet &amp; medication daily</div><a class="compass-link" href="https://www.healthifyme.com" target="_blank">HealthifyMe →</a></div>
    </div>
  </div>

  <!-- Report CTA -->
  <div class="report-cta ani">
    <div class="rct-text">
      <h3>📄 Generate Your Report</h3>
      <p>Download your PDF report with a QR code for easy phone access.</p>
    </div>
    <div class="rct-btns">
      <button class="btn-gen" onclick="generateReport(event)">📱 Generate QR</button>
      <button class="btn-gen-sec" onclick="quickDownload(event)">💾 Quick Download</button>
    </div>
  </div>`;

  dash.innerHTML = html;

  // Init sliders
  document.querySelectorAll('input[type=range]').forEach(el=>updateSliderFill(el));

  setTimeout(()=>{
    buildDonut(d);
    buildBar(d);
    updateSim();
    setTimeout(()=>updateSim(),400);
  },200);
}

// ════════════════════════════════════════════════════
// SLIDER UPDATE
// ════════════════════════════════════════════════════
function updateSim(){
  const ex = parseInt(document.getElementById('sl-ex')?.value??1);
  const sm = parseInt(document.getElementById('sl-sm')?.value??2);
  const sl = parseInt(document.getElementById('sl-sl')?.value??2);
  const dt = parseInt(document.getElementById('sl-dt')?.value??1);
  const st = parseInt(document.getElementById('sl-st')?.value??1);

  const svEx=document.getElementById('sv-ex'); if(svEx) svEx.textContent=SL_LABELS.exercise[ex];
  const svSm=document.getElementById('sv-sm'); if(svSm) svSm.textContent=SL_LABELS.smoke[sm];
  const svSl=document.getElementById('sv-sl'); if(svSl) svSl.textContent=SL_LABELS.sleep[sl];
  const svDt=document.getElementById('sv-dt'); if(svDt) svDt.textContent=SL_LABELS.diet[dt];
  const svSt=document.getElementById('sv-st'); if(svSt) svSt.textContent=SL_LABELS.stress[st];

  if(!S.results)return;
  const d = S.results;
  const baseScore = ex + sm + sl + dt + st;
  const origScore = (S.simAnswers.exercise??1)+(S.simAnswers.smoke??2)+(S.simAnswers.sleep??2)+(S.simAnswers.diet??1)+(S.simAnswers.stress??1);
  const delta = (baseScore - origScore) / 15;

  Object.entries(d.risks).forEach(([disease,r])=>{
    const proj = Math.min(95, Math.max(5, Math.round(r.current - delta*r.current*0.55)));
    const id   = disease.replace(/\s/g,'-');
    const barEl= document.getElementById('sim-bar-'+id);
    const pctEl= document.getElementById('sim-pct-'+id);
    if(barEl) barEl.style.width = proj+'%';
    if(pctEl) pctEl.textContent = proj+'%';
  });

  const msg = document.getElementById('sim-msg');
  if(!msg)return;
  const hiR   = d.risks[d.highest];
  const hiProj= Math.min(95,Math.max(5,Math.round(hiR.current - delta*hiR.current*0.55)));
  const diff  = hiR.current - hiProj;
  if(diff>2){
    msg.innerHTML=`💡 With these improvements, your <strong>${d.highest}</strong> risk could drop from <strong>${hiR.current}%</strong> to <strong style="color:var(--green)">${hiProj}%</strong> — a <strong>${diff}%</strong> reduction.`;
  } else if(diff<-2){
    msg.innerHTML=`⚠️ These choices could <strong>increase</strong> your ${d.highest} risk from ${hiR.current}% to <strong style="color:#D94040">${hiProj}%</strong>.`;
  } else {
    msg.innerHTML=`📊 Risk stays around <strong>${hiProj}%</strong> with these settings — try bigger changes to see impact.`;
  }
}

// ════════════════════════════════════════════════════
// CHARTS
// ════════════════════════════════════════════════════
function buildDonut(d){
  const ctx = document.getElementById('donut-cv');
  if(!ctx)return;
  if(donutChart){donutChart.destroy();donutChart=null;}
  const diseaseNames = Object.keys(d.risks);
  const colors = diseaseNames.map(disease => COLORS[disease]);
  donutChart = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:diseaseNames,
      datasets:[{
        data:Object.values(d.risks).map(r=>r.current),
        backgroundColor:colors,
        borderWidth:6,
        borderColor:'white',
        hoverOffset:10
      }]
    },
    options:{
      cutout:'65%',
      plugins:{
        legend:{display:false},
        tooltip:{
          callbacks:{
            label:c=>{
              const color = Array.isArray(c.dataset.backgroundColor) ? c.dataset.backgroundColor[c.dataIndex] : c.dataset.backgroundColor;
              return `${c.label}: ${c.raw}%`;
            }
          },
          backgroundColor:'rgba(0,0,0,0.85)',
          padding:10,
          titleColor:'#fff',
          bodyColor:'#fff',
          borderColor:'#fff',
          borderWidth:1
        }
      },
      animation:{duration:1000,easing:'easeInOutQuart'}
    }
  });
}

function buildBar(d){
  const ctx = document.getElementById('bar-cv');
  if(!ctx)return;
  if(barChart){barChart.destroy();barChart=null;}

  // Labels use shortened disease names
  const labels = Object.keys(d.risks);
  // Datasets — current per-disease color, improved=green, worsened=red
  const current  = Object.values(d.risks).map(r=>r.current);
  const improved = Object.values(d.risks).map(r=>r.improved);
  const worsened = Object.values(d.risks).map(r=>r.worsened);
  
  // Convert hex colors to RGBA for current risk bars
  const currentColors = labels.map(disease => {
    const hex = COLORS[disease].substring(1);
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    return `rgba(${r},${g},${b},.85)`;
  });


  barChart = new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[
        {
          label:'Current Risk',
          data:current,
          backgroundColor:currentColors,
          borderRadius:6,
          borderSkipped:false,
        },
        {
          label:'If Improved',
          data:improved,
          backgroundColor:'rgba(0,149,106,.7)',
          borderRadius:6,
          borderSkipped:false,
        },
        {
          label:'If Worsened',
          data:worsened,
          backgroundColor:'rgba(217,64,64,.35)',
          borderRadius:6,
          borderSkipped:false,
        },
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{
        y:{
          beginAtZero:true,
          max:100,
          grid:{color:'rgba(0,149,106,.05)'},
          ticks:{callback:v=>v+'%',font:{size:13,family:'DM Sans'}},
          border:{display:false}
        },
        x:{
          grid:{display:false},
          ticks:{font:{size:13,family:'DM Sans'}},
          border:{display:false}
        }
      },
      plugins:{
        legend:{
          position:'bottom',
          labels:{
            font:{size:13,family:'DM Sans'},
            padding:20,
            usePointStyle:true,
            pointStyle:'circle'
          }
        },
        tooltip:{
          callbacks:{label:c=>`${c.dataset.label}: ${c.raw}%`}
        }
      },
      animation:{duration:900}
    }
  });
}

// ════════════════════════════════════════════════════
// PDF BUILD
// ════════════════════════════════════════════════════
function buildPDF(){
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF('p','mm','a4');
  const d   = S.results;
  const W=210, M=16, cw=W-M*2;
  let y=M;

  doc.setFillColor(0,149,106); doc.rect(0,0,210,32,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(17); doc.setFont('helvetica','bold');
  doc.text('Chronic Disease Predictor — Risk Report', M, 16);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text(`Report ID: ${d.reportId||S.reportId}  ·  ${d.generated_at}  ·  AI-powered assessment`, M, 27);
  y = 42;

  doc.setFillColor(230,250,248); doc.setDrawColor(0,149,106);
  doc.roundedRect(M,y,cw,14,3,3,'FD');
  doc.setTextColor(0,117,84); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text(`Report ID: ${d.reportId||S.reportId}`, M+4, y+6);
  doc.setFont('helvetica','normal'); doc.setTextColor(74,80,106);
  doc.text('Anonymous assessment — no personal information stored.', M+4, y+11);
  y += 22;

  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(15,17,23);
  doc.text('Risk Assessment Results', M, y); y+=5;
  doc.setLineWidth(.3); doc.setDrawColor(200,204,220); doc.line(M,y,W-M,y); y+=7;
  const RC={'Diabetes Mellitus':[245,158,11],'Hypertension':[239,68,68],'Cardiovascular Disease':[236,72,153]};
  Object.entries(d.risks).forEach(([dis,r])=>{
    const col=RC[dis], lv=r.current<30?'Low':r.current<60?'Moderate':'High';
    doc.setFillColor(...col); doc.roundedRect(M,y,3,10,1,1,'F');
    doc.setTextColor(15,17,23); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(dis, M+7, y+7);
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(74,80,106);
    doc.text(`Current: ${r.current}% (${lv})  |  If improved: ${r.improved}%  |  If worsened: ${r.worsened}%`, M+7, y+13);
    y+=19;
  });
  y+=4;

  const info = d.disease_info||(d.all_info&&d.all_info[d.highest])||DI[d.highest];
  doc.setFillColor(230,250,248); doc.setDrawColor(0,149,106);
  doc.roundedRect(M,y,cw,8,2,2,'FD');
  doc.setTextColor(0,117,84); doc.setFontSize(10); doc.setFont('helvetica','bold');
  doc.text(`Personalised Advice — ${d.highest}`, M+4, y+5.5); y+=14;
  ['exercise','diet','lifestyle'].forEach(sec=>{
    const titles={exercise:'Exercise Plan',diet:'Diet Tips',lifestyle:'Lifestyle Improvements'};
    doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(15,17,23);
    doc.text(titles[sec], M, y); y+=5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(74,80,106);
    (info?.[sec]||[]).forEach(e=>{
      const lines=doc.splitTextToSize(`• ${e.title}: ${e.desc}`,cw);
      doc.text(lines,M,y); y+=lines.length*3.8+1;
    });
    y+=3;
  });

  doc.setFillColor(0,149,106); doc.rect(0,284,210,13,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(7.5);
  doc.text('Chronic Disease Predictor · AI-powered · For informational purposes only — always consult a doctor', M, 291);

  pdfDataUrl = doc.output('datauristring');
  return pdfDataUrl;
}

// ════════════════════════════════════════════════════
// TUNNEL STATUS
// ════════════════════════════════════════════════════
let _tunnelMode = 'unknown';
async function checkTunnelStatus() {
  try {
    const res  = await fetch('/api/tunnel-status');
    const data = await res.json();
    _tunnelMode = data.mode;
  } catch(e) {
    _tunnelMode = 'lan';
  }
}

// ════════════════════════════════════════════════════
// QR
// ════════════════════════════════════════════════════
function renderQR(url) {
  const el = document.getElementById('qr-el');
  el.innerHTML = '';
  try {
    new QRCode(el, {
      text:         url,
      width:        190,
      height:       190,
      colorDark:   '#0f1117',
      colorLight:  '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {
    el.innerHTML = '<p style="color:var(--text3);font-size:.8rem;padding:1rem 0">QR unavailable — use download button below.</p>';
  }
}

// ════════════════════════════════════════════════════
// REPORT GENERATION
// ════════════════════════════════════════════════════
async function generateReport(event) {
  if (!S.results) { alert('Please complete the assessment first.'); return; }
  const btn = event?.currentTarget || event?.target;
  if (btn) { btn.textContent = '⏳ Building…'; btn.disabled = true; }

  const modal = document.getElementById('qr-modal');
  modal.classList.add('open');
  document.getElementById('qr-generating').style.display = 'block';
  document.getElementById('qr-ready').style.display      = 'none';
  document.getElementById('qr-warn').style.display       = 'none';
  document.getElementById('qr-error-box').style.display  = 'none';
  document.getElementById('qr-gen-msg').textContent      = 'Building PDF…';

  try {
    const rid = S.results.reportId || S.reportId || Date.now().toString(36).toUpperCase();
    try { buildPDF(); } catch(pdfErr) { throw new Error('PDF build failed: ' + pdfErr.message); }

    document.getElementById('qr-gen-msg').textContent = 'Saving & generating link…';
    let result = null, warnMsg = null;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch('/api/upload-report', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ report_id: rid, pdf_base64: pdfDataUrl }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Server error ${res.status}`);
      result = json;
      if (result.mode === 'lan') {
        warnMsg = '⚠️ Cloudflare tunnel not running — QR only works on the same Wi-Fi.\nPlace cloudflared.exe next to app.py and restart for cross-network QR.';
      }
    } catch(fetchErr) {
      const isAbort = fetchErr.name === 'AbortError';
      const errMsg  = isAbort ? 'Request timed out. Make sure python app.py is running.' : fetchErr.message;
      document.getElementById('qr-generating').style.display = 'none';
      document.getElementById('qr-ready').style.display      = 'block';
      document.getElementById('qr-error-box').style.display  = 'block';
      document.getElementById('qr-error-box').textContent    = '❌ ' + errMsg;
      const badge = document.getElementById('qr-mode-badge');
      badge.className = 'qr-status local';
      badge.textContent = '⚠️ Link generation failed — use download below';
      document.getElementById('qr-el').innerHTML = '';
      document.getElementById('qr-id').textContent = 'Report ID: ' + rid;
      return;
    }

    document.getElementById('qr-generating').style.display = 'none';
    document.getElementById('qr-ready').style.display      = 'block';
    document.getElementById('qr-id').textContent           = 'Report ID: ' + rid;
    const badge = document.getElementById('qr-mode-badge');
    const steps = document.getElementById('qr-steps');
    if (result.mode === 'tunnel') {
      badge.className = 'qr-status drive';
      badge.textContent = '🌐 Works on any network — scan from anywhere';
      steps.innerHTML = `
        <div class="qr-step"><div class="qr-step-n">1</div><span>Open your phone camera and point at the QR</span></div>
        <div class="qr-step"><div class="qr-step-n">2</div><span>Tap the notification — PDF downloads instantly</span></div>
        <div class="qr-step"><div class="qr-step-n">3</div><span>Works on mobile data, any Wi-Fi, any network</span></div>`;
    } else {
      badge.className = 'qr-status local';
      badge.textContent = '📶 Same Wi-Fi only — phone must be on this network';
      steps.innerHTML = `
        <div class="qr-step"><div class="qr-step-n">1</div><span>Make sure phone is on same Wi-Fi as this device</span></div>
        <div class="qr-step"><div class="qr-step-n">2</div><span>Point phone camera at the QR code</span></div>
        <div class="qr-step"><div class="qr-step-n">3</div><span>Tap the link to download the PDF</span></div>`;
    }
    renderQR(result.download_url);
    if (warnMsg) {
      document.getElementById('qr-warn').style.display = 'block';
      document.getElementById('qr-warn').textContent   = warnMsg;
    }
  } catch(err) {
    console.error('generateReport error:', err);
    document.getElementById('qr-generating').style.display = 'none';
    document.getElementById('qr-ready').style.display      = 'block';
    document.getElementById('qr-error-box').style.display  = 'block';
    document.getElementById('qr-error-box').textContent    = '❌ ' + err.message;
  } finally {
    if (btn) { btn.textContent = '📱 Generate QR'; btn.disabled = false; }
  }
}

function quickDownload(event){
  if(!S.results){alert('Please complete the assessment first.');return;}
  const btn = event?.currentTarget || event?.target;
  if(btn){btn.textContent='⏳ Building…'; btn.disabled=true;}
  try{ buildPDF(); downloadPDF(); }
  finally{ if(btn){btn.textContent='💾 Quick Download'; btn.disabled=false;} }
}

function downloadPDF(){
  if(!pdfDataUrl){
    if(!S.results){alert('Complete the assessment first.');return;}
    buildPDF();
  }
  const fileName = `Health_Report_${S.reportId||Date.now()}.pdf`;
  try {
    const arr = pdfDataUrl.split(',');
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    const blob = new Blob([u8arr], { type: 'application/pdf' });
    downloadViaLink(blob, fileName);
  } catch(e) {
    console.error('Download error:', e);
    alert('Download failed. Please try again.');
  }
}

function downloadViaLink(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl; link.download = fileName;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}

function closeQR(){
  document.getElementById('qr-modal').classList.remove('open');
}
document.getElementById('qr-modal').addEventListener('click',function(e){if(e.target===this)closeQR();});

// Wrap goTo for tunnel check
const _origGoTo = goTo;
window.goTo = function(id){
  _origGoTo(id);
  if(id === 'sd') checkTunnelStatus();
};

// ── INIT ──
renderQ(0);
window.goTo('sw');
