import { fetch } from '@tauri-apps/plugin-http';
import { writeFile } from '@tauri-apps/plugin-fs';
import { invoke } from "@tauri-apps/api/core";
import React from "react";
import { toneQuality, parseConfig } from "./utils.ts"


interface songSearchRes {
    id: string
    name: string
    artist: string[]
    album: string
    pic_id: string
    url_id: string
    lyric_id: string
    source: string
    from: string
}

interface songSearchResClean {
    id: string
    name: string
    artist: string[]
    album: string
}

interface songGetRes {
    url: string
    br: string
    size: string
    from: string
}

// interface settingForm {
//     General_quality: string;
//     Local_path: string;
//     Server_interface: string;
// }
//

export default function MusicForm() {
    const [table, setTable] = React.useState([] as songSearchResClean[]);
    const [source, setSource] = React.useState("netease"); // export source For handleDownload


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const formObject = Object.fromEntries(formData.entries());

        // Notice Hardcode Page
        const formPayload = {
            source: formObject.source as string,
            name: formObject.name as string,
            count: parseInt(formObject.count as string) || 20,
            pages: 1
        };
        setSource(formPayload.source) // export source
        const res = await invoke<songSearchRes[]>("search_music", formPayload)
        const resClean = res.map(song => {
            return {
                id: song.id,
                album: song.album,
                name: song.name,
                artist: song.artist
            }
        })
        console.log(resClean);

        setTable(resClean)
    }
    async function handleDownload(id: string, name: string) {
        const configObject = await parseConfig()

        const request = {
            source: source,
            id: id,
            br: (() => {
                switch (configObject.General_quality) {
                    case toneQuality[0]:
                        return "128";
                    case toneQuality[1]:
                        return "192";
                    case toneQuality[2]:
                        return "320";
                    case toneQuality[3]:
                        return "740";
                    case toneQuality[4]:
                        return "999";
                    default:
                        throw new Error(`Unknown quality: ${configObject.General_quality}`);
                }
            })()
        }
        const res = await invoke<songGetRes>("get_music", request)
        console.log(res);
        const httpRes = await fetch(res.url)

        // Handle filename and filepath
        // Example url: "https://m701.music.126.net/20260129111133/ff5c891c4b885c89cde74119a2eb391a/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/14673338307/b082/8084/bce9/7a19736bfc0f73f7df1ae035043fcfc5.mp3"


        if (!httpRes.ok) throw new Error("Request Url Missing");

        const extension = String(httpRes.url).split('.').pop();
        const safeName = name.replace(/[\\/:*?"<>|]/g, "_");
        const filepath = `${configObject.Local_path}/${safeName}.${extension}`;
        console.log(filepath);

        const fileData = await httpRes.arrayBuffer();
        const fileDataPayload = new Uint8Array(fileData);
        // TODO download to certain path
        // TODO Tauri Plugin promission

        await writeFile(filepath, fileDataPayload);
    }
    return (
        <div>
            <form method="post" onSubmit={handleSubmit}>
                <label>
                    Source: <input defaultValue="netease" name="source" />
                </label>
                <br />
                <label>
                    Name: <input name="name" />
                </label>
                <br />
                <label>
                    Count: <input name="count" type="number" />
                </label>
                <hr />
                <button type="reset">Reset form</button>
                <button type="submit">Submit form</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Album</th>
                        <th>Artist</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {table.map((song) => (
                        <tr key={song.id}>
                            <td>{song.name}</td>
                            <td>{song.artist.join(', ')}</td>
                            <td>{song.album}</td>
                            <td>
                                <button onClick={() => handleDownload(song.id, song.name)}>
                                    Download
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
