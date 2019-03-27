const API = `http://localhost:3000/api/v1`;

let USER_NAME, USER_ID, GIF_ID;

document.addEventListener("DOMContentLoaded", () => {
  userSignIn()
  .then(renderGifs);

  const sortDropdown = document.getElementById('sort-dropdown')
  sortDropdown.addEventListener('change', sortGifs)

  const list = document.getElementById("gif-list");
  list.addEventListener("click", handleThumbnailClick);

  const form = document.getElementById("new-gif-form");
  form.addEventListener("submit", handleGifSubmission);
});

function userSignIn() {
  const name = prompt("Please Sign In:");

  return createUser({ name })
  .then(json => {
    if (json.errors) {
      userSignIn();
    } else {
      USER_NAME = json.name;
      USER_ID = json.id;
    }
  });
}

function createUser(data) {
  return fetch(`${API}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json());
}

function renderGifs() {
  document.getElementById("gif-list").innerHTML = "";

  return fetch(`${API}/gifs`)
    .then(res => res.json())
    .then(data => data.forEach(renderGifThumbnail));
}

function renderGifThumbnail(data) {
  const ul = document.getElementById("gif-list");
  const li = document.createElement("li");

  const img = document.createElement("img");
  img.src = data.url;
  img.className = "gif-thumbnail";
  img.dataset.id = data.id;
  li.append(img);

  const avgRating = document.createElement("p");
  avgRating.id = "gif-thumbnail-rating";
  avgRating.textContent = parseFloat(data.avg_rating).toFixed(1)
  if (data.reviews.length > 0) {
    li.append(avgRating);
  }

  ul.append(li);
}

function handleThumbnailClick(e) {
  if (e.target.tagName === "IMG") {
    fetch(`${API}/gifs/${e.target.dataset.id}`)
      .then(res => res.json())
      .then(renderDetails)
      .then(renderAllReviews)
  }
}

function renderDetails(data) {
  GIF_ID = data.id;

  const gifDetails = document.getElementById("gif-details");
  gifDetails.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = data.title;
  gifDetails.append(title);

  const avgRating = document.createElement("h3");
  avgRating.textContent = `Average Rating: ${parseFloat(data.avg_rating).toFixed(1)}`;
  if (data.reviews.length > 0) {
    gifDetails.append(avgRating);
  }

  const gif = document.createElement("img");
  gif.src = data.url;
  gif.className = "gif-detail";
  gifDetails.append(gif);

  return data;
}

//////// REVIEW FORM FUNCTIONS ////////

function initializeReviewForm() {
  let reviewForm = document.createElement("form");
  reviewForm.id = "review-form";
  reviewForm.dataset.gifId = GIF_ID;
  reviewForm.dataset.userId = USER_ID;
  return reviewForm
}

function initializeRatingField() {
  let ratingField = document.createElement("select");
  ratingField.name = "rating";
  return ratingField
}

function appendDefaultOption(ratingField) {
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  defaultOption.textContent = "Select a Rating";
  ratingField.append(defaultOption);
}

function appendRatingOptions(ratingField) {
  for (i = 0; i <= 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    ratingField.append(option);
  }
}

function appendOptions(ratingField) {
  appendDefaultOption(ratingField)
  appendRatingOptions(ratingField)
}

function appendContentField(reviewForm) {
  const contentField = document.createElement("textarea");
  contentField.name = "content";
  contentField.placeholder = "Type your review here!";
  reviewForm.append(contentField);
}

function appendSubmitButton(reviewForm) {
  const submitButton = document.createElement("input")
  submitButton.type = "submit"
  reviewForm.append(submitButton)
  reviewForm.addEventListener("submit", handleReviewSubmission)
}

function createReviewForm() {
  let reviewForm = initializeReviewForm()
  let ratingField = initializeRatingField()
  appendOptions(ratingField)
  reviewForm.append(ratingField)
  appendContentField(reviewForm)
  appendSubmitButton(reviewForm)
  return reviewForm
}

function renderReviewForm() {
  const reviewList = document.getElementById("reviews");
  const reviewForm = createReviewForm()
  reviewList.append(reviewForm);
}





function renderAllReviews(data) {
  const reviews = document.getElementById("reviews");
  reviews.innerHTML = "";

  renderReviewForm();
  data.reviews.forEach(renderReview);
}

function renderReview(data) {
  const reviews = document.getElementById("reviews");
  const content = document.createElement("div");
  content.className = "review-card"

  const author = document.createElement("p");
  author.innerHTML = `<strong>${data.user_name.toLowerCase()}</strong> says:`;
  content.append(author);

  const reviewContent = document.createElement("p");
  reviewContent.className = "review-content";
  reviewContent.textContent = data.content;
  content.append(reviewContent);

  const rating = document.createElement("p");
  rating.innerHTML = `<span class="review-rating"><strong>${data.rating}</strong></span> stars`;
  content.append(rating);

  if (data.user_id === USER_ID) {
    const deleteButton = document.createElement('button');
    deleteButton.dataset.id = data.id;
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', handleDeleteReview);

    content.append(deleteButton);

    const editButton = document.createElement('button');
    editButton.dataset.id = data.id;
    editButton.textContent = "Edit";
    editButton.addEventListener('click', handleEditReview)

    content.append(editButton);
  }

  reviews.append(content);
}

function handleGifSubmission(e) {
  e.preventDefault();
  const title = e.target.elements["title"].value;
  const url = e.target.elements["url"].value;
  const postBody = { title, url };
  fetch(`${API}/gifs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(postBody)
  })
    .then(res => res.json())
    .then(data => renderGifThumbnail(data));
}

