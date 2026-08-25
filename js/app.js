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
    {num:1,title:"整體導入 ROI",tag:"整個 AI 專案首年是否值得？",
     inputs:[{key:"cost",label:"專案導入總成本（與補助槓桿同步）",def:500000,unit:"NTD",money:true},
             {key:"save",label:"預估每月總效益（含人力、時間與其他效益）",def:40000,unit:"NTD",money:true}],
     target:"目標　首年 ROI ＞ 0",
     compute(v){ if(v.cost<=0)return null;
       const roi=(v.save*12-v.cost)/v.cost, back=v.save*12/v.cost;
       return{main:{label:"首年 ROI",value:fmt.pct(roi)},
         sub:[["每 1 元投入帶回",fmt.yuan(back)],["一年省下",fmt.money(v.save*12)]],
         chip:fmt.pct(roi), status:roi>=0.2?"good":(roi>=0?"warn":"danger")};}},
    {num:2,title:"補助槓桿",tag:"1 元自付撬動多少補助？",
     inputs:[{key:"total",label:"專案總金額（與導入總成本同步）",def:500000,unit:"NTD",money:true},
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
    {num:4,title:"單一流程回本",tag:"代表流程幾個月可以打平？",
     inputs:[{key:"icost",label:"代表流程導入成本（已含於專案總成本）",def:120000,unit:"NTD",money:true},
             {key:"msave",label:"代表流程每月省下成本（已含於總效益）",def:30000,unit:"NTD",money:true}],
     target:"目標　代表流程＜ 12 個月",
     compute(v){ if(v.msave<=0)return null; const m=v.icost/v.msave;
       return{main:{label:"回本月數",value:fmt.months(m)},
         sub:[["一年省下",fmt.money(v.msave*12)]],
         chip:fmt.months(m), status:m<=12?"good":(m<=24?"warn":"danger")};}},
    {num:5,title:"時間效益",tag:"拆解總效益中的時間價值",
     inputs:[{key:"hb",label:"導入前每月投入工時",def:80,unit:"小時"},
             {key:"ha",label:"導入後每月投入工時",def:40,unit:"小時"},
             {key:"wage",label:"人力時薪（估）",def:1500,unit:"NTD",money:true}],
     target:"說明項目　不重複計入整體 ROI",
     compute(v){ const saveh=v.hb-v.ha, val=saveh*v.wage;
       return{main:{label:"每月時間效益（已含於總效益）",value:fmt.money(val)},
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

  const overallCard=document.createElement("div");
  overallCard.className="card overall-card";
  overallCard.innerHTML='<div class="card-h"><span class="numchip">6</span><div><h2>整體投資報酬率</h2><div class="tag">補助、採用率與總效益一起計算</div></div></div>'+
    '<div class="fields overall-fields"><div class="field"><label>補助後實際投資</label><strong id="overall-self">—</strong></div>'+
    '<div class="field"><label>採用率調整後月效益</label><strong id="overall-monthly">—</strong></div></div>'+
    '<button class="overall-button" id="calculate-overall" type="button"><span>計算整體投資報酬率</span><i aria-hidden="true">→</i></button>'+
    '<div class="result"><div class="rlead">整體計算結果</div><div class="rmain"><span class="rl" id="overall-label">點擊按鈕取得結果</span>'+
    '<span class="rv" id="overall-value">—</span></div><div class="rsub" id="overall-sub"></div></div>'+
    '<div class="verdict"><span class="badge" id="overall-badge"><span class="bd"></span><span id="overall-badge-text">尚未計算</span></span>'+
    '<span class="target">目標　首年 ROI ≥ 20%、12 個月內回本</span></div>';
  grid.appendChild(overallCard);

  const state=CALCS.map(c=>{const o={};c.inputs.forEach(x=>o[x.key]=x.def);return o;});
  const latest=CALCS.map(()=>null);
  let overallLatest=null;
  let overallWasCalculated=false;

  const computeOverall=()=>{
    const total=state[1].total, grant=state[1].grant, self=total-grant;
    const need=state[2].need, use=state[2].use;
    if(total<=0||self<=0||need<=0)return null;
    const adoption=Math.min(Math.max(use/need,0),1);
    const monthly=Math.max(state[0].save,0)*adoption;
    if(monthly<=0)return null;
    const annual=monthly*12, roi=(annual-self)/self, payback=self/monthly;
    const timeValue=Math.max((state[4].hb-state[4].ha)*state[4].wage,0);
    const identified=Math.max(state[3].msave,0)+timeValue;
    const status=roi>=0.2?"good":(roi>=0?"warn":"danger");
    return{
      main:{label:"採用率調整後首年 ROI",value:fmt.pct(roi)},
      sub:[
        ["年度可實現效益",fmt.money(annual)],
        ["整體回本月數",fmt.months(payback)],
        ["首年淨效益",fmt.money(annual-self)],
        ["效益拆解參考（不重複加總）",fmt.money(identified)+" / 月"]
      ],
      self:self, monthly:monthly, annual:annual, adoption:adoption,
      chip:fmt.pct(roi), status:status
    };
  };

  const clearOverall=message=>{
    overallLatest=null;
    delete overallCard.dataset.status;
    $("#overall-self").textContent="—";
    $("#overall-monthly").textContent="—";
    $("#overall-label").textContent=message;
    $("#overall-value").textContent="—";
    $("#overall-sub").innerHTML="";
    $("#overall-badge").className="badge";
    $("#overall-badge-text").textContent=overallWasCalculated?"待重新計算":"尚未計算";
  };

  const renderOverall=()=>{
    const r=computeOverall();
    overallWasCalculated=true;
    if(!r){clearOverall("請先確認前五項資料");return;}
    overallLatest=r;
    overallCard.dataset.status=r.status;
    $("#overall-self").textContent=fmt.money(r.self);
    $("#overall-monthly").textContent=fmt.money(r.monthly);
    $("#overall-label").textContent=r.main.label;
    $("#overall-value").textContent=r.main.value;
    $("#overall-sub").innerHTML=r.sub.map(row=>'<span class="row"><span>'+row[0]+'</span><span class="v">'+row[1]+'</span></span>').join("");
    $("#overall-badge").className="badge "+r.status;
    $("#overall-badge-text").textContent=word(r.status);
  };

  $("#calculate-overall").addEventListener("click",renderOverall);
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
    const i=+t.dataset.c, key=t.dataset.k, value=parse(t.value);
    state[i][key]=value;
    if(i===0&&key==="cost"){
      state[1].total=value;
      $("#f1_total").value=value?nf.format(value):"";
      render(1);
    }else if(i===1&&key==="total"){
      state[0].cost=value;
      $("#f0_cost").value=value?nf.format(value):"";
      render(0);
    }
    render(i);
    clearOverall(overallWasCalculated?"資料已更新，請重新計算":"點擊按鈕取得結果");
  });
  grid.addEventListener('blur',e=>{const t=e.target;if(!t.dataset||t.dataset.k===undefined)return;
    if(t.dataset.money==="1"){const n=parse(t.value);t.value=n?nf.format(n):'';}},true);
  grid.addEventListener('focus',e=>{const t=e.target;if(!t.dataset||t.dataset.k===undefined)return;
    if(t.dataset.money==="1"){t.value=String(parse(t.value)||'');}},true);
  $("#reset").addEventListener('click',()=>{CALCS.forEach((c,i)=>c.inputs.forEach(x=>{
    state[i][x.key]=x.def; $(`#f${i}_${x.key}`).value=x.money?nf.format(x.def):x.def;}));all();
    overallWasCalculated=false;
    clearOverall("點擊按鈕取得結果");
  });

  CALCS.forEach((c,i)=>c.inputs.forEach(x=>{if(x.money)$(`#f${i}_${x.key}`).value=nf.format(x.def);}));
  all();
  clearOverall("點擊按鈕取得結果");

  const reportEndpoint="https://nashlab-ai-report-mailer.david-cy1205.chatgpt.site/api/send-report";
  const form=$("#lead-form"), formStatus=$("#form-status");
  const reportInput=(inp,value)=>inp.money?fmt.money(value):nf.format(value)+" "+inp.unit;
  const buildReports=()=>{
    const reports=CALCS.map((c,i)=>{
      const r=latest[i];
      return{
        mainLabel:r?r.main.label:"計算結果",
        mainValue:r?r.main.value:"—",
        details:r?(r.sub||[]).map(row=>row[0]+"："+row[1]).join("；"):"請確認輸入數字",
        inputs:c.inputs.map(inp=>inp.label+"："+reportInput(inp,state[i][inp.key])).join("；"),
        status:r?r.status:"warn"
      };
    });
    const r=overallLatest||computeOverall();
    reports.push({
      mainLabel:r?r.main.label:"整體投資報酬率",
      mainValue:r?r.main.value:"—",
      details:r?r.sub.map(row=>row[0]+"："+row[1]).join("；"):"請確認前五項資料",
      inputs:r?[
        "專案總金額："+fmt.money(state[1].total),
        "補助後實際投資："+fmt.money(r.self),
        "實際採用率："+fmt.pct(r.adoption),
        "採用率調整後月效益："+fmt.money(r.monthly)
      ].join("；"):"請確認前五項資料",
      status:r?r.status:"warn"
    });
    return reports;
  };
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
    formStatus.textContent="正在產生你的五項指標與整體 ROI 報告，請稍候。";
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
