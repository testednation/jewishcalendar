/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LanguageProvider } from './i18n/translations';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { StudioView } from './components/StudioView';

export default function App() {
  return (
    <ThemeModeProvider>
      <LanguageProvider>
        <StudioView />
      </LanguageProvider>
    </ThemeModeProvider>
  );
}
