import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbDateStruct, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe,DatePipe, FormsModule, NgbPaginationModule, NgbDatepickerModule],
  templateUrl: './transactions-list.page.html'
})
export class TransactionsListPage implements OnInit {
  search = '';
  filterType = '';
  page = 1;
  pageSize = 10;
  total = 0;
  transactions: any[] = [];
  loading = false;
  inputDateFrom: NgbDateStruct | null = null;
  inputDateTo: NgbDateStruct | null = null;
  private readonly minDateFloor: NgbDateStruct = { year: 1900, month: 1, day: 1 };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search.trim()) {
      params.search = this.search.trim();
    }
    if (this.filterType) params['type'] = this.filterType;
    const inputDateFrom = this.toApiDate(this.inputDateFrom);
    const inputDateTo = this.toApiDate(this.inputDateTo);
    if (inputDateFrom) {
      params.inputDateFrom = inputDateFrom;
    }
    if (inputDateTo) {
      params.inputDateTo = inputDateTo;
    }

    this.http.get<any>(`${environment.apiBaseUrl}/admin/transactions`, { params }).subscribe({
      next: (res) => { this.transactions = res.data?.rows || []; this.total = res.data?.total || 0; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onFilterChange(): void { this.page = 1; this.load(); }
  onReset(): void {
    this.search = '';
    this.filterType = '';
    this.inputDateFrom = null;
    this.inputDateTo = null;
    this.page = 1;
    this.load();
  }

  onInputDateFromChange(): void {
    if (this.inputDateFrom && this.inputDateTo && this.compareDateStruct(this.inputDateTo, this.inputDateFrom) < 0) {
      this.inputDateTo = this.inputDateFrom;
    }

    this.onFilterChange();
  }

  onInputDateToChange(): void {
    this.onFilterChange();
  }

  get inputDateToMinDate(): NgbDateStruct {
    return this.inputDateFrom || this.minDateFloor;
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
