import pytest
from pathlib import Path
from organizer.config import get_category_for_extension
from organizer.core import organize_directory, undo_organization

def test_get_category_for_extension():
    assert get_category_for_extension(".pdf") == "Dokumen"
    assert get_category_for_extension(".jpg") == "Gambar"
    assert get_category_for_extension(".mp4") == "Video"
    assert get_category_for_extension(".unknown_ext") == "Lainnya"

    # Custom categories test
    custom = {"Media": [".pic", ".vid"]}
    assert get_category_for_extension(".pic", custom) == "Media"
    assert get_category_for_extension(".pdf", custom) == "Lainnya"

def test_organize_directory_basic(tmp_path: Path):
    # Create dummy files
    file1 = tmp_path / "document.pdf"
    file1.write_text("hello pdf")
    file2 = tmp_path / "photo.png"
    file2.write_text("hello png")

    count, ops = organize_directory(tmp_path, dry_run=False)
    assert count == 2
    assert (tmp_path / "Dokumen" / "document.pdf").exists()
    assert (tmp_path / "Gambar" / "photo.png").exists()

def test_organize_directory_dry_run(tmp_path: Path):
    file1 = tmp_path / "notes.txt"
    file1.write_text("notes")

    count, ops = organize_directory(tmp_path, dry_run=True)
    assert count == 1
    # File should NOT be moved in dry run
    assert file1.exists()
    assert not (tmp_path / "Dokumen" / "notes.txt").exists()

def test_undo_organization(tmp_path: Path):
    file1 = tmp_path / "report.pdf"
    file1.write_text("report")

    # Organize
    organize_directory(tmp_path, dry_run=False)
    assert not file1.exists()
    assert (tmp_path / "Dokumen" / "report.pdf").exists()

    # Undo
    undo_count = undo_organization(tmp_path)
    assert undo_count == 1
    assert file1.exists()
    assert not (tmp_path / "Dokumen" / "report.pdf").exists()

def test_recursive_organizing(tmp_path: Path):
    sub_dir = tmp_path / "subfolder"
    sub_dir.mkdir()
    file_sub = sub_dir / "music.mp3"
    file_sub.write_text("audio content")

    count, ops = organize_directory(tmp_path, dry_run=False, recursive=True)
    assert count == 1
    assert (tmp_path / "Audio" / "music.mp3").exists()
    assert not file_sub.exists()
