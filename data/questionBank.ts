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
type Language = 'ar' | 'en'

const rotateOptions = (correct: string, candidates: string[], index: number) => {
  const options = [correct, ...candidates.filter(item => item !== correct).slice(0, 3)]
  const offset = index % options.length
  const rotated = [...options.slice(offset), ...options.slice(0, offset)]
  return { options: rotated, correctOption: rotated.indexOf(correct) }
}

const questionKey = (value: string) => value
  .toLocaleLowerCase()
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()

// Both the stem and the model answer must be unique in one study set.
const uniqueQuestions = (questions: AnatomyQuestion[]) => {
  const prompts = new Set<string>()
  const answers = new Set<string>()
  return questions.filter(question => {
    const prompt = questionKey(question.prompt)
    const answer = questionKey(question.answer)
    if (prompts.has(prompt) || answers.has(answer)) return false
    prompts.add(prompt)
    answers.add(answer)
    return true
  })
}

const typeFor = (index: number, round: number): QuestionType => ['mcq', 'trueFalse', 'essay'][(index + round) % 3] as QuestionType
const trackFor = (index: number, round: number): QuestionTrack => (index + round) % 2 ? 'oral' : 'practical'

const factList = (part: AnatomyTreeNode, language: Language): Fact[] => language === 'ar'
  ? [
      { label: 'الموقع والعلاقات', value: part.location },
      { label: 'الوظيفة الأساسية', value: part.function },
      { label: 'التركيب النسيجي', value: part.histology },
      { label: 'أثر التلف', value: part.damage },
      { label: 'الارتباط السريري', value: part.clinical },
      { label: 'التصوير', value: part.imaging.join('، ') },
      { label: 'الحالات المرتبطة', value: part.diseases.join('، ') },
      { label: 'التدخلات المرتبطة', value: part.procedures.join('، ') }
    ]
  : [
      { label: 'location and relations', value: part.location },
      { label: 'primary function', value: part.function },
      { label: 'histology', value: part.histology },
      { label: 'effect of damage', value: part.damage },
      { label: 'clinical correlation', value: part.clinical },
      { label: 'imaging', value: part.imaging.join(', ') },
      { label: 'related conditions', value: part.diseases.join(', ') },
      { label: 'related procedures', value: part.procedures.join(', ') }
    ]

const pairAnswer = (first: Fact, second: Fact, language: Language) => language === 'ar'
  ? `${first.label}: ${first.value} | ${second.label}: ${second.value}`
  : `${first.label}: ${first.value} | ${second.label}: ${second.value}`

const triadAnswer = (first: Fact, second: Fact, third: Fact) => `${first.label}: ${first.value} | ${second.label}: ${second.value} | ${third.label}: ${third.value}`

const makeObjective = (
  id: string,
  type: QuestionType,
  track: QuestionTrack,
  title: string,
  prompt: string,
  answer: string,
  candidates: string[],
  optionIndex: number,
  language: Language,
  truth = true
): AnatomyQuestion => {
  if (type === 'essay') return { id, type, track, title, prompt, answer }
  if (type === 'trueFalse') {
    const options = language === 'ar' ? ['صحيح', 'خطأ'] : ['True', 'False']
    return { id, type, track, title, prompt, answer, options, correctOption: truth ? 0 : 1 }
  }
  return { id, type, track, title, prompt, answer, ...rotateOptions(candidates[optionIndex] || answer, candidates, optionIndex) }
}

