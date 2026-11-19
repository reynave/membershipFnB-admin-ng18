import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.csv', '.txt'];

/**
 * Step 1 of the POS import flow: upload the "Member Sales Listing Report".
 * The file is sent to the server untouched, parsed and stored in the staging
 * tables (import_batch / import_member / import_line). On success the user is
 * routed to the staging batch page (step 2) that reads everything back from DB.
 * The page also lists the batches that already exist in `import_batch`.
 */
@Component({
  selector: 'app-csv-upload-page',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, NgbPaginationModule],
  templateUrl: './csv-upload.page.html'
})
export class CsvUploadPage implements OnInit {
  private readonly importUrl = `${environment.apiBaseUrl}/admin/imports/member-sales`;

  file: File | null = null;
  dragOver = false;
  uploading = false;
  uploadError = '';
  override = false;

  // ---- staging batch list (import_batch) ----------------------------------
  batches: any[] = [];
  batchTotal = 0;
  batchPage = 1;
  batchPageSize = 10;
  batchStatus = '';
  batchSearch = '';
  loadingBatches = false;
  batchListError = '';

  pageSizeOptions = [10, 25, 50];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadBatches();
  }

  get maxFileSizeMb(): number {
    return MAX_FILE_SIZE_BYTES / (1024 * 1024);
  }

  get canUpload(): boolean {
    return !!this.file && !this.uploading;
  }

  // ---- file selection -----------------------------------------------------
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files && input.files.length ? input.files[0] : null);
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

    if (this.uploading) {
      return;
    }

    const file = event.dataTransfer?.files && event.dataTransfer.files.length
      ? event.dataTransfer.files[0]
      : null;
    this.setFile(file);
  }

  clearFile(): void {
    this.file = null;
    this.uploadError = '';
  }

  private setFile(file: File | null): void {
    this.uploadError = '';

    if (!file) {
      this.file = null;
      return;
    }

    const name = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      this.file = null;
      this.uploadError = 'Only .csv or .txt files are supported.';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.file = null;
      this.uploadError = `The file is larger than ${this.maxFileSizeMb} MB.`;
      return;
    }

    if (file.size === 0) {
      this.file = null;
      this.uploadError = 'The selected file is empty.';
      return;
    }

    this.file = file;
  }

  // ---- upload -------------------------------------------------------------
  upload(): void {
    if (!this.file || this.uploading) {
      return;
    }

    const form = new FormData();
    form.append('file', this.file, this.file.name);
    if (this.override) {
      form.append('override', 'true');
    }

    this.uploading = true;
    this.uploadError = '';

    this.http.post<any>(this.importUrl, form).subscribe({
      next: (res) => {
        this.uploading = false;

        const createdId = res?.data?.batchId;
        if (!createdId) {
          this.uploadError = 'The upload succeeded but no batch id was returned.';
          return;
        }

        this.file = null;
        this.router.navigate(['/csv-upload', Number(createdId)]);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err?.error?.message || 'Upload failed.';
      }
    });
  }

  // ---- staging batch list (import_batch) ----------------------------------
  loadBatches(): void {
    const params: any = { page: this.batchPage, pageSize: this.batchPageSize };
    if (this.batchStatus) {
      params.status = this.batchStatus;
    }
    if (this.batchSearch.trim()) {
      params.search = this.batchSearch.trim();
    }

    this.loadingBatches = true;
    this.batchListError = '';

    this.http.get<any>(this.importUrl, { params }).subscribe({
      next: (res) => {
        const data = res?.data;
        this.batches = data?.batches || [];
        this.batchTotal = data?.total || 0;
        this.loadingBatches = false;
      },
      error: (err) => {
        this.batches = [];
        this.batchTotal = 0;
        this.loadingBatches = false;
        this.batchListError = err?.error?.message || 'Failed to load the staging batches.';
      }
    });
  }

  onBatchFilterChange(): void {
    this.batchPage = 1;
    this.loadBatches();
  }

  onBatchPageChange(): void {
    this.loadBatches();
  }

  openBatch(batchId: number): void {
    this.router.navigate(['/csv-upload', batchId]);
  }

  // ---- template helpers ---------------------------------------------------
  statusClass(status: string | null | undefined): string {
    if (status === 'COMMITTED') {
      return 'bg-success';
    }
    if (status === 'REJECTED') {
      return 'bg-secondary';
    }
    return 'bg-primary';
  }
}

