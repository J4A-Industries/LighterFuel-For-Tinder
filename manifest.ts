export default {
  "manifest_version": 3,
  "name": "LighterFuel For Tinder",
  "short_name": "LighterFuel",
  "description": "Used to get the time of when profile images are uploaded to tinder",
  "version": "1.3",
  "action": {
    "default_title": "LighterFuel",
    "default_icon": "src/assets/LighterFuel64.png",
    "default_popup": "index.html"
  },
  "icons": {
    "64": "LighterFuel64.png"
  },
  "externally_connectable": {
    "matches": ["*://tinder.com/*"]
  },
  "permissions": [
    "webRequest",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "*://*.tinder.com/*", 
    "*://*.gotinder.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["*://*.tinder.com/*"],
      "js": ["./static/js/LighterFuel.js"],
      "css": ["./injectedCss.css"],
      "all_frames": false,
      "run_at": "document_end"
    }
  ],
  "background": {
    "service_worker": "/static/js/background.js"
  },
  "web_accessible_resources": [{
    "resources": [
      "static/*", 
      "./injectedCss.css"
    ],
    "matches": ["<all_urls>"],
    "use_dynamic_url": true
  }]
}