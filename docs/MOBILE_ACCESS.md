# Mobile Access Guide (Local Testing)

## Goal

Open the Jorniz app on your phone browser while running it on your Mac.

## 1) Keep both devices on same Wi‑Fi

Make sure your Mac and your mobile phone are connected to the same local network (same Wi‑Fi).

## 2) Find your Mac local IP

On Mac terminal:

```bash
ipconfig getifaddr en0
```

- Usually this returns something like `192.168.1.6`.

## 3) Run backend + gateway on Mac

In one terminal:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz/backend"
python3 main.py
```

In second terminal:

```bash
cd "/Users/prateekpanwar/PP Work/-Project--Jorniz"
python3 server.py 3000
```

You should already see:
- `[HEALTHY UNIVERSE API] Running on http://localhost:8000`
- `[HEALTHY UNIVERSE GATEWAY] Running on http://localhost:3000`

## 4) Open app from mobile

On your phone, open:

```
http://<MAC_LOCAL_IP>:3000
```

Example:

```
http://192.168.1.6:3000
```

If you want direct auth page:

```
http://<MAC_LOCAL_IP>:3000/auth.html
```

## 5) Important: API base in frontend

Mobile UI currently uses `HU_API` setting in:

- `js/api.js`

If you want to force local backend while using local LAN access, set:

```js
const HU_API = "http://<MAC_LOCAL_IP>:3000";
```

or:

```js
const HU_API = "https://healthy-universe.onrender.com";
```

Use local IP for full local testing (recommended), remote URL for cloud testing.

## 6) Firewall / connectivity checks

- If phone cannot open the page:
  1. Verify both devices are on same Wi‑Fi.
  2. Open `http://<MAC_LOCAL_IP>:3000` from another laptop on the same network first.
  3. If blocked, allow Python in macOS Firewall for inbound connections.
  4. Confirm no VPN / AP isolation is enabled on router.

## 7) Quick sanity checklist

- [ ] Server logs show both ports running.
- [ ] Mobile opens `http://<MAC_LOCAL_IP>:3000`.
- [ ] Login works on mobile.
- [ ] Feed/API actions succeed (posts/like/save/search).

