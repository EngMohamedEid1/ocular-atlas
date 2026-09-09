import type { MedicalNode } from './retinalLayers'

export type AnatomyTreeNode = MedicalNode & {
  parentId?: string
  children?: AnatomyTreeNode[]
  imaging: string[]
  diseases: string[]
  procedures: string[]
}

const sourceRef = 'Gray’s Anatomy, 42nd Ed. · Ryan’s Retina, 6th Ed.'
const part = (
  id: string,
  arabic: string,
  name: string,
  latin: string,
  color: string,
  parentId?: string,
  children: AnatomyTreeNode[] = [],
  details: Partial<Pick<AnatomyTreeNode, 'location' | 'function' | 'histology' | 'damage' | 'clinical' | 'imaging' | 'diseases' | 'procedures'>> = {}
): AnatomyTreeNode => ({
  id, order: 0, arabic, name, latin, color, parentId, children,
  location: details.location || 'Part of the human ocular and orbital anatomy.',
  function: details.function || 'Contributes to ocular protection, optics, movement, perfusion, or neural transmission.',
  histology: details.histology || 'Specialized ocular connective, neural, epithelial, or vascular tissue.',
  damage: details.damage || 'Damage may alter vision, ocular movement, or ocular integrity.',
  clinical: details.clinical || 'Correlate anatomy with examination findings and multimodal imaging.',
  imaging: details.imaging || ['OCT', 'Fundus photography'],
  diseases: details.diseases || ['Inflammation', 'Trauma', 'Degenerative change'],
  procedures: details.procedures || ['Clinical examination'],
  reference: sourceRef,
  reviewed: '2026-09-08'
})

const micro = (id: string, arabic: string, name: string, latin: string, color: string, parentId: string, children: AnatomyTreeNode[] = []) => part(id, arabic, name, latin, color, parentId, children, {
  location: name+' is a distinct microanatomical structure within the '+parentId+' complex and should be interpreted with its immediately adjacent layers.',
  function: 'It makes a specialised structural, optical, neural, vascular, barrier, or drainage contribution within its parent structure.',
  histology: 'It is recognised as a named cellular, fibrous, epithelial, vascular, or extracellular microanatomical component.',
  damage: 'Inflammation, trauma, ischemia, degeneration, or scarring at this level can alter the performance of the parent structure.',
  clinical: 'Correlate the structure with the parent anatomy, focused examination, and the imaging modality that best resolves its depth and relation.',
  imaging: ['Focused examination', 'OCT / targeted imaging'],
  diseases: ['Inflammation', 'Trauma', 'Degenerative change'],
  procedures: ['Anatomical identification and focused clinical assessment']
})

const cornealEpithelialMicro = [
  micro('superficialCornealCells', 'الخلايا السطحية للقرنية', 'Superficial corneal cells', 'Cellulae superficiales corneae', '#9ad6df', 'cornealEpithelium'),
  micro('wingCells', 'الخلايا الجناحية', 'Wing cells', 'Cellulae alatae corneae', '#7fb6ca', 'cornealEpithelium'),
  micro('basalCornealCells', 'الخلايا القاعدية للقرنية', 'Basal corneal cells', 'Cellulae basales corneae', '#5a98b3', 'cornealEpithelium'),
  micro('limbalStemCells', 'الخلايا الجذعية الحوفية', 'Limbal stem cells', 'Cellulae staminales limbi', '#72b9ac', 'cornealEpithelium')
]

const cornealStromalMicro = [
  micro('stromalLamellae', 'صفائح السدى', 'Stromal lamellae', 'Lamellae stromatis corneae', '#dcebe5', 'cornealStroma'),
  micro('keratocytes', 'الخلايا القرنية', 'Keratocytes', 'Keratocyti', '#aacabc', 'cornealStroma'),
  micro('stromalGroundSubstance', 'المادة الأساسية للسدى', 'Stromal ground substance', 'Substantia fundamentalis stromatis', '#b8d9d1', 'cornealStroma')
]

const retinalPhotoreceptorMicro = [
  micro('rods', 'العصي', 'Rods', 'Bacilli retinae', '#d9c56a', 'rodsCones'),
  micro('cones', 'المخاريط', 'Cones', 'Coni retinae', '#e4a95e', 'rodsCones'),
  micro('photoreceptorOuterSegments', 'القطاعات الخارجية للمستقبلات', 'Photoreceptor outer segments', 'Segmenta externa photoreceptorum', '#d99556', 'rodsCones'),
  micro('photoreceptorInnerSegments', 'القطاعات الداخلية للمستقبلات', 'Photoreceptor inner segments', 'Segmenta interna photoreceptorum', '#c77c55', 'rodsCones')
]

const fovealMicro = [
  micro('foveola', 'الحفيرة الدقيقة', 'Foveola', 'Foveola', '#f0bd56', 'fovea'),
  micro('umbo', 'السرة البصرية', 'Umbo', 'Umbo foveae', '#f5d875', 'fovea'),
  micro('parafovea', 'حول الحفيرة', 'Parafovea', 'Parafovea', '#dfa846', 'macula'),
  micro('perifovea', 'محيط الحفيرة', 'Perifovea', 'Perifovea', '#d9983b', 'macula')
]

const opticNerveSheathMicro = [
  micro('opticNerveDura', 'الأم الجافية للعصب البصري', 'Optic nerve dura', 'Dura mater nervi optici', '#c5b87a', 'opticNerveSheath'),
  micro('opticNerveArachnoid', 'العنكبوتية للعصب البصري', 'Optic nerve arachnoid', 'Arachnoidea nervi optici', '#d5ce9a', 'opticNerveSheath'),
  micro('opticNervePia', 'الأم الحنون للعصب البصري', 'Optic nerve pia', 'Pia mater nervi optici', '#dce2ae', 'opticNerveSheath')
]

