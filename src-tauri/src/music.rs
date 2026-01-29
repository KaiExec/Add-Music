use reqwest;
use serde_json::Value;

// TODO Merge the music function into one

#[tauri::command]
pub async fn search_music(
    source: String,
    name: String,
    count: i32,
    pages: i32,
) -> Result<Value, String> {
    let url = format!("https://music-api.gdstudio.xyz/api.php?types=search&source={SOURCE}&name={NAME}&count={COUNT}&pages={PAGES}", SOURCE=source, NAME=name, COUNT=count, PAGES=pages);
    let res_json = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(res_json)
}

#[tauri::command]
pub async fn get_music(source: String, id: String, br: String) -> Result<Value, String> {
    let url = format!(
        "https://music-api.gdstudio.xyz/api.php?types=url&source={SOURCE}&id={ID}&br={BR}",
        SOURCE = source,
        ID = id,
        BR = br
    );
    let res_json = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    Ok(res_json)
}
