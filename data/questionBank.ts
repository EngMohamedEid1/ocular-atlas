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

const questionKey = (value: string) => value
  .toLocaleLowerCase()
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()

// A fact is examined once only. This guard also protects future edits from
// accidentally adding a prompt or a model answer that was already used.
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

const englishQuestionsFor = (part: AnatomyTreeNode): AnatomyQuestion[] => {
  const name = part.name
  const facts: Fact[] = [
    { label: 'location and relations', value: part.location },
    { label: 'primary function', value: part.function },
    { label: 'histology', value: part.histology },
    { label: 'effect of damage', value: part.damage },
    { label: 'clinical correlation', value: part.clinical },
    { label: 'imaging', value: part.imaging.join(', ') },
    { label: 'related conditions', value: part.diseases.join(', ') },
    { label: 'related procedures', value: part.procedures.join(', ') }
  ]
  const values = facts.map(fact => fact.value)
  const options = (index: number) => rotateOptions(facts[index].value, values, index)

  return uniqueQuestions([
    { id: part.id+'-location', type: 'mcq', track: 'practical', title: 'Multiple choice · Location', prompt: `Which option correctly identifies the location and anatomical relations of ${name}?`, answer: `Correct answer: ${facts[0].value}`, ...options(0) },
    { id: part.id+'-function', type: 'trueFalse', track: 'oral', title: 'True or false · Function', prompt: `True or false: ${name} has no meaningful role in its primary function.`, answer: `False. The primary function of ${name} is: ${facts[1].value}`, options: ['True', 'False'], correctOption: 1 },
    { id: part.id+'-histology', type: 'essay', track: 'oral', title: 'Short essay · Histology', prompt: `Describe the histology of ${name} and state one way it supports the structure's role.`, answer: `Histology: ${facts[2].value}` },
    { id: part.id+'-damage', type: 'mcq', track: 'oral', title: 'Multiple choice · Damage', prompt: `Which outcome is most consistent with damage to ${name}?`, answer: `Correct answer: ${facts[3].value}`, ...options(3) },
    { id: part.id+'-clinical', type: 'trueFalse', track: 'practical', title: 'True or false · Clinical correlation', prompt: `True or false: ${name} has no relevance to focused clinical assessment.`, answer: `False. Clinical correlation: ${facts[4].value}`, options: ['True', 'False'], correctOption: 1 },
    { id: part.id+'-imaging', type: 'essay', track: 'practical', title: 'Short essay · Imaging', prompt: `Select the most useful imaging approach for ${name} and explain what it contributes to assessment.`, answer: `Appropriate imaging: ${facts[5].value}` },
    { id: part.id+'-conditions', type: 'mcq', track: 'oral', title: 'Multiple choice · Conditions', prompt: `Which group of conditions should make ${name} a focus of assessment?`, answer: `Correct answer: ${facts[6].value}`, ...options(6) },
    { id: part.id+'-procedures', type: 'trueFalse', track: 'practical', title: 'True or false · Procedures', prompt: `True or false: knowledge of ${name} is relevant to the related clinical procedures.`, answer: `True. Related procedures: ${facts[7].value}`, options: ['True', 'False'], correctOption: 0 }
  ])
}

const arabicQuestionsFor = (part: AnatomyTreeNode): AnatomyQuestion[] => {
  const name = part.arabic
  const facts: Fact[] = [
    { label: 'الموقع والعلاقات', value: part.location },
    { label: 'الوظيفة الأساسية', value: part.function },
    { label: 'التركيب النسيجي', value: part.histology },
    { label: 'أثر التلف', value: part.damage },
    { label: 'الارتباط السريري', value: part.clinical },
    { label: 'التصوير', value: part.imaging.join('، ') },
    { label: 'الحالات المرتبطة', value: part.diseases.join('، ') },
    { label: 'التدخلات المرتبطة', value: part.procedures.join('، ') }
  ]
  const values = facts.map(fact => fact.value)
  const options = (index: number) => rotateOptions(facts[index].value, values, index)

  return uniqueQuestions([
    { id: part.id+'-location', type: 'mcq', track: 'practical', title: 'اختيار من متعدد · الموقع', prompt: `أي وصف يحدد موقع ${name} وعلاقاته التشريحية بدقة؟`, answer: `الإجابة الصحيحة: ${facts[0].value}`, ...options(0) },
    { id: part.id+'-function', type: 'trueFalse', track: 'oral', title: 'صح أم خطأ · الوظيفة', prompt: `صح أم خطأ: لا يملك ${name} دورًا ذا أهمية في وظيفته الأساسية.`, answer: `خطأ. الوظيفة الأساسية لـ ${name} هي: ${facts[1].value}`, options: ['صحيح', 'خطأ'], correctOption: 1 },
    { id: part.id+'-histology', type: 'essay', track: 'oral', title: 'سؤال مقالي · النسيج', prompt: `صف التركيب النسيجي لـ ${name} واربط سمة واحدة منه بدور هذه البنية.`, answer: `التركيب النسيجي: ${facts[2].value}` },
    { id: part.id+'-damage', type: 'mcq', track: 'oral', title: 'اختيار من متعدد · التلف', prompt: `أي نتيجة تتوافق أكثر مع تلف ${name}؟`, answer: `الإجابة الصحيحة: ${facts[3].value}`, ...options(3) },
    { id: part.id+'-clinical', type: 'trueFalse', track: 'practical', title: 'صح أم خطأ · الارتباط السريري', prompt: `صح أم خطأ: لا توجد صلة بين ${name} والفحص السريري المركّز.`, answer: `خطأ. الارتباط السريري: ${facts[4].value}`, options: ['صحيح', 'خطأ'], correctOption: 1 },
    { id: part.id+'-imaging', type: 'essay', track: 'practical', title: 'سؤال مقالي · التصوير', prompt: `اختر وسيلة التصوير الأنسب لتقييم ${name} واشرح ما الذي تضيفه إلى التقييم.`, answer: `وسائل التصوير المناسبة: ${facts[5].value}` },
    { id: part.id+'-conditions', type: 'mcq', track: 'oral', title: 'اختيار من متعدد · الحالات', prompt: `أي مجموعة من الحالات تجعل ${name} محورًا مهمًا للتقييم؟`, answer: `الإجابة الصحيحة: ${facts[6].value}`, ...options(6) },
    { id: part.id+'-procedures', type: 'trueFalse', track: 'practical', title: 'صح أم خطأ · الإجراءات', prompt: `صح أم خطأ: معرفة ${name} مهمة عند التعامل مع الإجراءات السريرية المرتبطة به.`, answer: `صحيح. التدخلات المرتبطة: ${facts[7].value}`, options: ['صحيح', 'خطأ'], correctOption: 0 }
  ])
}

export const questionsFor = (part: AnatomyTreeNode, language: 'ar' | 'en' = 'ar'): AnatomyQuestion[] => (
  language === 'en' ? englishQuestionsFor(part) : arabicQuestionsFor(part)
)