const irisStromalMicro = [
  micro('irisVessels', 'أوعية القزحية', 'Iris vessels', 'Vasa iridis', '#8d5964', 'irisStroma'),
  micro('irisMelanocytes', 'الخلايا الميلانية بالقزحية', 'Iris melanocytes', 'Melanocyti iridis', '#725d7d', 'irisStroma'),
  micro('anteriorBorderLayer', 'الطبقة الحدّية الأمامية', 'Anterior border layer', 'Stratum limitans anterius iridis', '#7797a6', 'irisStroma')
]

const lensMicro = [
  micro('lensEpithelium', 'ظهارة العدسة', 'Lens epithelium', 'Epithelium lentis', '#ece5bd', 'lensCapsule'),
  micro('lensEquator', 'خط استواء العدسة', 'Lens equator', 'Aequator lentis', '#d9c68d', 'lens'),
  micro('lensFibers', 'ألياف العدسة', 'Lens fibers', 'Fibrae lentis', '#d5ca99', 'lensCortex'),
  micro('lensSutures', 'دروز العدسة', 'Lens sutures', 'Suturae lentis', '#bda665', 'lensNucleus')
]

const vitreousMicro = [
  micro('vitreousBase', 'قاعدة الجسم الزجاجي', 'Vitreous base', 'Basis corporis vitrei', '#6097ad', 'vitreousCortex'),
  micro('anteriorHyaloid', 'الغشاء الزجاجي الأمامي', 'Anterior hyaloid', 'Membrana hyaloidea anterior', '#a2d0d2', 'vitreousCortex', [
    micro('weigerLigament', 'رباط ويغر', 'Wieger ligament', 'Ligamentum hyaloideocapsulare', '#b9ded3', 'anteriorHyaloid')
  ])
]

const opticDiscMicro = [
  micro('prelaminarOpticNerve', 'الجزء قبل الصفائحي', 'Prelaminar optic nerve', 'Pars prelaminaris nervi optici', '#e2bd7d', 'opticDisc'),
  micro('laminarOpticNerve', 'الجزء الصفائحي', 'Laminar optic nerve', 'Pars laminaris nervi optici', '#d3a968', 'opticDisc'),
  micro('retrolaminarOpticNerve', 'الجزء خلف الصفائحي', 'Retrolaminar optic nerve', 'Pars retrolaminaris nervi optici', '#c28d5b', 'opticDisc')
]

const retinalVascularMicro = [
  micro('centralRetinalArtery', 'الشريان المركزي للشبكية', 'Central retinal artery', 'Arteria centralis retinae', '#d04b45', 'retinalVessels'),
  micro('centralRetinalVein', 'الوريد المركزي للشبكية', 'Central retinal vein', 'Vena centralis retinae', '#795fba', 'retinalVessels'),
  micro('retinalArterioles', 'شُرينات الشبكية', 'Retinal arterioles', 'Arteriolae retinae', '#e1665b', 'retinalVessels'),
  micro('retinalVenules', 'وريدات الشبكية', 'Retinal venules', 'Venulae retinae', '#7c78c0', 'retinalVessels')
]

