# maplibre-app:

this project is a react app i created to practice javascript, css, and working with the open-source maplibre library.

# day trip: laguna beach

recently, i went on a day trip with some friends to laguna beach and i remembered stressing out the few nights before planning what i wanted to do there. taking inspiration from that experience, i thought it would be fun to create a map-based application that has a list of recommended places to visit and itinerary list a user can add to.

# things i plan to add

1: images of the locations when the user hovers over the rotating buttons
2: expand the website to have a dropdown menu with other day-trip-locations i have itinerary recommendations for
3: find a better map

# running locally

the location data now lives in a small SQLite-backed API server instead of a hardcoded file, so two things need to run at once:

```
# terminal 1 - API server (first time only: cd server && npm install)
cd server && npm start

# terminal 2 - React app
npm start
```

the React dev server proxies `/api/*` requests to the API server on port 4000.

# guest / admin

everyone starts in the guest view: pick from the default locations, suggest new ones for the shared
list (admin reviews these), and add personal spots that only live in your own browser.

switching to the admin view (top-right of the header) is gated by a shared passcode, checked server-side
(`ADMIN_KEY` in the environment, defaults to `laguna-admin`) - it's not real user accounts, just enough to
keep guests from adding/editing/deleting the default locations. admin can also review guest-suggested spots,
which get grouped by name so repeat suggestions count toward one entry, and promote or dismiss them.

# deploying

Vercel only serves the static React build - it can't run the API server (no persistent disk for
the SQLite file, and no long-running process). so the API needs to run somewhere else, and the
deployed frontend needs to be told where to find it.

**1. deploy the API to Render (free tier):**
- push this repo to GitHub (already done if you're reading this on GitHub)
- on [render.com](https://render.com): New > Blueprint, connect this repo - it reads `render.yaml`
  at the repo root and configures the service automatically (root dir `server`, `npm install` /
  `npm start`, Node >=22.5 for `node:sqlite`)
- optionally set an `ADMIN_KEY` value in the Render dashboard instead of using the `laguna-admin` default
- once deployed, copy the service URL, e.g. `https://maplibre-app-api.onrender.com`

Note: Render's free plan doesn't persist disk across redeploys - the SQLite file (and anything
added through the app) resets to the seed locations whenever the API is redeployed. It does
survive normal idling/spin-down/spin-up between requests, just not a new deploy.

**2. point the deployed frontend at it:**
- on Vercel: Project Settings > Environment Variables > add `REACT_APP_API_BASE` =
  `https://maplibre-app-api.onrender.com/api` (your Render URL + `/api`)
- redeploy the Vercel project so the build picks up the new environment variable

Locally, `REACT_APP_API_BASE` is left unset and defaults to the relative `/api` path, which CRA's
dev-server proxy already forwards to `http://localhost:4000` - no change needed for local dev.