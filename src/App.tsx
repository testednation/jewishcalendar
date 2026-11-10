/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider } from './i18n/translations';
import { LandingView } from './components/LandingView';
import { StudioView } from './components/StudioView';

export default function App() {
  const [view, setView] = useState<'landing' | 'studio'>('studio');

  return (
    <LanguageProvider>
      {view === 'landing' ? (
        <LandingView
          onOpenStudio={() => {
            setView('studio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <StudioView
          onBackToLanding={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </LanguageProvider>
  );
}
