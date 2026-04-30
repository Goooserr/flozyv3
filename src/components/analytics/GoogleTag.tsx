'use client'

import React from 'react'
import Script from 'next/script'

export function GoogleTag() {
  const tagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID

  if (!tagId) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tagId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
