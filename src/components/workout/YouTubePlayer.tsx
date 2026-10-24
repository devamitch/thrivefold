import { Image } from 'expo-image';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
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
    playerVars:{playsinline:1,rel:0,modestbranding:1,controls:1,fs:0,origin:'${ORIGIN}'},
    events:{
      onReady:function(){try{player.setPlaybackQuality('small');}catch(e){}send({t:'ready'});},
      onStateChange:function(e){send({t:'state',s:e.data});},
      onError:function(e){send({t:'error',c:e.data});}
    }});
}
window.__tf={play:function(){if(!player||!player.playVideo)return;player.unMute&&player.unMute();player.setPlaybackQuality&&player.setPlaybackQuality('small');player.playVideo();},pause:function(){player&&player.pauseVideo&&player.pauseVideo();}};
</script></body></html>`;

/**
 * Tutorial video through the official YouTube IFrame Player API, so play and pause work
 * reliably (the coach pauses the video when form needs fixing). Shows the thumbnail and a
 * spinner until the player is ready, which matters on slow mobile networks.
 */
export const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(function YouTubePlayer({ videoId, style, onPlayingChange }, ref) {
  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = useMemo(() => ({ html: pageFor(videoId), baseUrl: ORIGIN }), [videoId]);

  useImperativeHandle(ref, () => ({
    play: () => web.current?.injectJavaScript('window.__tf&&window.__tf.play();true;'),
    pause: () => web.current?.injectJavaScript('window.__tf&&window.__tf.pause();true;'),
  }));

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
    <View style={[styles.root, style]}>
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
        allowsFullscreenVideo={false}
        onError={() => setFailed(true)}
      />
      {!ready || failed ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image source={{ uri: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            {failed ? (
              <Text style={styles.note}>The video could not load. Use “Open in YouTube”.</Text>
            ) : (
              <ActivityIndicator size="large" color="#FFFFFF" />
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  note: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, color: '#FFFFFF', overflow: 'hidden', padding: 10, textAlign: 'center' },
  root: { backgroundColor: '#000', overflow: 'hidden' },
  web: { backgroundColor: '#000', flex: 1 },
});
