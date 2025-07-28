'use client'

import { FooterLink } from '@/components/footer-link'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="w-full relative z-10 px-8">
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and CTA Column */}
          <div className="space-y-6 col-span-1">
            <div className="flex flex-col gap-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="126"
                height="24"
                viewBox="0 0 126 24"
                fill="none"
                aria-label="Monad Logo"
                role="img"
              >
                <path
                  d="M11.782 0C8.37963 0 0 8.53443 0 11.9999C0 15.4654 8.37963 24 11.782 24C15.1844 24 23.5642 15.4653 23.5642 11.9999C23.5642 8.53458 15.1845 0 11.782 0ZM9.94598 18.8619C8.51124 18.4637 4.65378 11.5912 5.04481 10.1299C5.43584 8.66856 12.1834 4.73984 13.6181 5.1381C15.0529 5.5363 18.9104 12.4087 18.5194 13.87C18.1283 15.3314 11.3807 19.2602 9.94598 18.8619Z"
                  fill="#836EF9"
                />
                <path
                  d="M40.0336 14.6596V14.6552L33.339 2.07919C33.2072 1.83164 32.843 1.89093 32.7935 2.16797L29.4595 20.8455C29.4268 21.0285 29.5649 21.197 29.7476 21.197H32.3271C32.4686 21.197 32.5899 21.0939 32.6151 20.9521L34.5567 10.0541L39.7754 20.1872C39.8851 20.4001 40.1843 20.4001 40.294 20.1872L45.5127 10.0541L47.4543 20.9521C47.4795 21.0939 47.6008 21.197 47.7423 21.197H50.3218C50.5045 21.197 50.6425 21.0285 50.6099 20.8455L47.2759 2.16797C47.2264 1.89093 46.8622 1.83164 46.7304 2.07919L40.0336 14.6596Z"
                  fill="#FBFAF9"
                />
                <path
                  d="M61.4561 2.43127C56.1457 2.43127 51.9858 6.63421 51.9858 12.0007C51.9858 17.3673 56.1457 21.5726 61.4561 21.5726C66.7526 21.5726 70.9022 17.3684 70.9022 12.0007C70.9022 6.63304 66.7526 2.43127 61.4561 2.43127ZM61.4561 18.3683C57.9931 18.3683 55.28 15.571 55.28 12.0007C55.28 8.43046 57.9931 5.63551 61.4561 5.63551C64.9052 5.63551 67.608 8.43163 67.608 12.0007C67.608 15.5699 64.9052 18.3683 61.4561 18.3683Z"
                  fill="#FBFAF9"
                />
                <path
                  d="M85.4983 14.1957L74.394 2.02247C74.2129 1.82394 73.8867 1.95445 73.8867 2.22543V20.8989C73.8867 21.0636 74.0178 21.1971 74.1795 21.1971H76.864C77.0257 21.1971 77.1567 21.0636 77.1567 20.8989V9.78456L88.2365 21.9807C88.4174 22.1799 88.7442 22.0495 88.7442 21.7782V3.10474C88.7442 2.94005 88.6131 2.80655 88.4514 2.80655H85.7911C85.6294 2.80655 85.4983 2.94005 85.4983 3.10474V14.1957Z"
                  fill="#FBFAF9"
                />
                <path
                  d="M91.5906 21.1971H94.4731C94.5873 21.1971 94.691 21.1295 94.7389 21.024L96.8982 16.261H103.803L105.914 21.0217C105.961 21.1285 106.066 21.1971 106.181 21.1971H109.308C109.524 21.1971 109.666 20.9672 109.572 20.7692L100.713 2.09692C100.607 1.87232 100.292 1.87232 100.186 2.09692L91.327 20.7692C91.2331 20.9672 91.3747 21.1971 91.5906 21.1971ZM98.2519 13.3058L100.398 8.56257L102.504 13.3058H98.2519Z"
                  fill="#FBFAF9"
                />
                <path
                  d="M116.57 2.80627H112.14C111.978 2.80627 111.847 2.93978 111.847 3.10446V20.8986C111.847 21.0633 111.978 21.1968 112.14 21.1968H116.57C122.061 21.1968 125.474 17.6733 125.474 12.0004C125.474 6.32744 122.061 2.80627 116.57 2.80627ZM116.57 18.0417H115.141V5.93685H116.57C120.135 5.93685 122.18 8.14707 122.18 12.0004C122.18 15.8396 120.135 18.0417 116.57 18.0417Z"
                  fill="#FBFAF9"
                />
              </svg>
            </div>
            <div className="w-full flex flex-col gap-3">
              <span className="text-md font-normal text-white">
                Need Help? Check out the Testnet Onboarding Guide.
              </span>
              <Button
                variant="default"
                size="default"
                className="w-fit"
                asChild
              >
                <a
                  href="https://monad.xyz/post/monad-testnet-onboarding-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Testnet Onboarding Guide
                </a>
              </Button>
            </div>
            <p className="text-sm text-neutral-400 mt-2">
              © {new Date().getFullYear()} Monad Foundation. All rights
              reserved.
            </p>
          </div>

          {/* Right side columns wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:col-span-2 mt-8 lg:mt-0 gap-8 sm:gap-12 lg:gap-16 lg:justify-end">
            {/* For Builders Column */}
            <div className="col-span-1 flex flex-col gap-4">
              <h3 className="font-semibold text-white">For Builders</h3>
              <div className="flex flex-col gap-2">
                <FooterLink href="https://developers.monad.xyz/" external>
                  Developer Portal
                </FooterLink>
                <FooterLink href="https://docs.monad.xyz/" external>
                  Documentation
                </FooterLink>
                <FooterLink href="https://madness.monad.xyz/" external>
                  Monad Madness
                </FooterLink>
                <FooterLink href="https://hackathon.monad.xyz/" external>
                  evm/accathon
                </FooterLink>
              </div>
            </div>

            {/* Company Column */}
            <div className="col-span-1 flex flex-col gap-4">
              <h3 className="font-semibold text-white">Company</h3>
              <div className="flex flex-col gap-2">
                <FooterLink href="https://www.monad.foundation/" external>
                  Monad Foundation
                </FooterLink>
                <FooterLink href="https://monad.xyz/" external>
                  Monad Protocol
                </FooterLink>
                <FooterLink
                  href="https://jobs.ashbyhq.com/monad.foundation"
                  external
                >
                  Careers
                </FooterLink>
              </div>
            </div>

            {/* Socials Column */}
            <div className="col-span-1 flex flex-col gap-4">
              <h3 className="font-semibold text-white">Socials</h3>
              <div className="flex flex-col gap-2">
                <FooterLink href="https://x.com/monad" external>
                  X (fka Twitter)
                </FooterLink>
                <FooterLink href="https://discord.gg/monad" external>
                  Community Discord
                </FooterLink>
                <FooterLink href="https://discord.gg/monaddev" external>
                  Developer Discord
                </FooterLink>
              </div>
            </div>

            {/* Misc Column */}
            <div className="col-span-1 flex flex-col gap-4">
              <h3 className="font-semibold text-white">Misc.</h3>
              <div className="flex flex-col gap-2">
                <FooterLink href="https://monad.xyz/terms-of-service" external>
                  Terms of Service
                </FooterLink>
                <FooterLink href="https://monad.xyz/privacy-policy" external>
                  Privacy Policy
                </FooterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
