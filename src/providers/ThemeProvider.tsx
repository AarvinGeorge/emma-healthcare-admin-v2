'use client'

/**
 * EMMA Healthcare Theme Provider
 * 
 * Wraps the application with Material UI ThemeProvider using the
 * EMMA healthcare design system theme, plus React Query for data management.
 */

import React from 'react'
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { SessionProvider } from 'next-auth/react'
import ReactQueryProvider from './ReactQueryProvider'
import { emmaHealthcareTheme } from '../theme/emma-healthcare-theme'

// Create emotion cache for Material UI
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true })
}

const clientSideEmotionCache = createEmotionCache()

interface EMMAThemeProviderProps {
  children: React.ReactNode
  emotionCache?: ReturnType<typeof createEmotionCache>
}

export const EMMAThemeProvider: React.FC<EMMAThemeProviderProps> = ({
  children,
  emotionCache = clientSideEmotionCache,
}) => {
  return (
    <SessionProvider>
      <ReactQueryProvider>
        <CacheProvider value={emotionCache}>
          <MUIThemeProvider theme={emmaHealthcareTheme}>
            <CssBaseline />
            {children}
          </MUIThemeProvider>
        </CacheProvider>
      </ReactQueryProvider>
    </SessionProvider>
  )
}

export default EMMAThemeProvider