browser.runtime.onInstalled.addListener(function () {
  let exclude
  try {
    exclude = JSON.parse(window.localStorage.exclude)
  } catch (error) {
    exclude = []
    window.localStorage.exclude = JSON.stringify(exclude)
  }
})

const removeOther = async function () {
  let history = await browser.history.search({ text: '' })
  let hosts = history.map(i => new URL(i.url).host).filter((i, j, arr) => arr.indexOf(i) === j)
  await browser.browsingData.remove({
    'hostnames': hosts
  }, {
    'cache': true,
    'downloads': true,
    // 'fileSystems': true,
    'formData': true,
    'history': true,
    'indexedDB': true,
    'localStorage': true,
    // 'passwords': true,
    'pluginData': true,
    // 'serverBoundCertificates': true,
    'serviceWorkers': true
  })
}

const notification = function (text) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: './../images/logo-48.png',
    title: 'One Click Clean',
    message: text
  })
}

browser.browserAction.onClicked.addListener(async function () {
  let exclude = JSON.parse(window.localStorage.exclude)

  let cookies = await browser.cookies.getAll({})
  for (let i of cookies) {
    let url = `${i.secure ? 'https' : 'http'}://${i.domain}${i.path}`
    if (exclude.some(j => url.match(j))) continue
    await chrome.cookies.remove({
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

browser.menus.create({
  title: 'Add "%s" to Exclude',
  id: 'one-click-clean-selection',
  contexts: ['selection']
})

browser.menus.create({
  title: 'Add this host of src to Exclude',
  id: 'one-click-clean-src',
  contexts: ['image', 'video', 'audio']
})

browser.menus.create({
  title: 'Add this host of link to Exclude',
  id: 'one-click-clean-link',
  contexts: ['link']
})

browser.menus.create({
  title: 'Add this host of frame to Exclude',
  id: 'one-click-clean-frame',
  contexts: ['frame']
})

browser.menus.create({
  title: 'Add this host of page to Exclude',
  id: 'one-click-clean-page',
  contexts: ['page', 'browser_action']
})

browser.menus.onClicked.addListener(function (info, tab) {
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

browser.tabs.onActivated.addListener(async function (activeInfo) {
  let info = await browser.tabs.query({ active: true })
  let exclude = JSON.parse(window.localStorage.exclude)
  for (let i of info) {
    if (exclude.some(j => i.url.match(j))) {
      browser.browserAction.setIcon({
        path: 'images/logo-disabled-48.png',
        tabId: i.id
      })
    }
  }
})
