import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { loader as indexLoader } from "./_index";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Discogs Printer" }];
};

export default function Collection() {
    const data: {success: true, items?: {id: number, thumbnail: string, artist: string, title: string, format: string, date_added: string;}[]} | {success: false, message: string} = useLoaderData();
    return <>
        {data.success == true && <table className="bg-stone-800 rounded-lg w-fit">
            {data.items?.map(i => {
                return <tr key={i.id}>
                    <td className="p-4">
                        <img src={i.thumbnail} className="w-28 h-28 rounded-lg" alt="Album art" />
                    </td>
                    <td className="p-4">
                        <h2 className="text-stone-100 font-bold tracking-wide">{i.title}</h2>
                        <p className="text-stone-100 text-sm">{i.artist}</p>
                        <p className="text-stone-100 text-sm pb-2">{i.format}</p>
                    </td>
                    <td className="p-4">
                        <Link to={`/print/${i.id}`} className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">PRINT LABEL</Link>
                    </td>
                </tr>
            })}    
        </table>}
        {data.success == false && <p className="text-red-700 text-sm pb-2">{data.message}</p>}
        <Link to="/" className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">BACK TO MENU</Link>
    </>;
}

export const loader = indexLoader;