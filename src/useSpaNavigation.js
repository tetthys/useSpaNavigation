import { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router";
import { SmartInputContext } from "@tetthys/smartinput";

export function useSpaNavigation(routeMap) {
  const navigate = useNavigate();
  const { updateBootstrap } = useContext(SmartInputContext);

  const [isLoading, setIsLoading] = useState(false);

  const callApi = useCallback(
    async (fn) => {
      setIsLoading(true);
      try {
        const response = await fn();
        const data = response.data;

        // SmartInput 초기 데이터 전달
        if (data.smartinput || data.fields || data.ui || data.flash) {
          updateBootstrap(data);
        }

        // navigation 처리
        if (data.navigation) {
          const nav = data.navigation;

          if (nav.action === "back") {
            navigate(-1);
          } else if (nav.action === "redirect") {
            const routeKey = nav.target;
            const resolved = nav.resolvedUrl || routeMap[routeKey];
            navigate(resolved);
          }
        }

        return data;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, updateBootstrap]
  );

  return { isLoading, callApi };
}
