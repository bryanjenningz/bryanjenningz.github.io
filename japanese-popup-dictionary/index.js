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

var clipboard = new Clipboard('#copy-button')

var text // stores the entire text that was saved
var clickedSpan // stores the last clicked span
var clipboards = [] // stores all the clipboards, used for copying the translations
var dictionary = {} // what we will use to look up words
var selection // stores the selection as {start: Number, end: Number} so users can select text ranges on mobile easily
;(function getFileSync(url) {
  var request = new XMLHttpRequest()
  request.open('GET', url, false)
  request.send(null)
  return request.responseText
})(location.href.replace(/\/[^\/]+$/, '') + '/dictionary.txt')
.split('\n')
.forEach(function(line) {
  var lineSplit = line.split(' ')
  var word = lineSplit[0]
  // If there's no pronunciation in the entry, that means the word is all hiragana or katakana, so just use the word as pronunciation
  var hasPronunciation = /\[[^\]]+\]/.test(lineSplit[1])
  var pronunciation =  hasPronunciation ? lineSplit[1].replace(/[\[\]]/g, '') : word
  var translation = lineSplit.slice(hasPronunciation ? 2 : 1).join(' ')

  // Add so the word comes up by word and by pronunciation
  // The reason key is to see if the word was added to the dictionary entry for its word or its pronunciation
  if (dictionary[word]) {
    dictionary[word].push({word, pronunciation, translation, reason: 'word'})
  } else {
    dictionary[word] = [{word, pronunciation, translation, reason: 'word'}]
  }

  // If the pronunciation is the same as the word, we don't want to add a duplicate entry
  if (pronunciation !== word) {
    if (dictionary[pronunciation]) {
      dictionary[pronunciation].push({word, pronunciation, translation, reason: 'pronunciation'})
    } else {
      dictionary[pronunciation] = [{word, pronunciation, translation, reason: 'pronunciation'}]
    }
  }
})

var displayTranslations = (dictionaryEntries) => {
  popup.innerHTML = ''
  popup.removeAttribute('hidden')

  copyButton.removeAttribute('hidden')
  var clickedIndex = clickedSpan && clickedSpan.getAttribute('data-index') && Number(clickedSpan.getAttribute('data-index'))
  if (typeof clickedIndex === 'number') {
    // Make the copy button copy the context around the word that's selected.
    var startIndex = Math.max(clickedIndex - 30, text.lastIndexOf('。', clickedIndex))
    var endIndex = Math.min(clickedIndex + 30, text.indexOf('。', clickedIndex))
    var copyButtonText = text.slice(startIndex + 1, endIndex).trim()
    copyButton.setAttribute('data-clipboard-text', copyButtonText)
  }

  clipboards.forEach(clipboard => clipboard.destroy())
  clipboards = []

  var translationContainer = document.createElement('div')
  popup.appendChild(translationContainer)

  dictionaryEntries.forEach((entry, i) => {
    var entrySpan = document.createElement('span')
    entrySpan.textContent = entry.word + ': ' + entry.pronunciation + ' ' + entry.translation

    var entryButton = document.createElement('button')
    entryButton.setAttribute('id', 'copy-' + i)
    entryButton.setAttribute('data-clipboard-action', 'copy')
    entryButton.setAttribute('data-clipboard-target', '#popup div:nth-child(' + (i + 1) + ') span')
    entryButton.textContent = 'C'
    clipboards.push(new Clipboard('#copy-' + i))

    var entryHTML = document.createElement('div')
    entryHTML.appendChild(entryButton)
    entryHTML.appendChild(entrySpan)
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
  if (selection && typeof selection.start === 'number') {
    // If there's a highlighted selection, then unhighlight it and continue
    // to looking up the word that was clicked.
    if (typeof selection.end === 'number') {
      colorTextRange(selection.start, selection.end, 'white')

      // Otherwise, if the ending point is not a number, then that means that 
      // we want to select the text from the start to the end (which is the 
      // point we're touching right now)
    } else {
      var endIndex = e.target.getAttribute('data-index') && Number(e.target.getAttribute('data-index'))

      // We clicked a valid character, then highlight the selection and make it copied to the clipboard.
      if (typeof endIndex === 'number') {
        colorTextRange(selection.start, endIndex, 'cyan')
        copyButton.setAttribute('data-clipboard-text', text.slice(selection.start, endIndex))
        return
      // Otherwise, reset the selection to null and continue with looking up the clicked word.
      } else {
        selection = null
      }
    }
  }

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

  var results = []
  var wordsTried = {}
  for (var wordLength = 10; wordLength > 0; wordLength--) {
    var word = text.slice(wordStartIndex, wordStartIndex + wordLength)
    if (!wordsTried[word]) {
      var entries = dictionary[word]
      
      if (entries) {
        results.push(...entries)
      }
    }
    wordsTried[word] = true
  }
  if (results.length > 0) {
    displayTranslations(results.slice(0, 7))
    return
  }

  // If there were no translations found for the dictionary, check the kanji dictionary...
  if (kanjiDictionary[text[wordStartIndex]]) {
    displayTranslations([{word: text[wordStartIndex], pronunciation: text[wordStartIndex], translation: kanjiDictionary[text[wordStartIndex]]}])
  }
}

var colorTextRange = (startIndex, endIndex, color) => {
  // Make sure the start index is the lower value.
  if (startIndex > endIndex) {
    var temp = startIndex
    startIndex = endIndex
    endIndex = temp
  }

  var startEl = document.querySelector(`[data-index="${startIndex}"]`)
  var endEl = document.querySelector(`[data-index="${endIndex}"]`)
  
  // Highlight all the text in between the start and end index.
  for (var el = startEl; el !== endEl; el = el.nextSibling) {
    el.style.backgroundColor = color
  }
  el.style.backgroundColor = color

  if (color === 'white') {
    selection = null
  } else {
    selection = {start: startIndex, end: endIndex}
  }
}

button.addEventListener('click', saveText)
textContainer.addEventListener('click', lookupWord)
textContainer.addEventListener('dblclick', e => {
  if (e.target.getAttribute('data-index')) {
    selection = {start: Number(e.target.getAttribute('data-index'))}
  }
})

if (typeof localStorage.getItem('text') === 'string' &&
    localStorage.getItem('text').length > 0) {
  saveText()
}


