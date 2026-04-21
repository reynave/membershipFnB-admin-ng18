import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tiers-list',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DecimalPipe],
  templateUrl: './tiers-list.page.html'
})
export class TiersListPage implements OnInit {
  tiers: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/tiers`).subscribe({
      next: (res) => { this.tiers = res.data || []; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  tierBadgeClass(name: string): string {
    const map: any = {
      blue: 'bg-primary', silver: 'bg-secondary',
      gold: 'bg-warning text-dark', platinum: 'bg-info text-dark'
    };
    return map[(name || '').toLowerCase()] || 'bg-light text-dark';
  }
}
