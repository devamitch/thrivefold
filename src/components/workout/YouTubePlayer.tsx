import { SquircleSurface } from '../ui/SquircleSurface';
import { Image } from 'expo-image';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
}

interface Props {
  /** A verified video to embed. */
  videoId?: string;
  /** Without a verified video: YouTube search for this, shown inside the app. */
  query?: string;
  style?: ViewStyle;
  onPlayingChange?: (playing: boolean) => void;
}

const ORIGIN = 'https://thrivefold.app';

/** A page that hosts the official YouTube IFrame Player API and reports its state. */
const pageFor = (videoId: string) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#p{position:absolute;inset:0;width:100%;height:100%}</style>
</head><body><div id="p"></div>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
var player;
function send(m){window.ReactNativeWebView.postMessage(JSON.stringify(m));}
function onYouTubeIframeAPIReady(){
  player=new YT.Player('p',{videoId:'${videoId}',host:'https://www.youtube-nocookie.com',
    playerVars:{playsinline:1,rel:0,modestbranding:0,controls:1,fs:1,cc_load_policy:1,origin:'${ORIGIN}'},
    events:{
      onReady:function(){try{player.setPlaybackQuality('small');}catch(e){}send({t:'ready'});},
      onStateChange:function(e){send({t:'state',s:e.data});},
      onError:function(e){send({t:'error',c:e.data});}
    }});
}
window.__tf={
  play:function(){if(!player||!player.playVideo)return;player.unMute&&player.unMute();player.playVideo();},
  pause:function(){player&&player.pauseVideo&&player.pauseVideo();},
  seek:function(sec){player&&player.seekTo&&player.seekTo(sec,true);}
};
</script></body></html>`;

/**
 * Tutorial video through the official YouTube IFrame Player API, so play and pause work
 * reliably (the coach pauses the video when form needs fixing). Shows the thumbnail and a
 * spinner until the player is ready, which matters on slow mobile networks.
 */
export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer({ videoId, query, style, onPlayingChange }, ref) {
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const embedded = Boolean(videoId);
  const source = useMemo(
    () =>
      videoId
        ? { html: pageFor(videoId), baseUrl: ORIGIN }
        : { uri: `https://m.youtube.com/results?search_query=${encodeURIComponent(query ?? 'exercise tutorial')}` },
    [videoId, query],
  );

  // The search page's own <video> element is driven directly once a video is open.
  const searchJs = (cmd: 'play' | 'pause') => `(function(){var v=document.querySelector('video');if(v){v.${cmd}();}})();true;`;
  useImperativeHandle(ref, () => ({
    play: () => web.current?.injectJavaScript(embedded ? 'window.__tf&&window.__tf.play();true;' : searchJs('play')),
    pause: () => web.current?.injectJavaScript(embedded ? 'window.__tf&&window.__tf.pause();true;' : searchJs('pause')),
    seek: (sec: number) => web.current?.injectJavaScript(embedded ? `window.__tf&&window.__tf.seek(${sec});true;` : `(function(){var v=document.querySelector('video');if(v){v.currentTime=${sec};}})();true;`),
  }));

  // On the search page, report play/pause of whichever video is open.
  const watcher = `(function(){
    function hook(v){if(v.__tf)return;v.__tf=1;
      v.addEventListener('play',function(){window.ReactNativeWebView.postMessage(JSON.stringify({t:'state',s:1}));});
      v.addEventListener('pause',function(){window.ReactNativeWebView.postMessage(JSON.stringify({t:'state',s:2}));});}
    setInterval(function(){var v=document.querySelector('video');if(v)hook(v);},800);
  })();true;`;

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { t: string; s?: number };
      if (m.t === 'ready') setReady(true);
      if (m.t === 'error') setFailed(true);
      // 1 = playing, 2 = paused, 0 = ended, 3 = buffering.
      if (m.t === 'state') onPlayingChange?.(m.s === 1 || m.s === 3);
    } catch {
      // Ignore messages that are not ours.
    }
  };

  return (
    <SquircleSurface style={[styles.root, style]}>
      <WebView
        ref={web}
        source={source}
        originWhitelist={['*']}
        style={styles.web}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        setSupportMultipleWindows={false}
        allowsFullscreenVideo={true}
        onError={() => setFailed(true)}
        injectedJavaScript={embedded ? undefined : watcher}
        onLoadEnd={embedded ? undefined : () => setReady(true)}
        allowsBackForwardNavigationGestures
      />
      {!ready || failed ? (
        <SquircleSurface style={StyleSheet.absoluteFill} pointerEvents="none">
          {videoId ? (
            <Image source={{ uri: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : null}
          <SquircleSurface style={[StyleSheet.absoluteFill, styles.center]}>
            {failed ? (
              <Text style={styles.note}>The video could not load on this connection. Try again in a moment.</Text>
            ) : (
              <ActivityIndicator size="large" color="#FFFFFF" />
            )}
          </SquircleSurface>
        </SquircleSurface>
      ) : null}
    </SquircleSurface>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  note: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, color: '#FFFFFF', overflow: 'hidden', padding: 10, textAlign: 'center' },
  root: { backgroundColor: '#000', overflow: 'hidden' },
  web: { backgroundColor: '#000', flex: 1 },
});
