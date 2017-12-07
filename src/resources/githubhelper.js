function isReleaseAsset(asset, filename, version) {

    filename = filename.replace("{version}", version).toLowerCase();

    var assetUrl = (asset.browser_download_url || '').toLowerCase();

    if (assetUrl.indexOf(filename) !== -1) {
        return true;
    }

    return false;
}

function containsFile(release, filename) {

    var assets = release.assets || [];
    var version = release.tag_name;

    return assets.filter(function (asset) {
        return isReleaseAsset(asset, filename, version);
    }).length;
}

function getLatestVersionInfo(releases, filename, level) {

    releases = releases.filter(function (release) {

        if (!containsFile(release, filename)) {
            return false;
        }

        var name = (release.name || '').toLowerCase();

        if (level === 'beta') {

            return release.prerelease && name.indexOf('-beta') !== -1;
        } else {
            return !release.prerelease && name.indexOf('-beta') === -1 && name.indexOf('-dev') === -1;
        }
    });

    if (!releases.length) {
        return Promise.reject();
    }

    var release = releases[0];
    var version = release.tag_name;

    var asset = (release.assets || []).filter(function (asset) {
        return isReleaseAsset(asset, filename, version);
    })[0];

    var assetUrl = asset.browser_download_url;
    var assetFilename = assetUrl.split('?')[0].split('/');

    return {
        url: assetUrl,
        filename: assetFilename[assetFilename.length - 1]
    };
}

function fillPackageHrefs(releases) {

    var links = document.querySelectorAll('.lnkPackageDownload');

    for (var i = 0, length = links.length; i < length; i++) {

        var link = links[i];

        var info = getLatestVersionInfo(releases, link.getAttribute('data-filename'), link.getAttribute('data-level'));

        if (info) {

            link.href = info.url;
            link.setAttribute('href', info.url);
        }
    }
}

function fillPackageInfo() {

    return jQuery.getJSON('https://api.github.com/repos/MediaBrowser/Emby/releases').then(function (releases) {

        fillPackageHrefs(releases);
    });
}

fillPackageInfo();