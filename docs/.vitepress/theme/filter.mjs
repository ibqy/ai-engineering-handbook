export function filterQuestions(questions, { category = '', level = '', query = '' } = {}) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return questions.filter(question => {
    if (category && question.category !== category) return false
    if (level && question.level !== level) return false
    const text = [question.id, question.title, question.summary, ...question.tags].join(' ').toLocaleLowerCase()
    return words.every(word => text.includes(word))
  })
}
