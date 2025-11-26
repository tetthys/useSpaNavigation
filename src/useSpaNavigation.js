// src/useSpaNavigation.js
//
// React Router 기반 SPA navigation hook.
// - Expects response shape: { navigation?: { action, target?, resolvedUrl?, fallbackUrl? } }
// - Provides isLoading + callApi wrapper.

import { useState } from "react";
import { useNavigate } from "react-router";

/**
 * useSpaNavigation
 * @param {Object} routeMap - map of route keys to actual paths, e.g. { home: "/", profile: "/me" }
 */
export function useSpaNavigation(routeMap = {}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  function handleNavigation(responseData) {
    const navigation = responseData && responseData.navigation;
    if (!navigation || !navigation.action || navigation.action === "none") {
      return;
    }

    let url = navigation.resolvedUrl;

    if (!url && navigation.target) {
      url = routeMap[navigation.target] || navigation.target;
    }

    if (!url && navigation.fallbackUrl) {
      url = navigation.fallbackUrl;
    }

    if (!url) return;

    switch (navigation.action) {
      case "redirect":
        navigate(url);
        break;
      case "replace":
        navigate(url, { replace: true });
        break;
      case "back":
        navigate(-1);
        break;
      case "reload":
        window.location.href = url;
        break;
      default:
        break;
    }
  }

  /**
   * callApi
   * - Wraps any async API call.
   * - Expects fn to return a Promise of response (axios/fetch style).
   */
  async function callApi(fn) {
    setIsLoading(true);
    try {
      const res = await fn();
      // Support axios style (res.data) or plain object
      const data = res && res.data ? res.data : res;
      handleNavigation(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    callApi,
  };
}
