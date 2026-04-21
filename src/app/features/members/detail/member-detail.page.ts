import { Component, OnInit, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgClass, NgIf, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, DecimalPipe],
  templateUrl: './member-detail.page.html'
})
export class MemberDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  member: any = null;
  balance: any = { totalPointIn: 0, totalPointOut: 0, balance: 0 };
  pointHistory: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/members/${this.id}`).subscribe({
      next: (res) => {
        this.member      = res.data.member;
        this.balance     = res.data.balance;
        this.pointHistory = res.data.history;
        this.loading     = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
