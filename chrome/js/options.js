;[].concat(...document.querySelectorAll('input[name],textarea[name]')).forEach(i => {
  if (i.name in window.localStorage) i.value = i.tagName === 'TEXTAREA' ? JSON.parse(window.localStorage[i.name]).join('\n') : window.localStorage[i.name]
})

document.body.addEventListener('keyup', e => {
  if (e.target.name) {
    window.localStorage[e.target.name] = e.target.tagName === 'TEXTAREA' ? JSON.stringify(e.target.value.split(/[\r\n]/).filter(i => i)) : e.target.value
  }
})
