import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

type ReportOption = {
  key: string;
  label: string;
  supports: string[];
};

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, NgbDatepickerModule],
  templateUrl: './reports.page.html'
})
export class ReportsPage implements OnInit {
    get minEndDate(): NgbDateStruct | undefined {
      return this.startDate || undefined;
    }
  reports: ReportOption[] = [];
  selectedReportKey = '';
  search = '';
  tierId = '';
  dateFrom = '';
  dateTo = '';
  startDate: NgbDateStruct | null = null;
  endDate: NgbDateStruct | null = null;
  reportHtml = '';
  loadingList = false;
  loadingReport = false;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
    // selectedReportKey biarkan kosong, jangan auto-load report
  }

  loadReports(): void {
    this.loadingList = true;
    this.errorMsg = '';

    this.http.get<any>(`${environment.apiBaseUrl}/admin/reports`).subscribe({
      next: (res) => {
        this.reports = Array.isArray(res?.data) ? res.data : [];
        // selectedReportKey tetap kosong, user harus pilih manual
        this.selectedReportKey = '';
        this.loadingList = false;
      },
      error: (err) => {
        this.loadingList = false;
        this.errorMsg = err?.error?.message || 'Gagal memuat daftar report.';
      }
    });
  }

  loadReport(): void {
    if (!this.selectedReportKey) {
      this.reportHtml = '';
      return;
    }

    this.loadingReport = true;
    this.errorMsg = '';

    // Convert NgbDateStruct to yyyy-MM-dd
    this.dateFrom = this.startDate ? this.toDateString(this.startDate) : '';
    this.dateTo = this.endDate ? this.toDateString(this.endDate) : '';

    const params: Record<string, string> = { format: 'html' };

    if (this.search) {
      params['search'] = this.search;
    }
    if (this.tierId) {
      params['tierId'] = this.tierId;
    }
    if (this.dateFrom) {
      params['dateFrom'] = this.dateFrom;
    }
    if (this.dateTo) {
      params['dateTo'] = this.dateTo;
    }

    this.http.get(`${environment.apiBaseUrl}/admin/reports/${this.selectedReportKey}`, {
      params,
      responseType: 'text'
    }).subscribe({
      next: (html) => {
        this.reportHtml = html;
        this.loadingReport = false;
        this.errorMsg = '';
      },
      error: (err) => {
        this.loadingReport = false;
        // Jika error response berupa HTML (bukan JSON), tampilkan di reportHtml
        const contentType = err?.headers?.get ? err.headers.get('Content-Type') : '';
        if (typeof err?.error === 'string' && (contentType?.includes('text/html') || err?.error?.startsWith('<div'))) {
          this.reportHtml = err.error;
          this.errorMsg = '';
        } else {
          this.reportHtml = '';
          this.errorMsg = err?.error?.message || 'Gagal memuat report.';
        }
      }
    });
  }

  toDateString(date: NgbDateStruct): string {
    if (!date) return '';
    const mm = date.month.toString().padStart(2, '0');
    const dd = date.day.toString().padStart(2, '0');
    return `${date.year}-${mm}-${dd}`;
  }

  onStartDateChange(date: NgbDateStruct) {
    this.startDate = date;
    this.loadReport();
  }

  onEndDateChange(date: NgbDateStruct) {
    this.endDate = date;
    // Validasi: End Date tidak boleh lebih kecil dari Start Date
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day);
      const end = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day);
      if (end < start) {
        this.errorMsg = 'End Date tidak boleh lebih kecil dari Start Date.';
        this.reportHtml = '';
        return;
      }
    }
    this.errorMsg = '';
    this.loadReport();
  }

  resetFilters(): void {
    this.search = '';
    this.tierId = '';
    this.startDate = null;
    this.endDate = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.loadReport();
  }
}