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
  const [openSuggestionsOnLoad, setOpenSuggestionsOnLoad] = useState(false);

  return (
    <LanguageProvider>
      {view === 'landing' ? (
        <LandingView
          onOpenStudio={() => {
            setOpenSuggestionsOnLoad(false);
            setView('studio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenSuggestions={() => {
            setOpenSuggestionsOnLoad(true);
            setView('studio');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <StudioView
          initialShowSuggestions={openSuggestionsOnLoad}
          onBackToLanding={() => {
            setOpenSuggestionsOnLoad(false);
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </LanguageProvider>
  );
}
