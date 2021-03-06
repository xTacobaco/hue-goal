import firebase from 'firebase/app'
import 'firebase/firestore'

const db = firebase
  .initializeApp({ projectId: 'hue-goal' })
  .firestore()

export default db