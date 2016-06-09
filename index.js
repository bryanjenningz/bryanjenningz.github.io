var textContainer = document.querySelector('#text')
var popup = document.querySelector('#popup')
var button = document.querySelector('button')
var input = document.querySelector('input')

var displayTranslation = ({word, translations}) => {
  popup.innerHTML = 'word: ' + word + ', translation: ' + translations.join(', ')
}

button.addEventListener('click', e => {
  textContainer.textContent = input.value
  input.value = ''
})

textContainer.addEventListener('click', e => {
  var offsetIndex = document.caretRangeFromPoint(e.clientX, e.clientY).startOffset
  var text = textContainer.textContent

  // Check word definitions for the 10-character word, then 9, then 8, 7, ..., 2, 1
  for (var wordLength = 10; wordLength > 0; wordLength--) {
    var word = text.slice(offsetIndex, offsetIndex + wordLength)
    if (dictionary[word]) {
      displayTranslation({word, translations: dictionary[word]})
      break
    }
  }
})
