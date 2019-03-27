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

  static get(endpoint, id=null) {
    const path = id ? `${API}/${endpoint}/${id}` : `${API}/${endpoint}`

    return fetch(path)
    .then(response => response.json());
  }

  static update(endpoint, id, data) {
    return fetch(`${API}/${endpoint}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
  }
}
