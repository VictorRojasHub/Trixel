import React, { useState, useCallback, useRef } from 'react';
import './PhraseSequenceCreator.css'; 
// Importando ícones para o Criador e para o Player
import { 
    IoAddCircle, 
    IoTrash, 
    IoCheckmarkCircle, 
    IoCloseCircle, 
    IoSyncCircle 
} from 'react-icons/io5'; 

const MAX_PHRASES = 10; 

// --- FUNÇÕES UTILITÁRIAS ES6+ ---

// Algoritmo de Fisher-Yates para embaralhar palavras
const shuffleWords = (sentence) => {
    // Separa por espaços, mantendo a pontuação na palavra
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    const newWords = [...words];
    let currentIndex = newWords.length, randomIndex;
    
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newWords[currentIndex], newWords[randomIndex]] = [
            newWords[randomIndex], newWords[currentIndex]
        ];
    }
    return newWords;
};

// --- SUB-COMPONENTE: Linha de Input do Criador ---

const PhraseInput = ({ index, text, totalPhrases, onUpdate, onDelete }) => {
    const canDelete = index > 0;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="phrase-input-group" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <label htmlFor={`phrase-${index}`}>Frase {index + 1}:</label>
            <input
                id={`phrase-${index}`}
                type="text"
                className="glass-input"
                value={text}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={index === 0 ? "Começo da sequência..." : "Próxima frase..."}
            />

            {canDelete && isHovered && (
                <button 
                    className="delete-button" 
                    onClick={() => onDelete(index)}
                    title="Deletar esta frase"
                >
                    <IoTrash size={20} />
                </button>
            )}
        </div>
    );
};


// --- SUB-COMPONENTE: Lógica do Jogo (Player) ---

