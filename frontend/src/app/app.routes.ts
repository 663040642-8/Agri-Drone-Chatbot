import { Routes } from '@angular/router';
import { Chat } from './features/chat/chat';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Verify } from './features/auth/verify/verify';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'register', component: Register, canActivate: [guestGuard] },
    { path: 'verify', component: Verify },
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', redirectTo: 'chat', pathMatch: 'full' },
            {
                path: 'chat',
                component: Chat
            },
        ]
    },
];
