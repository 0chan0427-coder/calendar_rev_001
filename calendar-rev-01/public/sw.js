// public/sw.js
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: '알림', body: '새로운 소식이 있습니다.' };

  const options = {
    body: data.body,
    icon: '/calendar icon.png', // 사용할 아이콘 경로
    badge: '/calendar icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림을 클릭했을 때 앱 창을 열거나 포커스하는 이벤트
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
