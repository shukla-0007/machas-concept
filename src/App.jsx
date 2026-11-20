import './three/ArtMaterial'
import Hero from './components/Hero'
import Roster from './components/Roster'
import ArtistPanel from './components/ArtistPanel'
import { Loader, Cursor, Nav } from './components/Chrome'
import { Statement, Services, Cases, Clients, Contact } from './components/Sections'

export default function App() {
  return (
    <>
      <Loader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Roster />
        <Services />
        <Cases />
        <Clients />
      </main>
      <Contact />
      <ArtistPanel />
      <div className="grain" aria-hidden />
      <div className="sample-mark" aria-label="Sample concept by Ayush Shukla">
        <span>Sample concept</span>
        <i />
        <span>
          by <em>Ayush Shukla</em>
        </span>
      </div>
    </>
  )
}
