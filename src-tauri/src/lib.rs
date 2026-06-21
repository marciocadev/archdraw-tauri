use serde::Deserialize;
use std::path::Path;

#[derive(Deserialize)]
pub struct ProjectFilePayload {
    relative_path: String,
    content: String,
}

#[tauri::command]
fn save_diagram_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(path, content).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_project_files(base_path: String, files: Vec<ProjectFilePayload>) -> Result<(), String> {
    let base = Path::new(&base_path);

    for file in files {
        let file_path = base.join(&file.relative_path);
        if let Some(parent) = file_path.parent() {
            std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }
        std::fs::write(file_path, file.content).map_err(|error| error.to_string())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![save_diagram_file, write_project_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
