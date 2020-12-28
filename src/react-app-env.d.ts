/// <reference types="react-scripts" />

interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
    enable?: () => Promise<void>
  }
  web3?: {}
}

declare module 'jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}

interface MobileDetectHook {
  isMobile: function(): boolean
  isDesktop: function(): boolean
  isAndroid: function(): boolean
  isIos: function(): boolean
}

declare module 'use-mobile-detect-hook' {
  export default function (): MobileDetectHook
}