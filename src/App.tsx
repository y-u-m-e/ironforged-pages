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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EventsHome />} />
          <Route path="events" element={<EventsList />} />
          {/* Add more routes:
          <Route path="events/:eventId" element={<TileEvent />} />
          <Route path="guide" element={<TileEventsGuide />} />
          <Route path="admin" element={<TileEventAdmin />} />
          */}
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

