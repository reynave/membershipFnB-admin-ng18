import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-csv-upload-preview',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, NgbPaginationModule],
  templateUrl: './csv-upload-preview.component.html'
})
export class CsvUploadPreviewComponent {
  /** REST API endpoint that receives the file. Upload is disabled while empty. */
  @Input() uploadUrl = '';
  /** Multipart field name used when uploadMode = 'file'. */
  @Input() fieldName = 'file';
  /** 'file' = send original CSV as multipart/form-data, 'json' = send parsed rows as JSON. */
  @Input() uploadMode: 'file' | 'json' = 'file';
  /** Header names that must exist and must not be empty (case-insensitive). */
  @Input() requiredColumns: string[] = [];
  @Input() maxFileSizeMb = 5;
  @Input() maxRows = 5000;
  @Output() uploaded = new EventEmitter<any>();

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  file: File | null = null;
  rawText = '';
  headers: string[] = [];
  rows: string[][] = [];
  requiredIdx: number[] = [];

  delimiter = 'auto';
  usedDelimiter = ',';
  hasHeader = true;

  page = 1;
  pageSize = 100;
  pageSizeOptions = [10, 25, 50, 100, 200, 500];

  dragOver = false;
  uploading = false;
  errors: string[] = [];
  warnings: string[] = [];
  invalidRowCount = 0;
  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  get canUpload(): boolean {
    return !!this.file && !!this.uploadUrl && this.rows.length > 0 && this.errors.length === 0 && !this.uploading;
  }

