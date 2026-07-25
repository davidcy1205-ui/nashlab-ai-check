(function(){
  "use strict";
  const $=(s,el=document)=>el.querySelector(s);
  const nf=new Intl.NumberFormat('en-US');
  const fmt={
    money:v=>nf.format(Math.round(v))+' NTD', pct:v=>(v*100).toFixed(1)+'%',
    ratio:v=>v.toFixed(2)+' 倍', months:v=>v.toFixed(1)+' 個月',
    hours:v=>Math.round(v)+' 小時', yuan:v=>v.toFixed(2)+' 元'
  };
  const parse=s=>{const n=parseFloat(String(s).replace(/[^0-9.\-]/g,''));return isNaN(n)?0:n;};
  const word=s=>({good:"優秀",warn:"注意",danger:"危險"}[s]);

  const CALCS=[
    {num:1,title:"導入 ROI",tag:"這套 AI 多久幫你賺回來？",
     inputs:[{key:"cost",label:"導入總成本（自付＋補助）",def:300000,unit:"NTD",money:true},
             {key:"save",label:"每月省下人力／時間成本",def:40000,unit:"NTD",money:true}],
     target:"目標　首年 ROI ＞ 0",
     compute(v){ if(v.cost<=0)return null;
       const roi=(v.save*12-v.cost)/v.cost, back=v.save*12/v.cost;
       return{main:{label:"首年 ROI",value:fmt.pct(roi)},
         sub:[["每 1 元投入帶回",fmt.yuan(back)],["一年省下",fmt.money(v.save*12)]],
         chip:fmt.pct(roi), status:roi>=0.2?"good":(roi>=0?"warn":"danger")};}},
    {num:2,title:"補助槓桿",tag:"1 元自付撬動多少補助？",
     inputs:[{key:"total",label:"專案總金額",def:500000,unit:"NTD",money:true},
             {key:"grant",label:"政府補助金額",def:300000,unit:"NTD",money:true}],
     target:"目標　補助覆蓋率 ＞ 50%",
     compute(v){ const self=v.total-v.grant; if(v.total<=0||self<=0)return null;
       const lever=v.grant/self, cover=v.grant/v.total;
       return{main:{label:"補助槓桿比",value:fmt.ratio(lever)},
         sub:[["補助覆蓋率",fmt.pct(cover)],["你的自付額",fmt.money(self)]],
         chip:fmt.ratio(lever), status:cover>=0.5?"good":(cover>=0.3?"warn":"danger")};}},
    {num:3,title:"採用率",tag:"導入 ≠ 使用，補助結束還有人用嗎？",
     inputs:[{key:"need",label:"應使用人數",def:20,unit:"人"},
             {key:"use",label:"每週實際使用人數",def:6,unit:"人"}],
     target:"目標　採用率 ＞ 70%",
     compute(v){ if(v.need<=0)return null; const rate=v.use/v.need;
       return{main:{label:"目前採用率",value:fmt.pct(rate)},
         sub:[["實際 / 應使用",Math.round(v.use)+" / "+Math.round(v.need)+" 人"]],
         chip:fmt.pct(rate), status:rate>=0.7?"good":(rate>=0.4?"warn":"danger")};}},
    {num:4,title:"回本月數",tag:"單一流程幾個月打平？",
     inputs:[{key:"icost",label:"該流程導入成本",def:120000,unit:"NTD",money:true},
             {key:"msave",label:"每月省下成本",def:30000,unit:"NTD",money:true}],
     target:"目標　＜ 12 個月",
     compute(v){ if(v.msave<=0)return null; const m=v.icost/v.msave;
       return{main:{label:"回本月數",value:fmt.months(m)},
         sub:[["一年省下",fmt.money(v.msave*12)]],
         chip:fmt.months(m), status:m<=12?"good":(m<=24?"warn":"danger")};}},
    {num:5,title:"時間成本",tag:"AI 省下的時間，換算成錢是多少？",
     inputs:[{key:"hb",label:"導入前每月工時",def:80,unit:"小時"},
             {key:"ha",label:"導入後每月工時",def:40,unit:"小時"},
             {key:"wage",label:"你的時薪（估）",def:1500,unit:"NTD",money:true}],
     target:"目標　省下工時 ＞ 0、時薪逐月變高",
     compute(v){ const saveh=v.hb-v.ha, val=saveh*v.wage;
       return{main:{label:"每月省回時間價值",value:fmt.money(val)},
         sub:[["每月省下工時",fmt.hours(saveh)],["一年省回",fmt.money(val*12)]],
         chip:fmt.money(val), status:saveh>0?"good":"warn"};}}
  ];

  const grid=$("#grid"), summary=$("#summary");
  CALCS.forEach((c,i)=>{
    const chip=document.createElement('div'); chip.className='schip';
    chip.innerHTML=`<span class="dot" data-dot="${i}"></span>
      <span class="val" data-chip="${i}">—</span><span class="lbl">${c.title}</span>`;
    summary.appendChild(chip);

    const card=document.createElement('div'); card.className='card'; card.dataset.card=i;
    let f='';
    c.inputs.forEach(inp=>{ f+=`<div class="field"><label for="f${i}_${inp.key}">${inp.label}</label>
      <span class="in"><input id="f${i}_${inp.key}" data-c="${i}" data-k="${inp.key}"
        data-money="${inp.money?1:0}" inputmode="numeric" value="${inp.def}">
        <span class="unit">${inp.unit}</span></span></div>`; });
    card.innerHTML=`<div class="card-h"><span class="numchip">${c.num}</span>
        <div><h2>${c.title}</h2><div class="tag">${c.tag}</div></div></div>
      <div class="fields">${f}</div>
      <div class="result"><div class="rlead">計算結果</div>
        <div class="rmain"><span class="rl" data-rl="${i}"></span><span class="rv" data-rv="${i}"></span></div>
        <div class="rsub" data-rsub="${i}"></div></div>
      <div class="verdict"><span class="badge" data-badgewrap="${i}"><span class="bd"></span>
        <span data-badge="${i}"></span></span><span class="target">${c.target}</span></div>`;
    grid.appendChild(card);
  });

  const state=CALCS.map(c=>{const o={};c.inputs.forEach(x=>o[x.key]=x.def);return o;});
  const latest=CALCS.map(()=>null);
  function render(i){
    const r=CALCS[i].compute(state[i]);
    latest[i]=r;
    const dot=summary.querySelector(`[data-dot="${i}"]`);
    const chipV=summary.querySelector(`[data-chip="${i}"]`);
    const badge=grid.querySelector(`[data-badgewrap="${i}"]`);
    const card=grid.querySelector(`[data-card="${i}"]`);
    if(!r){ dot.className='dot'; chipV.textContent='—'; badge.className='badge';
      delete card.dataset.status;
      $(`[data-rv="${i}"]`).textContent='—'; $(`[data-rl="${i}"]`).textContent='請輸入數字';
      $(`[data-rsub="${i}"]`).innerHTML=''; $(`[data-badge="${i}"]`).textContent='—'; return; }
    dot.className='dot '+r.status; chipV.textContent=r.chip;
    card.dataset.status=r.status;
    badge.className='badge '+r.status;
    $(`[data-rl="${i}"]`).textContent=r.main.label;
    $(`[data-rv="${i}"]`).textContent=r.main.value;
    $(`[data-rsub="${i}"]`).innerHTML=(r.sub||[]).map(s=>`<span class="row"><span>${s[0]}</span><span class="v">${s[1]}</span></span>`).join('');
    $(`[data-badge="${i}"]`).textContent=word(r.status);
  }
  const all=()=>CALCS.forEach((_,i)=>render(i));

  grid.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.k===undefined)return;
    state[+t.dataset.c][t.dataset.k]=parse(t.value); render(+t.dataset.c);});
  grid.addEventListener('blur',e=>{const t=e.target;if(!t.dataset||t.dataset.k===undefined)return;
    if(t.dataset.money==="1"){const n=parse(t.value);t.value=n?nf.format(n):'';}},true);
  grid.addEventListener('focus',e=>{const t=e.target;if(!t.dataset||t.dataset.k===undefined)return;
    if(t.dataset.money==="1"){t.value=String(parse(t.value)||'');}},true);
  $("#reset").addEventListener('click',()=>{CALCS.forEach((c,i)=>c.inputs.forEach(x=>{
    state[i][x.key]=x.def; $(`#f${i}_${x.key}`).value=x.money?nf.format(x.def):x.def;}));all();});

  CALCS.forEach((c,i)=>c.inputs.forEach(x=>{if(x.money)$(`#f${i}_${x.key}`).value=nf.format(x.def);}));
  all();

  const reportEndpoint="https://nashlab-ai-report-mailer.david-cy1205.chatgpt.site/api/send-report";
  const form=$("#lead-form"), formStatus=$("#form-status");
  const reportInput=(inp,value)=>inp.money?fmt.money(value):nf.format(value)+" "+inp.unit;
  const buildReports=()=>CALCS.map((c,i)=>{
    const r=latest[i];
    return{
      mainLabel:r?r.main.label:"計算結果",
      mainValue:r?r.main.value:"—",
      details:r?(r.sub||[]).map(row=>row[0]+"："+row[1]).join("；"):"請確認輸入數字",
      inputs:c.inputs.map(inp=>inp.label+"："+reportInput(inp,state[i][inp.key])).join("；"),
      status:r?r.status:"warn"
    };
  });
  const submissionId=()=>{
    if(window.crypto&&typeof window.crypto.randomUUID==="function")return window.crypto.randomUUID();
    return Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
  };

  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    const button=form.querySelector('button[type="submit"]');
    const data=new FormData(form);
    const original=button.innerHTML;
    button.disabled=true;
    button.textContent="正在整理並寄送報告…";
    formStatus.className="form-status";
    formStatus.textContent="正在產生你的五項健檢報告，請稍候。";
    try{
      const response=await fetch(reportEndpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          company:String(data.get("company")||"").trim(),
          contact:String(data.get("contact")||"").trim(),
          email:String(data.get("email")||"").trim(),
          website:String(data.get("website")||""),
          submissionId:submissionId(),
          reports:buildReports()
        })
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok||!result.ok)throw new Error(result.message||"目前無法寄送，請稍後再試。");
      formStatus.className="form-status success";
      formStatus.textContent="寄送成功！正在帶你前往政府補助配對表。";
      window.setTimeout(()=>{window.location.href="thanks.html";},650);
    }catch(error){
      formStatus.className="form-status error";
      formStatus.textContent=error&&error.message?error.message:"目前無法寄送，請稍後再試。";
      button.disabled=false;
      button.innerHTML=original;
    }
  });
})();
