import { ActionArgs, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Discogs Printer" }];
};

export default function Collection() {
    const actionData = useActionData<typeof action>();
    return <>
        {actionData != undefined && <p className={actionData.success ? "text-stone-100 mb-2 px-4 py-2 bg-green-900 bg-opacity-50 w-fit border border-green-900 rounded-lg hover:bg-opacity-75 transition" : "text-stone-100 mb-2 px-4 py-2 bg-red-900 bg-opacity-50 w-fit border border-red-900 rounded-lg hover:bg-opacity-75 transition"}>{actionData.message}</p>}
        <Form method="post" className="flex flex-col gap-2">
            <input type="text" name="url" id="url" placeholder="Discogs URL" className="px-3 py-2 w-64 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm transition outline-none focus:ring-1 focus:ring-stone-600" />
            <button className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">PRINT LABEL</button>
        </Form>
        <Link to="/" className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">BACK TO MENU</Link>
    </>;
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData(),
        discogsUrl = formData.get("url") as string,
        regex = new RegExp('\\/release\\/[0-9]+', 'gm'),
        release = regex.exec(discogsUrl);
    if(release != null) {
        return redirect(`/print/${release[0].split("/")[2]}`);
    } else {
        return json({success: false, message: "Couldn't get release from Discogs."});
    }
}