import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import MainPage from './pages/Main.page'
import './styles/slider.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MainPage />
    </BrowserRouter>
  </StrictMode>,
)
