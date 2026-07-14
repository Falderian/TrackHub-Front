// Mock @react-native-async-storage/async-storage
const store = {};
module.exports = {
  __esModule: true,
  default: {
    getItem: jest.fn((k) => Promise.resolve(store[k] ?? null)),
    setItem: jest.fn((k, v) => { store[k] = v; return Promise.resolve(); }),
    removeItem: jest.fn((k) => { delete store[k]; return Promise.resolve(); }),
    multiRemove: jest.fn((keys) => { for (const k of keys) delete store[k]; return Promise.resolve(); }),
  },
};
