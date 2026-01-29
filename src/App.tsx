import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import MusicSettings from "./Components/MusicSettings.tsx";
import MuiscForm from "./Components/MusicForm.tsx";
import "./Styles/Init.scss";

function App() {

    // async function searchMusic(source: string, name: string, count: number, pages: number) {
    //     try {
    //         const data = await invoke<searchMusicRes>("req_music"), { }
    //     }
    //     catch (e) { }
    // }
    return (
        <div>
            <MusicSettings />
            <MuiscForm />
        </div>
    );
}

export default App;
