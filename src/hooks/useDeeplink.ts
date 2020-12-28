import useMobileDetect from 'use-mobile-detect-hook';

type DeepLink = {
  goToApp: () => void
}

const useDeeplink = (): DeepLink => {
  const detectMobile = useMobileDetect();

  const goToApp = () => {
    if (detectMobile.isMobile()) {
      window.location.replace(process.env.REACT_APP_DEEPLINK || "")
    } else {
      window.location.replace("https://elysia.land/")
    }
  }

  return { goToApp }
}

export default useDeeplink;