import shutil
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Any
from organizer.config import get_category_for_extension
from organizer.logger import save_history, load_history, clear_history

def organize_directory(
    target_path: Path,
    dry_run: bool = False,
    recursive: bool = False,
    custom_categories: Optional[Dict[str, List[str]]] = None
) -> Tuple[int, List[Dict[str, str]]]:
    if not target_path.exists() or not target_path.is_dir():
        raise ValueError(f"Direktori '{target_path}' tidak ditemukan atau bukan folder.")

    operations = []
    success_count = 0

    if recursive:
        files = [f for f in target_path.rglob("*") if f.is_file() and not f.name.startswith('.') and target_path in f.parents]
    else:
        files = [f for f in target_path.iterdir() if f.is_file() and not f.name.startswith('.')]

    for file_path in files:
        if file_path.parent != target_path and not recursive:
            continue

        if file_path.is_symlink():
            continue

        ext = file_path.suffix
        raw_category = get_category_for_extension(ext, custom_categories)

        # Sanitize category name to prevent path traversal
        category = Path(raw_category).name
        if not category or category in (".", ".."):
            category = "Lainnya"

        category_dir = target_path / category

        if file_path.parent == category_dir:
            continue

        if category_dir.exists() and not category_dir.is_dir():
            raise ValueError(f"Konflik: Nama kategori '{category}' sudah digunakan oleh file biasa, bukan folder.")

        destination_path = category_dir / file_path.name

        # Validate destination is strictly inside target_path
        try:
            resolved_target = target_path.resolve()
            resolved_dest = destination_path.resolve()
            if not resolved_dest.is_relative_to(resolved_target):
                continue
        except Exception:
            continue

        if destination_path.exists() and destination_path != file_path:
            counter = 1
            while True:
                new_name = f"{file_path.stem}_{counter}{file_path.suffix}"
                destination_path = category_dir / new_name
                if not destination_path.exists():
                    break
                counter += 1

        if not dry_run:
            try:
                category_dir.mkdir(exist_ok=True, parents=True)
                shutil.move(str(file_path), str(destination_path))
                operations.append({
                    "from": str(file_path.resolve()),
                    "to": str(destination_path.resolve())
                })
                success_count += 1
            except Exception:
                continue
        else:
            operations.append({
                "from": str(file_path.resolve()),
                "to": str(destination_path.resolve())
            })
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

    for op in reversed(operations):
        src = Path(op["to"])
        dest = Path(op["from"])

        if src.exists():
            try:
                dest.parent.mkdir(exist_ok=True, parents=True)
                shutil.move(str(src), str(dest))
                undo_count += 1
            except Exception:
                continue

    for op in operations:
        cat_dir = Path(op["to"]).parent
        if cat_dir.exists() and cat_dir.is_dir() and cat_dir != target_path:
            try:
                if not any(cat_dir.iterdir()):
                    cat_dir.rmdir()
            except Exception:
                pass

    if undo_count > 0:
        clear_history(target_path)

    return undo_count

def get_folder_statistics(target_path: Path) -> Dict[str, Any]:
    if not target_path.exists() or not target_path.is_dir():
        raise ValueError(f"Direktori '{target_path}' tidak ditemukan atau bukan folder.")

    total_files = 0
    total_size_bytes = 0
    categories_breakdown = {}

    for item in target_path.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            cat_name = item.name
            cat_files = [f for f in item.rglob("*") if f.is_file()]
            cat_count = len(cat_files)
            cat_size = sum(f.stat().st_size for f in cat_files if f.exists())

            categories_breakdown[cat_name] = {
                "count": cat_count,
                "size_bytes": cat_size
            }
            total_files += cat_count
            total_size_bytes += cat_size
        elif item.is_file() and not item.name.startswith('.'):
            total_files += 1
            total_size_bytes += item.stat().st_size
            categories_breakdown.setdefault("Unorganized / Root", {"count": 0, "size_bytes": 0})
            categories_breakdown["Unorganized / Root"]["count"] += 1
            categories_breakdown["Unorganized / Root"]["size_bytes"] += item.stat().st_size

    return {
        "total_files": total_files,
        "total_size_bytes": total_size_bytes,
        "categories": categories_breakdown
    }