const cornealLayers = [
  part('cornealEpithelium', 'ظهارة القرنية', 'Corneal epithelium', 'Epithelium corneae', '#86c5d7', 'cornea', cornealEpithelialMicro, { location: 'Outermost corneal surface.', function: 'Barrier and smooth refractive surface.', histology: 'Stratified non-keratinized squamous epithelium.', damage: 'Erosion causes pain and infection risk.', clinical: 'Fluorescein staining and contact-lens assessment.', imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Corneal abrasion', 'Keratitis'], procedures: ['Corneal epithelial debridement'] }),
  part('bowmanLayer', 'غشاء بومان', 'Bowman layer', 'Lamina limitans anterior', '#b5dae1', 'cornea', [], { location: 'Between epithelium and stroma.', function: 'Acollagenous support layer.', histology: 'Acellular collagen lamina.', damage: 'Scarring is permanent.', clinical: 'Corneal scar depth assessment.', imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Corneal scar'], procedures: ['Phototherapeutic keratectomy'] }),
  part('cornealStroma', 'سدى القرنية', 'Corneal stroma', 'Substantia propria corneae', '#d4e4dc', 'cornea', cornealStromalMicro, { location: 'Central bulk of cornea.', function: 'Transparency and tensile strength.', histology: 'Ordered collagen lamellae and keratocytes.', damage: 'Edema scatters light.', clinical: 'Pachymetry and transplant planning.', imaging: ['Pachymetry', 'Anterior-segment OCT'], diseases: ['Keratoconus', 'Corneal edema'], procedures: ['Keratoplasty'] }),
  part('descemetMembrane', 'غشاء ديسميت', 'Descemet membrane', 'Membrana Descemeti', '#81b0c4', 'cornea', [], { location: 'Posterior corneal basement membrane.', function: 'Supports corneal endothelium.', histology: 'Basement membrane secreted by endothelium.', damage: 'Tear may cause acute hydrops.', clinical: 'Endothelial disease evaluation.', imaging: ['Specular microscopy', 'Anterior-segment OCT'], diseases: ['Fuchs dystrophy'], procedures: ['DMEK'] }),
  part('cornealEndothelium', 'بطانة القرنية', 'Corneal endothelium', 'Endothelium corneae', '#5d91a7', 'cornea', [], { location: 'Innermost corneal layer.', function: 'Maintains stromal dehydration.', histology: 'Single hexagonal cell layer.', damage: 'Cell loss causes corneal edema.', clinical: 'Cell count and graft follow-up.', imaging: ['Specular microscopy'], diseases: ['Fuchs endothelial dystrophy'], procedures: ['DMEK', 'DSAEK'] })
]

const scleralLayers = [
  part('episclera', 'فوق الصلبة', 'Episclera', 'Episclera', '#e4e6dc', 'sclera', [], { location: 'Vascular tissue superficial to sclera.', function: 'Supplies outer sclera.', histology: 'Loose vascular connective tissue.', damage: 'Inflammation produces sectoral redness.', clinical: 'Differentiate episcleritis from scleritis.', imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Episcleritis'], procedures: ['Subconjunctival injection'] }),
  part('scleralStroma', 'سدى الصلبة', 'Scleral stroma', 'Substantia propria sclerae', '#c8c9bd', 'sclera', [], { location: 'Main fibrous coat of globe.', function: 'Shape and muscle anchoring.', histology: 'Dense irregular collagen.', damage: 'Thinning risks staphyloma.', clinical: 'Evaluate inflammation and thickness.', imaging: ['Ultrasound B-scan', 'OCT'], diseases: ['Scleritis', 'Pathologic myopia'], procedures: ['Scleral buckle'] }),
  part('laminaFusca', 'الصفيحة السمراء', 'Lamina fusca', 'Lamina fusca sclerae', '#8e6762', 'sclera', [], { location: 'Deep pigmented scleral layer next to choroid.', function: 'Transition between sclera and uvea.', histology: 'Pigmented connective tissue.', damage: 'May be involved in posterior inflammation.', clinical: 'Choroid-sclera interface.', imaging: ['Enhanced-depth OCT'], diseases: ['Posterior scleritis'], procedures: ['Scleral surgery'] })
]

const retinaLayers = [
  part('rpe', 'الظهارة الصبغية للشبكية', 'Retinal pigment epithelium', 'Stratum pigmentosum retinae', '#a55a40', 'retina', [
    part('rpeCells', 'خلايا RPE', 'RPE cells', 'Cellulae epitheliales pigmentosae', '#8d3d32', 'rpe', [], { location: 'Hexagonal monolayer over Bruch membrane.', function: 'Photoreceptor support and outer blood-retinal barrier.', histology: 'Pigmented hexagonal epithelial cells.', damage: 'Atrophy compromises photoreceptors.', clinical: 'Key layer in AMD and CSR.', imaging: ['OCT', 'FAF', 'OCT-A'], diseases: ['Dry AMD', 'Wet AMD', 'CSR'], procedures: ['Anti-VEGF monitoring'] })
  ], { location: 'Between Bruch membrane and photoreceptors.', function: 'Supports photoreceptors and outer blood-retinal barrier.', histology: 'Pigmented epithelial monolayer.', damage: 'Atrophy causes photoreceptor loss.', clinical: 'AMD and CSR landmark.', imaging: ['OCT', 'FAF', 'ICG'], diseases: ['AMD', 'CSR'], procedures: ['Anti-VEGF monitoring'] }),
  part('photoreceptors', 'المستقبلات الضوئية', 'Photoreceptors', 'Stratum segmentorum photoreceptorum', '#d39a49', 'retina', [
    part('rodsCones', 'العصي والمخاريط', 'Rods and cones', 'Bacilli et coni', '#e1bd63', 'photoreceptors', retinalPhotoreceptorMicro, { location: 'Outer retina adjacent to RPE.', function: 'Convert light into neural signals.', histology: 'Outer and inner segments of rods and cones.', damage: 'Causes night blindness or central acuity loss.', clinical: 'Assess ellipsoid zone on OCT.', imaging: ['OCT', 'FAF'], diseases: ['Retinitis pigmentosa', 'Cone dystrophy'], procedures: ['Inherited-retinal-disease monitoring'] })
  ], { imaging: ['OCT', 'FAF'], diseases: ['Retinitis pigmentosa', 'Macular degeneration'], procedures: ['Retinal monitoring'] }),
  part('elm', 'الغشاء الحاد الخارجي', 'External limiting membrane', 'Membrana limitans externa', '#8ec5b4', 'retina', [], { imaging: ['OCT'], diseases: ['Macular edema'], procedures: ['Retinal monitoring'] }),
  part('onl', 'الطبقة النووية الخارجية', 'Outer nuclear layer', 'Stratum nucleare externum', '#7d72bb', 'retina', [], { imaging: ['OCT'], diseases: ['Retinitis pigmentosa', 'Geographic atrophy'], procedures: ['Retinal monitoring'] }),
  part('opl', 'الطبقة الضفيرية الخارجية', 'Outer plexiform layer', 'Stratum plexiforme externum', '#5e83c7', 'retina', [], { imaging: ['OCT'], diseases: ['Macular edema'], procedures: ['Retinal monitoring'] }),
  part('inl', 'الطبقة النووية الداخلية', 'Inner nuclear layer', 'Stratum nucleare internum', '#5caed2', 'retina', [
    part('bipolarCells', 'الخلايا ثنائية القطب', 'Bipolar cells', 'Cellulae bipolares retinae', '#4e93bb', 'inl', [], { location: 'Within inner nuclear layer.', function: 'Relay photoreceptor signals.', histology: 'Retinal interneurons.', damage: 'Disrupts retinal signal transmission.', clinical: 'Inner-retinal ischemia correlation.', imaging: ['OCT'], diseases: ['Diabetic retinopathy'], procedures: ['Retinal monitoring'] })
  ], { imaging: ['OCT'], diseases: ['Diabetic macular edema', 'Retinal ischemia'], procedures: ['OCT monitoring'] }),
  part('ipl', 'الطبقة الضفيرية الداخلية', 'Inner plexiform layer', 'Stratum plexiforme internum', '#4db79f', 'retina', [], { imaging: ['OCT'], diseases: ['Glaucoma', 'Retinal ischemia'], procedures: ['OCT monitoring'] }),
  part('gcl', 'طبقة الخلايا العقدية', 'Ganglion cell layer', 'Stratum ganglionicum', '#82bd77', 'retina', [
    part('ganglionCells', 'الخلايا العقدية', 'Ganglion cells', 'Cellulae ganglionares retinae', '#5d9c62', 'gcl', [], { location: 'Inner retina facing vitreous.', function: 'Send retinal output to optic nerve.', histology: 'Retinal ganglion-cell bodies.', damage: 'Loss is irreversible.', clinical: 'Glaucoma structural biomarker.', imaging: ['OCT RNFL/GCC'], diseases: ['Glaucoma', 'Optic neuropathy'], procedures: ['Glaucoma surveillance'] })
  ], { imaging: ['OCT GCC'], diseases: ['Glaucoma'], procedures: ['Glaucoma surveillance'] }),
  part('nfl', 'طبقة الألياف العصبية', 'Nerve fiber layer', 'Stratum neurofibrarum', '#d0cc66', 'retina', [], { imaging: ['OCT RNFL'], diseases: ['Glaucoma', 'Papilledema'], procedures: ['RNFL analysis'] }),
  part('ilm', 'الغشاء الحاد الداخلي', 'Internal limiting membrane', 'Membrana limitans interna', '#ece8d3', 'retina', [], { imaging: ['OCT'], diseases: ['ERM', 'VMT', 'Macular hole'], procedures: ['Membrane peeling'] })
]

export const ocularTree: AnatomyTreeNode[] = [
  part('sclera', 'الصُّلْبة', 'Sclera', 'Sclera', '#d7d7cb', undefined, [
    ...scleralLayers,
    part('cornea', 'القرنية', 'Cornea', 'Cornea', '#8fb2c5', 'sclera', cornealLayers, { location: 'Transparent anterior one-sixth of fibrous coat.', function: 'Primary refracting surface.', histology: 'Five principal layers.', damage: 'Scar or edema reduces optical clarity.', clinical: 'Slit-lamp and pachymetry assessment.', imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Keratitis', 'Keratoconus', 'Fuchs dystrophy'], procedures: ['Keratoplasty', 'DMEK'] })
  ], { location: 'Outer fibrous coat of globe.', function: 'Protects globe and anchors muscles.', histology: 'Dense irregular collagen.', damage: 'Thinning compromises globe integrity.', clinical: 'Scleritis and buckle landmark.', imaging: ['B-scan', 'OCT'], diseases: ['Scleritis', 'Staphyloma'], procedures: ['Scleral buckle'] }),
  part('choroid', 'المشيمية', 'Choroid', 'Choroidea', '#934c4b', undefined, [
    part('hallerLayer', 'طبقة هالر', 'Haller layer', 'Stratum vasculosum choroideae', '#8d3d3f', 'choroid', [], { location: 'Outer large-vessel choroid.', function: 'Carries large choroidal vessels.', histology: 'Large-caliber vascular channels.', damage: 'May alter outer-retinal perfusion.', clinical: 'Choroidal thickness assessment.', imaging: ['Enhanced-depth OCT', 'ICG'], diseases: ['Pachychoroid spectrum'], procedures: ['Choroidal monitoring'] }),
    part('sattlerLayer', 'طبقة ساتلر', 'Sattler layer', 'Stratum medium vasculosum', '#af605a', 'choroid', [], { location: 'Middle choroidal vascular layer.', function: 'Feeds choriocapillaris.', histology: 'Medium-caliber vessels.', damage: 'Can be affected by inflammation.', clinical: 'Uveitic choroidal evaluation.', imaging: ['Enhanced-depth OCT', 'ICG'], diseases: ['Posterior uveitis'], procedures: ['Choroidal monitoring'] }),
    part('choriocapillaris', 'الشعيرات الدموية المشيمية', 'Choriocapillaris', 'Choriocapillaris', '#c56859', 'choroid', [], { location: 'Capillary bed next to Bruch membrane.', function: 'Perfuses RPE and outer retina.', histology: 'Fenestrated capillary network.', damage: 'Impairment affects photoreceptors.', clinical: 'Outer-retinal disease correlation.', imaging: ['OCT-A', 'ICG'], diseases: ['AMD', 'CSR'], procedures: ['Anti-VEGF monitoring'] }),
    part('bruchsMembrane', 'غشاء بروخ', 'Bruch membrane', 'Membrana Bruchii', '#d7b57c', 'choroid', [], { location: 'Between RPE and choriocapillaris.', function: 'Exchange barrier for outer retina.', histology: 'Multilayer extracellular matrix.', damage: 'Drusen and breaks enable CNV.', clinical: 'AMD landmark.', imaging: ['OCT', 'FAF'], diseases: ['AMD', 'Angioid streaks'], procedures: ['Anti-VEGF monitoring'] })
  ], { location: 'Vascular coat between sclera and retina.', function: 'Supplies the outer retina.', histology: 'Haller, Sattler and choriocapillaris layers.', damage: 'Ischemia threatens RPE and photoreceptors.', clinical: 'Pachychoroid, AMD and CSR context.', imaging: ['Enhanced-depth OCT', 'ICG', 'OCT-A'], diseases: ['AMD', 'CSR', 'Choroiditis'], procedures: ['Choroidal monitoring'] }),
  part('iris', 'القزحية والحدقة', 'Iris and pupil', 'Iris', '#5c7488', undefined, [
    part('irisStroma', 'سدى القزحية', 'Iris stroma', 'Stroma iridis', '#5d7f92', 'iris', irisStromalMicro, { location: 'Anterior iris connective tissue.', function: 'Determines iris color and supports vessels.', histology: 'Loose vascular pigmented stroma.', damage: 'Atrophy alters pupil behavior.', clinical: 'Iritis and neovascularization.', imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Uveitis', 'Rubeosis iridis'], procedures: ['Iris repair'] }),
    part('sphincterPupillae', 'مصرة الحدقة', 'Sphincter pupillae', 'Musculus sphincter pupillae', '#8a4c52', 'iris', [], { location: 'Circular muscle at pupillary margin.', function: 'Constricts pupil.', histology: 'Smooth muscle.', damage: 'Produces abnormal pupil response.', clinical: 'Pharmacologic pupil testing.', imaging: ['Slit lamp'], diseases: ['Adie pupil', 'Iritis'], procedures: ['Pupilloplasty'] }),
    part('dilatorPupillae', 'موسعة الحدقة', 'Dilator pupillae', 'Musculus dilatator pupillae', '#73505c', 'iris', [], { location: 'Posterior iris pigment epithelium.', function: 'Dilates pupil.', histology: 'Radial myoepithelial fibers.', damage: 'Impaired dilation.', clinical: 'Sympathetic pathway testing.', imaging: ['Slit lamp'], diseases: ['Horner syndrome'], procedures: ['Pupilloplasty'] }),
    part('pupil', 'الحدقة', 'Pupil', 'Pupilla', '#15191f', 'iris', [], { location: 'Central iris aperture.', function: 'Regulates retinal illumination.', histology: 'Aperture bounded by iris.', damage: 'Irregularity suggests synechiae or trauma.', clinical: 'Pupil reflex examination.', imaging: ['Slit lamp'], diseases: ['Uveitis', 'Traumatic mydriasis'], procedures: ['Pupilloplasty'] })
  ], { imaging: ['Slit lamp', 'Anterior-segment OCT'], diseases: ['Uveitis', 'Glaucoma'], procedures: ['Pupilloplasty'] }),
  part('ciliary', 'الجسم الهدبي والألياف الزُّنارية', 'Ciliary body and zonules', 'Corpus ciliare', '#846c91', undefined, [
    part('parsPlicata', 'الجزء المطوي', 'Pars plicata', 'Pars plicata corporis ciliaris', '#9b657d', 'ciliary', [], { location: 'Anterior folded ciliary body.', function: 'Aqueous production and zonule attachment.', histology: 'Ciliary processes with bilayered epithelium.', damage: 'May alter aqueous dynamics.', clinical: 'Cyclitis and aqueous secretion.', imaging: ['Ultrasound biomicroscopy'], diseases: ['Uveitis', 'Glaucoma'], procedures: ['Cyclophotocoagulation'] }),
    part('parsPlana', 'الجزء المسطح', 'Pars plana', 'Pars plana corporis ciliaris', '#76576e', 'ciliary', [], { location: 'Flat posterior ciliary body.', function: 'Safe posterior segment access region.', histology: 'Non-pigmented ciliary epithelium.', damage: 'Entry too anterior risks retina or lens.', clinical: 'Landmark for vitrectomy.', imaging: ['Ultrasound biomicroscopy'], diseases: ['Peripheral retinal detachment'], procedures: ['Pars plana vitrectomy'] }),
    part('ciliaryMuscle', 'العضلة الهدبية', 'Ciliary muscle', 'Musculus ciliaris', '#a36068', 'ciliary', [], { location: 'Within ciliary body.', function: 'Accommodation and trabecular tension.', histology: 'Smooth-muscle fibers.', damage: 'Accommodation dysfunction.', clinical: 'Presbyopia physiology.', imaging: ['Ultrasound biomicroscopy'], diseases: ['Accommodation disorders'], procedures: ['Ciliary procedures'] }),
    part('zonules', 'ألياف زنارية', 'Zonular fibers', 'Zonula ciliaris', '#e8e2b9', 'ciliary', [], { location: 'From ciliary processes to lens capsule.', function: 'Suspends lens.', histology: 'Fibrillin-rich microfibrils.', damage: 'Lens subluxation.', clinical: 'Pseudoexfoliation and Marfan correlation.', imaging: ['Ultrasound biomicroscopy'], diseases: ['Pseudoexfoliation', 'Marfan syndrome'], procedures: ['Capsular support devices'] })
  ], { imaging: ['Ultrasound biomicroscopy', 'Anterior-segment OCT'], diseases: ['Uveitis', 'Glaucoma'], procedures: ['Pars plana vitrectomy'] }),
  part('lens', 'العدسة البلورية', 'Crystalline lens', 'Lens crystallina', '#e8deb4', undefined, [
    part('lensCapsule', 'محفظة العدسة', 'Lens capsule', 'Capsula lentis', '#eee8c6', 'lens', [lensMicro[0]], { location: 'Outer lens envelope.', function: 'Supports lens fibers and zonules.', histology: 'Thick basement membrane.', damage: 'Tear complicates cataract surgery.', clinical: 'Capsulorhexis landmark.', imaging: ['Slit lamp'], diseases: ['Capsular fibrosis'], procedures: ['Cataract extraction'] }),
    part('lensCortex', 'قشرة العدسة', 'Lens cortex', 'Cortex lentis', '#dfd4a5', 'lens', [lensMicro[2]], { location: 'Outer lens fibers.', function: 'Refractive gradient.', histology: 'Newer lens fibers.', damage: 'Cortical opacity.', clinical: 'Cataract grading.', imaging: ['Slit lamp'], diseases: ['Cortical cataract'], procedures: ['Phacoemulsification'] }),
    part('lensNucleus', 'نواة العدسة', 'Lens nucleus', 'Nucleus lentis', '#c5ad72', 'lens', [lensMicro[3]], { location: 'Central lens fibers.', function: 'Fine refractive power.', histology: 'Compacted old lens fibers.', damage: 'Nuclear sclerosis.', clinical: 'Cataract density assessment.', imaging: ['Slit lamp'], diseases: ['Nuclear cataract'], procedures: ['Phacoemulsification'] }),
    lensMicro[1]
  ], { imaging: ['Slit lamp', 'Scheimpflug imaging'], diseases: ['Cataract', 'Lens subluxation'], procedures: ['Phacoemulsification', 'IOL implantation'] }),
  part('vitreous', 'الجسم الزجاجي', 'Vitreous body', 'Corpus vitreum', '#9bb9c4', undefined, [
    part('vitreousCortex', 'قشرة الجسم الزجاجي', 'Vitreous cortex', 'Cortex vitreus', '#7da5b5', 'vitreous', [vitreousMicro[0], vitreousMicro[1]], { location: 'Peripheral condensed vitreous.', function: 'Interfaces with retina and ciliary body.', histology: 'Dense collagen near surfaces.', damage: 'Traction may develop.', clinical: 'Vitreoretinal interface assessment.', imaging: ['OCT', 'B-scan'], diseases: ['PVD', 'VMT'], procedures: ['Vitrectomy'] }),
    part('posteriorHyaloid', 'الغشاء الزجاجي الخلفي', 'Posterior hyaloid', 'Membrana hyaloidea posterior', '#92c4cc', 'vitreous', [], { location: 'Vitreous surface over retina.', function: 'Vitreoretinal interface.', histology: 'Condensed cortical vitreous.', damage: 'Separation or traction affects macula.', clinical: 'PVD staging on OCT.', imaging: ['OCT'], diseases: ['PVD', 'VMT', 'Macular hole'], procedures: ['Vitrectomy'] }),
    part('cloquetCanal', 'قناة كلوكيه', 'Cloquet canal', 'Canalis hyaloideus', '#6da7b7', 'vitreous', [], { location: 'Central vitreous tract from disc to lens.', function: 'Remnant of hyaloid artery pathway.', histology: 'Liquefied central vitreous.', damage: 'Persistent remnants may be visible.', clinical: 'Mittendorf dot and Bergmeister papilla.', imaging: ['OCT', 'B-scan'], diseases: ['Persistent fetal vasculature'], procedures: ['Observation'] })
  ], { imaging: ['OCT', 'B-scan'], diseases: ['PVD', 'VMT', 'Vitreous hemorrhage'], procedures: ['Vitrectomy'] }),
  part('aqueousSystem', 'الجهاز المائي وزاوية العين', 'Aqueous system and iridocorneal angle', 'Angulus iridocornealis', '#6fc8d1', undefined, [
    micro('anteriorChamber', 'الغرفة الأمامية', 'Anterior chamber', 'Camera anterior bulbi', '#9cdbdf', 'aqueousSystem'),
    micro('posteriorChamber', 'الغرفة الخلفية', 'Posterior chamber', 'Camera posterior bulbi', '#78bdc9', 'aqueousSystem'),
    part('trabecularMeshwork', 'الشبكة التربيقية', 'Trabecular meshwork', 'Reticulum trabeculare', '#83bda8', 'aqueousSystem', [
      micro('uvealMeshwork', 'الشبكة العنبية', 'Uveal meshwork', 'Pars uvealis reticuli trabecularis', '#9ac8ac', 'trabecularMeshwork'),
      micro('corneoscleralMeshwork', 'الشبكة القرنية الصلبية', 'Corneoscleral meshwork', 'Pars corneoscleralis reticuli trabecularis', '#6ba992', 'trabecularMeshwork'),
      micro('juxtacanalicularTissue', 'النسيج المجاور للقناة', 'Juxtacanalicular tissue', 'Textus juxtacanalicularis', '#5c977f', 'trabecularMeshwork')
    ]),
    micro('schlemmCanal', 'قناة شليم', 'Schlemm canal', 'Sinus venosus sclerae', '#5b98ad', 'aqueousSystem'),
    micro('collectorChannels', 'القنوات الجامعة', 'Collector channels', 'Canales collectores', '#719bb5', 'aqueousSystem')
  ]),
  part('conjunctiva', 'الملتحمة', 'Conjunctiva', 'Tunica conjunctiva', '#e58d99', undefined, [
    micro('bulbarConjunctiva', 'الملتحمة البصلية', 'Bulbar conjunctiva', 'Conjunctiva bulbi', '#e99ca4', 'conjunctiva'),
    micro('palpebralConjunctiva', 'الملتحمة الجفنية', 'Palpebral conjunctiva', 'Conjunctiva palpebrarum', '#d9778d', 'conjunctiva'),
    micro('conjunctivalFornix', 'قبو الملتحمة', 'Conjunctival fornix', 'Fornix conjunctivae', '#cc6f83', 'conjunctiva'),
    micro('gobletCells', 'الخلايا الكأسية', 'Goblet cells', 'Cellulae caliciformes', '#efb0ac', 'conjunctiva')
  ]),
  part('lacrimalApparatus', 'الجهاز الدمعي', 'Lacrimal apparatus', 'Apparatus lacrimalis', '#d9a179', undefined, [
    micro('lacrimalGland', 'الغدة الدمعية', 'Lacrimal gland', 'Glandula lacrimalis', '#d99d73', 'lacrimalApparatus'),
    micro('lacrimalDuctules', 'القنيات الدمعية', 'Lacrimal ductules', 'Ductuli excretorii glandulae lacrimalis', '#e6b98b', 'lacrimalApparatus'),
    micro('lacrimalPuncta', 'النقاط الدمعية', 'Lacrimal puncta', 'Puncta lacrimalia', '#d78e70', 'lacrimalApparatus'),
    micro('lacrimalCanaliculi', 'القنيات الدمعية الصغرى', 'Lacrimal canaliculi', 'Canaliculi lacrimales', '#c87c68', 'lacrimalApparatus'),
    micro('lacrimalSac', 'الكيس الدمعي', 'Lacrimal sac', 'Saccus lacrimalis', '#bd7063', 'lacrimalApparatus'),
    micro('nasolacrimalDuct', 'القناة الأنفية الدمعية', 'Nasolacrimal duct', 'Ductus nasolacrimalis', '#ae665c', 'lacrimalApparatus')
  ]),
  part('retina', 'الشبكية', 'Retina', 'Retina', '#e0a27e', undefined, [
    part('macula', 'البقعة الصفراء', 'Macula', 'Macula lutea', '#e6b94b', 'retina', [
      part('fovea', 'الحُفيرة', 'Fovea', 'Fovea centralis', '#e5a341', 'macula', [fovealMicro[0], fovealMicro[1]], { location: 'Center of macula.', function: 'Highest spatial acuity.', histology: 'Cone-rich avascular specialization.', damage: 'Reduces central vision.', clinical: 'Fixation and acuity center.', imaging: ['OCT', 'OCT-A', 'FAF'], diseases: ['Macular hole', 'AMD', 'CSR'], procedures: ['Macular surgery'] }),
      part('faz', 'المنطقة اللاوعائية', 'Foveal avascular zone', 'Zona avascularis foveae', '#f0c96d', 'macula', [], { location: 'Capillary-free foveal center.', function: 'Preserves optical clarity.', histology: 'Avascular central fovea.', damage: 'Enlargement may reflect ischemia.', clinical: 'Macular perfusion marker.', imaging: ['OCT-A', 'FA'], diseases: ['Diabetic retinopathy', 'Retinal vein occlusion'], procedures: ['Perfusion monitoring'] }),
      fovealMicro[2], fovealMicro[3]
    ], { imaging: ['OCT', 'OCT-A', 'FAF'], diseases: ['AMD', 'Macular edema', 'Macular hole'], procedures: ['Anti-VEGF injection', 'Vitrectomy'] }),
    part('opticDisc', 'القرص البصري', 'Optic disc', 'Discus nervi optici', '#efc58a', 'retina', [
      part('opticCup', 'الحفرة البصرية', 'Optic cup', 'Excavatio disci', '#d7a674', 'opticDisc', [], { location: 'Central optic nerve head depression.', function: 'Physiologic axonal exit contour.', histology: 'Neural and connective-tissue excavation.', damage: 'Enlargement may indicate glaucoma.', clinical: 'Cup-to-disc ratio.', imaging: ['OCT RNFL', 'Fundus photography'], diseases: ['Glaucoma'], procedures: ['Glaucoma surveillance'] }),
      part('neuroretinalRim', 'الحافة العصبية', 'Neuroretinal rim', 'Margo neuroretinalis', '#e8d18d', 'opticDisc', [], { location: 'Tissue surrounding optic cup.', function: 'Contains ganglion axons.', histology: 'Retinal nerve fibers.', damage: 'Notching suggests glaucoma.', clinical: 'ISNT rule assessment.', imaging: ['OCT RNFL', 'Fundus photography'], diseases: ['Glaucoma'], procedures: ['Glaucoma surveillance'] }),
      ...opticDiscMicro
    ], { imaging: ['Fundus photography', 'OCT RNFL'], diseases: ['Glaucoma', 'Papilledema', 'Optic neuritis'], procedures: ['Optic-nerve assessment'] }),
    ...retinaLayers,
    part('retinalVessels', 'الأوعية الشبكية', 'Retinal vessels', 'Vasa retinae', '#bb4039', 'retina', [
      part('superficialPlexus', 'الضفيرة السطحية', 'Superficial vascular plexus', 'Plexus capillaris superficialis', '#cf5d5d', 'retinalVessels', [], { location: 'RNFL/GCL region.', function: 'Perfuses inner retina.', histology: 'Retinal capillary network.', damage: 'Non-perfusion causes ischemia.', clinical: 'OCT-A vessel density.', imaging: ['OCT-A', 'FA'], diseases: ['Diabetic retinopathy', 'CRVO'], procedures: ['Laser photocoagulation'] }),
      part('deepPlexus', 'الضفيرة العميقة', 'Deep capillary plexus', 'Plexus capillaris profundus', '#5378bd', 'retinalVessels', [], { location: 'INL/OPL interface.', function: 'Perfuses middle retina.', histology: 'Fine capillary network.', damage: 'May show microvascular ischemia.', clinical: 'Deep OCT-A plexus analysis.', imaging: ['OCT-A', 'FA'], diseases: ['Diabetic retinopathy', 'Macular telangiectasia'], procedures: ['Retinal monitoring'] }),
      ...retinalVascularMicro
    ], { imaging: ['FA', 'OCT-A'], diseases: ['Diabetic retinopathy', 'Retinal vein occlusion'], procedures: ['Laser photocoagulation', 'Anti-VEGF injection'] })
  ], { imaging: ['OCT', 'OCT-A', 'FAF', 'FA'], diseases: ['Diabetic retinopathy', 'AMD', 'Retinal detachment'], procedures: ['Laser photocoagulation', 'Vitrectomy'] }),
  part('opticNerve', 'العصب البصري', 'Optic nerve', 'Nervus opticus', '#e5cb67', undefined, [
    part('laminaCribrosa', 'الصفيحة المصفوية', 'Lamina cribrosa', 'Lamina cribrosa sclerae', '#d3bb6d', 'opticNerve', [], { location: 'Scleral canal at optic nerve head.', function: 'Supports exiting axons.', histology: 'Perforated collagenous plates.', damage: 'Biomechanical site of glaucomatous injury.', clinical: 'Glaucoma pathophysiology.', imaging: ['OCT EDI'], diseases: ['Glaucoma'], procedures: ['Glaucoma surveillance'] }),
    part('opticNerveSheath', 'غمد العصب البصري', 'Optic nerve sheath', 'Vagina nervi optici', '#d6c88a', 'opticNerve', opticNerveSheathMicro, { location: 'Meningeal coverings around optic nerve.', function: 'Transmits CSF pressure.', histology: 'Dura, arachnoid and pia.', damage: 'Distension suggests raised intracranial pressure.', clinical: 'Papilledema correlation.', imaging: ['MRI orbit', 'Ultrasound'], diseases: ['Idiopathic intracranial hypertension'], procedures: ['Neuro-ophthalmic assessment'] }),
    part('chiasm', 'التصالب البصري', 'Optic chiasm', 'Chiasma opticum', '#e4c867', 'opticNerve', [], { location: 'Midline junction posterior to optic nerves.', function: 'Crosses nasal retinal fibers.', histology: 'Myelinated optic-nerve axons.', damage: 'Can cause bitemporal field loss.', clinical: 'Neuro-ophthalmic localization.', imaging: ['MRI brain and orbit'], diseases: ['Pituitary compression'], procedures: ['Neuro-ophthalmic assessment'] })
  ], { imaging: ['OCT RNFL', 'MRI orbit'], diseases: ['Glaucoma', 'Optic neuritis', 'Papilledema'], procedures: ['Neuro-ophthalmic assessment'] }),
  part('muscles', 'الحجاج والعضلات', 'Orbit and extraocular muscles', 'Musculi bulbi et orbita', '#a95541', undefined, [
    part('superiorRectus', 'العضلة المستقيمة العلوية', 'Superior rectus', 'Musculus rectus superior', '#a95541', 'muscles', [], { location: 'Superior globe to orbital apex.', function: 'Elevates and intorts eye.', histology: 'Skeletal muscle.', damage: 'Vertical diplopia.', clinical: 'Ocular motility testing.', imaging: ['MRI orbit', 'CT orbit'], diseases: ['Thyroid eye disease', 'Strabismus'], procedures: ['Strabismus surgery'] }),
    part('lateralRectus', 'العضلة المستقيمة الوحشية', 'Lateral rectus', 'Musculus rectus lateralis', '#a95541', 'muscles', [], { location: 'Lateral globe to orbital apex.', function: 'Abducts eye.', histology: 'Skeletal muscle.', damage: 'Esotropia with sixth-nerve palsy.', clinical: 'Abduction testing.', imaging: ['MRI orbit'], diseases: ['Sixth nerve palsy'], procedures: ['Strabismus surgery'] }),
    micro('medialRectus', 'العضلة المستقيمة الإنسية', 'Medial rectus', 'Musculus rectus medialis', '#b55c4e', 'muscles'),
    micro('inferiorRectus', 'العضلة المستقيمة السفلية', 'Inferior rectus', 'Musculus rectus inferior', '#bd6653', 'muscles'),
    micro('superiorOblique', 'العضلة المائلة العلوية', 'Superior oblique', 'Musculus obliquus superior', '#9a584d', 'muscles'),
    micro('inferiorOblique', 'العضلة المائلة السفلية', 'Inferior oblique', 'Musculus obliquus inferior', '#c3715d', 'muscles'),
    micro('levatorPalpebrae', 'رافعة الجفن العلوي', 'Levator palpebrae superioris', 'Musculus levator palpebrae superioris', '#b57264', 'muscles'),
    part('orbitalFat', 'الدهون الحجاجية', 'Orbital fat', 'Corpus adiposum orbitae', '#d4ae61', 'muscles', [], { location: 'Around globe and extraocular muscles.', function: 'Cushions and supports globe.', histology: 'Lobulated adipose tissue.', damage: 'Inflammation or expansion displaces globe.', clinical: 'Proptosis assessment.', imaging: ['CT orbit', 'MRI orbit'], diseases: ['Thyroid eye disease', 'Orbital inflammation'], procedures: ['Orbital decompression'] }),
    part('orbitalBone', 'عظم الحجاج', 'Orbital bone', 'Orbita', '#d7c59a', 'muscles', [], { location: 'Bony orbital walls.', function: 'Protects orbital contents.', histology: 'Cortical and trabecular bone.', damage: 'Fracture may entrap muscle.', clinical: 'Trauma assessment.', imaging: ['CT orbit'], diseases: ['Orbital fracture'], procedures: ['Orbital fracture repair'] }),
    part('ophthalmicArtery', 'الشريان العيني', 'Ophthalmic artery', 'Arteria ophthalmica', '#ba4034', 'muscles', [], { location: 'Runs with optic nerve through orbit.', function: 'Supplies globe and orbit.', histology: 'Muscular artery.', damage: 'Occlusion threatens vision.', clinical: 'Vascular emergency context.', imaging: ['CTA', 'MRA', 'Doppler'], diseases: ['Ophthalmic artery occlusion'], procedures: ['Vascular evaluation'] })
  ], { imaging: ['CT orbit', 'MRI orbit'], diseases: ['Thyroid eye disease', 'Orbital cellulitis'], procedures: ['Strabismus surgery', 'Orbital surgery'] })
]

export const anatomyIndex: Record<string, AnatomyTreeNode> = {}
const indexTree = (items: AnatomyTreeNode[]) => items.forEach(item => { anatomyIndex[item.id] = item; indexTree(item.children || []) })
indexTree(ocularTree)

export const flattenTree = (items: AnatomyTreeNode[], expanded: Record<string, boolean>, depth = 0): Array<AnatomyTreeNode & { depth: number; hasChildren: boolean }> => {
  return items.flatMap(item => {
    const itemWithDepth = { ...item, depth, hasChildren: Boolean(item.children?.length) }
    return expanded[item.id] ? [itemWithDepth, ...flattenTree(item.children || [], expanded, depth + 1)] : [itemWithDepth]
  })
}
