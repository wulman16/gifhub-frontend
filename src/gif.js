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
    li.className = "gif-thumbnail-card";

    const img = document.createElement("img");
    img.src = data.url;
    img.className = "gif-thumbnail";
    img.dataset.id = data.id;
    li.append(img);

    const info = document.createElement('div')
    info.id = "gif-thumbnail-text"

    const title = document.createElement('p')
    title.id = "gif-thumbnail-title"
    title.textContent = data.title
    info.append(title)

    const rating = document.createElement('p')
    rating.id = "gif-thumbnail-rating"
    rating.textContent = parseFloat(data.avg_rating).toFixed(1) + ' \u2605'
    info.append(rating)

    li.append(info)

    // const info = document.createElement("p")
    // info.id = "gif-thumbnail-text"
    // info.textContent = data.title + " "
    // li.append(info)

    // info.textContent += parseFloat(data.avg_rating).toFixed(1)

    ul.append(li);
  }

  static renderAll() {
    document.getElementById("gif-list").innerHTML = "";

    return Adapter.get(GIFS_ENDPOINT)
      .then(data => data.forEach(Gif.renderThumbnail));
  }
}

// Gif.all = [];
