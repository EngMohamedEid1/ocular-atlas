<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { retinalLayers, vascularLayers, type MedicalNode } from '~/data/retinalLayers'
import { anatomyIndex, flattenTree, ocularTree } from '~/data/ocularTree'
import { useExplorerStore } from '~/stores/explorer'

const store = useExplorerStore()
const route = useRoute()
const router = useRouter()
const mount = ref<HTMLElement | null>(null)
const activeSection = ref('anatomy')
const sceneReady = ref(false)
const panelOpen = ref(true)
const expandedBranches = ref<Record<string, boolean>>(Object.fromEntries(ocularTree.map(item => [item.id, false])))
const hoveredId = ref('')
const hoverPoint = ref({ x: 0, y: 0 })
const mobilePan = ref(1.25)
const hasExplicitSelection = ref(false)
const measured = ref(278)
const quizFeedback = ref('')
const copy = computed(() => store.language === 'ar')
const pathologyOptions = ['Normal retina', 'NPDR', 'PDR', 'Rhegmatogenous RD', 'Dry AMD', 'Wet AMD / CNV', 'CRVO / BRVO', 'CSR', 'Retinitis Pigmentosa', 'PVD / VMT', 'Macular Hole', 'ROP']
const surgical = ['Intravitreal safe zone', 'Laser photocoagulation', 'Pars plana ports', 'Scleral buckle']
const imagingDescription = computed(() => ({
  OCT: text('مقطع طبقي يطابق طبقات الشبكية المختارة.', 'Cross-sectional layer correlation for the selected structure.'),
  FA: text('خريطة تدفق فلوريسين للأوعية والتسرب الشبكي.', 'Fluorescein vessel-flow and leakage map.'),
  ICG: text('تباين أخضر للدورة الدموية المشيمية.', 'Indocyanine-green view of choroidal circulation.'),
  FAF: text('خريطة نشاط الظهارة الصبغية للشبكية.', 'Fundus autofluorescence map of RPE activity.')
}[store.imaging] || ''))
const refText = 'Gray’s Anatomy, 42nd Ed. · Ryan’s Retina, 6th Ed.'
const legendItems = [
  ['#d7d7cb','الصُّلْبة','Sclera'],['#8fb2c5','القرنية','Cornea'],['#934c4b','المشيمية','Choroid'],['#e0a27e','الشبكية','Retina'],
  ['#a55a40','RPE','Retinal pigment epithelium'],['#e6b94b','البقعة','Macula'],['#efc58a','القرص البصري','Optic disc'],['#5c7488','القزحية','Iris'],
  ['#846c91','الجسم الهدبي','Ciliary body'],['#e8deb4','العدسة','Lens'],['#9bb9c4','الجسم الزجاجي','Vitreous body'],['#e5cb67','العصب البصري','Optic nerve'],
  ['#a95541','العضلات','Extraocular muscles'],['#bb4039','الأوعية','Blood vessels'],['#d4ae61','دهون الحجاج','Orbital fat'],['#d7c59a','عظم الحجاج','Orbital bone']
]
const anatomy = (id:string, arabic:string, name:string, latin:string, color:string, location:string, fn:string, histology:string, damage:string, clinical:string):MedicalNode => ({id,order:0,arabic,name,latin,color,location,function:fn,histology,damage,clinical,reference:refText,reviewed:'2026-09-08'})
const nodes:Record<string,MedicalNode> = {
  sclera: anatomy('sclera','الصُّلْبة','Sclera','Tunica fibrosa bulbi','#dbe8e7','Outer fibrous coat of the globe, continuous with cornea and optic-nerve sheath.','Protects globe and anchors extraocular muscles.','Dense irregular collagen with episclera and lamina fusca.','Thinning raises rupture and staphyloma risk.','Scleritis, myopia-related staphyloma, scleral buckle.'),
  cornea: anatomy('cornea','القرنية','Cornea','Cornea','#82dce8','Transparent anterior one-sixth of the fibrous coat.','Primary refracting surface of the eye.','Epithelium, Bowman layer, stroma, Descemet membrane and endothelium.','Edema or scar reduces optical clarity.','Keratitis, grafting and refractive surgery.'),
  iris: anatomy('iris','القزحية والحدقة','Iris and pupil','Iris','#4fb8a9','Anterior to lens and surrounding pupil.','Regulates retinal illumination.','Stroma, sphincter and dilator muscles with pigment epithelium.','Causes abnormal pupil response or synechiae.','Uveitis, glaucoma and cataract-surgery landmark.'),
  ciliary: anatomy('ciliary','الجسم الهدبي والألياف الزُّنارية','Ciliary body and zonules','Corpus ciliare','#c58aaf','Circumferentially posterior to iris and attached to lens capsule.','Accommodation and aqueous-humor production.','Ciliary muscle with double epithelial layer.','Zonular failure destabilizes the lens.','Pars plana is the posterior surgical entry zone.'),
  lens: anatomy('lens','العدسة البلورية','Crystalline lens','Lens crystallina','#c4eff0','Behind iris and in front of vitreous.','Fine-focuses light through accommodation.','Capsule, anterior epithelium and lens fibers.','Opacity causes cataract.','Phakic versus pseudophakic surgical planning.'),
  vitreous: anatomy('vitreous','الجسم الزجاجي','Vitreous body','Corpus vitreum','#83b6d5','Gel filling the posterior segment.','Maintains contour and supports retina.','Water, collagen fibrils, hyaluronan and posterior hyaloid.','Separation or traction can distort macula.','PVD, VMT, ERM and vitrectomy.'),
  choroid: anatomy('choroid','المشيمية','Choroid','Choroidea','#9c4b4d','Vascular layer between sclera and retina.','Supplies the outer retina.','Haller/Sattler layers and choriocapillaris.','Ischemia compromises RPE and photoreceptors.','CSR, AMD and choroidal neovascularization.'),
  retina: retinalLayers[0],
  opticNerve: anatomy('opticNerve','العصب البصري','Optic nerve','Nervus opticus','#e5c8a0','From optic disc toward optic chiasm.','Conveys retinal output to the brain.','Myelinated axons with meningeal sheath.','Produces field loss and reduced acuity.','Glaucoma, neuritis and papilledema.'),
  chiasm: anatomy('chiasm','التصالب البصري','Optic chiasm','Chiasma opticum','#e5c8a0','Midline junction of optic nerves.','Crosses nasal retinal fibers.','Crossing myelinated axonal tracts.','Classically bitemporal hemianopia.','Pituitary lesions and neuro-ophthalmic localization.'),
  muscles: anatomy('muscles','العضلات المحركة للعين','Extraocular muscles','Musculi bulbi','#c96d79','Attach from orbit to sclera.','Move the globe in coordinated gaze.','Specialized skeletal muscle layers.','Causes strabismus and diplopia.','Motility examination and strabismus surgery.')
}
const selected = computed(() => anatomyIndex[store.selectedId] || nodes[store.selectedId] || retinalLayers.find(x=>x.id===store.selectedId) || nodes.sclera)
const hoveredPart = computed(() => anatomyIndex[hoveredId.value] || nodes[hoveredId.value] || retinalLayers.find(item => item.id === hoveredId.value))
const hoverSummary = computed(() => hoveredPart.value && store.exploded ? {
  name: copy.value ? hoveredPart.value.arabic : hoveredPart.value.name,
  latin: hoveredPart.value.latin,
  function: hoveredPart.value.function
} : null)
const anatomyItems = computed(() => flattenTree(ocularTree, expandedBranches.value))
function text(ar:string,en:string){return copy.value?ar:en}
function selectNode(id:string){store.select(id);panelOpen.value=true;hasExplicitSelection.value=true}
function toggleBranch(id:string){expandedBranches.value={...expandedBranches.value,[id]:!expandedBranches.value[id]}}
function focusNode(id:string){const item=anatomyIndex[id];if(item?.children?.length)expandedBranches.value={...expandedBranches.value,[id]:true};store.exploded=true;selectNode(id)}
function openDetails(id:string){router.push('/anatomy/'+id)}
function scrollCanvas(direction:number){mobilePan.value=Math.max(-3.5,Math.min(3.5,mobilePan.value+direction*1.35))}
function toggleMeasurement(){store.activeTool=store.activeTool==='measure'?'none':'measure';measured.value=store.activeTool==='measure'?278:measured.value}
function activateSurgery(item:string){store.surgicalMode=store.surgicalMode===item?'none':item;store.activeTool=store.surgicalMode==='none'?'none':'surgery';if(store.surgicalMode!=='none')store.exploded=true}
function answerQuiz(id:string){quizFeedback.value=id==='gcl'?text('إجابة صحيحة: طبقة الخلايا العقدية تقابل الجسم الزجاجي.','Correct: the ganglion-cell layer faces the vitreous.') : text('ليست الإجابة. راجع ترتيب الطبقات من المشيمية إلى الجسم الزجاجي.','Not quite. Review the order from choroid to vitreous.')}
let dispose=()=>{}

