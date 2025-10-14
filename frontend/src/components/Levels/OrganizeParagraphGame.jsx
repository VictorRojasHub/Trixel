import React, { useState, useRef, useCallback } from 'react';
import './OrganizeParagraphGame.css';

// Algoritmo de Fisher-Yates para embaralhar
const shuffle = (array) => {
    const newArray = [...array];
    let currentIndex = newArray.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [
            newArray[randomIndex], newArray[currentIndex]
        ];
    }
    return newArray;
};

// Dados mockados para exemplo
const EXAMPLE_TEXT = "A Terra é o terceiro planeta do Sistema Solar. Ela é o único planeta conhecido a abrigar vida. A maior parte de sua superfície é coberta por água. Gira em torno do Sol em um período de cerca de 365 dias.";

const OrganizeParagraphGame = () => {
    // Estados do Jogo
    const [inputText, setInputText] = useState(EXAMPLE_TEXT);
    const [originalPhrases, setOriginalPhrases] = useState([]);
    const [shuffledPhrases, setShuffledPhrases] = useState([]);
    const [gameState, setGameState] = useState('input'); // 'input' | 'playing' | 'checking'
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Referência para o item que está sendo arrastado
    const dragItem = useRef(null);

    // 1. Lógica para Iniciar / Reiniciar o Jogo
    const startGame = useCallback((text) => {
        const currentText = text.trim();

        if (currentText.length < 20) {
            setFeedback({ message: 'Por favor, cole um parágrafo maior para começar o jogo.', type: 'incorreto' });
            setGameState('input');
            return;
        }

        // Divide o texto em frases (períodos) - Regex (lookbehind) ES6+
        const correctPhrases = currentText.split(/(?<=[.?!])\s+/).filter(f => f.length > 0);

        if (correctPhrases.length < 2) {
            setFeedback({ message: 'O parágrafo precisa ter pelo menos 2 frases.', type: 'incorreto' });
            setGameState('input');
            return;
        }

        const initialShuffledPhrases = shuffle(correctPhrases);

        setOriginalPhrases(correctPhrases);
        setShuffledPhrases(initialShuffledPhrases);
        setFeedback({ message: '', type: '' });
        setGameState('playing');
        setInputText(currentText); // Garante que o texto original está salvo para Reiniciar
    }, []);

    // 2. Lógica para Drag and Drop (Gerencia a Ordem no estado)
    const handleDragStart = (e, index) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('dragging');
        // Limpa a indicação visual de drop target
        document.querySelectorAll('.frase-item').forEach(el => el.classList.remove('drop-target-hover'));
        dragItem.current = null;
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drop-target-hover');

        const draggedIndex = dragItem.current;

        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const newPhrases = [...shuffledPhrases];
            
            // Remove o item arrastado
            const [movedPhrase] = newPhrases.splice(draggedIndex, 1);
            
            // Adiciona-o de volta na nova posição
            // O targetIndex aponta para o item sobre o qual o drop ocorreu
            newPhrases.splice(targetIndex, 0, movedPhrase);

            setShuffledPhrases(newPhrases);
            dragItem.current = targetIndex; // Atualiza a referência para o item que moveu (para evitar bugs de re-arraste imediato)
        }
        setFeedback({ message: '', type: '' }); // Limpa o feedback ao mover
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        // Lógica visual para indicar onde o drop vai ocorrer
        const element = e.currentTarget;
        const rect = element.getBoundingClientRect();
        const isBefore = e.clientY < rect.top + rect.height / 2;

        document.querySelectorAll('.frase-item').forEach(el => el.classList.remove('drop-target-hover'));
        
        if (dragItem.current !== index) {
            element.classList.add('drop-target-hover');
        }
    };
    
    // 3. Lógica de Verificação
    const checkOrder = () => {
        const isCorrect = originalPhrases.every((phrase, index) => phrase === shuffledPhrases[index]);

        if (isCorrect) {
            setFeedback({ message: '🥳 Parabéns! O parágrafo está perfeito!', type: 'correto' });
        } else {
            setFeedback({ message: '😔 A ordem ainda está incorreta. Tente novamente!', type: 'incorreto' });
        }
        setGameState('checking');
    };

    // 4. Lógica de Reiniciar (Embaralha de novo o texto original)
    const resetGame = () => {
        if (originalPhrases.length > 0) {
            const reShuffled = shuffle(originalPhrases);
            setShuffledPhrases(reShuffled);
            setFeedback({ message: '', type: '' });
            setGameState('playing');
        }
    };

    return (
        <div className="game-card-glass">
            <h1 className="game-title">📝 Organize o Parágrafo!</h1>
            
            {/* ÁREA DE INPUT (gameState === 'input') */}
            {gameState === 'input' && (
                <div id="input-area">
                    <p>1. Cole seu parágrafo completo abaixo:</p>
                    <textarea
                        className="glass-textarea"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Cole aqui um parágrafo com vários períodos."
                    />
                    <div style={{ textAlign: 'center' }}>
                        <button 
                            className="glass-button" 
                            style={{ backgroundColor: 'var(--color-accent-green)' }}
                            onClick={() => startGame(inputText)}
                        >
                            Embaralhar e Jogar!
                        </button>
                    </div>
                </div>
            )}

            {/* ÁREA DE JOGO (gameState !== 'input') */}
            {gameState !== 'input' && (
                <div id="game-area">
                    <p>2. Arraste e solte os períodos para formar o parágrafo original:</p>
                    
                    {/* Contêiner Drag and Drop */}
                    <div 
                        className="frases-container-glass"
                        // O onDrop e onDragOver aqui capturam o drop se não cair em outra frase (para o fim da lista)
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {shuffledPhrases.map((frase, index) => (
                            <div
                                key={frase + index} // Key deve ser único e estável
                                className="frase-item"
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={(e) => e.currentTarget.classList.remove('drop-target-hover')}
                            >
                                {frase}
                            </div>
                        ))}
                    </div>

                    <div className="botoes-jogo" style={{ textAlign: 'center' }}>
                        <button 
                            className="glass-button" 
                            style={{ backgroundColor: 'var(--color-accent-blue)', marginRight: '10px' }}
                            onClick={checkOrder}
                        >
                            Verificar Ordem
                        </button>
                        <button 
                            className="glass-button" 
                            style={{ backgroundColor: 'var(--color-accent-orange)' }}
                            onClick={resetGame}
                        >
                            Reiniciar Jogo (Embaralhar)
                        </button>
                    </div>

                    {feedback.message && (
                        <div className={`feedback-box ${feedback.type}`}>
                            {feedback.message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrganizeParagraphGame;