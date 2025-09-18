import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HoldingsPage from './pages/HoldingsPage'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/holdings/:guru" element={<HoldingsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
