import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const urlApi = import.meta.env.VITE_API_URL;
  return (
    < main >
      <h1>MeuPlano.AI</h1>
      <p>Gerador de planos de aula com Inteligência Artificial.</p>
      <p><small>API configurada em: {urlApi}</small></p>
    </main>
  );
}
export default App
