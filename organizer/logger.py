import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

LOG_FILE_NAME = ".file_organizer_history.json"

def save_history(target_dir: Path, operations: List[Dict[str, str]]):
    history_path = target_dir / LOG_FILE_NAME
    data = {
        "timestamp": datetime.now().isoformat(),
        "operations": operations
    }
    try:
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise IOError(f"Gagal menyimpan riwayat undo ke {history_path}: {e}")

def load_history(target_dir: Path) -> Dict[str, Any]:
    history_path = target_dir / LOG_FILE_NAME
    if not history_path.exists():
        return {}
    try:
        with open(history_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise IOError(f"Gagal membaca riwayat undo dari {history_path}: {e}")

def clear_history(target_dir: Path):
    history_path = target_dir / LOG_FILE_NAME
    if history_path.exists():
        try:
            history_path.unlink()
        except Exception:
            pass
