import { VideoChat } from './components/Call/Call'
import { Route, Routes } from 'react-router'
import Home from './components/Home/Home'
import Navbar from './components/Navbar'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<VideoChat />} />
      </Routes>
    </div>
  )
}

export default App
