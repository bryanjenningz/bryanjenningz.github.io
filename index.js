var textContainer = document.querySelector('#text')
var popup = document.querySelector('#popup')
var button = document.querySelector('button')
var input = document.querySelector('input')
// We also have global variables, dictionary and kanjiDictionary,
// from the other files.

var characters = []
var text

// It's simpler to just create a global reference to popupRemoveButton
// than redefining it every time I want to rerender the popup translation.
var popupRemoveButton = document.createElement('button')
popupRemoveButton.setAttribute('id', 'popup-remove')
popupRemoveButton.textContent = '✖'
popupRemoveButton.addEventListener('click', e => {
  popup.setAttribute('hidden', true)
})

var displayTranslation = ({word, translations}) => {
  popup.innerHTML = ''
  popup.removeAttribute('hidden')

  var wordHTML = document.createElement('div')
  wordHTML.textContent = 'Word: ' + word
  popup.appendChild(wordHTML)

  var translationHTML = document.createElement('div')
  translationHTML.textContent = 'Translation: ' + translations.join(', ')
  popup.appendChild(translationHTML)

  popup.appendChild(popupRemoveButton)
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
    // The reason why I'm appending each element to the DOM in a span tag is so that I can get
    // the character's x-position, which is more accurate than the offsetIndex 
    // method. Sadly, the y-position isn't accurate for this method because it doesn't
    // take into consideration the scrollY value, and the scrollY value isn't compatible
    // across all browsers, so I have to just compare the offsetIndex to be able to
    // determine which character gets touched by the user.
    // I remove the span tags at the end and replace it with just text so that I can take
    // advantage of the document.caretRangeFromPoint method which is dependent on my using
    // plain text.
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
      return
    }
  }

  // If there were no translations found for the dictionary, check the kanji dictionary...
  if (kanjiDictionary[text[offsetIndex]]) {
    displayTranslation({word: text[offsetIndex], translations: [kanjiDictionary[text[offsetIndex]]]})
  }
})

