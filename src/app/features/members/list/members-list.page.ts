import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule, NgbPaginationModule],
  templateUrl: './members-list.page.html'
})
export class MembersListPage implements OnInit {
  members: any[] = [];
  total    = 0;
  page     = 1;
  pageSize = 20;
  search   = '';
  filterTier = '';
  loading  = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const params: any = { page: this.page, pageSize: this.pageSize };
    if (this.search)     params['search'] = this.search;
    if (this.filterTier) params['tierId'] = this.filterTier;

    this.http.get<any>(`${environment.apiBaseUrl}/admin/members`, { params }).subscribe({
      next: (res) => { this.members = res.data.rows; this.total = res.data.total; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  onSearch(): void  { this.page = 1; this.load(); }
  onPageChange(): void { this.load(); }

  tierBadge(tier: string): string {
    const map: any = {
      blue: 'badge bg-primary', silver: 'badge bg-secondary',
      gold: 'badge bg-warning text-dark', platinum: 'badge bg-info text-dark',
    };
    return map[tier] || 'badge bg-light text-dark border';
  }
}

