import { Component, OnInit, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, TitleCasePipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-redemption-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe, TitleCasePipe, NgIf],
  templateUrl: './redemption-detail.page.html'
})
export class RedemptionDetailPage implements OnInit {
  @Input() id!: string;
  history = history;

  redemption: any = null;
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiBaseUrl}/admin/redemptions/${this.id}`).subscribe({
      next: (res) => { this.redemption = res.data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }
}
