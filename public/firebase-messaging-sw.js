/* global importScripts, firebase */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyA91_N7nrEWsm12e8XBd7xpKqbOpX4pLB4",
    authDomain: "bizo-f2187.firebaseapp.com",
    projectId: "bizo-f2187",
    storageBucket: "bizo-f2187.firebasestorage.app",
    messagingSenderId: "733271569706",
    appId: "1:733271569706:web:7bd34a264cbc2bbefb5a53",
    measurementId: "G-HN9GS5WPSJ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};

    self.registration.showNotification(notification.title || "Bizo", {
        body: notification.body || "Notification reçue",
        data: payload.data || {},
    });
});
