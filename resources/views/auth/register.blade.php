
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Registrasi - Helpdesk</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>

    <script>
        window.authPage = {
            type: 'register',
            errors: @json($errors->toArray()),
            csrf: @json(csrf_token())
        };
    </script>
</body>
</html>
