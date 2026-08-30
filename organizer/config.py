import json
from pathlib import Path
from typing import Dict, List, Any

DEFAULT_CATEGORIES: Dict[str, List[str]] = {
    "Dokumen": [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".xls", ".pptx", ".ppt", ".csv", ".odt", ".rtf"],
    "Gambar": [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp", ".ico", ".tiff"],
    "Video": [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    "Audio": [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"],
    "Arsip": [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    "Kode & Pemrograman": [".js", ".ts", ".py", ".html", ".css", ".json", ".cpp", ".c", ".java", ".go", ".rs", ".sql", ".sh"],
}

def load_custom_config(config_path: Path) -> Dict[str, List[str]]:
    if not config_path.exists():
        raise FileNotFoundError(f"File konfigurasi '{config_path}' tidak ditemukan.")
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Expecting format: {"categories": {"KategoriNama": [".ext1", ".ext2"]}}
            if "categories" in data:
                return data["categories"]
            return data
    except Exception as e:
        raise ValueError(f"Gagal membaca file konfigurasi JSON: {e}")

def get_category_for_extension(ext: str, custom_categories: Dict[str, List[str]] = None) -> str:
    categories = custom_categories if custom_categories else DEFAULT_CATEGORIES
    ext_lower = ext.lower()
    for category, extensions in categories.items():
        if ext_lower in extensions:
            return category
    return "Lainnya"
