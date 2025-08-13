import React from 'react';
import { useGameStore } from './store/useGameStore';
import MainMenu from './features/main-menu/MainMenu';
import GameScreen from './screens/GameScreen';
import CharacterCreationScreen from './features/character-creation/CharacterCreationScreen';
import ToastContainer from './components/ui/ToastContainer';
import SettingsScreen from './screens/SettingsScreen';
import PromptLibraryScreen from './screens/PromptLibraryScreen';
import SaveLoadScreen from './screens/SaveLoadScreen';

const App: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <div 
      className="min-h-screen bg-gray-900 p-4 sm:p-8 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative container mx-auto max-w-7xl h-full">
        {gameState === 'MainMenu' && <MainMenu />}
        {gameState === 'CreatingCharacter' && <CharacterCreationScreen />}
        {gameState === 'Playing' && <GameScreen />}
        {gameState === 'Settings' && <SettingsScreen />}
        {gameState === 'PromptLibrary' && <PromptLibraryScreen />}
        {gameState === 'SaveLoadMenu' && <SaveLoadScreen />}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;