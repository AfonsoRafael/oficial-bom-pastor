import { useEffect, useState } from "react";

const SIDEBAR_STORAGE_KEY = "sidebar-open";
const DESKTOP_BREAKPOINT = 1024;

function getInitialSidebarState() {
  if (typeof window === "undefined") {
    return false;
  }

  const persisted = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (persisted === "true") return true;
  if (persisted === "false") return false;

  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export function usePersistentSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(getInitialSidebarState);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((previous) => !previous);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return { sidebarOpen, setSidebarOpen, toggleSidebar, openSidebar, closeSidebar };
}
