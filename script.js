const body=document.body;
const header=document.querySelector('[data-header]');
const navToggle=document.querySelector('[data-nav-toggle]');
const nav=document.querySelector('[data-nav]');
const cartDrawer=document.querySelector('[data-cart]');
const cartContent=document.querySelector('[data-cart-content]');
const cartCount=document.querySelector('[data-cart-count]');
const cartBook=document.querySelector('[data-cart-book]');
const cartSubtotal=document.querySelector('[data-cart-subtotal]');
const customItemsNote=document.querySelector('[data-custom-items-note]');
const bookingModal=document.querySelector('[data-booking-modal]');
const bookingForm=document.querySelector('[data-booking-form]');
const bookingSuccess=document.querySelector('[data-booking-success]');
const videoModal=document.querySelector('[data-video-modal]');
const modalVideo=document.querySelector('[data-modal-video]');
const legalModal=document.querySelector('[data-legal-modal]');
const toast=document.querySelector('[data-toast]');

let project=readProject();
let lastFocus=null;
let toastTimer;
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});

function readProject(){try{const value=JSON.parse(localStorage.getItem('limitless-reels-project'));return Array.isArray(value)?value.map(item=>({...item,lineId:item.lineId||item.id,quantity:Number(item.quantity)||1})):[]}catch{return[]}}
function saveProject(){localStorage.setItem('limitless-reels-project',JSON.stringify(project))}
function setLocked(locked){body.classList.toggle('locked',locked)}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}

function setMenu(open){header.classList.toggle('menu-open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close menu':'Open menu')}
navToggle.addEventListener('click',()=>setMenu(navToggle.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',({target})=>{if(target.closest('a'))setMenu(false)});
document.addEventListener('click',({target})=>{if(header.classList.contains('menu-open')&&!header.contains(target))setMenu(false)});
const updateHeader=()=>header.classList.toggle('scrolled',scrollY>25);updateHeader();addEventListener('scroll',updateHeader,{passive:true});

const revealObserver=new IntersectionObserver((entries,observer)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -35px'});
document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));

const sectionObserver=new IntersectionObserver(entries=>{const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!current)return;document.querySelectorAll('.primary-nav a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current.target.id}`))},{rootMargin:'-25% 0px -65%',threshold:[0,.3,.6]});
document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));

function itemFrom(element){const source=element.closest('[data-item-id]');return{id:source.dataset.itemId,lineId:source.dataset.itemId,name:source.dataset.itemName,type:source.dataset.itemType,quantity:1}}
function addItem(item,open=false){if(!project.some(entry=>entry.lineId===item.lineId)){project.push(item);saveProject();renderProject();showToast(`${item.name} added to your project.`)}else{showToast(`${item.name} is already selected.`)}if(open)openCart()}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>addItem(itemFrom(button))));
document.querySelectorAll('[data-add-direct]').forEach(button=>button.addEventListener('click',()=>addItem(itemFrom(button),true)));

document.querySelectorAll('[data-price-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.priceFilter;document.querySelectorAll('[data-price-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active))});document.querySelectorAll('[data-price-category]').forEach(card=>{card.hidden=filter!=='all'&&!card.dataset.priceCategory.split(' ').includes(filter)})}));

function updateProductButton(card){const quantity=Number(card.querySelector('[data-product-quantity]').value);const total=Number(card.dataset.productPrice)*quantity;card.querySelector('[data-product-add]').textContent=`Add to cart — ${money.format(total)}`}
document.querySelectorAll('[data-product-id]').forEach(card=>{card.querySelector('[data-product-quantity]').addEventListener('change',()=>updateProductButton(card));card.querySelector('[data-product-add]').addEventListener('click',()=>{const option=card.querySelector('[data-product-option]').value;const quantity=Number(card.querySelector('[data-product-quantity]').value);const item={id:card.dataset.productId,lineId:`${card.dataset.productId}::${option}`,name:card.dataset.productName,type:'Priced service',option,quantity,price:Number(card.dataset.productPrice)};const existing=project.find(entry=>entry.lineId===item.lineId);if(existing)existing.quantity+=quantity;else project.push(item);saveProject();renderProject();showToast(`${item.name} added — ${money.format(item.price*quantity)}.`)})});

function renderProject(){const quantityTotal=project.reduce((sum,item)=>sum+(Number(item.quantity)||1),0);const subtotal=project.reduce((sum,item)=>sum+((Number(item.price)||0)*(Number(item.quantity)||1)),0);const customCount=project.filter(item=>!Number(item.price)).length;cartCount.textContent=quantityTotal;cartBook.disabled=project.length===0;cartSubtotal.textContent=subtotal?money.format(subtotal):'Custom quote';customItemsNote.hidden=customCount===0;if(!project.length){cartContent.innerHTML='<div class="empty-cart"><span>◇</span><h3>Build your listing campaign.</h3><p>Add a package or service. We’ll confirm the scope, schedule, and final quote personally.</p></div>'}else{cartContent.innerHTML=project.map(item=>{const quantity=Number(item.quantity)||1;const detail=[item.type,item.option,quantity>1?`Qty ${quantity}`:''].filter(Boolean).join(' · ');const price=Number(item.price)?money.format(Number(item.price)*quantity):'Custom quote';return `<div class="cart-item"><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(detail)}</small><small class="cart-item-price">${price}</small></div><button type="button" data-remove="${escapeHtml(item.lineId)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button></div>`}).join('')}
  document.querySelectorAll('[data-item-id]').forEach(element=>{const added=project.some(item=>item.id===element.dataset.itemId);const button=element.querySelector('[data-add]');if(button){button.classList.toggle('added',added);button.textContent=added?'Added ✓':'Add to project'}if(element.matches('button[data-add-direct]'))element.classList.toggle('added',added)})}
