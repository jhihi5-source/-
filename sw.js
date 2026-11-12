// 오프라인에서도 앱이 열리게 해주는 파일 (인터넷 주소 https 에서만 동작)
// 항상 인터넷에서 새 파일을 먼저 받고, 3초 안에 안 오면 저장해 둔 파일을 씁니다.
// 그래서 benefits.js 를 고쳐 올리면 다음에 앱을 열 때 바로 반영됩니다.
const 캐시이름 = "moail-v10";
const 파일들 = ["./", "./index.html", "./benefits.js", "./cards.js", "./mylist.js", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(캐시이름).then((c) => c.addAll(파일들)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== 캐시이름).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const 요청 = e.request;
  if (요청.method !== "GET" || new URL(요청.url).origin !== location.origin) return;
  e.respondWith(new Promise((resolve) => {
    let 끝 = false;
    const 저장본 = () => caches.match(요청, { ignoreSearch: true }).then((r) => r || caches.match("./index.html"));
    const 시간초과 = setTimeout(() => { if (!끝) { 끝 = true; 저장본().then(resolve); } }, 3000);
    fetch(요청).then((응답) => {
      if (응답 && 응답.ok) { const 복사 = 응답.clone(); caches.open(캐시이름).then((c) => c.put(요청, 복사)); }
      if (!끝) { 끝 = true; clearTimeout(시간초과); resolve(응답); }
    }).catch(() => { if (!끝) { 끝 = true; clearTimeout(시간초과); 저장본().then(resolve); } });
  }));
});
