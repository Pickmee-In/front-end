import { leafletCss, leafletJavaScript } from './leafletAssets';

// Only bundled code is inserted into this HTML. Item data arrives via a JSON bridge.
export const nativeMapHtml = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>${leafletCss}
html,body,#map{width:100%;height:100%;margin:0;background:#eef7f8}
@keyframes blink{from{opacity:.6}to{opacity:1}}
.selected{animation:blink 700ms ease-in-out infinite alternate}
@media(prefers-reduced-motion:reduce){.selected{animation:none}}
</style></head><body><div id="map" aria-label="Peta item di sekitar"></div>
<script>${leafletJavaScript}</script><script>
(function(){
 const send = value => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(value));
 const map = L.map('map',{zoomControl:false,attributionControl:false,minZoom:8,maxZoom:19}).setView([-6.2,106.8],13);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
 const layers=L.layerGroup().addTo(map);
 let lastCenter=null;
 map.on('zoomend',()=>send({type:'zoom',zoom:map.getZoom()}));
 window.pickmeUpdate = state => {
   if(!state || !Array.isArray(state.items))return;
   const center=state.center;
   if(center && Number.isFinite(center.latitude) && Number.isFinite(center.longitude)){
     const key=center.latitude+','+center.longitude;
     if(key!==lastCenter){map.panTo([center.latitude,center.longitude],{animate:false});lastCenter=key;}
   }
   if(Number.isFinite(state.zoom) && map.getZoom()!==state.zoom)map.setZoom(Math.max(8,Math.min(19,state.zoom)),{animate:false});
   layers.clearLayers();
   if(state.userLocation){
     const pos=[state.userLocation.latitude,state.userLocation.longitude];
     L.circle(pos,{radius:5000,color:'#8CE4FF',weight:1.5,fillOpacity:.08}).addTo(layers);
     L.circleMarker(pos,{radius:8,color:'white',weight:2.5,fillColor:'#2196F3',fillOpacity:1}).addTo(layers);
   }
   state.items.forEach(item=>{
     if(!Number.isFinite(item.latitude)||!Number.isFinite(item.longitude))return;
     const selected=state.selectedId===item.id,size=selected?62:46;
     const color=item.listingType==='thrift'?'#8CE4FF':item.listingType==='donate'?'#4CAF50':'#FF9800';
     const wrapper=document.createElement('div');wrapper.style.cssText='display:flex;flex-direction:column;align-items:center';
     const circle=document.createElement('div');circle.className=selected?'selected':'';
     circle.style.cssText='width:'+size+'px;height:'+size+'px;border:'+(selected?3:2)+'px solid '+color+';border-radius:50%;background:#f0f8fa;box-shadow:0 0 10px '+color+'70;overflow:hidden;box-sizing:border-box';
     const fallback=()=>{circle.textContent='◇';circle.style.color=color;circle.style.textAlign='center';circle.style.lineHeight=(size-6)+'px';circle.style.fontSize='24px';};
     const img=document.createElement('img');img.alt=String(item.title||'Item');img.style.cssText='width:100%;height:100%;object-fit:cover';img.onerror=fallback;
     if(/^https?:\\/\\//i.test(item.imageUrl||'')){img.src=item.imageUrl;circle.appendChild(img);}else fallback();
     const dot=document.createElement('div');dot.style.cssText='width:6px;height:6px;border-radius:50%;background:'+color;
     wrapper.append(circle,dot);
     L.marker([item.latitude,item.longitude],{title:String(item.title||'Item'),icon:L.divIcon({html:wrapper,className:'',iconSize:[size,size+6],iconAnchor:[size/2,(size+6)/2]}),zIndexOffset:selected?100:0}).on('click',()=>send({type:'select',id:item.id})).addTo(layers);
   });
 };
 window.addEventListener('resize',()=>map.invalidateSize());
 send({type:'ready'});
})();
</script></body></html>`;

export function mapUpdateScript(value: unknown) {
  // Escape HTML-sensitive characters even though this is executed as JS, not HTML.
  const json = JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `window.pickmeUpdate && window.pickmeUpdate(${json}); true;`;
}
