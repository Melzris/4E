import { ref, reactive, watch, computed } from "vue";
import router from "@/router";
import { activeQuestions, questionIds } from "@/utils/questions/questionUtils.js";

export const result = reactive({
  sangue: 1,
  morte: 1,
  conhecimento: 1,
  energia: 1,
});

export const answers = reactive({});
export const currentQuestionIndex = ref(0);
export const quizFinished = ref(false);
export const currentQuestion = computed(() =>{
  const id = questionsOrder.value[currentQuestionIndex.value];
  const q  = activeQuestions.value.find((x) => x.id.toString() === id);
  if (!q) return "";
  return `<span class='question-index'>#${currentQuestionIndex.value + 1} | </span> ${q.question}`
});

const questionsOrder = ref([]);

function buildQuestionOrder() {
  questionsOrder.value = questionIds.value.slice();
  shuffleArray(questionsOrder.value);
}
buildQuestionOrder();

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function resetQuiz() {
  questionsOrder.value = [];
  currentQuestionIndex.value = 0;

  Object.assign(result, { sangue: 1, morte: 1, conhecimento: 1, energia: 1 });
  Object.keys(answers).forEach((id) => delete answers[id]);
  quizFinished.value = false;
  buildQuestionOrder();
}

export function next(answer) {
  const id = questionsOrder.value[currentQuestionIndex.value];
  const q = activeQuestions.value.find((x) => x.id.toString() === id);
  if (!q) return;

  Object.entries(q.effect).forEach(([key, val]) => {
    result[key] += val * answer;
  });

  answers[id] = answer;
  currentQuestionIndex.value++;

  if (currentQuestionIndex.value >= questionsOrder.value.length) {
    quizFinished.value = true;
  }
}

export function prev() {
  if (currentQuestionIndex.value <= 0) return;

  const targetIndex = currentQuestionIndex.value - 1;
  const id = questionsOrder.value[targetIndex];
  const q = activeQuestions.value.find((x) => x.id.toString() === id);
  if (!q || answers[id] == null) return;

  currentQuestionIndex.value = targetIndex;

  Object.entries(q.effect).forEach(([key, val]) => {
    result[key] -= val * answers[id];
  });
}

export function sendResults(username) {
  const name = username?.trim() || "";

  const percentage = (partial, total) => Math.floor((100 * partial) / total);
  const porcentRes = [
    50 + Math.floor(percentage(result.sangue, 80)),
    50 + Math.floor(percentage(result.morte, 80)),
    50 + Math.floor(percentage(result.conhecimento, 80)),
    50 + Math.floor(percentage(result.energia, 80)),
  ];
  const maxValue = 100;
  const spectrumPer = porcentRes.map((value) =>
    Math.floor(percentage(value, maxValue))
  );

  const labels = ["Sangue", "Morte", "Conhecimento", "Energia"];
  const max = Math.max(...spectrumPer);
  const winners = spectrumPer.reduce(
    (acc, v, i) => (v === max ? acc.concat(i) : acc),
    []
  );
  let resultElement;
  if (winners.length > 1) {
    resultElement = winners.length === 4 ? "Medo" : labels[winners[0]];
  } else {
    resultElement = labels[winners[0]];
  }

  //
  const quizResult = {
    name: name,
    spectrum: spectrumPer,
    result: resultElement,
  };

  // Salva o resultado no LocalStorage e redireciona
  localStorage.removeItem("quizResult");
  localStorage.setItem("quizResult", JSON.stringify(quizResult));

  router.push("/resultado");
}

watch(questionIds, () => {
  if (Object.keys(answers).length === 0) buildQuestionOrder();
})
