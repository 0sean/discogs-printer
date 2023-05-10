// import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import tailwind from "./tailwind.css";
import inter400 from "@fontsource/inter/400.css"
import inter500 from "@fontsource/inter/500.css"
import inter700 from "@fontsource/inter/700.css"
import printer from "~/assets/printer.png";

export const links: LinksFunction = () => [
  // ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: inter400 },
  { rel: "stylesheet", href: inter500 },
  { rel: "stylesheet", href: inter700 }
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex bg-stone-900 min-h-screen w-full p-4 flex-col gap-2">
          <div className="flex gap-2 items-center">
            <img src={printer} alt="Printer emoji" className="w-8 h-8" />
            <h1 className="text-stone-100 font-bold tracking-wide">Discogs Printer</h1>
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
