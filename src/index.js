const API = `http://localhost:3000/api/v1`

let USER_NAME, USER_ID;

document.addEventListener('DOMContentLoaded', () => {
  renderGifs()

  userSignIn()

  const sortButton = document.getElementById('sort')
  sortButton.id = false
  sortButton.addEventListener('click', sortGifs)

  const list = document.getElementById('gif-list')
  list.addEventListener('click', handleThumbnailClick)

  const form = document.getElementById('new-gif-form')
  form.addEventListener('submit', handleGifSubmission)
})

function userSignIn() {
  const name = prompt("Please Sign In:");
  // console.log(USER_NAME)
  createUser({ name })
  .then(json => {
    if (json.errors) {
      userSignIn()
    } else {
      USER_NAME = json.name;
      USER_ID = json.id;
    }
  })
}

function createUser(data) {
  return fetch(`${API}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
}

function renderGifs() {
  document.getElementById('gif-list').innerHTML = ''
  fetch(`${API}/gifs`)
  .then(res => res.json())
  .then(data => data.forEach(renderGifThumbnail))
}

function renderGifThumbnail(data) {
  const ul = document.getElementById('gif-list')
  const li = document.createElement('li')

  const img = document.createElement('img')
  img.src = data.url
  img.className = 'gif-thumbnail'
  img.dataset.id = data.id
  li.append(img)

  const avgRating = document.createElement('p')
  avgRating.id = 'gif-thumbnail-rating'
  avgRating.textContent = data.avg_rating
  if(data.reviews.length > 0) {
    li.append(avgRating)
  }

  ul.append(li)
}

function handleThumbnailClick(e) {
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

  const avgRating = document.createElement('h3')
  avgRating.textContent = `Average Rating: ${data.avg_rating}`
  if(data.reviews.length > 0) {
    detailPanel.append(avgRating)
  }

  const gif = document.createElement('img')
  gif.src = data.url
  gif.className = 'gif-detail'
  detailPanel.append(gif)

  const reviews = document.createElement('div')
  reviews.id = "reviews"
  detailPanel.append(reviews)

  data.reviews.forEach(review => {
    // const content = document.createElement('div')

    // // TODO: get user name from backend
    // const author = document.createElement('h4')
    // author.textContent = review.user_name
    // content.append(author)

    // const rating = document.createElement('h5')
    // rating.textContent = review.rating
    // content.append(rating)

    // const reviewContent = document.createElement('p')
    // reviewContent.textContent = review.content
    // content.append(reviewContent)

    // reviews.append(content)
    renderReview(review)
  })

  const reviewForm = document.createElement('form')
  reviewForm.id = 'new-review-form'
  reviewForm.dataset.gifId = data.id
  reviewForm.dataset.userId = USER_ID

  // const userField = document.createElement('input')
  // userField.type = 'number'
  // userField.name = 'user-id'
  // userField.placeholder = 'User ID'
  // reviewForm.append(userField)

  const ratingField = document.createElement('input')
  ratingField.type = 'number'
  ratingField.name = 'rating'
  ratingField.placeholder = 'Rating'
  reviewForm.append(ratingField)

  const contentField = document.createElement('textarea')
  contentField.name = 'content'
  contentField.placeholder = 'Type your review here!'
  reviewForm.append(contentField)

  const submitButton = document.createElement('input')
  submitButton.type = 'submit'
  reviewForm.append(submitButton)

  detailPanel.append(reviewForm)

  reviewForm.addEventListener('submit', handleReviewSubmission)
}

function renderReview(data) {
  const reviews = document.getElementById('reviews')
  const content = document.createElement('div')

  const author = document.createElement('h4')
  author.textContent = data.user_name
  content.append(author)

  const rating = document.createElement('h5')
  rating.textContent = data.rating
  content.append(rating)

  const reviewContent = document.createElement('p')
  reviewContent.textContent = data.content
  content.append(reviewContent)

  reviews.append(content)
}

function handleGifSubmission(e) {
  e.preventDefault()
  const title = e.target.elements["title"].value
  const url = e.target.elements["url"].value
  const postBody = { title, url }
  fetch(`${API}/gifs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postBody)
  })
  .then(res => res.json())
  .then(data => renderGifThumbnail(data))
}

function handleReviewSubmission(e) {
  e.preventDefault()
  const rating = e.target.elements["rating"].value
  const content = e.target.elements["content"].value
  const gif_id = e.target.dataset.gifId
  const user_id = e.target.dataset.userId
  const postBody = { user_id, rating, content, gif_id }
  // console.log(postBody)
  fetch(`${API}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postBody)
  })
  .then(res => res.json())
  .then(data => {
    if (data.errors) {
      console.error(data.errors)
    } else {
      data.user_name = USER_NAME
      renderReview(data)
    }
  })

  e.target.reset()
}

// function renderNewReview(data) {
//   const reviews = document.getElementById('reviews')
//   const content = document.createElement('div')

//   const author = document.createElement('h4')
//   author.textContent = USER_NAME
//   content.append(author)

//   const rating = document.createElement('h5')
//   rating.textContent = data.rating
//   content.append(rating)

//   const reviewContent = document.createElement('p')
//   reviewContent.textContent = data.content
//   content.append(reviewContent)

//   reviews.append(content)
// }

function compareAvgRatings(a, b) {
  if (a.avg_rating < b.avg_rating) {
    return 1
  } else if (a.avg_rating > b.avg_rating) {
    return -1
  } else {
    return 0
  }
}

function sortGifs(e) {
  const gifs = document.getElementById('gif-list')
  console.log(gifs)
  gifs.innerHTML = ''
  if (e.target.id === 'false') {
    e.target.id = 'true'
    fetch(`${API}/gifs`)
    .then(res => res.json())
    .then(data => data.sort(compareAvgRatings))
    .then(sorted => sorted.forEach(gif => renderGifThumbnail(gif)))
  } else {
    e.target.id = 'false'
    renderGifs()
  }
}
