import { ref, computed} from 'vue'
import { questionData } from './datasets/index.js'
import { i18n } from '@/i18n'

export const questionSet = ref(localStorage.getItem('version') || 'new')

const language = i18n.global.locale

export const activeQuestions = computed(() => {
  const raw = questionData[questionSet.value] || []
  return raw.map(q => ({
    id: q.id,
    question: q.question[language.value] ?? q.question.pt,
    effect: q.effect
  }))
})

export const questionIds = computed(() =>
  (questionData[questionSet.value] || []).map((q) => q.id.toString())
);

export function changeQuestionSet(version) {
  questionSet.value = version
  localStorage.setItem('version', version)
}
