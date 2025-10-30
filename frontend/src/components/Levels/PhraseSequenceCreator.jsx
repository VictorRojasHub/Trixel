import React, { useState, useCallback, useRef } from 'react';
import './PhraseSequenceCreator.css'; 
import { 
    IoAddCircle, 
    IoTrash, 
    IoCheckmarkCircle, 
    IoCloseCircle, 
    IoSyncCircle 
} from 'react-icons/io5'; 

const MAX_PHRASES = 10; 

// --- FUNÇÕES UTILITÁRIAS ES6+ ---
const splitWordsWithPunctuation = (sentence) => {
    return sentence.match(/\S+\s*/g) || [];
};

const shuffleWords = (sentence) => {
    const words = splitWordsWithPunctuation(sentence);
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

const useAutoResizeTextarea = (textareaRef, text) => {
    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // 1. Reseta a altura para que a rolagem seja recalculada
            textarea.style.height = 'auto'; 
            
            // 2. Define a nova altura com base no conteúdo (scrollHeight)
            // O scrollHeight é a altura total do conteúdo
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [textareaRef, text]); // Recalcula quando o texto muda
};

// --- SUB-COMPONENTE: Linha de Input do Criador ---

const PhraseInput = ({ index, text, totalPhrases, onUpdate, onDelete }) => {
    const canDelete = index > 0;
    const [isHovered, setIsHovered] = useState(false);
    const textareaRef = useRef(null); // Referência para o textarea
    
    // ATIVAÇÃO DO HOOK: Controla o redimensionamento
    useAutoResizeTextarea(textareaRef, text);

    return (
        <div 
            className="phrase-input-group" 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Label e Textarea em sequência de blocos */}
            <label htmlFor={`phrase-${index}`}>Frase {index + 1}:</label>
            
            <textarea
                id={`phrase-${index}`}
                className="glass-textarea" 
                rows="3" 
                value={text}
                onChange={(e) => onUpdate(index, e.target.value)}
                placeholder={index === 0 ? "Começo da sequência..." : "Próxima frase..."}
            />

            {canDelete && isHovered && (
                <button 
                    className="delete-button glass-button"
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
    // 1. ESTADOS E REFERÊNCIAS
    const [currentStep, setCurrentStep] = useState(0); 
    const [wordOrder, setWordOrder] = useState(() => shuffleWords(phrasesToPlay[0]));
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    
    const dragItem = useRef(null);
    const touchTarget = useRef(null); 
    const touchOffset = useRef({ x: 0, y: 0 }); 
    const initialTransform = useRef({ x: 0, y: 0 }); // Guarda a posição inicial dentro do container
    
    const correctSentence = phrasesToPlay[currentStep] || '';
    const correctWords = splitWordsWithPunctuation(correctSentence).map(w => w.trim());
    
    React.useEffect(() => {
        if (currentStep < phrasesToPlay.length) {
            setWordOrder(shuffleWords(phrasesToPlay[currentStep]));
            setFeedback({ message: '', type: '' });
        }
    }, [currentStep, phrasesToPlay]);

    // --- 2. FUNÇÕES AUXILIARES DE TOQUE E DROP (TOUCH/DRAG) ---
    
    const findTargetIndex = useCallback((x, y) => {
        const wordsContainer = document.querySelector('.words-sequence');
        if (!wordsContainer) return -1;

        const children = Array.from(wordsContainer.children);
        let closestIndex = -1;
        let minDistance = Infinity;

        children.forEach((child, index) => {
            if (touchTarget.current === child && touchTarget.current.classList.contains('dragging')) return;

            const rect = child.getBoundingClientRect();
            
            if (y > rect.top && y < rect.bottom) {
                const center = rect.left + rect.width / 2;
                const distance = Math.abs(x - center);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            }
        });
        
        if (closestIndex === -1 && children.length > 0) {
            const lastRect = children[children.length - 1].getBoundingClientRect();
            if (x > lastRect.right) {
                return children.length; 
            }
        }
        
        return closestIndex;
    }, []);
    
    const reorganizeWords = useCallback((draggedIndex, targetIndex) => {
        if (draggedIndex === null || draggedIndex === -1 || targetIndex === -1) return;
        
        const newWords = [...wordOrder];
        const [movedWord] = newWords.splice(draggedIndex, 1);
        
        const insertIndex = draggedIndex < targetIndex ? targetIndex -1 : targetIndex;

        newWords.splice(insertIndex, 0, movedWord);
        
        setWordOrder(newWords);
        setFeedback({ message: '', type: '' });
    }, [wordOrder]);


    // --- EVENTOS DE TOQUE (CORREÇÃO FINAL) ---

    const handleTouchStart = (e, index) => {
        e.preventDefault(); 
        
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();

        // 1. Calcular o OFFSET (distância do toque para o canto do elemento)
        touchOffset.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
        
        // 2. Calcular a posição inicial do elemento em relação ao container pai
        const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
        
        initialTransform.current = {
            x: rect.left - parentRect.left, 
            y: rect.top - parentRect.top,   
        };

        dragItem.current = index;
        touchTarget.current = e.currentTarget;
        
        e.currentTarget.classList.add('dragging');
        
        // MUDANÇA: Usar position: absolute
        e.currentTarget.style.position = 'absolute'; 
        e.currentTarget.style.zIndex = '1000';

        // 3. Aplica o transform inicial
        e.currentTarget.style.transform = `translate(${initialTransform.current.x}px, ${initialTransform.current.y}px)`;
    };

    const handleTouchMove = (e) => { 
        if (!touchTarget.current) return;
        
        e.preventDefault(); 

        const touch = e.touches[0];
        const offset = touchOffset.current;
        
        // Posição do container pai
        const parentRect = touchTarget.current.parentElement.getBoundingClientRect();
        
        // Posição do dedo em relação ao *canto superior esquerdo do container pai*
        const touchXRelativeToParent = touch.clientX - parentRect.left;
        const touchYRelativeToParent = touch.clientY - parentRect.top;

        // CÁLCULO FINAL:
        const x = touchXRelativeToParent - offset.x; 
        const y = touchYRelativeToParent - offset.y; 
        
        touchTarget.current.style.transform = `translate(${x}px, ${y}px)`;
        
        // Feedback visual
        const targetIndex = findTargetIndex(touch.clientX, touch.clientY); 
        document.querySelectorAll('.word-item').forEach(el => el.classList.remove('word-drop-hover'));
        
        if (targetIndex !== -1 && targetIndex !== dragItem.current) {
            const targetElement = document.querySelector(`.words-sequence .word-item:nth-child(${targetIndex + 1})`);
            if (targetElement) {
                 targetElement.classList.add('word-drop-hover');
            }
        } 
    };

    const handleTouchEnd = (e) => {
        if (!touchTarget.current) return;

        const touchY = e.changedTouches[0].clientY;
        const touchX = e.changedTouches[0].clientX;
        const targetIndex = findTargetIndex(touchX, touchY);
        
        // Limpeza (essencial)
        touchTarget.current.classList.remove('dragging');
        touchTarget.current.style.position = ''; 
        touchTarget.current.style.transform = ''; 
        touchTarget.current.style.zIndex = '';
        
        document.querySelectorAll('.word-item').forEach(el => el.classList.remove('word-drop-hover'));

        reorganizeWords(dragItem.current, targetIndex);
        
        dragItem.current = null;
        touchTarget.current = null;
    };


    // --- EVENTOS DE MOUSE E LÓGICA DE JOGO (Mantidos) ---
    const handleWordDrop = (e, targetIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('word-drop-hover');
        reorganizeWords(dragItem.current, targetIndex);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const checkOrder = () => {
        const currentWords = wordOrder.map(w => w.trim());
        const isCorrect = currentWords.every((word, index) => word === correctWords[index]);

        if (isCorrect) {
            setFeedback({ message: 'Parabéns! Ordem correta!', type: 'correto' });
            setScore(prevScore => prevScore + 1);
        } else {
            setFeedback({ message: 'Ops! A ordem ainda não está correta.', type: 'errado' });
        }
    };
    
    const nextPhrase = () => {
        if (currentStep < phrasesToPlay.length - 1) {
            setCurrentStep(prevStep => prevStep + 1);
        } else {
            setFeedback({ message: 'Você completou todas as frases!', type: 'final' });
            setCurrentStep(phrasesToPlay.length);
        }
    };
    
    // --- 3. RENDERIZAÇÃO (JSX) ---
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
                    <button className="glass-button" onClick={onBackToCreator} style={{marginLeft: '10px'}}>
                        &lt; Voltar para o Editor
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <h2 className="player-title">🧩 Monte a Frase Certa</h2>
            
            <div className="score-area">
                <span>Frase {currentStep + 1} de {phrasesToPlay.length}</span>
                <span>Pontuação: {score}</span>
            </div>

            <p className="instruction">Arraste as palavras para formar a frase correta:</p>
            
            <div 
                className="words-sequence"
                onDragOver={handleDragOver} 
            >
                {wordOrder.map((word, index) => (
                    <span
                        key={word + index} 
                        className="word-item glass-item"
                        draggable="true"
                        
                        onDragStart={(e) => { 
                            dragItem.current = index; 
                            e.currentTarget.classList.add('dragging'); 
                            e.dataTransfer.setData('text/plain', ''); 
                        }}
                        onDragEnd={(e) => { 
                            dragItem.current = null; 
                            e.currentTarget.classList.remove('dragging'); 
                        }}
                        onDrop={(e) => handleWordDrop(e, index)}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('word-drop-hover'); }}
                        onDragLeave={(e) => e.currentTarget.classList.remove('word-drop-hover')}
                        
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={handleTouchMove} 
                        onTouchEnd={handleTouchEnd} 
                    >
                        {word}
                    </span>
                ))}
            </div>

            <div className="player-buttons">
                <button className="glass-button check-button" onClick={checkOrder}>
                    <IoCheckmarkCircle size={20} /> Verificar Ordem
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
                <div className={`feedback-box glass-item ${feedback.type}`}>
                    {feedback.type === 'correto' ? <IoCheckmarkCircle size={20} /> : <IoCloseCircle size={20} />}
                    {feedback.message}
                </div>
            )}
        </>
    );
};

