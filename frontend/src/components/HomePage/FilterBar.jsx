import React, { useState } from 'react';
import './FilterBar.css'; // Importa o CSS para o design Glassmorphism da barra

// Estrutura de opções para os filtros (Mock Data)
const filterOptions = {
  materias: ['Todas', 'Matemática', 'História', 'Ciências', 'Linguagens'],
  serie: ['Todas', '1ºEF', '2ºEF'],
  tipos: ['Todos', 'Quiz', 'Aventura de Texto', 'Simulador', 'Lógica'],
  habilidade: ['Todas', 'Raciocínio Lógico', 'Interpretação', 'Cálculo', 'Análise Crítica'],
  descritor: ['Todos', 'D1 - Identificar', 'D2 - Aplicar', 'D3 - Avaliar'],
  
};

/**
 * Componente da barra de filtros, utilizando o design Glassmorphism.
 * @param {function} onFilterChange - Função (prop) a ser chamada quando os filtros mudarem.
 */
const FilterBar = ({ onFilterChange }) => {
  // Estado para armazenar os filtros selecionados
  const [filters, setFilters] = useState({
    materias: 'Todas',
    serie: 'Todas',
    tipos: 'Todos',
    habilidade: 'Todas',
    descritor: 'Todos',
  });

  // Função genérica para lidar com a mudança nos seletores
  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    
    // Atualiza o estado dos filtros
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));

    // (Opcional) Chama a função prop para avisar o componente pai (HomePage) sobre a mudança
    if (onFilterChange) {
      onFilterChange({ ...filters, [name]: value });
    }
  };

  return (
    // Aplica o estilo de vidro fosco (glass-bar)
    <div className="filter-bar glass-bar">
      
      {/* Mapeia as opções de filtro para criar os seletores */}
      {Object.keys(filterOptions).map((key) => (
        <div key={key} className="filter-group">
          {/* Capitaliza a primeira letra para o label */}
          <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
          
          <select
            name={key}
            id={key}
            value={filters[key]}
            onChange={handleSelectChange}
            className="glass-select" // Estilo de vidro no seletor
          >
            {filterOptions[key].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

      ))}
      <button className="glass-button filter-button" onClick={() => console.log('Filtros Aplicados:', filters)}>🔍</button>
      {/* Botão de busca moderno */}
    </div>
  );
};

export default FilterBar;