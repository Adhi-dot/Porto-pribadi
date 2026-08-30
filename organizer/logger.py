import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import hashlib

def _get_history_path(target_dir: Path) -> Path:
    resolved_target = target_dir.resolve()
    dir_hash = hashlib.sha256(str(resolved_target).encode("utf-8")).hexdigest()[:16]
    history_dir = Path.home() / ".file_organizer" / "history"
    history_dir.mkdir(parents=True, exist_ok=True)
    return history_dir / f"history_{dir_hash}.json"

def save_history(target_dir: Path, operations: List[Dict[str, str]]):
    history_path = _get_history_path(target_dir)
    data = {
        "timestamp": datetime.now().isoformat(),
        "target_dir": str(target_dir.resolve()),
        "operations": operations
    }
    try:
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise IOError(f"Gagal menyimpan riwayat undo ke {history_path}: {e}")

def load_history(target_dir: Path) -> Dict[str, Any]:
    history_path = _get_history_path(target_dir)
    if not history_path.exists():
        return {}
    try:
        with open(history_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise IOError(f"Gagal membaca riwayat undo dari {history_path}: {e}")

def clear_history(target_dir: Path):
    history_path = _get_history_path(target_dir)
    if history_path.exists():
        try:
            history_path.unlink()
        except Exception:
            pass
