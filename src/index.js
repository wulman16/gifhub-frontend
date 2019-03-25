const API = `http://localhost:3000/api/v1`

document.addEventListener('DOMContentLoaded', () => {
  renderGifs()
  const list = document.getElementById('gif-list')
  list.addEventListener('click', handleThumbnailClick)
})

function renderGifs() {
  fetch(`${API}/gifs`)
  .then(res => res.json())
  .then(data => data.forEach(renderGifThumbnail))
}

function renderGifThumbnail(data) {
  const ul = document.getElementById('gif-list')
  const li = document.createElement('li')
  li.innerHTML = `<img src="${data.url}" class="gif-thumbnail" data-id="${data.id}">`
  ul.append(li)
}

function handleThumbnailClick(e) {
  console.log(e.target)
  if(e.target.tagName === 'IMG') {
    fetch(`${API}/gifs/${e.target.dataset.id}`)
    .then(res => res.json())
    .then(data => renderDetails(data))
  }
}

function renderDetails(data) {
  const detailPanel = document.getElementById('detail-panel')
  detailPanel.innerHTML = ''

  const title = document.createElement('h3')
  title.textContent = data.title
  detailPanel.append(title)

  const gif = document.createElement('img')
  gif.src = data.url
  gif.className = 'gif-detail'
  detailPanel.append(gif)

  const reviews = document.createElement('div')
  detailPanel.append(reviews)
  
  data.reviews.forEach(review => {
    const content = document.createElement('div')

    // TODO: get user name from backend
    const author = document.createElement('h4')
    author.textContent = review.user_id
    content.append(author)

    const rating = document.createElement('h5')
    rating.textContent = review.rating
    content.append(rating)

    const reviewContent = document.createElement('p')
    reviewContent.textContent = review.content
    content.append(reviewContent)

    reviews.append(content)
  })
}
