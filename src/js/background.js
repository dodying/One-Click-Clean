const warning = `Confirm to DELETE All Data without \nPasswords and Cookies match \n- - -\n{exclude}`

const removeOther = async function () {
  await new Promise(resolve => {
    chrome.browsingData.remove({
      'originTypes': {
        'protectedWeb': true,
        'unprotectedWeb': true
      }
    }, {
      'appcache': true,
      'cache': true,
      'downloads': true,
      'fileSystems': true,
      'formData': true,
      'history': true,
      'indexedDB': true,
      'localStorage': true,
      'serverBoundCertificates': true,
      // 'passwords': true,
      'pluginData': true,
      'serviceWorkers': true,
      'webSQL': true
    }, function () {
      resolve()
    })
  })
}

const getAllCookies = async function () {
  return new Promise(resolve => {
    chrome.cookies.getAll({}, result => {
      resolve(result)
    })
  })
}

const removeCookie = async function (details) {
  return new Promise(resolve => {
    chrome.cookies.remove(details, result => {
      resolve(result)
    })
  })
}

chrome.browserAction.onClicked.addListener(async function () {
  let exclude = JSON.parse(window.localStorage.exclude)
  if (!window.confirm(warning.replace(/{exclude}/, exclude.join('\n')))) return window.alert('One Click Clean Canceled')

  let cookies = await getAllCookies()
  for (let i of cookies) {
    let url = `${i.secure ? 'https' : 'http'}://${i.domain}${i.path}`
    if (exclude.some(j => url.match(j))) continue
    await removeCookie({
      url: url,
      name: i.name
    })
  }
  await removeOther()

  chrome.notifications.create({
    type: 'basic',
    iconUrl: './../images/logo-48.png',
    title: 'One Click Clean',
    message: 'Clean Succeed',
    eventTime: 3 * 1000,
    isClickable: true
  }, function () {
    chrome.notifications.onClicked.addListener(function (notificationId) {
      chrome.notifications.clear(notificationId)
    })
  })
})
