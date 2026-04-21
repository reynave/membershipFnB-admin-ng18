import { Routes } from '@angular/router';
import { AdminShellComponent } from './core/layout/admin-shell.component';
import { LoginPage } from './features/auth/login/login.page';
import { MembersListPage } from './features/members/list/members-list.page';
import { MemberDetailPage } from './features/members/detail/member-detail.page';
import { RedemptionsListPage } from './features/redemptions/list/redemptions-list.page';
import { RedemptionDetailPage } from './features/redemptions/detail/redemption-detail.page';
import { TiersListPage } from './features/tiers/list/tiers-list.page';
import { TransactionsListPage } from './features/transactions/list/transactions-list.page';
import { TransactionDetailPage } from './features/transactions/detail/transaction-detail.page';
import { UsersListPage } from './features/users/list/users-list.page';
import { UserDetailPage } from './features/users/detail/user-detail.page';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginPage },
	{
		path: '',
		component: AdminShellComponent,
		canActivate: [authGuard],
		children: [
			{ path: '', redirectTo: 'members', pathMatch: 'full' },
			{ path: 'members', component: MembersListPage },
			{ path: 'members/:id', component: MemberDetailPage },
			{ path: 'redemptions', component: RedemptionsListPage },
			{ path: 'redemptions/:id', component: RedemptionDetailPage },
			{ path: 'tiers', component: TiersListPage },
			{ path: 'transactions', component: TransactionsListPage },
			{ path: 'transactions/:id', component: TransactionDetailPage },
			{ path: 'users', component: UsersListPage },
			{ path: 'users/:id', component: UserDetailPage },
		]
	},
	{ path: '**', redirectTo: 'login' }
];