function handleReviewSubmission(e) {
  e.preventDefault();

  const rating = e.target.elements["rating"].value;
  const content = e.target.elements["content"].value;

  if(e.target.dataset.reviewId) {
    const id = e.target.dataset.reviewId;
    delete e.target.dataset.reviewId;

    postBody = { rating, content };

    fetch(`${API}/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(postBody)
    })
    .then(response => response.json())
    .then(data => {
      const reviewCard = document.getElementById('reviews').querySelector(".edited")
      const rating = reviewCard.querySelector('.review-rating')
      const content = reviewCard.querySelector('.review-content')

      rating.textContent = data.rating
      content.textContent = data.content

      reviewCard.classList.remove("edited")
    })
  } else {
    const gif_id = e.target.dataset.gifId;
    const user_id = e.target.dataset.userId;
    const postBody = { user_id, rating, content, gif_id };

    fetch(`${API}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postBody)
    })
    .then(res => res.json())
    .then(data => {
      if (data.errors) {
        console.error(data.errors);
      } else {
        data.user_name = USER_NAME;
        renderReview(data);
      }
    });
  }

  e.target.reset();
}

function handleDeleteReview(e) {
  const id = e.target.dataset.id;
  const review = e.target.parentNode;

  fetch(`${API}/reviews/${id}`, {
    method: "DELETE"
  })

  review.parentNode.removeChild(review);
}

function handleEditReview(e) {
  const form = document.getElementById('review-form');
  const id = e.target.dataset.id;

  fetch(`${API}/reviews/${id}`)
    .then(response => response.json())
    .then(data => {
      form.elements["rating"].value = data.rating;
      form.elements["content"].value = data.content;
      form.dataset.reviewId = data.id;
    })

  e.target.parentNode.classList += " edited"
}

function propertyComparator(prop, order) {
  if (order === 'ascending') {
    return function(a, b) {
      return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0
    }
  } else if (order === 'descending') {
    return function(a, b) {
      return a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : 0
    }
  }
}

function fetchSortedGifs(sortFunction) {
  fetch(`${API}/gifs`)
    .then(res => res.json())
    .then(data => data.sort(sortFunction))
    .then(sorted => sorted.forEach(gif => renderGifThumbnail(gif)))
}

function sortGifs(e) {
  const selection = e.target.value
  const gifs = document.getElementById('gif-list')
  gifs.innerHTML = ''
  switch (selection) {
    case 'best':
      fetchSortedGifs(propertyComparator('avg_rating', 'descending'))
      break;
    case 'worst':
      fetchSortedGifs(propertyComparator('avg_rating', 'ascending'))
      break;
    case 'newest':
      fetchSortedGifs(propertyComparator('created_at', 'descending'))
      break;
    case 'oldest':
      fetchSortedGifs(propertyComparator('created_at', 'ascending'))
      break;
  }
}
