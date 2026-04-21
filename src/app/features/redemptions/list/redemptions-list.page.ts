import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-redemptions-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe, FormsModule, NgbPaginationModule],
  templateUrl: './redemptions-list.page.html'
})
export class RedemptionsListPage implements OnInit {
  redemptions: any[] = [];
  total    = 0;
  page     = 1;
  pageSize = 20;
  loading  = false;
    search       = '';
    filterStatus = '';
  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    this.http.get<any>(`${environment.apiBaseUrl}/admin/redemptions`, { params }).subscribe({
      next: (res) => { this.redemptions = res.data.rows; this.total = res.data.total; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onPageChange(): void { this.load(); }
}
