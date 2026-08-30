import json
from pathlib import Path
from typing import Dict, List

DEFAULT_CATEGORIES: Dict[str, List[str]] = {
    "Dokumen": [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".xls", ".pptx", ".ppt", ".csv", ".odt", ".rtf"],
    "Gambar": [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp", ".ico", ".tiff"],
    "Video": [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"],
    "Audio": [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"],
    "Arsip": [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    "Kode & Pemrograman": [".js", ".ts", ".py", ".html", ".css", ".json", ".cpp", ".c", ".java", ".go", ".rs", ".sql", ".sh"],
}

def get_category_for_extension(ext: str) -> str:
    ext_lower = ext.lower()
    for category, extensions in DEFAULT_CATEGORIES.items():
        if ext_lower in extensions:
            return category
    return "Lainnya"
