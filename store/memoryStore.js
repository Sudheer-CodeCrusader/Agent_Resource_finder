const store = {};
export default {
  set: (id, data) => { store[id] = data; },
  get: (id) => store[id]
}; 