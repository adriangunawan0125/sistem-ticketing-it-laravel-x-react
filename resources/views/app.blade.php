
<!DOCTYPE html>
<html lang="id">
<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Support Ticketing</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
    

<script>
    window.currentUser = {{ Illuminate\Support\Js::from(
        auth()->user()
            ? auth()->user()->only(['id', 'name', 'email', 'role'])
            : null
    ) }};
</script>

</body>
</html>
