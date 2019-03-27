class Review {
  static renderAll() {
    const reviews = document.getElementById("reviews");
    reviews.innerHTML = "";

    renderReviewForm();

    Adapter.get("gifs", GIF_ID)
      .then(data => {
        // Sort by most recently updated review
        const sorted = data.reviews.sort((a,b) => {
          const dateA = new Date(a.updated_at);
          const dateB = new Date(b.updated_at);
          return (dateB - dateA);
        })

        sorted.forEach(renderReview);
      })
  }
}
