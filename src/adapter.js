// const API = `http://localhost:3000/api/v1`;

class Adapter {
  static create(endpoint, data) {
    return fetch(`${API}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(response => response.json());
  }

  static get(endpoint) {
    return fetch(`${API}/${endpoint}`)
    .then(response => response.json());
  }
}
