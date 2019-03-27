const GIFS_ENDPOINT = "gifs"

class Gif {
  // constructor(data) {
  //   this.id = data.id
  //   this.title = data.title
  //   this.url = data.url
  //   this.reviews = data.reviews
  //   Gif.all.push(this);
  // }

  static renderThumbnail(data) {
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

  static renderAll() {
    document.getElementById("gif-list").innerHTML = "";

    return Adapter.get(GIFS_ENDPOINT)
      .then(data => data.forEach(Gif.renderThumbnail));
  }
}

// Gif.all = [];
