import { Component, OnInit, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule],
  templateUrl: './user-detail.page.html'
})
export class UserDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  user: any = null;
  tokens: any[] = [];
  merchants: any[] = [];
  loading = false;
  showCreateForm = false;
  selectedMerchantId = '';
  creatingToken = false;
  deletingTokenId = 0;
  createErrorMsg = '';
  createSuccessMsg = '';
  generatedToken = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/users/${this.id}`).subscribe({
      next: (res) => {
        this.user = res.data?.user;
        this.tokens = res.data?.tokens || [];
        this.merchants = res.data?.merchants || [];
        this.loading = false;
      },
      error: ()    => { this.loading = false; }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.createErrorMsg = '';
    this.createSuccessMsg = '';
    this.generatedToken = '';

    if (!this.showCreateForm) {
      this.selectedMerchantId = '';
    }
  }

  createToken(): void {
    if (!this.selectedMerchantId) {
      this.createErrorMsg = 'Please select a merchant first.';
      return;
    }

    this.creatingToken = true;
    this.createErrorMsg = '';
    this.createSuccessMsg = '';
    this.generatedToken = '';

    this.http.post<any>(`${environment.apiBaseUrl}/admin/users/${this.id}/tokens`, {
      merchantId: Number(this.selectedMerchantId)
    }).subscribe({
      next: (res) => {
        const token = res.data?.token;
        if (token) {
          this.tokens = [...this.tokens, token];
          this.generatedToken = token.token || '';
        }
        this.createSuccessMsg = 'POS token created successfully.';
        this.creatingToken = false;
      },
      error: (err) => {
        this.createErrorMsg = err?.error?.message || 'Failed to create POS token.';
        this.creatingToken = false;
      }
    });
  }

  deleteToken(token: any): void {
    if (!token?.id) {
      return;
    }

    const confirmed = window.confirm(`Delete token for merchant ${token.merchantName || token.merchantId}?`);

    if (!confirmed) {
      return;
    }

    this.deletingTokenId = Number(token.id);
    this.http.delete<any>(`${environment.apiBaseUrl}/admin/users/${this.id}/tokens/${token.id}`).subscribe({
      next: () => {
        this.tokens = this.tokens.filter((item) => Number(item.id) !== Number(token.id));
        this.deletingTokenId = 0;
      },
      error: () => {
        this.deletingTokenId = 0;
        window.alert('Failed to delete POS token.');
      }
    });
  }

  copyToken(token: string): void {
    if (!token) {
      return;
    }

    navigator.clipboard.writeText(token).then(() => {
      this.createSuccessMsg = 'Token copied to clipboard.';
    }).catch(() => {
      this.createErrorMsg = 'Gagal menyalin token.';
    });
  }
}
