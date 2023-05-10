import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createCanvas } from "canvas";
import fs from "fs";
import { join } from "path";
import { useEffect } from "react";
import { exec } from "child_process";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Discogs Printer" }];
};

export default function Print() {
    const data: {success: boolean, message?: string} = useLoaderData();
    useEffect(() => {
      setTimeout(() => {
        window.location.pathname = "/";
      }, 5000);
    }, []);
    return <>
      {data.success == true && <div className="p-4 bg-stone-800 rounded-lg w-fit">
        <svg className="mx-auto" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 36 36"><path fill="#77B255" d="M36 32a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28z"/><path fill="#FFF" d="M29.28 6.362a2.502 2.502 0 0 0-3.458.736L14.936 23.877l-5.029-4.65a2.5 2.5 0 1 0-3.394 3.671l7.209 6.666c.48.445 1.09.665 1.696.665c.673 0 1.534-.282 2.099-1.139c.332-.506 12.5-19.27 12.5-19.27a2.5 2.5 0 0 0-.737-3.458z"/></svg>
        <h2 className="text-stone-100 font-bold tracking-wide">Successfully sent to printer!</h2>
      </div>}
      {data.success == false && <p className="text-red-700 text-sm pb-2">{data.message}</p>}
    </>;
}

export const loader = async ({ params }: LoaderArgs) => {
  const release = await fetch(`https://api.discogs.com/releases/${params.id}?token=${process.env.DISCOGS_KEY}`);
  if(release.status == 200) {
    const { tracklist, year, artists_sort, title, id }: { tracklist: { duration: string }[], year: number, artists_sort: string, title: string, id: number } = await release.json();
    let duration: number = 0;
    if(tracklist.filter(t => !t.duration).length) {
      // if not all on discogs, go to spotify or other apis
      // TODO: pagination
      const token = await fetch("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      if(token.status == 200) {
        const { access_token }: { access_token: string } = await token.json(),
          search = await fetch(`https://api.spotify.com/v1/search?type=album&q=artist:${artists_sort.replace(/\([0-9]{1,}\)/gm, "").trim()} album:${title}`, {headers: {
            "Authorization": `Bearer ${access_token}`
          }});
          if (search.status == 200) {
            const {albums: {items}} = await search.json(),
              tracks = await fetch(`https://api.spotify.com/v1/albums/${items[0].id}/tracks?limit=50`, {headers: {
                "Authorization": `Bearer ${access_token}`
              }});
            if(tracks.status == 200) {
              const { items: track_items } = await tracks.json();
              track_items.forEach(ti => {
                duration += ti.duration_ms / 1000;
              });
            } else {
              return json({success: false, message: "Couldn't get Spotify album tracks."});
            }
          } else {
            return json({success: false, message: "Couldn't get Spotify album."});
          }
      } else {
        const error = await token.text();
        console.log(error);
        return json({success: false, message: "Couldn't get Spotify access token."});
      }
    } else {
      tracklist.forEach(t => {
        const times = t.duration.split(":");
        if(times.length == 3) {
          const hours = Number(times[0]) || 0,
            minutes = Number(times[1]) || 0,
            seconds = Number(times[2]) || 0;
          duration += (hours * 3600) + (minutes * 60) + seconds;
        } else if (times.length == 2) {
          const minutes = Number(times[0]) || 0,
            seconds = Number(times[1]) || 0;
          duration += (minutes * 60) + seconds;
        }
      });
    }
    const canvas = createCanvas(200, 40, 'pdf'),
      ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`Released ${year}`, 0, 0);
    const hours = Math.floor(duration / 3600).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    }),
      minutes = Math.floor((((duration / 3600) % 1) * 3600) / 60).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      }),
      seconds = Math.floor((((((duration / 3600) % 1) * 3600) / 60) % 1) * 60).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });
    ctx.fillText(`Runtime: ${hours}:${minutes}:${seconds}`, 0, 16);
    fs.mkdirSync(join(process.cwd(), "public", "generated"), { recursive: true });
    const promise = await new Promise<{success: Boolean, message?: string}>(resolve => {
      const path = join(process.cwd(), "public", "generated", `${id}.pdf`),
        ws = fs.createWriteStream(path),
        cs = canvas.createPDFStream();
      cs.pipe(ws);
      ws.on('finish', () => {
        exec(`lp ${path}`, (err, stdout, stderr) => {
          if(err || stderr) return resolve({success: false, message: "An error occurred when printing."});
          return resolve({success: true});
        });
      });
    })
    return json(promise);
  } else {
    return json({success: false, message: "Couldn't get release from Discogs."});
  }
}