const GamePlayer = ({ phrasesToPlay, onBackToCreator }) => {
    // ESTADO DO JOGO
    const [currentStep, setCurrentStep] = useState(0); 
    const [wordOrder, setWordOrder] = useState(() => shuffleWords(phrasesToPlay[0]));
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const dragItem = useRef(null);

    // Palavras Corretas para a frase atual
    const correctSentence = phrasesToPlay[currentStep] || '';
    const correctWords = correctSentence.split(/\s+/).filter(w => w.length > 0);

    // Lógica Drag and Drop
    const handleWordDrop = useCallback((e, targetIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('word-drop-hover');

        const draggedIndex = dragItem.current;
        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const newWords = [...wordOrder];
            const [movedWord] = newWords.splice(draggedIndex, 1);
            newWords.splice(targetIndex, 0, movedWord);
            setWordOrder(newWords);
            setFeedback({ message: '', type: '' });
        }
    }, [wordOrder]);

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.currentTarget.classList.add('word-drop-hover');
    };
    
    // Checagem de Ordem e Pontuação
    const checkOrder = () => {
        // Junta as palavras com espaço e compara (case-insensitive e sem pontuação para ser mais tolerante)
        const currentSentenceClean = wordOrder.join(' ').toLowerCase().replace(/[.,!?;]/g, '');
        const correctSentenceClean = correctWords.join(' ').toLowerCase().replace(/[.,!?;]/g, '');

        const isCorrect = currentSentenceClean === correctSentenceClean;
        
        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback({ message: '✨ Ordem Perfeita! Clique em "Próxima Frase".', type: 'correto' });
        } else {
            setFeedback({ message: 'Tente novamente! A ordem das palavras não está correta.', type: 'incorreto' });
        }
    };
    
    // Avançar para a próxima frase
    const nextPhrase = () => {
        if (currentStep < phrasesToPlay.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            setWordOrder(shuffleWords(phrasesToPlay[nextStep]));
            setFeedback({ message: '', type: '' });
        } else {
            // Fim do Jogo
            setFeedback({ message: `🏆 Fim do Jogo! Sua pontuação final é ${score}/${phrasesToPlay.length}`, type: 'final' });
            setCurrentStep(phrasesToPlay.length); // Mudar para um estado final
        }
    };
    
    // Renderização final (Fim do Jogo)
    if (currentStep >= phrasesToPlay.length) {
        return (
            <div className="final-screen">
                <h2>Fim da Sequência!</h2>
                <p>Sua pontuação final: <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{score}</span> de {phrasesToPlay.length}</p>
                <div style={{marginTop: '20px'}}>
                    <button className="glass-button check-button" onClick={() => window.location.reload()}>
                        <IoSyncCircle size={20} style={{verticalAlign: 'middle', marginRight: '5px'}} />
                        Reiniciar Tudo
                    </button>
                    <button className="glass-button" onClick={onBackToCreator}>
                        &lt; Voltar para o Editor
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        // Usando as classes de estilo do player que definimos antes
        <>
            <h2 className="player-title">🧩 Monte a Frase Certa</h2>
            
            <div className="score-area">
                <span>Frase {currentStep + 1} de {phrasesToPlay.length}</span>
                <span>Pontuação: {score}</span>
            </div>

            <p className="instruction">Arraste as palavras para formar a frase correta:</p>
            
            <div 
                className="words-sequence"
                onDragOver={(e) => e.preventDefault()}
            >
                {wordOrder.map((word, index) => (
                    <span
                        key={word + index} 
                        className="word-item"
                        draggable="true"
                        onDragStart={(e) => { dragItem.current = index; e.currentTarget.classList.add('dragging'); }}
                        onDragEnd={(e) => { dragItem.current = null; e.currentTarget.classList.remove('dragging'); }}
                        onDrop={(e) => handleWordDrop(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={(e) => e.currentTarget.classList.remove('word-drop-hover')}
                    >
                        {word}
                    </span>
                ))}
            </div>

            <div className="player-buttons">
                <button className="glass-button check-button" onClick={checkOrder}>
                    Verificar Ordem
                </button>
                <button 
                    className="glass-button next-button" 
                    onClick={nextPhrase}
                    disabled={feedback.type !== 'correto' && feedback.type !== 'final'}
                >
                   Próxima Frase &gt;
                </button>
            </div>
            
            {feedback.message && (
                <div className={`feedback-box ${feedback.type}`}>
                    {feedback.type === 'correto' ? <IoCheckmarkCircle size={20} /> : <IoCloseCircle size={20} />}
                    {feedback.message}
                </div>
            )}
        </>
    );
};

// --- COMPONENTE PRINCIPAL: CONTROLADOR DE ESTADO ---

const PhraseSequenceCreator = () => {
    // Começa com uma frase de exemplo para facilitar o teste
    const [phrases, setPhrases] = useState([
        "React é uma biblioteca JavaScript para construir interfaces de usuário.", 
        "Ele usa componentes reutilizáveis para gerenciar o estado.", 
        "O aprendizado com Hooks tornou o desenvolvimento mais eficiente."
    ]); 
    // Estado para alternar entre as telas
    const [isGameReady, setIsGameReady] = useState(false);
    
    // Funções de Gerenciamento do Array de Frases
    const handleAddPhrase = useCallback(() => {
        if (phrases.length < MAX_PHRASES) {
            setPhrases(prevPhrases => [...prevPhrases, '']);
        } else {
            alert(`Limite máximo de ${MAX_PHRASES} frases atingido!`);
        }
    }, [phrases.length]);

    const handleUpdatePhrase = useCallback((index, text) => {
        setPhrases(prevPhrases => {
            const newPhrases = [...prevPhrases];
            newPhrases[index] = text;
            return newPhrases;
        });
    }, []);

    const handleDeletePhrase = useCallback((index) => {
        if (phrases.length > 1) {
            setPhrases(prevPhrases => prevPhrases.filter((_, i) => i !== index));
        }
    }, [phrases.length]);

    // Ação principal: Validar e Mudar para a tela de Jogo
    const handleGenerateGame = () => {
        const phrasesToPlay = phrases.filter(p => p.trim() !== '');

        if (phrasesToPlay.length < 2) {
            alert('Por favor, adicione pelo menos 2 frases válidas antes de embaralhar.');
            return;
        }

        // Salva o payload limpo no estado e muda a tela
        setPhrases(phrasesToPlay);
        setIsGameReady(true);
    };

    // Ação de Voltar para o Criador
    const handleBackToCreator = () => {
        setIsGameReady(false);
    };

    return (
        <div className="editor-card-glass">
            
            {!isGameReady ? (
                // --- VISÃO DO CRIADOR (Professor) ---
                <>
                    <h1 className="editor-title">🛠️ Criador de Sequência de Frases</h1>
                    <p className="editor-subtitle">Defina a ordem correta que será usada no jogo.</p>

                    <div className="phrases-list">
                        {phrases.map((phraseText, index) => (
                            <PhraseInput
                                key={index} 
                                index={index}
                                text={phraseText}
                                totalPhrases={phrases.length}
                                onUpdate={handleUpdatePhrase}
                                onDelete={handleDeletePhrase}
                            />
                        ))}
                    </div>

                    <div className="add-phrase-area">
                        <p>Adicionar Frase ({phrases.length}/{MAX_PHRASES})</p>
                        <button 
                            className={`add-button ${phrases.length >= MAX_PHRASES ? 'disabled' : ''}`}
                            onClick={handleAddPhrase}
                            disabled={phrases.length >= MAX_PHRASES}
                        >
                            <IoAddCircle size={24} />
                        </button>
                    </div>
                    
                    <div className="embaralhar-area">
                        <button className="embaralhar-button glass-button" onClick={handleGenerateGame}>
                            &gt; Embaralhar e Gerar Game
                        </button>
                    </div>
                </>
            ) : (
                // --- VISÃO DO JOGO (Aluno) ---
                <>
                    <GamePlayer 
                        phrasesToPlay={phrases} 
                        onBackToCreator={handleBackToCreator}
                    />
                    
                    {/* Botão de Voltar para Edição (só aparece no modo Player) */}
                    <div style={{textAlign: 'center', marginTop: '20px'}}>
                        <button 
                            className="glass-button" 
                            style={{backgroundColor: '#ccc', color: 'var(--color-text-dark)', border: 'none'}}
                            onClick={handleBackToCreator}
                        >
                            &lt; Voltar para Editar Sequência
                        </button>
                    </div>
                </>
            )}

        </div>
    );
};

export default PhraseSequenceCreator;