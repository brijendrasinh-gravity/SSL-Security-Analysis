import { useState, useEffect } from "react";
import API from "../api/api";

export const useApiLimit = () => {
  const [limitInfo, setLimitInfo] = useState({
    isLimitEnabled: false,
    isLimitReached: false,
    usedToday: 0,
    dailyLimit: 0,
    remainingCalls: 0,
    loading: true,
  });

  const fetchLimitInfo = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      if (!userId) {
        setLimitInfo((prev) => ({ ...prev, loading: false }));
        return;
      }

      const res = await API.get(`/users/account-setting/${userId}`);
      
      if (res.data.success) {
        const data = res.data.data;
        const isLimitEnabled = data.api_limit_enabled;
        const usedToday = data.api_used_today || 0;
        const dailyLimit = data.daily_limit || 0;
        const isLimitReached = isLimitEnabled && usedToday >= dailyLimit;
        const remainingCalls = isLimitEnabled ? Math.max(0, dailyLimit - usedToday) : Infinity;

        setLimitInfo({
          isLimitEnabled,
          isLimitReached,
          usedToday,
          dailyLimit,
          remainingCalls,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching API limit info:", error);
      setLimitInfo((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchLimitInfo();
  }, []);

  return { ...limitInfo, refetch: fetchLimitInfo };
};
