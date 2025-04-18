# 🖨️ Discogs Printer
<img align="right" width="400" height="400" src="https://github.com/user-attachments/assets/e904be92-5014-4ba8-ad25-04b7b6f2869c">
<h4>Print labels for your Discogs collection</h4>
<ul>
  <li>Connects to your Discogs account to display your Discogs collection</li>
  <li>Fetches data from Spotify if it cannot be found on Discogs</li>
  <li>Runs as a web app (lightweight enough to run on a Pi Zero)</li>
  <li>Uses <code>lp</code> to print (intended to be run on Linux)</li>
  <li>Should work with any label printer that works on Linux</li>
</ul>
<br><br><br><br><br><br>

## 📄 Supported label printers
Currently, the only officially supported label printer is the Brother QL-700, however this will work with other label printers **as long as they work with Linux**.

Behind the scenes, Discogs Printer uses the `lp` command to print a PDF of the label - as long as you can get your label printer working with `lp` printing a PDF, it'll work.

> **🖨️ Have the Brother QL-700?** View the [setup guide](QL700.md) if you need to know how to get it working in Linux

> **✅ Got it working with another printer?** Feel free to open a PR and add setup instructions/any extra parameters needed to make it work.

## 💿 Setup
Assuming you have your printer set up and have Node.js and Yarn installed, clone the repository and:
1. Install build dependencies `sudo apt install libpaxman-1-dev libcairo2-dev libpango1.0-dev libjpeg9-dev libgif-dev`
2. Install dependencies `yarn install` (if running on a Pi Zero, you may need to use `yarn install --network-timeout 100000`)
3. Create a `.env` file in the root of the repository and add the following environment variables:
   - `DISCOGS_KEY` - this is your Discogs personal access token which can be obtained from [here](https://www.discogs.com/settings/developers)
   - `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` - create a Spotify app [here](https://developer.spotify.com/dashboard)
   - (optional) `LP_PARAMS` - this is passed to `lp` when printing, it is likely required to make printing work properly, but depends on your printer.
     > **🖨️ Have the Brother QL-700?** Set this to the following value for printing to work correctly: `"-o media=62x29 -o landscape"`
4. Build the app by running `yarn build`

Once set up and built, you can run Discogs Printer by running `yarn start:with-env`
> **⁉️ You may want to use PM2 or something similar to run Discogs Printer on startup** (e.g. if you're running on a Raspberry Pi).

<br>
<blockquote>
  <details>
  <summary>License</summary>
  <br>

    Copyright (C) 2023-2024 0sean
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
</details>
</blockquote>
