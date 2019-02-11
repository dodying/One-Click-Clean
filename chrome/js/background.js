chrome.runtime.onInstalled.addListener(function () {
  let exclude
  try {
    exclude = JSON.parse(window.localStorage.exclude)
  } catch (error) {
    exclude = []
    window.localStorage.exclude = JSON.stringify(exclude)
  }
})

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
      // 'passwords': true,
      'pluginData': true,
      'serverBoundCertificates': true,
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

const notification = function (text) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: './../images/logo-48.png',
    title: 'One Click Clean',
    message: text,
    eventTime: 3 * 1000,
    isClickable: true
  }, function () {
    chrome.notifications.onClicked.addListener(function (notificationId) {
      chrome.notifications.clear(notificationId)
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

  notification('Clean Succeed')
})

const addToExclude = function (text) {
  let exclude = JSON.parse(window.localStorage.exclude)
  exclude.push(text)
  exclude = exclude.filter(i => i)
  window.localStorage.exclude = JSON.stringify(exclude)
  notification(`add ${text} to Exclude`)
}

chrome.contextMenus.create({
  title: 'Add "%s" to Exclude',
  id: 'one-click-clean-selection',
  contexts: ['selection']
})

chrome.contextMenus.create({
  title: 'Add this host of src to Exclude',
  id: 'one-click-clean-src',
  contexts: ['image', 'video', 'audio']
})

chrome.contextMenus.create({
  title: 'Add this host of link to Exclude',
  id: 'one-click-clean-link',
  contexts: ['link']
})

chrome.contextMenus.create({
  title: 'Add this host of frame to Exclude',
  id: 'one-click-clean-frame',
  contexts: ['frame']
})

chrome.contextMenus.create({
  title: 'Add this host of page to Exclude',
  id: 'one-click-clean-page',
  contexts: ['page', 'browser_action']
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'one-click-clean-selection') {
    addToExclude(info.selectionText)
  } else if (info.menuItemId === 'one-click-clean-src') {
    addToExclude(new URL(info.srcUrl).host)
  } else if (info.menuItemId === 'one-click-clean-link') {
    addToExclude(new URL(info.linkUrl).host)
  } else if (info.menuItemId === 'one-click-clean-frame') {
    addToExclude(new URL(info.frameUrl).host)
  } else if (info.menuItemId === 'one-click-clean-page') {
    addToExclude(new URL(tab.url).host)
  }
})

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.query({ active: true }, info => {
    let exclude = JSON.parse(window.localStorage.exclude)
    for (let i of info) {
      if (exclude.some(j => i.url.match(j))) {
        chrome.browserAction.setIcon({
          path: 'images/logo-disabled-48.png',
          tabId: i.id
        })
      }
    }
  })
})
