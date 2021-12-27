import firebase from 'firebase/app'
import 'firebase/analytics'

firebase.initializeApp({
    apiKey: 'AIzaSyB2T3s6Y5i6XAYK42mG1CwkrIASVdrHQGQ',
    authDomain: 'hue-goal.firebaseapp.com',
    projectId: 'hue-goal',
    storageBucket: 'hue-goal.appspot.com',
    messagingSenderId: '382306850833',
    appId: '1:382306850833:web:620784da18ddc16e1379b0',
})

firebase.analytics()

export default firebase
