<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { anatomyIndex, ocularTree } from '~/data/ocularTree'
import { questionsFor, type QuestionType } from '~/data/questionBank'
import { useExplorerStore } from '~/stores/explorer'

const store = useExplorerStore()
const copy = computed(() => store.language === 'ar')
const text = (ar: string, en: string) => copy.value ? ar : en
const mainId = ref('')
const subId = ref('')
const subSubId = ref('')
const microId = ref('')
const mode = ref<'all' | QuestionType>('all')
const questionIndex = ref(0)
const answerVisible = ref(false)
const response = ref('')
const selectedOption = ref<number | null>(null)
const essayConfirmed = ref(false)
const feedback = ref<'idle' | 'wrong' | 'correct' | 'essayMissing'>('idle')
const shakeNonce = ref(0)
const mainParts = ocularTree
const mainPart = computed(() => anatomyIndex[mainId.value])
const subParts = computed(() => mainPart.value?.children || [])
const subPart = computed(() => anatomyIndex[subId.value])
const subSubParts = computed(() => subPart.value?.children || [])
const subSubPart = computed(() => anatomyIndex[subSubId.value])
const microParts = computed(() => subSubPart.value?.children || [])
const selectedPart = computed(() => anatomyIndex[microId.value] || subSubPart.value || subPart.value || mainPart.value)
const questions = computed(() => {
  if (!selectedPart.value) return []
  const all = questionsFor(selectedPart.value, store.language)
  return mode.value === 'all' ? all : all.filter(question => question.type === mode.value)
})
const currentQuestion = computed(() => questions.value[Math.min(questionIndex.value, Math.max(questions.value.length - 1, 0))])
const isObjectiveQuestion = computed(() => currentQuestion.value?.type !== 'essay')
const hasCorrectAnswer = computed(() => Boolean(currentQuestion.value && selectedOption.value === currentQuestion.value.correctOption))
const canAdvance = computed(() => isObjectiveQuestion.value ? hasCorrectAnswer.value : essayConfirmed.value)
const feedbackMessage = computed(() => ({
  wrong: text('إجابة غير صحيحة — اختر إجابة أخرى.','Incorrect answer — choose another option.'),
  correct: text('إجابة صحيحة ✓ يمكنك الانتقال للسؤال التالي.','Correct answer ✓ You may proceed to the next question.'),
  essayMissing: text('اكتب إجابتك ثم راجع نموذج الإجابة وأكّد المراجعة قبل المتابعة.','Write your answer, review the model answer, then confirm your review before proceeding.')
}[feedback.value] || ''))
const resetAnswer = () => { answerVisible.value = false; response.value = ''; selectedOption.value = null; essayConfirmed.value = false; feedback.value = 'idle' }
const chooseMain = (id: string) => { mainId.value = id; subId.value = ''; subSubId.value = ''; microId.value = ''; questionIndex.value = 0; resetAnswer() }
const chooseSub = (id: string) => { subId.value = id; subSubId.value = ''; microId.value = ''; questionIndex.value = 0; resetAnswer() }
const chooseSubSub = (id: string) => { subSubId.value = id; microId.value = ''; questionIndex.value = 0; resetAnswer() }
const chooseMicro = (id: string) => { microId.value = id; questionIndex.value = 0; resetAnswer() }
const changeMode = (next: 'all' | QuestionType) => { mode.value = next; questionIndex.value = 0; resetAnswer() }
const nextQuestion = () => { if (!canAdvance.value) { feedback.value = isObjectiveQuestion.value ? 'wrong' : 'essayMissing'; return } if (questionIndex.value < questions.value.length - 1) { questionIndex.value++; resetAnswer() } }
const previousQuestion = () => { if (questionIndex.value > 0) { questionIndex.value--; resetAnswer() } }
const chooseOption = (index: number) => { selectedOption.value = index; if (index === currentQuestion.value?.correctOption) { feedback.value = 'correct'; answerVisible.value = true } else { feedback.value = 'wrong'; answerVisible.value = false; shakeNonce.value++ } }
const toggleAnswer = () => { answerVisible.value = !answerVisible.value; if (!answerVisible.value) essayConfirmed.value = false }
const confirmEssay = () => { if (!response.value.trim()) { feedback.value = 'essayMissing'; return }; essayConfirmed.value = true; feedback.value = 'correct' }
const typeName = (type: QuestionType) => copy.value ? ({ essay: 'مقالي', mcq: 'اختيار من متعدد', trueFalse: 'صح / خطأ' })[type] : ({ essay: 'Essay', mcq: 'Multiple choice', trueFalse: 'True / false' })[type]
const trackName = (track: 'oral' | 'practical') => track === 'oral' ? text('شفوي', 'Oral') : text('عملي / OSCE', 'Practical / OSCE')
watch(() => store.language, () => { questionIndex.value = 0; resetAnswer() })
</script>

