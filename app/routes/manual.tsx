import { ActionArgs, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { exec } from "child_process";
import { createCanvas } from "canvas";
import fs from "fs";
import { join } from "path";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Discogs Printer" }];
};

export default function Collection() {
    const actionData = useActionData<typeof action>();
    return <>
        <Form method="post" className="flex flex-col gap-2">
            <input type="text" name="year" id="year" placeholder="Year" className="px-3 py-2 w-64 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm transition outline-none focus:ring-1 focus:ring-stone-600" />
            <input type="text" name="runtime" id="runtime" placeholder="Runtime" className="px-3 py-2 w-64 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-sm transition outline-none focus:ring-1 focus:ring-stone-600" />
            <button className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">PRINT LABEL</button>
        </Form>
        <Link to="/" className="w-fit text-stone-100 font-medium tracking-wide px-4 py-2 text-xs bg-indigo-700 hover:bg-indigo-600 transition rounded-lg">BACK TO MENU</Link>
    </>;
}

export async function action({ request }: ActionArgs) {
    const formData = await request.formData(),
        year = formData.get("year") as string,
        runtime = formData.get("runtime") as string,
        canvas = createCanvas(200, 56, 'pdf'),
        ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`Released ${year}`, 4, 0);
    ctx.fillText(`Runtime: ${runtime}`, 4, 16);
    fs.mkdirSync(join(process.cwd(), "public", "generated"), { recursive: true });
    const promise = await new Promise<{success: Boolean, message?: string}>(resolve => {
      const path = join(process.cwd(), "public", "generated", `manual${Date.now()}.pdf`),
        ws = fs.createWriteStream(path),
        cs = canvas.createPDFStream();
      cs.pipe(ws);
      ws.on('finish', () => {
        exec(`lp ${!process.env.LP_PARAMS ? "" : process.env.LP_PARAMS + " "}${path}`, (err, stdout, stderr) => {
          if(err || stderr) return resolve({success: false, message: "An error occurred when printing."});
          return resolve({success: true});
        });
      });
    })
    return redirect("/");
}