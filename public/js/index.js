
function init() {
    $('#createGame').on('click', function() {
        var interval = $('#interval').val();
        if (!interval) { // Checks if the interval input is empty
            $('#errorMessage').text('Please enter a time interval.');
            return; // Stops the function if no interval is provided
        }
        window.location.replace(`/white?code=${$('#codeInput').val()}&time=${interval}`);
    });

    $('#joinGame').on('click', function() {
        window.location.replace(`/black?code=${$('#codeInput').val()}&time=${interval}`);
    });

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') == 'invalidCode') {
        $('#errorMessage').text('Invalid invite code');
    }
}

//===========================Call the init function on page load===============================
$( () => {
    init();
  });

