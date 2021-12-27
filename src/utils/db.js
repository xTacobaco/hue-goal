import fb from './config'
import 'firebase/firestore'

const db = fb.firestore()
const users = db.collection('users')

export { db, users }
