<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketNotification extends Notification
{
    use Queueable;

    protected $ticket;
    protected $type;
    protected $message;

    public function __construct($ticket, $type, $message)
    {
        $this->ticket = $ticket;
        $this->type = $type;
        $this->message = $message;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
            'title' => $this->ticket->title,
            'type' => $this->type,
            'message' => $this->message,
        ];
    }
}