  get pagedRows(): string[][] {
    const start = (this.page - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  get pageStartIndex(): number {
    return (this.page - 1) * this.pageSize;
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files && input.files.length ? input.files[0] : null;
    if (selected) {
      this.handleFile(selected);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const dropped = event.dataTransfer?.files?.length ? event.dataTransfer.files[0] : null;
    if (dropped) {
      this.handleFile(dropped);
    }
  }

  handleFile(selected: File): void {
    this.clearState();

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      this.errors = ['Only .csv files are allowed.'];
      return;
    }

    if (selected.size > this.maxFileSizeMb * 1024 * 1024) {
      this.errors = [`File size must not exceed ${this.maxFileSizeMb} MB.`];
      return;
    }

    if (selected.size === 0) {
      this.errors = ['File is empty.'];
      return;
    }

    this.file = selected;

    const reader = new FileReader();
    reader.onload = () => {
      this.rawText = String(reader.result || '');
      this.parse();
    };
    reader.onerror = () => {
      this.errors = ['Failed to read the file.'];
    };
    reader.readAsText(selected);
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.page = 1;
  }

  onParseOptionChange(): void {
    if (this.rawText) {
      this.parse();
    }
  }

  parse(): void {
    this.errors = [];
    this.warnings = [];
    this.successMsg = '';
    this.errorMsg = '';
    this.page = 1;

    let text = this.rawText;
    if (text.charCodeAt(0) === 0xfeff) {
      text = text.slice(1);
    }

    if (this.delimiter === 'auto') {
      this.usedDelimiter = this.detectDelimiter(text);
    } else {
      this.usedDelimiter = this.delimiter === 'tab' ? '\t' : this.delimiter;
    }

    const parsed = this.parseCsv(text, this.usedDelimiter)
      .filter(r => r.some(cell => cell.trim() !== ''));

    if (!parsed.length) {
      this.headers = [];
      this.rows = [];
      this.errors = ['No data found in the file.'];
      return;
    }

    const columnCount = parsed.reduce((max, r) => Math.max(max, r.length), 0);
    let headerRow: string[] = [];
    let dataRows: string[][];

    if (this.hasHeader) {
      headerRow = parsed[0].map(h => h.trim());
      dataRows = parsed.slice(1);
    } else {
      dataRows = parsed;
    }

    while (headerRow.length < columnCount) {
      headerRow.push(`Column ${headerRow.length + 1}`);
    }

    let mismatch = 0;
    dataRows = dataRows.map(r => {
      if (r.length !== columnCount) {
        mismatch++;
      }
      const copy = r.slice();
      while (copy.length < columnCount) {
        copy.push('');
      }
      return copy;
    });

    this.headers = headerRow;
    this.rows = dataRows;

    if (!dataRows.length) {
      this.errors.push('The file has a header row but no data rows.');
    }

    if (dataRows.length > this.maxRows) {
      this.errors.push(`Too many rows: ${dataRows.length}. Maximum allowed is ${this.maxRows}.`);
    }

    if (mismatch > 0) {
      this.warnings.push(`${mismatch} row(s) have a different number of columns than the header. Missing cells were left empty.`);
    }

    this.validateRequired();
  }

  isCellInvalid(row: string[], colIndex: number): boolean {
    return this.requiredIdx.includes(colIndex) && !(row[colIndex] || '').trim();
  }

  private validateRequired(): void {
    this.requiredIdx = [];
    this.invalidRowCount = 0;

    if (!this.requiredColumns.length) {
      return;
    }

    if (!this.hasHeader) {
      this.errors.push('Required columns can only be validated when "First row is header" is enabled.');
      return;
    }

    const lowerHeaders = this.headers.map(h => h.toLowerCase());
    const missing: string[] = [];

    this.requiredColumns.forEach(name => {
      const idx = lowerHeaders.indexOf(name.trim().toLowerCase());
      if (idx === -1) {
        missing.push(name);
      } else {
        this.requiredIdx.push(idx);
      }
    });

    if (missing.length) {
      this.errors.push(`Missing required column(s): ${missing.join(', ')}.`);
      return;
    }

    this.invalidRowCount = this.rows.filter(r => this.requiredIdx.some(i => !(r[i] || '').trim())).length;
    if (this.invalidRowCount > 0) {
      this.errors.push(`${this.invalidRowCount} row(s) have empty required values (highlighted in the preview).`);
    }
  }

  upload(): void {
    if (!this.canUpload || !this.file) {
      return;
    }

    this.uploading = true;
    this.successMsg = '';
    this.errorMsg = '';

    let request;
    if (this.uploadMode === 'json') {
      const body = {
        fileName: this.file.name,
        headers: this.headers,
        rows: this.hasHeader
          ? this.rows.map(r => {
              const obj: any = {};
              this.headers.forEach((h, i) => { obj[h] = r[i]; });
              return obj;
            })
          : this.rows
      };
      request = this.http.post<any>(this.uploadUrl, body);
    } else {
      const formData = new FormData();
      formData.append(this.fieldName, this.file, this.file.name);
      request = this.http.post<any>(this.uploadUrl, formData);
    }

    request.subscribe({
      next: (res) => {
        this.uploading = false;
        this.successMsg = res?.message || 'File uploaded successfully.';
        this.uploaded.emit(res);
      },
      error: (err) => {
        this.uploading = false;
        this.errorMsg = err?.error?.message || 'Upload failed.';
      }
    });
  }

  reset(): void {
    this.clearState();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private clearState(): void {
    this.file = null;
    this.rawText = '';
    this.headers = [];
    this.rows = [];
    this.requiredIdx = [];
    this.errors = [];
    this.warnings = [];
    this.invalidRowCount = 0;
    this.successMsg = '';
    this.errorMsg = '';
    this.page = 1;
  }

  private detectDelimiter(text: string): string {
    const firstLine = text.split(/\r\n|\n|\r/)[0] || '';
    const candidates = [',', ';', '\t', '|'];
    let best = ',';
    let bestCount = 0;

    candidates.forEach(c => {
      let count = 0;
      let inQuotes = false;
      for (const ch of firstLine) {
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === c && !inQuotes) {
          count++;
        }
      }
      if (count > bestCount) {
        best = c;
        bestCount = count;
      }
    });

    return best;
  }

  /** RFC 4180 style parser: quoted cells, escaped quotes ("") and line breaks inside quotes. */
  private parseCsv(text: string, delim: string): string[][] {
    const result: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cell += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delim) {
        row.push(cell);
        cell = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') {
          i++;
        }
        row.push(cell);
        result.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }

    if (cell !== '' || row.length) {
      row.push(cell);
      result.push(row);
    }

    return result;
  }
}
