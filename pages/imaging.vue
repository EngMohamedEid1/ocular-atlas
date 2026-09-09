<script setup lang="ts">
import { computed, ref } from 'vue'
import { anatomyIndex, ocularTree, type AnatomyTreeNode } from '~/data/ocularTree'

const selectedMode = ref('OCT')
const selectedPartId = ref('retina')
const parts = (items: AnatomyTreeNode[]): AnatomyTreeNode[] => items.flatMap(item => [item, ...parts(item.children || [])])
const anatomyParts = parts(ocularTree)
const selectedPart = computed(() => anatomyIndex[selectedPartId.value] || anatomyIndex.retina)
const modes = {
  OCT: { ar: 'التصوير المقطعي البصري', en: 'Optical coherence tomography', description: 'مقطع طبقي يعرض انتظام طبقات الشبكية والعلاقة الزجاجية-الشبكية بدقة ميكرونية.', use: 'الطبقات، الوذمة، الشد الزجاجي، البقعة والعصب البصري.', marker: 'طبقات شبكية متتابعة مع خط مسح' },
  FA: { ar: 'تصوير الأوعية بالفلوريسين', en: 'Fluorescein angiography', description: 'يوثق تدفق الصبغة في الأوعية الشبكية ومناطق التسرب أو نقص التروية.', use: 'السكري، انسداد الأوردة، اعتلالات الأوعية والوذمة البقعية.', marker: 'تباين وعائي وتقييم التسرب' },
  ICG: { ar: 'إندوسيانين أخضر', en: 'Indocyanine green angiography', description: 'يُظهر الدورة المشيمية بوضوح أكبر من الفلوريسين في بعض الحالات.', use: 'CSR، آفات المشيمية واعتلالات AMD الوعائية.', marker: 'الدورة المشيمية العميقة' },
  FAF: { ar: 'التألق الذاتي للقاع', en: 'Fundus autofluorescence', description: 'يعكس توزيع الليبوفوسين ونشاط الظهارة الصبغية للشبكية.', use: 'الضمور، AMD، الحثول الشبكية وعيوب RPE.', marker: 'خريطة وظيفة RPE' }
} as const
const current = computed(() => modes[selectedMode.value as keyof typeof modes])
</script>

<template>
  <main class="imaging-page" dir="rtl">
    <header class="detail-nav"><NuxtLink to="/">← العودة إلى الأطلس</NuxtLink><NuxtLink to="/quiz">بنك الأسئلة</NuxtLink></header>
    <section class="imaging-intro"><p>MULTIMODAL IMAGING LAB</p><h1>التصوير التشخيصي المرتبط بالتشريح</h1><span>اختر النوع والبنية؛ يتغير الشرح وطريقة قراءة الصورة حسب الجزء المقصود.</span></section>
    <section class="imaging-workbench">
      <div class="imaging-controls"><small>1 · نوع التصوير</small><div><button v-for="item in Object.keys(modes)" :key="item" :class="{active:selectedMode===item}" @click="selectedMode=item">{{item}}</button></div><small>2 · البنية</small><select v-model="selectedPartId"><option v-for="item in anatomyParts" :key="item.id" :value="item.id">{{item.arabic}} — {{item.name}}</option></select><article><small>STRUCTURE</small><h2>{{selectedPart.arabic}}</h2><p>{{selectedPart.location}}</p></article></div>
      <div class="imaging-display">
        <div class="mode-head"><small>{{selectedMode}}</small><h2>{{current.ar}}</h2><p>{{current.en}}</p></div>
        <div v-if="selectedMode==='OCT'" class="oct-diagnostic" role="img" aria-label="Educational OCT retinal cross section"><div v-for="n in 10" :key="n" class="oct-band" :style="{opacity:.25+n/14}"></div><span></span><b>Retinal layers · {{selectedPart.name}}</b></div>
        <figure v-else class="fundus-diagnostic" :class="'mode-'+selectedMode.toLowerCase()"><img src="/anatomy/fundus-clinical.png" alt="Clinical-style educational fundus photograph"><figcaption>{{current.marker}} · {{selectedPart.arabic}}</figcaption></figure>
        <article class="imaging-explanation"><small>WHAT THIS MODALITY ANSWERS</small><p>{{current.description}}</p><b>الاستخدامات الأساسية:</b><p>{{current.use}}</p></article>
      </div>
    </section>
  </main>
</template>
