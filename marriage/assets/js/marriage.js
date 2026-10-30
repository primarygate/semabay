/* SEMA BAY — Muslim Marriage page.
   Sample members: photos supplied by SEMA BAY for the preview (assets/imgs/marriage/members), not real members.
   Chat threads/messages use /api (temporary file store) so the UI can be tested in the browser; swap in a real DB later.
   Join applications still wait for the member system. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var SECTIONS_STEP=2, DAILY_NEW_CHATS=10;
  var LEGACY_CHATS='semabay_mm_chats_v1', LEGACY_DAY='semabay_mm_newchats_v1';
  function authed(){return !!(window.SBAuth&&SBAuth.user&&SBAuth.user())}
  function needLogin(after){
    if(!window.SBAuth){alert('Sign in is not available yet.');return}
    SBAuth.require(after);
  }
  /* Advert images made by SEMA BAY (assets/imgs/marriage). One opens each section of members. */
  var ADS=[["mm-ad-28.webp", 1200, 800, "Wedding procession with family and children"], ["mm-ad-23.webp", 1200, 800, "Wedding arrival with roses"], ["mm-ad-02.webp", 1200, 1200, "Elegant Nikah Ceremony Handshake"], ["mm-ad-24.webp", 1200, 800, "Family welcoming a new baby"], ["mm-ad-13.webp", 1200, 800, "Lavish Somali Nikah Ceremony in Gold and Green"], ["mm-ad-25.webp", 1200, 800, "Parents and child with their newborn"], ["mm-ad-16.webp", 1200, 1200, "Luxurious Gold and White Nikah Ceremony"], ["mm-ad-26.webp", 1200, 800, "Family meeting their newborn"], ["mm-ad-08.webp", 1200, 800, "Joyful Islamic Wedding Celebration"], ["mm-ad-27.webp", 1200, 800, "New parents in the maternity ward"], ["mm-ad-17.webp", 1200, 1200, "Luxurious Islamic Wedding Ceremony"], ["mm-ad-04.webp", 1200, 800, "Elegant Women-Only Wedding Celebration"], ["mm-ad-20.webp", 1200, 1200, "Nikah Ceremony Handshake in Mosque Hall"], ["mm-ad-12.webp", 1200, 800, "Lavish Red and Gold Wedding Celebration"], ["mm-ad-03.webp", 1200, 1200, "Elegant Nikah Ceremony in Ornate Mosque Interior"], ["mm-ad-22.webp", 1200, 800, "Vibrant Somali Wedding Banquet Celebration"], ["mm-ad-18.webp", 1200, 1200, "Luxurious Muslim Wedding Ceremony"], ["mm-ad-07.webp", 1200, 800, "Joyful Gold-and-White Wedding Celebration"], ["mm-ad-01.webp", 1200, 800, "Elegant Henna Celebration in a Grand Ballroom"], ["mm-ad-10.webp", 1200, 800, "Lavish Purple and Gold Women’s Celebration"], ["mm-ad-14.webp", 1200, 800, "Lavish Wedding Cake Celebration"], ["mm-ad-06.webp", 1200, 800, "Grand Golden Wedding Feast Hall"], ["mm-ad-15.webp", 1200, 800, "Lavish Wedding Dessert Banquet"], ["mm-ad-05.webp", 1200, 800, "Gathered in Prayer Among Roses"], ["mm-ad-09.webp", 1200, 800, "Lavish Purple and Gold Quran Circle"], ["mm-ad-11.webp", 1200, 800, "Lavish Quran Recitation Gathering"], ["mm-ad-19.webp", 1200, 800, "Luxurious Quran Recitation Circle"], ["mm-ad-21.webp", 1200, 800, "Ornate Islamic Prayer Gathering"]];

  /* ---------- sample members: first name, age, city, country, marital status, last seen ---------- */
  var SEEN=['Online now','Active 12 min ago','Last seen 2 hrs ago','Online now','Last seen 5 hrs ago','Last seen yesterday','Active 40 min ago','Online now','Last seen 3 days ago','Last seen 8 hrs ago'];
  var W=[['Zahra',26,'Mogadishu','Somalia','Never married'],['Hamdi',26,'Mogadishu','Somalia','Never married'],['Amina',24,'Nairobi','Kenya','Never married'],['Ayesha',27,'Karachi','Pakistan','Never married'],
         ['Shukri',28,'Hargeisa','Somalia','Never married'],['Hodan',29,'Hargeisa','Somalia','Divorced'],['Fatima',27,'Dubai','United Arab Emirates','Never married'],['Fartun',25,'Baidoa','Somalia','Never married'],
         ['Noor',25,'Amman','Jordan','Never married'],['Khadija',31,'Minneapolis','United States','Divorced'],['Ilhan',27,'Oslo','Norway','Never married'],['Ayaan',23,'Garowe','Somalia','Never married'],
         ['Mariam',29,'Dhaka','Bangladesh','Never married'],['Ubah',30,'Burao','Somalia','Divorced'],['Sahra',28,'London','United Kingdom','Never married'],['Maryam',25,'Riyadh','Saudi Arabia','Never married'],
         ['Nimco',24,'Garissa','Kenya','Never married'],['Aisha',26,'Lagos','Nigeria','Never married'],['Hanan',30,'Kampala','Uganda','Widowed'],['Ifrah',29,'Stockholm','Sweden','Never married'],
         ['Ikran',26,'Doha','Qatar','Never married'],['Siti',28,'Kuala Lumpur','Malaysia','Never married'],['Hawa',31,'Jigjiga','Ethiopia','Divorced'],['Asha',33,'Mombasa','Kenya','Divorced'],
         ['Nasra',27,'Kismayo','Somalia','Never married'],['Zamzam',26,'Amsterdam','Netherlands','Never married'],['Nur',24,'Penang','Malaysia','Never married'],['Ruqiya',25,'Bosaso','Somalia','Never married'],
         ['Sacdiya',28,'Galkayo','Somalia','Never married'],['Sumaya',28,'Toronto','Canada','Never married'],['Zainab',30,'Cairo','Egypt','Divorced'],['Hafsa',25,'Cardiff','United Kingdom','Never married'],
         ['Layla',30,'Jeddah','Saudi Arabia','Divorced'],['Muna',24,'Nairobi','Kenya','Never married'],['Anisa',27,'Melbourne','Australia','Never married'],['Sana',27,'Lahore','Pakistan','Never married'],
         ['Deeqa',27,'Djibouti City','Djibouti','Never married'],['Khadra',32,'Beledweyne','Somalia','Widowed'],['Safiya',32,'Columbus','United States','Widowed'],['Huda',26,'Istanbul','Turkey','Never married'],
         ['Ladan',26,'Wajir','Kenya','Never married'],['Idil',26,'Muscat','Oman','Never married'],['Najma',29,'Addis Ababa','Ethiopia','Divorced'],['Ramla',29,'Minneapolis','United States','Never married'],
         ['Fatou',31,'Dakar','Senegal','Divorced'],['Samira',25,'Mogadishu','Somalia','Never married'],['Suad',30,'Berbera','Somalia','Divorced'],['Halima',31,'Nairobi','Kenya','Divorced'],
         ['Nadia',25,'Jakarta','Indonesia','Never married'],['Warda',24,'Dubai','United Arab Emirates','Never married'],['Faduma',27,'Hargeisa','Somalia','Never married'],['Rahma',24,'Dubai','United Arab Emirates','Never married'],
         ['Leyla',27,'Nairobi','Kenya','Never married'],['Amira',28,'Accra','Ghana','Never married'],['Bushra',29,'Birmingham','United Kingdom','Never married'],['Kowsar',26,'Seattle','United States','Never married'],
         ['Iman',28,'Doha','Qatar','Never married'],['Sagal',30,'Garowe','Somalia','Divorced'],['Yasmin',27,'Ottawa','Canada','Never married'],['Hibo',33,'Kampala','Uganda','Widowed']];
  var M=[['Hamza',30,'Nairobi','Kenya','Never married'],['Abdirizak',30,'Mogadishu','Somalia','Never married'],['Abdirahman',32,'Mogadishu','Somalia','Never married'],['Abdulkadir',31,'Addis Ababa','Ethiopia','Never married'],
         ['Bashir',32,'Hargeisa','Somalia','Never married'],['Yusuf',28,'Dubai','United Arab Emirates','Never married'],['Mohamed',34,'Hargeisa','Somalia','Divorced'],['Mukhtar',29,'Oslo','Norway','Never married'],
         ['Rashid',30,'Abu Dhabi','United Arab Emirates','Never married'],['Ahmed',29,'London','United Kingdom','Never married'],['Ayub',27,'Garissa','Kenya','Never married'],['Ibrahim',31,'Minneapolis','United States','Never married'],
         ['Musa',29,'Lagos','Nigeria','Never married'],['Hamse',31,'Burao','Somalia','Divorced'],['Omar',27,'Doha','Qatar','Never married'],['Bilal',26,'Mombasa','Kenya','Never married'],
         ['Sakariye',28,'Stockholm','Sweden','Never married'],['Abubakar',33,'Kano','Nigeria','Divorced'],['Khalid',35,'Riyadh','Saudi Arabia','Divorced'],['Yasin',30,'Jigjiga','Ethiopia','Never married'],
         ['Mustafa',30,'Garowe','Somalia','Never married'],['Karim',28,'Amman','Jordan','Never married'],['Dahir',33,'Galkayo','Somalia','Divorced'],['Hassan',33,'Kampala','Uganda','Widowed'],
         ['Idris',28,'Bosaso','Somalia','Never married'],['Farah',29,'Amsterdam','Netherlands','Never married'],['Imran',32,'Karachi','Pakistan','Never married'],['Abdullahi',29,'Toronto','Canada','Never married'],
         ['Jibril',26,'Cardiff','United Kingdom','Never married'],['Ismail',31,'Jeddah','Saudi Arabia','Never married'],['Nasser',34,'Riyadh','Saudi Arabia','Divorced'],['Abdiwali',34,'Baidoa','Somalia','Never married'],
         ['Faisal',27,'Djibouti City','Djibouti','Never married'],['Ali',33,'Columbus','United States','Divorced'],['Said',28,'Melbourne','Australia','Never married'],['Mustapha',27,'Accra','Ghana','Never married'],
         ['Liban',26,'Kismayo','Somalia','Never married'],['Mahamud',31,'Wajir','Kenya','Never married'],['Salman',30,'Muscat','Oman','Never married'],['Juma',30,'Dar es Salaam','Tanzania','Never married'],
         ['Ilyas',27,'Minneapolis','United States','Never married'],['Zakariye',32,'Addis Ababa','Ethiopia','Divorced'],['Anwar',29,'Nairobi','Kenya','Never married'],['Keyse',29,'Berbera','Somalia','Never married'],
         ['Haziq',26,'Kuala Lumpur','Malaysia','Never married'],['Abdikarim',31,'Mogadishu','Somalia','Never married'],['Hanad',26,'Beledweyne','Somalia','Never married'],['Sharif',28,'Dubai','United Arab Emirates','Never married'],
         ['Arif',29,'Dhaka','Bangladesh','Never married'],['Yahye',35,'Dubai','United Arab Emirates','Widowed'],['Nuur',27,'Hargeisa','Somalia','Never married'],['Guled',33,'Birmingham','United Kingdom','Divorced'],
         ['Bile',30,'Nairobi','Kenya','Never married'],['Ousmane',31,'Dakar','Senegal','Never married'],['Hussein',30,'Seattle','United States','Never married'],['Saeed',29,'Doha','Qatar','Never married'],
         ['Farhan',28,'Lahore','Pakistan','Never married'],['Abdiaziz',26,'Mombasa','Kenya','Never married'],['Mahad',32,'Ottawa','Canada','Never married'],['Rizal',27,'Jakarta','Indonesia','Never married'],
         ['Osman',35,'Garowe','Somalia','Widowed'],['Jamal',28,'Kampala','Uganda','Never married']];
  /* each member's short message ("joining letter"), shown in the photo viewer */
  var JOB_F=['a nurse','a teacher','a pharmacy student','an accountant','a small-business owner','a midwife','a software tester','a primary-school teacher','a dental assistant','a fashion designer'];
  var JOB_M=['an engineer','a business owner','a doctor','an IT technician','a teacher','an accountant','a pharmacist','a logistics manager','a civil engineer','a trader'];
  var LIKE=['cooking for family and friends','reading and long walks','travelling to see family','helping in my community','learning Arabic and Quran','sport and staying active','photography and nature','volunteering at the masjid','good food and good company','learning new things'];
  var WANT_F=['a kind, honest husband who prays and puts family first','a practising man who is patient, respectful and ready to build a home','someone gentle and serious about marriage, with good character','a husband who values deen, family and kindness'];
  var WANT_M=['a kind, practising wife who values family','a woman of good character who is ready to build a home together','someone honest and patient who loves her deen and family','a wife who is caring, respectful and serious about marriage'];
  var PEOPLE=[];
  function letter(g,i){
    var job=(g==='f'?JOB_F:JOB_M)[i%10], like=LIKE[(i*3)%10], want=(g==='f'?WANT_F:WANT_M)[i%4];
    return 'Assalamu alaikum. I am '+job+' and I enjoy '+like+'. I am looking for '+want+'.';
  }
  W.forEach(function(p,i){PEOPLE.push({id:'f'+i,g:'f',name:p[0],age:p[1],city:p[2],country:p[3],marital:p[4],seen:SEEN[i%10],
    imgs:['assets/imgs/marriage/members/mm-w'+('0'+(i+1)).slice(-2)+'.webp?v=1435'],msg:letter('f',i),tone:i%6})});
  M.forEach(function(p,i){PEOPLE.push({id:'m'+i,g:'m',name:p[0],age:p[1],city:p[2],country:p[3],marital:p[4],seen:SEEN[(i+3)%10],
    imgs:['assets/imgs/marriage/members/mm-m'+('0'+(i+1)).slice(-2)+'.webp?v=1435'],msg:letter('m',i),tone:(i+3)%6})});
  /* members approved by the SEMA BAY team (sema/admin.html → Marriage approvals) appear first */
  var KEY_APPS='semabay_mm_applications_v1';
  (function(){var apps=[];try{apps=JSON.parse(localStorage.getItem(KEY_APPS)||'[]')}catch(e){}
    apps.filter(function(a){return a.status==='approved'&&a.photos&&a.photos.length}).sort(function(x,y){return (y.decided||'')<(x.decided||'')?-1:1}).forEach(function(a,i){
      PEOPLE.unshift({id:'a'+a.id,g:a.gender,name:a.first,age:+a.age,city:a.city,country:a.country==='Other'?a.city:a.country,marital:a.marital,seen:'New member',
        imgs:a.photos.map(function(ph){return /^data:/.test(ph)?ph:ph.replace(/^\.\.\//,'')}),msg:a.message,tone:(a.first.length+i)%6,real:1});
    });
  })();
  PEOPLE.forEach(function(p){p.photos=p.imgs.length});
  function photo(p,i){return p.imgs[i]}
  function online(s){return /^Online/.test(s)?'on':(/^Active/.test(s)?'recent':'away')}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var PIN='<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" fill="currentColor"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>';

  /* ---------- sections: one big advert, then member cards; the section size follows the screen width ---------- */
  function cols(){var w=window.innerWidth;return w>=1600?7:w>=1280?6:w>1024?5:0}
  /* Each advert keeps its own shape. Wide screens: the picture sits beside the members and is 4 columns
     wide if it is landscape, 3 if it is square, so it fills its frame with almost nothing cut off.
     Smaller screens: the picture gets its own row at its own shape, then the members below it. */
  function adShape(ad){return ad[1]/ad[2]>1.2?'wide':'sq'}
  function adSpan(c,ad){return adShape(ad)==='wide'?4:3}
  function perFor(c,ad){return c>=6?2*(c-adSpan(c,ad)):c===5?5:6}
  var state={g:'f',country:'',look:'',shown:SECTIONS_STEP,cols:cols()};
  var grid=$('#mmGrid'), more=$('#mmMore'), countSel=$('#mmCountry'), lookSel=$('#mmLook');
  function countries(){var s={};PEOPLE.forEach(function(p){if(p.g===state.g)s[p.country]=1});return Object.keys(s).sort()}
  /* on narrow phones the first choice reads "Any" (the small label above already says "Country") */
  var narrowMQ=window.matchMedia('(max-width:420px)');
  function anyCountry(){return narrowMQ.matches?'Any':'All countries'}
  (narrowMQ.addEventListener?narrowMQ.addEventListener.bind(narrowMQ,'change'):narrowMQ.addListener.bind(narrowMQ))(function(){var o=countSel.options[0];if(o)o.textContent=anyCountry()});
  function fillCountries(){
    var keep=state.country, list=countries();
    countSel.innerHTML='<option value="">'+anyCountry()+'</option>'+list.map(function(c){return '<option'+(c===keep?' selected':'')+'>'+esc(c)+'</option>'}).join('');
    if(keep&&list.indexOf(keep)<0){state.country='';countSel.value=''}
  }
  function filtered(){return PEOPLE.filter(function(p){return p.g===state.g&&(!state.country||p.country===state.country)&&(!state.look||p.marital===state.look)})}
  function card(p){
    return '<button type="button" class="mm-card mm-tone-'+p.tone+'" data-id="'+p.id+'" aria-label="'+esc(p.name+', '+p.city+', '+p.country+', '+p.seen+'. Open profile')+'">'+
      '<span class="mm-photo"><img src="'+photo(p,0)+'" alt="" loading="lazy" width="320" height="400"/>'+
      '<span class="mm-seen is-'+online(p.seen)+'"><i aria-hidden="true"></i>'+esc(p.seen)+'</span></span>'+
      '<span class="mm-name">'+esc(p.name)+'</span>'+
      '<span class="mm-place">'+PIN+esc(p.city)+', '+esc(p.country)+'</span></button>';
  }
  function render(){
    var c=state.cols, list=filtered(), adStart=state.g==='m'?11:0, h='', i=0, s=0;
    while(i<list.length&&s<state.shown){
      var ad=ADS[(adStart+s)%ADS.length], per=perFor(c,ad), part=list.slice(i,i+per);
      h+='<section class="mm-sec" aria-label="Members '+(i+1)+' to '+(i+part.length)+'">'+
        '<button type="button" class="mm-ad mm-ad-'+adShape(ad)+'" data-mm-join aria-label="'+esc(ad[3])+'. Join us now" style="--ar:'+ad[1]+'/'+ad[2]+'">'+
        '<img src="assets/imgs/marriage/'+ad[0]+'?v=1435" alt="" width="'+ad[1]+'" height="'+ad[2]+'"'+(s?' loading="lazy"':'')+'/></button>'+
        part.map(card).join('')+'</section>';
      i+=part.length;s++;
    }
    grid.innerHTML=h;
    $('#mmEmpty').hidden=list.length>0;
    more.hidden=i>=list.length;
  }
  function reset(){state.shown=SECTIONS_STEP;render()}
  document.querySelectorAll('.mm-who-btn').forEach(function(b){
    b.addEventListener('click',function(){
      state.g=b.dataset.gender;
      document.querySelectorAll('.mm-who-btn').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      fillCountries();reset();
    });
  });
  countSel.addEventListener('change',function(){state.country=countSel.value;reset()});
  lookSel.addEventListener('change',function(){state.look=lookSel.value;reset()});
  more.addEventListener('click',function(){var first=grid.children.length;state.shown+=SECTIONS_STEP;render();var c=grid.children[first]&&grid.children[first].querySelector('.mm-card');if(c)c.focus()});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){var c=cols();if(c!==state.cols){state.cols=c;render()}},150)});
  grid.addEventListener('click',function(e){
    var a=e.target.closest('.mm-ad');if(a){openJoin(a);return}
    var c=e.target.closest('.mm-card');if(c)openViewer(c.dataset.id,c);
  });

  /* ---------- dialogs ---------- */
  var lastFocus=null, openDlg=null;
  function showDlg(el,from){lastFocus=from||document.activeElement;openDlg=el;el.hidden=false;document.documentElement.style.overflow='hidden';var x=el.querySelector('[data-mm-close]');if(x)x.focus()}
  function hideDlg(){if(!openDlg)return;openDlg.hidden=true;openDlg=null;document.documentElement.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
  document.querySelectorAll('[data-mm-close]').forEach(function(b){b.addEventListener('click',hideDlg)});
  /* clicking outside closes the photo viewer, but never the join form (people would lose what they typed) */
  document.querySelectorAll('.mm-viewer').forEach(function(v){v.addEventListener('click',function(e){if(e.target===v&&v.id!=='mmJoin')hideDlg()})});
  document.addEventListener('keydown',function(e){
    if(!openDlg)return;
    if(e.key==='Escape'){if(zoomed){setZoom(false)}else if(openDlg.id!=='mmJoin')hideDlg();return}
    if(openDlg===viewer&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!/TEXTAREA|INPUT|SELECT/.test(document.activeElement.tagName)){step(e.key==='ArrowRight'?1:-1)}
    if(e.key==='Tab'){var f=[].slice.call(openDlg.querySelectorAll('button:not([disabled]),a[href],select,textarea')).filter(function(x){return x.offsetParent});
      if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  });
  document.querySelectorAll('.mm-bar [data-mm-join]').forEach(function(b){b.addEventListener('click',function(e){openJoin(e.currentTarget)})});

  /* ---------- photo viewer with zoom ---------- */
  var viewer=$('#mmViewer'), stage=$('#mmStage'), big=$('#mmBig'), thumbs=$('#mmThumbs');
  var cur=null, idx=0, zoomed=false, Z=2.2, tx=0, ty=0;
  function byId(id){for(var i=0;i<PEOPLE.length;i++)if(PEOPLE[i].id===id)return PEOPLE[i]}
  function openViewer(id,from){
    cur=byId(id);idx=0;
    $('#mmvName').textContent=cur.name+', '+cur.age;
    $('#mmvWhere').textContent=cur.city+', '+cur.country;
    var sn=$('#mmvSeen');sn.textContent=cur.seen;sn.className='mm-dot-line is-'+online(cur.seen);
    $('#mmvMarital').textContent=cur.marital;
    $('#mmvLetterTitle').textContent='Message from '+cur.name;
    $('#mmvLetter').textContent=cur.msg;
    $('#mmChatBtn').textContent='Chat with '+cur.name;
    $('#mmReportDone').hidden=true;$('#mmReport').hidden=false;
    var h='';for(var i=0;i<cur.photos;i++)h+='<button type="button" class="mm-thumb" data-i="'+i+'" aria-label="Photo '+(i+1)+' of '+cur.photos+'"><img src="'+photo(cur,i)+'" alt=""/></button>';
    thumbs.innerHTML=h;showPhoto(0);showDlg(viewer,from);
  }
  function showPhoto(i){
    idx=(i+cur.photos)%cur.photos;setZoom(false);
    big.src=photo(cur,idx);big.alt='Photo '+(idx+1)+' of '+cur.name;
    var one=cur.photos<2;thumbs.hidden=one;viewer.querySelectorAll('.mm-nav').forEach(function(b){b.hidden=one});
    thumbs.querySelectorAll('.mm-thumb').forEach(function(t){t.setAttribute('aria-current',+t.dataset.i===idx?'true':'false')});
  }
  function step(d){showPhoto(idx+d)}
  thumbs.addEventListener('click',function(e){var t=e.target.closest('.mm-thumb');if(t)showPhoto(+t.dataset.i)});
  viewer.querySelectorAll('[data-mm-step]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();step(+b.dataset.mmStep)})});
  function clamp(){var w=stage.clientWidth,h=stage.clientHeight;tx=Math.min(0,Math.max(w-w*Z,tx));ty=Math.min(0,Math.max(h-h*Z,ty))}
  function apply(){big.style.transform=zoomed?'translate('+tx+'px,'+ty+'px) scale('+Z+')':''}
  function setZoom(on,x,y){
    zoomed=!!on;stage.classList.toggle('is-zoomed',zoomed);
    $('#mmZoomHint').textContent=zoomed?'Drag to look around · click to zoom out':'Click the photo to zoom';
    if(zoomed){tx=-(x*(Z-1));ty=-(y*(Z-1));clamp()}
    apply();
  }
  var down=null, moved=false;
  stage.addEventListener('pointerdown',function(e){if(e.target.closest('.mm-nav'))return;down={x:e.clientX,y:e.clientY,tx:tx,ty:ty};moved=false;stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',function(e){
    if(!down||!zoomed)return;var dx=e.clientX-down.x,dy=e.clientY-down.y;
    if(Math.abs(dx)+Math.abs(dy)>4){moved=true;stage.classList.add('is-dragging')}
    tx=down.tx+dx;ty=down.ty+dy;clamp();apply();
  });
  stage.addEventListener('pointerup',function(e){
    if(!down)return;stage.classList.remove('is-dragging');
    if(!moved){var r=stage.getBoundingClientRect();if(zoomed)setZoom(false);else setZoom(true,e.clientX-r.left,e.clientY-r.top)}
    down=null;
  });

  $('#mmReport').addEventListener('click',function(e){e.stopPropagation();$('#mmReport').hidden=true;$('#mmReportDone').hidden=false});
  $('#mmChatBtn').addEventListener('click',function(e){
    e.stopPropagation();
    var p=cur;
    needLogin(function(){hideDlg();openChat(p)});
  });

  /* ---------- join form ---------- */
  /* countries members most often come from, with phone codes and a few city suggestions (people can type any city) */
  var JC=[['Somalia','+252','Mogadishu,Hargeisa,Bosaso,Garowe,Kismayo,Baidoa,Burao,Berbera,Galkayo,Beledweyne'],
    ['Kenya','+254','Nairobi,Eastleigh,Mombasa,Garissa,Wajir,Mandera,Kisumu,Nakuru'],['Ethiopia','+251','Addis Ababa,Jigjiga,Dire Dawa,Harar'],
    ['Djibouti','+253','Djibouti City,Ali Sabieh,Tadjourah'],['Uganda','+256','Kampala,Jinja,Entebbe'],['Tanzania','+255','Dar es Salaam,Zanzibar,Arusha'],
    ['United Arab Emirates','+971','Dubai,Abu Dhabi,Sharjah,Ajman'],['Saudi Arabia','+966','Riyadh,Jeddah,Makkah,Madinah,Dammam'],['Qatar','+974','Doha,Al Wakrah'],
    ['Oman','+968','Muscat,Salalah,Sohar'],['Kuwait','+965','Kuwait City,Hawalli'],['Bahrain','+973','Manama,Muharraq'],
    ['Egypt','+20','Cairo,Alexandria,Giza'],['Jordan','+962','Amman,Zarqa,Irbid'],['Turkey','+90','Istanbul,Ankara,Izmir'],
    ['Pakistan','+92','Karachi,Lahore,Islamabad'],['Bangladesh','+880','Dhaka,Chittagong,Sylhet'],['Malaysia','+60','Kuala Lumpur,Penang,Johor Bahru'],
    ['Indonesia','+62','Jakarta,Surabaya,Bandung'],['Nigeria','+234','Lagos,Kano,Abuja'],['Ghana','+233','Accra,Kumasi,Tamale'],['Senegal','+221','Dakar,Touba,Thiès'],
    ['United Kingdom','+44','London,Birmingham,Manchester,Bristol,Cardiff,Leicester'],['United States','+1','Minneapolis,Columbus,Seattle,San Diego,Atlanta,New York'],
    ['Canada','+1','Toronto,Ottawa,Edmonton,Calgary'],['Sweden','+46','Stockholm,Gothenburg,Malmö'],['Norway','+47','Oslo,Bergen'],
    ['Netherlands','+31','Amsterdam,Rotterdam,The Hague'],['Germany','+49','Berlin,Frankfurt,Munich'],['Denmark','+45','Copenhagen,Aarhus'],
    ['Finland','+358','Helsinki,Turku'],['Australia','+61','Melbourne,Sydney,Perth']];
  var jform=$('#mmJoinForm'), jdone=$('#mmJoinDone'), jerr=$('#mmFormError'), jcountry=$('#jfCountry'), jcode=$('#jfCode'), jcities=$('#jfCities');
  /* every country, names only (no flags: many computers show flags as two letters, e.g. "BH"), A to Z.
     The most common countries for SEMA BAY members are also listed first. Typing letters jumps to the country. */
  var COUNTRIES=[["Afghanistan", "+93"], ["Albania", "+355"], ["Algeria", "+213"], ["Andorra", "+376"], ["Angola", "+244"], ["Antigua and Barbuda", "+1"], ["Argentina", "+54"], ["Armenia", "+374"], ["Australia", "+61"], ["Austria", "+43"], ["Azerbaijan", "+994"], ["Bahamas", "+1"], ["Bahrain", "+973"], ["Bangladesh", "+880"], ["Barbados", "+1"], ["Belarus", "+375"], ["Belgium", "+32"], ["Belize", "+501"], ["Benin", "+229"], ["Bhutan", "+975"], ["Bolivia", "+591"], ["Bosnia and Herzegovina", "+387"], ["Botswana", "+267"], ["Brazil", "+55"], ["Brunei", "+673"], ["Bulgaria", "+359"], ["Burkina Faso", "+226"], ["Burundi", "+257"], ["Cambodia", "+855"], ["Cameroon", "+237"], ["Canada", "+1"], ["Cape Verde", "+238"], ["Central African Republic", "+236"], ["Chad", "+235"], ["Chile", "+56"], ["China", "+86"], ["Colombia", "+57"], ["Comoros", "+269"], ["Congo", "+242"], ["Costa Rica", "+506"], ["Côte d’Ivoire", "+225"], ["Croatia", "+385"], ["Cuba", "+53"], ["Cyprus", "+357"], ["Czech Republic", "+420"], ["Democratic Republic of the Congo", "+243"], ["Denmark", "+45"], ["Djibouti", "+253"], ["Dominica", "+1"], ["Dominican Republic", "+1"], ["Ecuador", "+593"], ["Egypt", "+20"], ["El Salvador", "+503"], ["Equatorial Guinea", "+240"], ["Eritrea", "+291"], ["Estonia", "+372"], ["Eswatini", "+268"], ["Ethiopia", "+251"], ["Fiji", "+679"], ["Finland", "+358"], ["France", "+33"], ["Gabon", "+241"], ["Gambia", "+220"], ["Georgia", "+995"], ["Germany", "+49"], ["Ghana", "+233"], ["Greece", "+30"], ["Grenada", "+1"], ["Guatemala", "+502"], ["Guinea", "+224"], ["Guinea-Bissau", "+245"], ["Guyana", "+592"], ["Haiti", "+509"], ["Honduras", "+504"], ["Hong Kong", "+852"], ["Hungary", "+36"], ["Iceland", "+354"], ["India", "+91"], ["Indonesia", "+62"], ["Iran", "+98"], ["Iraq", "+964"], ["Ireland", "+353"], ["Italy", "+39"], ["Jamaica", "+1"], ["Japan", "+81"], ["Jordan", "+962"], ["Kazakhstan", "+7"], ["Kenya", "+254"], ["Kiribati", "+686"], ["Kosovo", "+383"], ["Kuwait", "+965"], ["Kyrgyzstan", "+996"], ["Laos", "+856"], ["Latvia", "+371"], ["Lebanon", "+961"], ["Lesotho", "+266"], ["Liberia", "+231"], ["Libya", "+218"], ["Liechtenstein", "+423"], ["Lithuania", "+370"], ["Luxembourg", "+352"], ["Madagascar", "+261"], ["Malawi", "+265"], ["Malaysia", "+60"], ["Maldives", "+960"], ["Mali", "+223"], ["Malta", "+356"], ["Marshall Islands", "+692"], ["Mauritania", "+222"], ["Mauritius", "+230"], ["Mexico", "+52"], ["Micronesia", "+691"], ["Moldova", "+373"], ["Monaco", "+377"], ["Mongolia", "+976"], ["Montenegro", "+382"], ["Morocco", "+212"], ["Mozambique", "+258"], ["Myanmar", "+95"], ["Namibia", "+264"], ["Nauru", "+674"], ["Nepal", "+977"], ["Netherlands", "+31"], ["New Zealand", "+64"], ["Nicaragua", "+505"], ["Niger", "+227"], ["Nigeria", "+234"], ["North Korea", "+850"], ["North Macedonia", "+389"], ["Norway", "+47"], ["Oman", "+968"], ["Pakistan", "+92"], ["Palau", "+680"], ["Palestine", "+970"], ["Panama", "+507"], ["Papua New Guinea", "+675"], ["Paraguay", "+595"], ["Peru", "+51"], ["Philippines", "+63"], ["Poland", "+48"], ["Portugal", "+351"], ["Qatar", "+974"], ["Romania", "+40"], ["Russia", "+7"], ["Rwanda", "+250"], ["Saint Kitts and Nevis", "+1"], ["Saint Lucia", "+1"], ["Saint Vincent and the Grenadines", "+1"], ["Samoa", "+685"], ["San Marino", "+378"], ["São Tomé and Príncipe", "+239"], ["Saudi Arabia", "+966"], ["Senegal", "+221"], ["Serbia", "+381"], ["Seychelles", "+248"], ["Sierra Leone", "+232"], ["Singapore", "+65"], ["Slovakia", "+421"], ["Slovenia", "+386"], ["Solomon Islands", "+677"], ["Somalia", "+252"], ["South Africa", "+27"], ["South Korea", "+82"], ["South Sudan", "+211"], ["Spain", "+34"], ["Sri Lanka", "+94"], ["Sudan", "+249"], ["Suriname", "+597"], ["Sweden", "+46"], ["Switzerland", "+41"], ["Syria", "+963"], ["Taiwan", "+886"], ["Tajikistan", "+992"], ["Tanzania", "+255"], ["Thailand", "+66"], ["Timor-Leste", "+670"], ["Togo", "+228"], ["Tonga", "+676"], ["Trinidad and Tobago", "+1"], ["Tunisia", "+216"], ["Turkey", "+90"], ["Turkmenistan", "+993"], ["Tuvalu", "+688"], ["Uganda", "+256"], ["Ukraine", "+380"], ["United Arab Emirates", "+971"], ["United Kingdom", "+44"], ["United States", "+1"], ["Uruguay", "+598"], ["Uzbekistan", "+998"], ["Vanuatu", "+678"], ["Vatican City", "+39"], ["Venezuela", "+58"], ["Vietnam", "+84"], ["Yemen", "+967"], ["Zambia", "+260"], ["Zimbabwe", "+263"]];
  var TOP=['Somalia','Kenya','Ethiopia','Djibouti','Uganda','United Arab Emirates','Saudi Arabia','United States','United Kingdom','Canada'];
  function opt(n,label){return '<option value="'+esc(n)+'">'+esc(label||n)+'</option>'}
  jcountry.innerHTML='<option value="">Select your country</option><optgroup label="Most members">'+TOP.map(function(n){return opt(n)}).join('')+'</optgroup>'+
    '<optgroup label="All countries, A to Z">'+COUNTRIES.map(function(c){return opt(c[0])}).join('')+opt('Other','Other country')+'</optgroup>';
  jcode.innerHTML='<option value="">Code</option>'+COUNTRIES.map(function(c){return '<option value="'+c[0]+'|'+c[1]+'" data-country="'+esc(c[0])+'">'+esc(c[1])+' '+esc(c[0])+'</option>'}).join('');
  /* typing letters on a closed country list jumps to the first country starting with them (e.g. "gh" → Ghana),
     the same in every browser; for the phone code list it matches the country name */
  function typeJump(sel,textOf){var buf='',t=0;
    sel.addEventListener('keydown',function(e){
      if(e.ctrlKey||e.metaKey||e.altKey||e.key.length!==1||!/[\p{L} ’'-]/u.test(e.key))return;
      var now=Date.now();buf=(now-t<900?buf:'')+e.key.toLowerCase();t=now;
      var opts=[].slice.call(sel.options),start=sel.selectedIndex;
      var m=opts.filter(function(o){return o.value&&textOf(o).toLowerCase().indexOf(buf)===0});
      if(!m.length&&buf.length>1){buf=e.key.toLowerCase();m=opts.filter(function(o){return o.value&&textOf(o).toLowerCase().indexOf(buf)===0})}
      if(!m.length)return;e.preventDefault();
      /* pressing the same letter again moves to the next country with that letter */
      var pick=m[0];if(buf.length===1){var after=m.filter(function(o){return o.index>start});pick=after[0]||m[0]}
      if(pick.index!==start){sel.selectedIndex=pick.index;sel.dispatchEvent(new Event('change',{bubbles:true}))}
    })}
  typeJump(jcountry,function(o){return o.parentNode.label==='Most members'?'':o.textContent});
  typeJump(jcode,function(o){return o.getAttribute('data-country')||''});
  typeJump(countSel,function(o){return o.textContent});
  var codeTouched=false;
  jcode.addEventListener('change',function(){codeTouched=true});
  jcountry.addEventListener('change',function(){
    var c=JC.filter(function(x){return x[0]===jcountry.value})[0];
    jcities.innerHTML=c?c[2].split(',').map(function(x){return '<option value="'+esc(x.trim())+'"></option>'}).join(''):'';
    var k=COUNTRIES.filter(function(x){return x[0]===jcountry.value})[0];
    if(k&&!codeTouched)jcode.value=k[0]+'|'+k[1];
  });
  /* photo boxes: each box takes one photo and shows it; × removes it */
  jform.querySelectorAll('.jf-slot').forEach(function(sl){
    var inp=sl.querySelector('input'), img=sl.querySelector('.jf-slot-img'), x=sl.querySelector('.jf-slot-x'), url=null;
    function clear(){if(url)URL.revokeObjectURL(url);url=null;inp.value='';img.hidden=true;img.removeAttribute('src');x.hidden=true;sl.classList.remove('has-photo')}
    inp.addEventListener('change',function(){
      var f=inp.files&&inp.files[0];if(!f){clear();return}
      if(!/^image\//.test(f.type)){clear();jerr.textContent='Photo '+(+sl.dataset.slot+1)+' is not a picture. Choose a photo file.';jerr.hidden=false;return}
      if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(f);img.src=url;img.hidden=false;x.hidden=false;sl.classList.add('has-photo');jerr.hidden=true;
    });
    x.addEventListener('click',function(){clear();inp.focus()});
    sl._clear=clear;
  });
  function photoCount(){return [].filter.call(jform.querySelectorAll('.jf-slot input'),function(i){return i.files&&i.files.length}).length}
  function openJoin(from){
    needLogin(function(){
      jform.hidden=false;jdone.hidden=true;jerr.hidden=true;showDlg($('#mmJoin'),from);$('#mmJoin .jf-scroll').scrollTop=0;
    });
  }
  jform.message.addEventListener('input',function(){$('#mmMsgCount').textContent=jform.message.value.length});
  jform.addEventListener('submit',function(e){
    e.preventDefault();var f=jform, err='', field=null, age=+f.age.value, n=photoCount();
    function bad(m,el){if(!err){err=m;field=el}}
    if(!f.name.value.trim())bad('Write your full name.',f.name);
    if(!f.querySelector('input[name=gender]:checked'))bad('Choose woman or man.',f.querySelector('input[name=gender]'));
    if(!f.country.value)bad('Choose your country.',f.country);
    if(!f.city.value.trim())bad('Write your city.',f.city);
    if(!(age>=18&&age<=99))bad('You must be 18 or older to join.',f.age);
    if(!f.marital.value)bad('Choose your marital status.',f.marital);
    if(!f.code.value)bad('Choose your phone country code.',f.code);
    if(f.phone.value.replace(/\D/g,'').length<6)bad('Write a phone number we can confirm.',f.phone);
    if(n<1)bad('Add at least 1 photo of yourself.',f.querySelector('.jf-slot input'));
    if(f.message.value.trim().length<20)bad('Write a message of at least 20 characters.',f.message);
    if(!f.agree.checked)bad('Tick the box to confirm your age and photos.',f.agree);
    jform.querySelectorAll('.is-bad').forEach(function(x){x.classList.remove('is-bad')});
    if(err){jerr.textContent=err;jerr.hidden=false;var w=field.closest('.jf-f,.jf-check');if(w)w.classList.add('is-bad');field.focus();if(w)w.scrollIntoView({block:'center',behavior:'smooth'});return}
    jerr.hidden=true;
    var first=f.name.value.trim().split(/\s+/)[0], sendBtn=f.querySelector('.jf-send');
    var files=[].map.call(jform.querySelectorAll('.jf-slot input'),function(i){return i.files&&i.files[0]}).filter(Boolean);
    var app={id:String(Date.now()),first:first,name:f.name.value.trim(),gender:f.querySelector('input[name=gender]:checked').value,age:age,
      country:f.country.value,city:f.city.value.trim(),marital:f.marital.value,phone:f.code.value.split('|').pop()+' '+f.phone.value.trim(),message:f.message.value.trim(),
      applied:new Date().toISOString(),status:'waiting',photos:[]};
    sendBtn.disabled=true;sendBtn.querySelector('span').textContent='Sending…';
    Promise.all(files.map(shrink)).then(function(ph){
      app.photos=ph;var list=[];try{list=JSON.parse(localStorage.getItem(KEY_APPS)||'[]')}catch(x){}
      list.unshift(app);
      try{localStorage.setItem(KEY_APPS,JSON.stringify(list))}catch(x){throw new Error('full')}
      done();
    }).catch(function(){jerr.textContent='Your photos are too large to send. Try fewer or smaller photos.';jerr.hidden=false})
      .then(function(){sendBtn.disabled=false;sendBtn.querySelector('span').textContent='Send for approval'});
    function done(){
    $('#mmJoinDoneText').textContent='Thank you, '+first+'. The SEMA BAY team will check your photos and message. When your profile is approved, you can chat with other members.';
    jform.hidden=true;jdone.hidden=false;f.reset();codeTouched=false;jcities.innerHTML='';
    jform.querySelectorAll('.jf-slot').forEach(function(sl){sl._clear()});$('#mmMsgCount').textContent='0';
    jdone.querySelector('[data-mm-close]').focus();
    }
  });
  /* photos are made smaller in the browser before they are sent (longest side 640 px) */
  function shrink(file){return new Promise(function(ok,no){var r=new FileReader();r.onerror=no;r.onload=function(){var im=new Image();im.onerror=no;im.onload=function(){
    var k=Math.min(1,640/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.8))};im.src=r.result};r.readAsDataURL(file)})}

  /* ---------- chat window ----------
     Threads and messages are stored on the server so they survive refresh and devices.
     Preview members do not reply yet; real delivery arrives with the live member system. */
  var chat=$('#mmChat'), body=$('#mmcBody'), form=$('#mmcForm'), input=$('#mmcInput'), menu=$('#mmcMenu'), menuBtn=$('#mmcMenuBtn');
  var listEl=$('#mcList'), searchEl=$('#mcSearch'), quick=$('#mcQuick'), emo=$('#mcEmoji'), launch=$('#mcLaunch');
  var who=null, tab='all', timers={}, chatReady=false, persistQueue=Promise.resolve();
  var QUICK=['Assalamu alaikum 😊','Tell me a little about yourself.','What are you looking for in a spouse?','Where does your family live?','Would you like to involve our families?','JazakAllahu khairan for your reply.'];
  var EMOJI=['😊','😄','🙂','😍','🥰','😇','🤲','🙏','👍','👏','🌸','🌹','💐','✨','🌙','⭐','☕','🍰','🎉','💖','❤️','💕','😂','😉','🤗','😌','🙌','👋','✅','📍'];
  var store={threads:{},newChats:{}};
  function api(path,opts){
    if(window.SBAuth&&SBAuth.api)return SBAuth.api(path,opts);
    opts=opts||{};
    opts.headers=Object.assign({'Content-Type':'application/json'},opts.headers||{});
    opts.credentials='same-origin';
    return fetch('/api'+path,opts).then(function(r){
      return r.json().then(function(j){if(!r.ok)throw new Error((j&&j.error)||('HTTP '+r.status));return j});
    });
  }
  function today(){return new Date().toISOString().slice(0,10)}
  function newChatsToday(){var d=store.newChats||{};return d[today()]||0}
  function countNewChat(){
    var d=today();store.newChats[d]=(store.newChats[d]||0)+1;
    persistQueue=persistQueue.then(function(){return api('/chats/meta/new-chat',{method:'POST',body:'{}'})}).catch(function(){});
  }
  function all(){return store.threads}
  function get(id){var t=store.threads[id];if(!t)t={status:'new',msgs:[],unread:0,fav:false,at:0};if(!('unread' in t))t.unread=0;if(!t.msgs)t.msgs=[];return t}
  function put(id,t){
    store.threads[id]=t;
    persistQueue=persistQueue.then(function(){
      return api('/chats/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(t)});
    }).catch(function(err){
      console.warn('Chat save failed',err);
      if(who&&who.id===id){
        t.msgs=t.msgs||[];
        var last=t.msgs[t.msgs.length-1];
        if(!last||!last.sys||last.kind!=='bad'){
          t.msgs.push({sys:1,kind:'bad',t:'Could not save this chat on the server. Check your connection and try again.',at:Date.now()});
          store.threads[id]=t;draw();drawList();
        }
      }
    });
    return true;
  }
  function clearLegacyBrowserChats(){
    var legacy=null, day=null;
    try{legacy=JSON.parse(localStorage.getItem(LEGACY_CHATS)||'null')}catch(e){}
    try{day=JSON.parse(localStorage.getItem(LEGACY_DAY)||'null')}catch(e){}
    try{localStorage.removeItem(LEGACY_CHATS);localStorage.removeItem(LEGACY_DAY)}catch(e){}
    if(legacy&&typeof legacy==='object'){
      Object.keys(legacy).forEach(function(id){
        if(!store.threads[id])store.threads[id]=legacy[id];
        else if((legacy[id].msgs||[]).length>(store.threads[id].msgs||[]).length)store.threads[id]=legacy[id];
        put(id,store.threads[id]);
      });
    }
    if(day&&day.day&&day.n){store.newChats[day.day]=Math.max(store.newChats[day.day]||0,day.n)}
  }
  function hydrateChats(){
    if(!authed()){
      store.threads={};store.newChats={};chatReady=false;drawList();return Promise.resolve();
    }
    return api('/chats').then(function(data){
      store.threads=data.threads||{};
      store.newChats=data.newChats||{};
      clearLegacyBrowserChats();
      chatReady=true;
      drawList();
      if(who)draw();
    }).catch(function(err){
      console.warn('Chat load failed',err);
      if(String(err.message||'').indexOf('Sign in')>=0){store.threads={};store.newChats={};chatReady=false;drawList();return}
      clearLegacyBrowserChats();
      chatReady=true;
      drawList();
    });
  }
  function hhmm(ts){var d=new Date(ts),h=d.getHours(),m=('0'+d.getMinutes()).slice(-2);return ((h%12)||12)+':'+m+' '+(h<12?'AM':'PM')}
  function dayKey(ts){var d=new Date(ts);return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
  function dayLabel(ts){var d=new Date(ts),n=new Date(),y=new Date(Date.now()-864e5);
    if(dayKey(ts)===dayKey(n))return 'Today';if(dayKey(ts)===dayKey(y))return 'Yesterday';
    return d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'})}
  function listTime(ts){var age=Date.now()-ts;if(dayKey(ts)===dayKey(Date.now()))return hhmm(ts);
    if(dayKey(ts)===dayKey(Date.now()-864e5))return 'Yesterday';
    if(age<6*864e5)return new Date(ts).toLocaleDateString(undefined,{weekday:'short'});
    return new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short'})}
  function lastAt(t){return t.msgs.length?t.msgs[t.msgs.length-1].at:(t.at||0)}
  function isOpen(){return !chat.hidden&&!chat.classList.contains('is-min')}
  var TICK1='<svg viewBox="0 0 24 16" width="18" height="12" aria-label="Sent" role="img"><path d="M3 8.5l4 4L15 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TICK2='<svg viewBox="0 0 24 16" width="20" height="13" aria-label="Read" role="img"><path d="M1.5 8.5l4 4L13.5 3.5M9.5 12.5L18.5 3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* left: chat list */
  function drawList(){
    var a=all(), q=searchEl.value.trim().toLowerCase(), ids=Object.keys(a).filter(function(id){return byId(id)&&(a[id].msgs.length||id===(who&&who.id))});
    var unreadChats=ids.filter(function(id){return a[id].unread>0}).length;
    var n=$('#mcUnreadAll');n.hidden=!unreadChats;n.textContent=unreadChats;
    var ln=$('#mcLaunchN');ln.hidden=!unreadChats;ln.textContent=unreadChats;
    launch.hidden=!(chat.hidden&&ids.length);
    ids=ids.filter(function(id){var p=byId(id),t=a[id];
      if(q&&p.name.toLowerCase().indexOf(q)<0)return false;
      if(tab==='online'&&online(p.seen)!=='on')return false;
      if(tab==='fav'&&!t.fav)return false;return true});
    ids.sort(function(x,y){return lastAt(a[y])-lastAt(a[x])});
    listEl.innerHTML=ids.map(function(id){
      var p=byId(id),t=a[id],m=t.msgs.filter(function(x){return !x.sys}).pop()||t.msgs[t.msgs.length-1];
      var prev=!m?'Say salaam to start':(m.sys?m.t:(m.me?'You: ':'')+(m.img?'📷 Photo':m.t));
      var st=online(p.seen);
      return '<li><button type="button" class="mc-item'+(who&&who.id===id?' is-active':'')+'" data-id="'+id+'" aria-current="'+(who&&who.id===id?'true':'false')+'">'+
        '<span class="mc-av mc-tone-'+p.tone+'"><img src="'+photo(p,0)+'" alt=""/>'+(st!=='away'?'<i class="mc-av-dot is-'+st+'"></i>':'')+'</span>'+
        '<span class="mc-item-main"><span class="mc-item-top"><b>'+esc(p.name)+', '+p.age+'</b><time>'+(lastAt(t)?listTime(lastAt(t)):'')+'</time></span>'+
        '<span class="mc-item-bot"><span class="mc-prev">'+esc(prev)+'</span>'+(t.unread?'<b class="mc-badge" aria-label="'+t.unread+' unread">'+t.unread+'</b>':'')+
        (t.fav?'<svg class="mc-fav" viewBox="0 0 24 24" width="16" height="16" aria-label="Favourite" role="img"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 5.3 3 1.7-1.9 3.2-3 5.3-3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" fill="#F0396B"/></svg>':'')+
        '</span></span></button></li>';
    }).join('');
    var e=$('#mcListEmpty');
    e.hidden=ids.length>0;
    e.textContent=q?'No chats match “'+searchEl.value.trim()+'”.':tab==='online'?'None of your chats are online right now.':tab==='fav'?'No favourites yet. Open a chat, tap ⋯ and choose “Add to favourites”.':'No chats yet. Open a member and tap “Chat with …”.';
  }
  listEl.addEventListener('click',function(e){var b=e.target.closest('.mc-item');if(b)select(byId(b.dataset.id))});
  searchEl.addEventListener('input',drawList);
  document.querySelectorAll('.mc-tab').forEach(function(b){b.addEventListener('click',function(){
    tab=b.dataset.tab;document.querySelectorAll('.mc-tab').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false')});drawList()})});
  $('#mcCompose').addEventListener('click',function(){closeChat();var g=$('#mmGrid');g.scrollIntoView({behavior:'smooth',block:'start'});var c=g.querySelector('.mm-card');if(c)setTimeout(function(){c.focus({preventScroll:true})},400)});

  /* right: conversation */
  function draw(){
    if(!who){chat.classList.add('no-who');body.innerHTML='<div class="mc-pick"><b>Your chats</b><span>Choose a chat on the left, or open a member and tap “Chat with …”.</span></div>';return}
    chat.classList.remove('no-who');
    var t=get(who.id), n=esc(who.name), h='', last='', st=online(who.seen);
    $('#mmcName').textContent=who.name+', '+who.age;
    $('#mmcAv').src=photo(who,0);$('.mc-head-av').className='mc-head-av mc-tone-'+who.tone;
    $('#mcHeadDot').className='mc-head-dot is-'+st;
    var stateTxt={request:'Request sent',blocked:'Blocked'}[t.status]||who.seen;
    $('#mmcState').innerHTML='<i class="mc-dot is-'+(t.status==='blocked'?'away':st)+'"></i>'+esc(stateTxt)+'<span class="mc-sep">•</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" fill="#3BA3FF"/><circle cx="12" cy="10" r="2.6" fill="#0B2A6B"/></svg>'+esc(who.city);
    if(!t.msgs.length)h+='<p class="mc-note">Say salaam and introduce yourself. '+n+' will see your first message as a request and can accept or ignore it.</p>';
    t.msgs.forEach(function(m,i){
      var dk=dayKey(m.at);if(dk!==last){h+='<p class="mc-day"><span>'+dayLabel(m.at)+'</span></p>';last=dk}
      if(m.sys){h+='<p class="mc-note'+(m.kind?' is-'+m.kind:'')+'">'+esc(m.t)+'</p>';return}
      var content=m.img?'<img class="mc-photo" src="'+m.img+'" alt="Photo"/>':'<span class="mc-text">'+esc(m.t)+'</span>';
      if(m.me){
        var read=t.status==='open'||t.status==='blocked';
        h+='<div class="mc-row me"><div class="mc-col"><div class="mc-bub me'+(m.img?' is-img':'')+'">'+content+'</div><p class="mc-meta">'+hhmm(m.at)+' <span class="mc-tick'+(read?' is-read':'')+'">'+(read?TICK2:TICK1)+'</span></p></div></div>';
      }else{
        h+='<div class="mc-row them"><span class="mc-mini mc-tone-'+who.tone+'"><img src="'+photo(who,0)+'" alt=""/></span><div class="mc-col"><div class="mc-bub them'+(m.img?' is-img':'')+'">'+content+'</div><p class="mc-meta">'+hhmm(m.at)+'</p></div></div>';
      }
    });
    if(t.status==='request')h+='<p class="mc-note">You can write again when '+n+' accepts your request.</p>';
    if(t.status==='blocked')h+='<p class="mc-note is-bad">You blocked '+n+'. Neither of you can send messages in this chat.</p>';
    body.innerHTML=h;body.scrollTop=body.scrollHeight;
    var off=t.status==='request'||t.status==='blocked', imgOff=t.status!=='open';
    input.disabled=off;form.querySelector('.mc-send').disabled=off;$('#mcPlus').disabled=off;$('#mcEmo').disabled=off;
    $('#mcFile').disabled=imgOff;$('.mc-tool-img').classList.toggle('is-off',imgOff);
    $('.mc-tool-img').title=imgOff?'You can send photos after '+who.name+' accepts your request':'Send a photo';
    input.placeholder=off?(t.status==='blocked'?'Blocked':'Waiting for '+who.name+' to accept…'):'Type a message…';
    menu.querySelector('[data-mmc="fav"]').textContent=t.fav?'Remove from favourites':'Add to favourites';
    menu.querySelector('[data-mmc="block"]').textContent=t.status==='blocked'?'Unblock':'Block';
  }
  function markRead(){if(!who||!isOpen())return;var t=get(who.id);if(t.unread){t.unread=0;put(who.id,t)}}
  function select(p){
    who=p;closePops();var t=get(p.id);if(!all()[p.id]){t.at=Date.now();put(p.id,t)}
    chat.classList.add('show-conv');markRead();draw();drawList();
    if(t.status==='request')simulate(p);
    if(!input.disabled&&window.innerWidth>640)input.focus();
  }
  function openChat(p){
    if(!authed()){needLogin(function(){hydrateChats().then(function(){openChat(p)})});return}
    chat.hidden=false;chat.classList.remove('is-min');$('#mmcMin').setAttribute('aria-expanded','true');
    document.documentElement.classList.toggle('mc-lock',window.innerWidth<=640);
    if(p)select(p);else{chat.classList.remove('show-conv');draw();drawList()}
  }
  function closeChat(){chat.hidden=true;closePops();document.documentElement.classList.remove('mc-lock');drawList()}
  /* prototype only */
  function simulate(p){
    /* No pretend answers: in the preview nobody replies on a member's behalf. */
    var id=p.id,t=get(id);if(t.status!=='request'||t.noted)return;
    t.noted=1;t.msgs.push({sys:1,kind:'good',t:'Request sent to '+p.name+'. Preview: the members shown are examples, so no one will answer yet. Real members and replies arrive when SEMA BAY Marriage opens.',at:Date.now()});put(id,t);
    if(who&&who.id===id)draw();drawList();
  }
  function send(msg){
    if(!who)return;var t=get(who.id);
    if(t.status==='blocked'||t.status==='request')return;
    if(t.status==='new'){
      if(newChatsToday()>=DAILY_NEW_CHATS){t.msgs.push({sys:1,kind:'bad',t:'You have started '+DAILY_NEW_CHATS+' new chats today. You can start more tomorrow.',at:Date.now()});put(who.id,t);draw();return}
      countNewChat();t.status='request';
    }
    msg.me=1;msg.at=Date.now();t.msgs.push(msg);
    if(!put(who.id,t)){t.msgs.pop();t.msgs.push({sys:1,kind:'bad',t:'This photo is too large to keep in the preview. Try a smaller one.',at:Date.now()});put(who.id,t)}
    draw();drawList();if(t.status==='request')simulate(who);
  }
  form.addEventListener('submit',function(e){e.preventDefault();var v=input.value.trim();if(!v)return;input.value='';autosize();closePops();send({t:v});input.focus()});
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true}))}});
  function autosize(){input.style.height='auto';input.style.height=Math.min(120,input.scrollHeight)+'px'}
  input.addEventListener('input',autosize);
  /* photo: shrunk in the browser before it is kept */
  $('#mcFile').addEventListener('change',function(){
    var f=this.files&&this.files[0];this.value='';if(!f||!who)return;
    if(!/^image\//.test(f.type))return;
    var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){
      var k=Math.min(1,720/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);send({img:c.toDataURL('image/jpeg',.78)})};im.src=r.result};r.readAsDataURL(f);
  });
  /* quick messages and emoji */
  quick.innerHTML=QUICK.map(function(q){return '<button type="button" role="menuitem">'+esc(q)+'</button>'}).join('');
  emo.innerHTML=EMOJI.map(function(x){return '<button type="button" aria-label="'+x+'">'+x+'</button>'}).join('');
  function closePops(){quick.hidden=emo.hidden=menu.hidden=true;$('#mcPlus').setAttribute('aria-expanded','false');$('#mcEmo').setAttribute('aria-expanded','false');menuBtn.setAttribute('aria-expanded','false')}
  function toggle(pop,btn){var open=pop.hidden;closePops();pop.hidden=!open;btn.setAttribute('aria-expanded',open?'true':'false');if(open){var f=pop.querySelector('button');if(f)f.focus()}}
  $('#mcPlus').addEventListener('click',function(e){e.stopPropagation();toggle(quick,this)});
  $('#mcEmo').addEventListener('click',function(e){e.stopPropagation();toggle(emo,this)});
  quick.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;closePops();send({t:b.textContent})});
  emo.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
    var s=input.selectionStart||input.value.length,v=input.value;input.value=v.slice(0,s)+b.textContent+v.slice(input.selectionEnd||s);
    input.focus();input.selectionStart=input.selectionEnd=s+b.textContent.length;autosize()});
  menuBtn.addEventListener('click',function(e){e.stopPropagation();toggle(menu,menuBtn)});
  document.addEventListener('click',function(e){if(!e.target.closest('.mc-pop,#mmcMenu,#mcPlus,#mcEmo,#mmcMenuBtn'))closePops()});
  chat.addEventListener('keydown',function(e){if(e.key==='Escape'){if(!quick.hidden||!emo.hidden||!menu.hidden){closePops();e.stopPropagation()}}});
  menu.addEventListener('click',function(e){
    var b=e.target.closest('[data-mmc]');if(!b||!who)return;closePops();var t=get(who.id),act=b.dataset.mmc;
    if(act==='fav')t.fav=!t.fav;
    if(act==='report')t.msgs.push({sys:1,t:'Report sent. The SEMA BAY team will review '+who.name+'’s profile.',at:Date.now()});
    if(act==='block'){if(t.status==='blocked'){t.status=t.wasStatus||'open';delete t.wasStatus}else{t.wasStatus=t.status==='request'?'request':'open';t.status='blocked';clearTimeout(timers[who.id]);delete timers[who.id]}}
    if(act==='profile'){var p=who;chat.classList.add('is-min');$('#mmcMin').setAttribute('aria-expanded','false');openViewer(p.id,menuBtn);return}
    put(who.id,t);draw();drawList();
  });
  $('#mmcClose').addEventListener('click',closeChat);
  $('#mmcMin').addEventListener('click',function(){var m=chat.classList.toggle('is-min');this.setAttribute('aria-expanded',m?'false':'true');this.setAttribute('aria-label',m?'Open chat':'Minimise chat');closePops();
    document.documentElement.classList.toggle('mc-lock',!m&&window.innerWidth<=640);if(!m){markRead();drawList()}});
  $('.mc-head').addEventListener('click',function(e){if(chat.classList.contains('is-min')&&!e.target.closest('button')){$('#mmcMin').click()}});
  $('#mcBack').addEventListener('click',function(){chat.classList.remove('show-conv');closePops();drawList();var a=listEl.querySelector('.is-active');if(a)a.focus()});
  launch.addEventListener('click',function(){
    if(!authed()){needLogin(function(){hydrateChats().then(function(){launch.click()})});return}
    if(who){openChat(who);return}
    var a=all(), ids=Object.keys(a).filter(function(id){return byId(id)&&(a[id].msgs||[]).length}).sort(function(x,y){return lastAt(a[y])-lastAt(a[x])});
    openChat(ids.length?byId(ids[0]):null);
  });
  var navChats=document.getElementById('sbNavChats');
  if(navChats)navChats.addEventListener('click',function(e){e.preventDefault();openChat(who)});
  if(window.SBAuth&&SBAuth.onChange){
    SBAuth.onChange(function(u){
      if(u)hydrateChats();
      else{store.threads={};store.newChats={};who=null;chatReady=false;closeChat();drawList()}
    });
  }
  if(window.SBAuth&&SBAuth.refresh)SBAuth.refresh().then(function(){hydrateChats()});
  else hydrateChats();

  fillCountries();render();
})();
