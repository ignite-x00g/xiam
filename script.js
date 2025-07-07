/* ---------- Helper ---------- */
const qs=(sel,ctx=document)=>ctx.querySelector(sel);
const qsa=(sel,ctx=document)=>[...ctx.querySelectorAll(sel)];

/* ---------- Modal open/close ---------- */
qsa('[data-modal]').forEach(btn=>btn.onclick=()=>qs('#'+btn.dataset.modal).classList.add('active'));
qsa('[data-close]').forEach(btn=>btn.onclick=()=>btn.closest('.modal-overlay').classList.remove('active'));
window.addEventListener('click',e=>qsa('.modal-overlay.active').forEach(m=>{if(e.target===m)m.classList.remove('active')})); // click-outside
window.addEventListener('keydown',e=>{if(e.key==='Escape')qsa('.modal-overlay.active').forEach(m=>m.classList.remove('active'))});

/* ---------- Mobile nav + toggles ---------- */
qs('#menuToggle').onclick=()=>qs('#mobileNav').classList.toggle('active');
qs('#mobile-services-toggle').onclick=()=>qs('#mobile-services-menu').classList.toggle('active');
qs('#mobile-language-toggle').onclick=()=>{
 const isEN=qs('#mobile-language-toggle').textContent==='EN';
 qsa('[data-en]').forEach(el=>el.textContent=isEN?el.dataset.es:el.dataset.en);
 qs('#mobile-language-toggle').textContent=isEN?'ES':'EN';
};
qs('#mobile-theme-toggle').onclick=()=>{
 const light=qs('#mobile-theme-toggle').textContent==='Light';
 document.body.classList.toggle('dark',light);
 qs('#mobile-theme-toggle').textContent=light?'Dark':'Light';
};

/* ---------- Join dynamic sections ---------- */
qsa('#joinModal .form-section').forEach(section=>{
 const inputs   =qs('.inputs',section);
 const addBtn   =qs('.add',section);
 const rmBtn    =qs('.remove',section);
 const accBtn   =qs('.accept-btn',section);
 const editBtn  =qs('.edit-btn',section);
 if(!addBtn)return; // skip plain sections
 addBtn.onclick=()=>{const ip=document.createElement('input');ip.type='text';ip.placeholder=`Enter ${qs('h2',section).textContent}`;inputs.appendChild(ip);ip.focus()};
 rmBtn.onclick =()=>inputs.lastElementChild&&inputs.removeChild(inputs.lastElementChild);
 accBtn.onclick=()=>{
   if(!inputs.children.length)return alert('Add at least one entry.');
   inputs.querySelectorAll('input').forEach(i=>i.disabled=true);
   section.classList.add('completed');accBtn.style.display='none';editBtn.style.display='inline-block';
 };
 editBtn.onclick=()=>{
   inputs.querySelectorAll('input').forEach(i=>i.disabled=false);
   section.classList.remove('completed');accBtn.style.display='inline-block';editBtn.style.display='none';
 };
});

/* ---------- Simple submit stubs ---------- */
qs('#joinForm').onsubmit=e=>{e.preventDefault();alert('Join form submitted');qs('#joinModal').classList.remove('active')};
qs('#contactForm').onsubmit=e=>{e.preventDefault();alert('Contact form submitted');qs('#contactModal').classList.remove('active')};

/* ---------- Chatbot ---------- */
const chatLog=qs('#chat-log'),chatInput=qs('#chatbot-input'),chatForm=qs('#chatbot-input-row'),sendBtn=qs('#chatbot-send'),humanChk=qs('#human-check');
humanChk.onchange=()=>sendBtn.disabled=!humanChk.checked;
function addMsg(text,cls){const d=document.createElement('div');d.className=`chat-msg ${cls}`;d.textContent=text;chatLog.appendChild(d);chatLog.scrollTop=chatLog.scrollHeight;}
chatForm.onsubmit=async e=>{
 e.preventDefault();if(!humanChk.checked)return;
 const msg=chatInput.value.trim();if(!msg)return;
 addMsg(msg,'user');chatInput.value='';addMsg('…','bot');
 try{
   const r=await fetch('https://your-cloudflare-worker.example.com/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})});
   const d=await r.json();chatLog.lastChild.textContent=d.reply||'No reply.';
 }catch{chatLog.lastChild.textContent="Error: Can't reach AI.";}
};
