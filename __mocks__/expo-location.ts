// Mock expo-location
module.exports = {
  Accuracy: { BestForNavigation: 6 },
  ActivityType: { Fitness: 2 },
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  startLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: jest.fn(() => Promise.resolve()),
};
