import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
}

interface Props {
  videoId: string;
  style?: ViewStyle;
  onPlayingChange?: (playing: boolean) => void;
}

/**
 * The YouTube embed page in a WebView. Play and pause drive the page's own <video>
 * element, so the coach can stop the tutorial when form needs fixing. The Referer header
 * identifies the app to YouTube, which embeds now require.
 */
export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer({ videoId, style, onPlayingChange }, ref) {
  const web = useRef<WebView>(null);
  const run = (js: string) => web.current?.injectJavaScript(`(function(){try{${js}}catch(e){}})();true;`);

  useImperativeHandle(ref, () => ({
    play: () => run(`var v=document.querySelector('video');if(v){v.play();}else{var b=document.querySelector('.ytp-large-play-button');b&&b.click();}`),
    pause: () => run(`var v=document.querySelector('video');v&&v.pause();`),
  }));

  // Reports play/pause back so the UI shows the true state.
  const watcher = `
    (function(){
      function hook(){
        var v=document.querySelector('video');
        if(!v){setTimeout(hook,500);return;}
        v.addEventListener('play',function(){window.ReactNativeWebView.postMessage('playing');});
        v.addEventListener('pause',function(){window.ReactNativeWebView.postMessage('paused');});
      }
      hook();
    })();true;`;

  const onMessage = (e: WebViewMessageEvent) => onPlayingChange?.(e.nativeEvent.data === 'playing');

  return (
    <View style={[styles.root, style]}>
      <WebView
        ref={web}
        source={{
          uri: `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1`,
          headers: { Referer: 'https://thrivefold.app' },
        }}
        style={styles.web}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={watcher}
        onMessage={onMessage}
        setSupportMultipleWindows={false}
        allowsFullscreenVideo={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: { backgroundColor: '#000', overflow: 'hidden' },
  web: { backgroundColor: '#000', flex: 1 },
});
