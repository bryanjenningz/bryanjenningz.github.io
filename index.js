var textContainer = document.querySelector('#text')
var popup = document.querySelector('#popup')
var button = document.querySelector('button')
var input = document.querySelector('input')
var characters = []
var text

var displayTranslation = ({word, translations}) => {
  popup.innerHTML = 'word: ' + word + ', translation: ' + translations.join(', ')
}

button.addEventListener('click', e => {
  text = input.value
  input.value = ''
  textContainer.textContent = ''

  text.split('').map(ch => {
    var el = document.createElement('span')
    el.textContent = ch
    return el
  }).forEach((el, i) => {
    textContainer.appendChild(el)
    var sides = el.getClientRects()[0]
    characters.push(Object.assign(
      {}, 
      {left: sides.left, right: sides.right, top: sides.top, bottom: sides.bottom},
      {text: el.textContent, index: i}
    ))
  })
})

textContainer.addEventListener('click', e => {
  var clickedCharacter = characters.filter(ch => {
    return ch.left < e.clientX && ch.right && e.clientX < ch.right && 
      ch.top < e.clientY && e.clientY < ch.bottom 
  })[0]

  if (clickedCharacter === undefined) {
    return
  }

  var offsetIndex = clickedCharacter.index

  // Check word definitions for the 10-character word, then 9, then 8, 7, ..., 2, 1
  for (var wordLength = 10; wordLength > 0; wordLength--) {
    var word = text.slice(offsetIndex, offsetIndex + wordLength)
    if (dictionary[word]) {
      displayTranslation({word, translations: dictionary[word]})
      break
    }
  }
})