<template>
  <main class="quiz-page" :dir="copy ? 'rtl' : 'ltr'">
    <header class="detail-nav"><NuxtLink to="/">{{text('→ العودة إلى الأطلس','← Back to atlas')}}</NuxtLink><div class="detail-actions"><span>QUESTION BANK / ESSAY + MCQ + TRUE/FALSE</span><button class="language-toggle" @click="store.language=copy?'en':'ar'">{{copy?'EN':'ع'}}</button></div></header>
    <section class="quiz-intro"><p>ORAL, PRACTICAL & WRITTEN EXAM BANK</p><h1>{{text('حدد ما تريد أن تُسأل عنه أولاً','Choose what you want to be examined on')}}</h1><span>{{text('اختر المستوى التشريحي بالتتابع: رئيسي ثم فرعي ثم تحت فرعي ثم مستوى أدق عند وجوده. لكل مستوى مختار 150 سؤالًا: 50 مقاليًا و50 اختيارًا من متعدد و50 صح أو خطأ، مع تغطية شفوية وعملية.','Choose the anatomical level step by step: main, substructure, sub-substructure, then microstructure when available. Every selected level has 150 questions: 50 essays, 50 multiple-choice questions, and 50 true/false questions, with oral and practical coverage.')}}</span></section>
    <section class="selector-panel">
      <div><small>1 · {{text('الجزء الرئيسي','Main structure')}}</small><div class="choice-grid"><button v-for="item in mainParts" :key="item.id" :class="{chosen:mainId===item.id}" @click="chooseMain(item.id)"><i :style="{background:item.color}"></i>{{copy?item.arabic:item.name}}</button></div></div>
      <div v-if="mainPart"><small>2 · {{text('الجزء الفرعي','Substructure')}}</small><div class="choice-grid subchoices"><button :class="{chosen:subId===''}" @click="chooseSub('')">{{text('أسئلة '+mainPart.arabic+' ككل','Questions on '+mainPart.name+' as a whole')}}</button><button v-for="item in subParts" :key="item.id" :class="{chosen:subId===item.id}" @click="chooseSub(item.id)"><i :style="{background:item.color}"></i>{{copy?item.arabic:item.name}}</button></div></div>
      <div v-if="subPart?.children?.length"><small>3 · {{text('تحت فرعي','Sub-substructure')}}</small><div class="choice-grid subchoices"><button :class="{chosen:subSubId===''}" @click="chooseSubSub('')">{{text('أسئلة '+subPart.arabic+' ككل','Questions on '+subPart.name+' as a whole')}}</button><button v-for="item in subSubParts" :key="item.id" :class="{chosen:subSubId===item.id}" @click="chooseSubSub(item.id)"><i :style="{background:item.color}"></i>{{copy?item.arabic:item.name}}</button></div></div>
      <div v-if="subSubPart?.children?.length"><small>4 · {{text('مستوى تشريحي أدق','Microstructure')}}</small><div class="choice-grid subchoices"><button :class="{chosen:microId===''}" @click="chooseMicro('')">{{text('أسئلة '+subSubPart.arabic+' ككل','Questions on '+subSubPart.name+' as a whole')}}</button><button v-for="item in microParts" :key="item.id" :class="{chosen:microId===item.id}" @click="chooseMicro(item.id)"><i :style="{background:item.color}"></i>{{copy?item.arabic:item.name}}</button></div></div>
    </section>
    <section v-if="selectedPart" class="exam-surface">
      <div class="exam-header"><div><small>SELECTED STRUCTURE</small><h2>{{copy?selectedPart.arabic:selectedPart.name}}</h2><span>{{text(questions.length+' سؤالاً متاحاً في هذا المستوى',questions.length+' questions available at this level')}}</span></div><div class="exam-modes"><button :class="{active:mode==='all'}" @click="changeMode('all')">{{text('الكل','All')}}</button><button :class="{active:mode==='essay'}" @click="changeMode('essay')">{{text('مقالي','Essay')}}</button><button :class="{active:mode==='mcq'}" @click="changeMode('mcq')">{{text('اختيارى','Multiple choice')}}</button><button :class="{active:mode==='trueFalse'}" @click="changeMode('trueFalse')">{{text('صح / خطأ','True / false')}}</button></div></div>
      <article v-if="currentQuestion" :key="currentQuestion.id+'-'+shakeNonce" class="question-card" :class="{'is-wrong':feedback==='wrong','is-correct':feedback==='correct'}"><div class="question-meta"><span>{{typeName(currentQuestion.type)}} · {{trackName(currentQuestion.track)}}</span><b>{{questionIndex+1}} / {{questions.length}}</b></div><small>{{currentQuestion.title}}</small><h3>{{currentQuestion.prompt}}</h3><textarea v-if="currentQuestion.type==='essay'" v-model="response" :placeholder="text('اكتب إجابتك أو تدرب عليها شفهياً…','Write your answer or practise it aloud…')"></textarea><div v-else class="answer-choices" :class="{'true-false-choices':currentQuestion.type==='trueFalse'}"><button v-for="(option,index) in currentQuestion.options || []" :key="option" :class="{selected:selectedOption===index,correct:(feedback==='correct'||answerVisible)&&currentQuestion.correctOption===index,incorrect:feedback==='wrong'&&selectedOption===index}" @click="chooseOption(index)"><b>{{currentQuestion.type==='mcq'?String.fromCharCode(65+index):''}}</b>{{option}}</button></div><p v-if="feedbackMessage" class="answer-feedback" :class="feedback" role="status">{{feedbackMessage}}</p><div class="question-actions"><button @click="toggleAnswer">{{answerVisible?text('إخفاء نموذج الإجابة','Hide model answer'):text('أظهر نموذج الإجابة','Show model answer')}}</button><button v-if="currentQuestion.type==='essay'&&answerVisible" class="review-answer" :class="{confirmed:essayConfirmed}" @click="confirmEssay">{{essayConfirmed?text('تمت مراجعة الإجابة ✓','Answer reviewed ✓'):text('أكّد مراجعة الإجابة','Confirm answer review')}}</button><div><button :disabled="questionIndex===0" @click="previousQuestion">{{text('السابق','Previous')}}</button><button :disabled="questionIndex===questions.length-1" :aria-disabled="!canAdvance" :class="{locked:!canAdvance}" @click="nextQuestion">{{text('التالي','Next')}}</button></div></div><div v-if="answerVisible" class="model-answer"><small>MODEL ANSWER</small><p>{{currentQuestion.answer}}</p></div></article>
    </section>
  </main>
