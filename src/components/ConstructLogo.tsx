import { pickRandom } from '../libraries/utils'
import c1 from '../assets/construct1.png'
import c2 from '../assets/construct2.png'
import c3 from '../assets/construct3.png'
import { useNavigate } from 'react-router-dom'

const holograms = [c1, c2, c3]

export const ConstructLogo = () => {
  const navigate = useNavigate()
  const goHome = () => {
    navigate('/')
  }
  return (
    <svg onClick={goHome} id="construct-logo" xmlns="http://www.w3.org/2000/svg" viewBox="120 95 260 210" style={{cursor:"pointer"}}>
        <g id="Wireframe_Cyberspace" data-name="Wireframe Cyberspace">
            <line x1="125" y1="100" x2="375" y2="100" />
            <line x1="125" y1="100" x2="250" y2="300" />
            <line x1="375" y1="100" x2="250" y2="300" />
            <line x1="125" y1="100" x2="250" y2="200" />
            <line x1="250" y1="200" x2="375" y2="100" />
            <line x1="250" y1="200" x2="250" y2="300" />
        </g>
    </svg>
  )
}

export const ConstructHolo = () => {
  const holo = pickRandom(holograms)
  return (
    <img id="construct-holo" src={holo} alt="construct hologram" />
  ) 
}