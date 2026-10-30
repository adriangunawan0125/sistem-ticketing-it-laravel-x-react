<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NotificationController;


Route::middleware('guest')->group(function () {
    Route::get('/register', fn () => view('auth.register'));
    Route::post('/register', [AuthController::class, 'register']);

    Route::get('/login', fn () => view('auth.login'));
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth');

Route::middleware(['auth', RoleMiddleware::class . ':client'])
    ->prefix('client')
    ->group(function () {
        Route::view('/dashboard', 'app');
        Route::view('/tickets', 'app');
        Route::view('/settings', 'app');
    });

Route::middleware(['auth', RoleMiddleware::class . ':it_support'])
    ->prefix('it-support')
    ->group(function () {
        Route::view('/dashboard', 'app');
         Route::view('/tickets', 'app');
         Route::view('/clients', 'app');
         Route::view('/reports', 'app');
         Route::view('/settings', 'app');
    });


Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class,'updateStatus',])->middleware(
        \App\Http\Middleware\RoleMiddleware::class . ':it_support'
    );
    Route::get('/ticket-statistics', [TicketController::class, 'statistics',]);

    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{client}', [ClientController::class, 'update']);
    Route::delete('/clients/{client}', [ClientController::class, 'destroy']);


    Route::get('/reports/tickets', [ReportController::class, 'index']);
    Route::get('/reports/tickets.csv', [ReportController::class, 'exportCsv']);
    Route::get('/reports/tickets.pdf', [ReportController::class, 'exportPdf']);

    Route::post('/settings/backup', [BackupController::class, 'export']);
    Route::post('/settings/restore', [BackupController::class, 'restore']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::put('/tickets/{ticket}', [TicketController::class, 'update']);
    Route::delete('/tickets/{ticket}', [TicketController::class, 'destroy']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);
    });

