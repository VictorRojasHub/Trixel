import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Importar as Páginas/Games
// ATENÇÃO: Verifique se este caminho está 100% correto!
import HomePage from './components/HomePage/HomePage'; 
import OrganizeParagraphGame from './components/Levels/OrganizeParagraphGame'; 
import PhraseSequenceCreator from './components/Levels/PhraseSequenceCreator'; 

function App() {
  return (
    // O Router deve envolver toda a sua aplicação
    <Router>
      <div className="App">
        {/* O 'Routes' gerencia as rotas */}
        <Routes>
          
          {/* Rota 1: HOME PAGE (path='/') */}
          <Route path="/" element={<HomePage />} />
          
          {/* Rota 2: NOVO JOGO */}
          <Route 
            path="/game/organize-paragraph" 
            element={<OrganizeParagraphGame />} 
          />

          {/* NOVO: Rota para o Criador de Sequência de Frases */}
          <Route 
            path="/creator/phrase-sequence" 
            element={<PhraseSequenceCreator />} 
          />
          
          {/* Se a Home Page sumiu, o problema está quase sempre aqui:
              ou o "path" está errado, ou o "element" está com o nome errado. */}
              
        </Routes>
      </div>
    </Router>
  );
}

export default App;