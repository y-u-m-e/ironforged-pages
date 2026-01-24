/**
 * =============================================================================
 * IRONFORGED EVENTS - Tile Events Application
 * =============================================================================
 * 
 * Dedicated app for tile events
 * - Production: ironforged.gg
 * - Staging: ironforged.staging.emuy.gg
 * 
 * @author Yume Tools Team
 */

import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'

// Pages
import EventsHome from '@/pages/EventsHome'
import EventsList from '@/pages/EventsList'
import TileEvent from '@/pages/TileEvent'
import TileEvents from '@/pages/TileEvents'
import TileEventAdmin from '@/pages/TileEventAdmin'
import TileEventsGuide from '@/pages/TileEventsGuide'
import TileEventsAdminGuide from '@/pages/TileEventsAdminGuide'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EventsHome />} />
          <Route path="events" element={<EventsList />} />
          <Route path="tile-events" element={<TileEvents />} />
          <Route path="tile-events/:eventId" element={<TileEvent />} />
          <Route path="tile-events/:eventId/admin" element={<TileEventAdmin />} />
          <Route path="guide" element={<TileEventsGuide />} />
          <Route path="admin-guide" element={<TileEventsAdminGuide />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
