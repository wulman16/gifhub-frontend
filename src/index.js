const API = `http://localhost:3000/api/v1`;

let USER_NAME, USER_ID;

document.addEventListener("DOMContentLoaded", () => {
  userSignIn()
  .then(renderGifs);

  const sortButton = document.getElementById("sort");
  sortButton.id = false;
  sortButton.addEventListener("click", sortGifs);

  const list = document.getElementById("gif-list");
  list.addEventListener("click", handleThumbnailClick);

  const form = document.getElementById("new-gif-form");
  form.addEventListener("submit", handleGifSubmission);
});

function userSignIn() {
  const name = prompt("Please Sign In:");
  // console.log(USER_NAME)
  return createUser({ name }).then(json => {
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
  avgRating.textContent = data.avg_rating;
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
      .then(renderReviewForm);
  }
}

function renderDetails(data) {
  const detailPanel = document.getElementById("detail-panel");
  detailPanel.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = data.title;
  detailPanel.append(title);

  const avgRating = document.createElement("h3");
  avgRating.textContent = `Average Rating: ${data.avg_rating}`;
  if (data.reviews.length > 0) {
    detailPanel.append(avgRating);
  }

  const gif = document.createElement("img");
  gif.src = data.url;
  gif.className = "gif-detail";
  detailPanel.append(gif);

  const reviews = document.createElement("div");
  reviews.id = "reviews";
  detailPanel.append(reviews);

  data.reviews.forEach(renderReview);

  // renderReviewForm(data)
  return data;
}

function renderReviewForm(data) {
  const detailPanel = document.getElementById("detail-panel");

  const reviewForm = document.createElement("form");
  reviewForm.id = "new-review-form";
  reviewForm.dataset.gifId = data.id;
  reviewForm.dataset.userId = USER_ID;

  // const userField = document.createElement('input')
  // userField.type = 'number'
  // userField.name = 'user-id'
  // userField.placeholder = 'User ID'
  // reviewForm.append(userField)

  // const ratingField = document.createElement('input')
  // ratingField.type = 'number'
  // ratingField.name = 'rating'
  // ratingField.placeholder = 'Rating'
  // reviewForm.append(ratingField)

  const ratingField = document.createElement("select");
  ratingField.name = "rating";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  defaultOption.hidden = true;
  defaultOption.textContent = "Select a Rating";
  ratingField.append(defaultOption);

  for (i = 0; i <= 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    ratingField.append(option);
  }

  reviewForm.append(ratingField);

  const contentField = document.createElement("textarea");
  contentField.name = "content";
  contentField.placeholder = "Type your review here!";
  reviewForm.append(contentField);

  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  reviewForm.append(submitButton);

  detailPanel.append(reviewForm);

  reviewForm.addEventListener("submit", handleReviewSubmission);
}

function renderReview(data) {
  const reviews = document.getElementById("reviews");
  const content = document.createElement("div");
  content.className = "review-card"

  const author = document.createElement("p");
  author.innerHTML = `<strong>${data.user_name.toLowerCase()}</strong> says:`;
  content.append(author);

  const reviewContent = document.createElement("p");
  reviewContent.textContent = data.content;
  content.append(reviewContent);

  const rating = document.createElement("p");
  rating.innerHTML = `<strong>${data.rating}</strong> stars`;
  content.append(rating);

  if (data.user_id === USER_ID) {
    // console.log(`${USER_NAME} created this review`)
    // console.log(data)
    const deleteButton = document.createElement('button');
    deleteButton.dataset.id = data.id;
    deleteButton.textContent = "Delete"
    deleteButton.addEventListener('click', handleDeleteReview)

    content.append(deleteButton)
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

  e.target.reset();
}

function handleDeleteReview(e) {
  // console.log(e.target)
  const id = e.target.dataset.id;
  const review = e.target.parentNode;

  fetch(`${API}/reviews/${id}`, {
    method: "DELETE"
  })
  // .then(console.log)

  review.parentNode.removeChild(review);
}

function compareAvgRatings(a, b) {
  if (a.avg_rating < b.avg_rating) {
    return 1;
  } else if (a.avg_rating > b.avg_rating) {
    return -1;
  } else {
    return 0;
  }
}

function sortGifs(e) {
  const gifs = document.getElementById("gif-list");
  console.log(gifs);
  gifs.innerHTML = "";
  if (e.target.id === "false") {
    e.target.id = "true";
    fetch(`${API}/gifs`)
      .then(res => res.json())
      .then(data => data.sort(compareAvgRatings))
      .then(sorted => sorted.forEach(gif => renderGifThumbnail(gif)));
  } else {
    e.target.id = "false";
    renderGifs();
  }
}
