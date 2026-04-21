import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe, FormsModule, NgbPaginationModule],
  templateUrl: './transactions-list.page.html'
})
export class TransactionsListPage implements OnInit {
  filterType = '';
  page = 1;
  pageSize = 10;
  total = 0;
  transactions: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.filterType) params['type'] = this.filterType;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/transactions`, { params }).subscribe({
      next: (res) => { this.transactions = res.data?.rows || []; this.total = res.data?.total || 0; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 1; this.load(); }
  onPageChange(): void { this.load(); }
}
