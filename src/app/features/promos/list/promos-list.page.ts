import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe  } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-promos-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule,DatePipe , NgbPaginationModule, NgbDatepickerModule],
  templateUrl: './promos-list.page.html'
})
export class PromosListPage implements OnInit {
  promos: any[] = [];
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
    startDate: null,
    endDate: null
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

    this.http.get<any>(`${environment.apiBaseUrl}/admin/promos`, { params }).subscribe({
      next: (res) => {
        this.promos = res.data?.rows || [];
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
      startDate: null,
      endDate: null
    };
  }

  openEdit(promo: any): void {
    this.editingId = Number(promo.id);
    this.formError = '';
    this.showForm = true;
    this.form = {
      name: promo.name || '',
      img: promo.img || '',
      description: promo.description || '',
      startDate: this.toDateStruct(promo.startDate),
      endDate: this.toDateStruct(promo.endDate)
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

    if (!name) {
      this.formError = 'Name is required.';
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
      startDate: this.toApiDate(this.form.startDate),
      endDate: this.toApiDate(this.form.endDate)
    };

    this.saving = true;

    const request$ = this.editingId
      ? this.http.put<any>(`${environment.apiBaseUrl}/admin/promos/${this.editingId}`, payload)
      : this.http.post<any>(`${environment.apiBaseUrl}/admin/promos`, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.formError = err?.error?.message || 'Failed to save promo.';
      }
    });
  }

  remove(promo: any): void {
    if (!promo?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete promo ${promo.name}?`);

    if (!confirmed) {
      return;
    }

    this.deletingId = Number(promo.id);
    this.http.delete<any>(`${environment.apiBaseUrl}/admin/promos/${promo.id}`).subscribe({
      next: () => {
        this.deletingId = 0;
        this.load();
      },
      error: () => {
        this.deletingId = 0;
        window.alert('Failed to delete promo.');
      }
    });
  }

  private toDateStruct(value: string | null): NgbDateStruct | null {
    if (!value || value.length < 10) {
      return null;
    }

    const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return { year, month, day };
  }

  private toApiDate(value: NgbDateStruct | null): string | null {
    if (!value) {
      return null;
    }

    return `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
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