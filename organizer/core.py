import shutil
from pathlib import Path
from typing import List, Dict, Tuple
from organizer.config import get_category_for_extension
from organizer.logger import save_history, load_history, clear_history

def organize_directory(target_path: Path, dry_run: bool = False) -> Tuple[int, List[Dict[str, str]]]:
    if not target_path.exists() or not target_path.is_dir():
        raise ValueError(f"Direktori '{target_path}' tidak ditemukan atau bukan folder.")

    operations = []
    success_count = 0

    # Scan files in the target directory (non-recursive for simplicity, or top-level files)
    files = [f for f in target_path.iterdir() if f.is_file() and not f.name.startswith('.')]

    for file_path in files:
        ext = file_path.suffix
        category = get_category_for_extension(ext)

        category_dir = target_path / category
        destination_path = category_dir / file_path.name

        # Handle name collision
        if destination_path.exists() and destination_path != file_path:
            counter = 1
            while True:
                new_name = f"{file_path.stem}_{counter}{file_path.suffix}"
                destination_path = category_dir / new_name
                if not destination_path.exists():
                    break
                counter += 1

        operations.append({
            "from": str(file_path.resolve()),
            "to": str(destination_path.resolve())
        })

        if not dry_run:
            category_dir.mkdir(exist_ok=True, parents=True)
            shutil.move(str(file_path), str(destination_path))

        success_count += 1

    if not dry_run and operations:
        save_history(target_path, operations)

    return success_count, operations

def undo_organization(target_path: Path) -> int:
    history = load_history(target_path)
    if not history or "operations" not in history:
        raise ValueError("Tidak ada riwayat perapian yang dapat dibatalkan (undo) di folder ini.")

    operations = history["operations"]
    undo_count = 0

    # Reverse operations
    for op in reversed(operations):
        src = Path(op["to"])
        dest = Path(op["from"])

        if src.exists():
            dest.parent.mkdir(exist_ok=True, parents=True)
            shutil.move(str(src), str(dest))
            undo_count += 1

    # Clean up empty category directories created during organization
    for op in operations:
        cat_dir = Path(op["to"]).parent
        if cat_dir.exists() and cat_dir != target_path:
            try:
                # Remove only if empty
                if not any(cat_dir.iterdir()):
                    cat_dir.rmdir()
            except Exception:
                pass

    clear_history(target_path)
    return undo_count
