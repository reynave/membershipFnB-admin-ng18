import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-voucher-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule, NgbDatepickerModule],
  templateUrl: './voucher-detail.page.html'
})
export class VoucherDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  loading = false;
  savingHeader = false;
  savingMerchants = false;
  uploadingImage = false;
  errorMsg = '';
  successMsg = '';

  voucher: any = null;
  merchants: any[] = [];
  selectedMerchantIds: number[] = [];

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
    this.http.get<any>(`${environment.apiBaseUrl}/admin/vouchers/${this.id}`).subscribe({
      next: (res) => {
        this.voucher = res.data?.voucher;
        this.merchants = res.data?.merchants || [];
        const selected = res.data?.selectedMerchants || [];
        this.selectedMerchantIds = selected.map((item: any) => Number(item.merchantId));
        this.form = {
          name: this.voucher?.name || '',
          img: this.voucher?.img || '',
          description: this.voucher?.description || '',
          pointsRequired: this.voucher?.pointsRequired ?? '',
          pointsAmount: this.voucher?.pointsAmount ?? '',
          startDate: this.toDateStruct(this.voucher?.startDate),
          endDate: this.toDateStruct(this.voucher?.endDate),
          quota: this.voucher?.quota ?? ''
        };
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to load voucher detail.';
        this.loading = false;
      }
    });
  }

  saveHeader(): void {
    const payload: any = {
      name: String(this.form.name || '').trim(),
      img: String(this.form.img || '').trim(),
      description: String(this.form.description || '').trim(),
      pointsRequired: Number(this.form.pointsRequired),
      pointsAmount: Number(this.form.pointsAmount),
      startDate: this.toApiDate(this.form.startDate),
      endDate: this.toApiDate(this.form.endDate),
      quota: this.form.quota === '' ? null : Number(this.form.quota)
    };

    if (!payload.name) {
      this.errorMsg = 'Name is required.';
      return;
    }

    if (!Number.isInteger(payload.pointsRequired) || payload.pointsRequired <= 0) {
      this.errorMsg = 'Points required must be a positive integer.';
      return;
    }

    if (!Number.isInteger(payload.pointsAmount) || payload.pointsAmount <= 0) {
      this.errorMsg = 'Voucher amount must be a positive integer.';
      return;
    }

    if (this.form.startDate && this.form.endDate && this.compareDateStruct(this.form.endDate, this.form.startDate) < 0) {
      this.errorMsg = 'End date cannot be earlier than start date.';
      return;
    }

    this.savingHeader = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.http.put<any>(`${environment.apiBaseUrl}/admin/vouchers/${this.id}`, payload).subscribe({
      next: (res) => {
        this.voucher = res.data;
        this.successMsg = 'Voucher header updated.';
        this.savingHeader = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Failed to update voucher.';
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

    this.http.put<any>(`${environment.apiBaseUrl}/admin/vouchers/${this.id}/merchants`, {
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

  toDateStruct(value: string | null): NgbDateStruct | null {
    if (!value || value.length < 10) {
      return null;
    }

    const raw = String(value).slice(0, 10);
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
