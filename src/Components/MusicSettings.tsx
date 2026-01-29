import { open } from '@tauri-apps/plugin-dialog';
import { mkdir, exists, writeTextFile } from '@tauri-apps/plugin-fs';
import React from "react";
import "../Styles/MusicSettings.scss"
import {
    parseConfig,
    settingForm,
    appConfigFile,
    toneQuality
} from "./utils.ts";

/*
    Click Button to open setting page

    TODO:Load existent config
    TODO:SideEffect?  Async update?
*/



export default function MusicSettings() {

    const [isOpen, setIsOpen] = React.useState(false)
    const [config, setConfig] = React.useState({} as settingForm) // It will be rendered Once open settingPage


    async function hanleOpen() {
        setIsOpen(!isOpen)
        const configObject = await parseConfig()
        setConfig(configObject)
    }


    function handleClose() {
        setIsOpen(!isOpen)
    }


    async function handleBrowser() {
        const directory = await open({
            multiple: false,
            directory: true,
        });

        // Prevent from Cancel Selecting
        if (typeof directory == 'string') {
            setConfig({ ...config, Local_path: directory })

            console.log(`Download Path is ${directory} now`); // TODO:SideEffect?  Async update?
        }
        else {
            console.log(`Download Path is NOT CHANGED`);
        }
    }



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const formObject = Object.fromEntries(formData.entries());
        const formJson: string = JSON.stringify(formObject);
        setConfig(formObject as unknown as settingForm)
        // Check Directory Existence
        const dirExists = await exists(appConfigFile.fileName, { baseDir: appConfigFile.baseDir });
        if (!dirExists) {
            await mkdir(appConfigFile.fileName, { baseDir: appConfigFile.baseDir, recursive: true });
        }

        // Write
        await writeTextFile(appConfigFile.fileName, formJson, {
            baseDir: appConfigFile.baseDir
        })

        console.log(`${appConfigFile.fileName} is wrote!`);
        handleClose()

    }
    return (
        <div className="setting">
            <button className="setting-btn" onClick={hanleOpen}>⚙️</button>
            {isOpen &&
                <>
                    <div className="setting-backdrop"></div>
                    <div className="setting-dialog">
                        <div className="setting-dialog-bar">
                            <button className="setting-dialog-bar-btn" onClick={handleClose}>🕸️</button>
                        </div>

                        <form method="post"
                            onSubmit={handleSubmit}
                            className="setting-dialog-form" >
                            <fieldset className="setting-dialog-form-item">
                                <h1 className="dialog-title">General Settings</h1>
                                <label>
                                    Select Quality👉
                                    <select name="General_quality"
                                        value={config.General_quality}
                                        onChange={(e) => setConfig({ ...config, General_quality: e.target.value })}
                                    >

                                        {toneQuality.map(quality => <option key={quality}>{quality}</option>)}
                                    </select>
                                </label>
                            </fieldset>
                            <fieldset className="setting-dialog-form-item">
                                <h1 className="dialog-title">Local Settings</h1>
                                <label>
                                    Download Path:<input value={config.Local_path}
                                        onChange={(e) => {
                                            setConfig({ ...config, Local_path: e.target.value })
                                        }} name="Local_path"
                                        type="text" />
                                </label>
                                <button type="button"
                                    onClick={handleBrowser}>Browser</button>
                            </fieldset>
                            <fieldset className="setting-dialog-form-item">
                                <h1 className="dialog-title">Server Settings</h1>
                                <label>
                                    Server Interface:<input value={config.Server_interface}
                                        onChange={(e) => setConfig({ ...config, Server_interface: e.target.value })}
                                        name="Server_interface"
                                        type="text" />
                                </label>
                            </fieldset>
                            <button id="setting-save"
                                type="submit">Save Settings</button>
                        </form>
                    </div>
                </>
            }
        </div>
    )
}

