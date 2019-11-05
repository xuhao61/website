var ipsmbUser;

jQuery(document).ready(function ($) {

    $('#confirmForm').on('submit', function () {
        var pin = $('#pin').val();
        var username = $('#username').val();

        $.ajax({
            type: "POST",
            url: "https://connect.emby.media/service/user/authenticate",
            data: {
                nameOrEmail: username,
                rawpw: $('#pw').val()
            },
            headers: {
                'X-Application': 'EmbyWebSite/1'
            }
        }).done(function (json) {
            var result = $.parseJSON(json);
            console.log(result);
            var user = result.User;
            if (user && user.Id > 0) {
                confirm(user.Id, pin, $);
            } else { $('#msg').html("Invalid User Name or Password.  Do you need to register?"); }
        }).fail(function (result) { $('#msg').html("Invalid User Name or Password.  Do you need to register?"); });

        return false;
    });

    $('.notimplemented').click(function () {
        $('#msg').html("Coming Soon");
    });
});

function confirm(userId, pin, $) {
    $.post("https://connect.emby.media/service/pin/confirm?pin=" + pin + "&userId=" + userId).done(function () { $('#msg').html("Pin Confirmed.  Thank you."); }).fail(function (result) { $('#msg').html("Confirm Failed. Please ensure the pin is correct.  You may need to generate another one if it has been several minutes."); });
}

(function (globalScope) {

    if (!globalScope.MediaBrowser) {
        globalScope.MediaBrowser = {};
    }

    function replaceAll(str, find, replace) {

        return str.split(find).join(replace);
    }

    var connectService = {

        cleanPassword: function (password) {

            password = password || '';

            password = replaceAll(password, "&", "&amp;");
            password = replaceAll(password, "/", "&#092;");
            password = replaceAll(password, "!", "&#33;");
            password = replaceAll(password, "$", "&#036;");
            password = replaceAll(password, "\"", "&quot;");
            password = replaceAll(password, "<", "&lt;");
            password = replaceAll(password, ">", "&gt;");
            password = replaceAll(password, "'", "&#39;");

            return password;
        }

    };

    globalScope.MediaBrowser.ConnectService = connectService;

})(window);
