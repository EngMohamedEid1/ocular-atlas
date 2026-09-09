import type { AnatomyTreeNode } from './ocularTree'

export type QuestionType = 'essay' | 'mcq' | 'trueFalse'
export type QuestionTrack = 'oral' | 'practical'

export type AnatomyQuestion = {
  id: string
  type: QuestionType
  track: QuestionTrack
  title: string
  prompt: string
  answer: string
  options?: string[]
  correctOption?: number
}

type Fact = { label: string; value: string }

const rotateOptions = (correct: string, candidates: string[], index: number) => {
  const options = [correct, ...candidates.filter(item => item !== correct).slice(0, 3)]
  const offset = index % options.length
  const rotated = [...options.slice(offset), ...options.slice(0, offset)]
  return { options: rotated, correctOption: rotated.indexOf(correct) }
}

// A final guard keeps any accidentally repeated wording out of a structure's
// exam set, even when two data fields happen to contain the same text.
const uniqueQuestions = (questions: AnatomyQuestion[]) => {
  const seen = new Set<string>()
  return questions.filter(question => {
    const key = question.prompt
      .toLocaleLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const englishQuestionsFor = (part: AnatomyTreeNode): AnatomyQuestion[] => {
  const name = part.name
  const diseases = part.diseases.join(', ')
  const imaging = part.imaging.join(', ')
  const procedures = part.procedures.join(', ')
  const facts: Fact[] = [
    { label: 'Location and relations', value: part.location },
    { label: 'Primary function', value: part.function },
    { label: 'Histology', value: part.histology },
    { label: 'Effect of damage', value: part.damage },
    { label: 'Clinical correlation', value: part.clinical },
    { label: 'Imaging', value: imaging },
    { label: 'Related conditions', value: diseases },
    { label: 'Related procedures', value: procedures }
  ]
  const factValues = facts.map(fact => fact.value)
  const essaySeeds: Array<[string, string, string, QuestionTrack]> = [
    ['Anatomical identification', `Define ${name} and state its location and anatomical relations.`, part.location, 'oral'],
    ['Visual function', `What is the primary function of ${name}, and what is the expected effect if it fails?`, part.function+' '+part.damage, 'oral'],
    ['Tissue and cells', `Describe the tissue or cellular structure of ${name} and link it to its function.`, part.histology+' Function: '+part.function, 'oral'],
    ['Clinical correlation', `Link ${name} to an important examination finding or clinical scenario.`, part.clinical, 'oral'],
    ['Injury or disease', `What may happen if ${name} is injured or its function is impaired?`, part.damage, 'oral'],
    ['Differential diagnosis', `Name diseases or syndromes that make ${name} a focus of assessment.`, diseases, 'oral'],
    ['Imaging choice', `Which imaging methods best study ${name}, and why?`, imaging, 'oral'],
    ['Treatment planning', `Which procedures or interventions require knowledge of the anatomy of ${name}?`, procedures, 'oral'],
    ['Relations', `Name a neighbouring structure of ${name} and explain how injury to it may affect examination.`, part.location+' Use the anatomical relation to explain the finding.', 'oral'],
    ['History taking', `In a patient with a suspected problem involving ${name}, which history questions should you start with?`, 'Link the complaint to function: '+part.function+' Then look for indicators of damage: '+part.damage, 'oral'],
    ['Patient explanation', `Explain the importance of ${name} in simple language, then state why examination is needed.`, part.function+' Clinical correlation: '+part.clinical, 'oral'],
    ['Oral review', `Summarise the location, function, and major clinical risk related to ${name}.`, part.location+' | '+part.function+' | '+part.damage, 'oral'],
    ['Model identification', `Point out ${name} on an eye model or diagram and describe its position relative to neighbouring structures.`, 'Reference position: '+part.location, 'practical'],
    ['Image identification', `How would you identify ${name} in a clinical photograph, OCT scan, or orbital image?`, 'Choose: '+imaging+' Then link the appearance to: '+part.histology, 'practical'],
    ['Orientation and relation', `On a diagram, which structure is anterior, posterior, or adjacent to ${name}?`, part.location, 'practical'],
    ['Practical sign', `State one practical sign that should lead to a focused examination of ${name}.`, part.damage+' Related conditions: '+diseases, 'practical'],
    ['Procedure planning', `Before an eye-related procedure, which fact about ${name} must not be overlooked?`, 'Surgical correlation: '+part.clinical+' Procedures: '+procedures, 'practical'],
    ['Visual distinction', `Which structural or histological feature distinguishes ${name} from a nearby structure?`, 'Location: '+part.location+' Histology: '+part.histology, 'practical'],
    ['Imaging correlation', `Choose one imaging method and state the expected normal finding for ${name}.`, 'Suitable methods: '+imaging+' Interpret alongside function: '+part.function, 'practical'],
    ['OSCE station', `In an OSCE station: identify ${name}, state its function, then explain one related pathological sign.`, 'Location: '+part.location+' Function: '+part.function+' Sign: '+part.damage, 'practical'],
    ['Examination decision', `Which examination or imaging test would you request first for suspected disease involving ${name}?`, imaging, 'practical'],
    ['Report interpretation', `Read a brief imaging report and identify the feature that links it to ${name}.`, 'Use '+imaging+' together with: '+part.histology, 'practical'],
    ['Diagram preparation', `Draw a simplified diagram showing the position of ${name}, then label its function.`, 'Location: '+part.location+' Function: '+part.function, 'practical'],
    ['Practical review', `Summarise in three points: how to locate ${name}, what it does, and the risk if damaged.`, 'Identification: '+part.location+' | Function: '+part.function+' | Risk: '+part.damage, 'practical']
  ]
  const essay: AnatomyQuestion[] = Array.from({ length: 50 }, (_, index) => {
    const [title, prompt, answer, track] = essaySeeds[index % essaySeeds.length]
    const fact = facts[index % facts.length]
    const extension = [
      `Structure your answer around the ${fact.label.toLowerCase()} of ${name}.`,
      `State one examination clue and one clinical implication before concluding.`,
      `Contrast the normal finding with a relevant abnormal finding.`,
      `Use a short, examiner-ready sequence: anatomy, function, assessment, and risk.`
    ][Math.floor(index / essaySeeds.length) % 4]
    return { id: part.id+'-essay-'+index, type: 'essay', track, title: title+' · '+(index+1), prompt: prompt+' '+extension, answer }
  })
  const mcq = facts.flatMap((fact, index) => {
    const options = rotateOptions(fact.value, factValues, index)
    const options2 = rotateOptions(fact.value, factValues, index + 1)
    const options3 = rotateOptions(fact.value, factValues, index + 2)
    const options4 = rotateOptions(fact.value, factValues, index + 3)
    const options5 = rotateOptions(fact.value, factValues, index + 4)
    const options6 = rotateOptions(fact.value, factValues, index + 5)
    const options7 = rotateOptions(fact.value, factValues, index + 6)
    return [
      { id: part.id+'-mcq-'+index+'a', type: 'mcq' as const, track: index % 2 ? 'practical' as const : 'oral' as const, title: 'Multiple choice · '+fact.label, prompt: `Which option accurately describes the ${fact.label.toLowerCase()} of ${name}?`, answer: 'Correct answer: '+fact.value, ...options },
      { id: part.id+'-mcq-'+index+'b', type: 'mcq' as const, track: index % 2 ? 'oral' as const : 'practical' as const, title: 'Multiple choice · Application', prompt: `While reviewing ${name}, choose the statement that belongs under “${fact.label}”.`, answer: 'Correct answer: '+fact.value, ...options2 },
      { id: part.id+'-mcq-'+index+'c', type: 'mcq' as const, track: 'practical' as const, title: 'Multiple choice · Identification', prompt: `Which option should be matched with ${name} when asked about its ${fact.label.toLowerCase()}?`, answer: 'Correct answer: '+fact.value, ...options3 },
      { id: part.id+'-mcq-'+index+'d', type: 'mcq' as const, track: 'oral' as const, title: 'Multiple choice · Viva', prompt: `During a viva, which statement best represents ${name} in relation to ${fact.label.toLowerCase()}?`, answer: 'Correct answer: '+fact.value, ...options4 },
      { id: part.id+'-mcq-'+index+'e', type: 'mcq' as const, track: 'practical' as const, title: 'Multiple choice · Clinical reasoning', prompt: `Which finding would most directly support the stated ${fact.label.toLowerCase()} of ${name}?`, answer: 'Correct answer: '+fact.value, ...options5 },
      { id: part.id+'-mcq-'+index+'f', type: 'mcq' as const, track: 'oral' as const, title: 'Multiple choice · Distinction', prompt: `Choose the option that distinguishes ${name} by its ${fact.label.toLowerCase()}.`, answer: 'Correct answer: '+fact.value, ...options6 },
      { id: part.id+'-mcq-'+index+'g', type: 'mcq' as const, track: 'practical' as const, title: 'Multiple choice · OSCE', prompt: `At an OSCE station, which answer should be selected when the examiner asks about ${name} and ${fact.label.toLowerCase()}?`, answer: 'Correct answer: '+fact.value, ...options7 }
    ]
  })
  const trueFalse = facts.flatMap((fact, index) => {
    const incorrect = facts[(index + 1) % facts.length].value
    return [
      { id: part.id+'-tf-'+index+'a', type: 'trueFalse' as const, track: 'oral' as const, title: 'True or false · Concept', prompt: `True or false: “${fact.value}” describes the ${fact.label.toLowerCase()} of ${name}.`, answer: `True. The ${fact.label.toLowerCase()} of ${name} is: ${fact.value}`, options: ['True', 'False'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'b', type: 'trueFalse' as const, track: 'practical' as const, title: 'True or false · Identification', prompt: `True or false: “${incorrect}” is the best description of ${name} in terms of ${fact.label.toLowerCase()}.`, answer: `False. The best description is: ${fact.value}`, options: ['True', 'False'], correctOption: 1 },
      { id: part.id+'-tf-'+index+'c', type: 'trueFalse' as const, track: 'oral' as const, title: 'True or false · Review', prompt: `True or false: when discussing ${name}, its ${fact.label.toLowerCase()} should be linked to “${fact.value}”.`, answer: `True. The ${fact.label.toLowerCase()} of ${name} is: ${fact.value}`, options: ['True', 'False'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'d', type: 'trueFalse' as const, track: 'practical' as const, title: 'True or false · OSCE', prompt: `True or false: the OSCE description “${fact.value}” is compatible with ${name}.`, answer: `True. This is the relevant ${fact.label.toLowerCase()} for ${name}.`, options: ['True', 'False'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'e', type: 'trueFalse' as const, track: 'oral' as const, title: 'True or false · Contrast', prompt: `True or false: “${incorrect}” should be used to describe ${name} under ${fact.label.toLowerCase()}.`, answer: `False. Use: ${fact.value}`, options: ['True', 'False'], correctOption: 1 },
      { id: part.id+'-tf-'+index+'f', type: 'trueFalse' as const, track: 'practical' as const, title: 'True or false · Clinical link', prompt: `True or false: a clinical discussion of ${name} should include “${fact.value}” when considering ${fact.label.toLowerCase()}.`, answer: `True. ${fact.value}`, options: ['True', 'False'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'g', type: 'trueFalse' as const, track: 'oral' as const, title: 'True or false · Examiner check', prompt: `True or false: “${incorrect}” is the safest examiner-ready answer about ${name}.`, answer: `False. The examiner-ready answer is: ${fact.value}`, options: ['True', 'False'], correctOption: 1 }
    ]
  })
  return uniqueQuestions([...essay, ...mcq.slice(0, 50), ...trueFalse.slice(0, 50)])
}

export const questionsFor = (part: AnatomyTreeNode, language: 'ar' | 'en' = 'ar'): AnatomyQuestion[] => {
  if (language === 'en') return englishQuestionsFor(part)
  const name = part.arabic
  const diseases = part.diseases.join('، ')
  const imaging = part.imaging.join('، ')
  const procedures = part.procedures.join('، ')
  const facts: Fact[] = [
    { label: 'الموقع والمجاورات', value: part.location },
    { label: 'الوظيفة الأساسية', value: part.function },
    { label: 'التركيب النسيجي', value: part.histology },
    { label: 'أثر التلف', value: part.damage },
    { label: 'الارتباط السريري', value: part.clinical },
    { label: 'وسيلة التصوير', value: imaging },
    { label: 'الحالات المرتبطة', value: diseases },
    { label: 'التدخلات ذات الصلة', value: procedures }
  ]
  const factValues = facts.map(fact => fact.value)

  const essaySeeds: Array<[string, string, string, QuestionTrack]> = [
    ['تحديد تشريحي', 'عرّف '+name+' وحدد موقعه وعلاقاته التشريحية.', part.location, 'oral'],
    ['وظيفة بصرية', 'ما الوظيفة الأساسية لـ '+name+'؟ وما الأثر المتوقع عند تعطلها؟', part.function+' '+part.damage, 'oral'],
    ['نسيج وخلايا', 'صف التركيب النسيجي أو الخلوي لـ '+name+' واربطه بوظيفته.', part.histology+' الوظيفة: '+part.function, 'oral'],
    ['ارتباط سريري', 'اربط '+name+' بعلامة فحص أو موقف سريري مهم.', part.clinical, 'oral'],
    ['إصابة أو مرض', 'ماذا قد يحدث لو أصيب '+name+' أو تعطلت وظيفته؟', part.damage, 'oral'],
    ['تشخيص تفريقي', 'اذكر الأمراض أو المتلازمات التي تجعل '+name+' محورًا للتقييم.', diseases, 'oral'],
    ['اختيار تصوير', 'ما وسائل التصوير الأنسب لدراسة '+name+'؟ ولماذا؟', imaging, 'oral'],
    ['قرار علاجي', 'ما الإجراءات أو التدخلات التي تتطلب معرفة تشريح '+name+'؟', procedures, 'oral'],
    ['علاقات', 'اذكر بنية مجاورة لـ '+name+' وكيف قد تؤثر إصابتها على الفحص.', part.location+' استخدم العلاقة التشريحية لتفسير العلامة.', 'oral'],
    ['تاريخ مرضي', 'في مريض مشتبه بوجود مشكلة في '+name+'، ما الأسئلة التي تبدأ بها في التاريخ المرضي؟', 'اربط الشكوى بالوظيفة: '+part.function+' ثم ابحث عن مؤشرات التلف: '+part.damage, 'oral'],
    ['شرح للمريض', 'اشرح أهمية '+name+' للمريض بلغة بسيطة ثم اذكر سبب الحاجة للفحص.', part.function+' الارتباط السريري: '+part.clinical, 'oral'],
    ['مراجعة شفوية', 'لخّص الموقع والوظيفة وأهم خطر سريري متعلق بـ '+name+'.', part.location+' | '+part.function+' | '+part.damage, 'oral'],
    ['تعرّف في النموذج', 'أشر إلى '+name+' على نموذج العين أو اللوحة وحدد موضعه بالنسبة للبنى المجاورة.', 'الموضع المرجعي: '+part.location, 'practical'],
    ['تعرّف في الصورة', 'كيف تبحث عن '+name+' في صورة سريرية أو مقطع OCT أو صورة حجاجية؟', 'اختر الوسيلة: '+imaging+' ثم اربط العلامة بالتركيب: '+part.histology, 'practical'],
    ['اتجاه ومجاورة', 'على الرسم، ما البنية الأمامية أو الخلفية أو المجاورة لـ '+name+'؟', part.location, 'practical'],
    ['علامة عملية', 'اذكر علامة عملية واحدة قد تقودك إلى فحص '+name+' بدقة.', part.damage+' الحالات المرتبطة: '+diseases, 'practical'],
    ['تخطيط إجراء', 'قبل إجراء متعلق بالعين، ما معلومة '+name+' التي لا ينبغي إهمالها؟', 'العلاقة الجراحية: '+part.clinical+' الإجراءات: '+procedures, 'practical'],
    ['تمييز بصري', 'ما السمة الشكلية أو النسيجية التي تساعدك على تمييز '+name+' عن بنية قريبة؟', 'الموقع: '+part.location+' والنسيج: '+part.histology, 'practical'],
    ['ربط تصويري', 'اختر طريقة تصوير واحدة واكتب العلامة التي تتوقع رؤيتها عند سلامة '+name+'.', 'الوسائل المناسبة: '+imaging+' وتُفسر مع الوظيفة: '+part.function, 'practical'],
    ['محطة OSCE', 'في محطة عملية: عرّف '+name+'، اذكر وظيفته، ثم اشرح علامة مرضية مرتبطة به.', 'الموقع: '+part.location+' الوظيفة: '+part.function+' العلامة: '+part.damage, 'practical'],
    ['قرار الفحص', 'ما الفحص السريري أو التصوير الذي تطلبه أولاً عند الاشتباه في مشكلة تخص '+name+'؟', imaging, 'practical'],
    ['قراءة تقرير', 'اقرأ تقرير تصوير مختصر ثم حدّد المعلومة التي تربطه بـ '+name+'.', 'استخدم '+imaging+' مع معرفة: '+part.histology, 'practical'],
    ['تحضير رسم', 'ارسم مخططًا مبسطًا يوضح موقع '+name+' ثم اكتب وظيفته بجواره.', 'الموقع: '+part.location+' الوظيفة: '+part.function, 'practical'],
    ['مراجعة عملية', 'لخّص في ثلاث نقاط: كيف تحدده، ماذا يفعل، وما الخطر عند تلفه.', 'التحديد: '+part.location+' | الوظيفة: '+part.function+' | الخطر: '+part.damage, 'practical']
  ]

  const essay: AnatomyQuestion[] = Array.from({ length: 50 }, (_, index) => {
    const [title, prompt, answer, track] = essaySeeds[index % essaySeeds.length]
    const fact = facts[index % facts.length]
    const extension = [
      'نظّم الإجابة حول بند «'+fact.label+'» الخاص بـ '+name+'.',
      'اذكر علامة فحص واحدة ودلالة سريرية واحدة قبل إنهاء الإجابة.',
      'قارن بين المظهر الطبيعي ومظهر غير طبيعي ذي صلة.',
      'استخدم تسلسلاً مناسباً للامتحان: تشريح، وظيفة، فحص، ثم خطر سريري.'
    ][Math.floor(index / essaySeeds.length) % 4]
    return { id: part.id+'-essay-'+index, type: 'essay', track, title: title+' · '+(index+1), prompt: prompt+' '+extension, answer }
  })

  const mcq: AnatomyQuestion[] = facts.flatMap((fact, index) => {
    const options = rotateOptions(fact.value, factValues, index)
    const options2 = rotateOptions(fact.value, factValues, index + 1)
    const options3 = rotateOptions(fact.value, factValues, index + 2)
    const options4 = rotateOptions(fact.value, factValues, index + 3)
    const options5 = rotateOptions(fact.value, factValues, index + 4)
    const options6 = rotateOptions(fact.value, factValues, index + 5)
    const options7 = rotateOptions(fact.value, factValues, index + 6)
    return [
      { id: part.id+'-mcq-'+index+'a', type: 'mcq' as const, track: index % 2 ? 'practical' as const : 'oral' as const, title: 'اختيار من متعدد · '+fact.label, prompt: 'أي الخيارات التالية يصف '+fact.label+' لـ '+name+' بدقة؟', answer: 'الإجابة الصحيحة: '+fact.value, ...options },
      { id: part.id+'-mcq-'+index+'b', type: 'mcq' as const, track: index % 2 ? 'oral' as const : 'practical' as const, title: 'اختيار من متعدد · تطبيق', prompt: 'أثناء مراجعة '+name+'، اختر العبارة التي تنتمي إلى بند «'+fact.label+'».', answer: 'الإجابة الصحيحة: '+fact.value, ...options2 },
      { id: part.id+'-mcq-'+index+'c', type: 'mcq' as const, track: 'practical' as const, title: 'اختيار من متعدد · تمييز', prompt: 'ما الخيار الذي يجب أن تطابقه مع '+name+' عند سؤال الممتحن عن '+fact.label+'؟', answer: 'الإجابة الصحيحة: '+fact.value, ...options3 },
      { id: part.id+'-mcq-'+index+'d', type: 'mcq' as const, track: 'oral' as const, title: 'اختيار من متعدد · شفوي', prompt: 'في امتحان شفوي، أي عبارة تمثل '+name+' بدقة من ناحية '+fact.label+'؟', answer: 'الإجابة الصحيحة: '+fact.value, ...options4 },
      { id: part.id+'-mcq-'+index+'e', type: 'mcq' as const, track: 'practical' as const, title: 'اختيار من متعدد · استدلال سريري', prompt: 'أي معلومة تدعم مباشرة وصف '+name+' من حيث '+fact.label+'؟', answer: 'الإجابة الصحيحة: '+fact.value, ...options5 },
      { id: part.id+'-mcq-'+index+'f', type: 'mcq' as const, track: 'oral' as const, title: 'اختيار من متعدد · مقارنة', prompt: 'اختر العبارة التي تميّز '+name+' اعتماداً على '+fact.label+'.', answer: 'الإجابة الصحيحة: '+fact.value, ...options6 },
      { id: part.id+'-mcq-'+index+'g', type: 'mcq' as const, track: 'practical' as const, title: 'اختيار من متعدد · OSCE', prompt: 'في محطة عملية، ما الإجابة التي تختارها عندما يسأل الممتحن عن '+name+' و'+fact.label+'؟', answer: 'الإجابة الصحيحة: '+fact.value, ...options7 }
    ]
  })

  const trueFalse: AnatomyQuestion[] = facts.flatMap((fact, index) => {
    const incorrect = facts[(index + 1) % facts.length].value
    return [
      { id: part.id+'-tf-'+index+'a', type: 'trueFalse' as const, track: 'oral' as const, title: 'صح أم خطأ · مفهوم', prompt: 'صح أم خطأ: «'+fact.value+'» يعبّر عن '+fact.label+' لـ '+name+'.', answer: 'صحيح. '+fact.label+' لـ '+name+' هو: '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'b', type: 'trueFalse' as const, track: 'practical' as const, title: 'صح أم خطأ · تمييز', prompt: 'صح أم خطأ: «'+incorrect+'» هو الوصف الأنسب لـ '+name+' من ناحية '+fact.label+'.', answer: 'خطأ. الوصف الأنسب هو: '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 1 },
      { id: part.id+'-tf-'+index+'c', type: 'trueFalse' as const, track: 'oral' as const, title: 'صح أم خطأ · مراجعة', prompt: 'صح أم خطأ: عند مناقشة '+name+' يجب ربط '+fact.label+' بالعبارة الآتية: «'+fact.value+'».', answer: 'صحيح. '+fact.label+' لـ '+name+' هو: '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'d', type: 'trueFalse' as const, track: 'practical' as const, title: 'صح أم خطأ · OSCE', prompt: 'صح أم خطأ: الوصف «'+fact.value+'» مناسب لـ '+name+' في محطة عملية.', answer: 'صحيح. هذا يخص '+fact.label+' لـ '+name+'.', options: ['صحيح', 'خطأ'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'e', type: 'trueFalse' as const, track: 'oral' as const, title: 'صح أم خطأ · مقارنة', prompt: 'صح أم خطأ: ينبغي وصف '+name+' بالعبارة «'+incorrect+'» تحت بند '+fact.label+'.', answer: 'خطأ. العبارة الصحيحة هي: '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 1 },
      { id: part.id+'-tf-'+index+'f', type: 'trueFalse' as const, track: 'practical' as const, title: 'صح أم خطأ · ارتباط سريري', prompt: 'صح أم خطأ: عند ربط '+name+' سريرياً يجب أن تتضمن الإجابة «'+fact.value+'» من ناحية '+fact.label+'.', answer: 'صحيح. '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 0 },
      { id: part.id+'-tf-'+index+'g', type: 'trueFalse' as const, track: 'oral' as const, title: 'صح أم خطأ · فحص الممتحن', prompt: 'صح أم خطأ: «'+incorrect+'» هي الإجابة الأكثر أماناً أمام الممتحن عن '+name+'.', answer: 'خطأ. الإجابة المناسبة هي: '+fact.value, options: ['صحيح', 'خطأ'], correctOption: 1 }
    ]
  })

  return uniqueQuestions([...essay, ...mcq.slice(0, 50), ...trueFalse.slice(0, 50)])
}