const coreQuestions = (part: AnatomyTreeNode, facts: Fact[], language: Language): AnatomyQuestion[] => {
  const name = language === 'ar' ? part.arabic : part.name
  const values = facts.map(fact => fact.value)
  const ar = language === 'ar'
  return [
    makeObjective(part.id+'-core-location', 'mcq', 'practical', ar ? 'اختيار من متعدد · الموقع' : 'Multiple choice · Location', ar ? `أي وصف يحدد موقع ${name} وعلاقاته التشريحية بدقة؟` : `Which option correctly identifies the location and anatomical relations of ${name}?`, ar ? `الإجابة الصحيحة: ${facts[0].value}` : `Correct answer: ${facts[0].value}`, values, 0, language),
    makeObjective(part.id+'-core-function', 'trueFalse', 'oral', ar ? 'صح أم خطأ · الوظيفة' : 'True or false · Function', ar ? `صح أم خطأ: لا يملك ${name} دورًا ذا أهمية في وظيفته الأساسية.` : `True or false: ${name} has no meaningful role in its primary function.`, ar ? `خطأ. الوظيفة الأساسية لـ ${name} هي: ${facts[1].value}` : `False. The primary function of ${name} is: ${facts[1].value}`, values, 1, language, false),
    makeObjective(part.id+'-core-histology', 'essay', 'oral', ar ? 'سؤال مقالي · النسيج' : 'Short essay · Histology', ar ? `صف التركيب النسيجي لـ ${name} واربط سمة واحدة منه بدور هذه البنية.` : `Describe the histology of ${name} and state one way it supports the structure's role.`, ar ? `التركيب النسيجي: ${facts[2].value}` : `Histology: ${facts[2].value}`, values, 2, language),
    makeObjective(part.id+'-core-damage', 'mcq', 'oral', ar ? 'اختيار من متعدد · التلف' : 'Multiple choice · Damage', ar ? `أي نتيجة تتوافق أكثر مع تلف ${name}؟` : `Which outcome is most consistent with damage to ${name}?`, ar ? `الإجابة الصحيحة: ${facts[3].value}` : `Correct answer: ${facts[3].value}`, values, 3, language),
    makeObjective(part.id+'-core-clinical', 'trueFalse', 'practical', ar ? 'صح أم خطأ · الارتباط السريري' : 'True or false · Clinical correlation', ar ? `صح أم خطأ: لا توجد صلة بين ${name} والفحص السريري المركّز.` : `True or false: ${name} has no relevance to focused clinical assessment.`, ar ? `خطأ. الارتباط السريري: ${facts[4].value}` : `False. Clinical correlation: ${facts[4].value}`, values, 4, language, false),
    makeObjective(part.id+'-core-imaging', 'essay', 'practical', ar ? 'سؤال مقالي · التصوير' : 'Short essay · Imaging', ar ? `اختر وسيلة التصوير الأنسب لتقييم ${name} واشرح ما الذي تضيفه إلى التقييم.` : `Select the most useful imaging approach for ${name} and explain what it contributes to assessment.`, ar ? `وسائل التصوير المناسبة: ${facts[5].value}` : `Appropriate imaging: ${facts[5].value}`, values, 5, language),
    makeObjective(part.id+'-core-conditions', 'mcq', 'oral', ar ? 'اختيار من متعدد · الحالات' : 'Multiple choice · Conditions', ar ? `أي مجموعة من الحالات تجعل ${name} محورًا مهمًا للتقييم؟` : `Which group of conditions should make ${name} a focus of assessment?`, ar ? `الإجابة الصحيحة: ${facts[6].value}` : `Correct answer: ${facts[6].value}`, values, 6, language),
    makeObjective(part.id+'-core-procedures', 'trueFalse', 'practical', ar ? 'صح أم خطأ · الإجراءات' : 'True or false · Procedures', ar ? `صح أم خطأ: معرفة ${name} مهمة عند التعامل مع الإجراءات السريرية المرتبطة به.` : `True or false: knowledge of ${name} is relevant to the related clinical procedures.`, ar ? `صحيح. التدخلات المرتبطة: ${facts[7].value}` : `True. Related procedures: ${facts[7].value}`, values, 7, language, true)
  ]
}

const pairedQuestions = (part: AnatomyTreeNode, facts: Fact[], language: Language, offset: number, round: number, focus: 'link' | 'assessment' | 'decision'): AnatomyQuestion[] => {
  const name = language === 'ar' ? part.arabic : part.name
  const ar = language === 'ar'
  const candidates = facts.map((fact, index) => pairAnswer(fact, facts[(index + offset) % facts.length], language))
  return facts.map((fact, index) => {
    const related = facts[(index + offset) % facts.length]
    const answer = pairAnswer(fact, related, language)
    const type = typeFor(index, round)
    const truth = (index + round) % 2 === 0
    const verb = focus === 'link'
      ? (ar ? 'الربط' : 'Linking')
      : focus === 'assessment'
        ? (ar ? 'التقييم' : 'Assessment')
        : (ar ? 'اتخاذ القرار' : 'Clinical decision')
    const mcqPrompt = focus === 'link'
      ? (ar ? `أي إجابة تربط ${fact.label} لـ ${name} بـ ${related.label} بطريقة مفيدة للامتحان؟` : `Which answer most usefully links the ${fact.label} of ${name} with its ${related.label}?`)
      : focus === 'assessment'
        ? (ar ? `عند الاشتباه في مشكلة تخص ${fact.label} لـ ${name}، أي محور يجب مراجعته معه؟` : `When assessing a possible change in the ${fact.label} of ${name}, which paired axis should be reviewed with it?`)
        : (ar ? `أي ملخص يدعم قرارًا سريريًا يجمع ${fact.label} و${related.label} لـ ${name}؟` : `Which summary best supports a clinical decision that combines the ${fact.label} and ${related.label} of ${name}?`)
    const truePrompt = truth
      ? (ar ? `صح أم خطأ: ينبغي تفسير ${fact.label} لـ ${name} مع ${related.label} عند الإجابة المنظمة.` : `True or false: the ${fact.label} of ${name} should be interpreted alongside its ${related.label} in a structured answer.`)
      : (ar ? `صح أم خطأ: يمكن تقييم ${fact.label} لـ ${name} دون الرجوع إلى ${related.label}.` : `True or false: the ${fact.label} of ${name} can be assessed without considering its ${related.label}.`)
    const essayPrompt = focus === 'link'
      ? (ar ? `اشرح كيف يرتبط ${fact.label} بـ ${related.label} في فهم ${name}.` : `Explain how the ${fact.label} and ${related.label} should be linked when discussing ${name}.`)
      : focus === 'assessment'
        ? (ar ? `اكتب خطة قصيرة لتقييم ${name} تبدأ بـ ${fact.label} ثم تنتقل إلى ${related.label}.` : `Write a short assessment sequence for ${name} that starts with ${fact.label} and then addresses ${related.label}.`)
        : (ar ? `برّر ترتيب الأولويات بين ${fact.label} و${related.label} في سؤال سريري عن ${name}.` : `Justify how you would prioritise the ${fact.label} and ${related.label} in a clinical question about ${name}.`)
    const prompt = type === 'mcq' ? mcqPrompt : type === 'trueFalse' ? truePrompt : essayPrompt
    const modelAnswer = type === 'trueFalse'
      ? `${truth ? (ar ? 'صحيح.' : 'True.') : (ar ? 'خطأ.' : 'False.')} ${answer}`
      : type === 'mcq'
        ? `${ar ? 'الإجابة الصحيحة:' : 'Correct answer:'} ${answer}`
        : answer
    return makeObjective(`${part.id}-${focus}-${index}`, type, trackFor(index, round), `${verb} · ${fact.label}`, prompt, modelAnswer, candidates, index, language, truth)
  })
}

