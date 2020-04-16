addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
let index = 0;
async function handleRequest(request) {
  let url = getCookie(request, 'url');

  if (url == null) {
    let urls = [''];
    await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          urls = data['variants']
        }).catch((error) => {
          console.log(error)
        });

    url = urls[Math.floor(Math.random() * urls.length)];
  }

  if (url.endsWith('1')) {
    index = 0
  } else {
    index = 1
  }

  const res = await fetch(url)
  let response = new HTMLRewriter().on('*', new ElementHandler()).transform(res)
  response = new Response(response.body, response)
  response.headers.set('Set-Cookie', 'url='+url)
  return response
}

function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

class ElementHandler{
  element(element) {
    switch(element.tagName) {
      case 'title':
        element.setInnerContent('Paul Zhu page ' + (index+1));
        break;
      case 'h1':
        if (element.getAttribute('id') === 'title') {
          element.setInnerContent('Paul Zhu\'s ' + (index === 0 ? 'Project Link' : 'LinkedIn Page'))
        }
        break;
      case 'p':
        if (element.getAttribute('id') === 'description') {
          element.setInnerContent(index === 0 ? 'LaunchIt is a platform for people to be matched by ideas'
              : 'Paul Zhu is a 3rd year CS student/tutor at UCSD')
        }
        break;
      case 'a':
        if (element.getAttribute('id') === 'url') {
          element.setInnerContent(index === 0 ? 'LaunchIt' : 'LinkedIn');
          element.setAttribute('href', index === 0 ?
              'https://www.launchitnow.org/' : 'https://www.linkedin.com/in/zhenxuan-zhu/')
        }
    }
  }
}
