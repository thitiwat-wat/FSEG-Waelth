import sanitizeHtml from 'sanitize-html';
import pages from '../legacy-pages.json';
import { env } from 'cloudflare:workers';
const admin='thitiwat.tl@gmail.com';
const categories=['อาชีพตัวแทนไทยประกันชีวิต','แบบประกันไทยประกันชีวิต','ข่าวสารและกิจกรรม'];
const oldCategories=['ความรู้ด้านอาชีพ','ความรู้ด้านประกัน','ความรู้ทั่วไป'];
const categoryName=(c:string)=>categories[oldCategories.indexOf(c)]||c;
export const esc=(s:any)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const plain=(s:string)=>sanitizeHtml(s,{allowedTags:[],allowedAttributes:{}});
const clean=(s:string)=>sanitizeHtml(s, {
 allowedTags:['div','p','br','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','ul','ol','li','blockquote','a','img','table','thead','tbody','tr','th','td','span'],
 allowedAttributes:{a:['href','title'],img:['src','alt'],'*':['style']},
 allowedSchemes:['https','http','mailto'],
 allowedStyles:{'*':{'text-align':[/^(left|right|center|justify)$/],color:[/^#[0-9a-f]{3,8}$/i,/^rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\)$/],'background-color':[/^#[0-9a-f]{3,8}$/i,/^rgb\(\d{1,3}, ?\d{1,3}, ?\d{1,3}\)$/]}},
 transformTags:{font:(tag,attrs)=>({tagName:'span',attribs:attrs.color?{style:'color:'+attrs.color}:{}}),img:(tag,attrs)=>({tagName:tag,attribs:attrs.src?.startsWith('/media/')?attrs:{}})}
});
const html=(s:string,status=200)=>new Response(s,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const json=(v:any,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export function shell(main:string,title:string){return (pages as any)['/knowledge/'].replace(/<title>.*?<\/title>/s,`<title>${esc(title)} | FSEG Wealth Consultant</title>`).replace(/<main[^>]*>.*?<\/main>/s,`<main id="main">${main}</main>`).replace('</head>','<link rel="stylesheet" href="/cms.css"></head>');}
function authorized(req:Request){const email=req.headers.get('oai-authenticated-user-email')?.toLowerCase();return Boolean(req.headers.get('oai-authenticated-user-id')) && (email===admin || (import.meta.env.DEV && email==='seedy@sites.test'));}
function validate(x:any){
 x.category=categoryName(x.category);if(!categories.includes(x.category))throw Error('กรุณาเลือกหมวดหมู่');
 const title=plain(String(x.title??'')).trim();if(!title||title.length>240)throw Error('กรุณาระบุหัวข้อไม่เกิน 240 ตัวอักษร');
 if(typeof x.body!=='string'||x.body.length>250000||String(x.intro??'').length>20000)throw Error('เนื้อหายาวเกินกำหนด');
 const body=clean(x.body);if(!plain(body).trim()&&!body.includes('<img'))throw Error('กรุณาระบุเนื้อหาเต็ม');
 if(!['draft','published'].includes(x.status))throw Error('สถานะไม่ถูกต้อง');
 const cover=x.cover||null;if(cover&&!/^\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(cover))throw Error('ภาพปกไม่ถูกต้อง');
 return {title,category:x.category,intro:clean(String(x.intro??'')),body,cover,status:x.status};
}
function authorBlock(category:string){
 const cat=categoryName(category);
 const cta=cat===categories[0]?'<a class="button primary" href="/career/apply/">สนใจสมัครตัวแทน <span aria-hidden="true">↗</span></a>':cat===categories[1]?'<a class="button primary" href="/contact/?topic=insurance">สนใจทำประกันชีวิต <span aria-hidden="true">↗</span></a>':'';
 return `<aside class="cms-author" aria-label="ข้อมูลผู้เขียน"><div class="cms-author-top"><img src="/advisor.png" alt="ธิติวัฒน์ วัฒนพลไพศาล" width="210" height="265" loading="lazy"><div><h2>ผู้เขียนและผู้ตรวจสอบเนื้อหา:</h2><a class="cms-author-name" href="/about/thitiwat/#full-profile">ธิติวัฒน์ วัฒนพลไพศาล</a><p>ผู้จัดการภาคอาวุโส ( ผู้บริหารตัวแทนไทยประกันชีวิต )</p><a class="cms-author-linkedin" href="https://www.linkedin.com/in/thitiwat-wattanaphonpaisarn-3955b410b" target="_blank" rel="noopener noreferrer"><img class="social-brand-icon" src="/social-icons/linkedin.svg" alt="" aria-hidden="true"> LinkedIn</a></div></div><blockquote>“ผมเชื่อในการผสมผสานประสบการณ์เข้ากับพลังของคนรุ่นใหม่ ตลอด 20 ปีในธุรกิจประกันชีวิต ผมเปลี่ยนจากวิศวกรมาเป็นผู้สร้างทีม ปัจจุบันเป้าหมายสูงสุดของผมคือการถ่ายทอดความรู้ เพื่อปั้นพาร์ทเนอร์และผู้บริหารรุ่นใหม่ให้เติบโตอย่างแข็งแกร่ง และเป็นที่พึ่งพิงด้านการวางแผนชีวิตให้กับผู้คนได้จริง”</blockquote><p class="cms-author-bottom"><a href="https://www.linkedin.com/in/thitiwat-wattanaphonpaisarn-3955b410b" target="_blank" rel="noopener noreferrer"><img class="social-brand-icon" src="/social-icons/linkedin.svg" alt="" aria-hidden="true"> LinkedIn</a></p><div class="cms-author-cta">${cta}</div></aside>`;
}
function articleDate(value:string|undefined|null,fallback:string){if(!value)return fallback;const date=new Date(value);return Number.isNaN(date.getTime())?fallback:esc(new Intl.DateTimeFormat('th-TH-u-ca-gregory',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Bangkok'}).format(date));}
function articleMeta(a:any){const published=a.published_at||(a.status==='published'?a.created_at:null);return `<div class="cms-article-dates"><p>วันเผยแพร่เมื่อ : ${published?`<time datetime="${esc(published)}">${articleDate(published,'ยังไม่ระบุ')}</time>`:'ยังไม่เผยแพร่'}</p><p>ปรับปรุงเนื้อหาบทความ : ${a.updated_at?`<time datetime="${esc(a.updated_at)}">${articleDate(a.updated_at,'ยังไม่ระบุ')}</time>`:'ยังไม่บันทึก'}</p></div>`;}
function article(a:any){return `<article class="cms-article"><p class="eyebrow">${esc(categoryName(a.category))}</p><h1>${esc(a.title)}</h1>${articleMeta(a)}${a.cover?`<img class="cms-cover" src="${esc(a.cover)}" alt="${esc(a.title)}">`:''}${a.intro?`<div class="cms-rich cms-intro">${a.intro}</div>`:''}<div class="cms-rich">${a.body}</div>${authorBlock(a.category)}<p><a href="/knowledge/">← กลับคลังความรู้</a></p></article>`;}
function articleCards(rows:any[]){return rows.map(a=>`<a class="cms-card" href="/knowledge/articles/${esc(a.id)}/">${a.cover?`<img loading="lazy" src="${esc(a.cover)}" alt="${esc(a.title)}">`:''}<div><small>${esc(categoryName(a.category))}</small><h2>${esc(a.title)}</h2><p>${esc(plain(a.intro).slice(0,180))}</p><span>อ่านเพิ่มเติม ↗</span></div></a>`).join('');}
function latestGroups(rows:any[],selected?:string|null){return `<section class="section cms-latest"><div class="wrap"><div class="cms-latest-heading"><h2>บทความและข่าวสารล่าสุด</h2><p>อัปเดตความรู้ เทคนิคการเลือกแบบประกัน และกิจกรรมต่าง ๆ จากทีมงาน FSEG Wealth Consultant</p></div>${categories.map(cat=>`<details class="cms-latest-category" ${selected===cat?'open':''}><summary>${cat}<span class="cms-latest-plus" aria-hidden="true">＋</span></summary><div class="cms-grid">${articleCards(rows.filter(a=>categoryName(a.category)===cat))||'<p class="cms-no-articles">ยังไม่มีบทความที่เผยแพร่ในหมวดนี้</p>'}</div></details>`).join('')}<div class="cms-latest-more"><a class="button primary" href="/knowledge/#latest-articles">ดูบทความทั้งหมด</a></div></div></section>`;}
export async function handle(req:Request):Promise<Response>{
 const url=new URL(req.url),path=url.pathname,db=(env as any).DB,bucket=(env as any).BUCKET;
 if(path.startsWith('/media/')){
  if(req.method!=='GET'&&req.method!=='HEAD')return new Response(null,{status:405});
  if(!/^\/media\/[a-f0-9-]+\.(png|jpg|webp)$/.test(path))return new Response(null,{status:404});
  const obj=await bucket.get(path.slice(7));if(!obj)return new Response(null,{status:404});
  return new Response(req.method==='HEAD'?null:obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public,max-age=86400'}});
 }
 if(path==='/admin/'||path==='/admin'){
  if(!req.headers.get('oai-authenticated-user-id'))return html(shell('<section class="section"><div class="wrap"><h1>จัดการบทความ</h1><p>เข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อดำเนินการ</p><a class="button primary" target="_top" href="/signin-with-chatgpt?return_to=%2Fadmin%2F">เข้าสู่ระบบด้วย ChatGPT</a></div></section>','เข้าสู่ระบบผู้ดูแล'));
  if(!authorized(req))return html(shell('<section class="section"><div class="wrap"><h1>บัญชีนี้ไม่มีสิทธิ์จัดการบทความ</h1><p>กรุณาใช้บัญชีผู้ดูแลที่กำหนดไว้</p><a href="/signout-with-chatgpt?return_to=%2Fadmin%2F" target="_top">ออกจากระบบ</a></div></section>','ไม่มีสิทธิ์'),403);
  return html(shell('<div id="cms-admin"></div><script src="/cms-admin.js" defer></script>','จัดการบทความ'));
 }
 if(path.startsWith('/api/cms')){
  if(!authorized(req))return json({error:'กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล'},403);
  if(!['GET','HEAD'].includes(req.method)&&req.headers.get('origin')!==url.origin)return json({error:'แหล่งที่มาของคำขอไม่ถูกต้อง'},403);
  try{
   if(path==='/api/cms/articles'&&req.method==='GET')return json((await db.prepare("SELECT id,category,title,cover,status,version,updated_at FROM articles WHERE status!='archived' ORDER BY updated_at DESC").all()).results.map((a:any)=>({...a,category:categoryName(a.category)})));
   if(path==='/api/cms/upload'&&req.method==='POST'){
    if(Number(req.headers.get('content-length'))>6*1024*1024)return json({error:'ไฟล์ใหญ่เกินกำหนด'},413);
    const form=await req.formData(),f=form.get('file');if(!(f instanceof File)||f.size>5*1024*1024)throw Error('เลือกภาพ PNG, JPEG หรือ WebP ไม่เกิน 5 MB');
    const b=new Uint8Array(await f.arrayBuffer());let type='',ext='';
    if(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71){type='image/png';ext='png';}
    else if(b[0]===255&&b[1]===216&&b[2]===255){type='image/jpeg';ext='jpg';}
    else if(new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP'){type='image/webp';ext='webp';}
    else throw Error('ไฟล์ต้องเป็นภาพ PNG, JPEG หรือ WebP');
    const key=crypto.randomUUID()+'.'+ext;await bucket.put(key,b,{httpMetadata:{contentType:type}});return json({url:'/media/'+key});
   }
   if(path==='/api/cms/sanitize'&&req.method==='POST'){const x=await req.json() as any;if(typeof x.html!=='string'||x.html.length>250000)throw Error('เนื้อหายาวเกินกำหนด');return json({html:clean(x.html)});}
   if(path==='/api/cms/preview'&&req.method==='POST')return html(shell(article(validate(await req.json())),'ตัวอย่างบทความ'));
   const match=path.match(/^\/api\/cms\/articles\/([a-f0-9-]+)$/),id=match?.[1];
   if(id&&req.method==='GET'){const a=await db.prepare('SELECT * FROM articles WHERE id=?').bind(id).first();return a?json({...a,category:categoryName(a.category)}):json({error:'ไม่พบบทความ'},404);}
   if(id&&req.method==='DELETE'){await db.prepare("UPDATE articles SET status='archived',updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run();return json({ok:true});}
   if((id&&req.method==='PUT')||(path==='/api/cms/articles'&&req.method==='POST')){
    if(Number(req.headers.get('content-length'))>300000)return json({error:'ข้อมูลใหญ่เกินกำหนด'},413);
    const raw=await req.json() as any,a=validate(raw),now=new Date().toISOString();
    if(id){const result=await db.prepare("UPDATE articles SET category=?,title=?,intro=?,body=?,cover=?,status=?,updated_at=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END,version=version+1 WHERE id=? AND version=?").bind(a.category,a.title,a.intro,a.body,a.cover,a.status,now,a.status,now,id,raw.version).run();if(!result.meta.changes)return json({error:'บทความถูกแก้ไขจากอีกหน้าต่าง กรุณาเปิดใหม่ก่อนบันทึก'},409);return json({id,version:raw.version+1});}
    const key=crypto.randomUUID();await db.prepare('INSERT INTO articles (id,category,title,intro,body,cover,status,version,created_at,updated_at,published_at) VALUES (?,?,?,?,?,?,?,1,?,?,?)').bind(key,a.category,a.title,a.intro,a.body,a.cover,a.status,now,now,a.status==='published'?now:null).run();return json({id:key,version:1});
   }
   return json({error:'ไม่พบคำขอ'},404);
  }catch(e:any){return json({error:e.message||'ดำเนินการไม่สำเร็จ'},400);}
 }
 if(path.startsWith('/knowledge/articles/')){const id=path.split('/')[3];const a=await db.prepare("SELECT * FROM articles WHERE id=? AND status='published'").bind(id).first();return a?html(shell(article(a),a.title)):html(shell('<section class="section"><div class="wrap"><h1>ไม่พบบทความ</h1><a href="/knowledge/">กลับคลังความรู้</a></div></section>','ไม่พบบทความ'),404);}
 const key=path.endsWith('/')?path:path+'/';let page=(pages as any)[key];if(!page)return html(shell('<section class="section"><div class="wrap"><h1>ไม่พบหน้านี้</h1><a href="/">หน้าหลัก</a></div></section>','ไม่พบหน้านี้'),404);
 if(key==='/knowledge/'||key==='/'){
  const rows=(await db.prepare("SELECT id,category,title,intro,cover FROM articles WHERE status='published' ORDER BY created_at DESC, updated_at DESC").all()).results;
  page=page.replace('</head>','<link rel="stylesheet" href="/cms.css"></head>');
  if(key==='/knowledge/'){
   const selected=categoryName(url.searchParams.get('category')||'');
   const filter=['ทั้งหมด',...categories].map(c=>`<a class="button outline" href="/knowledge/${c==='ทั้งหมด'?'#latest-articles':'?category='+encodeURIComponent(c)+'#latest-articles'}">${c}</a>`).join('');
   page=page.replace(/(<main[^>]*>.*?<\/section>.*?<\/section>)/s,`$1<div id="latest-articles"><div class="wrap cms-filters">${filter}</div>${latestGroups(rows,selected)}</div>`);
  }else{
   for(const [index,kind] of ['career','insurance','news'].entries()){
    const marker=new RegExp('(<div class="swiper swiper-'+kind+'">\\s*<div class="swiper-wrapper">)');
    const cards=rows.filter((a:any)=>categoryName(a.category)===categories[index]).map((a:any)=>`<div class="swiper-slide marquee-item"><a class="article-card" href="/knowledge/articles/${esc(a.id)}/"><div class="card-img-box">${a.cover?`<img class="card-img" src="${esc(a.cover)}" alt="${esc(a.title)}" loading="lazy">`:''}</div><div class="card-body"><span class="card-badge">${categories[index]}</span><div class="card-title"><h2>${esc(a.title)}</h2></div><div class="card-desc">${esc(plain(a.intro).slice(0,180))}</div><div class="card-btn-more">อ่านเพิ่มเติม ↗</div></div></a></div>`).join('');
    page=page.replace(marker,'$1'+cards);
   }
   page=page.replace('href="https://www.fsegwealthconsultant.com/articles.php"','href="/knowledge/#latest-articles"');
  }
 }
 const guideCategory=key==='/knowledge/prepare-consultation/'?categories[1]:categories[0];
 if(['/knowledge/getting-started/','/knowledge/second-career/','/knowledge/prepare-consultation/'].includes(key))page=page.replace('</head>','<link rel="stylesheet" href="/cms.css"></head>').replace('</main>',`<section class="section"><div class="wrap cms-guide-author">${authorBlock(guideCategory)}</div></section></main>`);

 return html(page);
}
