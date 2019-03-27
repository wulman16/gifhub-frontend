let USER_NAME, USER_ID, GIF_ID;

document.addEventListener("DOMContentLoaded", () => {
  const userForm = document.getElementById("sign-in")
  userForm.addEventListener('submit', userSignIn)

  const sortDropdown = document.getElementById('sort-dropdown')
  sortDropdown.addEventListener('change', sortGifs)

  const list = document.getElementById("gif-list");
  list.addEventListener("click", handleThumbnailClick);

  const form = document.getElementById("new-gif-form");
  form.addEventListener("submit", handleGifSubmission);
});

/**
 *
 * @summary this section is for event handlers
 */

function userSignIn(e) {
  e.preventDefault();
  const name = e.target.elements["name"].value
  console.log(name)

  return Adapter.create('users', { name })
  .then(json => {
    if (json.errors) {
      userSignIn();
    } else {
      USER_NAME = json.name;
      USER_ID = json.id;
      document.getElementById("sign-in-div").innerHTML = `Welcome, ${json.name}`
      // renderGifs()
      Gif.renderAll()
    }
  });
}

function handleThumbnailClick(e) {
  if (e.target.tagName === "IMG") {
    const id = e.target.dataset.id

    Adapter.get('gifs', id).then(renderDetails)
  }
}

function handleGifSubmission(e) {
  e.preventDefault();
  const title = e.target.elements["title"].value;
  const url = e.target.elements["url"].value;
  const postBody = { title, url };

  Adapter.create('gifs', postBody)
    .then(renderGifs);
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

/**
 * TODO:
 * @todo move these into separate class
 */

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

  // const reviewButton = document.createElement('button')
  // reviewButton.innerText = "Add Review"
  // reviewButton.addEventListener('click', handleReviewButtonClick)
  // gifDetails.append(reviewButton)
  // renderReviewForm();

  // return data;
  Review.renderAll();
}

//////// REVIEW FORM FUNCTIONS ////////

// function initializeReviewForm() {
//   let reviewForm = document.createElement("form");
//   reviewForm.id = "review-form";
//   reviewForm.dataset.gifId = GIF_ID;
//   reviewForm.dataset.userId = USER_ID;
//   return reviewForm
// }

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

function handleReviewSubmission(e) {
  e.preventDefault();

  const rating = e.target.elements["rating"].value;
  const content = e.target.elements["content"].value;

  if(e.target.dataset.reviewId) {
    const id = e.target.dataset.reviewId;
    delete e.target.dataset.reviewId;

    postBody = { rating, content };

    Adapter.update('reviews', id, postBody)
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

    Adapter.create('reviews', postBody)
    .then(data => {
      if (data.errors) {
        console.error(data.errors);
      } else {
        Review.renderAll();
      }
    });
  }

  e.target.reset();
}

function handleDeleteReview(e) {
  const id = e.target.dataset.id;
  const review = e.target.parentNode;

  Adapter.delete('reviews', id)

  review.parentNode.removeChild(review);
}

function handleEditReview(e) {
  const form = document.getElementById('review-form');
  const id = e.target.dataset.id;

  Adapter.get('reviews', id)
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
  Adapter.get('gifs')
    .then(data => data.sort(sortFunction))
    .then(sorted => sorted.forEach(gif => Gif.renderThumbnail(gif)))
}
