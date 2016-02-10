(function () {

    function onDownloadImageClick() {

        var parts = this.href.split('/').filter(function (p) {

            return p.length > 0;
        });

        var name = parts[parts.length - 1];

        if (name == 'windows-server') {
            jQuery('.' + name + '-popup-button').trigger('click');
            return false;
        }

        return true;
    }

    function loadWindowsServerVersions() {
        jQuery.get("https://mb3admin.com/admin/service/package/latestVersion?package=MBServer&class=Release", function (data) {
            jQuery('.windows-server-stable').html(data);
        });

        jQuery.get("https://mb3admin.com/admin/service/package/latestVersion?package=MBServer&class=Beta", function (data) {
            jQuery('.windows-server-beta').html(data);
        });
    }

    jQuery(function () {

        //jQuery('.w-portfolio-item-anchor').hide();

        //var elem = jQuery('.w-filters-item:not(.active)')[0];

        //if (elem) {

        //    setTimeout(function () {

        //        jQuery('.w-portfolio-item-anchor').show();
        //        jQuery(elem).trigger('click');

        //    }, 1000);

        //    jQuery('.w-filters-item[data-filter="*"]').hide();
        //}

        jQuery('.w-portfolio-item-anchor').on('click', onDownloadImageClick);

        loadWindowsServerVersions();

    });

})();