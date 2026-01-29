import {
  mkdir,
  exists,
  writeTextFile,
  BaseDirectory,
  readTextFile,
} from "@tauri-apps/plugin-fs";
import { audioDir } from "@tauri-apps/api/path";
import "../Styles/MusicSettings.scss";

/*
    Click Button to open setting page

    TODO:Load existent config
    TODO:SideEffect?  Async update?
*/
export const toneQuality = [
  "128K: Standerd",
  "192K: HighQuality",
  "320K: HighQuality",
  "16Bit: Lossless",
  "24Bit: Lossless",
];

export interface settingForm {
  General_quality: string;
  Local_path: string;
  Server_interface: string;
}

async function getDefaultConfigObject() {
  const defaultPath = await audioDir();
  return {
    General_quality: toneQuality[1],
    Local_path: defaultPath,
    Server_interface: "https://music.kaing.top",
  };
}

export const appConfigFile = {
  fileName: "config.json",
  baseDir: BaseDirectory.AppConfig,
};

export async function parseConfig() {
  // Check Directory existence
  const dirExists = await exists("", {
    baseDir: appConfigFile.baseDir,
  });

  if (!dirExists) {
    await mkdir("", {
      baseDir: appConfigFile.baseDir,
      recursive: true,
    });
  }

  // Check File existence
  const configExist = await exists(appConfigFile.fileName, {
    baseDir: appConfigFile.baseDir,
  });
  if (!configExist) {
    const defaultConfigJson = JSON.stringify(await getDefaultConfigObject());
    await writeTextFile(appConfigFile.fileName, defaultConfigJson, {
      baseDir: appConfigFile.baseDir,
    });
  }
  const configJson = await readTextFile(appConfigFile.fileName, {
    baseDir: appConfigFile.baseDir,
  });
  const configObject: settingForm = JSON.parse(configJson);
  return configObject;
}
