import React from 'react';
// Importa o CSS para o design
import './HomePage.css'; 
// Importa o FilterBar (ajuste o caminho se necessário, ex: '../FilterBar/FilterBar')
import FilterBar from './FilterBar'; 
// Componente essencial para navegação do React Router
import { Link } from 'react-router-dom'; 

// Mock de dados para simular os últimos games publicados
const mockGames = [
  { 
    id: 5, // NOVO ID
    title: '🛠️ Criador de Sequência de Frases', 
    description: 'Crie seu próprio game de ordenação de frases. Payload pronto para o servidor!', 
    category: 'Ferramenta', // Nova Categoria
    path: '/creator/phrase-sequence' // Rota configurada no App.jsx
  },

  { 
    id: 4, 
    title: 'Organize o Parágrafo', 
    description: 'Arraste e solte frases para restaurar a ordem textual. Essencial para Coerência e Coesão!', 
    category: 'Linguagens',
    path: '/game/organize-paragraph' // URL para a rota
  },
  { 
    id: 1, 
    title: 'Quiz de História Mundial', 
    description: 'Teste seus conhecimentos sobre eventos cruciais.', 
    category: 'História', 
    path: '/game/quiz-historia' 
  },
  { 
    id: 2, 
    title: 'Aventura de Texto: Missão Ecologia', 
    description: 'Simulador de escolhas sobre sustentabilidade.', 
    category: 'Ciências', 
    path: '/game/missao-ecologia' 
  },
  { 
    id: 3, 
    title: 'Lógica: Sequência Numérica', 
    description: 'Organize os números e treine o raciocínio rápido.', 
    category: 'Matemática', 
    path: '/game/sequencia-numerica' 
  },
];

/**
 * Componente funcional para o Card de cada Jogo.
 * Recebe as props para exibir as informações e usa Link para navegação.
 * @param {string} title - Título do jogo.
 * @param {string} description - Descrição do jogo.
 * @param {string} category - Categoria do jogo.
 * @param {string} path - URL de destino.
 */
const GameCard = ({ title, description, category, path }) => {
  return (
    // Usa o componente Link para navegação. O Glassmorphism vai na classe.
    <Link to={path} className="game-card glass-element"> 
      <div className="card-header">
        <span className={`category-tag tag-${category.toLowerCase().split(' ')[0]}`}>{category}</span>
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {/* Usamos um span para o botão dentro do Link, mantendo o estilo */}
      <span className="glass-button">Jogar Agora (ES6+)</span>
    </Link>
  );
};

/**
 * Componente principal da Home Page, focado na seleção dos últimos games.
 */
const HomePage = () => {
  // Simplesmente para logar a mudança do FilterBar
  const handleFilterChange = (newFilters) => {
    console.log('Filtros atualizados:', newFilters);
  };

  return (
    <div className="homepage-container">
      <header className="header-glass">
        <h1>🚀 Code-Play | Seleção de Games</h1>
        <p>Aprender com estilo: Seus últimos desafios te esperam!</p>
      </header>

      {/* INTEGRAÇÃO DO FILTRO */}
      <FilterBar onFilterChange={handleFilterChange} />

      <main className="games-grid">
        {mockGames.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            category={game.category}
            path={game.path} // Passando a prop PATH
          />
        ))}
      </main>

      <footer className="footer-glass">
        <p>&copy; {new Date().getFullYear()} Code-Coach Dev | Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};


export default HomePage;