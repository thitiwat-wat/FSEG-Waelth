document.querySelector('.menu-toggle').addEventListener('click',function(){let n=document.querySelector('.nav');let open=n.classList.toggle('open');this.setAttribute('aria-expanded',open);});document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();f.querySelector('.form-result').textContent='ข้อมูลผ่านการตรวจสอบในเบราว์เซอร์เท่านั้น ยังไม่ได้ส่งหรือบันทึก กรุณาติดต่อ 092-662-1554 หรือ LINE @thitiwat';}));document.querySelectorAll('.copyline').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('@thitiwat');b.textContent='คัดลอก @thitiwat แล้ว';const mark=document.createElement('img');mark.src='/social-icons/line.svg';mark.className='social-brand-icon';mark.alt='';mark.setAttribute('aria-hidden','true');b.prepend(mark);}catch{b.textContent='LINE ID: @thitiwat — กรุณาคัดลอกด้วยตนเอง';}}));
// A short press response, with no delay to navigation or form behavior.
document.querySelectorAll('.button,.textbutton,.menu-toggle,.card').forEach(control=>{
 control.addEventListener('pointerdown',event=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !control.classList.contains('button')) return;
  const bounds=control.getBoundingClientRect(), size=Math.max(bounds.width,bounds.height)*2;
  const wave=document.createElement('span');wave.className='press-wave';wave.setAttribute('aria-hidden','true');
  Object.assign(wave.style,{width:size+'px',height:size+'px',left:event.clientX-bounds.left-size/2+'px',top:event.clientY-bounds.top-size/2+'px'});
  control.append(wave);wave.addEventListener('animationend',()=>wave.remove(),{once:true});
 });
});
const menuControl=document.querySelector('.menu-toggle');
menuControl.addEventListener('click',()=>{const open=menuControl.getAttribute('aria-expanded')==='true';menuControl.textContent=open?'✕':'☰';menuControl.setAttribute('aria-label',open?'ปิดเมนู':'เปิดเมนู');});
document.addEventListener('keydown',event=>{if(event.key==='Escape' && menuControl.getAttribute('aria-expanded')==='true'){menuControl.click();menuControl.focus();}});

// Original homepage content: accessible article groups and source-copy details.
document.querySelectorAll('.imported-home .marquee-category-label').forEach(label=>{
 const carousel=label.nextElementSibling;if(!carousel?.classList.contains('swiper'))return;
 const group=document.createElement('details');group.className='source-article-category';
 const summary=document.createElement('summary');summary.append(...label.childNodes);const plus=document.createElement('span');plus.textContent='＋';plus.setAttribute('aria-hidden','true');summary.append(plus);
 label.before(group);group.append(summary,carousel);label.remove();
});
const sourceDialog=document.querySelector('.source-why-dialog');
if(sourceDialog){document.querySelectorAll('.imported-home .why-readmore').forEach(button=>button.addEventListener('click',()=>{sourceDialog.querySelector('h3').textContent=button.dataset.whyTitle;sourceDialog.querySelector('p').textContent=button.dataset.whyBody;sourceDialog.showModal();}));sourceDialog.querySelector('.source-dialog-close').addEventListener('click',()=>sourceDialog.close());sourceDialog.addEventListener('click',event=>{if(event.target===sourceDialog){const rect=sourceDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)sourceDialog.close();}});}

// Consistent brand icons, scaled to the surrounding text.
(()=>{
 const names={facebook:'facebook',youtube:'youtube',linkedin:'linkedin',line:'line'};
 const icon=brand=>{const img=document.createElement('img');img.src='/social-icons/'+brand+'.svg';img.className='social-brand-icon';img.alt='';img.setAttribute('aria-hidden','true');img.width=16;img.height=16;return img;};
 document.querySelectorAll('a[href]').forEach(a=>{
  let host;try{host=new URL(a.href).hostname.toLowerCase();}catch{return;}
  const brand=/^(www\.)?facebook\.com$/.test(host)?'facebook':/^(www\.)?(youtube\.com|youtu\.be)$/.test(host)?'youtube':/^(www\.)?linkedin\.com$/.test(host)?'linkedin':/^(line\.me|lin\.ee)$/.test(host)?'line':null;
  if(!brand)return;
  // Keep existing photo links intact; label text links and icon-only marks.
  if(a.querySelector('img') && !a.textContent.trim())return;
  if(a.querySelector('.social-brand-icon'))return;
  a.prepend(icon(brand));a.classList.add('social-branded-link');
 });
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(node=>{
  if(!/\bLINE\b/i.test(node.textContent))return;
  if(node.parentElement.closest('a,script,style,textarea,select,svg,title,.social-line-label'))return;
  const fragment=document.createDocumentFragment();let last=0;const text=node.textContent;const pattern=/\bLINE\b/gi;let match;
  while((match=pattern.exec(text))){fragment.append(text.slice(last,match.index));const label=document.createElement('span');label.className='social-line-label';label.append(icon('line'),match[0]);fragment.append(label);last=match.index+match[0].length;}
  fragment.append(text.slice(last));node.replaceWith(fragment);
 });
})();
