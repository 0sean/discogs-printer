import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Discogs Printer" }];
};

export default function Index() {
  const data: {success: true, items?: {id: number, thumbnail: string, artist: string, title: string, format: string, date_added: string;}[]} | {success: false, message: string} = useLoaderData();
  return <>
      {data.success == true && <>
        <p className="text-stone-100 text-sm pb-2">Print labels for your Discogs collection.</p>
        <div className="p-4 bg-stone-800 rounded-lg w-fit">
          <p className="text-stone-100 font-medium tracking-wide text-xs pb-2">LATEST ADDITION</p>
          <div className="flex gap-3">
            <img src={data.items![0].thumbnail} className="w-28 h-28 rounded-lg" alt="Album art" />
            <div>
              <h2 className="text-stone-100 font-bold tracking-wide">{data.items![0].title}</h2>
              <p className="text-stone-100 text-sm">{data.items![0].artist}</p>
              <p className="text-stone-100 text-sm pb-2">{data.items![0].format}</p>
              <Link to={`/print/${data.items![0].id}`} className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">PRINT LABEL</Link>
            </div>
          </div>
        </div>
        <Link to="/collection" className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">SELECT FROM COLLECTION</Link>
        <Link to="/enter" className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">ENTER DISCOGS URL</Link>
      </>}
      {data.success == false && <p className="text-red-700 text-sm pb-2">{data.message}</p>}
  </>;
}

export async function loader() {
  const identity = await fetch(`https://api.discogs.com/oauth/identity?token=${process.env.DISCOGS_KEY}`);
  if(identity.status == 200) {
    // TODO: Handle pagination
    const { resource_url } = await identity.json(),
      collection = await fetch(`${resource_url}/collection?token=${process.env.DISCOGS_KEY}&per_page=100`);
    if (collection.status == 200) {
      const { releases }: { releases: {release_id: number, date_added: string, basic_information: {thumb: string, artists_sort: string, title: string, formats: {name: string, descriptions: string[]}[]}}[] } = await collection.json(),
        items = releases.map(r => { return {id: r.release_id, thumbnail: r.basic_information.thumb, artist: r.basic_information.artists_sort, title: r.basic_information.title, format: `${r.basic_information.formats[0].name} (${r.basic_information.formats[0].descriptions.join(", ")})`, date_added: r.date_added} }).sort((a, b) => { return Number(new Date(b.date_added)) - Number(new Date(a.date_added)) });
        return json({success: true, items});
    } else {
      return json({success: false, message: "Error fetching collection.", items: []});
    }
  } else {
    return json({success: false, message: "Error fetching user.", items: []});
  }
}
