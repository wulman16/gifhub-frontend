/**
 * @module Review
 */

class Review {
  static renderAll() {
    const reviews = document.getElementById("reviews");
    reviews.innerHTML = "";

    Adapter.get(GIFS_ENDPOINT, GIF_ID)
      .then(data => {
        // Sort by most recently updated review
        const sorted = data.reviews.sort((a,b) => {
          const dateA = new Date(a.updated_at);
          const dateB = new Date(b.updated_at);
          return (dateB - dateA);
        })

        sorted.forEach(content => reviews.append(Review.render(content)));
      })
  }

  static render(data) {
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
    // rating.innerHTML = `<span class="review-rating"><strong>${data.rating}</strong></span> stars`;
    rating.className = "review-rating"
    rating.innerHTML = ratingToStars(data.rating)
    content.append(rating);

    const dateFromJSON = new Date(data.updated_at);
    const date = document.createElement("p")
    date.innerText = dateFromJSON.toLocaleString();
    content.append(date);

    if (data.user_id === USER_ID) {
      const buttonContainer = document.createElement('div')
      buttonContainer.className = "review-buttons"
      content.append(buttonContainer)

      const editButton = document.createElement('button');
      editButton.dataset.id = data.id;
      editButton.textContent = "Edit";
      editButton.classList = "btn-xs btn-default"
      editButton.addEventListener('click', Review.handleEdit)

      buttonContainer.append(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.dataset.id = data.id;
      deleteButton.textContent = "Delete";
      deleteButton.classList = "btn-xs btn-default review-delete-button"
      deleteButton.addEventListener('click', Review.handleDelete);

      buttonContainer.append(deleteButton);
    }

    return content;
  }

  /* Methods to handle new review creation and update */

  static createAndRender(postBody) {
    Adapter.create(REVIEWS_ENDPOINT, postBody)
    .then(data => {
      if (data.errors) {
        console.error(data.errors);
      } else {
        const reviews = document.getElementById('reviews')
        reviews.prepend(Review.render(data));
      }
    });
  }

  static updateAndRender(id, postBody) {
    Adapter.update(REVIEWS_ENDPOINT, id, postBody)
    .then(data => {
      const reviewCard = document.getElementById('reviews').querySelector(".edited")
      const rating = reviewCard.querySelector('.review-rating')
      const content = reviewCard.querySelector('.review-content')

      rating.textContent = ratingToStars(data.rating)
      content.textContent = data.content

      reviewCard.classList.remove("edited")
    })
  }

  /* Event handlers for button clicks on a Review */

  static handleEdit(e) {
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

  static handleDelete(e) {
    const id = e.target.dataset.id;
    const review = e.target.parentNode.parentNode;

    Adapter.delete('reviews', id)

    review.parentNode.removeChild(review);
  }
}

class ReviewForm {
  static render() {
    const reviewForm = ReviewForm.initialize()

    const heading = document.createElement('h3')
    heading.innerText = "Your Voice Matters:"
    reviewForm.append(heading);

    const contentField = document.createElement("textarea");
    contentField.name = "content";
    contentField.placeholder = "Type your review here!";
    contentField.className = "form-control"
    reviewForm.append(contentField);

    reviewForm.append(RatingField.render())

    const submitButton = document.createElement("input")
    submitButton.type = "submit"
    submitButton.classList = "btn-default"
    submitButton.style.width = "auto"
    reviewForm.append(submitButton)
    reviewForm.addEventListener("submit", ReviewForm.handleSubmit)
    // ReviewForm.appendContentField(reviewForm)
    // ReviewForm.appendSubmitButton(reviewForm)
    return reviewForm
  }

  static initialize() {
    const reviewForm = document.createElement("form");
    reviewForm.id = "review-form";
    // reviewForm.className = "form"
    reviewForm.dataset.gifId = GIF_ID;
    reviewForm.dataset.userId = USER_ID;

    return reviewForm
  }

  static handleSubmit(e) {
    e.preventDefault();

    const rating = e.target.elements["rating"].value;
    const content = e.target.elements["content"].value;
    let postBody;

    if(e.target.dataset.reviewId) {
      const id = e.target.dataset.reviewId;
      delete e.target.dataset.reviewId;

      postBody = { rating, content };

      Review.updateAndRender(id, postBody);
    } else {
      const gif_id = e.target.dataset.gifId;
      const user_id = e.target.dataset.userId;
      postBody = { user_id, rating, content, gif_id };

      Review.createAndRender(postBody);
    }

    console.log(e.target)
    e.target.reset();
  }
}

class RatingField {
  static render() {
    let ratingField = document.createElement("select");
    ratingField.name = "rating";
    ratingField.className = "form-control"
    ratingField.style.width = "auto"
    // RatingField.appendOptions(ratingField)
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.defaultSelected = true;
    defaultOption.textContent = "Select a Rating";
    ratingField.append(defaultOption);

    for (let i = 5; i > 0; i--) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = ratingToStars(i);
      ratingField.append(option);
    }

    return ratingField
  }
}
