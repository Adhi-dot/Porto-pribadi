import time
import typer
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from pathlib import Path
from organizer.core import organize_directory, undo_organization, get_folder_statistics
from organizer.config import load_custom_config
from organizer.watcher import start_watching

app = typer.Typer(
    help="🤖 Pengatur File Otomatis - Merapikan file Anda dengan mudah dan aman.",
    add_completion=False
)
console = Console()

def format_size(size_bytes: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    recursive: bool = typer.Option(False, "--recursive", "-r", help="Pindai sub-folder secara rekursif"),
    config: str = typer.Option(None, "--config", "-c", help="Path file konfigurasi JSON kustom")
):
    """
    Aplikasi Pengatur File Otomatis untuk Command Line.
    Jalankan tanpa argumen untuk masuk ke Mode Interaktif (Sangat disarankan untuk pemula).
    """
    if ctx.invoked_subcommand is not None:
        return

    console.print(Panel.fit(
        "[bold cyan]🤖 SELAMAT DATANG DI PENGATUR FILE OTOMATIS[/bold cyan]\n"
        "[dim]Merapikan folder yang berantakan menjadi rapi dalam hitungan detik![/dim]",
        border_style="cyan"
    ))

    default_downloads = Path.home() / "Downloads"
    default_desktop = Path.home() / "Desktop"

    console.print("\n[bold]📁 Pilih folder yang ingin dirapikan:[/bold]")
    console.print(f"  [1] Folder Downloads ({default_downloads}) [cyan](Default)[/cyan]")
    console.print(f"  [2] Folder Desktop ({default_desktop})")
    console.print("  [3] Ketik folder sendiri (Custom path)")

    choice = Prompt.ask("Pilihan Anda", choices=["1", "2", "3"], default="1")

    if choice == "1":
        target_path = default_downloads
    elif choice == "2":
        target_path = default_desktop
    else:
        custom_path = Prompt.ask("Masukkan path lengkap folder Anda")
        target_path = Path(custom_path).expanduser().resolve()

    if not target_path.exists() or not target_path.is_dir():
        console.print(f"[bold red]❌ Error: Folder '{target_path}' tidak ditemukan![/bold red]")
        raise typer.Exit(code=1)

    custom_categories = None
    if config:
        try:
            custom_categories = load_custom_config(Path(config).expanduser().resolve())
            console.print(f"[green]✔ Berhasil memuat konfigurasi kustom dari {config}[/green]")
        except Exception as e:
            console.print(f"[bold red]❌ Error config: {e}[/bold red]")
            raise typer.Exit(code=1)

    console.print("\n[bold]🛡️  Pilih mode eksekusi:[/bold]")
    console.print("  [1] Tampilkan pratinjau (Dry-Run) [green]- Aman, tidak langsung pindah[/green]")
    console.print("  [2] Langsung rapikan sekarang [yellow]- File langsung dipindahkan[/yellow]")

    mode_choice = Prompt.ask("Pilihan Anda", choices=["1", "2"], default="1")
    dry_run = (mode_choice == "1")

    console.print(f"\n[cyan]🔄 Memindai folder [bold]{target_path.name}[/bold]...[/cyan]")

    try:
        count, ops = organize_directory(
            target_path,
            dry_run=dry_run,
            recursive=recursive,
            custom_categories=custom_categories
        )

        if count == 0:
            console.print("[yellow]ℹ️  Tidak ada file yang perlu dirapikan di folder ini.[/yellow]")
            return

        if dry_run:
            console.print(f"\n[bold yellow]📋 PRATINJAU TINDAKAN ({count} file ditemukan):[/bold yellow]")
            for op in ops:
                src_name = Path(op["from"]).name
                dest_folder = Path(op["to"]).parent.name
                console.print(f"  • [cyan]{src_name}[/cyan] ➔ [green]{dest_folder}/[/green]")

            console.print("\n")
            if Confirm.ask("Apakah Anda ingin melanjutkan dan memindahkan file-file di atas?"):
                actual_count, _ = organize_directory(
                    target_path,
                    dry_run=False,
                    recursive=recursive,
                    custom_categories=custom_categories
                )
                console.print(f"\n[bold green]🎉 BERHASIL! {actual_count} file telah dirapikan ke tempatnya masing-masing.[/bold green]")
            else:
                console.print("[yellow]❌ Dibatalkan oleh pengguna. Tidak ada file yang diubah.[/yellow]")
        else:
            console.print(f"\n[bold green]🎉 BERHASIL! {count} file telah dirapikan ke tempatnya masing-masing.[/bold green]")
            console.print("[dim]💡 Ketik 'file-org undo' jika ingin membatalkan perubahan ini.[/dim]")

    except Exception as e:
        console.print(f"[bold red]❌ Terjadi kesalahan: {e}[/bold red]")
        raise typer.Exit(code=1)