// --- COMPONENTE PRINCIPAL: CONTROLADOR DE ESTADO ---

const PhraseSequenceCreator = () => {
    const [phrases, setPhrases] = useState([
        "React é uma biblioteca JavaScript para construir interfaces de usuário.", 
        "Ele usa componentes reutilizáveis para gerenciar o estado.", 
        "O aprendizado com Hooks tornou o desenvolvimento mais eficiente."
    ]); 
    const [isGameReady, setIsGameReady] = useState(false);
    
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

    const handleGenerateGame = () => {
        const phrasesToPlay = phrases.filter(p => p.trim() !== '');

        if (phrasesToPlay.length < 1) {
            alert('Por favor, adicione pelo menos uma frase válida antes de embaralhar.');
            return;
        }

        setPhrases(phrasesToPlay);
        setIsGameReady(true);
    };

    const handleBackToCreator = () => {
        setIsGameReady(false);
    };

    return (
        <div className="main-container"> 
            <div className="editor-card-glass">
                
                {!isGameReady ? (
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
                                className={`add-button glass-button ${phrases.length >= MAX_PHRASES ? 'disabled' : ''}`}
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
                    <>
                        <GamePlayer 
                            phrasesToPlay={phrases} 
                            onBackToCreator={handleBackToCreator}
                        />
                        
                        <div style={{textAlign: 'center', marginTop: '20px'}}>
                            <button 
                                className="glass-button" 
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                                    color: 'var(--color-text-dark)', 
                                    border: '1px solid rgba(255, 255, 255, 0.4)'
                                }}
                                onClick={handleBackToCreator}
                            >
                                &lt; Voltar para Editar Sequência
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default PhraseSequenceCreator;