onMounted(async()=>{
  const queryTool = String(route.query.tool || '')
  const queryFocus = String(route.query.focus || '')
  if(!queryTool&&!queryFocus)store.exploded=false
  if(anatomyIndex[queryFocus]) focusNode(queryFocus)
  if(queryTool==='injection') activateSurgery('Intravitreal safe zone')
  if(queryTool==='ports') activateSurgery('Pars plana ports')
  if(queryTool==='laser') activateSurgery('Laser photocoagulation')
  if(queryTool==='buckle') activateSurgery('Scleral buckle')
  if(!mount.value)return
  const THREE=await import('three')
  const { OrbitControls }=await import('three/examples/jsm/controls/OrbitControls.js')
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#071522',1)
  mount.value.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color('#071522')
  const camera=new THREE.PerspectiveCamera(42,1,.03,140);camera.position.set(5.5,2.3,8.8)
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enableZoom=true;controls.zoomSpeed=1.35;controls.target.set(0,0,.1);controls.minDistance=2.1;controls.maxDistance=60;renderer.domElement.style.touchAction='pan-x pan-y'
  let autoFrame=true;controls.addEventListener('start',()=>{autoFrame=false})
  scene.add(new THREE.HemisphereLight('#ffffff','#b7c7cc',3.1));const light=new THREE.DirectionalLight('#fff7e5',3.8);light.position.set(5,6,8);scene.add(light);const rim=new THREE.PointLight('#9d5a4e',4,18);rim.position.set(-4,-1,-4);scene.add(rim)
  const eye=new THREE.Group();eye.rotation.y=-.35;scene.add(eye)
  const parts:any[]=[];const picks:any[]=[];const mats:any[]=[];const tags:any[]=[];const groups:Record<string,any>={};const objects:Record<string,any>={}
  const label=(word:string,color='#24495d')=>{const c=document.createElement('canvas');c.width=450;c.height=80;const x=c.getContext('2d')!;x.fillStyle='#ffffff';x.fillRect(4,6,442,64);x.strokeStyle=color;x.lineWidth=2;x.strokeRect(4,6,442,64);x.fillStyle='#18374a';x.font='600 28px Arial';x.textAlign='center';x.fillText(word,225,48);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(1.4,.25,1);return s}
  const add=(id:string,obj:any,spread:[number,number,number],tag?:string,color?:string)=>{const g=new THREE.Group();g.name=id;g.userData.spread=new THREE.Vector3(...spread);obj.name=id;g.add(obj);if(tag){const t=label(tag,color);t.position.set(spread[0]*.18,spread[1]*.18+.45,spread[2]*.18);t.visible=false;g.add(t);tags.push(t)}eye.add(g);parts.push(g);picks.push(obj);groups[id]??=g;objects[id]??=obj;obj.traverse?.((o:any)=>{if(o.material){const materialList=Array.isArray(o.material)?o.material:[o.material];materialList.forEach((material:any)=>material.userData.anatomyId=id);mats.push(...materialList)}});return g}
  const shell=(r:number,color:string,opacity:number,side=THREE.FrontSide)=>{
    const geometry=new THREE.SphereGeometry(r,96,64),position=geometry.attributes.position
    for(let i=0;i<position.count;i++){const x=position.getX(i),y=position.getY(i),z=position.getZ(i),noise=(Math.sin(x*3.7+y*2.1)+Math.cos(z*4.6-x*1.8)+Math.sin(y*5.3))*r*.007;position.setXYZ(i,x+(x/r)*noise,y+(y/r)*noise,z+(z/r)*noise)}
    position.needsUpdate=true;geometry.computeVertexNormals()
    return new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color,transparent:true,opacity,roughness:.35,clearcoat:.22,side:THREE.DoubleSide,depthWrite:false}))
  }
  const sclera=shell(2.35,'#d7d7cb',.62);sclera.scale.z=.96;add('sclera',sclera,[-2.5,.1,0],'SCLERA','#496d72')
  const episcleral=new THREE.Group()
  for(let v=0;v<12;v++){const a=v/12*Math.PI*2,vein:any[]=[];for(let k=0;k<6;k++){const radius=1.08+k*.16,offset=Math.sin(k*1.8+v)*.045,x=Math.cos(a+offset)*radius,y=Math.sin(a+offset)*radius,z=Math.sqrt(Math.max(.2,2.33*2.33-x*x-y*y))*.94;vein.push(new THREE.Vector3(x,y,z))}episcleral.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vein),new THREE.LineBasicMaterial({color:v%3===0?'#b94555':'#ce7b75',transparent:true,opacity:.32})))}
  add('sclera',episcleral,[-2.5,.1,0])
  const choroid=shell(2.19,'#934c4b',.6,THREE.BackSide);choroid.scale.z=.96;add('choroid',choroid,[-1.2,-1.15,-.1],'CHOROID','#7e3538')
  const retina=shell(2.08,'#e0a27e',.65,THREE.BackSide);retina.scale.z=.955;const retinaPart=add('retina',retina,[1.2,-1.3,-.1],'RETINA','#a74d43')
  const vitreous=shell(1.98,'#9bb9c4',.13,THREE.BackSide);vitreous.scale.z=.95;add('vitreous',vitreous,[.05,1.6,.35],'VITREOUS','#5d8793')
  const cornea=shell(1.15,'#8fb2c5',.31);cornea.scale.set(1,1,.42);cornea.position.z=2.05;add('cornea',cornea,[2.25,.65,1.1],'CORNEA','#547e94')
  const anteriorChamber=shell(.93,'#b9e8f5',.1);anteriorChamber.scale.set(1,1,.28);anteriorChamber.position.z=1.72;add('cornea',anteriorChamber,[2.25,.65,1.1])
  const lids=new THREE.Group()
  const lidMaterial=new THREE.MeshStandardMaterial({color:'#bc7b72',roughness:.74,metalness:0})
  const upperLid=new THREE.Mesh(new THREE.TorusGeometry(1.22,.12,18,96,Math.PI),lidMaterial);upperLid.position.z=2.12
  const lowerLid=new THREE.Mesh(new THREE.TorusGeometry(1.18,.095,18,96,Math.PI),lidMaterial.clone());lowerLid.rotation.z=Math.PI;lowerLid.position.z=2.1
  const conjunctiva=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,14,96),new THREE.MeshStandardMaterial({color:'#ec9fa4',transparent:true,opacity:.6,roughness:.5}));conjunctiva.position.z=2.08
  lids.add(upperLid,lowerLid,conjunctiva);add('cornea',lids,[2.25,.65,1.1])
  const lacrimal=new THREE.Mesh(new THREE.SphereGeometry(.31,32,24),new THREE.MeshStandardMaterial({color:'#e4a29b',roughness:.65}));lacrimal.scale.set(1.45,.5,.8);lacrimal.position.set(1.6,1.42,1.25);add('muscles',lacrimal,[0,-2.35,1.5])
  const irisGeometry=new THREE.TorusGeometry(.84,.15,24,96),irisPosition=irisGeometry.attributes.position
  for(let i=0;i<irisPosition.count;i++){const x=irisPosition.getX(i),y=irisPosition.getY(i),r=Math.sqrt(x*x+y*y)||1,wave=1+Math.sin(Math.atan2(y,x)*14)*.035;irisPosition.setXY(i,x*wave,y*wave)}
  irisPosition.needsUpdate=true;irisGeometry.computeVertexNormals()
  const iris=new THREE.Mesh(irisGeometry,new THREE.MeshStandardMaterial({color:'#5c7488',roughness:.48}));iris.position.z=1.9;add('iris',iris,[2.65,-.58,.7],'IRIS · PUPIL','#385563')
  const pupil=new THREE.Mesh(new THREE.CircleGeometry(.48,48),new THREE.MeshBasicMaterial({color:'#03070c'}));pupil.position.z=2.06;add('iris',pupil,[2.65,-.58,.7])
  const ciliary=new THREE.Mesh(new THREE.TorusGeometry(.98,.15,18,80),new THREE.MeshStandardMaterial({color:'#846c91',roughness:.55}));ciliary.position.z=1.3;add('ciliary',ciliary,[1.9,1.75,.9],'CILIARY BODY','#70526f')
  const lens=shell(.72,'#e8deb4',.86);lens.scale.z=.5;lens.position.z=1.1;add('lens',lens,[1.35,.15,2.15],'LENS','#867a4f')
  const zonules=new THREE.Group();for(let i=0;i<28;i++){const a=i/28*Math.PI*2;zonules.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*.92,Math.sin(a)*.92,1.25),new THREE.Vector3(Math.cos(a)*.5,Math.sin(a)*.5,1.1)]),new THREE.LineBasicMaterial({color:'#f5ead0',transparent:true,opacity:.6})))}add('ciliary',zonules,[1.9,1.75,.9])
  const nerve=new THREE.Mesh(new THREE.CylinderGeometry(.32,.48,2.45,40),new THREE.MeshStandardMaterial({color:'#e5cb67',roughness:.7}));nerve.rotation.x=Math.PI/2;nerve.position.z=-3.35;add('opticNerve',nerve,[-.3,.15,-2.65],'OPTIC NERVE','#88752a')
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.34,48),new THREE.MeshBasicMaterial({color:'#fac28f'}));disc.position.set(.38,.14,-2.0);disc.rotation.y=Math.PI;retinaPart.add(disc)
  const macula=new THREE.Mesh(new THREE.CircleGeometry(.39,48),new THREE.MeshBasicMaterial({color:'#e9a93d'}));macula.position.set(-.72,.12,-1.94);macula.rotation.y=Math.PI;retinaPart.add(macula)
  const vessels=new THREE.Group();for(let b=0;b<20;b++){const a=b/20*Math.PI*2,points=[new THREE.Vector3(.38,.14,-2.02)];for(let k=1;k<5;k++){const rad=.22+k*.32,x=.38+Math.cos(a+.16*Math.sin(k+b))*rad,y=.14+Math.sin(a+.12*Math.cos(k))*rad;points.push(new THREE.Vector3(x,y,-Math.sqrt(Math.max(.35,4.18-x*x-y*y))))}vessels.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#b83a35'})))}retinaPart.add(vessels)
  const muscles=new THREE.Group(),makeMuscle=(p:number[],r:number[])=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(.16,1.35,8,18),new THREE.MeshStandardMaterial({color:'#a95541',roughness:.65}));m.position.set(p[0],p[1],p[2]);m.rotation.set(r[0],r[1],r[2]);return m};muscles.add(makeMuscle([2.16,0,0],[0,0,Math.PI/2]),makeMuscle([-2.16,0,0],[0,0,-Math.PI/2]),makeMuscle([0,2.16,0],[Math.PI/2,0,0]),makeMuscle([0,-2.16,0],[Math.PI/2,0,0]));add('muscles',muscles,[0,-2.35,1.5],'EXTRAOCULAR MUSCLES','#7b392f')
  const orbit=new THREE.Group()
  const orbitalRim=new THREE.Mesh(new THREE.TorusGeometry(2.9,.22,18,96),new THREE.MeshStandardMaterial({color:'#d7c59a',transparent:true,opacity:.56,roughness:.86,side:THREE.DoubleSide,depthWrite:false}));orbitalRim.scale.z=.82;orbitalRim.position.z=-.55;orbit.add(orbitalRim)
  for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=2.55+(i%3)*.09,fat=new THREE.Mesh(new THREE.SphereGeometry(.34+(i%4)*.04,20,16),new THREE.MeshStandardMaterial({color:'#d4ae61',transparent:true,opacity:.42,roughness:.85,side:THREE.DoubleSide,depthWrite:false}));fat.scale.set(1.5,.78,1.15);fat.position.set(Math.cos(a)*r,Math.sin(a)*r,-1.1+(i%4)*.18);orbit.add(fat)}
  const orbitalTube=(points:any[],color:string,radius:number)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),72,radius,12,false),new THREE.MeshStandardMaterial({color,roughness:.5,side:THREE.DoubleSide}))
  for(let i=0;i<5;i++){const y=-1.2+i*.58,artery=orbitalTube([new THREE.Vector3(-2.8,y,-2.2),new THREE.Vector3(-1.45,y*.75,-2.75),new THREE.Vector3(-.2,y*.42,-2.95),new THREE.Vector3(.45,y*.18,-2.45)],'#b7352d',.035);orbit.add(artery)}
  for(let i=0;i<3;i++){const y=-.7+i*.65,branch=orbitalTube([new THREE.Vector3(2.65,y,-2.1),new THREE.Vector3(1.55,y*.75,-2.7),new THREE.Vector3(.25,y*.4,-3.05)],'#e4c84f',.025);orbit.add(branch)}
  add('muscles',orbit,[0,-2.35,1.5])
  const tube=(p:any[])=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p),64,.19,12,false),new THREE.MeshStandardMaterial({color:'#e4c867',roughness:.55,side:THREE.DoubleSide}));const chiasm=new THREE.Group();chiasm.add(tube([new THREE.Vector3(0,0,-4.5),new THREE.Vector3(-1,0,-5.5),new THREE.Vector3(-.55,0,-6.25)]),tube([new THREE.Vector3(.2,0,-4.5),new THREE.Vector3(1,0,-5.5),new THREE.Vector3(.55,0,-6.25)]),tube([new THREE.Vector3(-.55,0,-6.25),new THREE.Vector3(0,0,-6.55),new THREE.Vector3(.55,0,-6.25)]));add('chiasm',chiasm,[-.5,1.7,-2.7],'OPTIC CHIASM','#88752a')
  const idHash=(id:string)=>[...id].reduce((total,char)=>total+char.charCodeAt(0)*17,0)
  const branchIds=(id:string)=>{const ids=[id];let item=anatomyIndex[id];while(item?.parentId){ids.push(item.parentId);item=anatomyIndex[item.parentId]}return ids}
  const anchorFor=(id:string)=>{const hash=idHash(id),branch=branchIds(id),angle=(hash%360)*Math.PI/180,spread=((hash>>3)%100)/100-.5
    if(branch.includes('cornea'))return new THREE.Vector3(Math.cos(angle)*.62,Math.sin(angle)*.62,2.34)
    if(branch.includes('iris'))return new THREE.Vector3(Math.cos(angle)*.62,Math.sin(angle)*.62,2.08)
    if(branch.includes('ciliary'))return new THREE.Vector3(Math.cos(angle)*.98,Math.sin(angle)*.98,1.3)
    if(branch.includes('lens'))return new THREE.Vector3(Math.cos(angle)*.38,Math.sin(angle)*.38,1.45)
    if(branch.includes('vitreous'))return new THREE.Vector3(Math.cos(angle)*1.25,Math.sin(angle)*1.25,.15+spread*.7)
    if(branch.includes('retina')){const x=Math.cos(angle)*(1.45+spread*.28),y=Math.sin(angle)*(1.45+spread*.28);return new THREE.Vector3(x,y,-Math.sqrt(Math.max(.45,4.2-x*x-y*y)))}
    if(branch.includes('choroid')){const x=Math.cos(angle)*(1.7+spread*.16),y=Math.sin(angle)*(1.7+spread*.16);return new THREE.Vector3(x,y,-Math.sqrt(Math.max(.45,4.65-x*x-y*y)))}
    if(branch.includes('opticNerve'))return new THREE.Vector3(Math.cos(angle)*.2,Math.sin(angle)*.2,-3.55+spread*.7)
    if(branch.includes('muscles'))return new THREE.Vector3(Math.cos(angle)*2.58,Math.sin(angle)*2.58,-.8+spread*1.8)
    const x=Math.cos(angle)*1.9,y=Math.sin(angle)*1.9;return new THREE.Vector3(x,y,Math.sqrt(Math.max(.5,5.35-x*x-y*y))*.96)
  }
  const visualParent=(id:string)=>{let item=anatomyIndex[id];while(item){if(groups[item.id])return groups[item.id];item=item.parentId?anatomyIndex[item.parentId]:undefined}return eye}
  Object.values(anatomyIndex).filter(item=>!objects[item.id]).forEach(item=>{const geometry=item.children?.length?new THREE.TorusGeometry(.1,.024,10,22):new THREE.SphereGeometry(.085,16,12),material=new THREE.MeshStandardMaterial({color:item.color,transparent:true,opacity:.012,roughness:.35,emissive:'#000000'});material.userData.anatomyId=item.id;material.userData.detailTarget=true;const marker=new THREE.Mesh(geometry,material);marker.name=item.id;marker.position.copy(anchorFor(item.id));visualParent(item.id).add(marker);objects[item.id]=marker;picks.push(marker);mats.push(material)})
  mats.forEach((material:any)=>{material.userData.baseOpacity=material.opacity;material.userData.baseColor=material.color?.clone()})
  const guides=new THREE.Group();eye.add(guides)
  const guideLabel=(word:string,color:string)=>{const guide=label(word,color);guide.scale.multiplyScalar(.82);return guide}
  const clearGuides=()=>{while(guides.children.length)guides.remove(guides.children[0])}
  const guideLine=(points:any[],color:string)=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:.95}));guides.add(line);return line}
  const guideDot=(position:any,color:string,r=.11)=>{const dot=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.94}));dot.position.copy(position);guides.add(dot);return dot}
  const rebuildGuides=()=>{
    clearGuides()
    if(store.activeTool==='measure'){
      const left=new THREE.Vector3(-.72,.12,-2.18),right=new THREE.Vector3(-.1,.12,-2.18)
      guideLine([left,right],'#6fffe2');guideDot(left,'#6fffe2',.075);guideDot(right,'#6fffe2',.075)
      const guide=guideLabel(String(measured.value)+' µm','#6fffe2');guide.position.set(-.4,.47,-2.12);guides.add(guide)
    }
    if(store.surgicalMode==='Intravitreal safe zone'){
      const entry=new THREE.Vector3(1.42,-.72,1.78),target=new THREE.Vector3(.32,-.28,-1.48)
      guideLine([entry,target],'#f6d365');guideDot(entry,'#f6d365',.14);const guide=guideLabel('SAFE ZONE · 3.5–4 mm','#f6d365');guide.position.copy(entry).add(new THREE.Vector3(.1,.36,.05));guides.add(guide)
    }
    if(store.surgicalMode==='Laser photocoagulation'){
      for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.12+i*.055,.018,10,32),new THREE.MeshBasicMaterial({color:'#ffc857',transparent:true,opacity:.9}));ring.position.set(-.7+(i%2)*.2,.04+(i-2)*.14,-2.04);guides.add(ring)}
      const guide=guideLabel('LASER SPOTS','#ffc857');guide.position.set(-.7,.75,-2.1);guides.add(guide)
    }
    if(store.surgicalMode==='Pars plana ports'){
      for(let i=0;i<3;i++){const a=-.85+i*.6,port=new THREE.Mesh(new THREE.TorusGeometry(.12,.025,10,28),new THREE.MeshBasicMaterial({color:'#f6d365'}));port.position.set(Math.cos(a)*1.55,Math.sin(a)*1.55,1.5);guides.add(port)}
      const guide=guideLabel('PARS PLANA PORTS','#f6d365');guide.position.set(.2,-1.35,1.7);guides.add(guide)
    }
    if(store.surgicalMode==='Scleral buckle'){
      const buckle=new THREE.Mesh(new THREE.TorusGeometry(2.48,.055,14,96),new THREE.MeshBasicMaterial({color:'#f6d365',transparent:true,opacity:.85}));buckle.scale.z=.96;buckle.rotation.x=.22;guides.add(buckle)
      const guide=guideLabel('SCLERAL BUCKLE','#f6d365');guide.position.set(0,2.75,.15);guides.add(guide)
    }
  }
  const pathology=new THREE.Group();retinaPart.add(pathology);const rebuild=()=>{while(pathology.children.length)pathology.remove(pathology.children[0]);if(store.pathology==='Normal retina')return;const color=store.pathology.includes('AMD')?'#f0cd63':store.pathology.includes('CSR')?'#63cceb':'#dc364b';for(let i=0;i<18;i++){const a=i*2.4,m=new THREE.Mesh(new THREE.SphereGeometry(.035+(i%4)*.016,12,12),new THREE.MeshBasicMaterial({color}));m.position.set(-.72+Math.cos(a)*(.18+i*.027),.12+Math.sin(a)*(.15+i*.02),-2.05);pathology.add(m)}};rebuild()
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2()
  const hitAt=(event:PointerEvent|MouseEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);ray.setFromCamera(pointer,camera);const ids=ray.intersectObjects(picks,true).map(hit=>{let object:any=hit.object;while(object&&!object.name)object=object.parent;return object?.name||''}).filter(Boolean);return ids.find(id=>anatomyIndex[id]&&!anatomyIndex[id].children?.length)||ids[0]||''}
  const onPointerUp=(event:PointerEvent)=>{const id=hitAt(event);if(id){selectNode(id);if(id==='retina')store.retinaExpanded=true}}
  const onPointerMove=(event:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect(),id=hitAt(event);hoverPoint.value={x:Math.min(Math.max(12,event.clientX-rect.left+18),Math.max(12,rect.width-230)),y:Math.min(Math.max(12,event.clientY-rect.top+18),Math.max(12,rect.height-140))};if(hoveredId.value!==id)hoveredId.value=id;renderer.domElement.style.cursor=id?'pointer':'grab'}
  const onPointerLeave=()=>{hoveredId.value=''}
  const onDoubleClick=(event:MouseEvent)=>{const id=hitAt(event);if(id)openDetails(id)}
  renderer.domElement.addEventListener('pointerup',onPointerUp);renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerleave',onPointerLeave);renderer.domElement.addEventListener('dblclick',onDoubleClick)
  const isNarrowViewport=()=>window.innerWidth<=700
  const isTabletViewport=()=>window.innerWidth>700&&window.innerWidth<=1024
  const resize=()=>{if(!mount.value||mount.value.clientWidth===0||mount.value.clientHeight===0)return;renderer.setSize(mount.value.clientWidth,mount.value.clientHeight);camera.aspect=mount.value.clientWidth/mount.value.clientHeight;camera.fov=isNarrowViewport()?62:42;camera.updateProjectionMatrix();autoFrame=true;if(isNarrowViewport())requestAnimationFrame(()=>{const scroller=mount.value?.parentElement;if(scroller)scroller.scrollLeft=Math.max(0,(scroller.scrollWidth-scroller.clientWidth)/2)})};resize();addEventListener('resize',resize)
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(mount.value)
  let focusHalo:any
  const highlight=()=>{const target=objects[store.selectedId]||objects.retina;if(!target)return;if(focusHalo?.parent)focusHalo.parent.remove(focusHalo);const mesh=target.isMesh?target:target.children.find((child:any)=>child.isMesh);if(!mesh?.geometry)return;focusHalo=new THREE.Mesh(mesh.geometry,new THREE.MeshBasicMaterial({color:'#6fffe2',transparent:true,opacity:.34,side:THREE.BackSide,depthWrite:false}));focusHalo.scale.setScalar(1.075);mesh.add(focusHalo)}
  const applyAppearance=()=>{const visibility=.15+Number(store.opacity)/100*.85;mats.forEach((material:any)=>{const focused=(hasExplicitSelection.value&&material.userData.anatomyId===store.selectedId)||material.userData.anatomyId===hoveredId.value;const muted=hasExplicitSelection.value&&Boolean(store.selectedId)&&!focused;if(material.userData.baseOpacity!==undefined){material.transparent=true;material.depthWrite=false;const baseOpacity=material.userData.baseOpacity*visibility;if(material.userData.detailTarget)material.opacity=focused?.98:.018;else material.opacity=focused?Math.max(.92,baseOpacity):Math.max(.22,muted?baseOpacity*.65:baseOpacity)}if(material.userData.baseColor&&material.color){const base=material.userData.baseColor.clone(),hsl={h:0,s:0,l:0};base.getHSL(hsl);material.color.setHSL(hsl.h,Math.min(1,hsl.s*Number(store.saturation)/100),focused?Math.min(.78,hsl.l+.16):hsl.l)}if(material.emissive){material.emissive.set(focused?'#5ef1d4':'#000000');material.emissiveIntensity=focused?.45:0}})}
  const apply=()=>{tags.forEach(tag=>tag.visible=false);parts.forEach(part=>part.userData.focusScale=part.name===store.selectedId?1.12:.96);rebuild();highlight();rebuildGuides();applyAppearance()};const unwatch=watch(()=>[store.exploded,store.pathology,store.selectedId,store.opacity,store.saturation,store.activeTool,store.surgicalMode,hoveredId.value,hasExplicitSelection.value],apply);apply()
  const compactCamera=new THREE.Vector3(5.5,2.3,8.8), explodedCamera=new THREE.Vector3(8.4,3.8,19)
  const tabletCompactCamera=new THREE.Vector3(5.3,2.2,7.8), tabletExplodedCamera=new THREE.Vector3(6.8,3.1,14.5)
  const narrowCompactCamera=new THREE.Vector3(0,1.2,18), narrowExplodedCamera=new THREE.Vector3(0,2.6,40)
  let previousExploded=store.exploded,previousMobilePan=mobilePan.value,frame=0;const render=()=>{frame=requestAnimationFrame(render);const factor=store.exploded?1:0;parts.forEach(p=>{p.position.lerp(p.userData.spread.clone().multiplyScalar(factor*2.8),.075);p.scale.lerp(new THREE.Vector3().setScalar(p.userData.focusScale||1),.12)});if(previousExploded!==store.exploded){previousExploded=store.exploded;autoFrame=true}if(previousMobilePan!==mobilePan.value){previousMobilePan=mobilePan.value;autoFrame=true}if(autoFrame){const narrow=isNarrowViewport(),tablet=isTabletViewport(),destination=store.exploded?(narrow?narrowExplodedCamera:tablet?tabletExplodedCamera:explodedCamera):(narrow?narrowCompactCamera:tablet?tabletCompactCamera:compactCamera);const target=store.exploded?new THREE.Vector3(narrow?mobilePan.value:0,0,-1.5):(narrow?new THREE.Vector3(mobilePan.value,0,0):new THREE.Vector3(0,0,.1));camera.position.lerp(destination,.028);controls.target.lerp(target,.035);if(camera.position.distanceTo(destination)<.08&&controls.target.distanceTo(target)<.03)autoFrame=false}controls.update();renderer.render(scene,camera)};render();sceneReady.value=true
  dispose=()=>{cancelAnimationFrame(frame);unwatch();resizeObserver.disconnect();removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointerup',onPointerUp);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerleave',onPointerLeave);renderer.domElement.removeEventListener('dblclick',onDoubleClick);controls.dispose();renderer.dispose();renderer.domElement.remove()}
})
onBeforeUnmount(()=>dispose())
</script>
<template>
  <main class="atlas" :class="{ 'safe-palette': store.colorSafe }" :dir="copy ? 'rtl' : 'ltr'">
    <header class="topbar">
      <div class="brand"><img class="brand-logo" src="/brand/ophthalmic-atlas-mark.png" alt="" /><div><strong>OCULAR ATLAS</strong><small>COMPLETE 3D EYE &amp; OPHTHALMOLOGY ATLAS</small></div></div>
      <nav><NuxtLink to="/">{{text('التشريح التفاعلي','INTERACTIVE ANATOMY')}}</NuxtLink><NuxtLink to="/quiz">{{text('بنك الأسئلة','QUESTION BANK')}}</NuxtLink></nav>
      <div class="header-actions"><span class="offline"><i></i>{{text('يعمل دون اتصال','OFFLINE READY')}}</span><button class="icon-button" @click="store.language=copy?'en':'ar'">{{copy?'EN':'ع'}}</button></div>
    </header>
    <section class="workspace">
      <aside class="left-rail">
        <div class="rail-heading"><span>{{text('الخريطة التشريحية','ANATOMICAL MAP')}}</span><b>3D</b></div>
        <button v-for="item in anatomyItems" :key="item.id" class="structure hierarchy-node" :class="{selected:store.selectedId===item.id}" :style="{paddingInlineStart:(8+item.depth*16)+'px'}" @mouseenter="hoveredId=item.id" @mouseleave="hoveredId=''" @click="focusNode(item.id)" @dblclick.stop="openDetails(item.id)"><span v-if="item.hasChildren" class="branch-toggle" :class="{ expanded: expandedBranches[item.id] }" role="button" tabindex="0" @click.stop="toggleBranch(item.id)" :aria-label="expandedBranches[item.id] ? text('إخفاء القائمة الفرعية', 'Collapse substructure') : text('إظهار القائمة الفرعية', 'Expand substructure')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" /></svg></span><span class="dot" :style="{background:item.color}"></span><span><strong>{{copy?item.arabic:item.name}}</strong><small>{{item.depth===0?text('اضغط للتفكيك • نقرتان للتفاصيل','Explode • double-click for details'):item.latin}}</small></span></button>
        <div class="rail-footer"><span>{{text('شجرة تشريحية ثلاثية المستوى','Three-level anatomy tree')}}</span><small>{{text('نقرة: تفكيك وإبراز • نقرتان: صفحة التشريح والتصوير والحالات الخاصة بالجزء','Click: isolate • double-click: anatomy, imaging and conditions for this part')}}</small></div>
      </aside>
      <section class="stage">
        <div class="stage-top"><div><p>{{text('الأطلس التشريحي الكامل','COMPLETE OCULAR ATLAS')}}</p><h1>{{store.exploded?text('عرض تفكيكي تشريحي','Anatomical exploded view'):text('العين والجهاز البصري الأمامي والخلفي','Whole eye & visual pathway')}}</h1></div><div class="stage-legend"><span v-for="item in legendItems" :key="item[2]"><i :style="{background:item[0]}"></i>{{copy?item[1]:item[2]}}</span></div></div>
        <div class="canvas-wrap"><div ref="mount" class="canvas-scroll-surface"><div v-if="!sceneReady" class="loading">Building anatomical model…</div><div v-if="hoverSummary" class="anatomy-hover-card" :style="{left:hoverPoint.x+'px',top:hoverPoint.y+'px'}"><b>{{hoverSummary.name}}</b><small>{{hoverSummary.latin}}</small><p>{{hoverSummary.function}}</p></div></div><button class="canvas-scroll-button canvas-scroll-left" type="button" :aria-label="text('تحريك الرسم لليسار','Move drawing left')" @click="scrollCanvas(-1)">‹</button><button class="canvas-scroll-button canvas-scroll-right" type="button" :aria-label="text('تحريك الرسم لليمين','Move drawing right')" @click="scrollCanvas(1)">›</button><span class="canvas-scroll-cue">{{text('استخدم السهمين لرؤية النموذج كاملاً','Use the arrows to view the complete model')}}</span></div>
        <div class="stage-bottom"><button class="primary-action" @click="store.toggleExplode()"><span>{{store.exploded?'↙':'✣'}}</span>{{store.exploded?text('إعادة تركيب العين','Reassemble eye'):text('تفكيك تشريحي منظّم','Exploded anatomy')}}</button><span class="hint">{{text('التسميات مرتبطة بالمجسم وتتحرك معه • انقر على أي بنية','Labels are anchored to structures • click any structure')}}</span></div>
      </section>
      <aside class="right-panel">
        <div class="detail-heading">{{text('ملخص الجزء المختار','SELECTED STRUCTURE')}}</div>
        <div class="selected-content">
          <div class="node-title"><span class="layer-chip" :style="{background:selected.color}">{{selected.order||'✓'}}</span><div><p>{{selected.latin}}</p><h2>{{copy?selected.arabic:selected.name}}</h2></div><button @click="panelOpen=!panelOpen">{{panelOpen?'×':'+'}}</button></div>
          <div v-if="panelOpen" class="medical-card"><div class="medical-row"><span>{{text('الموقع والمجاورات','LOCATION')}}</span><p>{{selected.location}}</p></div><div class="medical-row"><span>{{text('الوظيفة','FUNCTION')}}</span><p>{{selected.function}}</p></div><div class="medical-row"><span>{{text('التركيب النسيجي','HISTOLOGY')}}</span><p>{{selected.histology}}</p></div><div class="medical-row warning"><span>{{text('التلف أو الغياب','IF DAMAGED')}}</span><p>{{selected.damage}}</p></div><div class="medical-row"><span>{{text('ارتباط سريري وجراحي','CLINICAL / SURGICAL')}}</span><p>{{selected.clinical}}</p></div><div class="citation"><span>⌁</span><div><b>{{text('مرجع قابل للتتبع','TRACEABLE REFERENCE')}}</b><p>{{selected.reference}}</p><small>{{text('آخر مراجعة:','Reviewed:')}} {{selected.reviewed}}</small></div></div></div>
        </div>
      </aside>
    </section>
    <footer class="control-deck"><div class="slider-control"><span>◌</span><label>{{text('الشفافية','Opacity')}}<input v-model="store.opacity" type="range" min="15" max="100"><b>{{store.opacity}}%</b></label></div><div class="slider-control"><span>◐</span><label>{{text('تشبع اللون','Color saturation')}}<input v-model="store.saturation" type="range" min="25" max="125"><b>{{store.saturation}}%</b></label></div><div class="creator-credit">{{text('دكتور / سعاد خالد', 'Dr / Soad Khaled')}}</div></footer>
  </main>
