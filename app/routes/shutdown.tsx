import { Response } from "@remix-run/node";
import { exec } from "child_process";

export async function loader() {
    exec("sudo shutdown now");
    return new Response(null, {
        status: 200
    });
}