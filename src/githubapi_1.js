function isReleaseAsset(asset, filename, version) {

    filename = filename.replace("{version}", version).toLowerCase();

    var assetUrl = (asset.browser_download_url || '').toLowerCase();

    if (assetUrl.indexOf('.md5') !== -1 || assetUrl.indexOf('.sha1') !== -1) {
        return false;
    }

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
        return null;
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

    var elems = document.querySelectorAll('.lnkPackageDownload');
    var i, length;
    var elem, info;

    for (i = 0, length = elems.length; i < length; i++) {

        elem = elems[i];

        info = getLatestVersionInfo(releases, elem.getAttribute('data-filename'), elem.getAttribute('data-level')) ||
            getLatestVersionInfo(releases, elem.getAttribute('data-filename'));

        if (info) {

            elem.href = info.url;
            elem.setAttribute('href', info.url);
        }
    }

    elems = document.querySelectorAll('.lnkPackageInnerHtml');

    for (i = 0, length = elems.length; i < length; i++) {

        elem = elems[i];

        info = getLatestVersionInfo(releases, elem.getAttribute('data-filename'), elem.getAttribute('data-level')) ||
            getLatestVersionInfo(releases, elem.getAttribute('data-filename'));

        if (info) {
            elem.innerHTML = elem.innerHTML.replace('{filename}', info.filename).replace('{url}', info.url);
        }
    }
}

function getFetchPromise(url) {

    var fetchRequest = {

        // only needed for github
        //headers: {
        //    accept: 'application/vnd.github.v3+json'
        //},
        method: 'GET',
        credentials: 'same-origin'
    };

    return fetch(url, fetchRequest).then(function (response) {

        if ((response.status || 0) < 400) {
            return response.json();
        }

        return response.json();
    });
}

var packageUrls = [

    'releases.json',
    //'https://api.github.com/repos/MediaBrowser/Emby.Releases/releases'
];

function fillPackageInfo() {


    if (!document.querySelectorAll('.lnkPackageDownload,.lnkPackageInnerHtml').length) {
        return;
    }

    getFetchPromise(packageUrls[0]).catch(function () {

        return getFetchPromise(packageUrls[1]);

    }).then(fillPackageHrefs);
}

fillPackageInfo();