</template>

<style scoped>
.anatomy-hover-card{position:absolute;z-index:4;width:min(210px,calc(100% - 24px));padding:10px 11px;border:1px solid rgba(116,242,222,.75);border-radius:8px;background:rgba(5,25,40,.95);box-shadow:0 10px 28px rgba(0,0,0,.42);pointer-events:none;color:#e6fbff;backdrop-filter:blur(8px)}.anatomy-hover-card b,.anatomy-hover-card small{display:block}.anatomy-hover-card b{font-size:12px;color:#8af3de}.anatomy-hover-card small{margin-top:2px;color:#9fb7ca;font-size:9px}.anatomy-hover-card p{margin:7px 0 0;color:#d2e3ee;font-size:10px;line-height:1.45}
@media (max-width: 1024px) {
  .topbar{height:auto;min-height:72px;padding:10px 20px;gap:14px;flex-wrap:wrap}
  .topbar nav{order:3;width:100%;overflow-x:auto;gap:5px;padding-bottom:1px}
  .topbar nav a{flex:0 0 auto}
  .workspace{height:auto;min-height:0;grid-template-columns:220px minmax(0,1fr)}
  .left-rail{max-height:650px}
  .stage{min-height:650px}
  .right-panel{display:block;grid-column:1/-1;grid-row:2;border-inline:0;border-top:1px solid #1b3650;max-height:none}
  .selected-content{display:grid;grid-template-columns:minmax(250px,.45fr) minmax(0,1fr);align-items:start}
  .node-title{border-inline-end:1px solid #1b3650}
  .medical-card{padding-top:8px}
  .control-deck{height:auto;min-height:76px;padding:12px 20px;flex-wrap:wrap;gap:12px}
}

@media (max-width: 700px) {
  .atlas{overflow:visible}
  .topbar{padding:9px 12px;gap:9px}
  .brand{min-width:0;gap:7px}
  .brand-logo{width:34px;height:34px}
  .brand strong{font-size:12px;letter-spacing:.1em}
  .brand small,.offline{display:none}
  .header-actions{margin-inline-start:auto}
  .topbar nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;overflow:visible}
  .topbar nav a{min-width:0;padding:8px 4px;text-align:center;font-size:11px;white-space:nowrap}
  .workspace{display:grid;grid-template-columns:1fr}
  .stage{grid-column:1;grid-row:1;min-height:570px;grid-template-rows:auto minmax(365px,52vh) auto}
  .stage-top{padding:13px 14px 8px;gap:8px;align-items:flex-start;flex-direction:column}
  .stage-top h1{font-size:16px;line-height:1.35}
  .stage-legend{display:flex!important;width:100%;max-width:100%;overflow-x:auto;flex-wrap:nowrap;justify-content:flex-start;gap:7px;padding:3px 0 2px;font-size:9px}
  .stage-legend span{flex:0 0 auto}
  .stage-bottom{min-height:58px;padding:9px 14px}
  .hint{font-size:9px;line-height:1.35}
  .primary-action{flex:0 0 auto;padding:8px 10px}
  .left-rail{display:block;grid-column:1;grid-row:2;max-height:285px;padding:16px 12px;border-inline:0;border-top:1px solid #1b3650}
  .right-panel{display:block;grid-column:1;grid-row:3;border-inline:0;max-height:none}
  .selected-content{display:block}
  .node-title{border-inline-end:0;border-bottom:1px solid #1b3650;padding:14px}
  .medical-card{padding:0 14px 14px}
  .control-deck{padding:11px 12px;gap:9px}
  .slider-control{flex:1 1 100%;justify-content:center}
  .slider-control label{grid-template-columns:auto minmax(120px,1fr) auto;width:min(100%,340px)}
  .quiz-link{width:100%;margin:0;text-align:center}
}
</style>
