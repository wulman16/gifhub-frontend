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

    return content;
  }

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

  static updateAndRender(postBody) {
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
}

class ReviewForm {
  static render() {
    const reviewForm = ReviewForm.initialize()
    // const ratingField = RatingField.initialize()

    reviewForm.append(RatingField.render())

    const contentField = document.createElement("textarea");
    contentField.name = "content";
    contentField.placeholder = "Type your review here!";
    reviewForm.append(contentField);

    const submitButton = document.createElement("input")
    submitButton.type = "submit"
    reviewForm.append(submitButton)
    reviewForm.addEventListener("submit", handleReviewSubmission)
    // ReviewForm.appendContentField(reviewForm)
    // ReviewForm.appendSubmitButton(reviewForm)
    return reviewForm
  }

  static initialize() {
    const reviewForm = document.createElement("form");
    reviewForm.id = "review-form";
    reviewForm.dataset.gifId = GIF_ID;
    reviewForm.dataset.userId = USER_ID;

    return reviewForm
  }
}

class RatingField {
  static render() {
    let ratingField = document.createElement("select");
    ratingField.name = "rating";
    // RatingField.appendOptions(ratingField)
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.selected = true;
    defaultOption.disabled = true;
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
