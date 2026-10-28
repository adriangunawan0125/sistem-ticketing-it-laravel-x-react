
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\TicketController;

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
    });

Route::middleware(['auth', RoleMiddleware::class . ':it_support'])
    ->prefix('it-support')
    ->group(function () {
        Route::view('/dashboard', 'app');
    });


Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class,'updateStatus',])->middleware(
        \App\Http\Middleware\RoleMiddleware::class . ':it_support'
    );
    Route::get('/ticket-statistics', [TicketController::class, 'statistics',]);
});

