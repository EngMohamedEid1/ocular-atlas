import type { AnatomyTreeNode } from './ocularTree'

export type MedicalReference = {
  id: string
  publisher: string
  title: string
  url: string
  scope: string
}

/**
 * Open, reviewable sources used by the learning bank.  Subscription texts are
 * deliberately not presented as evidence for a question unless their exact
 * edition and passage have been checked.
 */
export const medicalReferences = {
  grossEye: {
    id: 'webvision-gross-eye',
    publisher: 'NCBI Bookshelf · Webvision, University of Utah',
    title: 'Gross Anatomy of the Eye',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK11534/',
    scope: 'Globe, coats, chambers, lens, vitreous and extraocular anatomy'
  },
  clinicalAnatomy: {
    id: 'msd-ophthalmic-anatomy',
    publisher: 'MSD Manual Professional Edition',
    title: 'Ophthalmic Anatomy',
    url: 'https://www.msdmanuals.com/professional/eye-disorders/approach-to-the-ophthalmologic-patient/ophthalmic-anatomy',
    scope: 'Anterior segment, aqueous flow, conjunctiva, lens and clinical examination'
  },
  retina: {
    id: 'webvision-retina',
    publisher: 'NCBI Bookshelf · Webvision, University of Utah',
    title: 'Simple Anatomy of the Retina',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK11533/',
    scope: 'Retinal layers, photoreceptors, macula and retinal circuitry'
  },
  ocularCirculation: {
    id: 'ncbi-ocular-circulation',
    publisher: 'NCBI Bookshelf',
    title: 'The Ocular Circulation — Anatomy',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK53329/',
    scope: 'Choroid, retinal vessels, ophthalmic arterial supply and ocular compartments'
  },
  visualPathway: {
    id: 'statpearls-visual-pathway',
    publisher: 'NCBI Bookshelf · StatPearls',
    title: 'Neuroanatomy, Visual Pathway',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK553189/',
    scope: 'Optic nerve, chiasm, tract and visual pathway localisation'
  },
  eyeMuscles: {
    id: 'statpearls-eye-muscles',
    publisher: 'NCBI Bookshelf · StatPearls',
    title: 'Anatomy, Head and Neck: Eye Muscles',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK470534/',
    scope: 'Extraocular muscles, levator, pupil muscles and accommodation'
  },
  eyeAndAdnexa: {
    id: 'statpearls-eye-adnexa',
    publisher: 'NCBI Bookshelf · StatPearls',
    title: 'Anatomy, Head and Neck, Eye',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK482428/',
    scope: 'Orbit, conjunctiva, lacrimal apparatus, extraocular muscles and globe'
  },
  lens: {
    id: 'webvision-lens',
    publisher: 'NCBI Bookshelf · Webvision, University of Utah',
    title: 'Crystalline Lens and Cataract',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK476171/',
    scope: 'Lens structure, optics and cataract'
  },
  basicEye: {
    id: 'nei-how-eyes-work',
    publisher: 'National Eye Institute (NIH)',
    title: 'How the Eyes Work',
    url: 'https://www.nei.nih.gov/learn-about-eye-health/healthy-vision/how-eyes-work',
    scope: 'Light path and the integrated function of cornea, pupil, lens, retina and optic nerve'
  }
} satisfies Record<string, MedicalReference>

const groupedIds = {
  retina: new Set([
    'retina', 'macula', 'fovea', 'faz', 'foveola', 'umbo', 'parafovea', 'perifovea', 'rpe', 'rpeCells',
    'photoreceptors', 'rodsCones', 'rods', 'cones', 'photoreceptorOuterSegments', 'photoreceptorInnerSegments',
    'elm', 'onl', 'opl', 'inl', 'ipl', 'gcl', 'nfl', 'ilm', 'bipolarCells', 'ganglionCells', 'opticDisc',
    'opticCup', 'neuroretinalRim', 'prelaminarOpticNerve', 'laminarOpticNerve', 'retrolaminarOpticNerve'
  ]),
  circulation: new Set([
    'choroid', 'hallerLayer', 'sattlerLayer', 'choriocapillaris', 'bruchsMembrane', 'retinalVessels',
    'superficialPlexus', 'deepPlexus', 'centralRetinalArtery', 'centralRetinalVein', 'retinalArterioles',
    'retinalVenules', 'ophthalmicArtery'
  ]),
  pathway: new Set(['opticNerve', 'opticNerveSheath', 'opticNerveDura', 'opticNerveArachnoid', 'opticNervePia', 'chiasm']),
  muscles: new Set([
    'muscles', 'superiorRectus', 'inferiorRectus', 'medialRectus', 'lateralRectus', 'superiorOblique',
    'inferiorOblique', 'levatorPalpebrae', 'sphincterPupillae', 'dilatorPupillae', 'ciliaryMuscle'
  ]),
  adnexa: new Set([
    'conjunctiva', 'bulbarConjunctiva', 'palpebralConjunctiva', 'conjunctivalFornix', 'gobletCells',
    'lacrimalApparatus', 'lacrimalGland', 'lacrimalDuctules', 'lacrimalPuncta', 'lacrimalCanaliculi',
    'lacrimalSac', 'nasolacrimalDuct', 'orbitalFat', 'orbitalBone'
  ]),
  lens: new Set(['lens', 'lensCapsule', 'lensCortex', 'lensNucleus', 'lensEpithelium', 'lensEquator', 'lensFibers', 'lensSutures'])
}

/** Select the most focused open reference available for the selected structure. */
export const medicalReferenceFor = (part: Pick<AnatomyTreeNode, 'id'>): MedicalReference => {
  if (groupedIds.retina.has(part.id)) return medicalReferences.retina
  if (groupedIds.circulation.has(part.id)) return medicalReferences.ocularCirculation
  if (groupedIds.pathway.has(part.id)) return medicalReferences.visualPathway
  if (groupedIds.muscles.has(part.id)) return medicalReferences.eyeMuscles
  if (groupedIds.adnexa.has(part.id)) return medicalReferences.eyeAndAdnexa
  if (groupedIds.lens.has(part.id)) return medicalReferences.lens
  if (part.id === 'aqueousSystem' || part.id === 'trabecularMeshwork' || part.id === 'schlemmCanal' || part.id === 'collectorChannels') return medicalReferences.clinicalAnatomy
  return medicalReferences.grossEye
}
