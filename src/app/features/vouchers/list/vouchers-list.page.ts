import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, NgFor, NgIf , DatePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vouchers-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe, DatePipe, FormsModule, NgbPaginationModule, NgbDatepickerModule],
  templateUrl: './vouchers-list.page.html'
})
export class VouchersListPage implements OnInit {
  vouchers: any[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  search = '';
  loading = false;

  showForm = false;
  editingId = 0;
  saving = false;
  deletingId = 0;
  formError = '';

  form: any = {
    name: '',
    img: '',
    description: '',
    pointsRequired: '',
    pointsAmount: '',
    startDate: null,
    endDate: null,
    quota: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search.trim()) {
      params.search = this.search.trim();
    }

    this.http.get<any>(`${environment.apiBaseUrl}/admin/vouchers`, { params }).subscribe({
      next: (res) => {
        this.vouchers = res.data?.rows || [];
        this.total = res.data?.total || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.load();
  }

  onPageChange(): void {
    this.load();
  }

  openCreate(): void {
    this.editingId = 0;
    this.formError = '';
    this.showForm = true;
    this.form = {
      name: '',
      img: '',
      description: '',
      pointsRequired: '',
      pointsAmount: '',
      startDate: null,
      endDate: null,
      quota: ''
    };
  }

  openEdit(voucher: any): void {
    this.editingId = Number(voucher.id);
    this.formError = '';
    this.showForm = true;
    this.form = {
      name: voucher.name || '',
      img: voucher.img || '',
      description: voucher.description || '',
      pointsRequired: voucher.pointsRequired ?? '',
      pointsAmount: voucher.pointsAmount ?? '',
      startDate: this.toDateStruct(voucher.startDate),
      endDate: this.toDateStruct(voucher.endDate),
      quota: voucher.quota ?? ''
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.saving = false;
    this.formError = '';
  }

  save(): void {
    this.formError = '';

    const name = String(this.form.name || '').trim();
    const pointsRequired = Number(this.form.pointsRequired);
    const pointsAmount = Number(this.form.pointsAmount);

    if (!name) {
      this.formError = 'Name is required.';
      return;
    }

    if (!Number.isInteger(pointsRequired) || pointsRequired <= 0) {
      this.formError = 'Points required must be a positive integer.';
      return;
    }

    if (!Number.isInteger(pointsAmount) || pointsAmount <= 0) {
      this.formError = 'Voucher amount must be a positive integer.';
      return;
    }

    if (this.form.startDate && this.form.endDate && this.compareDateStruct(this.form.endDate, this.form.startDate) < 0) {
      this.formError = 'End date cannot be earlier than start date.';
      return;
    }

    const payload: any = {
      name,
      img: String(this.form.img || '').trim(),
      description: String(this.form.description || '').trim(),
      pointsRequired,
      pointsAmount,
      startDate: this.toApiDate(this.form.startDate),
      endDate: this.toApiDate(this.form.endDate),
      quota: this.form.quota === '' ? null : Number(this.form.quota)
    };

    this.saving = true;

    const request$ = this.editingId
      ? this.http.put<any>(`${environment.apiBaseUrl}/admin/vouchers/${this.editingId}`, payload)
      : this.http.post<any>(`${environment.apiBaseUrl}/admin/vouchers`, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.message || 'Failed to save voucher.';
      }
    });
  }

  remove(voucher: any): void {
    if (!voucher?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete voucher ${voucher.name}?`);

    if (!confirmed) {
      return;
    }

    this.deletingId = Number(voucher.id);
    this.http.delete<any>(`${environment.apiBaseUrl}/admin/vouchers/${voucher.id}`).subscribe({
      next: () => {
        this.deletingId = 0;
        this.load();
      },
      error: () => {
        this.deletingId = 0;
        window.alert('Failed to delete voucher.');
      }
    });
  }

  private formatDateForInput(value: string | null): string {
    if (!value || value.length < 10) {
      return '';
    }

    return String(value).slice(0, 10);
  }

  toDateStruct(value: string | null): NgbDateStruct | null {
    const raw = this.formatDateForInput(value);

    if (!raw) {
      return null;
    }

    const [year, month, day] = raw.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return { year, month, day };
  }

  private toApiDate(value: NgbDateStruct | null): string | null {
    if (!value) {
      return null;
    }

    const year = String(value.year).padStart(4, '0');
    const month = String(value.month).padStart(2, '0');
    const day = String(value.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private compareDateStruct(a: NgbDateStruct, b: NgbDateStruct): number {
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    if (a.month !== b.month) {
      return a.month - b.month;
    }

    return a.day - b.day;
  }
}
