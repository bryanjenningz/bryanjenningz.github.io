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

var text
var clickedSpan
var clipboards = []

var displayTranslations = (dictionaryEntries) => {
  popup.innerHTML = ''
  popup.removeAttribute('hidden')
  copyButton.removeAttribute('hidden')
  clipboards.forEach(clipboard => clipboard.destroy())
  clipboards = []

  var translationContainer = document.createElement('div')
  popup.appendChild(translationContainer)

  dictionaryEntries.forEach((entry, i) => {
    var entrySpan = document.createElement('span')
    var [trad, simp, pron, tran] = entry
    entrySpan.textContent = `${simp === trad ? simp : `${simp}/${trad}`} : [${pron}] : ${tran.replace(/\//g, '; ')}`

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
}

button.addEventListener('click', saveText)
textContainer.addEventListener('click', lookupWord)

if (typeof localStorage.getItem('text') === 'string' &&
    localStorage.getItem('text').length > 0) {
  saveText()
}
