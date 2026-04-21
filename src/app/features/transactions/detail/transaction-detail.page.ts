import { Component, OnInit, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [RouterLink, NgIf, DecimalPipe],
  templateUrl: './transaction-detail.page.html'
})
export class TransactionDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  transaction: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/transactions/${this.id}`).subscribe({
      next: (res) => { this.transaction = res.data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }
}
