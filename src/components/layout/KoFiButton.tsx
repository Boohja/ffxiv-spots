"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";

const koFiContainerId = "kofi-footer-widget";

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (
        pageId: string,
        config: Record<string, string>,
        containerId?: string,
      ) => void;
    };
  }
}

export function KoFiButton() {
  const hasDrawn = useRef(false);

  const drawWidget = useCallback(() => {
    if (hasDrawn.current || !window.kofiWidgetOverlay) {
      return;
    }

    window.kofiWidgetOverlay.draw(
      "boohja",
      {
        type: "floating-chat",
        "floating-chat.donateButton.text": "Support me",
        "floating-chat.donateButton.background-color": "#00b9fe",
        "floating-chat.donateButton.text-color": "#fff",
      },
      koFiContainerId,
    );
    hasDrawn.current = true;
  }, []);

  return (
    <div className="kofi-footer-widget flex justify-end">
      <div id={koFiContainerId} className="flex min-h-10 w-full justify-end" />
      <Script
        src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
        strategy="lazyOnload"
        onReady={drawWidget}
      />
    </div>
  );
}
