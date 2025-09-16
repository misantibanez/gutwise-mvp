// Simple service worker for handling notification actions
self.addEventListener('notificationclick', function(event) {
  const action = event.action;
  const notification = event.notification;
  
  // Close the notification
  notification.close();
  
  // Handle different actions
  if (action === 'choose-restaurant') {
    // Open the app and navigate to restaurants
    event.waitUntil(
      clients.openWindow('/?navigate=restaurants')
    );
  } else if (action === 'dismiss') {
    // Just close the notification - dismissal is handled in the main app
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  
  // Send message to main app
  event.waitUntil(
    self.clients.matchAll().then(function(clientList) {
      clientList.forEach(function(client) {
        client.postMessage({
          type: 'notification-action',
          action: action || 'click'
        });
      });
    })
  );
});

// Basic service worker install/fetch events
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});