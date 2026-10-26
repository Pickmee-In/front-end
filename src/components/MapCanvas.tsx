import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import { MapCanvasProps } from './MapCanvas.types';
import { mapUpdateScript, nativeMapHtml } from './nativeMapHtml';

const source = { html: nativeMapHtml, baseUrl: 'https://pickme.nekomik.web.id' };

export default function MapCanvas({ items, selectedId, center, userLocation, zoom, onSelect, onZoomChange }: MapCanvasProps) {
  const webview = useRef<WebView<{}>>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) webview.current?.injectJavaScript(mapUpdateScript({ items, selectedId, center, userLocation, zoom }));
  }, [ready, items, selectedId, center, userLocation, zoom]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') setReady(true);
      if (data.type === 'select' && typeof data.id === 'string') {
        const item = items.find(item => item.id === data.id);
        if (item) onSelect(item);
      }
      if (data.type === 'zoom' && Number.isFinite(data.zoom) && data.zoom >= 8 && data.zoom <= 19) onZoomChange?.(data.zoom);
    } catch { /* Ignore malformed messages from the embedded map. */ }
  };
  return <WebView<{}>
    ref={webview}
    source={source}
    style={StyleSheet.absoluteFill}
    originWhitelist={['*']}
    onMessage={onMessage}
    onLoadStart={() => setReady(false)}
    onShouldStartLoadWithRequest={({ url }) => url === 'about:blank' || url === source.baseUrl || url === `${source.baseUrl}/`}
    javaScriptEnabled
    domStorageEnabled={false}
    allowFileAccess={false}
    mixedContentMode="never"
    setSupportMultipleWindows={false}
    thirdPartyCookiesEnabled={false}
    scrollEnabled={false}
  />;
}
