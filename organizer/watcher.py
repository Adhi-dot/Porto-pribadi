import time
from pathlib import Path
from typing import Optional, Dict, List
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from organizer.core import organize_directory

try:
    from plyer import notification
    HAS_NOTIFICATION = True
except ImportError:
    HAS_NOTIFICATION = False

class OrganizerHandler(FileSystemEventHandler):
    def __init__(self, target_path: Path, custom_categories: Optional[Dict[str, List[str]]] = None):
        self.target_path = target_path
        self.custom_categories = custom_categories

    def on_created(self, event):
        if event.is_directory:
            return

        file_path = Path(event.src_path)
        if file_path.name.startswith('.') or file_path.suffix in ['.crdownload', '.tmp', '.part']:
            return

        time.sleep(0.5)
        try:
            count, ops = organize_directory(self.target_path, dry_run=False, recursive=False, custom_categories=self.custom_categories)
            if count > 0:
                msg = f"File baru '{file_path.name}' berhasil dirapikan!"
                print(f"[Auto-Organizer] {msg}")
                if HAS_NOTIFICATION:
                    try:
                        notification.notify(
                            title="Pengatur File Otomatis",
                            message=msg,
                            timeout=3
                        )
                    except Exception:
                        pass
        except Exception as e:
            print(f"[Auto-Organizer] Gagal merapikan file {file_path.name}: {e}")

def start_watching(target_path: Path, custom_categories: Optional[Dict[str, List[str]]] = None):
    event_handler = OrganizerHandler(target_path, custom_categories)
    observer = Observer()
    observer.schedule(event_handler, path=str(target_path), recursive=False)
    observer.start()
    return observer
