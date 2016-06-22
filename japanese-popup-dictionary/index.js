var textContainer = document.querySelector('#text')
var popup = document.querySelector('#popup')
var button = document.querySelector('button')
var input = document.querySelector('input')
var copyButton = document.querySelector('#copy-button')

// It's simpler to just create a global reference to popupRemoveButton
// than redefining it every time I want to rerender the popup translation.
var popupRemoveButton = document.createElement('button')
popupRemoveButton.setAttribute('id', 'popup-remove')
popupRemoveButton.textContent = '✖'
popupRemoveButton.addEventListener('click', e => {
  popup.setAttribute('hidden', true)
  copyButton.setAttribute('hidden', true)
})

// Global variables from other files: dictionary, kanjiDictionary.
// The text variable is the only global variable that we use to keep track 
// of the state. It stores the Japanese text that the user entered in.
var text
var clickedSpan
var dictionaryEntries = (function getFileSync(url) {
    var request = new XMLHttpRequest()
    request.open('GET', url, false)
    request.send(null)
    return request.responseText
  })(location.href.replace(/\/[^\/]+$/, '') + '/dictionary.txt')
  .split('\n')
  .map(function(line) {
    var lineSplit = line.split(' ')
    var word = lineSplit[0]
    // If there's no pronunciation in the entry, that means the word is all hiragana or katakana, so just use the word as pronunciation
    var hasPronunciation = /\[[^\]]+\]/.test(lineSplit[1])
    var pronunciation =  hasPronunciation ? lineSplit[1].replace(/[\[\]]/g, '') : word
    var translation = lineSplit.slice(hasPronunciation ? 2 : 1).join(' ')

    return {word, pronunciation, translation}
  })

var displayTranslations = (dictionaryEntries) => {
  popup.innerHTML = ''
  popup.removeAttribute('hidden')
  copyButton.removeAttribute('hidden')

  var translationContainer = document.createElement('div')
  popup.appendChild(translationContainer)

  dictionaryEntries.forEach(entry => {
    var entryHTML = document.createElement('div')
    entryHTML.textContent = entry.word + ': ' + entry.pronunciation + ' ' + entry.translation
    translationContainer.appendChild(entryHTML)
  })

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
  if (clickedSpan) {
    clickedSpan.style.backgroundColor = 'white'
  }

  if (e.target.getAttribute('data-index')) {
    clickedSpan = e.target
    clickedSpan.style.backgroundColor = 'cyan'
  } else {
    // The user didn't click on a word, so don't do anything.
    return
  }

  var wordStartIndex = Number(e.target.getAttribute('data-index'))

  if (wordStartIndex == undefined) {
    return
  }

  
  // var start = new Date().getTime()
  // var results = []
  // for (var i = 0; i < dictionaryEntries.length; i++) {
  //   if (dictionaryEntries[i].pronunciation === word ||
  //       dictionaryEntries[i].word === word) {
  //     results.push(dictionaryEntries[i])
  //   }
  // }
  // var end = new Date().getTime()
  // console.log('time elapsed: ' + (end - start))

  for (var wordLength = 10; wordLength > 0; wordLength--) {
    var word = text.slice(wordStartIndex, wordStartIndex + wordLength)
    var entries = dictionaryEntries.filter(function(entry) {
      return entry.word === word || entry.pronunciation === word
    })
    if (dictionary[word]) {
      displayTranslation(entries)
      return
    }
  }

  // If there were no translations found for the dictionary, check the kanji dictionary...
  if (kanjiDictionary[text[wordStartIndex]]) {
    displayTranslation([{word: text[wordStartIndex], pronunciation: text[wordStartIndex], translation: kanjiDictionary[text[wordStartIndex]]})
  }
}

button.addEventListener('click', saveText)
textContainer.addEventListener('click', lookupWord)

if (typeof localStorage.getItem('text') === 'string' &&
    localStorage.getItem('text').length > 0) {
  saveText()
}
