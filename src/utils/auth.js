import fb from './config'
import 'firebase/auth'

const auth = fb.auth()
const googleProvider = new fb.auth.GoogleAuthProvider()

export { auth, googleProvider }
