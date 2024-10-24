import './App.css'
import { Route, Routes } from 'react-router-dom'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LogInPage from './pages/auth/login/LogInPage'
import HomePage from './pages/home/HomePage'

function App() {

  return (
    <div className='text-white'>
      <Routes>
        <Route path='/' element={<HomePage />}/>
        <Route path='/signup' element={<SignUpPage />}/>
        <Route path='/login' element={<LogInPage />}/>
      </Routes>
    </div>
  )
}

export default App