cartContent.addEventListener('click',({target})=>{const button=target.closest('[data-remove]');if(!button)return;project=project.filter(item=>item.lineId!==button.dataset.remove);saveProject();renderProject()});

function openCart(){lastFocus=document.activeElement;cartDrawer.classList.add('open');cartDrawer.setAttribute('aria-hidden','false');setLocked(true);requestAnimationFrame(()=>cartDrawer.querySelector('[data-cart-close]').focus())}
function closeCart(){cartDrawer.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');setLocked(false);lastFocus?.focus()}
document.querySelectorAll('[data-cart-open]').forEach(button=>button.addEventListener('click',openCart));
document.querySelectorAll('[data-cart-close]').forEach(button=>button.addEventListener('click',closeCart));

function openBooking(){if(cartDrawer.classList.contains('open'))closeCart();lastFocus=document.activeElement;bookingForm.querySelector('[data-selected-items]').value=project.map(item=>`${item.type}: ${item.name}${item.option?` (${item.option})`:''} × ${item.quantity||1}${item.price?` — ${money.format(item.price*(item.quantity||1))}`:''}`).join(' | ');bookingModal.showModal();setLocked(true);requestAnimationFrame(()=>bookingForm.elements.firstName.focus())}
function closeBooking(){bookingModal.close();setLocked(false);lastFocus?.focus()}
document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',openBooking));cartBook.addEventListener('click',openBooking);document.querySelectorAll('[data-book-close]').forEach(button=>button.addEventListener('click',closeBooking));
bookingModal.addEventListener('click',({target})=>{if(target===bookingModal)closeBooking()});bookingModal.addEventListener('cancel',event=>{event.preventDefault();closeBooking()});
const shootDate=document.querySelector('[data-shoot-date]');const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);shootDate.min=tomorrow.toISOString().split('T')[0];
bookingForm.addEventListener('submit',event=>{event.preventDefault();const fields=[...bookingForm.querySelectorAll('input,select,textarea')].filter(field=>field.type!=='hidden');fields.forEach(field=>field.setAttribute('aria-invalid',String(!field.checkValidity())));const invalid=fields.find(field=>!field.checkValidity());if(invalid){invalid.focus();showToast('Please complete the required project details.');return}const submission=Object.fromEntries(new FormData(bookingForm));localStorage.setItem('limitless-reels-latest-request',JSON.stringify({...submission,submittedAt:new Date().toISOString()}));bookingForm.hidden=true;bookingModal.querySelector('.booking-intro').hidden=true;bookingSuccess.hidden=false;project=[];saveProject();renderProject()});
bookingModal.addEventListener('close',()=>{setLocked(false);setTimeout(()=>{bookingForm.reset();bookingForm.hidden=false;bookingModal.querySelector('.booking-intro').hidden=false;bookingSuccess.hidden=true;bookingForm.querySelectorAll('[aria-invalid]').forEach(field=>field.removeAttribute('aria-invalid'))},180)});

document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>{const card=button.closest('[data-video]');lastFocus=button;modalVideo.src=card.dataset.video;videoModal.querySelector('[data-video-title]').textContent=card.dataset.title;videoModal.showModal();setLocked(true);modalVideo.play().catch(()=>{})}));
function closeVideo(){modalVideo.pause();modalVideo.removeAttribute('src');modalVideo.load();videoModal.close();setLocked(false);lastFocus?.focus()}
document.querySelector('[data-video-close]').addEventListener('click',closeVideo);videoModal.addEventListener('click',({target})=>{if(target===videoModal)closeVideo()});videoModal.addEventListener('cancel',event=>{event.preventDefault();closeVideo()});

document.querySelectorAll('.faq-item>button').forEach(button=>button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));button.nextElementSibling.hidden=open}));

const legalContent={privacy:'<span class="eyebrow">Legal</span><h2>Privacy overview</h2><p>This preview stores your project selections and test booking request only in your browser. Before launch, connect the booking form to an approved secure provider and replace this overview with a jurisdiction-specific policy reviewed by qualified counsel.</p><h3>Booking information</h3><p>A production business may process contact information, property addresses, schedule preferences, project details, and communications to provide quotes and services.</p><h3>Property privacy</h3><p>Production plans should address occupancy, access, identifiable personal property, usage permissions, and any security-sensitive details before filming.</p>',terms:'<span class="eyebrow">Legal</span><h2>Terms overview</h2><p>Package descriptions are informational and do not create a binding offer. Final scope, pricing, schedule, licensing, cancellation terms, weather policies, travel charges, and property readiness requirements must be confirmed in a written service agreement.</p><h3>Media licensing</h3><p>Usage rights, music licensing, raw footage, revisions, archival periods, and portfolio permissions should be defined for every engagement.</p><h3>Important</h3><p>This placeholder is not legal advice. Replace it with final terms reviewed for the business and service area before accepting bookings or payments.</p>'};
document.querySelectorAll('[data-legal]').forEach(button=>button.addEventListener('click',()=>{lastFocus=button;legalModal.querySelector('[data-legal-content]').innerHTML=legalContent[button.dataset.legal];legalModal.showModal();setLocked(true)}));
function closeLegal(){legalModal.close();setLocked(false);lastFocus?.focus()}document.querySelector('[data-legal-close]').addEventListener('click',closeLegal);legalModal.addEventListener('click',({target})=>{if(target===legalModal)closeLegal()});legalModal.addEventListener('cancel',event=>{event.preventDefault();closeLegal()});

function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
document.addEventListener('keydown',({key})=>{if(key==='Escape'){setMenu(false);if(cartDrawer.classList.contains('open'))closeCart()}});
document.querySelector('[data-year]').textContent=new Date().getFullYear();renderProject();
