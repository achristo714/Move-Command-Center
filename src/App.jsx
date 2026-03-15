import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import BoxList from './pages/BoxList'
import AddBox from './pages/AddBox'
import BoxDetail from './pages/BoxDetail'
import RoomDashboard from './pages/RoomDashboard'
import RoomDetail from './pages/RoomDetail'
import SearchPage from './pages/SearchPage'
import Essentials from './pages/Essentials'
import UnpackingQueue from './pages/UnpackingQueue'
import PrintLabels from './pages/PrintLabels'
import MoverInstructions from './pages/MoverInstructions'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/boxes" element={<BoxList />} />
          <Route path="/boxes/new" element={<AddBox />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/rooms" element={<RoomDashboard />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/essentials" element={<Essentials />} />
          <Route path="/unpack" element={<UnpackingQueue />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Print pages - no layout */}
        <Route path="/labels" element={<PrintLabels />} />
        <Route path="/print/movers" element={<MoverInstructions />} />
      </Routes>
    </BrowserRouter>
  )
}