@app.command("run")
def run_organizer(
    path: str = typer.Argument(..., help="Path folder yang ingin dirapikan"),
    dry_run: bool = typer.Option(False, "--dry-run", "-d", help="Tampilkan pratinjau tanpa memindahkan file"),
    recursive: bool = typer.Option(False, "--recursive", "-r", help="Pindai sub-folder secara rekursif"),
    config: str = typer.Option(None, "--config", "-c", help="Path file konfigurasi JSON kustom"),
):
    """Merapikan folder tertentu secara instan melalui command line."""
    target_path = Path(path).expanduser().resolve()
    console.print(f"[cyan]🔄 Memproses folder: {target_path}[/cyan]")

    custom_categories = None
    if config:
        try:
            custom_categories = load_custom_config(Path(config).expanduser().resolve())
        except Exception as e:
            console.print(f"[bold red]Error config: {e}[/bold red]")
            raise typer.Exit(code=1)

    try:
        count, ops = organize_directory(
            target_path,
            dry_run=dry_run,
            recursive=recursive,
            custom_categories=custom_categories
        )
        if dry_run:
            console.print(f"[yellow]Pratinjau: {count} file akan dipindahkan.[/yellow]")
            for op in ops:
                console.print(f"  {Path(op['from']).name} ➔ {Path(op['to']).parent.name}/")
        else:
            console.print(f"[bold green]Berhasil merapikan {count} file![/bold green]")
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")
        raise typer.Exit(code=1)

@app.command("undo")
def undo_cmd(
    path: str = typer.Argument(str(Path.home() / "Downloads"), help="Path folder yang ingin di-undo")
):
    """Membatalkan pemindahan file terakhir pada folder tertentu."""
    target_path = Path(path).expanduser().resolve()
    console.print(f"[cyan]↩️ Membatalkan perapian terakhir di: {target_path}[/cyan]")

    try:
        count = undo_organization(target_path)
        console.print(f"[bold green]✨ Berhasil mengembalikan {count} file ke posisi semula![/bold green]")
    except Exception as e:
        console.print(f"[bold red]Gagal melakukan undo: {e}[/bold red]")
        raise typer.Exit(code=1)

@app.command("stats")
def stats_cmd(
    path: str = typer.Argument(str(Path.home() / "Downloads"), help="Path folder yang ingin dilihat statistiknya")
):
    """Menampilkan statistik ringkasan dan distribusi file per kategori."""
    target_path = Path(path).expanduser().resolve()
    console.print(f"[cyan]📊 Menganalisis folder: {target_path}[/cyan]")

    try:
        stats = get_folder_statistics(target_path)
        console.print(Panel.fit(
            f"[bold]Total File:[/bold] {stats['total_files']}\n"
            f"[bold]Total Ukuran:[/bold] {format_size(stats['total_size_bytes'])}",
            title="Statistik Folder",
            border_style="green"
        ))

        table = Table(title="Distribusi Kategori File")
        table.add_column("Kategori / Folder", style="cyan")
        table.add_column("Jumlah File", justify="right", style="magenta")
        table.add_column("Ukuran Total", justify="right", style="green")

        for cat, data in stats["categories"].items():
            table.add_row(cat, str(data["count"]), format_size(data["size_bytes"]))

        console.print(table)
    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")
        raise typer.Exit(code=1)

@app.command("watch")
def watch_cmd(
    path: str = typer.Argument(str(Path.home() / "Downloads"), help="Path folder yang ingin dipantau secara real-time"),
    config: str = typer.Option(None, "--config", "-c", help="Path file konfigurasi JSON kustom")
):
    """Memantau folder secara otomatis (real-time) dan merapikan file baru seketika."""
    target_path = Path(path).expanduser().resolve()
    if not target_path.exists():
        console.print(f"[bold red]Error: Folder '{target_path}' tidak ditemukan![/bold red]")
        raise typer.Exit(code=1)

    custom_categories = None
    if config:
        try:
            custom_categories = load_custom_config(Path(config).expanduser().resolve())
        except Exception as e:
            console.print(f"[bold red]Error config: {e}[/bold red]")
            raise typer.Exit(code=1)

    console.print(Panel.fit(
        f"[bold green]👀 Sedang memantau folder:[/bold green] {target_path}\n"
        "[dim]Setiap file baru yang masuk akan otomatis dirapikan. Tekan Ctrl+C untuk berhenti.[/dim]",
        border_style="green"
    ))

    observer = start_watching(target_path, custom_categories)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        console.print("\n[yellow]🛑 Pemantauan folder dihentikan.[/yellow]")
    observer.join()

if __name__ == "__main__":
    app()
