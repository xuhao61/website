function getWindowLocationSearch(win) {
    'use strict';

    var search = (win || window).location.search;

    if (!search) {

        var index = window.location.href.indexOf('?');
        if (index != -1) {
            search = window.location.href.substring(index);
        }
    }

    return search || '';
}

function getParameterByName(name, url) {
    'use strict';

    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, "i");

    var results = regex.exec(url || getWindowLocationSearch());
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function replaceAll(originalString, strReplace, strWith) {
    var reg = new RegExp(strReplace, 'ig');
    return originalString.replace(reg, strWith);
}

function escapeTokenValue(value) {

    value = replaceAll(value, ':', '__colon__');
    value = replaceAll(value, '/', '__forwardslash__');

    return value;
}

function getAlexaAccessToken(values) {

    return values.map(escapeTokenValue).join('___');
}

jQuery(document).ready(function ($) {

    var loginResult;
    var connectServers = [];

    //get current logged in user
    $.ajaxSetup({
        headers: {
            'X-Connect-Token': 'CONNECT-GETUSER',
            'X-Application': 'EmbyWebSite/1'
        }
    });

    function onLoginFail() {
        $('#msg').html("Invalid User Name or Password.  Do you need to register?").show();
    }

    function showServers() {
        $('#confirmForm').hide();
        $('#selectServerForm').show();

        getConnectServers().then(function (servers) {

            connectServers = servers;

            document.querySelector('#selectServer').innerHTML = servers.map(function (s) {

                return '<option value="' + s.SystemId + '">' + s.Name + '</option>';

            }).join('');
        });
    }

    function getConnectServers() {

        console.log('Begin getConnectServers');

        var url = "https://connect.emby.media/service/servers?userId=" + loginResult.User.Id;

        return $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            headers: {
                "X-Application": "EmbyWebSite/1.0.0",
                "X-Connect-UserToken": loginResult.AccessToken
            }

        });
    }

    $('#confirmForm').on('submit', function () {

        $('#msg').hide();

        var username = $('#username').val();

        $.ajax({
            type: "POST",
            url: "https://connect.emby.media/service/user/authenticate",
            data: {
                nameOrEmail: username,
                rawpw: $('#pw').val()
            }
        }).done(function (json) {

            var result = $.parseJSON(json);
            console.log(result);
            var user = result.User;
            if (user && user.Id > 0) {
                loginResult = result;
                showServers();
            } else {
                onLoginFail();
            }

        }).fail(onLoginFail);

        return false;
    });

    $('#selectServer').on('change', function (e) {

        var serverId = this.value;

        if (connectServers) {
            var server = connectServers.filter(function (s) {
                return s.SystemId === serverId;
            })[0];

            if (server && server.Url) {
                $('.serverRemoteAddress').html('Remote address: ' + server.Url).removeClass('hide');
                return;
            }
        }

        $('.serverRemoteAddress').addClass('hide');
    });

    $('#selectServerForm').on('submit', function (e) {

        var form = this;
        var serverId = form.querySelector('#selectServer').value;

        // redirect to redirect_uri?state=state&access_token=access_token&token_type=Bearer
        var values = [];
        values.push(serverId);

        var server = connectServers.filter(function (s) {
            return s.SystemId === serverId;
        })[0];

        var url = server.Url;
        values.push(url);
        values.push(server.AccessKey);
        values.push('connect');
        values.push(loginResult.User.Id);
        values.push(loginResult.AccessToken);

        var alexaAccessToken = getAlexaAccessToken(values);

        var redirectUri = getParameterByName('redirect_uri');

        redirectUri += '#';
        redirectUri += 'token_type=Bearer';
        redirectUri += '&state=' + getParameterByName('state');
        redirectUri += '&access_token=' + alexaAccessToken;

        window.location.href = redirectUri;

        return false;
    });
});