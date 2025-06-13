'use client'

import { useCookieConsent } from '@/components/cookie-context-provider'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState } from 'react'

let globalSetShowPreferences: ((show: boolean) => void) | null = null

export const showCookiePreferences = () => {
  globalSetShowPreferences?.(true)
}

export function CookieConsentBanner() {
  const { consent, updateConsent, showBanner } = useCookieConsent()
  const [showPreferences, setShowPreferences] = useState(false)
  const [localConsent, setLocalConsent] = useState(consent)

  // Store the setShowPreferences function globally
  globalSetShowPreferences = setShowPreferences

  // Update local consent when the main consent changes
  useState(() => {
    setLocalConsent(consent)
  })

  if (!showBanner) return null

  const handleSavePreferences = () => {
    updateConsent(localConsent)
    setShowPreferences(false)
  }

  const handleAnalyticsChange = (checked: boolean) => {
    setLocalConsent((prev) => ({
      ...prev,
      analytics: checked,
    }))
  }

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 border-t border-white/10 backdrop-blur-md',
          'animate-in slide-in-from-bottom duration-500 ease-out',
        )}
      >
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-white text-sm">
              We use cookies to enhance your experience. By continuing to visit
              this site you agree to our use of cookies.{' '}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() => setShowPreferences(true)}
            >
              Cookie Settings
            </Button>
            <Button
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() =>
                updateConsent({
                  analytics: true,
                  necessary: true,
                })
              }
            >
              Accept All
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto whitespace-nowrap"
              onClick={() =>
                updateConsent({
                  analytics: false,
                  necessary: true,
                })
              }
            >
              Reject All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-[360px] sm:max-w-[450px]">
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Cookie Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Necessary Cookies
                    </h3>
                    <p className="text-sm text-white/60">
                      Required for the website to function properly.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConsent.necessary}
                    disabled
                    className="mt-1 cursor-not-allowed opacity-60"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Analytics Cookies
                    </h3>
                    <p className="text-sm text-white/60">
                      Help us understand how visitors interact with the website.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localConsent.analytics}
                    onChange={(e) => handleAnalyticsChange(e.target.checked)}
                    className="mt-1 cursor-pointer hover:ring-2 hover:ring-[#836EF9] hover:ring-offset-1 hover:ring-offset-black transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowPreferences(false)}
            >
              Close
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
