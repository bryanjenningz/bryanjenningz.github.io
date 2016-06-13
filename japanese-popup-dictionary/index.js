var textContainer = document.querySelector('#text')
var popup = document.querySelector('#popup')
var button = document.querySelector('button')
var input = document.querySelector('input')

// It's simpler to just create a global reference to popupRemoveButton
// than redefining it every time I want to rerender the popup translation.
var popupRemoveButton = document.createElement('button')
popupRemoveButton.setAttribute('id', 'popup-remove')
popupRemoveButton.textContent = '✖'
popupRemoveButton.addEventListener('click', e => {
  popup.setAttribute('hidden', true)
})

// Global variables from other files: dictionary, kanjiDictionary.
// The text variable is the only global variable that we use to keep track 
// of the state. It stores the Japanese text that the user entered in.
var text

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

var saveText = () => {
  text = input.value || localStorage.getItem('text') || ''
  input.value = ''
  textContainer.textContent = ''

  text.split('').forEach((ch, i) => {
    var el = document.createElement('span')
    el.setAttribute('data-index', i)
    el.textContent = ch
    textContainer.appendChild(el)
  })

  if (text.length < 10000 && text.length > 0) {
    localStorage.setItem('text', text)
  } else {
    localStorage.removeItem('text')
  }
}

var lookupWord = e => {
  var wordStartIndex = Number(e.target.getAttribute('data-index'))

  if (wordStartIndex == undefined) {
    return
  }

  for (var wordLength = 10; wordLength > 0; wordLength--) {
    var word = text.slice(wordStartIndex, wordStartIndex + wordLength)
    if (dictionary[word]) {
      displayTranslation({word, translations: dictionary[word]})
      return
    }
  }

  // If there were no translations found for the dictionary, check the kanji dictionary...
  if (kanjiDictionary[text[wordStartIndex]]) {
    displayTranslation({word: text[wordStartIndex], translations: [kanjiDictionary[text[wordStartIndex]]]})
  }
}

button.addEventListener('click', saveText)
textContainer.addEventListener('click', lookupWord)

if (typeof localStorage.getItem('text') === 'string' &&
    localStorage.getItem('text').length > 0) {
  saveText()
}
