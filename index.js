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
    // The reason why I'm appending each element to the DOM is so that I can get
    // the character's x-position, which is more accurate than the offsetIndex 
    // method. Sadly, the y-position isn't accurate for this method because it doesn't
    // take into consideration the scrollY value, and the scrollY value isn't compatible
    // across all browsers, so I have to just compare the offsetIndex to be able to
    // determine which character gets touched by the user.
    textContainer.appendChild(el)
    var sides = el.getClientRects()[0]
    characters.push(Object.assign(
      {}, 
      {left: sides.left, right: sides.right, top: sides.top, bottom: sides.bottom},
      {text: el.textContent, index: i}
    ))
  })

  textContainer.textContent = text
})

textContainer.addEventListener('click', e => {
  // offsetIndex isn't a reliable source for determining the character, since it 
  // tends to give the character to the right if you click the right side of a character.
  // To fix this, I'm going to use e.clientX, which gives a more accurate x-value,
  // then we're going to filter for characters that are within 1 of offsetIndex.
  var offsetIndex = document.caretRangeFromPoint(e.clientX, e.clientY).startOffset

  var clickedCharacter = characters.filter(ch => {
    return ch.left < e.clientX && ch.right && e.clientX < ch.right
  }).filter(ch => {
    return Math.abs(ch.index - offsetIndex) <= 1
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

