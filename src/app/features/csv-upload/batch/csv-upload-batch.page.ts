import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-csv-upload-batch-page',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, RouterLink, NgbPaginationModule],
  templateUrl: './csv-upload-batch.page.html'
})
export class CsvUploadBatchPage implements OnInit {
  /** Staging endpoints for the uploaded "Member Sales Listing Report". */
  private readonly importUrl = `${environment.apiBaseUrl}/admin/imports/member-sales`;

  batchId: number | null = null;

  // ---- batch (import_batch) state -----------------------------------------
  batch: any | null = null;
  loadingBatch = false;
  loadError = '';
  notFound = false;

  activeTab: 'lines' | 'members' = 'lines';

  // ---- import_line state --------------------------------------------------
  lines: any[] = [];
  lineTotal = 0;
  linePage = 1;
  linePageSize = 50;
  lineSeverity = '';
  lineSearch = '';
  loadingLines = false;

  // ---- import_member state ------------------------------------------------
  members: any[] = [];
  memberTotal = 0;
  memberPage = 1;
  memberPageSize = 25;
  memberSeverity = '';
  memberSearch = '';
  loadingMembers = false;

  pageSizeOptions = [10, 25, 50, 100, 200];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('batchId'));

      if (!Number.isInteger(id) || id <= 0) {
        this.router.navigate(['/csv-upload']);
        return;
      }

      this.batchId = id;
      this.loadError = '';
      this.notFound = false;
      this.activeTab = 'lines';

      this.lines = [];
      this.lineTotal = 0;
      this.linePage = 1;
      this.lineSeverity = '';
      this.lineSearch = '';

      this.members = [];
      this.memberTotal = 0;
      this.memberPage = 1;
      this.memberSeverity = '';
      this.memberSearch = '';

      this.reloadAll();
    });
  }

  reloadAll(): void {
    this.loadBatch();
    this.loadLines();
    this.loadMembers();
  }

  loadBatch(): void {
    if (!this.batchId) {
      return;
    }

    this.loadingBatch = true;
    this.http.get<any>(`${this.importUrl}/${this.batchId}`).subscribe({
      next: (res) => {
        this.batch = res?.data || null;
        this.loadingBatch = false;
        this.notFound = false;
      },
      error: (err) => {
        this.loadingBatch = false;
        this.batch = null;
        this.notFound = err?.status === 404;
        this.loadError = err?.error?.message || 'Failed to load the import batch.';
      }
    });
  }

  loadLines(): void {
    if (!this.batchId) {
      return;
    }

    const params: any = { page: this.linePage, pageSize: this.linePageSize };
    if (this.lineSeverity) {
      params.severity = this.lineSeverity;
    }
    if (this.lineSearch.trim()) {
      params.search = this.lineSearch.trim();
    }

    this.loadingLines = true;
    this.http.get<any>(`${this.importUrl}/${this.batchId}/lines`, { params }).subscribe({
      next: (res) => {
        const data = res?.data;
        this.lines = data?.lines || [];
        this.lineTotal = data?.total || 0;
        this.loadingLines = false;
      },
      error: () => {
        this.lines = [];
        this.lineTotal = 0;
        this.loadingLines = false;
      }
    });
  }

  loadMembers(): void {
    if (!this.batchId) {
      return;
    }

    const params: any = { page: this.memberPage, pageSize: this.memberPageSize };
    if (this.memberSeverity) {
      params.severity = this.memberSeverity;
    }
    if (this.memberSearch.trim()) {
      params.search = this.memberSearch.trim();
    }

    this.loadingMembers = true;
    this.http.get<any>(`${this.importUrl}/${this.batchId}/members`, { params }).subscribe({
      next: (res) => {
        const data = res?.data;
        this.members = data?.members || [];
        this.memberTotal = data?.total || 0;
        this.loadingMembers = false;
      },
      error: () => {
        this.members = [];
        this.memberTotal = 0;
        this.loadingMembers = false;
      }
    });
  }

  // ---- filters / pagination ----------------------------------------------
  onLineFilterChange(): void {
    this.linePage = 1;
    this.loadLines();
  }

  onLinePageChange(): void {
    this.loadLines();
  }

  onMemberFilterChange(): void {
    this.memberPage = 1;
    this.loadMembers();
  }

  onMemberPageChange(): void {
    this.loadMembers();
  }

  setTab(tab: 'lines' | 'members'): void {
    this.activeTab = tab;
  }

  // ---- template helpers ---------------------------------------------------
  severityClass(severity: string | null | undefined): string {
    if (severity === 'ERROR') {
      return 'bg-danger';
    }
    if (severity === 'WARNING') {
      return 'bg-warning text-dark';
    }
    return 'bg-success';
  }

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

