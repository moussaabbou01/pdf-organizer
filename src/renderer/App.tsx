import React from 'react';
import { MainWindow } from './components/layout/MainWindow';
import { useMenuCommands } from './hooks/useMenuCommands';
import { useAutosave } from './hooks/useAutosave';
import { useUndoRedoKeyboard } from './hooks/useUndoRedo';
import { useSelectionKeyboard } from './hooks/useSelection';
import { ProgressDialog } from './components/dialogs/ProgressDialog';
import { AboutDialog } from './components/dialogs/AboutDialog';
import { RecoveryDialog } from './components/dialogs/RecoveryDialog';
import { useUIStore } from './store/uiSlice';

function App() {
  // Initialize hooks
  useMenuCommands();
  useAutosave();
  useUndoRedoKeyboard();
  useSelectionKeyboard();

  const uiStore = useUIStore();

  return (
    <div className="app">
      <MainWindow />
      
      {/* Dialogs */}
      {uiStore.isProgressDialogOpen && <ProgressDialog />}
      {uiStore.isAboutDialogOpen && <AboutDialog />}
      {uiStore.isRecoveryDialogOpen && <RecoveryDialog />}
    </div>
  );
}

export default App;
