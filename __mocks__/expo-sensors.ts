// Mock expo-sensors
module.exports = {
  Barometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
};