</template>

<style scoped>
.detail-actions{display:flex;align-items:center;gap:12px}.language-toggle{border:1px solid #31546e;background:#102d43;color:#dffaf7;border-radius:6px;padding:6px 9px;font-weight:700}
.question-card.is-wrong{animation:question-shake 1s cubic-bezier(.36,.07,.19,.97) 1;border-color:#ec8989;box-shadow:0 0 0 1px rgba(236,137,137,.35)}.question-card.is-correct{border-color:#75dca1;box-shadow:0 0 0 1px rgba(117,220,161,.18)}.answer-feedback{margin:12px 0 0;padding:10px 12px;border-radius:7px;font-size:.9rem;font-weight:700}.answer-feedback.wrong{background:#48232b;color:#ffc3c3;border:1px solid #e27575}.answer-feedback.correct{background:#173e31;color:#b9f5d0;border:1px solid #72dca0}.answer-feedback.essayMissing{background:#473b20;color:#ffebb2;border:1px solid #d9b556}.review-answer{border:1px solid #568c88;background:#113b43;color:#ddfffb;border-radius:6px;padding:9px 12px}.review-answer.confirmed{border-color:#72dca0;background:#174834}.question-actions button.locked{opacity:.65;border-color:#d68b8b;color:#ffd1d1}@keyframes question-shake{0%,12%,24%,36%,48%,60%,72%,84%,100%{transform:translateX(0)}6%,30%,54%,78%{transform:translateX(-7px)}18%,42%,66%,90%{transform:translateX(7px)}}@media(prefers-reduced-motion:reduce){.question-card.is-wrong{animation:none}}
</style>
