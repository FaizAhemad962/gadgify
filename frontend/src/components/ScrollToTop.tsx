import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_SCROLL_SETTLE_DELAY_MS = 80;

const runWithInstantScroll = (callback: () => void) => {
  const root = document.documentElement;
  const body = document.body;
  const previousScrollBehavior = root.style.scrollBehavior;
  const previousBodyScrollBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  callback();
  root.style.scrollBehavior = previousScrollBehavior;
  body.style.scrollBehavior = previousBodyScrollBehavior;
};

const scrollToHashTarget = (hash: string) => {
  const id = decodeURIComponent(hash.replace("#", ""));
  if (!id) return false;

  const escapedId =
    typeof CSS !== "undefined" && CSS.escape ? CSS.escape(id) : id;

  const target =
    document.getElementById(id) ??
    document.querySelector(`[name="${escapedId}"]`);

  if (!target) return false;

  runWithInstantScroll(() => {
    target.scrollIntoView({ block: "start", inline: "nearest" });
  });

  return true;
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  useLayoutEffect(() => {
    const timers: number[] = [];
    const frames: number[] = [];
    let userInteracted = false;

    const scrollToRoutePosition = () => {
      if (userInteracted) return;
      if (location.hash && scrollToHashTarget(location.hash)) return;
      if (window.scrollY <= 1 && document.documentElement.scrollTop <= 1) {
        return;
      }

      runWithInstantScroll(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    };

    const cancelFollowUpScroll = () => {
      userInteracted = true;
    };

    window.addEventListener("wheel", cancelFollowUpScroll, { passive: true });
    window.addEventListener("touchstart", cancelFollowUpScroll, {
      passive: true,
    });
    window.addEventListener("keydown", cancelFollowUpScroll);

    scrollToRoutePosition();
    frames.push(window.requestAnimationFrame(scrollToRoutePosition));
    timers.push(
      window.setTimeout(scrollToRoutePosition, ROUTE_SCROLL_SETTLE_DELAY_MS),
    );

    return () => {
      window.removeEventListener("wheel", cancelFollowUpScroll);
      window.removeEventListener("touchstart", cancelFollowUpScroll);
      window.removeEventListener("keydown", cancelFollowUpScroll);
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default ScrollToTop;
