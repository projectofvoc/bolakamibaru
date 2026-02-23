self.addEventListener('push', function(e) {
  var d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'Notification', {
    body: d.body || '', icon: d.icon || '/favicon.ico',
    data: { url: d.url || '/' }, vibrate: [200, 100, 200]
  }));
});
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || '/'));
});