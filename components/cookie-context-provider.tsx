'use client'

import Script from 'next/script'
import { createContext, useContext, useEffect, useState } from 'react'

type CookieConsent = {
  analytics: boolean
  necessary: boolean
}

type CookieConsentContextType = {
  consent: CookieConsent
  updateConsent: (consent: Partial<CookieConsent>) => void
  showBanner: boolean
  setShowBanner: (show: boolean) => void
}

const CookieConsentContext = createContext<
  CookieConsentContextType | undefined
>(undefined)

const CONSENT_COOKIE_NAME = 'monad-cookie-consent'
const GA_MEASUREMENT_ID = 'G-S28YGBT9Y4'

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    necessary: true,
  })
  const [showBanner, setShowBanner] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Load consent from cookie on mount
    const savedConsent = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`))

    if (savedConsent) {
      const consentValue = JSON.parse(
        decodeURIComponent(savedConsent.split('=')[1]),
      )
      setConsent(consentValue)
      setShowBanner(false)
    }
    setIsInitialized(true)
  }, [])

  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    const updatedConsent = { ...consent, ...newConsent }
    setConsent(updatedConsent)

    // Save consent to cookie
    document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(updatedConsent),
    )}; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`

    // Hide banner after consent is updated
    setShowBanner(false)

    // Reload page if analytics consent was changed to false
    if (newConsent.analytics === false && consent.analytics === true) {
      window.location.reload()
    }
  }

  return (
    <CookieConsentContext.Provider
      value={{ consent, updateConsent, showBanner, setShowBanner }}
    >
      {children}
      {/* Load GA script only if consent is given */}
      {isInitialized && consent.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </CookieConsentContext.Provider>
  )
}

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider',
    )
  }
  return context
}
