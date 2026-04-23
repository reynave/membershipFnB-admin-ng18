

import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-promo-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule, NgbDatepickerModule],
  templateUrl: './promo-detail.page.html'
})
export class PromoDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  loading = false;
  savingHeader = false;
  savingMerchants = false;
  uploadingImage = false;
  errorMsg = '';
  successMsg = '';

  promo: any = null;
  merchants: any[] = [];
  selectedMerchantIds: number[] = [];

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
    this.http.get<any>(`${environment.apiBaseUrl}/admin/promos/${this.id}`).subscribe({
      next: (res) => {
        this.promo = res.data?.promo;
        this.merchants = res.data?.merchants || [];
        const selected = res.data?.selectedMerchants || [];
        this.selectedMerchantIds = selected.map((item: any) => Number(item.merchantId));
        this.form = {
          name: this.promo?.name || '',
          img: this.promo?.img || '',
          description: this.promo?.description || '',
          startDate: this.toDateStruct(this.promo?.startDate),
          endDate: this.toDateStruct(this.promo?.endDate)
        };
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to load promo detail.';
        this.loading = false;
      }
    });
  }
  handleBirthdayMemberChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.birthdayMember = checked ? 1 : 0;
  }
  saveHeader(): void {
    const payload: any = {
      name: String(this.form.name || '').trim(),
      img: String(this.form.img || '').trim(),
      description: String(this.form.description || '').trim(),
      startDate: this.toApiDate(this.form.startDate),
      endDate: this.toApiDate(this.form.endDate)
    };

    if (!payload.name) {
      this.errorMsg = 'Name is required.';
      return;
    }

    if (this.form.startDate && this.form.endDate && this.compareDateStruct(this.form.endDate, this.form.startDate) < 0) {
      this.errorMsg = 'End date cannot be earlier than start date.';
      return;
    }

    this.savingHeader = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.put<any>(`${environment.apiBaseUrl}/admin/promos/${this.id}`, payload).subscribe({
      next: (res) => {
        this.promo = res.data;
        this.successMsg = 'Promo header updated.';
        this.savingHeader = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to update promo.';
        this.savingHeader = false;
      }
    });
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    this.uploadingImage = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.post<any>(`${environment.apiBaseUrl}/admin/uploads/image`, formData).subscribe({
      next: (res) => {
        this.form.img = res.data?.url || '';
        this.successMsg = 'Image uploaded.';
        this.uploadingImage = false;
        input.value = '';
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to upload image.';
        this.uploadingImage = false;
        input.value = '';
      }
    });
  }

  toggleMerchant(merchantId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedMerchantIds.includes(merchantId)) {
        this.selectedMerchantIds = [...this.selectedMerchantIds, merchantId];
      }
      return;
    }

    this.selectedMerchantIds = this.selectedMerchantIds.filter((id) => id !== merchantId);
  }

  setGlobalScope(): void {
    this.selectedMerchantIds = [];
  }

  saveMerchants(): void {
    this.savingMerchants = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.put<any>(`${environment.apiBaseUrl}/admin/promos/${this.id}/merchants`, {
      merchantIds: this.selectedMerchantIds
    }).subscribe({
      next: () => {
        this.successMsg = this.selectedMerchantIds.length > 0
          ? 'Merchant scope updated.'
          : 'Scope set to global (all merchants).';
        this.savingMerchants = false;
        this.load();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to update merchant scope.';
        this.savingMerchants = false;
      }
    });
  }

  isChecked(merchantId: number): boolean {
    return this.selectedMerchantIds.includes(merchantId);
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