const triadQuestions = (part: AnatomyTreeNode, facts: Fact[], language: Language): AnatomyQuestion[] => {
  const name = language === 'ar' ? part.arabic : part.name
  const ar = language === 'ar'
  const candidates = facts.map((fact, index) => triadAnswer(fact, facts[(index + 2) % facts.length], facts[(index + 5) % facts.length]))
  return facts.map((fact, index) => {
    const second = facts[(index + 2) % facts.length]
    const third = facts[(index + 5) % facts.length]
    const answer = triadAnswer(fact, second, third)
    const type = typeFor(index, 4)
    const truth = index % 2 === 0
    const mcqPrompt = ar
      ? `أي ملخص ثلاثي يربط ${fact.label} و${second.label} و${third.label} عند مناقشة ${name}؟`
      : `Which three-part summary connects the ${fact.label}, ${second.label}, and ${third.label} of ${name}?`
    const truePrompt = truth
      ? (ar ? `صح أم خطأ: يمكن بناء إجابة متكاملة عن ${name} بالجمع بين ${fact.label} و${second.label} و${third.label}.` : `True or false: an integrated answer about ${name} can combine its ${fact.label}, ${second.label}, and ${third.label}.`)
      : (ar ? `صح أم خطأ: لا تضيف ${second.label} أو ${third.label} قيمة عند تفسير ${fact.label} لـ ${name}.` : `True or false: the ${second.label} and ${third.label} add no value when interpreting the ${fact.label} of ${name}.`)
    const essayPrompt = ar
      ? `أنشئ إجابة منظمة عن ${name} تستخدم ${fact.label} ثم ${second.label} ثم ${third.label}.`
      : `Create an examiner-ready answer about ${name} using ${fact.label}, then ${second.label}, then ${third.label}.`
    const prompt = type === 'mcq' ? mcqPrompt : type === 'trueFalse' ? truePrompt : essayPrompt
    const modelAnswer = type === 'trueFalse'
      ? `${truth ? (ar ? 'صحيح.' : 'True.') : (ar ? 'خطأ.' : 'False.')} ${answer}`
      : type === 'mcq'
        ? `${ar ? 'الإجابة الصحيحة:' : 'Correct answer:'} ${answer}`
        : answer
    return makeObjective(`${part.id}-synthesis-${index}`, type, trackFor(index, 4), ar ? `تركيب · ${fact.label}` : `Synthesis · ${fact.label}`, prompt, modelAnswer, candidates, index, language, truth)
  })
}

export const questionsFor = (part: AnatomyTreeNode, language: Language = 'ar'): AnatomyQuestion[] => {
  const facts = factList(part, language)
  return uniqueQuestions([
    ...coreQuestions(part, facts, language),
    ...pairedQuestions(part, facts, language, 1, 1, 'link'),
    ...pairedQuestions(part, facts, language, 2, 2, 'assessment'),
    ...pairedQuestions(part, facts, language, 3, 3, 'decision'),
    ...triadQuestions(part, facts, language)
  ])
}
