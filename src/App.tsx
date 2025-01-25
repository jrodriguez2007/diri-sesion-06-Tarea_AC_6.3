import { useState } from 'react'
import reactLogo from './assets/react.svg'
import ErrorBoundary from '../src/ui/components/ErrorBoundaryComponent';
import ImageTranslatePage from './ui/pages/ImageTranslatePage';

function App() {

  const [resetKey, setResetKey] = useState<number>(0); // Estado para resetear el componente
  const forbiddenWords = ["cat", "coffee", "sun", "apple", "horse"];

  const resetPage = () => {
    setResetKey(prevKey => prevKey + 1); // Cambiar la clave para forzar el re-render        
};   

  return (
    <div className="App">
      <ErrorBoundary key={resetKey} fallback={
                        <div className="container text-center mt-5">
                            <h1>Ha ocurrido un error</h1>
                            <p>La traducción obtuvo una de las siguientes palabras prohibidas:</p>
                            <ul>
                              {forbiddenWords.map((word, index) => (
                                  <li key={index}>{word}</li>
                              ))}
                          </ul>
                            <button className="btn btn-primary" onClick={resetPage}>
                                Reintentar
                            </button>
                        </div>
                    }>
        <ImageTranslatePage key={resetKey} // Usamos el resetKey para forzar la recarga 
                            forbiddenWords={forbiddenWords} />
      </ErrorBoundary>
    </div>
  )
}

export default App
