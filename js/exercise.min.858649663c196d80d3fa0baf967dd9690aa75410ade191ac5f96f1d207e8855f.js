(function(){"use strict";const e=window.JingzheExerciseModules=window.JingzheExerciseModules||{};e.createModel=e=>{const t=e||{sports:{},groups:{},foods:[]},o=Object.fromEntries(Object.entries(t.sports||{}).map(([e,t])=>[e,t.color])),s=new Set(t.groups?.ride||[]),h=new Set(t.groups?.walk||[]),r=new Set(t.groups?.run||[]),n=new Set([...r,...h]),a=(t.foods||[]).filter(e=>e.monthly).map(({monthly:e,...t})=>t),c=e=>o[e]||t.fallbackColor,l=e=>String(e??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e])),d=e=>!e||e==="undefined"||e==="null"?null:String(Number(String(e).replace(/,/g,""))),u=(e,t)=>{let n=2166136261;for(let t=0;t<e.length;t+=1)n^=e.charCodeAt(t),n=Math.imul(n,16777619);return t>0?(n>>>0)%t:0},i=(e,t)=>{const s=(t||[]).filter(e=>Number(e.calories)>0);if(s.length===0)return null;const i=s.reduce((e,t)=>e+Number(t.calories),0);let n=s[0];s.forEach(e=>{Number(e.calories)>Number(n.calories)&&(n=e)});const r=a.map(e=>({food:e,count:Math.max(1,Math.round(i/e.kcal))})),c=r.filter(e=>e.count>=8&&e.count<=30),o=c.length>0?c:[...r].sort((e,t)=>Math.abs(e.count-19)-Math.abs(t.count-19)).slice(0,4);o.sort((e,t)=>e.food.key.localeCompare(t.food.key));const l=o[u(`${e}:monthly-food:v1`,o.length)];return{totalCalories:Math.round(i),food:l.food,foodCount:l.count,strongestDay:Number(n.start_date_local?.slice(8,10))||null,strongestTitle:n.energy_title||n.display_name||n.sport_display_name||""}},m=(e,t,o)=>{const r=Number(t),j=(e||[]).filter(e=>e.start_date_local?.startsWith(t)),c=new Map,E=new Set;let C=0,O=0,b=0;const g=Date.UTC(r,0,1),k=Date.UTC(r,11,31),p=Math.ceil((k-g)/864e5/7)+1,m=new Array(p).fill(0);j.forEach(e=>{const t=e.start_date_local.slice(0,10),a=Number(t.slice(5,7))-1,r=new Date(`${t}T00:00:00Z`).getTime();e.hour=new Date(e.start_date_local).getHours(),e.dateStr=t;const o=e.distance||0;c.has(a)||c.set(a,{runs:[],runsByDate:new Map});const i=c.get(a);i.runs.push(e),i.runsByDate.has(t)||i.runsByDate.set(t,[]),i.runsByDate.get(t).push(e),C+=o,E.add(r);const l=Math.max(0,Math.min(p-1,Math.floor((r-g)/864e5/7)));m[l]+=o,s.has(e.type)?O+=o:n.has(e.type)&&(b+=o)});const v=m.map((e,t,n)=>{const s=n[t-1]??e,o=n[t+1]??e;return s*.25+e*.5+o*.25}),u=c.get(o)||{runs:[],runsByDate:new Map},A=`${r}-${String(o+1).padStart(2,"0")}`;let f=0,_=0,w=0,a=0,x=0;const d=new Array(8).fill(0),l=new Array(5).fill(0);u.runs.forEach(e=>{const t=e.distance||0;f+=t,s.has(e.type)?_+=t:n.has(e.type)&&(w+=t);const o=Math.floor(e.hour/3);if(++d[o]>a&&(a=d[o]),e.average_heartrate&&e.average_heartrate>0){x+=1;const t=e.average_heartrate,n=t<115?0:t<130?1:t<145?2:t<160?3:4;l[n]+=1}});const y=[{name:"午夜潜行",time:"00:00-03:00"},{name:"破晓先锋",time:"03:00-06:00"},{name:"晨光逐风",time:"06:00-09:00"},{name:"骄阳行者",time:"09:00-12:00"},{name:"烈日独行",time:"12:00-15:00"},{name:"午后追风",time:"15:00-18:00"},{name:"暮色掠影",time:"18:00-21:00"},{name:"暗夜游侠",time:"21:00-24:00"}],h=[{color:"#32D74B",title:"舒缓有氧",name:"Z1",range:"<115"},{color:"#FFCC00",title:"稳态燃脂",name:"Z2",range:"115-129"},{color:"#FF9500",title:"有氧强化",name:"Z3",range:"130-144"},{color:"#FF5E3A",title:"乳酸阈值",name:"Z4",range:"145-159"},{color:"#FF3B30",title:"无氧极限",name:"Z5",range:"≥160"}];return{displayYear:r,availableMonthsArr:Array.from(new Set(j.map(e=>e.start_date_local.slice(5,7)))).sort().reverse(),globalData:{stats:{totalDist:C,rideDist:O,runDist:b,activeDays:E.size},sparklineData:v,sparklineMax:Math.max(...v,1)},monthlyData:{runsByDate:u.runsByDate,monthDetailStats:{totalDist:f,rideDist:_,runDist:w},energySummary:i(A,u.runs),insights:{hasActivities:u.runs.length>0,timeBlocks:d,maxTimeBlockCount:Math.max(a,1),peakPersona:a>0?y[d.indexOf(a)].name:"等待记录",personas:y,validHrRuns:x,hrCounts:l,hrZonesInfo:h,hrMaxZone:h[l.indexOf(Math.max(...l))]||h[0]}}}};return{sportColors:o,rideTypes:s,runWalkTypes:n,colorFromType:c,escapeHtml:l,normalizeId:d,buildMonthlyEnergySummary:i,computeEngineData:m}}})(),function(){"use strict";const n=window.JingzheExerciseModules=window.JingzheExerciseModules||{},e=(e,t=5)=>{if(!e)return[];let n=0,s=0,o=0;const i=[],a=10**t;try{for(;n<e.length;){const t=[];for(let i=0;i<2;i+=1){let a=0,s=0,o;do o=e.charCodeAt(n++)-63,s|=(o&31)<<a,a+=5;while(o>=32)t.push(s&1?~(s>>1):s>>1)}s+=t[0],o+=t[1],i.push([o/a,s/a])}}catch{return[]}return i},t=(e,t)=>{const s=6371,n=e=>e*Math.PI/180,o=n(t[1]-e[1]),i=n(t[0]-e[0]),a=Math.sin(o/2)**2+Math.cos(n(e[1]))*Math.cos(n(t[1]))*Math.sin(i/2)**2;return 2*s*Math.asin(a**.5)},s=(e,n,s)=>{let o=s;for(let r=1;r<n.length&&o>0;r+=1){const s=e[e.length-1],i=n[r],a=t(s,i);if(a<=o+1e-6){e.push(i),o-=a;continue}const c=a>0?o/a:0;e.push([s[0]+(i[0]-s[0])*c,s[1]+(i[1]-s[1])*c]),o=0}return o},o=e=>e.is_indoor===!0?{reason:"室内运动没有定位轨迹",tagline:"室内开练，地图休息"}:e.route_status==="privacy_hidden"?{reason:"定位轨迹未公开",tagline:"轨迹留白，运动没停"}:{reason:"本次没有定位轨迹",tagline:"没有轨迹，运动照常"};n.createRoutes=(n,i)=>{const u=Array.isArray(n.landmarkRoutes)?n.landmarkRoutes:[],c=new Map(u.map(e=>[e.key,e])),l=e=>c.get(e.distance_title_key)||null,a=(e,t)=>{const n=Number(e.reference_meters),s=Number(t.total_elevation_gain);if(Number.isFinite(n)&&n>0&&Number.isFinite(s)&&s>0)return s/n;const o=Number(e.reference_km),i=Number(t.distance);return Number.isFinite(o)&&o>0&&Number.isFinite(i)&&i>0?i/o:0},r=(n,o)=>{const i=e(n.geometry||""),r=a(n,o);if(i.length<2||!Number.isFinite(r)||r<=0)return[];if(r>=1)return i;const c=[i[0]],l=i.slice(1).reduce((e,n,s)=>e+t(i[s],n),0);return s(c,i,l*r),c},h=(e,t)=>3.4+Math.min(Math.max(a(e,t),.5),6)*.65,m=t=>{const n=t.route_status==="available"&&t.summary_polyline?t._decodedCoords||e(t.summary_polyline):[];t.route_status==="available"&&(t._decodedCoords=n);const o=t.route_status==="available"&&n.length>=2,s=t.route_status==="privacy_hidden"?l(t):null,a=s?r(s,t):[],i=o?n:a;return{hasRealTrack:o,landmarkRoute:s,displayCoordinates:i,hasDisplayTrack:i.length>=2}},d=(s,o=null)=>{const u=o?`${s}-${String(o).padStart(2,"0")}`:String(s),d=(n.data||[]).filter(e=>e.start_date_local?.startsWith(u)&&e.is_indoor!==!0),l=new Map;d.forEach(e=>{if(e.route_status!=="privacy_hidden"||!e.distance_title_key)return;l.has(e.distance_title_key)||l.set(e.distance_title_key,[]),l.get(e.distance_title_key).push(e)});const h=[...l.entries()].map(([e,t])=>{const n=c.get(e)||null;if(!n)return null;const s=[...t].sort((e,t)=>a(n,t)-a(n,e))[0],i=r(n,s);return i.length<2?null:{type:"Feature",properties:{id:Number(s.run_id),landmark:e,type:s.type,visits:t.length,mode:o?"month":"annual"},geometry:{type:"LineString",coordinates:i}}}).filter(Boolean).sort((e,t)=>e.properties.visits-t.properties.visits),m=d.filter(e=>e.route_status==="available"&&e.summary_polyline).map(n=>{const s=n._decodedCoords||e(n.summary_polyline);if(n._decodedCoords=s,s.length<2)return null;const o=s[Math.floor(s.length/2)];return t(i,o)>120?null:{type:"Feature",properties:{id:Number(n.run_id),type:n.type},geometry:{type:"LineString",coordinates:s}}}).filter(Boolean);return{landmarkFeatures:h,publicFeatures:m}},f=e=>d(e),p=(e,t)=>d(e,t);return{buildAnnualOverview:f,buildMonthlyOverview:p,coordinatesForRunRoute:r,getLandmarkRouteForRun:l,getRouteStampCopy:o,routePassCount:a,selectDisplayRoute:m,singleRouteLineWidth:h}},n.routePrimitives={appendCoordinatesUntilDistance:s,coordinateDistanceKm:t,decodePolyline:e,getRouteStampCopy:o}}(),function(){"use strict";const s=window.JingzheExerciseModules=window.JingzheExerciseModules||{},e=e=>String(e||"JingzheExercise").replace(/[^a-zA-Z0-9_-]/g,"")||"JingzheExercise",t=e=>{e&&e.classList.remove("show-poster-mode");const t=document.getElementById("real-poster-mask");t&&t.remove()},n=(e,t)=>{const i=e.distance>0?e.distance.toFixed(2):"--",d=e.distance>0?"km":"",o=e.moving_time||"--",s=e.average_heartrate||"--",a=Number(e.calories)>0?Math.round(Number(e.calories)):"--",r=e.distance>0?e.pace_num||"--":"--",c=e.distance>0?e.pace_unit||"":"",u=t.colorFromType(e.type),l=["Ride","VirtualRide","EBikeRide"].includes(e.type),n=e.start_date_local.substring(5,16).replace("T"," "),h=e.display_name,m=e.sport_display_name||"运动",f=e.card_achievement?.label?`<span class="map-achievement-tag">${t.escapeHtml(e.card_achievement.label)}</span>`:"";return{displayTime:n,html:`
        <div class="normal-view">
          <div class="detailName">
            <div class="nameLeft">
              <span class="detailDate">${n}</span>${f}${m}
            </div>
            <div class="panel-share">
              <button type="button" id="trigger-poster-btn" class="panel-share-btn panl-share-down" aria-label="预览运动海报">
                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M9 3a1 1 0 0 1 .117 1.993L9 5H5v14h14v-9a1 1 0 0 1 1.993-.117L21 10v9a2 2 0 0 1-1.85 1.995L19 21H5a2 2 0 0 1-1.995-1.85L3 19V5a2 2 0 0 1 1.85-1.995L5 3zm10.513 0c.622 0 .984.468 1.075.856c.091.389-.025.971-.585 1.247l-.414.211l-.164.088l-.363.201l-.405.236l-.439.27c-.682.43-1.46.976-2.242 1.637c-1.654 1.399-3.258 3.261-4.027 5.57a1 1 0 0 1-1.898-.632c.928-2.784 2.823-4.933 4.634-6.465c.431-.365.862-.698 1.278-1l.31-.219H14a1 1 0 0 1-.117-1.993L14 3z"/></g></svg>
              </button>
            </div>
          </div>
          <div class="detailStatsRow">
            <div class="detailStatBlock"><span class="statLabel">里程</span><span class="statVal" style="color: ${u}">${i}<small>${d}</small></span></div>
            <div class="detailStatBlock"><span class="statLabel">用时</span><span class="statVal">${o}</span></div>
            <div class="detailStatBlock"><span class="statLabel">${l?"均速":"配速"}</span><span class="statVal">${r}<small>${c}</small></span></div>
            <div class="detailStatBlock"><span class="statLabel">心率</span><span class="statVal">${s}</span></div>
            <div class="detailStatBlock"><span class="statLabel">千卡</span><span class="statVal">${a}</span></div>
          </div>
        </div>
        <div class="poster-view data-poster-view" style="display: none;">
          <div class="poster-actions">
            <button type="button" class="poster-download-btn" title="保存海报" aria-label="生成并保存运动海报"><svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><path fill="currentColor" d="M426.666 426.667H85.333V384h341.333zm-149.333-179.5l91.583-91.583l30.167 30.166L256 328.834L112.916 185.75l30.167-30.166l91.583 91.582v-204.5h42.667z"/></svg></button>
            <button type="button" class="poster-close-btn" title="退出预览" aria-label="退出海报预览"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="poster-dist-hero"><span class="heroNum">${i}</span><span class="heroUnit">${d}</span></div>
          <div class="poster-stats-row">
            <div class="poster-stat-block"><span class="statLabel">用时</span><span class="statVal">${o}</span></div>
            <div class="poster-stat-block"><span class="statLabel">${l?"均速":"配速"}</span><span class="statVal">${r}<small>${c}</small></span></div>
            <div class="poster-stat-block"><span class="statLabel">心率</span><span class="statVal">${s}</span></div>
            <div class="poster-stat-block"><span class="statLabel">千卡</span><span class="statVal">${a}</span></div>
          </div>
          <div class="poster-watermark">${n}</div>
          <div class="poster-title">${h}</div>
        </div>
      `}},o=({bounds:s,config:o,hasDisplayTrack:i,map:a,model:r,onClose:c,run:l,statsPanel:d,wrapper:u})=>{const h=n(l,r);d.innerHTML=h.html,d.style.display="flex";const f=d.querySelector(".normal-view"),p=d.querySelector(".data-poster-view"),g=()=>{if(u.classList.add("show-poster-mode"),f.style.display="none",p.style.display="block",!document.getElementById("real-poster-mask")){const e=document.createElement("div");e.id="real-poster-mask",e.className="poster-gradient-mask",u.appendChild(e)}if(i&&s){const e=u.clientHeight<=400;a.fitBounds(s,{padding:{top:e?30:60,bottom:e?30:260,left:e?u.clientWidth*.5:60,right:e?20:60},pitch:0,bearing:0,duration:1e3,linear:!0})}},m=d.querySelector("#trigger-poster-btn");m&&m.addEventListener("click",e=>{e.stopPropagation(),g()}),d.querySelectorAll(".poster-close-btn").forEach(e=>{e.addEventListener("click",e=>{e.stopPropagation(),t(u),c()})}),d.querySelectorAll(".poster-download-btn").forEach(t=>{t.addEventListener("click",t=>{t.stopPropagation();const n=t.currentTarget;if(n.dataset.isGenerating==="true")return;n.dataset.isGenerating="true",n.style.opacity="0.5",n.style.cursor="wait";const i=window.htmlToImage,s=()=>{n.dataset.isGenerating="false",n.style.opacity="1",n.style.cursor="pointer"};if(!i?.toCanvas){s();return}i.toCanvas(u,{pixelRatio:4,backgroundColor:null,filter:e=>!e.classList?.contains("poster-actions")}).then(t=>{const n=document.createElement("a");n.download=`${e(o.POSTER_FILE_PREFIX)}_${h.displayTime.replace(/[/\s:]/g,"")}.webp`,n.href=t.toDataURL("image/webp",.92),n.click(),s()}).catch(e=>{console.error("海报生成失败:",e),s()})})})};s.poster={buildPanelHtml:n,cleanPosterPrefix:e,render:o,reset:t}}(),function(){"use strict";const e=window.JingzheExerciseModules=window.JingzheExerciseModules||{};e.createUI=(e,t)=>{const s=t.colorFromType,n=t.escapeHtml;class i{constructor(t){this.allRuns=t||[],this.availableYears=Array.isArray(e.availableYears)?e.availableYears.map(String):[],this.currentYear=this.availableYears.length>0?this.availableYears[0]:(new Date).getFullYear().toString(),this.latestMonthByYear=this.allRuns.reduce((e,t)=>{const n=t.start_date_local?.slice(0,7)||"";if(!/^\d{4}-\d{2}$/.test(n))return e;const s=n.slice(0,4);return(!e.has(s)||n>e.get(s))&&e.set(s,n),e},new Map),this.showAiInsight=!1,this.cachedRunCards=document.querySelectorAll(".runCard"),this.runListEmpty=document.getElementById("run-list-empty"),this.interactionRoot=document.querySelector(".exercise-container"),this.bindInteractions(),this.setSmartMonth()}bindInteractions(){if(!this.interactionRoot)return;this.interactionRoot.addEventListener("click",t=>{const s=t.target.closest?.("[data-exercise-action]");if(!s||!this.interactionRoot.contains(s))return;const n=Number.parseInt(s.dataset.direction,10);switch(s.dataset.exerciseAction){case"fly-to-run":e.map?.flyTo(s.dataset.runId);break;case"change-year":(n===-1||n===1)&&this.changeYearBy(n);break;case"change-month":(n===-1||n===1)&&this.setCalMonth(n);break;case"toggle-ai":this.toggleAiInsight();break;default:break}})}toggleAiInsight(){this.showAiInsight=!this.showAiInsight;const s=document.querySelector(".calendar-grid-view"),o=document.querySelector(".ai-insight-view"),e=document.querySelector(".ai-toggle-btn"),t=document.querySelector(".monthFooter"),n=document.querySelector(".monthlyInsights");s&&o&&e&&(this.showAiInsight?(s.style.display="none",o.style.display="flex",e.classList.add("active"),t&&(t.style.display="none"),n&&(n.style.display="none")):(s.style.display="flex",o.style.display="none",e.classList.remove("active"),t&&(t.style.display="block"),n&&(n.style.display="flex")),e.setAttribute("aria-pressed",String(this.showAiInsight)))}setSmartMonth(){const e=this.latestMonthByYear.get(this.currentYear);e?this.calMonthIndex=Number.parseInt(e.slice(5,7),10)-1:this.calMonthIndex=(new Date).getMonth()}getCurrentRouteScope(){const e=String(this.calMonthIndex+1).padStart(2,"0"),t=`${this.currentYear}-${e}`;return{year:this.currentYear,month:e,mode:t===this.latestMonthByYear.get(this.currentYear)?"year":"month"}}dispatchRouteScope(e){document.dispatchEvent(new CustomEvent(e,{detail:this.getCurrentRouteScope()}))}triggerListFilter(){const e=this.getCurrentRouteScope(),n=e.mode==="year";let t=0;this.cachedRunCards.forEach(s=>{const i=s.classList.contains(`item-year-${this.currentYear}`),a=s.classList.contains(`item-month-${e.month}`),o=i&&(n||a);s.style.display=o?"flex":"none",o&&(t+=1)}),this.runListEmpty&&(this.runListEmpty.hidden=t>0)}setYear(e){this.currentYear=e,this.showAiInsight=!1,this.setSmartMonth(),this.renderAll(),this.dispatchRouteScope("koobaiYearChanged")}changeYearBy(e){if(this._isChangingYear)return;this._isChangingYear=!0;const t=this.availableYears.indexOf(this.currentYear);if(t!==-1){const n=t-e;n>=0&&n<this.availableYears.length&&this.setYear(this.availableYears[n])}setTimeout(()=>{this._isChangingYear=!1},300)}setCalMonth(e){this.calMonthIndex=Math.max(0,Math.min(11,this.calMonthIndex+e)),this.showAiInsight=!1,this.renderAll(),this.dispatchRouteScope("koobaiMonthChanged")}highlightRunInUI(e){const o=t.normalizeId,n=o(e);let i="rgba(50, 215, 75, 0.08)",a="rgba(50, 215, 75, 0.3)";if(n){const e=this.allRuns.find(e=>o(e.run_id)===n);if(e){const t=s(e.type);let n=50,o=215,r=75;t.startsWith("#")&&t.length===7&&(n=parseInt(t.slice(1,3),16),o=parseInt(t.slice(3,5),16),r=parseInt(t.slice(5,7),16)),i=`rgba(${n}, ${o}, ${r}, 0.08)`,a=`rgba(${n}, ${o}, ${r}, 0.3)`}}this.cachedRunCards.forEach(e=>{const t=o(e.getAttribute("data-run-id"));n&&t===n?(e.style.background=i,e.style.borderColor=a):(e.style.background="",e.style.borderColor="")}),document.querySelectorAll(".dayCell.hasRun").forEach(e=>{const t=o(e.getAttribute("data-run-id"));n&&t===n?(e.style.borderColor=a,e.style.background=i):(e.style.borderColor="",e.style.background="")})}computeEngineData(){return t.computeEngineData(this.allRuns,this.currentYear,this.calMonthIndex)}renderAll(){const e=this.computeEngineData();this.triggerListFilter(),this.renderCalendar(e)}renderCalendar(t){const d=document.getElementById("calendar-board-container");if(!d)return;let p="";if(t.globalData.sparklineData.length>0){const i=200,s=40,n=6,a=t.globalData.sparklineMax,e=t.globalData.sparklineData.map((e,o)=>({x:o/Math.max(t.globalData.sparklineData.length-1,1)*i,y:s-n-e/a*(s-2*n)}));let o=`M ${e[0].x},${e[0].y}`;for(let t=0;t<e.length-1;t++){const r=e[Math.max(0,t-1)],a=e[t],i=e[t+1],c=e[Math.min(e.length-1,t+2)],l=a.x+(i.x-r.x)/6,d=Math.max(n,Math.min(s-n,a.y+(i.y-r.y)/6)),u=i.x-(c.x-a.x)/6,h=Math.max(n,Math.min(s-n,i.y-(c.y-a.y)/6));o+=` C ${l},${d} ${u},${h} ${i.x},${i.y}`}p=`
            <svg class="sparkline" viewBox="0 0 200 40" preserveAspectRatio="none" style="overflow: visible">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#32D74B" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#32D74B" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="${o} L 200,40 L 0,40 Z" fill="url(#sparklineGrad)" stroke="none" class="sparklineFill" />
              <path d="${o}" fill="none" class="sparklineLine" />
            </svg>`}const f=new Date(t.displayYear,this.calMonthIndex,1).getDay(),k=f===0?6:f-1,x=new Date(t.displayYear,this.calMonthIndex+1,0).getDate(),y=Array.from({length:k},()=>null).concat(Array.from({length:x},(e,t)=>t+1)),v=y.map(e=>{if(!e)return`<div class="emptyDay"></div>`;const c=`${t.displayYear}-${String(this.calMonthIndex+1).padStart(2,"0")}-${String(e).padStart(2,"0")}`,a=(t.monthlyData.runsByDate.get(c)||[]).sort((e,t)=>e.start_date_local.localeCompare(t.start_date_local)),i=a.length>0,o=i?a[0]:null;let r=!1,l="",d="";if(o){const i=a.map(e=>{const t=e.distance>0?`${e.distance.toFixed(1)} <small class="ttUnit">km</small>`:`${e.moving_time} <small class="ttUnit">用时</small>`;return`
                <div class="ttItem">
                  <span class="ttName">${e.display_name}</span>
                  <span class="ttNum" style="color: ${s(e.type)}">${t}</span>
                </div>
              `}).join(""),e=Array.isArray(o.calendar_achievements)?o.calendar_achievements:[],c=e.some(e=>e.level==="year");if(r=e.length>0,r){const e=c?"is-gold-dot":"is-silver-dot";l=`<span class="multiDot ${e}"></span>`}const t=e.map(e=>`
              <div class="ttAchieveRow">
                <span>${n(e.label)}</span>
                <span class="titleTag">${n(e.group_label)}</span>
              </div>
            `).join("");d=`
              <div class="runTooltip">
                <div class="ttDayRunList">${i}</div>
                ${t?`<div class="ttAchievement">${t}</div>`:""}
              </div>`}const u=o?s(o.type):"#32D74B",h=i?`color: ${u}; opacity: 1;`:"opacity: 0.6;";return`
              <div class="dayCell ${i?"hasRun":""} ${r?"maxDay":""}"
                   data-run-id="${i?o.run_id:""}">
                ${i?`
                  <button class="dayCellAction"
                          type="button"
                          data-exercise-action="fly-to-run"
                          data-run-id="${o.run_id}"
                          aria-label="${n(`查看 ${c} ${o.display_name}的运动详情与轨迹`)}"></button>`:""}
                <span class="dateNum" style="${h}">${e}</span>
                ${l}
                ${d}
              </div>`}).join(""),u=`${t.displayYear}-${String(this.calMonthIndex+1).padStart(2,"0")}`,i=e.monthlyInsights?e.monthlyInsights[u]:null,m=i?i.status_text||"":"",c=i&&i.coach_report?i.coach_report:null,j=i&&i.report_as_of?i.report_as_of:"",g=Number.parseInt(j.slice(-2),10),b=i&&i.report_phase==="midmonth"&&Number.isInteger(g)?`<div class="monthly-data-cutoff">数据截止到${g}日</div>`:"";let r="";if(c){const e=[c.verdict,c.analysis,c.next_plan].filter(Boolean);r=`
            <div class="monthly-coach-report">
              ${e.map(e=>`<p>${n(e)}</p>`).join("")}
            </div>`}else m&&(r=`
            <div class="monthly-summary-text">${n(m)}</div>`);const a=t.monthlyData.energySummary;let l="";if(a){const e=a.totalCalories.toLocaleString("zh-CN"),t=`${a.foodCount} ${a.food.unit}${a.food.name}`,s=`差不多燃掉了 ${t}`,o=a.strongestDay&&a.strongestTitle?`火力最猛的是 ${a.strongestDay} 日那次：${n(a.strongestTitle)}。`:"";l=`
            <div class="monthly-summary-text monthly-energy-summary">
              本月共消耗 ${e} 千卡，${s}。${o}
            </div>
            ${b}`}const _=r||l?`
          <button class="ai-toggle-btn ${this.showAiInsight?"active":""}"
                  type="button"
                  data-exercise-action="toggle-ai"
                  aria-label="切换月度点评"
                  aria-pressed="${this.showAiInsight}"
                  aria-controls="exercise-calendar-view exercise-ai-insight-view">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5 .5L9 4L6.5 9.5L1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/></svg>
          </button>
        `:"",w=this.showAiInsight?"none":"flex",O=this.showAiInsight?"flex":"none",o=t.monthlyData.insights,C=o.timeBlocks.map((e,t)=>{const n=o.maxTimeBlockCount>0?e/o.maxTimeBlockCount:0,s=e>0?`style="background-color: rgba(50, 215, 75, ${.3+.7*n})"`:"";return`
            <div class="barWrapper">
              <div class="punchHole" ${s}></div>
              <div class="runTooltip">
                <div class="ttItem">
                  <span class="ttName">${o.personas[t].time}</span>
                  <span class="ttNum">${e} <small>趟</small></span>
                </div>
              </div>
            </div>`}).join(""),E=o.hrCounts.map((e,t)=>{const n=o.hrZonesInfo[t],s=o.validHrRuns>0?Math.max(12,e/o.validHrRuns*100):12,i=e>0?`background-color: ${n.color}`:"";return`
            <div class="zoneCol">
              <div class="zoneBar" style="height: ${s}%; ${i}"></div>
              <div class="runTooltip">
                <div class="ttItem">
                  <span class="ttName" style="color: ${n.color};">
                    ${n.range} <small>BPM</small>
                  </span>
                  <span class="ttNum">${e} <small>趟</small></span>
                </div>
              </div>
            </div>`}).join(""),h=this.availableYears.indexOf(this.currentYear),A=h>=this.availableYears.length-1,S=h<=0;d.innerHTML=`
          <div class="boardContainer">

            <div class="globalSection">
              ${p}
              <div class="globalTitle monthNav">
                <button type="button" data-exercise-action="change-year" data-direction="-1" aria-label="查看更早年度" ${A?"disabled":""}>
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <span>${t.displayYear} 年度总里程</span>
                <button type="button" data-exercise-action="change-year" data-direction="1" aria-label="查看更新年度" ${S?"disabled":""}>
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
              <div class="globalMainStat">
                <span class="val">${t.globalData.stats.totalDist.toFixed(1)}</span>
                <span class="unit">KM</span>
              </div>
              <div class="metricsRow">
                <div class="metricBlock">
                  <span class="metricLabel">骑行</span>
                  <span class="metricValue">${t.globalData.stats.rideDist.toFixed(0)}<small>km</small></span>
                </div>
                <div class="metricBlock">
                  <span class="metricLabel">跑走</span>
                  <span class="metricValue">${t.globalData.stats.runDist.toFixed(0)}<small>km</small></span>
                </div>
                <div class="metricBlock">
                  <span class="metricLabel">出勤</span>
                  <span class="metricValue">${t.globalData.stats.activeDays}<small>天</small></span>
                </div>
              </div>
            </div>

            <div class="calendarSection">
              <div class="monthHeader">
                <div class="monthNav" style="position: relative;">
                  <button type="button" data-exercise-action="change-month" data-direction="-1" aria-label="查看上个月" ${this.calMonthIndex===0?"disabled":""}>
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                  <span>${u}</span>
                  <button type="button" data-exercise-action="change-month" data-direction="1" aria-label="查看下个月" ${this.calMonthIndex===11?"disabled":""}>
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                  ${_}
                </div>
              </div>

              <div class="cal-content-wrapper">
                <div class="calendar-grid-view" id="exercise-calendar-view" style="display: ${w};">
                  <div class="weekdays"><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div></div>
                  <div class="grid">${v}</div>
                </div>

                <div class="ai-insight-view" id="exercise-ai-insight-view" style="display: ${O};">
                  ${r}
                  ${l}
                </div>
              </div>

              <div class="monthFooter">
                里程 <span>${t.monthlyData.monthDetailStats.totalDist.toFixed(1)}</span> km
                <span class="dot">•</span>
                骑行 <span>${t.monthlyData.monthDetailStats.rideDist.toFixed(1)}</span> km
                <span class="dot">•</span>
                跑走 <span>${t.monthlyData.monthDetailStats.runDist.toFixed(1)}</span> km
              </div>
            </div>

            <div class="monthlyInsights">
              <div class="insightCard">
                <div class="insightHeader"><span class="insightTitle">${o.peakPersona}</span></div>
                <div class="insightContent">
                  <div class="punchCard">${C}</div>
                  <div class="insightLabels timeLabels"><span>00:00</span><span>12:00</span><span>24:00</span></div>
                </div>
              </div>

              <div class="insightCard">
                <div class="insightHeader"><span class="insightTitle">${o.hasActivities?o.hrMaxZone.title:"等待记录"}</span></div>
                <div class="insightContent">
                  <div class="zoneChart">${E}</div>
                  <div class="insightLabels zoneLabels">
                    ${o.hrZonesInfo.map(e=>`<span>${e.name}</span>`).join("")}
                  </div>
                </div>
              </div>
            </div>

          </div>
        `}}const o=new i(e.data||[]);return o.renderAll(),o}}(),function(){"use strict";const t=window.JingzheExerciseModules=window.JingzheExerciseModules||{},e=Object.freeze({month:500,annual:700,year:800,initial:1400,detailReturn:650,runFlight:2e3,runOrbit:36e3}),n=(t,n,s=!1)=>s?0:String(t?.year||"")!==String(n?.year||"")?e.year:t?.mode==="month"&&n?.mode==="year"?e.annual:e.month,s=(e,t,n)=>{const s=Math.max(0,Math.min(1,n)),o=s*Math.PI*2;return{bearing:e+360*s,pitch:65+Math.sin(o)*2,zoom:t+Math.sin(o)*.2}};t.mapMotion={durations:e,getOrbitCameraState:s,getScopeTransitionDuration:n},t.createMapAdapter=(o,i)=>{const m=window.maplibregl||window.maplibre||window.mapboxgl;if(typeof m=="undefined"||!o)return;const d=o.config||{},C=window.matchMedia?.("(prefers-reduced-motion: reduce)"),y=e=>C?.matches?0:e;m.accessToken=d.MAPBOX_TOKEN;const _=Array.isArray(d.MAP_CENTER)&&d.MAP_CENTER.length===2?d.MAP_CENTER.map(Number):[0,0],X=()=>{const e=document.documentElement.getAttribute("data-theme");return e==="dark"||e!=="light"&&Boolean(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches)},w=()=>X()?d.MAP_STYLE_DARK:d.MAP_STYLE_LIGHT,a=new m.Map({container:"mapbox-container",style:w(),center:_,zoom:11,pitch:0,bearing:0,maxPitch:85,logoPosition:"bottom-left",attributionControl:!1,preserveDrawingBuffer:!0}),r=document.getElementById("map-wrapper");r&&window.ResizeObserver&&new ResizeObserver(()=>{requestAnimationFrame(()=>a.resize())}).observe(r);let T=w();const F=()=>{const e=w();e!==T&&(T=e,a.setStyle(e))},D=new MutationObserver(F);D.observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-theme"]}),window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",F);const G=o.SPORT_COLORS||{},Y="#00ED5E",q=i.escapeHtml,U=t.createRoutes(o,_),{buildAnnualOverview:$,buildMonthlyOverview:V,getRouteStampCopy:P,selectDisplayRoute:L,singleRouteLineWidth:N}=U,k=_,p=["match",["get","type"]];for(const[e,t]of Object.entries(G))p.push(e,t);p.push(Y);let g=null,u=null,h=null,x=!1;const f=()=>{u&&cancelAnimationFrame(u),h&&clearTimeout(h),u=null,h=null};["mousedown","touchstart","dragstart"].forEach(e=>{a.on(e,()=>{f()})}),document.addEventListener("visibilitychange",()=>{document.hidden&&f()}),C?.addEventListener("change",e=>{e.matches&&(f(),a.stop?.())});let b=(new Date).getFullYear().toString();o.availableYears&&o.availableYears.length>0&&(b=o.availableYears[0].toString());let j=o.ui?.getCurrentRouteScope?.()||{year:b,month:null,mode:"year"},c=document.getElementById("anonymous-route-overlay");!c&&r&&(c=document.createElement("div"),c.id="anonymous-route-overlay",c.className="anonymousRouteOverlay",c.hidden=!0,r.appendChild(c));const R=()=>{r&&r.classList.remove("show-anonymous-map"),c&&(c.hidden=!0,c.innerHTML=""),a.getSource("landmark-routes")&&a.getSource("landmark-routes").setData({type:"FeatureCollection",features:[]}),["landmark-routes-core"].forEach(e=>{a.getLayer(e)&&a.setLayoutProperty(e,"visibility","none")})},A=(e=0)=>{const t={center:k,zoom:11,pitch:0,bearing:0,duration:e,essential:!1};e>0&&typeof a.easeTo=="function"?a.easeTo(t):a.jumpTo(t)},H=(e,t=42,n=[],s=0)=>{if(!a.getSource("landmark-routes")||!r)return;a.getSource("landmark-routes").setData({type:"FeatureCollection",features:e}),["landmark-routes-core"].forEach(e=>{a.getLayer(e)&&a.setLayoutProperty(e,"visibility","visible")}),a.getLayer("runs-core")&&a.setPaintProperty("runs-core","line-opacity",n.length>0?.8:0),a.getSource("highlight-run-source")&&a.getSource("highlight-run-source").setData({type:"FeatureCollection",features:[]});const o=new m.LngLatBounds;e.forEach(e=>{e.geometry.coordinates.forEach(e=>o.extend(e))}),n.forEach(e=>{e.geometry.coordinates.forEach(e=>o.extend(e))}),o.isEmpty()?A(s):a.fitBounds(o,{padding:t,pitch:0,bearing:0,duration:s,essential:!1}),c&&(c.hidden=!0,c.innerHTML=""),r.classList.add("show-anonymous-map")},I=(e,t=0)=>{if(!r)return;const s=e.mode==="month"?V(e.year,e.month):$(e.year),{landmarkFeatures:o,publicFeatures:n}=s;a.getSource("all-runs")&&a.getSource("all-runs").setData({type:"FeatureCollection",features:n}),a.getLayer("runs-core")&&a.setPaintProperty("runs-core","line-opacity",n.length>0?.8:0),H(o,34,n,t)},B=()=>{if(!c||!r)return;c.innerHTML="",a.getSource("landmark-routes")&&a.getSource("landmark-routes").setData({type:"FeatureCollection",features:[]}),["landmark-routes-core"].forEach(e=>{a.getLayer(e)&&a.setLayoutProperty(e,"visibility","none")}),A(),c.hidden=!0,r.classList.add("show-anonymous-map")};let l=document.getElementById("route-stamp-overlay");!l&&r&&(l=document.createElement("div"),l.id="route-stamp-overlay",l.className="routeStampOverlay",l.hidden=!0,r.appendChild(l));const O=()=>{r&&r.classList.remove("show-route-stamp"),l&&(l.hidden=!0,l.innerHTML="")},W=e=>{if(!l||!r)return;const t=P(e);l.innerHTML=`
        <div class="routeStamp">
          <span class="routeStampNote">${q(t.tagline)}</span>
        </div>
      `,l.hidden=!1,r.classList.add("show-route-stamp")},S=()=>{f(),a.stop?.()},K=()=>{a.getSource("all-runs")||(a.addSource("all-runs",{type:"geojson",data:{type:"FeatureCollection",features:[]},lineMetrics:!0}),a.addSource("highlight-run-source",{type:"geojson",data:{type:"FeatureCollection",features:[]},lineMetrics:!0}),a.addLayer({id:"runs-core",type:"line",source:"all-runs",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":p,"line-width":2,"line-opacity":.8}}),a.addLayer({id:"run-highlight-line",type:"line",source:"highlight-run-source",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":p,"line-width":["coalesce",["get","line_width"],4],"line-opacity":1}})),a.getSource("landmark-routes")||(a.addSource("landmark-routes",{type:"geojson",data:{type:"FeatureCollection",features:[]}}),a.addLayer({id:"landmark-routes-core",type:"line",source:"landmark-routes",layout:{visibility:"none","line-join":"round","line-cap":"round"},paint:{"line-color":p,"line-width":["interpolate",["linear"],["zoom"],8.5,["case",["==",["get","mode"],"single"],4,["interpolate",["linear"],["get","visits"],1,1.2,3,1.6,6,2.1,12,2.8,24,3.8]],11.5,["case",["==",["get","mode"],"single"],4,["interpolate",["linear"],["get","visits"],1,1,3,1.6,6,2.5,12,3.6,24,4.8]],14.5,["case",["==",["get","mode"],"single"],4,["interpolate",["linear"],["get","visits"],1,1.2,3,2.2,6,3.6,12,5.2,24,7.2]]],"line-opacity":["case",["==",["get","mode"],"single"],.92,["interpolate",["linear"],["get","visits"],1,.62,3,.7,6,.78,12,.87,24,.94]]}}))},E=(e,t=0)=>{const n=String(e?.year||b),s=e?.mode==="month"?"month":"year",o=s==="month"?String(e.month).padStart(2,"0"):null;if(O(),g=null,b=n,j={year:n,month:o,mode:s},S(),I(j,t),!a.getSource("all-runs"))return;a.getSource("highlight-run-source").setData({type:"FeatureCollection",features:[]})},v=(e=0)=>{E(j,e)};a.on("style.load",()=>{if(O(),K(),g&&o.ui){o.ui.highlightRunInUI(null);const e=document.getElementById("map-stats-panel");e&&(e.style.display="none")}if(!x){a.jumpTo({center:k,zoom:7.8,pitch:0,bearing:0}),a.once("idle",()=>{if(x)return;x=!0,v(y(e.initial))});return}v()});const M=e=>{if(e.detail&&e.detail.year){const i=n(j,e.detail,Boolean(C?.matches));t.poster.reset(r),E(e.detail,i),o.ui?.highlightRunInUI(null);const s=document.getElementById("map-stats-panel");s&&(s.style.display="none")}};document.addEventListener("koobaiYearChanged",M),document.addEventListener("koobaiMonthChanged",M);const z={flyTo:n=>{const w=i.normalizeId,l=w(n),p=document.getElementById("map-stats-panel");if(O(),R(),t.poster.reset(r),w(g)===l){v(y(e.detailReturn)),o.ui&&o.ui.highlightRunInUI(null),p&&(p.style.display="none");return}g=l,S(),o.ui&&o.ui.highlightRunInUI(l),a.getLayer("runs-core")&&a.setPaintProperty("runs-core","line-opacity",0),a.getSource("highlight-run-source")&&a.getSource("highlight-run-source").setData({type:"FeatureCollection",features:[]});const c=o.data.find(e=>w(e.run_id)===l);if(!c)return;const{displayCoordinates:A,hasDisplayTrack:x,landmarkRoute:T}=L(c);let b=null,F=null;if(x&&(b=new m.LngLatBounds,A.forEach(e=>b.extend(e)),F=b.getCenter()),p&&r&&t.poster.render({bounds:b,config:d,hasDisplayTrack:x,map:a,model:i,onClose:()=>{v(y(e.detailReturn)),o.ui&&o.ui.highlightRunInUI(null),p.style.display="none"},run:c,statsPanel:p,wrapper:r}),!x){B(),W(c);return}a.getSource("highlight-run-source")&&a.getSource("highlight-run-source").setData({type:"FeatureCollection",features:[{type:"Feature",properties:{type:c.type,line_width:T?N(T,c):4},geometry:{type:"LineString",coordinates:A}}]});const M=a.cameraForBounds(b,{padding:60}),k=M?M.zoom+.6:15,_=a.getBearing(),E=y(e.runFlight);if(a.flyTo({center:F,zoom:k,pitch:65,bearing:_,duration:E,essential:!1}),E===0)return;let j=null,C=0;const z=t=>{const n=document.getElementById("map-wrapper"),i=n&&n.classList.contains("show-poster-mode");if(String(g)!==l||i||document.hidden){f();return}j===null&&(j=t);const r=Math.min(Math.max(t-j,0),50);j=t,C=Math.min(C+r,e.runOrbit);const o=C/e.runOrbit,c=s(_,k,o);if(a.jumpTo(c),o>=1){a.jumpTo({bearing:_,pitch:65,zoom:k}),u=null;return}u=requestAnimationFrame(z)};h=setTimeout(()=>{h=null,u=requestAnimationFrame(z)},E)}};return o.map=z,z}}(),function(){"use strict";const e=window.JingzheExerciseModules=window.JingzheExerciseModules||{},t=()=>{const t=document.getElementById("bento-hero"),n=document.getElementById("map-wrapper");if(!t||!n)return;let e=!1;window.addEventListener("scroll",()=>{if(e)return;window.requestAnimationFrame(()=>{const s=t.getBoundingClientRect().bottom<80;n.classList.toggle("sticky-map",s),e=!1}),e=!0},{passive:!0})};e.initialize=()=>{const n=window.KoobaiRun;if(!n||n.initialized)return n;const o=["createModel","createRoutes","createUI","createMapAdapter"],s=o.find(t=>typeof e[t]!="function");return s||!e.poster?(console.error(`Exercise module failed to load: ${s||"poster"}`),n):(n.initialized=!0,n.model=e.createModel(n.contract),n.SPORT_COLORS=n.model.sportColors,n.map={flyTo(){}},n.ui=e.createUI(n,n.model),n.map=e.createMapAdapter(n,n.model)||n.map,t(),n)},document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e.initialize,{once:!0}):e.initialize()}()