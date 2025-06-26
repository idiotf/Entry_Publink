import getShortenUrl from './shorten-url'

declare global {
  export namespace next {
    export namespace router {
      export namespace query {
        export const id: string
      }
      export const pathname: string
    }
  }
}

const shortenUrlButtons = new WeakSet<Element>
const body = document.body
if (body) new MutationObserver(() => self.next && next.router.pathname == '/project/[id]' && document.querySelectorAll('div.e7reuff0 ul').forEach(ul => {
  // 가끔씩 버튼이 위로 올라올 때를 대비함
  const button = ul.querySelector('li:last-child')
  if (button && shortenUrlButtons.has(button)) return
  ul.querySelectorAll('li').forEach(li => {
    if (shortenUrlButtons.has(li)) li.remove()
  })

  const li = document.createElement('li')
  shortenUrlButtons.add(li)
  ul.appendChild(li)

  const anchor = li.appendChild(document.createElement('a'))
  anchor.role = 'button'
  anchor.textContent = '전용 링크 만들기'
  
  li.addEventListener('click', async () => {
    const menu = document.querySelector('.e7reuff2')
    if (menu) {
      menu.classList.remove('css-17nv4r3')
      menu.classList.add('css-bax6hm')
      menu.removeAttribute('open')
      menu.previousElementSibling?.classList.remove('active')
    }

    const shortenUrl = await getShortenUrl(next.router.query.id)
    prompt('이 링크를 복사하세요.', shortenUrl)
  })
})).observe(body, { childList: true, subtree: true })
