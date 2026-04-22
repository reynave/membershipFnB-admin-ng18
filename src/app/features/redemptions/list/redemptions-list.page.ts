import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-redemptions-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe, FormsModule, NgbPaginationModule, NgbDatepickerModule],
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
  filterInputDate: NgbDateStruct | null = null;
  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search.trim()) {
      params.search = this.search.trim();
    }
    if (this.filterStatus) {
      params.status = this.filterStatus;
    }
    const inputDate = this.toApiDate(this.filterInputDate);
    if (inputDate) {
      params.inputDate = inputDate;
    }

    this.http.get<any>(`${environment.apiBaseUrl}/admin/redemptions`, { params }).subscribe({
      next: (res) => { this.redemptions = res.data.rows; this.total = res.data.total; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }

  onReset(): void {
    this.search = '';
    this.filterStatus = '';
    this.filterInputDate = null;
    this.page = 1;
    this.load();
  }

  onPageChange(): void { this.load(); }

  private toApiDate(value: NgbDateStruct | null): string | null {
    if (!value) {
      return null;
    }

    const year = String(value.year).padStart(4, '0');
    const month = String(value.month).padStart(2, '0');
    const day = String(value.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
